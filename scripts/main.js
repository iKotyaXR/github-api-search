(async () => {
  console.clear();
  let input = document.querySelector('.input');
  let resultsContainer = document.querySelector('.results');
  let reposContainer = document.querySelector('.repos');
  let getReposDeb = debounce(getRepos, 700);
  input.addEventListener('input', async () => {
    removeCards();
    if (input.value)
      await getReposDeb(input.value)
        .then((res) => {
          for (rep of res) {
            let card = createCard(rep.name);

            let { owner, name, stargazers_count: stars } = rep;
            card.addEventListener('click', function () {
              createRepo(name, owner.login, stars);
              input.value = ''
              removeCards()
            });
          }
        })
        .catch((err) => {
          alert('Ошибка api');
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
    for (let card of cards) card.remove();
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
    button.addEventListener('click', () => {
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
