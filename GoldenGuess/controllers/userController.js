const db = require('../database/db');

const getPremiacoes = (req, res) => {
  const sql = `SELECT * FROM premiacoes`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar premiações.' });
    }
    console.log(rows);
    res.status(200).json(rows);
  });
};

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

const getNomeados = (req, res) => {
  const categoriaId = req.params.categoriaId;
  const premiacaoId = req.params.premiacaoId;

  const sql = `SELECT nomeados.id, nomeados.nome, categoria_nomeado.ganhador
  FROM nomeados
  JOIN categoria_nomeado ON nomeados.id = categoria_nomeado.nomeado_id
  JOIN nomeado_premiacao ON nomeados.id = nomeado_premiacao.nomeado_id
  WHERE categoria_nomeado.categoria_id = ? 
  AND nomeado_premiacao.premiacao_id = ?`;


  db.all(sql, [categoriaId, premiacaoId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
};

const salvarVoto =  (req, res) => {
  const { usuario_id, nomeado_id, categoria_id, premiacao_id } = req.body;
  const sql = 'INSERT INTO votos (usuario_id, nomeado_id, categoria_id, premiacao_id) VALUES (?, ?, ?, ?)';

  db.run(sql, [usuario_id, nomeado_id, categoria_id, premiacao_id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, usuario_id, nomeado_id, categoria_id, premiacao_id });
  });
};

const formatarNome = (nome) => {
  return nome.toLowerCase().replace(/\s+/g, ''); // Converte para minúsculas e remove espaços
};

const enviarPalpite = (req, res) => {
  const { usuario_id, categoria_id, premiacao_id, palpites } = req.body;

  if (!usuario_id || !categoria_id || !premiacao_id || !palpites || palpites.length === 0) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios!' });
  }

  const sql = `
    INSERT INTO palpites (usuario_id, nome, nome_formatado, categoria_id, premiacao_id)
    VALUES (?, ?, ?, ?, ?)
  `;

  const insertPromises = palpites.map(nome => {
    const nome_formatado = formatarNome(nome);

    return new Promise((resolve, reject) => {
      db.run(sql, [usuario_id, nome, nome_formatado, categoria_id, premiacao_id], function (err) {
        if (err) return reject(err);
        resolve();
      });
    });
  });

  Promise.all(insertPromises)
    .then(() => res.status(201).json({ message: 'Palpites registrados com sucesso!' }))
    .catch(error => res.status(400).json({ error: error.message }));
};

const listarUsuarios = (req, res) => {
  const sql = `SELECT id, nome, email, tipo_usuario, created_at FROM usuarios`;
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar usuários.' });
    }
    res.status(200).json(rows); 
  });
};

module.exports = {
  getPremiacoes,
  getCategorias,
  getNomeados,
  enviarPalpite,
  listarUsuarios,
  salvarVoto
};


