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
