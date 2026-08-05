// ========================================
// NERBEATS GAME LIBRARY V5
// PART 1
// ========================================

// ---------- STATE ----------
let games = [];
let filteredGames = [];
let packageGames = [];

let currentStorage = 512;

// ---------- DOM ----------
const gameGrid = document.getElementById("game-grid");
const searchInput = document.getElementById("searchInput");

const filterButtons =
document.querySelectorAll(".filter");

const storageSelect =
document.getElementById("storageSelect");

const progressBar =
document.getElementById("progressBar");

const usedStorage =
document.getElementById("usedStorage");

const remainingStorage =
document.getElementById("remainingStorage");

const installList =
document.getElementById("installList");

const packageTotal =
document.getElementById("packageTotal");

const customerName =
document.getElementById("customerName");

const copyPackage =
document.getElementById("copyPackage");

const clearPackage =
document.getElementById("clearPackage");

const heroProgress = document.getElementById("heroProgress");

const toast = document.getElementById("toast");
const toastTitle = document.getElementById("toastTitle");
const toastInfo = document.getElementById("toastInfo");


// HERO SLIDESHOW

const heroImage = document.getElementById("heroImage");

const heroTitle = document.getElementById("heroTitle");

const banners = [
    {
        image:"banners/gta v.jpg",
        title:"GRAND THEFT AUTO V"
    },
    {
        image:"banners/black myth wukong.jpg",
        title:"BLACK MYTH WUKONG"
    },
    {
        image:"banners/red dead redemption 2.jpg",
        title:"RED DEAD REDEMPTION 2"
    },

    // Continue adding all 100 banners...
];

// ========================================
// LOAD GAMES
// ========================================

async function loadGames(){

    try{

        const response =
        await fetch("data/games.json");

        if(!response.ok){

            throw new Error(
                "Unable to load games.json"
            );

        }

        games = await response.json();

games.sort((a, b) =>
    a.title.localeCompare(b.title)
);

filteredGames = [...games];
filteredGames.sort((a, b) =>
    a.title.localeCompare(b.title)
);

        renderGames(filteredGames);

loadTrendingGames();

updatePackage();

    }

    catch(error){

        console.error(error);

        gameGrid.innerHTML=`

            <div class="error">

                <h2>Failed to load games.</h2>

            </div>

        `;

    }

}

// ========================================
// RENDER GAMES
// ========================================

function renderGames(list){

    gameGrid.innerHTML="";

    if(list.length===0){

        gameGrid.innerHTML=`

            <h2>No games found.</h2>

        `;

        return;

    }

    let html="";

    list.forEach(game=>{

        html+=`

     <div class="game-card"
     data-title="${game.title}"
     data-platform="${game.platform}"
     data-size="${game.size}"
     data-cover="${game.cover}">

            <img
                src="${game.cover}"
                alt="${game.title}"
                loading="lazy">

            <div class="game-info">

                <h3>${game.title}</h3>

                <p>

                    🎮 ${game.platform}

                </p>

                <p>

                    💾 ${game.size} GB

                </p>

<div class="game-actions">

    <button
        class="add-btn"
        data-title="${game.title}">

        ➕ ADD

    </button>

</div>

            </div>

        </div>

        `;

    });

    gameGrid.innerHTML=html;

    setupAddButtons();

    document.querySelectorAll(".game-card img").forEach(img => {

    img.style.cursor = "zoom-in";

    img.addEventListener("click", () => {

        document.getElementById("viewerImage").src = img.src;

        document.getElementById("imageViewer").style.display = "flex";

    });

});

// ==========================
// IMAGE VIEWER CLOSE
// ==========================

const viewer = document.getElementById("imageViewer");
const viewerImage = document.getElementById("viewerImage");

// Tap outside image = close
viewer.addEventListener("click", () => {

    viewer.style.display = "none";

});

// Tap on image = do nothing
viewerImage.addEventListener("click", (e) => {

    e.stopPropagation();

});

}


// ========================================
// PACKAGE BUILDER
// ========================================

function setupAddButtons() {

    document.querySelectorAll(".add-btn").forEach(button => {

        const title = button.dataset.title;

        const exists = packageGames.some(g => g.title === title);

        if (exists) {
            button.innerHTML = "✅ ADDED";
            button.classList.add("added");
        } else {
            button.innerHTML = "➕ ADD";
            button.classList.remove("added");
        }

        button.addEventListener("click", (e) => {

    e.stopPropagation();

            const game = games.find(g => g.title === title);

            if (!game) return;

            const alreadyAdded = packageGames.some(g => g.title === title);

            if (alreadyAdded) {

                packageGames = packageGames.filter(g => g.title !== title);

            } else {

                packageGames.push(game);
                toastTitle.textContent = `✅ ${game.title} Added`;

toastInfo.textContent =
`📦 ${packageGames.length} Games`;

toast.classList.add("show");

clearTimeout(window.toastTimer);

window.toastTimer = setTimeout(()=>{

    toast.classList.remove("show");

},2000);

            }

           updatePackage();
renderGames(filteredGames);

// Mobile auto-collapse
if (window.innerWidth <= 768) {

    const planner = document.querySelector(".planner");

    planner.classList.remove("open");

}

        });

    });

}

