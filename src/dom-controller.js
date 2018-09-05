document.addEventListener("spellCooldownUpdate", e => {
  console.log(e);
  if (e.detail.spell == "search") {
    console.log("search");
    const searchEl = document.getElementById("search");
    const searchCooldownEl = document.getElementById("search-cooldown");
    const searchKeyEl = document.getElementById("search-key");
    console.log(searchEl);
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
});
