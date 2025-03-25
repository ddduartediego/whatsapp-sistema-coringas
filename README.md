# WhatsApp Coringas API

API para integração com WhatsApp usando a biblioteca whatsapp-web.js.

## Funcionalidades

- Geração de QR Code para conexão com WhatsApp
- Verificação de status da conexão
- Envio de mensagens
- Desconexão do WhatsApp
- Autenticação via token

## Endpoints

### 1. Obter QR Code e Status
```http
GET /whatsapp/qrcode
```

**Resposta:**
```json
{
    "status": "disconnected",
    "qrcode": "string (base64)",
    "expiresAt": "2024-03-21T10:00:00.000Z",
    "lastUpdate": "2024-03-21T09:58:30.000Z"
}
```

### 2. Verificar Status
```http
GET /whatsapp/status
```

**Resposta:**
```json
{
    "status": "connected",
    "lastUpdate": "2024-03-21T10:00:00.000Z"
}
```

### 3. Desconectar WhatsApp
```http
POST /whatsapp/disconnect
Authorization: Bearer seu-token-aqui
```

**Resposta:**
```json
{
    "status": "success",
    "message": "WhatsApp desconectado com sucesso"
}
```

### 4. Enviar Mensagem
```http
POST /send-message
Authorization: Bearer seu-token-aqui
Content-Type: application/json

{
    "number": "5511999999999",
    "message": "Olá, esta é uma mensagem de teste!"
}
```

**Resposta:**
```json
{
    "success": true,
    "message": "Mensagem enviada com sucesso!"
}
```

## Configuração

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
PORT=3000
WHATSAPP_API_TOKEN=seu-token-aqui
NODE_ENV=development
```

4. Inicie o servidor:
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## Implementação na Aplicação Externa

Para implementar a integração em uma aplicação externa, siga este exemplo:

```typescript
class WhatsAppConnectionManager {
    private pollingInterval: number = 5000; // 5 segundos
    private qrCodeExpiration: number = 90000; // 1.5 minutos
    private pollTimer: NodeJS.Timeout | null = null;
    private qrCodeTimer: NodeJS.Timeout | null = null;
    private apiToken: string;

    constructor(apiToken: string) {
        this.apiToken = apiToken;
    }

    async getQRCode() {
        try {
            const response = await fetch('https://sua-api.com/whatsapp/qrcode');
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            this.startQRCodeTimer();
            this.startPolling();

            return data;
        } catch (error) {
            console.error('Erro ao obter QR Code:', error);
            throw error;
        }
    }

    async disconnect() {
        try {
            const response = await fetch('https://sua-api.com/whatsapp/disconnect', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`
                }
            });

            const data = await response.json();
            
            if (data.status === 'error') {
                throw new Error(data.error);
            }

            this.stopPolling();
            this.onDisconnected();
            
            return data;
        } catch (error) {
            console.error('Erro ao desconectar WhatsApp:', error);
            throw error;
        }
    }

    private startQRCodeTimer() {
        if (this.qrCodeTimer) {
            clearTimeout(this.qrCodeTimer);
        }

        this.qrCodeTimer = setTimeout(() => {
            this.stopPolling();
            this.onQRCodeExpired();
        }, this.qrCodeExpiration);
    }

    private startPolling() {
        this.stopPolling();
        this.pollTimer = setInterval(async () => {
            try {
                const response = await fetch('https://sua-api.com/whatsapp/status');
                const data = await response.json();

                if (data.status === 'connected') {
                    this.stopPolling();
                    this.onConnected();
                } else if (data.status === 'disconnected') {
                    this.stopPolling();
                    this.onDisconnected();
                } else if (data.error) {
                    this.stopPolling();
                    this.onError(data.error);
                }
            } catch (error) {
                console.error('Erro no polling:', error);
                this.stopPolling();
                this.onError('Erro ao verificar status');
            }
        }, this.pollingInterval);
    }

    private stopPolling() {
        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }
        if (this.qrCodeTimer) {
            clearTimeout(this.qrCodeTimer);
            this.qrCodeTimer = null;
        }
    }

    // Callbacks para a UI
    onConnected() {
        // Implementar callback
    }

    onDisconnected() {
        // Implementar callback
    }

    onQRCodeExpired() {
        // Implementar callback
    }

    onError(error: string) {
        // Implementar callback
    }
}

// Exemplo de uso:
const whatsappManager = new WhatsAppConnectionManager('seu-token-aqui');

// Conectar
try {
    const qrCode = await whatsappManager.getQRCode();
    // Exibir QR Code na UI
} catch (error) {
    // Tratar erro
}

// Desconectar
try {
    await whatsappManager.disconnect();
    // Atualizar UI para mostrar desconectado
} catch (error) {
    // Tratar erro
}
```

## Status da Conexão

A API retorna os seguintes status:

- `disconnected`: WhatsApp não está conectado
- `connecting`: QR Code gerado, aguardando conexão
- `connected`: WhatsApp conectado e pronto para uso
- `expired`: QR Code expirado
- `error`: Ocorreu um erro

## Segurança

- Todas as requisições para enviar mensagens e desconectar devem incluir um token de autenticação no header `Authorization: Bearer seu-token-aqui`
- O token deve ser configurado na variável de ambiente `WHATSAPP_API_TOKEN`
- O CORS está configurado para permitir apenas origens específicas

## Logs

A API mantém logs detalhados de todas as operações, incluindo:
- Requisições recebidas
- Erros de autenticação
- Status da conexão
- Erros ao enviar mensagens
- Erros ao desconectar

## Suporte

Para suporte ou dúvidas, entre em contato com a equipe de desenvolvimento.

# Documentação de Integração - WhatsApp Coringas API

## Visão Geral
Esta documentação descreve como integrar sua aplicação com a API de WhatsApp Coringas para gerenciar a conexão via QR Code.

## Autenticação
Todas as requisições que envolvem operações sensíveis (como desconexão) devem incluir um token de autenticação no header:
```http
Authorization: Bearer seu-token-aqui
```

## Fluxo de Conexão

### 1. Obter QR Code
```http
GET https://whatsapp-coringas-api-production.up.railway.app/whatsapp/qrcode
```

**Resposta:**
```json
{
    "status": "disconnected",
    "qrcode": "string (base64)", // QR Code em formato base64
    "expiresAt": "2024-03-21T10:00:00.000Z",
    "lastUpdate": "2024-03-21T09:58:30.000Z"
}
```

**Exemplo de Implementação:**
```typescript
async function getQRCode() {
    try {
        const response = await fetch('https://whatsapp-coringas-api-production.up.railway.app/whatsapp/qrcode');
        const data = await response.json();
        
        if (data.status === 'error') {
            throw new Error(data.error);
        }

        // O QR Code já vem em base64
        const qrCodeBase64 = data.qrcode;
        
        return data;
    } catch (error) {
        console.error('Erro ao obter QR Code:', error);
        throw error;
    }
}

// Exemplo de como exibir o QR Code
function QRCodeDisplay({ qrCode }: { qrCode: string }) {
    return (
        <div>
            {/* Usando diretamente como src de imagem */}
            <img 
                src={`data:image/png;base64,${qrCode}`} 
                alt="QR Code WhatsApp"
            />
            
            {/* Ou usando uma biblioteca de QR Code */}
            <QRCodeSVG 
                value={qrCode}
                size={256}
                level="H"
                includeMargin={true}
            />
        </div>
    );
}
```

// ... resto do arquivo continua igual ... 