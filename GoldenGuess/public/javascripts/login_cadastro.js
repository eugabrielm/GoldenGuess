// Referências aos botões e formulários
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

// Função para alternar entre os formulários
function toggleForms(isLogin) {
    if (isLogin) {
        loginBtn.classList.add('active');
        registerBtn.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    } else {
        registerBtn.classList.add('active');
        loginBtn.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    }
}

// Listeners para alternar entre Login e Cadastro
loginBtn.addEventListener('click', () => toggleForms(true));
registerBtn.addEventListener('click', () => toggleForms(false));

// Adicionando o listener de submit para o cadastro
registerForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Impede o envio padrão do formulário

    // Coleta os valores dos campos do formulário
    const nome = document.getElementById('register-nome').value;
    const cpf = document.getElementById('register-cpf').value;
    const email = document.getElementById('register-email').value;
    const data_nascimento = document.getElementById('register-data-nascimento').value;
    const senha = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    // Verificação simples para garantir que a senha e a confirmação de senha coincidem
    if (senha !== confirmPassword) {
        alert("As senhas não coincidem!");
        return;
    }

    // Envia os dados para o backend
    const response = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            nome,
            cpf,
            email,
            data_nascimento,
            senha,
            confirmPassword
        }),
    });

    const data = await response.json();

    // Exibe o resultado para o usuário
    if (response.ok) {
        alert(data.message);
        registerForm.reset(); // Limpa o formulário
    } else {
        alert(data.message || 'Erro desconhecido');
    }
});
