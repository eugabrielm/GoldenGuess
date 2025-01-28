const db = require('../database/db');

exports.registerUser = async (req, res) => {
  const { nome, cpf, email, data_nascimento, senha, confirmPassword } = req.body;

  // Verifica se as senhas coincidem
  if (senha !== confirmPassword) {
    return res.status(400).json({ message: "As senhas não coincidem." });
  }

  console.log('Verificando se o e-mail ou CPF já estão cadastrados...');

  const userExistQuery = `SELECT * FROM usuarios WHERE email = ? OR cpf = ?`;

  try {
    // Verifica se o usuário já existe
    const userExist = await new Promise((resolve, reject) => {
      db.get(userExistQuery, [email, cpf], (err, row) => {
        if (err) {
          reject(err);
        }
        resolve(row); 
      });
    });

    if (userExist) {
      return res.status(400).json({ message: "E-mail ou CPF já estão cadastrados." });
    }

    console.log('Inserindo novo usuário no banco de dados...');
    
    const insertQuery = `
      INSERT INTO usuarios (nome, cpf, email, data_nascimento, senha)
      VALUES (?, ?, ?, ?, ?)
    `;

    // Insere o novo usuário no banco de dados
    await new Promise((resolve, reject) => {
      db.run(insertQuery, [nome, cpf, email, data_nascimento, senha], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });

    console.log('Usuário cadastrado com sucesso!');
    res.status(201).json({ message: "Usuário cadastrado com sucesso!" });

  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ message: "Erro ao cadastrar o usuário.", error });
  }
};

exports.loginUser = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const query = `SELECT * FROM usuarios WHERE email = ?`;
    
    // Busca o usuário no banco de dados
    const user = await new Promise((resolve, reject) => {
      db.get(query, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });

    if (!user) {
      return res.status(400).json({ message: 'Usuário não encontrado.' });
    }

    // Verifica a senha diretamente
    if (user.senha !== senha) {
      return res.status(400).json({ message: 'Senha incorreta.' });
    }

    res.status(200).json({
      message: 'Login bem-sucedido.',
      tipo_usuario: user.tipo_usuario, // Retorna o tipo de usuário (admin ou padrão)
    });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro ao realizar o login.', error });
  }
};
