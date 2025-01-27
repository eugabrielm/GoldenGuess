// Função para exibir/esconder o menu
function menu() {
    const menu = document.getElementById('menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

// Função para exibir o formulário de primeira fase com campo extra de descrição
function mostrarFormularioPrimeiraFase() {
    const formContainer = document.getElementById('form-container');
    formContainer.innerHTML = `
        <form id="primeira-fase-form">
            <h3>Nova Premiação - Primeira Fase</h3>
            <div class="input-container">
                <label for="premiacao-nome">Nome da Premiação:</label>
                <input type="text" id="premiacao-nome" placeholder="Digite o nome da premiação" required>
            </div>
            <div class="input-container">
                <label for="premiacao-descricao">Descrição da Premiação:</label>
                <input type="text" id="premiacao-descricao" placeholder="Digite a descrição da premiação" required>
            </div>
            <div id="categorias-container">
                <div class="input-container categoria">
                    <label>Categoria 1:</label>
                    <input type="text" name="categoria[]" placeholder="Digite o nome da categoria" required>
                    <button type="button" class="btn-excluir" onclick="excluirCategoria(this)">Excluir Categoria</button>
                </div>
            </div>
            <button type="button" id="adicionar-categoria" class="btn">+ Adicionar Categoria</button>
            <button type="submit" class="btn">Salvar Premiação</button>
            <button type="button" class="btn-excluir" onclick="excluirPremiacao()">Excluir Premiação</button>
        </form>
    `;

    const btnAdicionarCategoria = document.getElementById('adicionar-categoria');
    btnAdicionarCategoria.addEventListener('click', adicionarCategoria);

    const form = document.getElementById('primeira-fase-form');
    form.addEventListener('submit', salvarPremiacao);
}

// Função para exibir o formulário de segunda fase
// Função para exibir o formulário de segunda fase sem indicados iniciais
function mostrarFormularioSegundaFase() {
    const formContainer = document.getElementById('form-container');
    formContainer.innerHTML = `
        <form id="segunda-fase-form">
            <h3>Nova Premiação - Segunda Fase</h3>
            <div class="input-container">
                <label for="premiacao-nome">Nome da Premiação:</label>
                <input type="text" id="premiacao-nome" placeholder="Digite o nome da premiação" required>
            </div>
            <div class="input-container">
                <label for="premiacao-descricao">Descrição da Premiação:</label>
                <input type="text" id="premiacao-descricao" placeholder="Digite a descrição da premiação" required>
            </div>
            <div id="categorias-container">
                <div class="input-container categoria">
                    <label>Categoria 1:</label>
                    <input type="text" name="categoria[]" placeholder="Digite o nome da categoria" required>
                    <button type="button" class="btn-excluir" onclick="excluirCategoria(this)">Excluir Categoria</button>
                    <div class="indicados-container"></div> <!-- Contêiner vazio para indicados -->
                    <button type="button" class="btn" onclick="adicionarIndicado(this)">+ Adicionar Indicado</button>
                </div>
            </div>
            <button type="button" id="adicionar-categoria" class="btn">+ Adicionar Categoria</button>
            <button type="submit" class="btn">Salvar Premiação</button>
            <button type="button" class="btn-excluir" onclick="excluirPremiacao()">Excluir Premiação</button>
        </form>
    `;

    const btnAdicionarCategoria = document.getElementById('adicionar-categoria');
    btnAdicionarCategoria.addEventListener('click', adicionarCategoriaComIndicado);

    const form = document.getElementById('segunda-fase-form');
    form.addEventListener('submit', salvarPremiacao);
}

// Função para adicionar mais categorias dinamicamente
function adicionarCategoria() {
    const categoriasContainer = document.getElementById('categorias-container');
    const totalCategorias = categoriasContainer.getElementsByClassName('categoria').length + 1;

    const novaCategoria = document.createElement('div');
    novaCategoria.classList.add('input-container', 'categoria');
    novaCategoria.innerHTML = `
        <label>Categoria ${totalCategorias}:</label>
        <input type="text" name="categoria[]" placeholder="Digite o nome da categoria" required>
        <button type="button" class="btn-excluir" onclick="excluirCategoria(this)">Excluir Categoria</button>
    `;
    categoriasContainer.appendChild(novaCategoria);
}

// Função para adicionar categoria com indicados
// Função para adicionar categoria com botão para adicionar indicados, mas sem adicionar automaticamente um indicado
function adicionarCategoriaComIndicado() {
    const categoriasContainer = document.getElementById('categorias-container');
    const totalCategorias = categoriasContainer.getElementsByClassName('categoria').length + 1;

    const novaCategoria = document.createElement('div');
    novaCategoria.classList.add('input-container', 'categoria');
    novaCategoria.innerHTML = `
        <label>Categoria ${totalCategorias}:</label>
        <input type="text" name="categoria[]" placeholder="Digite o nome da categoria" required>
        <button type="button" class="btn-excluir" onclick="excluirCategoria(this)">Excluir Categoria</button>
        <div class="indicados-container"></div> <!-- Contêiner vazio para indicados -->
        <button type="button" class="btn" onclick="adicionarIndicado(this)">+ Adicionar Indicado</button>
    `;
    categoriasContainer.appendChild(novaCategoria);
}


// Função para adicionar indicados dinamicamente
// Função para adicionar indicados dinamicamente
function adicionarIndicado(button) {
    const categoria = button.parentElement;
    let indicadosContainer = categoria.querySelector('.indicados-container');

    // Se o container de indicados não existir, criar
    if (!indicadosContainer) {
        indicadosContainer = document.createElement('div');
        indicadosContainer.classList.add('indicados-container');
        categoria.insertBefore(indicadosContainer, button);
    }

    const totalIndicados = indicadosContainer.querySelectorAll('.input-container').length + 1;

    const novoIndicado = document.createElement('div');
    novoIndicado.classList.add('input-container');
    novoIndicado.innerHTML = `
        <label>Indicado ${totalIndicados}:</label>
        <input type="text" name="indicado[]" placeholder="Digite o nome do indicado" required>
        <button type="button" class="btn-excluir" onclick="excluirIndicado(this)">Excluir Indicado</button>
    `;
    indicadosContainer.appendChild(novoIndicado);

    // Atualizar a numeração dos indicados
    renumerarIndicados(categoria);
}


// Função para excluir indicados e renumerar
// Função para excluir indicados e renumerar
function excluirIndicado(button) {
    const indicado = button.parentElement;
    const categoria = indicado.closest('.categoria');
    indicado.remove();

    // Após a remoção, renumerar os indicados restantes
    renumerarIndicados(categoria);
}


// Função para renumerar os indicados após exclusão ou adição
// Função para renumerar os indicados após exclusão ou adição
function renumerarIndicados(categoria) {
    const indicados = categoria.querySelectorAll('.indicados-container .input-container');
    indicados.forEach((indicado, index) => {
        const label = indicado.querySelector('label');
        label.textContent = `Indicado ${index + 1}:`;
    });
}

// Função para excluir categorias e renumerar as restantes
// Função para excluir categorias e renumerar as restantes
function excluirCategoria(button) {
    const categoria = button.parentElement;
    categoria.remove();

    // Após a remoção, renumerar as categorias restantes
    renumerarCategorias();
}

// Função para renumerar as categorias após exclusão
function renumerarCategorias() {
    const categorias = document.querySelectorAll('#categorias-container .categoria');
    categorias.forEach((categoria, index) => {
        const label = categoria.querySelector('label');
        label.textContent = `Categoria ${index + 1}:`;
    });
}




function salvarPremiacao(event) {
    event.preventDefault();

    const nomePremiacao = document.getElementById('premiacao-nome').value;
    const descricaoPremiacao = document.getElementById('premiacao-descricao').value;
    const categorias = Array.from(document.getElementsByName('categoria[]')).map(input => input.value);
    const nomeados = Array.from(document.getElementsByName('indicado[]')).map(input => input.value).filter(indicado => indicado.trim() !== ''); // Pega os indicados da segunda fase

    if (!nomePremiacao || !descricaoPremiacao || categorias.some(categoria => categoria.trim() === '')) {
        alert('Por favor, preencha todos os campos!');
        return;
    }

    const fase = document.querySelector('form').id === 'primeira-fase-form' ? 'palpites' : 'votacao'; // Verifica a fase
    const data = { nome: nomePremiacao, descricao: descricaoPremiacao, fase, categorias, nomeados };

    // Envia os dados para o backend
    fetch('/admin/salvar-premiacao', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    })
    .catch(error => {
        alert('Ocorreu um erro ao salvar a premiação!');
        console.error(error);
    });
}


// Função para excluir premiação
function excluirPremiacao() {
    if (confirm('Você realmente deseja excluir esta premiação?')) {
        alert('Premiação excluída com sucesso!');
        
        // Limpar o conteúdo do contêiner que contém o formulário
        const formContainer = document.getElementById('form-container');
        formContainer.innerHTML = '';
    }
}
