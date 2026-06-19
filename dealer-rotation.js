// Dealer rotation / seat tracker. Distinct from tracker.js: a state-advance rotation,
// not a per-round point tracker. Config: window.DEALER_CONFIG = { minPlayers, maxPlayers, defaultPlayers }
(function () {
  var cfg = window.DEALER_CONFIG || { minPlayers: 2, maxPlayers: 8, defaultPlayers: 4 };
  var storageKey = "dealer-rotation";

  var playerCountSel = document.getElementById("playerCount");
  var playersEl = document.getElementById("players");
  var randomFirstBtn = document.getElementById("randomFirst");
  var nextDealBtn = document.getElementById("nextDeal");
  var resetBtn = document.getElementById("resetAll");

  var state = loadState() || freshState(cfg.defaultPlayers);

  function freshState(count) {
    var players = [];
    for (var i = 0; i < count; i++) players.push("Player " + (i + 1));
    return { players: players, currentIndex: 0 };
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function saveState() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch (e) {}
  }

  function renderPlayerCountOptions() {
    playerCountSel.innerHTML = "";
    for (var n = cfg.minPlayers; n <= cfg.maxPlayers; n++) {
      var opt = document.createElement("option");
      opt.value = n; opt.textContent = n;
      if (n === state.players.length) opt.selected = true;
      playerCountSel.appendChild(opt);
    }
  }

  function renderPlayers() {
    playersEl.innerHTML = "";
    state.players.forEach(function (name, idx) {
      var div = document.createElement("div");
      div.className = "team" + (idx === state.currentIndex ? " active-dealer" : "");

      var h3 = document.createElement("h3");
      h3.textContent = idx === state.currentIndex ? "Dealing now" : "Seat " + (idx + 1);
      div.appendChild(h3);

      var nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.value = name;
      nameInput.addEventListener("input", function () {
        state.players[idx] = nameInput.value;
        saveState();
      });
      div.appendChild(nameInput);

      playersEl.appendChild(div);
    });
  }

  function setPlayerCount(n) {
    state = freshState(n);
    saveState();
    renderPlayerCountOptions();
    renderPlayers();
  }

  playerCountSel.addEventListener("change", function () {
    setPlayerCount(parseInt(playerCountSel.value, 10));
  });

  randomFirstBtn.addEventListener("click", function () {
    state.currentIndex = Math.floor(Math.random() * state.players.length);
    saveState();
    renderPlayers();
  });

  nextDealBtn.addEventListener("click", function () {
    state.currentIndex = (state.currentIndex + 1) % state.players.length;
    saveState();
    renderPlayers();
  });

  resetBtn.addEventListener("click", function () {
    if (!confirm("Reset the rotation? This clears player names.")) return;
    state = freshState(state.players.length);
    saveState();
    renderPlayers();
  });

  renderPlayerCountOptions();
  renderPlayers();
})();
