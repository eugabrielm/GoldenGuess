const sqlite3 = require('sqlite3').verbose();
const path = require('path');


const dbPath = path.resolve(__dirname, 'goldenguess.db');


const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

const createTables = () => {
  db.serialize(() => {
    // Tabela de usuários
    db.run(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        data_nascimento DATE NOT NULL,
        cpf TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        tipo_usuario TEXT CHECK(tipo_usuario IN ('admin', 'padrao')) DEFAULT 'padrao',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de premiações
    db.run(`
      CREATE TABLE IF NOT EXISTS premiacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT,
        fase TEXT CHECK(fase IN ('palpites', 'votacao')) DEFAULT 'palpites',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de categorias
    db.run(`
      CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        premiacao_id INTEGER NOT NULL,
        FOREIGN KEY (premiacao_id) REFERENCES premiacoes (id) ON DELETE CASCADE
      )
    `);

    // Tabela de nomeados
    db.run(`
      CREATE TABLE IF NOT EXISTS nomeados (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT,
        premiacao_id INTEGER NOT NULL,
        FOREIGN KEY (premiacao_id) REFERENCES premiacoes (id) ON DELETE CASCADE
      )
    `);

    // Tabela para relacionar categorias com nomeados
    db.run(`
      CREATE TABLE IF NOT EXISTS categoria_nomeado (
        categoria_id INTEGER NOT NULL,
        nomeado_id INTEGER NOT NULL,
        PRIMARY KEY (categoria_id, nomeado_id),
        FOREIGN KEY (categoria_id) REFERENCES categorias (id) ON DELETE CASCADE,
        FOREIGN KEY (nomeado_id) REFERENCES nomeados (id) ON DELETE CASCADE
      )
    `);

    // Tabela de palpites
    db.run(`
      CREATE TABLE IF NOT EXISTS palpites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        nomeado_id INTEGER NOT NULL,
        categoria_id INTEGER NOT NULL,
        premiacao_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
        FOREIGN KEY (nomeado_id) REFERENCES nomeados (id) ON DELETE CASCADE,
        FOREIGN KEY (categoria_id) REFERENCES categorias (id) ON DELETE CASCADE,
        FOREIGN KEY (premiacao_id) REFERENCES premiacoes (id) ON DELETE CASCADE
      )
    `);

    // Tabela de votos
    db.run(`
      CREATE TABLE IF NOT EXISTS votos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        nomeado_id INTEGER NOT NULL,
        categoria_id INTEGER NOT NULL,
        premiacao_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
        FOREIGN KEY (nomeado_id) REFERENCES nomeados (id) ON DELETE CASCADE,
        FOREIGN KEY (categoria_id) REFERENCES categorias (id) ON DELETE CASCADE,
        FOREIGN KEY (premiacao_id) REFERENCES premiacoes (id) ON DELETE CASCADE
      )
    `);

    console.log('Tabelas criadas com sucesso.');
  });
};


createTables();


db.close((err) => {
  if (err) {
    console.error('Erro ao fechar o banco de dados:', err.message);
  } else {
    console.log('Conexão com o banco de dados encerrada.');
  }
});
