const db = require('../database/db');



exports.salvarPremiacaoPrimeiraFase = (req, res) => {
    const { nome, descricao, categorias } = req.body;

    if (!nome || !descricao || !categorias || categorias.length === 0) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios!' });
    }

    // Inserir a premiação
    const queryPremiacao = `INSERT INTO premiacoes (nome, descricao) VALUES (?, ?)`;
    db.run(queryPremiacao, [nome, descricao], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Erro ao criar a premiação.' });
        }
        
        const premiacaoId = this.lastID; // ID da premiação criada

        // Inserir as categorias relacionadas
        const queryCategoria = `INSERT INTO categorias (nome, premiacao_id) VALUES (?, ?)`;
        const insertCategorias = categorias.map((categoria) =>
            db.run(queryCategoria, [categoria, premiacaoId], (err) => {
                if (err) {
                    console.error(err);
                }
            })
        );

        Promise.all(insertCategorias)
            .then(() => res.status(201).json({ message: 'Premiação e categorias criadas com sucesso!' }))
            .catch(() => res.status(500).json({ message: 'Erro ao criar categorias.' }));
    });
};

// Função para salvar premiação na Segunda Fase
exports.salvarPremiacaoSegundaFase = (req, res) => {
    const { nome, descricao, categorias } = req.body;
    console.log("chegou aqui")
    console.log(categorias)
    if (!nome || !descricao || !categorias || categorias.length === 0) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios!' });
    }

    // Inserir a premiação
    const queryPremiacao = `INSERT INTO premiacoes (nome, descricao) VALUES (?, ?)`;
    db.run(queryPremiacao, [nome, descricao], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Erro ao criar a premiação.' });
        }

        const premiacaoId = this.lastID; // ID da premiação criada
     
        // Inserir categorias e nomeados
        const insertPromises = categorias.map((categoria) => {
            const { nome: categoriaNome, nomeados } = categoria;
            console.log("categoria")
            console.log(categoriaNome);
            console.log("nomeados")
            console.log(nomeados);
            return new Promise((resolve, reject) => {
                // Inserir categoria
                const queryCategoria = `INSERT INTO categorias (nome, premiacao_id) VALUES (?, ?)`;
                db.run(queryCategoria, [categoriaNome, premiacaoId], function (err) {
                    if (err) return reject(err);

                    const categoriaId = this.lastID; // ID da categoria criada

                    // Inserir nomeados e relacionar com categoria e premiação
                    const insertNomeados = nomeados.map((nomeado) =>
                        new Promise((resolve, reject) => {
                            const queryNomeado = `INSERT INTO nomeados (nome) VALUES (?)`;
                            db.run(queryNomeado, [nomeado], function (err) {
                                if (err) return reject(err);
                                console.log(nomeado);
                                const nomeadoId = this.lastID;

                                // Relacionar nomeado com premiação
                                const queryNomeadoPremiacao = `INSERT INTO nomeado_premiacao (nomeado_id, premiacao_id) VALUES (?, ?)`;
                                db.run(queryNomeadoPremiacao, [nomeadoId, premiacaoId], (err) => {
                                    if (err) return reject(err);

                                    // Relacionar nomeado com categoria
                                    const queryCategoriaNomeado = `INSERT INTO categoria_nomeado (categoria_id, nomeado_id) VALUES (?, ?)`;
                                    db.run(queryCategoriaNomeado, [categoriaId, nomeadoId], (err) => {
                                        if (err) return reject(err);
                                        resolve();
                                    });
                                });
                            });
                        })
                    );

                    Promise.all(insertNomeados)
                        .then(() => resolve())
                        .catch((err) => reject(err));
                });
            });
        });

        Promise.all(insertPromises)
            .then(() => res.status(201).json({ message: 'Premiação, categorias e nomeados criados com sucesso!' }))
            .catch((err) => res.status(500).json({ message: 'Erro ao criar categorias ou nomeados.', error: err }));
    });
};
