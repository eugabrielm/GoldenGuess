const db = require('../database/db');
const formatarNome = (nome) => {
  return nome.toLowerCase().replace(/\s+/g, ''); // Converte para minúsculas e remove espaços
};
const salvarPremiacaoPrimeiraFase = (req, res) => {
    const { nome, descricao, categorias } = req.body;

    if (!nome || !descricao || !categorias || categorias.length === 0) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios!' });
    }

    const queryPremiacao = `INSERT INTO premiacoes (nome, descricao, fase) VALUES (?, ?, ?)`;
    db.run(queryPremiacao, [nome, descricao, 'palpites'], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Erro ao criar a premiação.' });
        }
        
        const premiacaoId = this.lastID; 

        const queryCategoria = `INSERT INTO categorias (nome, premiacao_id, max_nomeados) VALUES (?, ?, ?)`;
        const insertCategorias = categorias.map(({ nome, max_nomeados }) => {
            return new Promise((resolve, reject) => {
                db.run(queryCategoria, [nome, premiacaoId, max_nomeados], function (err) {
                    if (err) {
                        console.error('Erro ao inserir categoria:', err.message);
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });
        });

        Promise.all(insertCategorias)
            .then(() => res.status(201).json({ message: 'Premiação e categorias criadas com sucesso!' }))
            .catch(() => res.status(500).json({ message: 'Erro ao criar categorias.' }));
    });
};
const salvarPremiacaoSegundaFase = (req, res) => {
    const { premiacaoId, indicadosPorCategoria } = req.body;
  
    if (!premiacaoId || !indicadosPorCategoria || indicadosPorCategoria.length === 0) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios!' });
    }
  
    // Atualiza a fase da premiação para 'votacao'
    const queryUpdatePremiacao = `UPDATE premiacoes SET fase = ? WHERE id = ?`;
    db.run(queryUpdatePremiacao, ['votacao', premiacaoId], function (err) {
      if (err) {
        console.error('Erro ao atualizar a fase da premiação:', err.message);
        return res.status(500).json({ message: 'Erro ao atualizar a fase da premiação.' });
      }
  
      // Insere os nomeados e suas relações
      const insertPromises = indicadosPorCategoria.flatMap(({ categoriaId, indicados }) => {
        return indicados.map(nomeado => {
          return new Promise((resolve, reject) => {
            const queryNomeado = `INSERT INTO nomeados (nome, nome_formatado) VALUES (?, ?)`;
            db.run(queryNomeado, [nomeado, formatarNome(nomeado)], function (err)  {
              if (err) return reject(err);
  
              const nomeadoId = this.lastID;
  
              const queryNomeadoPremiacao = `INSERT INTO nomeado_premiacao (nomeado_id, premiacao_id) VALUES (?, ?)`;
              db.run(queryNomeadoPremiacao, [nomeadoId, premiacaoId], (err) => {
                if (err) return reject(err);
  
                const queryCategoriaNomeado = `INSERT INTO categoria_nomeado (categoria_id, nomeado_id) VALUES (?, ?)`;
                db.run(queryCategoriaNomeado, [categoriaId, nomeadoId], (err) => {
                  if (err) return reject(err);
                  resolve();
                });
              });
            });
          });
        });
      });
  
      Promise.all(insertPromises)
        .then(() => res.status(201).json({ message: 'Indicados salvos com sucesso e fase atualizada!' }))
        .catch((err) => res.status(500).json({ message: 'Erro ao salvar indicados.', error: err }));
    });
  };

const buscarPremiacoesPrimeiraFase = (req, res) => {
    console.log('Rota /buscar-premiacoes-primeira-fase chamada');
    const query = `SELECT id, nome FROM premiacoes WHERE fase = 'palpites'`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Erro ao buscar premiações.' });
        }
        res.status(200).json(rows); // Retorna um JSON válido
    });
};

const buscarCategorias = (req, res) => {
    const premiacaoId = req.query.premiacaoId;
    console.log('Premiação ID recebido:', premiacaoId);
    if (!premiacaoId) {
        return res.status(400).json({ message: 'ID da premiação é obrigatório.' });
    }

    const query = `SELECT id, nome, max_nomeados FROM categorias WHERE premiacao_id = ?`;
    db.all(query, [premiacaoId], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Erro ao buscar categorias.' });
        }
        res.status(200).json(rows);
    });
};

const buscarPremiacoesVotacao = (req, res) => {
    const query = `SELECT id, nome FROM premiacoes WHERE fase = 'votacao'`;
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro ao buscar premiações.' });
      }
      res.status(200).json(rows);
    });
  };
  
  const buscarIndicados = (req, res) => {
    const categoriaId = req.query.categoriaId;
    if (!categoriaId) {
      return res.status(400).json({ message: 'ID da categoria é obrigatório.' });
    }
  
    const query = `
      SELECT n.id, n.nome 
      FROM nomeados n
      JOIN categoria_nomeado cn ON n.id = cn.nomeado_id
      WHERE cn.categoria_id = ?
    `;
    db.all(query, [categoriaId], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro ao buscar indicados.' });
      }
      res.status(200).json(rows);
    });
  };
  
  const salvarVencedores = (req, res) => {
    const { premiacaoId, vencedores } = req.body;
  
    if (!premiacaoId || !vencedores || vencedores.length === 0) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios!' });
    }
  
    // Atualiza os vencedores no banco de dados
    const promises = vencedores.map(({ categoriaId, vencedorId }) => {
      return new Promise((resolve, reject) => {
        const queryUpdateVencedor = `
          UPDATE categoria_nomeado 
          SET ganhador = 1 
          WHERE categoria_id = ? AND nomeado_id = ?
        `;
        db.run(queryUpdateVencedor, [categoriaId, vencedorId], function (err) {
          if (err) {
            return reject(err);
          }
          resolve();
        });
      });
    });
  
    // Executa todas as atualizações
    Promise.all(promises)
      .then(() => {
        // Atualiza a fase da premiação para 'concluido'
        const queryUpdatePremiacao = `UPDATE premiacoes SET fase = 'concluido' WHERE id = ?`;
        db.run(queryUpdatePremiacao, [premiacaoId], function (err) {
          if (err) {
            console.error('Erro ao atualizar fase da premiação:', err.message);
            return res.status(500).json({ message: 'Erro ao atualizar fase da premiação.' });
          }
  
          res.status(200).json({ message: 'Vencedores salvos com sucesso e fase da premiação atualizada!' });
        });
      })
      .catch((err) => {
        console.error('Erro ao salvar vencedores:', err.message);
        res.status(500).json({ message: 'Erro ao salvar vencedores.' });
      });
  };
  module.exports = {
    salvarPremiacaoPrimeiraFase,
    salvarPremiacaoSegundaFase,
    buscarPremiacoesPrimeiraFase,
    buscarCategorias,
    buscarPremiacoesVotacao,
    buscarIndicados,
    salvarVencedores
  };