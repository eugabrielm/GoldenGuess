document.addEventListener('DOMContentLoaded', () => {
  carregarPremiacoes();

  const searchInput = document.getElementById('search-input');
  const phaseFilter = document.getElementById('phase-filter');
  const sortFilter = document.getElementById('sort-filter');
  const orderButton = document.getElementById('order-button');

  searchInput.addEventListener('input', aplicarFiltros);
  phaseFilter.addEventListener('change', aplicarFiltros);
  sortFilter.addEventListener('change', aplicarFiltros);
  orderButton.addEventListener('click', alternarOrdem);
});

let todasPremiacoes = [];
let ordemCrescente = true;

function carregarPremiacoes() {
  fetch('http://localhost:3000/user/premiacoes')
    .then(response => response.json())
    .then(premiacoes => {
      todasPremiacoes = premiacoes;
      aplicarFiltros();
    })
    .catch(error => console.error('Erro ao carregar premiações:', error));
}

function aplicarFiltros() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const phaseValue = document.getElementById('phase-filter').value;
  const sortValue = document.getElementById('sort-filter').value;

  let filtrados = [...todasPremiacoes];

  if (phaseValue !== 'all') {
    filtrados = filtrados.filter(p => p.fase === phaseValue);
  }
  if (searchTerm.trim() !== '') {
    filtrados = filtrados.filter(p => p.nome.toLowerCase().includes(searchTerm));
  }

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
  document.getElementById('order-button').textContent = ordemCrescente ? '⬆ Crescente' : '⬇ Decrescente';
  aplicarFiltros();
}

function renderPremiacoes(premiacoes) {
  const container = document.getElementById('premiacoes-list');
  container.innerHTML = '';

  if (premiacoes.length === 0) {
    container.innerHTML = '<p>Nenhuma premiação encontrada.</p>';
    return;
  }

  premiacoes.forEach(premiacao => {
    const item = document.createElement('div');
    item.classList.add('premiacao-item');

    let imgSrc = 'imagens/default.jpg';
    if (premiacao.fase === 'palpites') imgSrc = 'imagens/fundo.jpg';
    else if (premiacao.fase === 'votacao') imgSrc = 'imagens/ft.jpg';
    else if (premiacao.fase === 'concluido') imgSrc = 'imagens/FernandaTorres.jpg';

    item.innerHTML = `
      <img src="${imgSrc}" alt="${premiacao.nome}">
      <div class="premiacao-info">
        <h4>${premiacao.nome}</h4>
        <p>Fase: ${premiacao.fase.charAt(0).toUpperCase() + premiacao.fase.slice(1)}</p>
        <p>Criado em: ${new Date(premiacao.created_at).toLocaleDateString('pt-BR')}</p>
      </div>
    `;

    item.addEventListener('click', () => exibirPopupPremiacao(premiacao));
    container.appendChild(item);
  });
}

function exibirPopupPremiacao(premiacao) {
  const popupOverlay = document.getElementById('popup-overlay');
  const popupContent = document.getElementById('popup-content');
  
  popupContent.innerHTML = `
    <button class="popup-close" onclick="fecharPopup()">X</button>
    <h2>${premiacao.nome}</h2>
    <p><strong>Fase:</strong> ${premiacao.fase.charAt(0).toUpperCase() + premiacao.fase.slice(1)}</p>
    <p><strong>Descrição:</strong> ${premiacao.descricao ? premiacao.descricao : 'Sem descrição.'}</p>
    <p><strong>Criado em:</strong> ${new Date(premiacao.created_at).toLocaleString('pt-BR')}</p>
  `;
  
  popupOverlay.classList.add('active');
}

function fecharPopup() {
  document.getElementById('popup-overlay').classList.remove('active');
}
