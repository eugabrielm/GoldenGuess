document.addEventListener('DOMContentLoaded', () => {
  const usuarioId = localStorage.getItem('usuario_id');

  if (!usuarioId) {
    window.location.href = 'login.html'; 
  }
});

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
          <div class="categorias-container" class="hidden">
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
  
}

function fecharPopup() {
  const popupOverlay = document.getElementById('popup-overlay');
  if (popupOverlay) {
    popupOverlay.classList.remove('active');
    setTimeout(() => popupOverlay.remove(), 300); 
  }
}

function carregarPremiacoes() {
  fetch('http://localhost:3000/user/premiacoes')
    .then(response => response.json())
    .then(premiacoes => {
      const listaPalpites = document.getElementById('fase-palpite');
      const listaVotacao = document.getElementById('fase-votacao');
      const listaConcluido = document.getElementById('fase-concluido');

      listaPalpites.innerHTML = '';
      listaVotacao.innerHTML = '';
      listaConcluido.innerHTML = '';

      premiacoes.forEach(premiacao => {
        const img = document.createElement('img');
        if(premiacao.fase === 'palpites') {
          img.src = 'imagens/fundo.jpg'; 
        }
        else if(premiacao.fase === 'votacao') {
          img.src = 'imagens/ft.jpg'; 
        } 
        else {
          img.src = 'imagens/FernandaTorres.jpg';
        }
        img.alt = premiacao.nome;
        img.classList.add('popup-trigger');

        if (premiacao.fase === 'palpites') {
          img.onclick = () => mostrarFormularioPrimeiraFase(premiacao);
          listaPalpites.appendChild(img);
        } else if (premiacao.fase === 'votacao') {
          img.onclick = () => mostrarFormularioSegundaFase(premiacao);
          listaVotacao.appendChild(img);
        } else if (premiacao.fase === 'concluido') {
          img.onclick = () => mostrarFormularioTerceiraFase(premiacao);
          listaConcluido.appendChild(img);
        }
      });
    })
    .catch(error => console.error('Erro ao carregar premiações:', error));
}

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

  fetch(`http://localhost:3000/user/categorias/${premiacaoId}`)  // Endpoint para buscar categorias
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

  console.log(categoriaId, premiacaoId)
  fetch(`http://localhost:3000/user/nomeados/${categoriaId}/${premiacaoId}`) 
    .then(response => response.json())
    .then(nomeados => {
      nomeados.forEach(nomeado => {
        console.log(nomeado)
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
        console.log(nomeadosContainer)
      });
    })
    .catch(err => console.error('Erro ao carregar nomeados:', err));
}

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
      console.log(data)
      alert(data.message);
      fecharPopup();
    })
    .catch(error => {
      console.error(error);
      alert('Erro ao salvar os palpites.');
    });
}

function salvarVoto(event) {
  event.preventDefault();  // Previne o envio do formulário

  const categoriaSelect = document.getElementById('categoria-select');
  const categoriaId = categoriaSelect.value;
  const premiacaoId = document.querySelector('.h3-form').dataset.premiacaoId
  const usuarioId = localStorage.getItem('usuario_id');
  const nomeadosSelecionados = Array.from(document.querySelectorAll('input[name="nomeados"]:checked'));

  nomeadosSelecionados.forEach(nomeadoCheckbox => {
    const nomeadoId = nomeadoCheckbox.value;

    fetch('http://localhost:3000/user/votos', {  // Endpoint para salvar o voto
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
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

  fecharPopup();  // Fechar o popup após salvar os votos
}

function logout() {
  localStorage.removeItem('usuario_id');

  window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const logoutLink = document.getElementById('logout-link');

  if (logoutLink) {
    logoutLink.addEventListener('click', (event) => {
      event.preventDefault(); 
      logout(); 
    });
  }
});

window.onload = carregarPremiacoes;
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

        // Converter para número e verificar se o indicado é vencedor
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