function updatePackage() {

    installList.innerHTML = "";

    let total = 0;

    if (packageGames.length === 0) {

        installList.innerHTML = "No games added yet...";

    }

    packageGames.forEach((game, index) => {

        total += Number(game.size);

        installList.innerHTML += `

        <div class="package-item">

            <div>

                <strong>${index + 1}. ${game.title}</strong>

                <br>

                <small>${game.size} GB</small>

            </div>

            <button
                class="remove-game"
                data-title="${game.title}">

                ❌

            </button>

        </div>

        `;

    });

    packageTotal.textContent = total + " GB";
    const summary = document.getElementById("plannerSummary");

if(summary){

    summary.textContent =
        `📦 ${packageGames.length} Games • ${total} GB`;

}

    usedStorage.textContent = total + " GB";

const remaining = currentStorage - total;

if (remaining <= 0) {

    remainingStorage.textContent = "Storage Full";

} else {

    remainingStorage.textContent = remaining + " GB";

}

    const percent = Math.min((total / currentStorage) * 100, 100);

progressBar.style.width = percent + "%";

if (percent >= 100) {

    progressBar.style.background = "#ef4444";

} else if (percent >= 80) {

    progressBar.style.background = "#f59e0b";

} else {

    progressBar.style.background = "#22c55e";

}

    document.querySelectorAll(".remove-game").forEach(btn => {

        btn.onclick = () => {

            const title = btn.dataset.title;

            packageGames = packageGames.filter(g => g.title !== title);

            renderGames(filteredGames);

            updatePackage();

        };

    });

}

// ========================================
// SEARCH
// ========================================

searchInput.addEventListener("input", () => {

    const value = searchInput.value.toLowerCase();

   filteredGames = games
    .filter(game =>
        game.title.toLowerCase().includes(value)
    )
    .sort((a, b) =>
        a.title.localeCompare(b.title)
    );

    renderGames(filteredGames);

});

// ========================================
// FILTERS
// ========================================

filterButtons.forEach(button => {

    button.addEventListener("click", () => {

        filterButtons.forEach(btn =>
            btn.classList.remove("active")
        );

        button.classList.add("active");

        const filter = button.textContent.trim();

if (filter === "All") {

    filteredGames = [...games];

} else {

    let platform = filter;

    // Convert the button text to the platform name in games.json
    if (filter === "Switch Exclusives") {
        platform = "Switch";
    }

    filteredGames = games.filter(game =>
        game.platform.toLowerCase() === platform.toLowerCase()
    );

}

renderGames(filteredGames);
    });

});

if (storageSelect) {

    storageSelect.addEventListener("change", () => {

        currentStorage = Number(storageSelect.value);

        updatePackage();

    });

}
// ========================================
// START APPLICATION
// ========================================

loadGames();

if (copyPackage) {

    copyPackage.onclick = () => {

        const customer = customerName.value.trim() || "Customer";

        let text = `NERBEATS GAME PACKAGE\n`;
        text += `Customer: ${customer}\n\n`;

        packageGames.forEach((game, index) => {

            text += `${index + 1}. ${game.title} (${game.size} GB)\n`;

        });

        text += `\nTOTAL: ${packageGames.reduce((t, g) => t + Number(g.size), 0)} GB`;

        navigator.clipboard.writeText(text);

        alert("Package copied!");

    };

}

if (clearPackage) {

    clearPackage.onclick = () => {

        packageGames = [];

        renderGames(filteredGames);

        updatePackage();

    };

}

console.log("NERBEATS GAME LIBRARY V5 READY");



// ========================================
// HERO BANNER
// ========================================

let currentBanner = 0;
let bannerTimer = null;

function showBanner() {

    if (!heroImage || banners.length === 0) return;

    heroImage.style.opacity = 0;

    heroProgress.style.animation = "none";

    setTimeout(() => {

        heroImage.src = banners[currentBanner].image;
        heroTitle.textContent = banners[currentBanner].title;

        heroImage.style.opacity = 1;

        void heroProgress.offsetWidth;

        heroProgress.style.animation =
            "progressFill 5s linear forwards";

    }, 300);

}

function nextBanner() {

    currentBanner++;

    if (currentBanner >= banners.length) {
        currentBanner = 0;
    }

    showBanner();
    restartBannerTimer();

}

function previousBanner() {

    currentBanner--;

    if (currentBanner < 0) {
        currentBanner = banners.length - 1;
    }

    showBanner();
    restartBannerTimer();

}

