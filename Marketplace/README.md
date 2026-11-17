# Helper Marketplace — servidor de referência

Implementação de referência (Python/Flask) do protocolo Helper
Marketplace. Qualquer servidor que implemente o mesmo contrato — em
Node, .NET, Go ou qualquer outra stack — funciona com o app Helper sem
alterações. O contrato completo está em [`PROTOCOL.md`](./PROTOCOL.md)
(especificação em prosa) e [`openapi.yaml`](./openapi.yaml)
(especificação formal/machine-readable).

## Rodando localmente

```bash
pip install -r requirements.txt
python marketplace.py
```

Por padrão sobe em `http://0.0.0.0:3000`, servindo módulos da pasta
`./apps` (ao lado do script).

## Configuração

Tudo via variável de ambiente — nada fica hardcoded no código:

| Variável            | Default  | Descrição                       |
| ------------------- | -------- | ------------------------------- |
| `APPS_DIR`          | `./apps` | Pasta onde ficam os módulos     |
| `PORT`              | `3000`   | Porta do servidor               |
| `MARKETPLACE_DEBUG` | `0`      | `1` ativa o modo debug do Flask |

Exemplo:

```bash
APPS_DIR=/caminho/para/seus/modulos PORT=8080 python marketplace.py
```

```powershell
$env:MARKETPLACE_DEBUG="1"; $env:PORT="5000";
```

## Adicionando um módulo

Crie uma pasta em `apps/` com um `index.html`:

```
apps/
  MeuModulo/
    index.html
```

Opcionalmente, adicione um `manifest.json` pra ter nome, versão e
descrição próprios (sem ele, o servidor usa o `<title>` do HTML):

```json
{
  "name": "Meu Módulo",
  "version": "1.0.0",
  "description": "O que esse módulo faz"
}
```

## O que mudou em relação à versão anterior

- Configuração (`APPS_DIR`, `PORT`, debug) agora vem de variável de
  ambiente, não hardcoded — o servidor roda em qualquer máquina sem
  editar o código.
- `debug` desligado por padrão.
- Proteção contra path traversal: `appId` é validado contra um padrão
  restrito e todo caminho de arquivo é confinado a `APPS_DIR` via
  `werkzeug.utils.safe_join`, mesmo com `../` ou caminhos absolutos.
- Catálogo e pacotes `.zip` são cacheados em memória e só regenerados
  quando o conteúdo do módulo muda (evita reler/rezipar a cada request).
- Suporte opcional a `manifest.json`, com fallback para o `<title>` do
  `index.html` — compatível com módulos existentes.
- Respostas de erro em formato JSON consistente.
- Header `X-Content-SHA256` no download, como base para verificação de
  integridade futura.

## Implementando em outra stack

Este servidor é uma referência, não a única implementação válida. Um
servidor em Node, .NET, Go etc. que siga os endpoints e formatos de
[`PROTOCOL.md`](./PROTOCOL.md) é compatível com o app — em especial,
não pule a seção 6 (segurança): validação de `appId` e confinamento de
caminho valem para qualquer linguagem, não só Python.
