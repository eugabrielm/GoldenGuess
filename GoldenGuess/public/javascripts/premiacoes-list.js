// premiacoes-list.js

// Variáveis globais para paginação e atividade do usuário
let todasPremiacoes = [];
let ordemCrescente = true;
let currentPage = 1;
const itemsPerPage = 5;
let usuarioAtividade = { palpites: [], votos: [] }; // armazenará a atividade do usuário

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

// --- Carrega atividade do usuário e as premiações ---
function carregarPremiacoes() {
  const usuarioId = localStorage.getItem('usuario_id');

  Promise.all([
    fetch(`http://localhost:3000/user/atividade/${usuarioId}`)
      .then(res => res.json())
      .catch(() => ({ palpites: [], votos: [] })),
    fetch('http://localhost:3000/user/premiacoes')
      .then(response => response.json())
  ])
    .then(([atividade, premiacoes]) => {
      usuarioAtividade = atividade; // armazena a atividade para uso na renderização
      todasPremiacoes = premiacoes;
      currentPage = 1; // Sempre inicia na primeira página ao carregar novos dados
      aplicarFiltros();
    })
    .catch(error => console.error('Erro ao carregar premiações:', error));
}

// --- Filtragem, ordenação e renderização ---
function aplicarFiltros() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const phaseValue = document.getElementById('phase-filter').value;
  const sortValue = document.getElementById('sort-filter').value;

  let filtrados = [...todasPremiacoes];

  // Filtra por fase
  if (phaseValue !== 'all') {
    filtrados = filtrados.filter(p => p.fase === phaseValue);
  }
  // Filtra pela busca
  if (searchTerm.trim() !== '') {
    filtrados = filtrados.filter(p => p.nome.toLowerCase().includes(searchTerm));
  }
  // Ordena conforme o critério selecionado
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

    // Associa o clique de acordo com a fase e verifica se a ação já foi realizada
    if (premiacao.fase === 'palpites') {
      const jaPalpitou = usuarioAtividade.palpites.some(p => Number(p.id) === premiacao.id);
      if (jaPalpitou) {
        item.classList.add('disabled');
        item.title = "Você já enviou seus palpites para esta premiação.";
      } else {
        item.addEventListener('click', () => mostrarFormularioPrimeiraFase(premiacao));
      }
    } else if (premiacao.fase === 'votacao') {
      const jaVotou = usuarioAtividade.votos.some(v => Number(v.id) === premiacao.id);
      if (jaVotou) {
        item.classList.add('disabled');
        item.title = "Você já votou nesta premiação.";
      } else {
        item.addEventListener('click', () => mostrarFormularioSegundaFase(premiacao));
      }
    } else if (premiacao.fase === 'concluido') {
      item.addEventListener('click', () => mostrarFormularioTerceiraFase(premiacao));
    }

    container.appendChild(item);
  });

  renderPaginationControls(totalPages);
}

