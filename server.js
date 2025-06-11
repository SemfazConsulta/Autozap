const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

// Coloque aqui sua instância e token do UltraMsg
const INSTANCE_ID = 'instance124814';
const TOKEN = 'sfi60ouwygayj2e2';
const NUMERO_ACOUGUE = '5569992254900'; // Exemplo: '5511999999999'

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/enviar', async (req, res) => {
    const { quantidade } = req.body;
    const mensagem = `Preciso de ${quantidade} kilos`;

    try {
        await axios.post(`https://api.ultramsg.com/${INSTANCE_ID}/messages/chat`, {
            token: TOKEN,
            to: NUMERO_ACOUGUE,
            body: mensagem
        });

        res.status(200).send({ success: true });
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error.response?.data || error.message);
        res.status(500).send({ success: false });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
