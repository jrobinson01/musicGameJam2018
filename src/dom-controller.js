import {saveHighScore, fetchHighScores} from './firebase-controller';

document.addEventListener('spellCooldownUpdate', e => {
  if (e.detail.spell == 'search') {
    const searchEl = document.getElementById('search');
    const searchCooldownEl = document.getElementById('search-cooldown');
    const searchKeyEl = document.getElementById('search-key');
    if (e.detail.status > 0) {
      searchEl.classList.add('disabled');
      searchKeyEl.style.display = 'none';
      searchCooldownEl.textContent = `- ${e.detail.status}`;
    } else {
      searchEl.classList.remove('disabled');
      searchKeyEl.style.display = 'inline';
      searchCooldownEl.textContent = '';
    }
  }
  if (e.detail.spell == 'blast') {
    const blastEl = document.getElementById('blast');
    const blastCooldownEl = document.getElementById('blast-cooldown');
    const blastKeyEl = document.getElementById('blast-key');
    if (e.detail.status > 0) {
      blastEl.classList.add('disabled');
      blastKeyEl.style.display = 'none';
      blastCooldownEl.textContent = `- ${e.detail.status}`;
    } else {
      blastEl.classList.remove('disabled');
      blastKeyEl.style.display = 'inline';
      blastCooldownEl.textContent = '';
    }
  }
});

document.addEventListener('level', e => {
  const el = document.getElementById('level');
  el.textContent = e.detail.level;
});

document.addEventListener('updateMoves', e => {
  const el = document.getElementById('moves');
  el.textContent = e.detail.moves;
});

const messages = [];
document.addEventListener('printMessage', e => {
  messages.unshift(e.detail.message);
  const messagesEl = document.getElementById('messages');
  messagesEl.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const messageEl = document.createElement('p');
    messageEl.textContent = messages[i];
    messagesEl.appendChild(messageEl);
  }
});

document.addEventListener('updateScore', e => {
  const scoreEl = document.getElementById('score');
  scoreEl.textContent = e.detail.score;
});

document.addEventListener('updateNotes', e => {
  const notesEl = document.getElementById('notes');
  notesEl.textContent = `${e.detail.userPatternLength}/${
    e.detail.patternLength
  }`;
});

document.addEventListener('displayGameOver', e => {
  const score = e.detail.score;
  const gameOverEl = document.getElementById('game-over');
  gameOverEl.style.display = 'block';
  const scoreEl = document.getElementById('final-score');
  const scoreFormThing = document.querySelector('#score-form-hidden');
  scoreFormThing.value = score;
  scoreEl.textContent = score;

  const highScoreListEl = document.getElementById('short-high-score-list');
  highScoreListEl.innerHTML = '(loading)';
  fetchHighScores(5).then(snapshot => {
    highScoreListEl.innerHTML = '';
    snapshot.forEach(item => {
      const newListItem = document.createElement('li');
      newListItem.textContent = `${item.data().name} - ${item.data().score}`;
      highScoreListEl.appendChild(newListItem);
    });
  });
});

document.addEventListener('hideGameOver', () => {
  const gameOverEl = document.getElementById('game-over');
  gameOverEl.style.display = 'none';
});

const highScoreForm = document.querySelector('#high-score-form');
highScoreForm.onsubmit = function(e) {
  e.preventDefault();
  const name = highScoreForm.querySelector('#name').value;
  const score = highScoreForm.querySelector('#score-form-hidden').value;
  saveHighScore(name, score);
  document.dispatchEvent(new CustomEvent('hideGameOver'));
  document.dispatchEvent(new CustomEvent('showHighScoreScreen'));
};

document.addEventListener('showHighScoreScreen', () => {
  const highScoreScreenEl = document.getElementById('high-score-screen');
  highScoreScreenEl.style.display = 'block';
  const highScoreListEl = document.getElementById('high-score-list');
  highScoreListEl.innerHTML = '(loading)';
  fetchHighScores(100).then(snapshot => {
    highScoreListEl.innerHTML = '';
    snapshot.forEach(item => {
      const newListItem = document.createElement('li');
      newListItem.textContent = `${item.data().name} - ${item.data().score}`;
      highScoreListEl.appendChild(newListItem);
    });
  });
});

document.addEventListener('hideHighScoreScreen', () => {
  const highScoreScreenEl = document.getElementById('high-score-screen');
  highScoreScreenEl.style.display = 'none';
});

document.addEventListener('showStartScreen', ()=> {
  const startScreenEl = document.getElementById('start-screen')
  startScreenEl.style.display = 'block'
})

document.addEventListener('hideStartScreen', ()=> {
  const startScreenEl = document.getElementById('start-screen')
  startScreenEl.style.display = 'none'
})