const db = require('../database/db');

const getPremiacoes = (req, res) => {
  const sql = `SELECT * FROM premiacoes`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar premiações.' });
    }

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

const getUsuarioInfo = (req, res) => {
  const { usuarioId } = req.params;

  const sql = `SELECT nome, email, data_nascimento FROM usuarios WHERE id = ?`;
  db.get(sql, [usuarioId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao buscar informações do usuário.' });
    }
    res.status(200).json(row);
  });
};

const getUsuarioAtividade = (req, res) => {
  const { usuarioId } = req.params;

  const sqlPalpites = `
    SELECT DISTINCT p.id, p.nome, p.descricao, p.fase
    FROM premiacoes p
    JOIN palpites pl ON p.id = pl.premiacao_id
    WHERE pl.usuario_id = ?
  `;

  const sqlVotos = `
    SELECT DISTINCT p.id, p.nome, p.descricao, p.fase
    FROM premiacoes p
    JOIN votos v ON p.id = v.premiacao_id
    WHERE v.usuario_id = ?
  `;

  Promise.all([
    new Promise((resolve, reject) => {
      db.all(sqlPalpites, [usuarioId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    }),
    new Promise((resolve, reject) => {
      db.all(sqlVotos, [usuarioId], (err, rows) => {
        if (err) return reject(err);
        resolve(rows);
      });
    })
  ])
  .then(([palpites, votos]) => {
    res.status(200).json({ palpites, votos });
  })
  .catch(error => {
    console.error('Erro ao buscar atividade do usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar atividade do usuário.' });
  });
};

const getUsuarioResultados = (req, res) => {
  const { usuarioId } = req.params;

  const sql = `
    SELECT 
      p.id AS premiacao_id,
      p.nome AS premiacao_nome,
      c.id AS categoria_id,
      c.nome AS categoria_nome,
      COUNT(DISTINCT cn.nomeado_id) AS totalIndicados,
      SUM(CASE WHEN pl.nome_formatado = n.nome_formatado THEN 1 ELSE 0 END) AS acertosPrimeiraFase,
      GROUP_CONCAT(DISTINCT CASE WHEN pl.nome_formatado = n.nome_formatado THEN n.nome ELSE NULL END) AS palpitesCorretos,
      COUNT(v.id) AS qtdVotos,
      MAX(CASE WHEN cn.ganhador = 1 AND v.nomeado_id = cn.nomeado_id THEN 1 ELSE 0 END) AS acertoSegundaFase
    FROM premiacoes p
    JOIN categorias c ON p.id = c.premiacao_id
    JOIN categoria_nomeado cn ON c.id = cn.categoria_id
    JOIN nomeados n ON cn.nomeado_id = n.id
    LEFT JOIN palpites pl ON pl.categoria_id = c.id AND pl.usuario_id = ?
    LEFT JOIN votos v ON v.categoria_id = c.id AND v.usuario_id = ?
    GROUP BY p.id, c.id
  `;

  db.all(sql, [usuarioId, usuarioId], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar resultados do usuário:', err);
      return res.status(500).json({ error: 'Erro ao buscar resultados do usuário.' });
    }

    // Formata os resultados para o frontend
    const resultados = rows.map(row => {
      // Verifica se o usuário registrou voto nesta categoria
      let mensagemSegundaFase;
      if (row.qtdVotos === 0) {
        mensagemSegundaFase = 'Fase em andamento';
      } else {
        mensagemSegundaFase = row.acertoSegundaFase === 1
          ? 'Você acertou o vencedor'
          : 'Você errou o vencedor';
      }

      return {
        premiacao: {
          id: row.premiacao_id,
          nome: row.premiacao_nome
        },
        categoria: {
          id: row.categoria_id,
          nome: row.categoria_nome
        },
        totalIndicados: row.totalIndicados,
        acertosPrimeiraFase: row.acertosPrimeiraFase,
        palpitesCorretos: row.palpitesCorretos ? row.palpitesCorretos.split(',') : [],
        acertoSegundaFase: mensagemSegundaFase
      };
    });

    res.status(200).json(resultados);
  });
};

const formatarNome = (nome) => {
  return nome.toLowerCase().replace(/\s+/g, '');
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
  salvarVoto,
  getUsuarioInfo,
  getUsuarioAtividade,
  getUsuarioResultados
};


