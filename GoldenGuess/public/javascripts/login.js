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
      localStorage.setItem('usuario_id', data.usuario_id);
      if (data.tipo_usuario === 'admin') {
        window.location.href = 'administrador.html';
      } else {
        window.location.href = 'principal.html';
      }
    } else {
        mostrarPopup(data.message || 'Erro desconhecido');
    }
  });
});
  
function mostrarPopup(mensagem) {
  const popup = document.getElementById("popup-mensagem");
  const textoPopup = document.getElementById("popup-texto");
  const overlay = document.getElementById("popup-overlay");

  textoPopup.textContent = mensagem;
  popup.style.display = "block";  
  overlay.style.display = "block";
}

function fecharPopup() {
  document.getElementById("popup-mensagem").style.display = "none";
  document.getElementById("popup-overlay").style.display = "none";
}
