let allPlayers = [];
let currentPlayers = [];
let round = 1;
let history = [];

/* LOGIN */
function login() {
  if (username.value === "admin" && password.value === "1234") {
    location.href = "dashboard.html";
  } else {
    msg.innerText = "Invalid Login";
  }
}

/* LOAD EXCEL */
document.addEventListener("change", (e) => {
  if (e.target.id !== "excelFile") return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    const workbook = XLSX.read(evt.target.result, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    allPlayers = XLSX.utils.sheet_to_json(sheet);
    alert("Players Loaded: " + allPlayers.length);
  };
  reader.readAsArrayBuffer(e.target.files[0]);
});

/* START */
function startTournament() {
  const count = playerCount.value;
  currentPlayers = shuffle(allPlayers).slice(0, count);
  round = 1;
  createMatches();
}

/* MATCHMAKING */
function createMatches() {
  matches.innerHTML = "";
  roundTitle.innerText = `Round ${round}`;

  // Rating-based sort
  currentPlayers.sort((a, b) => b.Rating - a.Rating);

  if (currentPlayers.length % 2 !== 0) {
    const bye = currentPlayers.pop();
    history.push({ round, winner: bye.Player, bye: true });
    currentPlayers.push(bye);
    alert(bye.Player + " gets a BYE");
  }

  for (let i = 0; i < currentPlayers.length; i += 2) {
    const p1 = currentPlayers[i];
    const p2 = currentPlayers[i + 1];

    matches.innerHTML += `
      <div class="match">
        ${p1.Player} (${p1.Rating}) vs ${p2.Player} (${p2.Rating})<br>
        <select>
          <option value="">Select Winner</option>
          <option value="${p1.Player}">${p1.Player}</option>
          <option value="${p2.Player}">${p2.Player}</option>
        </select>
      </div>
    `;
  }
}

/* NEXT ROUND */
function nextRound() {
  const selects = document.querySelectorAll("select");
  let winners = [];

  for (let s of selects) {
    if (!s.value) return alert("Select all winners");
    winners.push(allPlayers.find(p => p.Player === s.value));
    history.push({ round, winner: s.value });
  }

  if (winners.length === 1) {
    matches.innerHTML = `<h2>🏆 Champion: ${winners[0].Player}</h2>`;
    return;
  }

  currentPlayers = winners;
  round++;
  createMatches();
}

/* EXPORT RESULTS */
function exportResults() {
  const ws = XLSX.utils.json_to_sheet(history);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Results");
  XLSX.writeFile(wb, "tournament_results.xlsx");
}

/* SHUFFLE */
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}