function restartBannerTimer() {

    clearInterval(bannerTimer);

    bannerTimer = setInterval(() => {

        currentBanner++;

        if (currentBanner >= banners.length) {
            currentBanner = 0;
        }

        showBanner();

    }, 5000);

}

document
    .getElementById("nextBannerBtn")
    ?.addEventListener("click", nextBanner);

document
    .getElementById("prevBanner")
    ?.addEventListener("click", previousBanner);

showBanner();
restartBannerTimer();

    currentBanner--;

    if(currentBanner < 0){

        currentBanner = banners.length - 1;

    }

    showBanner();


document.getElementById("nextBannerBtn").addEventListener("click", nextBanner);

document.getElementById("prevBanner").addEventListener("click", previousBanner);
showBanner();
function loadTrendingGames(){

    const container = document.getElementById("trendingGames");

    if(!container) return;

    container.innerHTML = "";

    const featuredGames = [
    "red dead redemption 2",
    "Black Myth: Wukong",
    "god of war",
    "spider man miles morales",
    "ghost of tsushima",
    "cyberpunk 2077",
    "battlefield 6",
    "call of duty modern warfare",
    "007 first light",
    "undisputed",
    "resident evil requiem",
    "pragmata",
    "mafia the old country",
    "nba 2k26",
    "the last of us part 2",
    "tekken 8",
    "silent hill f",
    "days gone",
    "uncharted 4",
    "hogwarts legacy",
];

featuredGames.forEach(title => {

    const game = games.find(g => g.title === title);

    if (!game) return;

        container.innerHTML += `

            <div class="featured-card">

                <img src="${game.cover}" alt="${game.title}">

                <h3>${game.title}</h3>

            </div>

        `;

    });

    // Duplicate cards for seamless loop
const cards = container.innerHTML;
container.innerHTML = cards + cards;

}// ========================================
// HOME BUTTON
// ========================================

const homeButton = document.querySelector(".home-btn");

if (homeButton) {

    homeButton.addEventListener("click", () => {

        document.getElementById("home").scrollIntoView({

            behavior: "smooth"

        });

    });

}// ========================================
// PC GAMES BUTTON
// ========================================

const pcButton = document.querySelector(".pc-btn");

if (pcButton) {

    pcButton.addEventListener("click", () => {

        document.getElementById("library").scrollIntoView({
            behavior: "smooth"
        });

        document.getElementById("pcFilter")?.click();

    });

}
// ========================================
// PC SIDEBAR BUTTON
// ========================================

const pcSidebar = document.querySelector(".pc-btn");

if (pcSidebar) {

    pcSidebar.addEventListener("click", () => {

        // Scroll to the library
        document.getElementById("library").scrollIntoView({
            behavior: "smooth"
        });

        // Click the existing PC filter
        document.getElementById("pcFilter").click();

    });

}// ========================================
// SWITCH SIDEBAR BUTTON
// ========================================

const switchSidebar = document.querySelector(".switch-btn");

if (switchSidebar) {

    switchSidebar.addEventListener("click", () => {

        // Scroll to the library
        document.getElementById("library").scrollIntoView({
            behavior: "smooth"
        });

        // Click the existing Switch filter
        document.getElementById("switchFilter").click();

    });

}

/* ======================================
   RANDOM HERO VIDEOS
====================================== */

const heroVideo = document.getElementById("heroVideo");

const heroVideos = [
    "assets/videos/hero1.mp4",
    "assets/videos/hero2.mp4",
    "assets/videos/hero3.mp4",
    "assets/videos/hero4.mp4",
    "assets/videos/hero5.mp4",
    "assets/videos/hero6.mp4",
    "assets/videos/hero7.mp4",
    "assets/videos/hero8.mp4",
    "assets/videos/hero9.mp4",
    "assets/videos/hero10.mp4",
    "assets/videos/hero11.mp4",
    "assets/videos/hero12.mp4",
    "assets/videos/hero13.mp4",
    "assets/videos/hero14.mp4",
    "assets/videos/hero15.mp4",
    "assets/videos/hero16.mp4",
    "assets/videos/hero17.mp4",
    "assets/videos/hero18.mp4",
    "assets/videos/hero19.mp4",
    "assets/videos/hero20.mp4",
    "assets/videos/hero21.mp4",
    "assets/videos/hero22.mp4",
    "assets/videos/hero23.mp4",
    "assets/videos/hero24.mp4"
];

let currentVideo = -1;

function playRandomVideo() {

    let randomIndex;

    do {

        randomIndex = Math.floor(Math.random() * heroVideos.length);

    } while (
        randomIndex === currentVideo &&
        heroVideos.length > 1
    );

    currentVideo = randomIndex;

    heroVideo.src = heroVideos[randomIndex];

    heroVideo.load();

    heroVideo.play();

}

