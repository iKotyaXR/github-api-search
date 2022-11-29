(async () => {
  console.clear();
  let input = document.querySelector('.input');
  let resultsContainer = document.querySelector('.results');
  let reposContainer = document.querySelector('.repos');
  let status = document.querySelector('.status');
  let getReposDeb = debounce(getRepos, 700);
  let eventListeners = new Map();

  input.addEventListener('input', async () => {
    status.textContent = input.value.length == 0 ? '' : 'Ожидание';
    removeCards();
    if (input.value)
      await getReposDeb(input.value)
        .then((res) => {
          status.textContent = `${res.length != 0 ? 'Найдено: ' + res.length : 'Репозиториев нет'}`;
          for (rep of res) {
            let card = createCard(rep.name);
            let { owner, name, stargazers_count: stars } = rep;
            let listener = function () {
              createRepo(name, owner.login, stars);
              input.value = '';
              removeCards();
              status.textContent = '';
            };
            card.addEventListener('click', listener);
            eventListeners.set(card, listener);
          }
        })
        .catch((err) => {
          alert('Ошибка api');
          status.textContent = "Ошибка API ;)"
        });
  });

  async function getRepos(name) {
    let repos = await fetch(`https://api.github.com/search/repositories?q=${name}&per_page=5`);
    let response = await repos.json();
    return response['items'];
  }

  //cards
  function createCard(text) {
    let card = document.createElement('div');
    card.textContent = text;
    card.classList.add('results__item');
    resultsContainer.appendChild(card);
    return card;
  }

  function removeCards() {
    let cards = document.querySelectorAll('.results__item');
    for (let card of cards) {
      card.remove();
      for (lstnr of eventListeners) {
        lstnr[0].removeEventListener('click', lstnr[1]);
      }
      eventListeners.clear();
    }
  }

  function createRepo(name, owner, stars) {
    let rep = document.createDocumentFragment();
    let repItem = document.createElement('div');
    let button = document.createElement('button');
    let data = document.createElement('div');
    data.textContent = `Name: ${name}
    Owner: ${owner}
    Stars: ${stars}`;

    repItem.classList.add('repos__item');
    data.classList.add('repos__item__data');
    button.classList.add('repos__item__button');
    button.addEventListener('click', function () {
      button.removeEventListener('click', arguments.callee);
      repItem.remove();
    });
    repItem.append(data, button);
    rep.append(repItem);

    reposContainer.appendChild(rep);
  }
  //Dev
  function debounce(f, interval) {
    let timer = null;

    return (...args) => {
      clearTimeout(timer);
      return new Promise((resolve) => {
        timer = setTimeout(() => resolve(f(...args)), interval);
      });
    };
  }
})();
