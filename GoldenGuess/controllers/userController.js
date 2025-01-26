const db = require('../database/db');

// Listar premiações
const getPremiacoes = (req, res) => {
  const sql = `SELECT * FROM premiacoes`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar premiações.' });
    }
    res.status(200).json(rows);
  });
};

// Listar categorias de uma premiação
const getCategorias = (req, res) => {
  const { premiacaoId } = req.params;
  const sql = `SELECT * FROM categorias WHERE premiacao_id = ?`;
  db.all(sql, [premiacaoId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar categorias.' });
    }
    res.status(200).json(rows);
  });
};

// Registrar palpites
const enviarPalpite = (req, res) => {
  const { usuario_id, nomeado_id, categoria_id, premiacao_id } = req.body;

  const sql = `
    INSERT INTO palpites (usuario_id, nomeado_id, categoria_id, premiacao_id)
    VALUES (?, ?, ?, ?)
  `;
  db.run(sql, [usuario_id, nomeado_id, categoria_id, premiacao_id], function (err) {
    if (err) {
      return res.status(400).json({ error: 'Erro ao registrar palpite.' });
    }
    res.status(201).json({ message: 'Palpite registrado com sucesso!' });
  });
};
const listarUsuarios = (req, res) => {
  const sql = `SELECT id, nome, email, tipo_usuario, created_at FROM usuarios`;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar usuários.' });
    }
    res.status(200).json(rows);  // Retorna a lista de usuários
  });
};

module.exports = { getPremiacoes, getCategorias, enviarPalpite, listarUsuarios };


