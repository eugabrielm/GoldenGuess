const db = require('../database/db');

// Cadastrar premiações
const cadastrarPremiacao = (req, res) => {
    const { nome, descricao, fase = 'palpites' } = req.body;

    const sql = `
    INSERT INTO premiacoes (nome, descricao, fase) 
    VALUES (?, ?, ?)
  `;
    db.run(sql, [nome, descricao, fase], function (err) {
        if (err) {
            return res.status(400).json({ error: 'Erro ao cadastrar premiação.' });
        }
        res.status(201).json({ message: 'Premiação cadastrada com sucesso!', id: this.lastID });
    });
};

// Editar informações de um usuário
const editarUsuario = (req, res) => {
    const { id } = req.params;
    const { nome, data_nascimento, cpf, email, tipo_usuario } = req.body;

    const sql = `
    UPDATE usuarios
    SET nome = ?, data_nascimento = ?, cpf = ?, email = ?, tipo_usuario = ?
    WHERE id = ?
  `;
    db.run(sql, [nome, data_nascimento, cpf, email, tipo_usuario, id], function (err) {
        if (err) {
            return res.status(400).json({ error: 'Erro ao atualizar informações do usuário.' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        res.status(200).json({ message: 'Usuário atualizado com sucesso.' });
    });
};

// Excluir usuário
const excluirUsuario = (req, res) => {
    const { id } = req.params;

    const sql = `DELETE FROM usuarios WHERE id = ?`;
    db.run(sql, [id], function (err) {
        if (err) {
            return res.status(400).json({ error: 'Erro ao excluir usuário.' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        res.status(200).json({ message: 'Usuário excluído com sucesso.' });
    });
};
// Verifica se o usuário é administrador
const isAdmin = (req, res, next) => {
    const { tipo_usuario } = req.body; // Aqui você pode usar um token ou sessão no futuro
    if (tipo_usuario !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
    }
    next();
};

module.exports = { isAdmin, cadastrarPremiacao, editarUsuario, excluirUsuario };
