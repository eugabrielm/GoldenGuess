document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
  
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      
      const email = document.getElementById('login-username').value;
      const senha = document.getElementById('login-password').value;
  
      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        if (data.tipo_usuario === 'admin') {
          window.location.href = 'administrador.html';
        } else {
          window.location.href = 'principal.html';
        }
      } else {
        alert(data.message || 'Erro desconhecido');
      }
    });
  });
  