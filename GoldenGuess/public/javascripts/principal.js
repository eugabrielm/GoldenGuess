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
        <div id="categorias-container" class="hidden"></div>
        <button type="submit" class="btn-salvar">Salvar Premiação</button>
      </form>
    </div>
  `;

  popupOverlay.classList.add('active');
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

function fecharPopup() {
  const popupOverlay = document.getElementById('popup-overlay');
  if (popupOverlay) {
    popupOverlay.classList.remove('active');
    setTimeout(() => popupOverlay.remove(), 300); 
  }
}

async function carregarPremiacoes() {
  const usuarioId = localStorage.getItem('usuario_id');
  if (!usuarioId) {
    window.location.href = 'login.html';
    return;
  }

  // Primeiro, busque a atividade do usuário
  let atividade = { palpites: [], votos: [] };
  try {
    const responseAtividade = await fetch(`http://localhost:3000/user/atividade/${usuarioId}`);
    if(responseAtividade.ok){
      atividade = await responseAtividade.json();
    } else {
      console.error('Erro ao buscar atividade do usuário');
    }
  } catch (error) {
    console.error('Erro na requisição de atividade:', error);
  }

  // Em seguida, busque as premiações
  fetch('http://localhost:3000/user/premiacoes')
    .then(response => response.json())
    .then(premiacoes => {
      // Selecione os containers de cada fase
      const listaPalpites = document.getElementById('fase-palpite');
      const listaVotacao = document.getElementById('fase-votacao');
      const listaConcluido = document.getElementById('fase-concluido');

      // Limpe os containers
      listaPalpites.innerHTML = '';
      listaVotacao.innerHTML = '';
      listaConcluido.innerHTML = '';

      premiacoes.forEach(premiacao => {
        const img = document.createElement('img');
        // Configure a imagem de acordo com a fase
        if(premiacao.fase === 'palpites') {
          img.src = 'imagens/fundo.jpg'; 
        } else if(premiacao.fase === 'votacao') {
          img.src = 'imagens/ft.jpg'; 
        } else {
          img.src = 'imagens/FernandaTorres.jpg';
        }
        img.alt = premiacao.nome;
        img.classList.add('popup-trigger');

        // Verifique se o usuário já enviou palpites ou votos para essa premiação
        const jaPalpitou = atividade.palpites.some(p => Number(p.id) === premiacao.id);
        const jaVotou = atividade.votos.some(v => Number(v.id) === premiacao.id);

        if (premiacao.fase === 'palpites') {
          if (jaPalpitou) {
            // Se já enviou palpite, desabilite ou informe que já enviou
            img.classList.add('disabled');
            img.title = "Você já enviou seus palpites para esta premiação.";
          } else {
            img.onclick = () => mostrarFormularioPrimeiraFase(premiacao);
          }
          listaPalpites.appendChild(img);
        } else if (premiacao.fase === 'votacao') {
          if (jaVotou) {
            img.classList.add('disabled');
            img.title = "Você já votou nesta premiação.";
          } else {
            img.onclick = () => mostrarFormularioSegundaFase(premiacao);
          }
          listaVotacao.appendChild(img);
        } else if (premiacao.fase === 'concluido') {
          // Para premiacoes concluídas, você pode sempre mostrar o resultado final
          img.onclick = () => mostrarFormularioTerceiraFase(premiacao);
          listaConcluido.appendChild(img);
        }
      });
    })
    .catch(error => console.error('Erro ao carregar premiações:', error));
}

async function carregarCategoriasEIndicados(premiacaoId) {
  const categoriasContainer = document.getElementById('categorias-container');
  categoriasContainer.innerHTML = 'Carregando categorias...';

  try {
    const responseCategorias = await fetch(`http://localhost:3000/user/categorias/${premiacaoId}`);
    console.log(responseCategorias)
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
  event.preventDefault(); // Previne o envio do formulário

  const premiacaoId = document.querySelector('.h3-form').dataset.premiacaoId; // ID da premiação
  const usuarioId = localStorage.getItem('usuario_id'); // ID do usuário logado

  if (!usuarioId) {
    alert('Usuário não está logado. Faça login para salvar votos.');
    return;
  }

  // Coletar todos os vencedores selecionados
  const categoriasContainer = document.getElementById('categorias-vencedores-container');
  const categorias = categoriasContainer.querySelectorAll('.categoria-vencedores');

  let votosSalvos = 0; // Contador de votos salvos
  let totalCategorias = categorias.length; // Total de categorias

  categorias.forEach(categoria => {
    const categoriaId = categoria.querySelector('h4').dataset.categoriaId; // ID da categoria
    const vencedorSelecionado = categoria.querySelector('input[type="radio"]:checked'); // Vencedor selecionado

    if (!vencedorSelecionado) {
      alert(`Selecione um vencedor para a categoria: ${categoria.querySelector('h4').textContent}`);
      return; // Interrompe se não houver vencedor selecionado
    }

    const nomeadoId = vencedorSelecionado.value; // ID do nomeado selecionado

    // Enviar o voto para o backend
    fetch('http://localhost:3000/user/votos', {
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
        votosSalvos++;

        // Fechar o popup após salvar todos os votos
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

document.addEventListener('input', (event) => {
  if (event.target.classList.contains('indicado-input')) {
      salvarEstadoInputs();
  }
});

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

window.onload = carregarPremiacoes;