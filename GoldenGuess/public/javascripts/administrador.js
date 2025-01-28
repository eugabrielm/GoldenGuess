function mostrarFormularioPrimeiraFase() {
  let popupOverlay = document.getElementById('popup-overlay');
  if (!popupOverlay) {
    popupOverlay = document.createElement('div');
    popupOverlay.id = 'popup-overlay';
    popupOverlay.className = 'popup-overlay';
    document.body.appendChild(popupOverlay);
  }

  popupOverlay.innerHTML = `
    <div class="popup-content">
      <button class="popup-close" onclick="fecharPopup()">X</button>
      <form id="primeira-fase-form">
          <h3>Nova Premiação - Primeira Fase</h3>
          <div class="input-container">
              <label for="premiacao-nome">Nome da Premiação:</label>
              <input type="text" id="premiacao-nome" placeholder="Nome da premiação" required>
          </div>
          <div class="input-container">
              <label for="premiacao-descricao">Descrição da Premiação:</label>
              <input type="text" id="premiacao-descricao" placeholder="Descrição da premiação" required>
          </div>
          <div id="categorias-container">
              <div class="input-container categoria">
                  <label>Categoria 1:</label>
                  <input type="text" name="categoria[]" placeholder="Nome da categoria" required>
                  <button type="button" class="btn-excluir-1" onclick="excluirCategoria(this)"><i class="fas fa-trash"></i></button>
              </div>
          </div>
          <button type="button" id="adicionar-categoria" class="btn">+ Adicionar Categoria</button>
          <button type="submit" class="btn">Salvar Premiação</button>
          <button type="button" class="btn btn-excluir" onclick="excluirPremiacao()"><i class="fas fa-trash"></i></button>
      </form>
    </div>
  `;

  popupOverlay.classList.add('active');

  const btnAdicionarCategoria = document.getElementById('adicionar-categoria');
  btnAdicionarCategoria.addEventListener('click', adicionarCategoria);

  const form = document.getElementById('primeira-fase-form');
  form.addEventListener('submit', salvarPremiacao);
}

function fecharPopup() {
  const popupOverlay = document.getElementById('popup-overlay');
  if (popupOverlay) {
    popupOverlay.classList.remove('active');
    setTimeout(() => popupOverlay.remove(), 300);
  }
}

function mostrarFormularioSegundaFase() {
  let popupOverlay = document.getElementById('popup-overlay');
  if (!popupOverlay) {
    popupOverlay = document.createElement('div');
    popupOverlay.id = 'popup-overlay';
    popupOverlay.className = 'popup-overlay';
    document.body.appendChild(popupOverlay);
  }

  popupOverlay.innerHTML = `
    <div class="popup-content">
      <button class="popup-close" onclick="fecharPopup()">X</button>
      <form id="segunda-fase-form">
          <h3>Nova Premiação - Segunda Fase</h3>
          <div class="input-container">
              <label for="premiacao-nome">Nome da Premiação:</label>
              <input type="text" id="premiacao-nome" placeholder="Nome da premiação" required>
          </div>
          <div class="input-container">
              <label for="premiacao-descricao">Descrição da Premiação:</label>
              <input type="text" id="premiacao-descricao" placeholder="Descrição da premiação" required>
          </div>
          <div id="categorias-container">
              <div class="input-container categoria">
                  <label>Categoria 1:</label>
                  <input type="text" name="categoria[]" placeholder="Nome da categoria" required>
                  <button type="button" class="btn-excluir-1" onclick="excluirCategoria(this)"><i class="fas fa-trash"></i></button>
                  <div class="indicados-container"></div> <!-- Contêiner vazio para indicados -->
                  <button type="button" class="btn" onclick="adicionarIndicado(this)">+ Adicionar Indicado</button>
              </div>
          </div>
          <button type="button" id="adicionar-categoria" class="btn">+ Adicionar Categoria</button>
          <button type="submit" class="btn">Salvar Premiação</button>
          <button type="button" class="btn" onclick="excluirPremiacao()">Excluir Premiação</button>
      </form>
    </div>
  `;

  popupOverlay.classList.add('active');

  const btnAdicionarCategoria = document.getElementById('adicionar-categoria');
  btnAdicionarCategoria.addEventListener('click', adicionarCategoriaComIndicado);

  const form = document.getElementById('segunda-fase-form');
  form.addEventListener('submit', salvarPremiacaoSegundaFase);
}

