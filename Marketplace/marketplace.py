"""
Helper Marketplace — servidor de referência (Python/Flask)
============================================================

Este arquivo é UMA implementação possível do protocolo "Helper
Marketplace". O contrato completo — que qualquer stack (Node, .NET,
Go, etc.) pode implementar — está documentado em PROTOCOL.md e
openapi.yaml. Nada aqui é específico de Python; é só a linguagem
escolhida para esta implementação de referência.

Como rodar:
    pip install -r requirements.txt
    python marketplace.py

Configuração via variável de ambiente:
    APPS_DIR             pasta com os módulos (default: ./apps)
    PORT                 porta do servidor    (default: 3000)
    MARKETPLACE_DEBUG    "1" ativa debug do Flask (default: "0" — NUNCA
                          deixe "1" em um servidor exposto além da rede local)
Exemplo para setar Ambiente:
    set MARKETPLACE_DEBUG=1
    set PORT=5000

"""

from __future__ import annotations

import hashlib
import json
import logging
import os
import re
import zipfile
from io import BytesIO
from pathlib import Path
from threading import Lock

from bs4 import BeautifulSoup
from flask import Flask, jsonify, request, send_from_directory, send_file
from flask_cors import CORS
from werkzeug.utils import safe_join

# ---------------------------------------------------------------------------
# Configuração
# ---------------------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
APPS_DIR = Path(os.environ.get("APPS_DIR", BASE_DIR / "apps")).resolve()
PORT = int(os.environ.get("PORT", 3000))
DEBUG = os.environ.get("MARKETPLACE_DEBUG", "0") == "1"

PROTOCOL_VERSION = "1.0"

# Identificador de módulo válido: letras, números, hífen e underscore.
# Qualquer coisa fora disso (barras, "..", espaços) é rejeitada antes
# de tocar o sistema de arquivos.
APP_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]+$")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("marketplace")

app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------------------------
# Cache em memória, invalidado por mtime.
# Simples de propósito: o objetivo é evitar reler/rezipar a cada request,
# não construir um sistema de cache distribuído.
# ---------------------------------------------------------------------------

_cache_lock = Lock()
_meta_cache: dict[str, tuple[float, dict]] = {}   # app_id -> (assinatura, metadados)
_zip_cache: dict[str, tuple[float, bytes, str]] = {}  # app_id -> (assinatura, zip, sha256)


def _dir_signature(path: Path) -> float:
    """'Esse diretório mudou desde a última vez?' — maior mtime entre os arquivos."""
    try:
        return max((p.stat().st_mtime for p in path.rglob("*") if p.is_file()), default=0.0)
    except FileNotFoundError:
        return 0.0


def is_valid_app_id(app_id: str) -> bool:
    return bool(APP_ID_PATTERN.match(app_id))


def resolve_app_path(app_id: str) -> Path | None:
    """Confina app_id dentro de APPS_DIR. None se inválido, ausente ou fora do diretório base."""
    if not is_valid_app_id(app_id):
        return None
    candidate = (APPS_DIR / app_id).resolve()
    if candidate != APPS_DIR and APPS_DIR not in candidate.parents:
        return None
    return candidate if candidate.is_dir() else None


