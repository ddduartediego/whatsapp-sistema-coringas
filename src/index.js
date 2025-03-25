const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware para processar JSON
app.use(express.json());

// Middleware para logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Inicializa o cliente do WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

// Gera o QR Code para autenticação
client.on('qr', (qr) => {
    console.log('QR Code gerado!');
    qrcode.generate(qr, { small: true });
});

// Quando o cliente estiver pronto
client.on('ready', () => {
    console.log('Cliente WhatsApp está pronto!');
});

// Tratamento de erros do cliente
client.on('auth_failure', (msg) => {
    console.error('Falha na autenticação:', msg);
});

client.on('disconnected', (reason) => {
    console.log('Cliente desconectado:', reason);
});

// Inicializa o cliente
client.initialize().catch(err => {
    console.error('Erro ao inicializar o cliente:', err);
});

// Rota raiz para verificar se a API está online
app.get('/', (req, res) => {
    console.log('Requisição recebida na rota raiz');
    res.json({ 
        status: 'online',
        timestamp: new Date().toISOString(),
        whatsapp: client.info ? 'connected' : 'disconnected',
        port: port
    });
});

// Rota para verificar o status da API
app.get('/status', (req, res) => {
    console.log('Requisição recebida na rota status');
    res.json({ 
        status: 'online',
        timestamp: new Date().toISOString(),
        whatsapp: client.info ? 'connected' : 'disconnected',
        port: port
    });
});

// Rota para enviar mensagem
app.post('/send-message', async (req, res) => {
    console.log('Requisição recebida na rota send-message:', req.body);
    try {
        const { number, message } = req.body;
        
        if (!number || !message) {
            console.log('Erro: Número ou mensagem faltando');
            return res.status(400).json({ error: 'Número e mensagem são obrigatórios' });
        }

        // Formata o número para o formato do WhatsApp
        const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`;
        console.log('Número formatado:', formattedNumber);
        
        // Envia a mensagem
        await client.sendMessage(formattedNumber, message);
        console.log('Mensagem enviada com sucesso');
        
        res.json({ success: true, message: 'Mensagem enviada com sucesso!' });
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({ error: 'Erro ao enviar mensagem', details: error.message });
    }
});

// Tratamento de erros global
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: err.message
    });
});

// Inicia o servidor
app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando em http://0.0.0.0:${port}`);
    console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
}); 