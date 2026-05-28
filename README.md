# Helper: Ecossistema Móvel para Execução de Micro Aplicativos Web

O **Helper** é uma plataforma modular inspirada no conceito de *Superapps* que funciona como um ambiente hospedeiro central (lobby) para pequenos aplicativos utilitários chamados de **módulos**. 

A plataforma resolve o problema da fragmentação e do acúmulo de apps individuais no celular. Ela se conecta a um mercado virtual (**Marketplace**) remoto, baixa os módulos sob demanda e os executa localmente de forma 100% offline.

O grande diferencial é a **democratização do desenvolvimento**: os módulos são construídos inteiramente com tecnologias Web padrão (HTML, CSS, JavaScript) ou frameworks modernos (React), sendo executados dentro de contêineres seguros (*WebViews*).

---

## 🏗️ Arquitetura do Sistema

O ecossistema é dividido em três pilares fundamentais:

1. **Aplicativo Hospedeiro (Core Nativo):** Desenvolvido em **React Native**, gerencia a navegação principal, o ciclo de vida dos módulos e o isolamento de dados via sandboxing (`react-native-webview`).
2. **Protocolo de Comunicação (Bridges):** Como as WebViews possuem acesso restrito ao hardware, o Helper implementa um barramento customizado de mensageria assíncrona bidirecional via strings JSON (`handleBridgeMessage`). O código Web consome os recursos do celular de forma análoga a uma API REST.
3. **Servidor de Distribuição (Marketplace):** Um backend leve construído em **Python (Flask)** que atua como repositório dos microaplicativos.

---

## 🛠️ Tecnologias Utilizadas

### Mobile (Hospedeiro)
* React Native
* React Native WebView (`react-native-webview`)

### Backend (Marketplace)
* Python 3
* Flask
* BeautifulSoup4 (para extração automatizada de metadados das tags `<title>`)
* `io.BytesIO` (para compressão efêmera de pacotes `.zip` em memória RAM)

---

## 🔌 Pontes de Hardware Disponíveis (Bridges)

As requisições Web utilizam o contrato de payload `{ module, action, params }` para acessar com segurança:
* **`mic` (`MicrophoneBridge`):** Captura e conversão de áudio offline.
* **`camera` (`CameraBridge`):** Captura de foto pontual e controle de fluxo de quadros.
* **`location` (`LocationBridge`):** Acesso a coordenadas geográficas via GPS.
* **`sensors` (`SensorBridge`):** Captura contínua de alta frequência do acelerômetro e giroscópio.
* **`storage` (`StorageBridge`):** Persistência local chave-valor isolada em sandbox.
* **`file` (`FileBridge`):** Manipulação e upload de arquivos locais codificados em Base64.
* **`console` (`ConsoleBridge`):** Redirecionamento de logs da WebView para o terminal nativo para depuração.

---

## 🚀 Como Executar o Projeto

### 1. Pré-requisitos
* Node.js e NPM/Yarn instalado
* Ambiente React Native configurado (Android Studio / SDK)
* Python 3 instalado

### 2. Configurando o Marketplace (Backend)
Navegue até a pasta do servidor:
```bash
cd marketplace
pip install -r requirements.txt
python app.py

```

> O servidor adota a filosofia de *convenção sobre configuração*. Para disponibilizar um novo app no catálogo `/apps.json`, basta mover a pasta gerada pelo build do seu framework Web (contendo o `index.html`) para o diretório raiz de hospedagem do script.

### 3. Configurando o Aplicativo Hospedeiro (Mobile)

Navegue até a pasta do projeto mobile:

```bash
cd mobile
npm install
# ou yarn install

```

Inicie o Metro Bundler e execute no dispositivo/emulador:

```bash
npm run android

```

---

## 🧪 Módulos de Validação Criados

O repositório inclui módulos de demonstração criados para estressar a arquitetura:

* **Calculadora Científica Pro:** Teste de fidelidade e performance bruta da WebView.
* **YOLO Detector:** Execução de IA local via TensorFlow.js e transporte de mídia Base64 via `FileBridge`.
* **Espectrómetro de Áudio:** Renderização gráfica via p5.js e Web Audio API consumindo a `MicrophoneBridge` via caminhos locais (URIs).
* **Night Vision Test:** Filtros de imagem em tempo real sobre stream contínuo de Base64 da `CameraBridge`.
* **RGB Split - Seções:** Processamento de canais cromáticos com chamadas consecutivas à `FileBridge` e `StorageBridge`.
* **Questionário Analítico:** Consumo de APIs REST externas diretamente pela WebView associado à `LocationBridge`.
* **Sensor Cube:** Renderização 3D (WEBGL) respondendo a telemetria inercial contínua a cada 50ms pela `SensorsBridge`.

---

## 📝 Licença e Autoria

Projeto desenvolvido por **Matheus Felipe Prudente** como Projeto Integrado no **Instituto Federal de São Paulo - Campus Piracicaba** (2026).


