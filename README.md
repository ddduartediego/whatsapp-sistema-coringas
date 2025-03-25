# WhatsApp API

API simples para envio de mensagens via WhatsApp usando whatsapp-web.js.

## Requisitos

- Node.js 14 ou superior
- NPM ou Yarn
- Uma conta no Railway para deploy

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

## Uso Local

1. Inicie o servidor em modo desenvolvimento:
```bash
npm run dev
```

2. Escaneie o QR Code que aparecerá no terminal com seu WhatsApp

3. A API estará disponível em `http://localhost:3000`

## Endpoints

### GET /status
Verifica o status da API e da conexão com o WhatsApp.

### POST /send-message
Envia uma mensagem para um número específico.

Exemplo de requisição:
```json
{
    "number": "5511999999999",
    "message": "Olá, esta é uma mensagem de teste!"
}
```

## Deploy no Railway

1. Crie uma conta no Railway (https://railway.app)
2. Conecte seu repositório
3. Configure as variáveis de ambiente necessárias
4. Deploy!

## Observações

- O número deve ser enviado no formato internacional (ex: 5511999999999)
- A primeira vez que a aplicação for iniciada, será necessário escanear o QR Code
- O arquivo de autenticação será salvo localmente para evitar necessidade de reautenticação 