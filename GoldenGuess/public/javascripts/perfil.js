document.addEventListener('DOMContentLoaded', () => {
    const usuarioId = localStorage.getItem('usuario_id');
  
    if (!usuarioId) {
      window.location.href = 'login.html'; 
    }

    const navItems = document.querySelectorAll('nav ul li');
    const sections = {
      'meu-perfil': document.getElementById('meu-perfil'),
      'minha-atividade': document.getElementById('minha-atividade'),
      'meus-resultados': document.getElementById('meus-resultados')
    };
  
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        navItems.forEach(navItem => navItem.classList.remove('active'));
  
        item.classList.add('active');
  
        Object.values(sections).forEach(section => section.classList.remove('active'));
  
        const sectionId = item.textContent.toLowerCase().replace(/\s+/g, '-');
        if (sections[sectionId]) {
          sections[sectionId].classList.add('active');
        }
  
        if (sectionId === 'meu-perfil') {
          carregarInformacoesUsuario(usuarioId);
        } else if (sectionId === 'minha-atividade') {
          carregarAtividadeUsuario(usuarioId);
        } else if (sectionId === 'meus-resultados') {
          carregarResultadosUsuario(usuarioId);
        }
      });
    });

    navItems[0].click();
});
  
function carregarInformacoesUsuario(usuarioId) {
    const section = document.getElementById('meu-perfil');
    section.innerHTML = ''; 

    fetch(`http://localhost:3000/user/info/${usuarioId}`)
      .then(response => response.json())
      .then(usuario => {
        const informacoesUsuario = document.createElement('div');
        informacoesUsuario.innerHTML = `
          <p><strong>Nome:</strong> ${usuario.nome}</p>
          <p><strong>Email:</strong> ${usuario.email}</p>
          <p><strong>Data de Nascimento:</strong> ${usuario.data_nascimento}</p>
        `;
        document.getElementById('meu-perfil').appendChild(informacoesUsuario);
      })
      .catch(error => console.error('Erro ao carregar informações do usuário:', error));
}
  
function carregarAtividadeUsuario(usuarioId) {
  const section = document.getElementById('minha-atividade');
  section.innerHTML = ''; 

  fetch(`http://localhost:3000/user/atividade/${usuarioId}`)
    .then(response => response.json())
    .then(atividade => {
      // Para palpites:
      const palpitesContainer = document.createElement('div');
      palpitesContainer.innerHTML = '<h3>Primeira Fase - Palpites</h3>';
      const palpitesPosters = document.createElement('div');
      palpitesPosters.classList.add('posters-container');

      // Filtra para que cada premiacão apareça apenas uma vez
      const palpitesUnicos = filtrarPremiacoesUnicas(atividade.palpites);
      palpitesUnicos.forEach(premiacao => {
        const poster = criarPoster(premiacao);
        palpitesPosters.appendChild(poster);
      });
      palpitesContainer.appendChild(palpitesPosters);
      section.appendChild(palpitesContainer);

      // Para votos:
      const votosContainer = document.createElement('div');
      votosContainer.innerHTML = '<h3>Segunda Fase - Votos</h3>';
      const votosPosters = document.createElement('div');
      votosPosters.classList.add('posters-container');

      const votosUnicos = filtrarPremiacoesUnicas(atividade.votos);
      votosUnicos.forEach(premiacao => {
        const poster = criarPoster(premiacao);
        votosPosters.appendChild(poster);
      });
      votosContainer.appendChild(votosPosters);
      section.appendChild(votosContainer);
    })
    .catch(error => console.error('Erro ao carregar atividade do usuário:', error));
}

function carregarResultadosUsuario(usuarioId) {
  const section = document.getElementById('meus-resultados');
  section.innerHTML = ''; 

  fetch(`http://localhost:3000/user/resultados/${usuarioId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao carregar resultados');
      }
      return response.json();
    })
    .then(resultados => {
      const resultadosContainer = document.createElement('div');

      // Agrupar resultados por premiação
      const resultadosPorPremiacao = resultados.reduce((acc, resultado) => {
        if (!acc[resultado.premiacao.nome]) {
          acc[resultado.premiacao.nome] = [];
        }
        acc[resultado.premiacao.nome].push(resultado);
        return acc;
      }, {});

      // Exibir resultados por premiação e categoria
      Object.entries(resultadosPorPremiacao).forEach(([premiacaoNome, categorias]) => {
        const premiacaoContainer = document.createElement('div');
        premiacaoContainer.innerHTML = `<h2>${premiacaoNome}</h2>`;
        
        categorias.forEach(categoria => {
          const card = document.createElement('div');
          card.classList.add('resultado-card');
          card.innerHTML = `
            <h3>${categoria.categoria.nome}</h3>
            <p>Primeira Fase: Você acertou ${categoria.acertosPrimeiraFase} de ${categoria.totalIndicados} indicados.</p>
            <p>Palpites corretos: ${categoria.palpitesCorretos.join(', ')}</p>
            <p>Segunda Fase: ${categoria.acertoSegundaFase}</p>
          `;
          premiacaoContainer.appendChild(card);
        });

        resultadosContainer.appendChild(premiacaoContainer);
      });

      section.appendChild(resultadosContainer);
    })
    .catch(error => {
      console.error('Erro ao carregar resultados do usuário:', error);
      section.innerHTML = '<p>Erro ao carregar resultados. Tente novamente mais tarde.</p>';
    });
}

function filtrarPremiacoesUnicas(premiacoes) {
    // Cria um objeto auxiliar onde a chave é o id da premiacão
    const premiacoesUnicas = {};
    premiacoes.forEach(premiacao => {
      // Se ainda não adicionou, guarda o objeto
      if (!premiacoesUnicas[premiacao.id]) {
        premiacoesUnicas[premiacao.id] = premiacao;
      }
    });
    // Retorna os valores (únicos) do objeto
    return Object.values(premiacoesUnicas);
}
  
function criarPoster(premiacao) {
    const poster = document.createElement('div');
    poster.classList.add('poster');
    poster.innerHTML = `
      <img src="../imagens/ft.jpg" alt="${premiacao.nome}">
      <p>${premiacao.nome}</p>
    `;
    return poster;
}