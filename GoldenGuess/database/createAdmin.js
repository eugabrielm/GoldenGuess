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

const criarUsuarioAdmin = () => {
  const nome = "Admin";
  const data_nascimento = "1980-01-01";
  const cpf = "00000000000";
  const email = "admin@goldenguess.com";
  const senha = "admin123"; // Aqui pode ser um hash gerado com bcrypt
  const tipo_usuario = "admin";

  db.run(
    `INSERT INTO usuarios (nome, data_nascimento, cpf, email, senha, tipo_usuario) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nome, data_nascimento, cpf, email, senha, tipo_usuario],
    (err) => {
      if (err) {
        console.error("Erro ao criar usuário administrador:", err.message);
      } else {
        console.log("Usuário administrador criado com sucesso!");
      }
      db.close();
    }
  );
};

criarUsuarioAdmin();