def read_metadata(app_path: Path) -> dict:
    """
    manifest.json manda, se existir. Sem ele, cai pro <title> do index.html
    (compatibilidade com módulos que ainda não adotaram manifest).
    """
    manifest_path = app_path / "manifest.json"
    if manifest_path.exists():
        try:
            with open(manifest_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return {
                "label": data.get("name", app_path.name),
                "version": data.get("version"),
                "description": data.get("description"),
            }
        except (json.JSONDecodeError, OSError):
            log.warning("manifest.json inválido em '%s', usando fallback de <title>", app_path.name)

    title = "Unnamed App"
    try:
        with open(app_path / "index.html", "r", encoding="utf-8") as f:
            soup = BeautifulSoup(f, "html.parser")
            if soup.title and soup.title.string:
                title = soup.title.string.strip()
    except OSError:
        pass
    return {"label": title, "version": None, "description": None}


def get_metadata_cached(app_path: Path) -> dict:
    sig = _dir_signature(app_path)
    with _cache_lock:
        cached = _meta_cache.get(app_path.name)
        if cached and cached[0] == sig:
            return cached[1]
    meta = read_metadata(app_path)
    with _cache_lock:
        _meta_cache[app_path.name] = (sig, meta)
    return meta


def error_response(status: int, code: str, message: str):
    return jsonify({"error": {"code": code, "message": message}}), status


# ---------------------------------------------------------------------------
# Rotas
# ---------------------------------------------------------------------------

@app.route("/")
def health():
    """Health check + descoberta de versão do protocolo."""
    return jsonify({"name": "helper-marketplace", "protocolVersion": PROTOCOL_VERSION, "status": "ok"})


@app.route("/apps.json")
def list_apps():
    if not APPS_DIR.exists():
        log.warning("APPS_DIR não existe: %s", APPS_DIR)
        return jsonify([])

    current_host = request.host  # preserva IP/porta que o cliente usou, não hardcoded
    apps = []

    for entry in sorted(APPS_DIR.iterdir()):
        if not entry.is_dir() or not (entry / "index.html").exists():
            continue
        meta = get_metadata_cached(entry)
        apps.append({
            "id": entry.name,
            "label": meta["label"],
            "version": meta["version"],
            "description": meta["description"],
            "url": f"http://{current_host}/apps/{entry.name}/download",
        })

    return jsonify(apps)


@app.route("/apps/<app_id>/")
def serve_index(app_id):
    app_path = resolve_app_path(app_id)
    if app_path is None:
        return error_response(404, "APP_NOT_FOUND", f"Módulo '{app_id}' não encontrado.")
    return send_from_directory(app_path, "index.html")


@app.route("/apps/<app_id>/<path:file>")
def serve_files(app_id, file):
    app_path = resolve_app_path(app_id)
    if app_path is None:
        return error_response(404, "APP_NOT_FOUND", f"Módulo '{app_id}' não encontrado.")

    safe_path = safe_join(str(app_path), file)
    if safe_path is None or not os.path.isfile(safe_path):
        # Fallback estilo SPA: se o arquivo pedido não existe, assume que é uma
        # rota interna do roteamento client-side do módulo 
        # e devolve o index.html pra aplicação web assumir o roteamento.
        return send_from_directory(app_path, "index.html")

    return send_from_directory(app_path, file)


@app.route("/apps/<app_id>/download")
def download_app(app_id):
    app_path = resolve_app_path(app_id)
    if app_path is None:
        return error_response(404, "APP_NOT_FOUND", f"Módulo '{app_id}' não encontrado.")

    sig = _dir_signature(app_path)
    with _cache_lock:
        cached = _zip_cache.get(app_id)

    if cached and cached[0] == sig:
        zip_bytes, digest = cached[1], cached[2]
    else:
        buffer = BytesIO()
        with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as z:
            for file_path in sorted(app_path.rglob("*")):
                if file_path.is_file():
                    z.write(file_path, file_path.relative_to(app_path))
        zip_bytes = buffer.getvalue()
        digest = hashlib.sha256(zip_bytes).hexdigest()
        with _cache_lock:
            _zip_cache[app_id] = (sig, zip_bytes, digest)
        log.info("Pacote gerado para '%s' (%d bytes)", app_id, len(zip_bytes))

    response = send_file(
        BytesIO(zip_bytes),
        download_name=f"{app_id}.zip",
        as_attachment=True,
        mimetype="application/zip",
    )
    # Hash do conteúdo exposto pro cliente — não é assinatura criptográfica,
    # mas já dá uma base pra checagem de integridade (ver PROTOCOL.md).
    response.headers["X-Content-SHA256"] = digest
    return response


if __name__ == "__main__":
    log.info("Servindo módulos de: %s", APPS_DIR)
    log.info("Protocolo v%s | debug=%s | porta=%s", PROTOCOL_VERSION, DEBUG, PORT)
    app.run(host="0.0.0.0", port=PORT, debug=DEBUG)
