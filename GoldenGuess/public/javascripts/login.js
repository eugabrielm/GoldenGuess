document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
  
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault(); // Impede o envio padrão do formulário
  
      // Coleta os dados do formulário
      const email = document.getElementById('login-username').value;
      const senha = document.getElementById('login-password').value;
  
      // Envia os dados para o backend
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });
  
      const data = await response.json();
  
      // Exibe o resultado para o usuário
      if (response.ok) {
        if (data.tipo_usuario === 'admin') {
          // Redireciona para a página do admin
          window.location.href = 'administrador.html';
        } else {
          // Redireciona para a página do usuário
          window.location.href = 'principal.html';
        }
      } else {
        alert(data.message || 'Erro desconhecido');
      }
    });
  });
  