const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Dados da API do UltraMsg
const INSTANCE_ID = '';
const TOKEN = '';
const NUMERO_ACOUGUE = '556992254900'; // Número fixo

const estoqueIdealPath = './estoque.json';

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

function carregarEstoque() {
    if (!fs.existsSync(estoqueIdealPath)) {
        fs.writeFileSync(estoqueIdealPath, JSON.stringify({
            segunda: 200,
            terca: 200,
            quarta: 200,
            quinta: 200,
            sexta: 200,
            sabado: 200,
            domingo: 200
        }, null, 2));
    }
    return JSON.parse(fs.readFileSync(estoqueIdealPath));
}

// Rota GET para obter o estoque ideal
app.get('/estoque', (req, res) => {
    const estoque = carregarEstoque();
    res.json(estoque);
});

// Rota POST para atualizar o estoque ideal
app.post('/estoque', (req, res) => {
    fs.writeFileSync(estoqueIdealPath, JSON.stringify(req.body, null, 2));
    res.send({ success: true });
});

// Rota POST para receber a sobra e calcular o pedido
app.post('/consumo', async (req, res) => {
    const { sobraHoje, diaSemana } = req.body;
    const estoque = carregarEstoque();
    const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

    const hojeIndex = diasSemana.indexOf(diaSemana);
    const amanhaIndex = (hojeIndex + 1) % 7;
    const diaAmanha = diasSemana[amanhaIndex];

    const estoqueAmanha = estoque[diaAmanha] || 200;
    const carneParaPedir = Math.max(estoqueAmanha - sobraHoje, 0);
    const mensagem = `Preciso de ${carneParaPedir} kilos para ${diaAmanha}.`;

    try {
        await axios.post(`https://api.ultramsg.com/${INSTANCE_ID}/messages/chat`, {
            token: TOKEN,
            to: NUMERO_ACOUGUE,
            body: mensagem
        });

        res.send({ success: true, carneParaPedir });
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error.response?.data || error.message);
        res.status(500).send({ success: false });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
