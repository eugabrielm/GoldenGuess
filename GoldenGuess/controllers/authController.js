const db = require('../database/db'); // Para acessar o banco de dados SQLite
const bcrypt = require('bcrypt'); // Para comparar as senhas de forma segura

// Função para cadastrar o usuário
exports.registerUser = async (req, res) => {
  const { nome, cpf, email, data_nascimento, senha, confirmPassword } = req.body;

  // Verifica se a senha e a confirmação de senha coincidem
  if (senha !== confirmPassword) {
    return res.status(400).json({ message: "As senhas não coincidem." });
  }

  console.log('Verificando se o e-mail ou CPF já estão cadastrados...');

  // Verifica se o e-mail ou CPF já existem no banco de dados
  const userExistQuery = `SELECT * FROM usuarios WHERE email = ? OR cpf = ?`;

  try {
    const userExist = await new Promise((resolve, reject) => {
      db.get(userExistQuery, [email, cpf], (err, row) => {
        if (err) {
          reject(err);
        }
        resolve(row); // Retorna o objeto ou null
      });
    });

    // Verifique se o resultado for nulo ou se um usuário foi encontrado
    if (userExist) {
      return res.status(400).json({ message: "E-mail ou CPF já estão cadastrados." });
    }

    console.log('Inserindo novo usuário no banco de dados...');
    
    // Insere o novo usuário no banco de dados
    const insertQuery = `
      INSERT INTO usuarios (nome, cpf, email, data_nascimento, senha)
      VALUES (?, ?, ?, ?, ?)
    `;

    const result = await db.run(insertQuery, [nome, cpf, email, data_nascimento, senha]);

    console.log('Usuário cadastrado com sucesso!');
    res.status(201).json({ message: "Usuário cadastrado com sucesso!" });

  } catch (error) {
    // Se ocorrer algum erro na consulta ou inserção
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ message: "Erro ao cadastrar o usuário.", error });
  }
};

// Função para fazer login do usuário
exports.loginUser = async (req, res) => {
  const { email, senha } = req.body;

  // Verifica se o e-mail existe no banco de dados
  const userQuery = `SELECT * FROM usuarios WHERE email = ?`;

  try {
    const user = await new Promise((resolve, reject) => {
      db.get(userQuery, [email], (err, row) => {
        if (err) {
          reject(err);
        }
        resolve(row); // Retorna o objeto do usuário ou null
      });
    });

    // Se o usuário não existir
    if (!user) {
      return res.status(400).json({ message: "E-mail ou senha inválidos." });
    }

    // Verifica se a senha fornecida corresponde à registrada
    const match = await bcrypt.compare(senha, user.senha);

    if (!match) {
      return res.status(400).json({ message: "E-mail ou senha inválidos." });
    }

    // Se a senha estiver correta, verifica o tipo de usuário
    if (user.tipo_usuario === 'admin') {
      return res.status(200).json({ message: "Login bem-sucedido!", redirectUrl: "/admin/dashboard" });
    } else if (user.tipo_usuario === 'padrao') {
      return res.status(200).json({ message: "Login bem-sucedido!", redirectUrl: "/principal" });
    }

  } catch (error) {
    console.error('Erro ao realizar o login:', error);
    res.status(500).json({ message: "Erro ao realizar o login.", error });
  }
};