function adicionarCategoria() {
  const categoriasContainer = document.getElementById('categorias-container');
  const totalCategorias = categoriasContainer.getElementsByClassName('categoria').length + 1;

  const novaCategoria = document.createElement('div');
  novaCategoria.classList.add('input-container', 'categoria');
  novaCategoria.innerHTML = `
      <label>Categoria ${totalCategorias}:</label>
      <input type="text" name="categoria[]" placeholder="Digite o nome da categoria" required>
      <button type="button" class="btn-excluir-1" onclick="excluirCategoria(this)"><i class="fas fa-trash"></i></button>
  `;
  categoriasContainer.appendChild(novaCategoria);
}

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

function adicionarIndicado(button) {
  const categoria = button.parentElement;
  let indicadosContainer = categoria.querySelector('.indicados-container');


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
  <input type="text" name="nomeado[]" placeholder="Digite o nome do indicado" required>
  <button type="button" class="btn-excluir" onclick="excluirIndicado(this)">Excluir Indicado</button>
`;

  indicadosContainer.appendChild(novoIndicado);

  renumerarIndicados(categoria);
}

function excluirIndicado(button) {
  const indicado = button.parentElement;
  const categoria = indicado.closest('.categoria');
  indicado.remove();

  renumerarIndicados(categoria);
}

function renumerarIndicados(categoria) {
  const indicados = categoria.querySelectorAll('.indicados-container .input-container');
  indicados.forEach((indicado, index) => {
    const label = indicado.querySelector('label');
    label.textContent = `Indicado ${index + 1}:`;
  });
}

function excluirCategoria(button) {
  const categoria = button.parentElement;
  categoria.remove();

  renumerarCategorias();
}

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

  const data = { nome: nomePremiacao, descricao: descricaoPremiacao, categorias };

  fetch('/admin/salvar-premiacao-primeira-fase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      fecharPopup();
    })
    .catch(error => {
      console.error(error);
      alert('Erro ao salvar a premiação.');
    });
}

function salvarPremiacaoSegundaFase(event) {
  event.preventDefault();

  const nomePremiacao = document.getElementById('premiacao-nome').value;
  const descricaoPremiacao = document.getElementById('premiacao-descricao').value;

  const categorias = Array.from(document.getElementsByClassName('categoria')).map(categoria => {
    const nome = categoria.querySelector('input[name="categoria[]"]').value;
    const nomeados = Array.from(categoria.querySelectorAll('input[name="nomeado[]"]')).map(input => input.value.trim());
    return { nome: nome.trim(), nomeados };
  });

  // Validações
  if (!nomePremiacao.trim()) {
    alert('O nome da premiação é obrigatório.');
    return;
  }

  if (categorias.length === 0) {
    alert('É necessário cadastrar pelo menos uma categoria.');
    return;
  }

  for (const categoria of categorias) {
    if (!categoria.nome) {
      alert('O nome de todas as categorias é obrigatório.');
      return;
    }

    if (categoria.nomeados.length === 0 || categoria.nomeados.some(nomeado => !nomeado)) {
      alert(`Todos os nomeados na categoria "${categoria.nome}" devem ser preenchidos.`);
      return;
    }
  }

  const data = { nome: nomePremiacao.trim(), descricao: descricaoPremiacao.trim(), categorias };
  console.log(data);
  fetch('/admin/salvar-premiacao-segunda-fase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      fecharPopup();
    })
    .catch(error => {
      console.error(error);
      alert('Erro ao salvar a premiação.');
    });
}
