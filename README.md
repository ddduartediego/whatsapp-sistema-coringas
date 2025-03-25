# WhatsApp Coringas API

API para integração com WhatsApp Web, permitindo envio de mensagens e gerenciamento de conexão.

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

Todas as operações sensíveis requerem um token de autenticação no header:
```
Authorization: Bearer seu-token-aqui
```

## Fluxo de Conexão

### 1. Obter QR Code

**Endpoint:** `GET https://whatsapp-coringas-api-production.up.railway.app/whatsapp/qrcode`

**Headers:**
```
Authorization: Bearer seu-token-aqui
```

**Comportamento:**
- Se já existir um QR Code válido, retorna imediatamente
- Se não existir QR Code válido, aguarda até 30 segundos pela geração
- O QR Code expira em 1.5 minutos

**Resposta de Sucesso:**
```json
{
    "status": "connecting",
    "qrcode": "data:image/png;base64,...",
    "expiresAt": "2024-03-21T10:30:00.000Z",
    "lastUpdate": "2024-03-21T10:28:30.000Z"
}
```

**Resposta de Erro:**
```json
{
    "status": "error",
    "error": "Erro ao gerar QR Code"
}
```

**Exemplo de Implementação:**
```typescript
async function getQRCode(): Promise<QRCodeResponse> {
    try {
        const response = await fetch('https://whatsapp-coringas-api-production.up.railway.app/whatsapp/qrcode', {
            headers: {
                'Authorization': `Bearer ${API_TOKEN}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao obter QR Code');
        }

        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}
```

#### 2. Verificar Status da Conexão

**Endpoint:** `GET https://whatsapp-coringas-api-production.up.railway.app/whatsapp/status`

**Resposta:**
```json
{
    "status": "connected" | "disconnected" | "connecting",
    "lastUpdate": "2024-03-21T10:30:00.000Z"
}
```

**Exemplo de Implementação:**
```typescript
async function checkConnectionStatus(): Promise<ConnectionStatus> {
    try {
        const response = await fetch('https://whatsapp-coringas-api-production.up.railway.app/whatsapp/status');
        
        if (!response.ok) {
            throw new Error('Erro ao verificar status');
        }

        return await response.json();
    } catch (error) {
        console.error('Erro:', error);
        throw error;
    }
}
```

#### 3. Desconectar WhatsApp

**Endpoint:** `POST https://whatsapp-coringas-api-production.up.railway.app/whatsapp/disconnect`

**Headers:**
```
Authorization: Bearer seu-token-aqui
```

**Resposta de Sucesso:**
```json
{
    "status": "success",
    "message": "WhatsApp desconectado com sucesso"
}
```

**Resposta de Erro:**
```json
{
    "status": "error",
    "error": "WhatsApp não está conectado"
}
```

#### 4. Enviar Mensagem

**Endpoint:** `POST https://whatsapp-coringas-api-production.up.railway.app/send-message`

**Headers:**
```
Authorization: Bearer seu-token-aqui
Content-Type: application/json
```

**Body:**
```json
{
    "number": "5511999999999",
    "message": "Sua mensagem aqui"
}
```

**Resposta de Sucesso:**
```json
{
    "success": true,
    "message": "Mensagem enviada com sucesso!"
}
```

### Implementação Completa

Aqui está um exemplo completo de como implementar a integração:

```typescript
class WhatsAppConnectionManager {
    private apiToken: string;
    private baseUrl: string;
    private pollingInterval: NodeJS.Timeout | null = null;

    constructor(apiToken: string) {
        this.apiToken = apiToken;
        this.baseUrl = 'https://whatsapp-coringas-api-production.up.railway.app';
    }

    private async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${this.apiToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }

        return response.json();
    }

    async getQRCode(): Promise<QRCodeResponse> {
        return this.fetchWithAuth('/whatsapp/qrcode');
    }

    async checkStatus(): Promise<ConnectionStatus> {
        return this.fetchWithAuth('/whatsapp/status');
    }

    async disconnect(): Promise<void> {
        await this.fetchWithAuth('/whatsapp/disconnect', { method: 'POST' });
    }

    async sendMessage(number: string, message: string): Promise<void> {
        await this.fetchWithAuth('/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ number, message })
        });
    }

    startPolling(callback: (status: ConnectionStatus) => void, interval = 5000) {
        this.pollingInterval = setInterval(async () => {
            try {
                const status = await this.checkStatus();
                callback(status);
            } catch (error) {
                console.error('Erro no polling:', error);
            }
        }, interval);
    }

    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }
}

// Exemplo de uso com React
function WhatsAppConnection() {
    const [status, setStatus] = useState<ConnectionStatus | null>(null);
    const [qrCode, setQRCode] = useState<string | null>(null);
    const manager = useMemo(() => new WhatsAppConnectionManager(API_TOKEN), []);

    useEffect(() => {
        // Inicia o polling de status
        manager.startPolling(setStatus);

        // Obtém o QR Code inicial
        manager.getQRCode()
            .then(response => {
                if (response.qrcode) {
                    setQRCode(response.qrcode);
                }
            })
            .catch(console.error);

        return () => {
            manager.stopPolling();
        };
    }, [manager]);

    return (
        <div>
            {status?.status === 'disconnected' && qrCode && (
                <div>
                    <img 
                        src={`data:image/png;base64,${qrCode}`} 
                        alt="QR Code WhatsApp"
                    />
                    <p>Escaneie o QR Code para conectar</p>
                </div>
            )}
            
            {status?.status === 'connecting' && (
                <p>Conectando...</p>
            )}
            
            {status?.status === 'connected' && (
                <p>WhatsApp conectado!</p>
            )}
        </div>
    );
}
```

### Estados de Conexão

A API pode retornar os seguintes estados:

- `disconnected`: WhatsApp não está conectado
- `connecting`: QR Code gerado, aguardando conexão
- `connected`: WhatsApp conectado e pronto para uso
- `expired`: QR Code expirado
- `error`: Ocorreu um erro

### Considerações Importantes

1. **QR Code:**
   - Tempo de expiração: 1.5 minutos
   - Formato: Base64 (PNG)
   - Pode ser exibido diretamente em uma tag `<img>`

2. **Polling:**
   - Recomendado verificar status a cada 5 segundos
   - Implemente tratamento de erros adequado
   - Considere implementar backoff exponencial em caso de falhas

3. **Segurança:**
   - Mantenha o token de API seguro
   - Não exponha o token no frontend
   - Use HTTPS para todas as requisições

4. **UX:**
   - Exiba feedback visual do status da conexão
   - Implemente tratamento de erros amigável
   - Considere adicionar loading states

### Exemplo com Axios

```typescript
import axios from 'axios';

const api = axios.create({
    baseURL: 'https://whatsapp-coringas-api-production.up.railway.app',
    headers: {
        'Authorization': `Bearer ${API_TOKEN}`
    }
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
    response => response,
    error => {
        console.error('Erro na requisição:', error);
        return Promise.reject(error);
    }
);

// Exemplo de uso
async function sendMessage(number: string, message: string) {
    try {
        await api.post('/send-message', { number, message });
        console.log('Mensagem enviada com sucesso');
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        throw error;
    }
}
```

### Suporte

Para suporte ou dúvidas, entre em contato com a equipe de desenvolvimento. 