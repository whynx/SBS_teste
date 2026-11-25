const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORTA = 3000;

app.use(express.json());
app.use(cors());

// Conecta ou cria o arquivo do banco de dados SQLite na pasta do projeto
const db = new sqlite3.Database('./sistema_ubs.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite com sucesso!');
    }
});

// Cria as tabelas do sistema de saúde (UBS)
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS consultas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        especialidade TEXT,
        data TEXT,
        hora TEXT,
        status TEXT,
        confirmada INTEGER
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS vacinas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT,
        categoria TEXT,
        vacina TEXT,
        data TEXT,
        status TEXT
    )`);
});

// ================= ROTAS DA API =================

// 1. Rota para cadastrar uma nova consulta no banco de dados
app.post('/api/consultas', (req, res) => {
    const { nome, especialidade, data, hora, status, confirmada } = req.body;
    const query = `INSERT INTO consultas (nome, especialidade, data, hora, status, confirmada) VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.run(query, [nome, especialidade, data, hora, status, confirmada ? 1 : 0], function(err) {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        res.json({ mensagem: 'Consulta salva no banco de dados com sucesso!', id: this.lastID });
    });
});

// 2. Rota para buscar todas as consultas cadastradas
app.get('/api/consultas', (req, res) => {
    db.all(`SELECT * FROM consultas`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ erro: err.message });
        }
        res.json(rows);
    });
});

// Inicia o servidor na porta 3000
app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});