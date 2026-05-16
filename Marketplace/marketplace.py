import os
import zipfile
from io import BytesIO
from flask import Flask, jsonify, send_from_directory, abort, send_file, request
from bs4 import BeautifulSoup

app = Flask(__name__)

APPS_DIR = "C:/Users/math1/Projetos/Helper 2/Marketplace/apps"
PORT = 3000

def get_title(index_path):
    try:
        with open(index_path, "r", encoding="utf-8") as f:
            soup = BeautifulSoup(f, "html.parser")
            title = soup.title.string if soup.title else None
            return title or "Unnamed App"
    except:
        return "Unnamed App"

@app.route("/apps.json")
def list_apps():
    apps = []

    if not os.path.exists(APPS_DIR):
        return jsonify([])

    # 🔥 Pega o IP e Porta que o app usou para chamar a requisição atual (ex: 192.168.1.102:3000)
    current_host = request.host

    for folder in os.listdir(APPS_DIR):
        app_path = os.path.join(APPS_DIR, folder)

        if os.path.isdir(app_path):
            index_file = os.path.join(app_path, "index.html")

            if os.path.exists(index_file):
                title = get_title(index_file)

                apps.append({
                    "id": folder,
                    "label": title,
                    # 🔥 Agora o link muda dinamicamente dependendo de qual IP o celular chamou
                    "url": f"http://{current_host}/apps/{folder}/download"
                })

    return jsonify(apps)

@app.route("/apps/<app_id>/")
def serve_index(app_id):
    app_path = os.path.join(APPS_DIR, app_id)
    if not os.path.exists(app_path):
        abort(404)
    return send_from_directory(app_path, "index.html")

@app.route("/apps/<app_id>/<path:file>")
def serve_files(app_id, file):
    app_path = os.path.join(APPS_DIR, app_id)
    if not os.path.exists(os.path.join(app_path, file)):
        return send_from_directory(app_path, "index.html")
    return send_from_directory(app_path, file)

@app.route("/apps/<app_id>/download")
def download_app(app_id):
    app_path = os.path.join(APPS_DIR, app_id)

    if not os.path.exists(app_path):
        return {"error": "App not found"}, 404

    memory_file = BytesIO()

    with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(app_path):
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, app_path)
                z.write(full_path, rel_path)

    memory_file.seek(0)

    return send_file(
        memory_file,
        download_name=f"{app_id}.zip",
        as_attachment=True
    )

if __name__ == "__main__":
    # 🔥 host="0.0.0.0" abre o servidor no Wi-Fi, no Cabo e no localhost ao mesmo tempo
    app.run(host="0.0.0.0", port=PORT, debug=True)