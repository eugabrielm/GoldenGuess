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
          <h3>Primeira Fase - Palpites</h3>
          <div class="input-container">
              <label for="premiacao-nome">Nome da Premiação:</label>
              <input type="text" id="premiacao-nome" placeholder="Nome da premiação" required>
          </div>
          <div class="input-container">
              <label for="premiacao-descricao">Descrição da Premiação:</label>
              <input type="text" id="premiacao-descricao" placeholder="Descrição da premiação" required>
          </div>
          <div id="categorias-container"></div>
          <button type="button" id="adicionar-categoria" class="btn">+ Adicionar Categoria</button>
          <button type="submit" class="btn">Salvar Premiação</button>
      </form>
    </div>
  `;

  popupOverlay.classList.add('active');

  const btnAdicionarCategoria = document.getElementById('adicionar-categoria');
  btnAdicionarCategoria.addEventListener('click', adicionarCategoria);

  const form = document.getElementById('primeira-fase-form');
  form.addEventListener('submit', salvarPremiacao);
}

async function mostrarFormularioSegundaFase() {
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
        <h3>Segunda Fase - Indicados</h3>
        <div class="input-container">
          <label for="premiacao">Escolha a premiação:</label>
          <select id="premiacao" class="form-select">
            <option selected value="">Escolha a premiação</option>
          </select>
        </div>
        <div id="categorias-container" class="hidden"></div>
        <button type="submit" class="btn-salvar">Salvar Indicados</button>
      </form>
    </div>
  `;

  popupOverlay.classList.add('active');

  await carregarPremiacoes();

  const selectPremiacao = document.getElementById('premiacao');
  selectPremiacao.addEventListener('change', async () => {
    const premiacaoId = selectPremiacao.value;
    const categoriasContainer = document.getElementById('categorias-container');

    if (premiacaoId) {
      categoriasContainer.classList.remove('hidden');
      await carregarCategoriasEIndicados(premiacaoId);
    } else {
      categoriasContainer.classList.add('hidden');
      categoriasContainer.innerHTML = '';
    }
  });

  const form = document.getElementById('segunda-fase-form');
  form.addEventListener('submit', salvarIndicadosSegundaFase);
}

