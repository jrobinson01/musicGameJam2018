document.addEventListener("spellCooldownUpdate", e => {
  if (e.detail.spell == "search") {
    const searchEl = document.getElementById("search");
    const searchCooldownEl = document.getElementById("search-cooldown");
    const searchKeyEl = document.getElementById("search-key");
    if (e.detail.status > 0) {
      searchEl.classList.add("disabled");
      searchKeyEl.style.display = "none";
      searchCooldownEl.textContent = `- ${e.detail.status}`;
    } else {
      searchEl.classList.remove("disabled");
      searchKeyEl.style.display = "inline";
      searchCooldownEl.textContent = "";
    }
  }
  if (e.detail.spell == "blast") {
    const blastEl = document.getElementById("blast");
    const blastCooldownEl = document.getElementById("blast-cooldown");
    const blastKeyEl = document.getElementById("blast-key");
    if (e.detail.status > 0) {
      blastEl.classList.add("disabled");
      blastKeyEl.style.display = "none";
      blastCooldownEl.textContent = `- ${e.detail.status}`;
    } else {
      blastEl.classList.remove("disabled");
      blastKeyEl.style.display = "inline";
      blastCooldownEl.textContent = "";
    }
  }
});
