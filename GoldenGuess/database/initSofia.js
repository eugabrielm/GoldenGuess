const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'goldenguess.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

const dropTables = () => {
  db.serialize(() => {
    // Drop das tabelas, se existirem
    db.run(`DROP TABLE IF EXISTS categoria_nomeado`);
    db.run(`DROP TABLE IF EXISTS votos`);
    db.run(`DROP TABLE IF EXISTS palpites`);
    db.run(`DROP TABLE IF EXISTS nomeado_premiacao`);
    db.run(`DROP TABLE IF EXISTS nomeados`);
    db.run(`DROP TABLE IF EXISTS categorias`);
    db.run(`DROP TABLE IF EXISTS premiacoes`);
    db.run(`DROP TABLE IF EXISTS usuarios`);

    console.log('Tabelas antigas excluídas.');
  });
};

const createTables = () => {
  db.serialize(() => {
    // Tabela de usuários
    db.run(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        data_nascimento DATE NOT NULL,
        cpf TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        tipo_usuario TEXT CHECK(tipo_usuario IN ('admin', 'padrao')) DEFAULT 'padrao',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de premiações
    db.run(`
      CREATE TABLE IF NOT EXISTS premiacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT,
        fase TEXT CHECK(fase IN ('palpites', 'votacao')) DEFAULT 'palpites',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela de categorias
    db.run(`
      CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        premiacao_id INTEGER NOT NULL,
        FOREIGN KEY (premiacao_id) REFERENCES premiacoes (id) ON DELETE CASCADE
      )
    `);

    // Tabela de nomeados - sem o campo descricao
    db.run(`
      CREATE TABLE IF NOT EXISTS nomeados (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL
      )
    `);

    // Tabela de relacionamento entre nomeados e premiacoes
    db.run(`
      CREATE TABLE IF NOT EXISTS nomeado_premiacao (
        nomeado_id INTEGER NOT NULL,
        premiacao_id INTEGER NOT NULL,
        PRIMARY KEY (nomeado_id, premiacao_id),
        FOREIGN KEY (nomeado_id) REFERENCES nomeados (id) ON DELETE CASCADE,
        FOREIGN KEY (premiacao_id) REFERENCES premiacoes (id) ON DELETE CASCADE
      )
    `);

    // Tabela para relacionar categorias com nomeados
    db.run(`
      CREATE TABLE IF NOT EXISTS categoria_nomeado (
        categoria_id INTEGER NOT NULL,
        nomeado_id INTEGER NOT NULL,
        PRIMARY KEY (categoria_id, nomeado_id),
        FOREIGN KEY (categoria_id) REFERENCES categorias (id) ON DELETE CASCADE,
        FOREIGN KEY (nomeado_id) REFERENCES nomeados (id) ON DELETE CASCADE
      )
    `);

    // Tabela de palpites
    db.run(`
      CREATE TABLE IF NOT EXISTS palpites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        nomeado_id INTEGER NOT NULL,
        categoria_id INTEGER NOT NULL,
        premiacao_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
        FOREIGN KEY (nomeado_id) REFERENCES nomeados (id) ON DELETE CASCADE,
        FOREIGN KEY (categoria_id) REFERENCES categorias (id) ON DELETE CASCADE,
        FOREIGN KEY (premiacao_id) REFERENCES premiacoes (id) ON DELETE CASCADE
      )
    `);

    // Tabela de votos
    db.run(`
      CREATE TABLE IF NOT EXISTS votos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        nomeado_id INTEGER NOT NULL,
        categoria_id INTEGER NOT NULL,
        premiacao_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
        FOREIGN KEY (nomeado_id) REFERENCES nomeados (id) ON DELETE CASCADE,
        FOREIGN KEY (categoria_id) REFERENCES categorias (id) ON DELETE CASCADE,
        FOREIGN KEY (premiacao_id) REFERENCES premiacoes (id) ON DELETE CASCADE
      )
    `);

    console.log('Tabelas criadas com sucesso.');
  });
};

//dropTables();
//createTables();

const verificarEmail = (email, callback) => {
  db.get(`SELECT email FROM usuarios WHERE email = ?`, [email], (err, row) => {
    if (err) {
      console.error('Erro ao verificar o e-mail:', err.message);
    } else {
      callback(row !== undefined); // true se o e-mail existir, false caso contrário
    }
  });
};

// Função para cadastrar usuários
const cadastrarUsuario = (nome, email) => {
  verificarEmail(email, (existe) => {
    if (existe) {
      console.log(`O e-mail ${email} já está cadastrado.`);
    } else {
      db.run(
        `INSERT INTO usuarios (nome, email) VALUES (?, ?)`,
        [nome, email],
        (err) => {
          if (err) {
            console.error('Erro ao cadastrar usuário:', err.message);
          } else {
            console.log(`Usuário "${nome}" cadastrado com sucesso!`);
          }
        }
      );
    }
  });
};

// Função para cadastrar premiações
const cadastrarPremiacao = (nome, descricao, fase) => {
  db.run(
    `INSERT INTO premiacoes (nome, descricao, fase) VALUES (?, ?, ?)`,
    [nome, descricao, fase],
    (err) => {
      if (err) {
        console.error('Erro ao cadastrar premiação:', err.message);
      } else {
        console.log(`Premiação "${nome}" cadastrada com sucesso!`);
      }
    }
  );
};

/*cadastrarPremiacao('Oscar 2025', 'Filme', 'palpites');
cadastrarPremiacao('Grammy 2025', 'Música', 'palpites');
cadastrarPremiacao('Oscar 2024', 'Filme', 'palpites');*/


const listarPremiacoes = () => {
  db.all(`SELECT nome, descricao, fase FROM premiacoes`, [], (err, rows) => {
    if (err) {
      console.error('Erro ao listar premiações:', err.message);
    } else {
      console.log('Lista de premiações cadastradas:');
      rows.forEach((row) => {
        console.log(`Nome: ${row.nome}, Descrição: ${row.descricao}, Fase: ${row.fase}`);
      });
    }
  });
};

const cadastrarCategoriasParaPremiacao = (premiacaoId, categorias) => {
  // Verifica se o ID da premiação existe
  db.get(`SELECT id FROM premiacoes WHERE id = ?`, [premiacaoId], (err, row) => {
    if (err) {
      console.error('Erro ao buscar premiação:', err.message);
      return;
    }

    if (!row) {
      console.log(`Nenhuma premiação encontrada com o ID ${premiacaoId}.`);
      return;
    }

    // Cadastra cada categoria no ID da premiação especificado
    categorias.forEach((categoria) => {
      db.run(
        `INSERT INTO categorias (nome, premiacao_id) VALUES (?, ?)`,
        [categoria, premiacaoId],
        (err) => {
          if (err) {
            console.error(
              `Erro ao cadastrar categoria "${categoria}" para a premiação ID ${premiacaoId}:`,
              err.message
            );
          } else {
            console.log(
              `Categoria "${categoria}" cadastrada para a premiação ID ${premiacaoId}.`
            );
          }
        }
      );
    });
  });
};

// Exemplo de uso para cadastrar categorias
const categoriasParaPremiacao3 = ['Melhor som', 'Melhor figurino', 'Melhor música'];
const categoriasParaPremiacao2 = ['Melhor filme', 'Melhor atriz', 'Melhor ator'];
const categoriasParaPremiacao1 = ['Melhor edição', 'Melhor diretor', 'Melhor ator'];

// Cadastra as categorias no ID específico de premiação
/*cadastrarCategoriasParaPremiacao(3, categoriasParaPremiacao2);
cadastrarCategoriasParaPremiacao(2, categoriasParaPremiacao3);
cadastrarCategoriasParaPremiacao(1, categoriasParaPremiacao1);*/

//listarPremiacoes();

// Fechar conexão com o banco após listar tudo
db.close((err) => {
  if (err) {
    console.error('Erro ao fechar o banco de dados:', err.message);
  } else {
    console.log('Conexão com o banco de dados encerrada.');
  }
});

// Listar usuários cadastrados
/*db.all(`SELECT nome FROM usuarios`, [], (err, rows) => {
  if (err) {
    console.error('Erro ao listar usuários:', err.message);
  } else {
    console.log('Lista de usuários cadastrados:');
    rows.forEach((row) => {
      console.log(row.nome);
    });
  }

  // Fechar conexão com o banco
  db.close((err) => {
    if (err) {
      console.error('Erro ao fechar o banco de dados:', err.message);
    } else {
      console.log('Conexão com o banco de dados encerrada.');
    }
  });
});*/