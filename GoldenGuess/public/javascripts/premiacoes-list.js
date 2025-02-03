// Variáveis globais para paginação
let todasPremiacoes = [];
let ordemCrescente = true;
let currentPage = 1;
const itemsPerPage = 5;

// Verifica se o usuário está logado
document.addEventListener('DOMContentLoaded', () => {
  const usuarioId = localStorage.getItem('usuario_id');
  if (!usuarioId) {
    window.location.href = 'login.html';
    return;
  }

  // Eventos dos filtros, do botão de ordenação e da paginação
  document.getElementById('search-input').addEventListener('input', () => {
    currentPage = 1;
    aplicarFiltros();
  });
  document.getElementById('phase-filter').addEventListener('change', () => {
    currentPage = 1;
    aplicarFiltros();
  });
  document.getElementById('sort-filter').addEventListener('change', () => {
    currentPage = 1;
    aplicarFiltros();
  });
  document.getElementById('toggle-order').addEventListener('click', alternarOrdem);

  carregarPremiacoes();
});

// FUNÇÕES DE FILTRAGEM, ORDENAÇÃO E RENDERIZAÇÃO

function carregarPremiacoes() {
  fetch('http://localhost:3000/user/premiacoes')
    .then(response => response.json())
    .then(premiacoes => {
      todasPremiacoes = premiacoes;
      currentPage = 1; // Sempre inicia na primeira página ao carregar novos dados
      aplicarFiltros();
    })
    .catch(error => console.error('Erro ao carregar premiações:', error));
}

function aplicarFiltros() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const phaseValue = document.getElementById('phase-filter').value;
  const sortValue = document.getElementById('sort-filter').value;

  let filtrados = [...todasPremiacoes];

  // Filtro por fase
  if (phaseValue !== 'all') {
    filtrados = filtrados.filter(p => p.fase === phaseValue);
  }
  // Filtro por busca
  if (searchTerm.trim() !== '') {
    filtrados = filtrados.filter(p => p.nome.toLowerCase().includes(searchTerm));
  }
  // Ordenação
  filtrados.sort((a, b) => {
    let resultado;
    if (sortValue === 'created_at') {
      resultado = new Date(a.created_at) - new Date(b.created_at);
    } else if (sortValue === 'nome') {
      resultado = a.nome.localeCompare(b.nome);
    }
    return ordemCrescente ? resultado : -resultado;
  });

  renderPremiacoes(filtrados);
}

function alternarOrdem() {
  ordemCrescente = !ordemCrescente;
  const btn = document.getElementById('toggle-order');
  btn.textContent = ordemCrescente ? '⬆ Crescente' : '⬇ Decrescente';
  aplicarFiltros();
}



function renderPremiacoes(premiacoes) {
  const container = document.getElementById('premiacoes-list');
  container.innerHTML = '';

  if (premiacoes.length === 0) {
    container.innerHTML = '<p>Nenhuma premiação encontrada.</p>';
    renderPaginationControls(0);
    return;
  }
 
  // Paginação: calcula total de páginas e o slice para a página atual
  const totalPages = Math.ceil(premiacoes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = premiacoes.slice(startIndex, startIndex + itemsPerPage);

  currentItems.forEach(premiacao => {
    const item = document.createElement('div');
    item.classList.add('premiacao-item');

    // Define a imagem conforme a fase
    let imgSrc = '';
    if (premiacao.fase === 'palpites') {
      imgSrc = 'imagens/fundo.jpg';
    } else if (premiacao.fase === 'votacao') {
      imgSrc = 'imagens/ft.jpg';
    } else if (premiacao.fase === 'concluido') {
      imgSrc = 'imagens/FernandaTorres.jpg';
    }

    item.innerHTML = `
      <img src="${imgSrc}" alt="${premiacao.nome}">
      <div class="premiacao-info">
        <h4>${premiacao.nome}</h4>
        <p>Fase: ${premiacao.fase.charAt(0).toUpperCase() + premiacao.fase.slice(1)}</p>
        <p>Criado em: ${new Date(premiacao.created_at).toLocaleDateString('pt-BR')}</p>
      </div>
    `;

    // Atribui a ação de clique conforme a fase da premiação
    if (premiacao.fase === 'palpites') {
      item.addEventListener('click', () => mostrarFormularioPrimeiraFase(premiacao));
    } else if (premiacao.fase === 'votacao') {
      item.addEventListener('click', () => mostrarFormularioSegundaFase(premiacao));
    } else if (premiacao.fase === 'concluido') {
      item.addEventListener('click', () => mostrarFormularioTerceiraFase(premiacao));
    }

    container.appendChild(item);
  });

  renderPaginationControls(totalPages);
}

function renderPaginationControls(totalPages) {
  let paginationContainer = document.getElementById('pagination-controls');

  // Se não existir o container de paginação, crie e insira após a lista
  if (!paginationContainer) {
    paginationContainer = document.createElement('div');
    paginationContainer.id = 'pagination-controls';
    paginationContainer.style.textAlign = 'center';
    paginationContainer.style.marginTop = '20px';
    document.querySelector('.list-container').appendChild(paginationContainer);
  }

  paginationContainer.innerHTML = '';

  if (totalPages <= 1) return; // Não exibe controles se só houver uma página

  // Botão "Anterior"
  const prevBtn = document.createElement('button');
  prevBtn.textContent = 'Anterior';
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      aplicarFiltros();
    }
  });
  paginationContainer.appendChild(prevBtn);

  // Exibe a página atual e total
  const pageInfo = document.createElement('span');
  pageInfo.style.margin = '0 10px';
  pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
  paginationContainer.appendChild(pageInfo);

  // Botão "Próximo"
  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Próximo';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      aplicarFiltros();
    }
  });
  paginationContainer.appendChild(nextBtn);
}

