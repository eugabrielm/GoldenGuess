const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Rotas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Rotas
app.use('/auth', authRoutes);  // Rotas de autenticação
app.use('/user', userRoutes);  // Rotas de usuário
app.use('/admin', adminRoutes);  // Rotas de administrador

app.use('/api', userRoutes);  // Usa as rotas com a base '/api'


// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
