const registerForm = document.getElementById('register-form');

registerForm.addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const nome = document.getElementById('register-nome').value;
    const cpf = document.getElementById('register-cpf').value;
    const email = document.getElementById('register-email').value;
    const data_nascimento = document.getElementById('register-data-nascimento').value;
    const senha = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!nome || !cpf || !email || !data_nascimento || !senha || !confirmPassword) {
        mostrarPopup("Preencha todos os campos.");
        return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        mostrarPopup("Por favor, insira um email válido.");
        return;
    }

    if (senha !== confirmPassword) {
        mostrarPopup("As senhas não coincidem!");
        return;
    }

    if (!validarCPF(cpf)) {
        mostrarPopup("CPF inválido.");
        return;
    }

    if (!validarSenha(senha)) {
        mostrarPopup("A senha não atende aos requisitos.");
        return;
    }

    try {
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
            mostrarPopup(data.message);
            registerForm.reset();
        } else {
            mostrarPopup(data.message || 'Erro desconhecido');
        }
    } catch (error) {
        mostrarPopup("Erro ao conectar com o servidor.");
    }
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

function mascaraCPF(cpf) {
    return cpf.replace(/\D/g, "") 
              .replace(/(\d{3})(\d)/, "$1.$2")
              .replace(/(\d{3})(\d)/, "$1.$2")
              .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

document.getElementById("register-cpf").addEventListener("input", function(e) {
    e.target.value = mascaraCPF(e.target.value);
});

function validarCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, ''); 
    if (cpf.length > 11) return false;
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
}

function validarSenha(senha) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8}$/;
    return regex.test(senha);
}

document.getElementById("register-password").addEventListener("input", function () {
    const senha = this.value;
    const helper = document.getElementById("password-helper");

    if (validarSenha(senha)) {
        helper.classList.remove("password-error");
    } else {
        helper.classList.add("password-error");
    }
});