// FUNÇÕES DE POP-UP (FORMULÁRIOS) – MESMA LÓGICA DA TELA PRINCIPAL

function mostrarFormularioPrimeiraFase(premiacao) {
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
        <h3 class="h3-form" data-premiacao-id="${premiacao.id}">${premiacao.nome}</h3>
        <div class="categorias-container">
          <label for="premiacao-descricao">Escolha a categoria:</label>
          <select class="form-select" aria-label="Default select example">
            <option selected>Escolha a categoria</option>
          </select>
          <div id="palpites-container"></div>
        </div>
        <button type="submit" class="btn-salvar">Salvar Premiação</button>
      </form>
    </div>
  `;

  popupOverlay.classList.add('active');
  carregarCategorias(premiacao.id);

  const form = document.getElementById('primeira-fase-form');
  form.addEventListener('submit', salvarPalpites);
}

function mostrarFormularioSegundaFase(premiacao) {
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
        <h3 class="h3-form" data-premiacao-id="${premiacao.id}">${premiacao.nome}</h3>
        <div class="categorias-container">
          <label for="categoria-select">Categorias:</label>
          <select class="form-select" aria-label="Categoria" id="categoria-select">
            <option selected>Escolha a categoria</option>
          </select>
        </div>
        <div class="nomeados-container" id="nomeados-container"></div>
        <button type="submit" class="btn-salvar">Salvar Premiação</button>
      </form>
    </div>
  `;

  popupOverlay.classList.add('active');
  carregarCategoriasVotacao(premiacao.id);

  const categoriaSelect = document.getElementById('categoria-select');
  categoriaSelect.addEventListener('change', function() {
    const categoriaId = categoriaSelect.value;
    if (categoriaId) {
      carregarNomeados(categoriaId, premiacao.id);
    }
  });

  const form = document.getElementById('segunda-fase-form');
  form.addEventListener('submit', salvarVoto);
}

function mostrarFormularioTerceiraFase(premiacao) {
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
      <h2 class="popup-title">${premiacao.nome} - Resultado Final</h2>
      <div class="categorias-container">
        <label for="categoria-select">Selecione a categoria:</label>
        <select class="form-select" aria-label="Categoria" id="categoria-select">
          <option selected disabled>Escolha a categoria</option>
        </select>
      </div>
      <div class="nomeados-container" id="nomeados-container">
        <!-- Os cards dos indicados serão carregados aqui -->
      </div>
    </div>
  `;

  popupOverlay.classList.add('active');
  carregarCategoriasConcluido(premiacao.id);

  const categoriaSelect = document.getElementById('categoria-select');
  categoriaSelect.addEventListener('change', function() {
    const categoriaId = categoriaSelect.value;
    if (categoriaId) {
      carregarNomeadosConcluido(categoriaId, premiacao.id);
    }
  });
}

function fecharPopup() {
  const popupOverlay = document.getElementById('popup-overlay');
  if (popupOverlay) {
    popupOverlay.classList.remove('active');
    setTimeout(() => popupOverlay.remove(), 300);
  }
}

// FUNÇÕES AUXILIARES PARA CARREGAR DADOS

function carregarCategorias(premiacaoId) {
  const selectElement = document.querySelector('.form-select');
  selectElement.innerHTML = '<option selected>Escolha a categoria</option>';

  fetch(`http://localhost:3000/user/categorias/${premiacaoId}`)
    .then(response => response.json())
    .then(categorias => {
      categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.id;
        option.textContent = categoria.nome;
        option.dataset.maxNomeados = categoria.max_nomeados;
        selectElement.appendChild(option);
      });

      selectElement.addEventListener('change', (event) => {
        const selectedOption = event.target.selectedOptions[0];
        const maxNomeados = selectedOption.dataset.maxNomeados;
        carregarInputsPalpites(maxNomeados);
      });
    })
    .catch(error => console.error('Erro ao carregar categorias:', error));
}

function carregarCategoriasVotacao(premiacaoId) {
  const categoriaSelect = document.getElementById('categoria-select');

  fetch(`http://localhost:3000/user/categorias/${premiacaoId}`)
    .then(response => response.json())
    .then(categorias => {
      categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.id;
        option.textContent = categoria.nome;
        categoriaSelect.appendChild(option);
      });
    })
    .catch(err => console.error('Erro ao carregar categorias:', err));
}

