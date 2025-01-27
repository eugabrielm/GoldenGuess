const db = require('../database/db'); // Supondo que o db.js seja o arquivo de conexão com o banco

// Função para salvar a premiação
exports.salvarPremiacao = (req, res) => {
    const { nome, descricao, fase, categorias, nomeados } = req.body;
    const query = `INSERT INTO premiacoes (nome, descricao, fase) VALUES (?, ?, ?)`;

    db.run(query, [nome, descricao, fase], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        const premiacaoId = this.lastID;

        // Salvar categorias
        categorias.forEach(categoria => {
            const categoriaQuery = `INSERT INTO categorias (nome, premiacao_id) VALUES (?, ?)`;
            db.run(categoriaQuery, [categoria, premiacaoId]);
        });

        // Se for segunda fase, adicionar nomeados
        if (fase === 'votacao' && nomeados) {
            nomeados.forEach(nomeado => {
                const nomeadoQuery = `INSERT INTO nomeados (nome) VALUES (?)`;
                db.run(nomeadoQuery, [nomeado], function (err) {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    const nomeadoId = this.lastID;
                    // Relacionar nomeados com categorias
                    categorias.forEach(categoria => {
                        const categoriaQuery = `SELECT id FROM categorias WHERE nome = ? AND premiacao_id = ?`;
                        db.get(categoriaQuery, [categoria, premiacaoId], (err, row) => {
                            if (row) {
                                const categoriaNomeadoQuery = `INSERT INTO categoria_nomeado (categoria_id, nomeado_id) VALUES (?, ?)`;
                                db.run(categoriaNomeadoQuery, [row.id, nomeadoId]);
                            }
                        });
                    });
                });
            });
        }

        res.status(200).json({ message: 'Premiação salva com sucesso' });
    });
};