function renderPaginationControls(totalPages) {
  let paginationContainer = document.getElementById('pagination-controls');

  // Se não existir o container de paginação, crie-o e insira após a lista
  if (!paginationContainer) {
    paginationContainer = document.createElement('div');
    paginationContainer.id = 'pagination-controls';
    paginationContainer.style.textAlign = 'center';
    paginationContainer.style.marginTop = '20px';
    document.querySelector('.list-container').appendChild(paginationContainer);
  }

  paginationContainer.innerHTML = '';

  if (totalPages <= 1) return; // Não exibe controles se houver somente uma página

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

// Inicia o carregamento das premiações ao carregar a página
window.onload = carregarPremiacoes;

/* ============================================================= */
/*            FUNÇÕES DOS POP-UPS (FORMULÁRIOS)                */
/* ============================================================= */

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
        <div id="categorias-container" class="hidden"></div>
        <button type="submit" class="btn-salvar">Salvar Premiação</button>
      </form>
    </div>
  `;

  popupOverlay.classList.add('active');

  // Exibe as categorias e indicados (caso haja endpoint implementado)
  const categoriasContainer = document.getElementById('categorias-container');
  if (premiacao.id) {
    categoriasContainer.classList.remove('hidden');
    carregarCategoriasEIndicados(premiacao.id);
  } else {
    categoriasContainer.classList.add('hidden');
    categoriasContainer.innerHTML = '';
  }

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
        <div id="categorias-vencedores-container" class="hidden"></div>
        <button type="submit" class="btn-salvar">Salvar Premiação</button>
      </form>
    </div>
  `;

  popupOverlay.classList.add('active');

  const categoriasContainer = document.getElementById('categorias-vencedores-container');
  if (premiacao.id) {
    categoriasContainer.classList.remove('hidden');
    carregarCategoriasEVencedores(premiacao.id);
  } else {
    categoriasContainer.classList.add('hidden');
    categoriasContainer.innerHTML = '';
  }

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

/* ============================================================= */
/*                FUNÇÕES AUXILIARES (Ex.: chamadas de API)     */
/* ============================================================= */

async function carregarCategoriasEIndicados(premiacaoId) {
  const categoriasContainer = document.getElementById('categorias-container');
  categoriasContainer.innerHTML = 'Carregando categorias...';

  try {
    const responseCategorias = await fetch(`http://localhost:3000/user/categorias/${premiacaoId}`);
    if (!responseCategorias.ok) {
      throw new Error('Erro ao buscar categorias');
    }
    const categorias = await responseCategorias.json();

    let categoriasHTML = '';
    categorias.forEach(categoria => {
      categoriasHTML += `
        <div class="categoria-container">
          <h4>${categoria.nome}</h4>
          <div class="indicados-container">
            ${Array.from({ length: categoria.max_nomeados }, (_, i) => `
              <div class="input-container">
                <label>Indicado ${i + 1}:</label>
                <input type="text" class="indicado-input" data-categoria-id="${categoria.id}" placeholder="Digite o nome do indicado ${i + 1}" required>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    categoriasContainer.innerHTML = categoriasHTML;
    restaurarEstadoInputs();
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
    categoriasContainer.innerHTML = 'Erro ao carregar categorias.';
  }
}

async function carregarCategoriasEVencedores(premiacaoId) {
  const categoriasContainer = document.getElementById('categorias-vencedores-container');
  categoriasContainer.innerHTML = 'Carregando categorias e indicados...';

  try {
    const responseCategorias = await fetch(`http://localhost:3000/admin/buscar-categorias?premiacaoId=${premiacaoId}`);
    if (!responseCategorias.ok) {
      throw new Error('Erro ao buscar categorias');
    }
    const categorias = await responseCategorias.json();

    let categoriasHTML = '';
    for (const categoria of categorias) {
      const responseIndicados = await fetch(`http://localhost:3000/admin/buscar-indicados?categoriaId=${categoria.id}`);
      if (!responseIndicados.ok) {
        throw new Error('Erro ao buscar indicados');
      }
      const indicados = await responseIndicados.json();

      categoriasHTML += `
        <div class="categoria-vencedores">
          <h4 data-categoria-id="${categoria.id}">${categoria.nome}</h4>
          <div class="indicados-container">
            ${indicados.map(indicado => `
              <label class="indicado-item">
                <input type="radio" name="vencedor-${categoria.id}" value="${indicado.id}">
                <span>${indicado.nome}</span>
              </label>
            `).join('')}
          </div>
        </div>
      `;
    }

    categoriasContainer.innerHTML = categoriasHTML;
  } catch (error) {
    console.error('Erro ao carregar categorias e indicados:', error);
    categoriasContainer.innerHTML = 'Erro ao carregar categorias e indicados.';
  }
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

async function salvarPalpites(event) {
  event.preventDefault();

  const premiacaoId = document.querySelector('.h3-form').dataset.premiacaoId;
  const usuarioId = localStorage.getItem('usuario_id');

  if (!usuarioId) {
    alert('Usuário não está logado. Faça login para salvar palpites.');
    return;
  }

  const categoriasContainers = document.querySelectorAll('.categoria-container');

  if (categoriasContainers.length === 0) {
    alert('Nenhuma categoria encontrada.');
    return;
  }

  const requests = [];

  categoriasContainers.forEach(categoriaContainer => {
    const categoriaId = categoriaContainer.querySelector('.indicado-input').dataset.categoriaId;
    const palpites = Array.from(categoriaContainer.querySelectorAll('.indicado-input'))
      .map(input => input.value.trim())
      .filter(palpite => palpite !== '');

    if (palpites.length > 0) {
      const data = {
        usuario_id: usuarioId,
        categoria_id: categoriaId,
        premiacao_id: premiacaoId,
        palpites
      };

      requests.push(
        fetch('http://localhost:3000/user/palpite', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
          .then(response => response.json())
          .then(responseData => {
            console.log(responseData);
            return responseData;
          })
          .catch(error => {
            console.error('Erro ao salvar palpites:', error);
            return { error: 'Erro ao salvar palpites.' };
          })
      );
    }
  });

  if (requests.length === 0) {
    alert('Preencha pelo menos um palpite antes de salvar.');
    return;
  }

  try {
    const results = await Promise.all(requests);
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      alert('Alguns palpites não foram salvos. Possivelmente você já enviou palpites para esta premiação.');
    } else {
      alert('Todos os palpites foram salvos com sucesso!');
      fecharPopup();
      carregarPremiacoes();
    }
  } catch (error) {
    console.error('Erro ao enviar palpites:', error);
    alert('Erro ao salvar os palpites.');
  }
}

function salvarVoto(event) {
  event.preventDefault();

  const premiacaoId = document.querySelector('.h3-form').dataset.premiacaoId;
  const usuarioId = localStorage.getItem('usuario_id');

  if (!usuarioId) {
    alert('Usuário não está logado. Faça login para salvar votos.');
    return;
  }

  const categoriasContainer = document.getElementById('categorias-vencedores-container');
  const categorias = categoriasContainer.querySelectorAll('.categoria-vencedores');

  let votosSalvos = 0;
  let totalCategorias = categorias.length;

  categorias.forEach(categoria => {
    const categoriaId = categoria.querySelector('h4').dataset.categoriaId;
    const vencedorSelecionado = categoria.querySelector('input[type="radio"]:checked');

    if (!vencedorSelecionado) {
      alert(`Selecione um vencedor para a categoria: ${categoria.querySelector('h4').textContent}`);
      return;
    }

    const nomeadoId = vencedorSelecionado.value;

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
        votosSalvos++;

        if (votosSalvos === totalCategorias) {
          fecharPopup();
          carregarPremiacoes();
        }
      })
      .catch(err => {
        console.error('Erro ao salvar voto:', err);
        alert('Erro ao salvar voto. Tente novamente.');
      });
  });
}

function restaurarEstadoInputs() {
  const estadoSalvo = localStorage.getItem('estadoIndicados');
  if (!estadoSalvo) return;

  const estado = JSON.parse(estadoSalvo);
  document.querySelectorAll('.indicado-input').forEach(input => {
    const categoriaId = input.dataset.categoriaId;
    if (estado[categoriaId]) {
      input.value = estado[categoriaId].shift() || "";
    }
  });
}

function salvarEstadoInputs() {
  const inputs = document.querySelectorAll('.indicado-input');
  const estado = {};

  inputs.forEach(input => {
    const categoriaId = input.dataset.categoriaId;
    if (!estado[categoriaId]) {
      estado[categoriaId] = [];
    }
    estado[categoriaId].push(input.value);
  });

  localStorage.setItem('estadoIndicados', JSON.stringify(estado));
}

// Salva o estado dos inputs conforme o usuário digita
document.addEventListener('input', (event) => {
  if (event.target.classList.contains('indicado-input')) {
    salvarEstadoInputs();
  }
});
