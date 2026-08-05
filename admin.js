let games = [];
let filteredGames = [];

const gameList = document.getElementById("gameList");
const search = document.getElementById("search");
const exportBtn = document.getElementById("exportBtn");
const sortAZ = document.getElementById("sortAZ");
const sortBig = document.getElementById("sortBig");
const sortSmall = document.getElementById("sortSmall");
const filterAll = document.getElementById("filterAll");
const filterPC = document.getElementById("filterPC");
const filterSwitch = document.getElementById("filterSwitch");
const filterRetro = document.getElementById("filterRetro");
const addGameBtn = document.getElementById("addGameBtn");
const addGameModal = document.getElementById("addGameModal");

const newTitle = document.getElementById("newTitle");
const newPlatform = document.getElementById("newPlatform");
const newSize = document.getElementById("newSize");
const newCover = document.getElementById("newCover");

const saveNewGame = document.getElementById("saveNewGame");
// Load games
async function loadGames() {

    const response = await fetch("data/games.json");

    games = await response.json();

    filteredGames = [...games];

    renderGames();

    updateStats();

}

function renderGames() {

    gameList.innerHTML = "";

    filteredGames.forEach((game,index)=>{

        gameList.innerHTML += `

        <div class="game-row">

            <img
                src="${game.cover}"
                class="cover"
                alt="${game.title}">

            <div class="game-details">

                <input
    type="text"
    value="${game.title}"
    data-index="${index}"
    class="titleInput">

                <br>

                <small>${game.platform}</small>

            </div>

   <input
    type="number"
    value="${game.size}"
    data-index="${index}"
    class="sizeInput">

<button
    class="deleteBtn"
    data-title="${game.title}">
    🗑 Delete
</button>

        </div>

        `;

    });

    setupInputs();

}

function setupInputs(){

    // Update size
    document.querySelectorAll(".sizeInput").forEach(input=>{

        input.addEventListener("input",()=>{

            const index = input.dataset.index;

            filteredGames[index].size = Number(input.value);

            updateStats();

        });

    });

    // Delete game
    document.querySelectorAll(".deleteBtn").forEach(button=>{// Update title
document.querySelectorAll(".titleInput").forEach(input=>{

    input.addEventListener("input",()=>{

        const index = input.dataset.index;

        filteredGames[index].title = input.value;

    });

});

        button.addEventListener("click",()=>{

            const title = button.dataset.title;

            if(!confirm(`Delete "${title}"?`)) return;

            games = games.filter(game => game.title !== title);

            filteredGames = [...games];

            renderGames();

            updateStats();

        });

    });

}

function updateStats(){

    document.getElementById("totalGames").textContent =
        games.length;

    let total = 0;

    games.forEach(game=>{

        total += Number(game.size);

    });

    document.getElementById("totalStorage").textContent =
        (total / 1024).toFixed(2) + " TB";

    document.getElementById("averageSize").textContent =
        (total / games.length).toFixed(1) + " GB";

}

// Search
search.addEventListener("input",()=>{

    const value = search.value.toLowerCase();

    filteredGames = games.filter(game=>

        game.title.toLowerCase().includes(value)

    );

    renderGames();

});

// Export JSON
exportBtn.addEventListener("click",()=>{

    const blob = new Blob(

        [JSON.stringify(games,null,2)],

        {type:"application/json"}

    );

    const link = document.createElement("a");

    link.href = URL.createObjectURL(blob);

    link.download = "games.json";

    link.click();

});
// ===============================
// SORT BUTTONS
// ===============================

// Sort A-Z
sortAZ.addEventListener("click", () => {

    filteredGames.sort((a, b) =>
        a.title.localeCompare(b.title)
    );

    renderGames();

});

// Largest Games
sortBig.addEventListener("click", () => {

    filteredGames.sort((a, b) =>
        b.size - a.size
    );

    renderGames();

});

// Smallest Games
sortSmall.addEventListener("click", () => {

    filteredGames.sort((a, b) =>
        a.size - b.size
    );

    renderGames();

});
// ===============================
// PLATFORM FILTERS
// ===============================

// Show All
filterAll.addEventListener("click", () => {

    filteredGames = [...games];

    renderGames();

});

// PC
filterPC.addEventListener("click", () => {

    filteredGames = games.filter(game =>
        game.platform.toLowerCase() === "pc"
    );

    renderGames();

});

// Switch
filterSwitch.addEventListener("click", () => {

    filteredGames = games.filter(game =>
        game.platform.toLowerCase() === "switch"
    );

    renderGames();

});

// Retro
filterRetro.addEventListener("click", () => {

    filteredGames = games.filter(game =>
        game.platform.toLowerCase() === "retro"
    );

    renderGames();

});
// ===============================
// ADD GAME
// ===============================

// Show / Hide Add Game panel
addGameBtn.addEventListener("click", () => {

    if (addGameModal.style.display === "none") {

        addGameModal.style.display = "block";

    } else {

        addGameModal.style.display = "none";

    }

});

// Save new game
saveNewGame.addEventListener("click", () => {

    if (newTitle.value.trim() === "") {

        alert("Please enter a game title.");

        return;

    }

    games.push({

        title: newTitle.value.trim(),
        platform: newPlatform.value,
        size: Number(newSize.value) || 0,
        cover: newCover.value.trim(),
        favorite: false

    });

    filteredGames = [...games];

    renderGames();
    updateStats();

    addGameModal.style.display = "none";

    newTitle.value = "";
    newSize.value = "";
    newCover.value = "";

    alert("Game added successfully!\n\nRemember to click '💾 Export JSON' to save your changes.");

});
loadGames();