# Protocolo do Helper Marketplace

**Versão do protocolo:** 1.0

Este documento especifica o contrato que qualquer servidor de
Marketplace compatível com o app Helper precisa implementar —
independente de linguagem ou framework. `marketplace.py` é **uma**
implementação de referência (Python/Flask); o mesmo contrato pode ser
implementado em Node/Express, ASP.NET, Go, etc. Se você fizer isso,
o app Helper deve funcionar com o seu servidor sem nenhuma alteração
de código no app.

Para o contrato formal, machine-readable, veja [`openapi.yaml`](./openapi.yaml).

---

## 1. Conceito

Um Marketplace é um servidor HTTP que expõe um catálogo de **módulos**
(mini-aplicativos web) e permite baixá-los como pacotes `.zip` para
instalação offline no app. A ideia central é a descentralização:
qualquer pessoa pode rodar seu próprio Marketplace, e o app aponta
para o endereço (IP:porta ou domínio) que o usuário configurar — não
existe um servidor central obrigatório.

## 2. Estrutura de um módulo em disco

```
apps/
  NomeDoModulo/
    index.html         # obrigatório — ponto de entrada do módulo
    manifest.json      # opcional — ver seção 4
    ...                # opcional — css, js, imagens, sub-pastas
```

- `NomeDoModulo` (o nome da pasta) é o **id** do módulo, usado na URL.
- Um módulo pode ser um único HTML autocontido ou um bundle com vários
  arquivos (ex: build de um SPA em React/Vue/Vite).

## 3. Endpoints obrigatórios

### `GET /`

Health check e descoberta de versão do protocolo.

```json
{ "name": "string", "protocolVersion": "1.0", "status": "ok" }
```

### `GET /apps.json`

Lista o catálogo de módulos disponíveis.

```json
[
  {
    "id": "Calculadora",
    "label": "Calculadora Científica",
    "version": "1.0.0",
    "description": "string ou null",
    "url": "http://<host>/apps/Calculadora/download"
  }
]
```

Regras:

- `id` corresponde exatamente ao nome da pasta.
- `url` é absoluta e reflete o host/porta usados **nesta** requisição.
  Assim o mesmo catálogo funciona em qualquer
  rede/IP sem reconfiguração do servidor.
- `version` e `description` são `null` quando o módulo não tem
  `manifest.json`.

### `GET /apps/{id}/`

Serve o `index.html` do módulo `{id}`.

- `404` (formato de erro na seção 5) se `{id}` não existir.

### `GET /apps/{id}/{caminho}`

Serve um arquivo específico dentro do módulo (css, js, imagens, ou uma
sub-rota do próprio módulo).

- Se `{caminho}` não corresponder a um arquivo real, o servidor **deve**
  cair de volta para o `index.html` do módulo — isso é necessário para
  módulos com roteamento client-side (SPA); sem esse fallback, navegar
  dentro de um módulo React/Vue quebraria ao atualizar a página.
- `404` somente se o módulo `{id}` em si não existir.

### `GET /apps/{id}/download`

Retorna um `.zip` com todo o conteúdo da pasta do módulo.

- `Content-Type: application/zip`
- `Content-Disposition: attachment; filename="{id}.zip"`
- **Recomendado:** header `X-Content-SHA256` com o hash SHA-256 do
  zip, para permitir verificação de integridade no cliente (ver seção 6).

## 4. `manifest.json` (opcional)

```json
{
  "name": "Calculadora Científica",
  "version": "1.2.0",
  "description": "Calculadora com histórico e modo científico"
}
```

Se ausente, o servidor deve usar o `<title>` do `index.html` como
`label`, com `version`/`description` como `null`. Isso mantém
compatibilidade com módulos simples que não adotaram manifest.

_(Extensão natural e não obrigatória para o futuro: declarar aqui quais
bridges nativas — câmera, mic, localização — o módulo usa, para
alimentar um modelo de permissões no app.)_

## 5. Formato de erro

Toda resposta de erro segue o mesmo formato:

```json
{ "error": { "code": "APP_NOT_FOUND", "message": "string legível" } }
```

## 6. Requisitos de segurança (obrigatórios em qualquer implementação)

Estes pontos não são específicos de Python — valem para qualquer stack:

1. **Valide `id` contra um padrão restrito** antes de qualquer uso no
   sistema de arquivos (recomendado: `^[A-Za-z0-9_-]+$`). Nunca aceite
   `/`, `..` ou o valor cru vindo da URL sem essa checagem.
2. **Confine todo caminho resolvido ao diretório base de módulos**,
   mesmo depois de resolver `..` ou links simbólicos:
   - Python/Flask: `werkzeug.utils.safe_join(base, caminho)`
   - Node/Express: resolva com `path.resolve` e confirme que o
     resultado começa com o diretório base antes de servir
   - .NET: `Path.GetFullPath` + checagem de prefixo

   Sem essa checagem, `{caminho}` vira uma vulnerabilidade de path
   traversal (CWE-22) capaz de ler qualquer arquivo do servidor.

3. Um servidor exposto além de uma rede local/confiável deve rodar
   atrás de HTTPS e **nunca** em modo debug/desenvolvimento (modo
   debug do Flask, por exemplo, permite execução de código arbitrário
   se alguém alcançar uma página de erro).
4. `X-Content-SHA256` (seção 3) não substitui assinatura criptográfica
   — é um hash simples, não uma prova de autoria. Ainda assim, dá ao
   cliente uma forma simples de detectar se o conteúdo mudou entre duas
   consultas, o que importa especialmente num ecossistema
   descentralizado sem uma autoridade central de curadoria.

## 7. Descoberta e configuração no cliente

O app Helper aponta para um Marketplace via IP:porta configurável pelo
usuário — não há endereço fixo no código do app. É essa configuração
que permite que qualquer pessoa rode seu próprio servidor e o app
funcione com ele sem alteração de código.

## 8. Compatibilidade e versionamento do protocolo

O campo `protocolVersion` no endpoint `/` existe para permitir que
clientes (ou ferramentas de terceiros) detectem qual versão do
contrato um servidor implementa antes de assumir compatibilidade.
Mudanças que quebrem compatibilidade retroativa devem incrementar a
versão principal (ex: `1.0` → `2.0`).
