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
    `, (err) => {
      if (err) {
        console.error('Erro ao criar tabela usuarios:', err.message);
      }
    });

    // Tabela de premiações
    db.run(`
      CREATE TABLE IF NOT EXISTS premiacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT,
        fase TEXT CHECK(fase IN ('palpites', 'votacao', 'concluido')) DEFAULT 'palpites',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Erro ao criar tabela premiacoes:', err.message);
      }
    });

    // Tabela de categorias
    db.run(`
      CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        premiacao_id INTEGER NOT NULL,
        max_nomeados INTEGER NOT NULL CHECK(max_nomeados > 0),
        FOREIGN KEY (premiacao_id) REFERENCES premiacoes (id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error('Erro ao criar tabela categorias:', err.message);
      }
    });


    // Tabela de nomeados - com nome e nome_formatado
    db.run(`
  CREATE TABLE IF NOT EXISTS nomeados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    nome_formatado TEXT NOT NULL UNIQUE
  )
`, (err) => {
      if (err) {
        console.error('Erro ao criar tabela nomeados:', err.message);
      }
    });
    // Tabela de relacionamento entre nomeados e premiacoes
    db.run(`
      CREATE TABLE IF NOT EXISTS nomeado_premiacao (
        nomeado_id INTEGER NOT NULL,
        premiacao_id INTEGER NOT NULL,
        PRIMARY KEY (nomeado_id, premiacao_id),
        FOREIGN KEY (nomeado_id) REFERENCES nomeados (id) ON DELETE CASCADE,
        FOREIGN KEY (premiacao_id) REFERENCES premiacoes (id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error('Erro ao criar tabela nomeado_premiacao:', err.message);
      }
    });

    // Tabela para relacionar categorias com nomeados
    db.run(`
      CREATE TABLE IF NOT EXISTS categoria_nomeado (
        categoria_id INTEGER NOT NULL,
        nomeado_id INTEGER NOT NULL,
        ganhador INTEGER DEFAULT 0,
        PRIMARY KEY (categoria_id, nomeado_id),
        FOREIGN KEY (categoria_id) REFERENCES categorias (id) ON DELETE CASCADE,
        FOREIGN KEY (nomeado_id) REFERENCES nomeados (id) ON DELETE CASCADE 
      )
    `, (err) => {
      if (err) {
        console.error('Erro ao criar tabela categoria_nomeado:', err.message);
      }
    });

    // Tabela de palpites
    db.run(`
      CREATE TABLE IF NOT EXISTS palpites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        nome TEXT NOT NULL,
        nome_formatado TEXT NOT NULL,
        categoria_id INTEGER NOT NULL,
        premiacao_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE,
        FOREIGN KEY (categoria_id) REFERENCES categorias (id) ON DELETE CASCADE,
        FOREIGN KEY (premiacao_id) REFERENCES premiacoes (id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error('Erro ao criar tabela palpites:', err.message);
      }
    });

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
    `, (err) => {
      if (err) {
        console.error('Erro ao criar tabela votos:', err.message);
      }
    });

    console.log('Tabelas criadas com sucesso.');
  });
};

// Descomente as funções de acordo com a necessidade
dropTables();
createTables();

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

//listarPremiacoes();

const verPalpitesNoConsole = () => {
  const sql = 'SELECT * FROM palpites';  // Consulta para ver todos os palpites

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar palpites:', err.message);
      return;
    }

    if (rows.length === 0) {
      console.log('Nenhum palpite encontrado.');
    } else {
      console.log('Palpites encontrados:');
      console.table(rows);  // Isso vai mostrar os resultados no formato de tabela no console
    }
  });
};

const verVotosNoConsole = () => {
  const sql = 'SELECT * FROM votos';  // Consulta para ver todos os palpites

  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar palpites:', err.message);
      return;
    }

    if (rows.length === 0) {
      console.log('Nenhum palpite encontrado.');
    } else {
      console.log('Palpites encontrados:');
      console.table(rows);  // Isso vai mostrar os resultados no formato de tabela no console
    }
  });
};

verPalpitesNoConsole();
verVotosNoConsole();


// Fechar a conexão ao banco de dados após as operações
db.close((err) => {
  if (err) {
    console.error('Erro ao fechar o banco de dados:', err.message);
  } else {
    console.log('Conexão com o banco de dados encerrada.');
  }
});