playRandomVideo();

heroVideo.addEventListener("ended", playRandomVideo);

/* ===========================
   YOUTUBE VIDEOS
=========================== */

const youtubeVideos = [

    {
        title: "LEGION GO 2 REVIEW",
        thumbnail: "assets/youtube/thumb1.jpg",
        url: "https://youtu.be/SDJ-IEv0-7Y?si=pUAcwpYe7f0-ZFbb"
    },

    {
        title: "ROG XBOX ALLY X REVIEW",
        thumbnail: "assets/youtube/thumb2.jpg",
        url: "https://youtu.be/YnYQq7a7GzQ?si=PzE7F27skIlOoe9p"
    },

    {
        title: "MSI CLAW A8 REVIEW",
        thumbnail: "assets/youtube/thumb3.jpg",
        url: "https://youtu.be/al4Vtv8gCaI?si=ygpaMSysx9Sj5-oN"
    },

    {
        title: "KAILANGAN MO NITO!",
        thumbnail: "assets/youtube/thumb4.jpg",
        url: "https://youtu.be/ae-yNEUnTN4?si=beY8dWbtuPYY4man"
    },

    {
        title: "ROG XBOX ALLY GAMETEST",
        thumbnail: "assets/youtube/thumb5.jpg",
        url: "https://youtu.be/gwaq9fK9F5U?si=RF0QIJF6TvYT6mxu"
    },

    {
        title: "THE BEST NA CONTROLLER!",
        thumbnail: "assets/youtube/thumb6.jpg",
        url: "https://youtu.be/TOTR9jIHBv8"
    },

    {
        title: "STEAMDECK OLED UNBOXING",
        thumbnail: "assets/youtube/thumb7.jpg",
        url: "https://youtu.be/CMbCeQHyAto"
    },

    {
        title: "STEAMDECK LCD GAMETEST",
        thumbnail: "assets/youtube/thumb8.jpg",
        url: "https://youtu.be/Acphmhpp5oM"
    }

];let currentYT = 0;

const ytThumb = document.getElementById("ytThumb");
const ytTitle = document.getElementById("ytTitle");
const ytLink = document.getElementById("ytLink");

function updateYouTubeCard() {

    if (!ytThumb || !ytTitle || !ytLink) return;

    const video = youtubeVideos[currentYT];

    ytThumb.src = video.thumbnail;
    ytTitle.textContent = video.title;
    ytLink.href = video.url;
}

updateYouTubeCard();

setInterval(() => {

    currentYT++;

    if (currentYT >= youtubeVideos.length) {
        currentYT = 0;
    }

    updateYouTubeCard();

}, 5000);

// ========================================
// RETRO SIDEBAR BUTTON
// ========================================

const retroSidebar = document.getElementById("retroBtn");

if (retroSidebar) {

    retroSidebar.addEventListener("click", () => {

        // Scroll to the game library
        document.getElementById("library").scrollIntoView({
            behavior: "smooth"
        });

        // Filter Retro games
        filteredGames = games.filter(game =>
            game.platform.toLowerCase() === "retro"
        );

        renderGames(filteredGames);

    });

}const menuToggle = document.getElementById("menuToggle");
const sidebar = document.querySelector(".sidebar");

menuToggle.addEventListener("click",()=>{

    sidebar.classList.toggle("show");

});
/* Mobile Floating Planner */

function initPlannerToggle() {

    const planner = document.querySelector(".planner");
    const header = document.querySelector(".planner-header");

    if (!planner || !header) return;

    // iwas duplicate listeners
    header.onclick = null;

    header.onclick = function () {

        if (window.innerWidth <= 768) {

            planner.classList.toggle("open");

        }

    };

}

initPlannerToggle();

window.addEventListener("resize", initPlannerToggle);

// =============================
// FLOATING PARTICLES
// =============================

const particles = document.getElementById("particles");

for(let i=0;i<40;i++){

    const p=document.createElement("div");

    p.className="particle";

    p.style.left=Math.random()*100+"%";

    p.style.animationDuration=(8+Math.random()*10)+"s";

    p.style.animationDelay=Math.random()*10+"s";

    p.style.opacity=Math.random();

    const size=2+Math.random()*5;

    p.style.width=size+"px";

    p.style.height=size+"px";

    particles.appendChild(p);

}
// ===================================
// FLOATING LOGO
// ===================================

setInterval(()=>{

    const logo=document.createElement("img");

    logo.src="assets/nerbeats logo.png";   // <-- palitan kung iba ang filename

    logo.className="logo-particle";

    logo.style.left=Math.random()*90+"%";

    logo.style.width=(25+Math.random()*20)+"px";

    particles.appendChild(logo);

    setTimeout(()=>{

        logo.remove();

    },18000);

},20000);