async function mostrarFormularioTerceiraFase() {
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
      <form id="definir-vencedores-form">
        <h3>Definir Vencedores</h3>
        <div class="input-container">
          <label for="premiacao-vencedores">Escolha a premiação:</label>
          <select id="premiacao-vencedores" class="form-select">
            <option selected value="">Escolha a premiação</option>
          </select>
        </div>
        <div id="categorias-vencedores-container" class="hidden"></div>
        <button type="submit" class="btn-salvar">Salvar Vencedores</button>
      </form>
    </div>
  `;

  popupOverlay.classList.add('active');

  await carregarPremiacoesVencedores();

  const selectPremiacao = document.getElementById('premiacao-vencedores');
  selectPremiacao.addEventListener('change', async () => {
    const premiacaoId = selectPremiacao.value;
    const categoriasContainer = document.getElementById('categorias-vencedores-container');

    if (premiacaoId) {
      categoriasContainer.classList.remove('hidden');
      await carregarCategoriasEVencedores(premiacaoId);
    } else {
      categoriasContainer.classList.add('hidden');
      categoriasContainer.innerHTML = '';
    }
  });

  const form = document.getElementById('definir-vencedores-form');
  form.addEventListener('submit', salvarVencedores);
}

async function carregarCategoriasEIndicados(premiacaoId) {
  const categoriasContainer = document.getElementById('categorias-container');
  categoriasContainer.innerHTML = 'Carregando categorias...';

  try {
    const responseCategorias = await fetch(`http://localhost:3000/admin/buscar-categorias?premiacaoId=${premiacaoId}`);
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

async function carregarPremiacoesVencedores() {
  const selectPremiacao = document.getElementById('premiacao-vencedores');
  selectPremiacao.innerHTML = '<option selected>Escolha a premiação</option>';

  try {
    const response = await fetch('http://localhost:3000/admin/buscar-premiacoes-votacao');
    if (!response.ok) {
      throw new Error('Erro ao buscar premiações');
    }
    const premiacoes = await response.json();

    premiacoes.forEach(premiacao => {
      const option = document.createElement('option');
      option.value = premiacao.id;
      option.textContent = premiacao.nome;
      selectPremiacao.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar premiações:', error);
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
          <h4>${categoria.nome}</h4>
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

async function carregarPremiacoes() {
  const selectPremiacao = document.getElementById('premiacao');
  selectPremiacao.innerHTML = '<option selected>Escolha a premiação</option>';

  try {
    const response = await fetch('http://localhost:3000/admin/buscar-premiacoes-primeira-fase');
    if (!response.ok) {
      throw new Error('Erro ao buscar premiações');
    }
    const premiacoes = await response.json();

    premiacoes.forEach(premiacao => {
      const option = document.createElement('option');
      option.value = premiacao.id;
      option.textContent = premiacao.nome;
      selectPremiacao.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar premiações:', error);
  }
}

async function carregarCategorias() {
  const premiacaoId = document.getElementById('premiacao').value;
  const selectCategoria = document.getElementById('categoria');

  if (!premiacaoId) return;

  try {
    const response = await fetch(`http://localhost:3000/admin/buscar-categorias?premiacaoId=${premiacaoId}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar categorias');
    }
    const categorias = await response.json();

    selectCategoria.innerHTML = '<option selected>Escolha a categoria</option>';
    categorias.forEach(categoria => {
      const option = document.createElement('option');
      option.value = categoria.id;
      option.textContent = categoria.nome;
      option.dataset.maxNomeados = categoria.max_nomeados;
      selectCategoria.appendChild(option);
    });

    selectCategoria.addEventListener('change', carregarInputs);
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
  }
}

function mostrarPopup(mensagem) {
  const popup = document.getElementById("popup-mensagem-erro");
  const textoPopup = document.getElementById("popup-texto-erro");
  const overlay = document.getElementById("popup-overlay-erro");

  textoPopup.textContent = mensagem;
  popup.style.display = "block";  
  overlay.style.display = "block";
}

function fecharPopupErro() {
  document.getElementById("popup-mensagem-erro").style.display = "none";
  document.getElementById("popup-overlay-erro").style.display = "none";
}

function fecharPopup() {
  const popupOverlay = document.getElementById('popup-overlay');
  if (popupOverlay) {
    popupOverlay.classList.remove('active');
    setTimeout(() => popupOverlay.remove(), 300);
  }
}

function adicionarCategoria() {
  const categoriasContainer = document.getElementById('categorias-container');
  const totalCategorias = categoriasContainer.getElementsByClassName('categoria').length+1;

    if(totalCategorias == 1) {
      categoriasContainer.style.display = 'block';
    } 
      const novaCategoria = document.createElement('div');
      novaCategoria.classList.add('input-container', 'categoria');
      novaCategoria.innerHTML = `
          <label>Categoria ${totalCategorias}:</label>
          <input type="text" name="categoria[]" placeholder="Nome da categoria" required>
          <label>Número Máximo de Nomeados:</label>
          <input type="text" name="max-nomeados[]" min="1" value="1" required>
          <button type="button" class="btn-excluir" onclick="excluirCategoria(this)"><i class="fas fa-trash"></i></button>
      `;
    
  categoriasContainer.appendChild(novaCategoria);
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

function carregarInputs() {
  const categoriaId = document.getElementById('categoria').value;
  const selectedOption = document.getElementById('categoria').selectedOptions[0];
  const maxNomeados = selectedOption.dataset.maxNomeados;
  const inputsContainer = document.getElementById('inputs-container');
  inputsContainer.innerHTML = ''; 

  if (!categoriaId || !maxNomeados) return;

  for (let i = 1; i <= maxNomeados; i++) {
    const inputContainer = document.createElement('div');
    inputContainer.classList.add('input-container');

    const label = document.createElement('label');
    label.textContent = `Indicado ${i}:`;

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `Digite o nome do indicado ${i}`;
    input.required = true;

    inputContainer.appendChild(label);
    inputContainer.appendChild(input);
    inputsContainer.appendChild(inputContainer);
  }
}

function salvarPremiacao(event) {
  event.preventDefault();

  const nomePremiacao = document.getElementById('premiacao-nome').value;
  const descricaoPremiacao = document.getElementById('premiacao-descricao').value;

  const categorias = Array.from(document.getElementsByClassName('categoria')).map(categoria => {
    const nome = categoria.querySelector('input[name="categoria[]"]').value;
    const maxNomeados = categoria.querySelector('input[name="max-nomeados[]"]').value;
    return { nome: nome.trim(), max_nomeados: parseInt(maxNomeados) };
  });

  const data = { nome: nomePremiacao, descricao: descricaoPremiacao, categorias };

  fetch('http://localhost:3000/admin/salvar-premiacao-primeira-fase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  .then(response => response.json())
  .then(data => {
    mostrarPopup(data.message);
    fecharPopup();
  })
  .catch(error => {
    console.error(error);
    mostrarPopup('Erro ao salvar a premiação.');
  });

  fecharPopup();
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

function salvarPremiacaoSegundaFase(event) {
  event.preventDefault();

  const selectPremiacao = document.getElementById('premiacao');
  const premiacaoId = selectPremiacao.value;
  const premiacaoNome = selectPremiacao.options[selectPremiacao.selectedIndex].text;

  const selectCategoria = document.getElementById('categoria');
  const categoriaId = selectCategoria.value;
  const categoriaNome = selectCategoria.options[selectCategoria.selectedIndex].text;

  const inputsContainer = document.getElementById('inputs-container');
  const nomeados = Array.from(inputsContainer.querySelectorAll('input')).map(input => input.value.trim());

  if (!premiacaoId || !categoriaId || nomeados.length === 0 || nomeados.some(nomeado => !nomeado)) {
    mostrarPopup('Todos os campos são obrigatórios!');
    return;
  }

  const data = {
    premiacaoId,
    premiacaoNome,
    categoriaId,
    categoriaNome,
    nomeados
  };

  fetch('http://localhost:3000/admin/salvar-premiacao-segunda-fase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
    .then(response => response.json())
    .then(data => {
      mostrarPopup(data.message);
      fecharPopup();
    })
    .catch(error => {
      console.error(error);
      mostrarPopup('Erro ao salvar a premiação.');
    });
}

async function salvarIndicadosSegundaFase(event) {
  event.preventDefault();

  const premiacaoId = document.getElementById('premiacao').value;
  const categoriasContainer = document.getElementById('categorias-container');
  const categoriaContainers = categoriasContainer.querySelectorAll('.categoria-container');

  const indicadosPorCategoria = [];
  let erro = false;

  categoriaContainers.forEach(categoriaDiv => {
    const categoriaId = categoriaDiv.querySelector('.indicado-input').dataset.categoriaId;
    const inputsIndicados = categoriaDiv.querySelectorAll('.indicado-input');
    const indicados = Array.from(inputsIndicados).map(input => input.value.trim());

    if (indicados.some(indicado => !indicado)) {
      mostrarPopup(`Preencha todos os indicados da categoria ${categoriaDiv.querySelector('h4').textContent}`);
      erro = true;
      return;
    }

    indicadosPorCategoria.push({ categoriaId, indicados });
  });

  if (erro || indicadosPorCategoria.length === 0) {
    return;
  }

  const data = {
    premiacaoId,
    indicadosPorCategoria
  };

  try {
    const response = await fetch('http://localhost:3000/admin/salvar-premiacao-segunda-fase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    console.log(response)
    if (!response.ok) {
      throw new Error('Erro ao salvar indicados');
    }

    const result = await response.json();
    mostrarPopup(result.message);
    fecharPopup();
  } catch (error) {
    console.error('Erro ao salvar indicados:', error);
    mostrarPopup('Erro ao salvar indicados.');
  }
}

async function salvarVencedores(event) {
  event.preventDefault();

  const premiacaoId = document.getElementById('premiacao-vencedores').value;
  const categoriasContainer = document.getElementById('categorias-vencedores-container');
  const categorias = categoriasContainer.querySelectorAll('.categoria-vencedores');

  const vencedores = [];
  categorias.forEach(categoriaDiv => {
    const categoriaId = categoriaDiv.querySelector('input[type="radio"]').name.replace('vencedor-', '');
    const vencedorId = categoriaDiv.querySelector('input[type="radio"]:checked')?.value;

    if (!vencedorId) {
      mostrarPopup(`Selecione um vencedor para a categoria ${categoriaDiv.querySelector('h4').textContent}`);
      return;
    }

    vencedores.push({ categoriaId, vencedorId });
  });

  if (vencedores.length === 0) {
    mostrarPopup('Nenhum vencedor selecionado.');
    return;
  }

  const data = {
    premiacaoId,
    vencedores
  };

  try {
    const response = await fetch('http://localhost:3000/admin/salvar-vencedores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Erro ao salvar vencedores');
    }

    const result = await response.json();
    mostrarPopup(result.message);
    fecharPopup();
  } catch (error) {
    console.error('Erro ao salvar vencedores:', error);
    mostrarPopup('Erro ao salvar vencedores.');
  }
}