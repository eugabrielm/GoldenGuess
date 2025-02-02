const db = require('../database/db');

const validarCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]+/g, ''); 
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  let resto;
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf.charAt(i - 1)) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf.charAt(i - 1)) * (12 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;

  return true;
};

exports.registerUser = async (req, res) => {
  const { nome, cpf, email, data_nascimento, senha, confirmPassword } = req.body;

  if (senha !== confirmPassword) {
    return res.status(400).json({ message: "As senhas não coincidem." });
  }

  if (!validarCPF(cpf)) {
    return res.status(400).json({ message: "CPF inválido." });
  }

  console.log('Verificando se o e-mail ou CPF já estão cadastrados...');

  const userExistQuery = `SELECT * FROM usuarios WHERE email = ? OR cpf = ?`;

  try {
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

    if (user.senha !== senha) {
      return res.status(400).json({ message: 'Senha incorreta.' });
    }

    res.status(200).json({
      message: 'Login bem-sucedido.',
      tipo_usuario: user.tipo_usuario, 
      usuario_id: user.id
    });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ message: 'Erro ao realizar o login.', error });
  }
};
