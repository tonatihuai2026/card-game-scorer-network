// Generic round-based score tracker. Configured per page via window.TRACKER_CONFIG:
// { gameSlug: string, minTeams: number, maxTeams: number, defaultTeams: number }
(function () {
  var cfg = window.TRACKER_CONFIG || { gameSlug: "game", minTeams: 2, maxTeams: 4, defaultTeams: 2 };
  var storageKey = "scorer:" + cfg.gameSlug;

  var teamCountSel = document.getElementById("teamCount");
  var teamsEl = document.getElementById("teams");
  var historyTable = document.getElementById("historyTable");
  var historyHead = document.getElementById("historyHead");
  var historyBody = document.getElementById("historyBody");
  var historyHeading = document.getElementById("historyHeading");
  var grandTotalsEl = document.getElementById("grandTotals");
  var addRoundBtn = document.getElementById("addRound");
  var resetBtn = document.getElementById("resetAll");

  var state = loadState() || freshState(cfg.defaultTeams);

  function freshState(teamCount) {
    var teams = [];
    for (var i = 0; i < teamCount; i++) {
      teams.push({ name: "Team " + (i + 1) });
    }
    return { teamCount: teamCount, teams: teams, rounds: [] };
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

  function renderTeamCountOptions() {
    teamCountSel.innerHTML = "";
    for (var n = cfg.minTeams; n <= cfg.maxTeams; n++) {
      var opt = document.createElement("option");
      opt.value = n; opt.textContent = n;
      if (n === state.teamCount) opt.selected = true;
      teamCountSel.appendChild(opt);
    }
  }

  function renderTeams() {
    teamsEl.innerHTML = "";
    state.teams.forEach(function (team, idx) {
      var div = document.createElement("div");
      div.className = "team";
      var h3 = document.createElement("h3");
      h3.textContent = "Team " + (idx + 1);
      var nameInput = document.createElement("input");
      nameInput.type = "text";
      nameInput.value = team.name;
      nameInput.addEventListener("input", function () {
        team.name = nameInput.value;
        saveState();
        renderHistory();
      });
      div.appendChild(h3);
      div.appendChild(nameInput);

      var row = document.createElement("div");
      row.className = "round-row";
      var label = document.createElement("label");
      label.textContent = "This round's points";
      var input = document.createElement("input");
      input.type = "number";
      input.id = "round-input-" + idx;
      input.value = "0";
      row.appendChild(label);
      row.appendChild(input);
      div.appendChild(row);

      teamsEl.appendChild(div);
    });
  }

  function renderHistory() {
    if (state.rounds.length === 0) {
      historyTable.style.display = "none";
      historyHeading.style.display = "none";
      grandTotalsEl.innerHTML = "";
      return;
    }
    historyTable.style.display = "";
    historyHeading.style.display = "";

    historyHead.innerHTML = "<th>Hand</th>" + state.teams.map(function (t) {
      return "<th>" + escapeHtml(t.name) + "</th>";
    }).join("");

    historyBody.innerHTML = "";
    var totals = state.teams.map(function () { return 0; });
    state.rounds.forEach(function (round, i) {
      var tr = document.createElement("tr");
      var tds = "<td>" + (i + 1) + "</td>";
      round.forEach(function (pts, j) {
        totals[j] += pts;
        tds += "<td>" + pts + "</td>";
      });
      tr.innerHTML = tds;
      historyBody.appendChild(tr);
    });

    grandTotalsEl.innerHTML = state.teams.map(function (t, i) {
      return "<span>" + escapeHtml(t.name) + ": " + totals[i] + "</span>";
    }).join("");
  }

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function setTeamCount(n) {
    if (state.rounds.length > 0) {
      if (!confirm("Changing team count will start a new game. Continue?")) {
        teamCountSel.value = state.teamCount;
        return;
      }
    }
    state = freshState(n);
    saveState();
    renderTeamCountOptions();
    renderTeams();
    renderHistory();
  }

  teamCountSel.addEventListener("change", function () {
    setTeamCount(parseInt(teamCountSel.value, 10));
  });

  addRoundBtn.addEventListener("click", function () {
    var round = state.teams.map(function (t, idx) {
      var input = document.getElementById("round-input-" + idx);
      var val = parseInt(input.value, 10);
      return isNaN(val) ? 0 : val;
    });
    state.rounds.push(round);
    saveState();
    state.teams.forEach(function (t, idx) {
      document.getElementById("round-input-" + idx).value = "0";
    });
    renderHistory();
  });

  resetBtn.addEventListener("click", function () {
    if (!confirm("Reset the current game? This clears all hands.")) return;
    state = freshState(state.teamCount);
    saveState();
    renderTeams();
    renderHistory();
  });

  renderTeamCountOptions();
  renderTeams();
  renderHistory();
})();
