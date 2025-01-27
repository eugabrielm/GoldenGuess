const registerForm = document.getElementById('register-form');

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const nome = document.getElementById('register-nome').value;
    const cpf = document.getElementById('register-cpf').value;
    const email = document.getElementById('register-email').value;
    const data_nascimento = document.getElementById('register-data-nascimento').value;
    const senha = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (senha !== confirmPassword) {
        alert("As senhas não coincidem!");
        return;
    }

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

    if (response.ok) {
        alert(data.message);
        registerForm.reset(); 
    } else {
        alert(data.message || 'Erro desconhecido');
    }
});