function carregarCategoriasConcluido(premiacaoId) {
  const categoriaSelect = document.getElementById('categoria-select');
  categoriaSelect.innerHTML = '<option selected>Escolha a categoria</option>';
  
  fetch(`http://localhost:3000/user/categorias/${premiacaoId}`)
    .then(response => response.json())
    .then(categorias => {
      categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.id;
        option.textContent = categoria.nome;
        categoriaSelect.appendChild(option);
      });
    })
    .catch(err => console.error('Erro ao carregar categorias:', err));
}

function carregarInputsPalpites(maxNomeados) {
  const palpitesContainer = document.getElementById('palpites-container');
  palpitesContainer.innerHTML = '';

  for (let i = 1; i <= maxNomeados; i++) {
    const inputContainer = document.createElement('div');
    inputContainer.classList.add('input-container', 'categoria');

    const label = document.createElement('label');
    label.textContent = `Indicado ${i}:`;

    const input = document.createElement('input');
    input.type = 'text';
    input.name = 'palpite[]';
    input.placeholder = `Digite o nome do indicado ${i}`;
    input.required = true;

    inputContainer.appendChild(label);
    inputContainer.appendChild(input);
    palpitesContainer.appendChild(inputContainer);
  }
}

function carregarNomeados(categoriaId, premiacaoId) {
  const nomeadosContainer = document.getElementById('nomeados-container');
  nomeadosContainer.innerHTML = ''; 

  fetch(`http://localhost:3000/user/nomeados/${categoriaId}/${premiacaoId}`)
    .then(response => response.json())
    .then(nomeados => {
      nomeados.forEach(nomeado => {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'nomeados';
        checkbox.value = nomeado.id;
        checkbox.id = `nomeado-${nomeado.id}`;

        const label = document.createElement('label');
        label.htmlFor = `nomeado-${nomeado.id}`;
        label.textContent = nomeado.nome;

        nomeadosContainer.appendChild(checkbox);
        nomeadosContainer.appendChild(label);
        nomeadosContainer.appendChild(document.createElement('br'));
      });
    })
    .catch(err => console.error('Erro ao carregar nomeados:', err));
}

function carregarNomeadosConcluido(categoriaId, premiacaoId) {
  const nomeadosContainer = document.getElementById('nomeados-container');
  nomeadosContainer.innerHTML = ''; 

  fetch(`http://localhost:3000/user/nomeados/${categoriaId}/${premiacaoId}`)
    .then(response => response.json())
    .then(nomeados => {
      const cardsContainer = document.createElement('div');
      cardsContainer.classList.add('cards-container');

      nomeados.forEach(nomeado => {
        const card = document.createElement('div');
        card.classList.add('nomeado-card');
        card.textContent = nomeado.nome;

        if (Number(nomeado.ganhador) === 1) {
          card.classList.add('winner');
          const selo = document.createElement('span');
          selo.classList.add('winner-badge');
          selo.textContent = 'Vencedor';
          card.appendChild(selo);
        }
        cardsContainer.appendChild(card);
      });
      nomeadosContainer.appendChild(cardsContainer);
    })
    .catch(err => console.error('Erro ao carregar nomeados:', err));
}

// FUNÇÕES PARA SALVAR OS DADOS

function salvarPalpites(event) {
  event.preventDefault();

  const selectCategoria = document.querySelector('.form-select');
  const categoriaId = selectCategoria.value;
  const premiacaoId = document.querySelector('.h3-form').dataset.premiacaoId;
  const usuarioId = localStorage.getItem('usuario_id');

  if (!usuarioId) {
    alert('Usuário não está logado. Faça login para salvar palpites.');
    return;
  }

  const palpites = Array.from(document.querySelectorAll('input[name="palpite[]"]')).map(input => input.value.trim());

  if (!categoriaId || !premiacaoId || palpites.length === 0 || palpites.some(palpite => !palpite)) {
    alert('Todos os campos são obrigatórios!');
    return;
  }

  const data = {
    usuario_id: usuarioId,
    categoria_id: categoriaId,
    premiacao_id: premiacaoId,
    palpites: palpites
  };

  fetch('http://localhost:3000/user/palpite', {
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
      alert('Erro ao salvar os palpites.');
    });
}

function salvarVoto(event) {
  event.preventDefault();

  const categoriaSelect = document.getElementById('categoria-select');
  const categoriaId = categoriaSelect.value;
  const premiacaoId = document.querySelector('.h3-form').dataset.premiacaoId;
  const usuarioId = localStorage.getItem('usuario_id');
  const nomeadosSelecionados = Array.from(document.querySelectorAll('input[name="nomeados"]:checked'));

  nomeadosSelecionados.forEach(nomeadoCheckbox => {
    const nomeadoId = nomeadoCheckbox.value;

    fetch('http://localhost:3000/user/votos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario_id: usuarioId,
        nomeado_id: nomeadoId,
        categoria_id: categoriaId,
        premiacao_id: premiacaoId
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Voto salvo com sucesso:', data);
    })
    .catch(err => console.error('Erro ao salvar voto:', err));
  });

  fecharPopup();
}
