fetch('http://localhost:3000/user/premiacoes') 
  .then(response => response.json())
  .then(data => {
    data.forEach(premiacao => {
      // Cria uma nova imagem
      const img = document.createElement('img');
      
      // Aqui você define a imagem estática que você quer para todas as premiações
      img.src = 'imagens/trofeus.jpg';  // Coloque a URL da sua imagem aqui
      img.alt = premiacao.nome;  // Defina o nome da premiação como alt (opcional)
      img.classList.add('popup-trigger');  // Adiciona a classe CSS existente
      img.onclick = () => mostrarFormularioPrimeiraFase(premiacao);

      // Adiciona a imagem ao container awards-list
      awardsList.appendChild(img);
    });
  })
  .catch(error => console.error('Erro ao carregar premiações:', error));

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
          <h3>${premiacao.nome}</h3>
          <div class="categorias-container">
              <label for="premiacao-descricao">Categorias:</label>
              <select class="form-select" aria-label="Default select example">
                <option selected>Escolha a categoria</option>
              </select>
          </div>
          <div id="palpites-container">
              <div class="input-container categoria">
                  <label>Indicados:</label>
                  <input type="text" name="categoria[]" placeholder="Nome do indicado" required>
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
  carregarCategorias(premiacao.id);

  const btnAdicionarCategoria = document.getElementById('adicionar-categoria');
  btnAdicionarCategoria.addEventListener('click', adicionarCategoria);

  const form = document.getElementById('primeira-fase-form');
  form.addEventListener('submit', salvarPremiacao);
}

const awardsList = document.querySelector('.awards-list');  // Container para as imagens

function fecharPopup() {
  const popupOverlay = document.getElementById('popup-overlay');
  if (popupOverlay) {
    popupOverlay.classList.remove('active');
    setTimeout(() => popupOverlay.remove(), 300); 
  }
}

function carregarPremiacoes() {
  fetch('/api/premiacoes')
    .then(response => response.json())
    .then(premiacoes => {
      const awardsList = document.querySelector('.awards-list');
      awardsList.innerHTML = ''; // Limpa as imagens anteriores, se houver.

      premiacoes.forEach(premiacao => {
        // Cria a imagem para cada premiação
        const imagem = document.createElement('img');
        imagem.src = premiacao.imagem_url; // URL da imagem
        imagem.alt = premiacao.nome;
        imagem.classList.add('popup-trigger');
        imagem.onclick = () => mostrarFormularioPrimeiraFase(premiacao); // Passa a premiação ao clicar
        awardsList.appendChild(imagem);
      });
    })
    .catch(error => console.error('Erro ao carregar premiações:', error));
}

function carregarCategorias(premiacaoId) {
  const selectElement = document.querySelector('.form-select');
  selectElement.innerHTML = '<option selected>Escolha a categoria</option>';  // Limpa as opções atuais

  // Faz a requisição para obter as categorias da premiacaoId
  fetch(`http://localhost:3000/user/categorias/${premiacaoId}`)
    .then(response => response.json())
    .then(categorias => {
      // Itera sobre as categorias e cria uma nova opção para cada uma
      categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.id;  // Defina o valor da categoria
        option.textContent = categoria.nome;  // Defina o nome da categoria
        selectElement.appendChild(option);  // Adiciona a opção ao select
      });
    })
    .catch(error => console.error('Erro ao carregar categorias:', error));
}

window.onload = carregarPremiacoes; // Chama a função quando a página carregar