// ========================================
// NERBEATS GAME LIBRARY V5
// PART 1
// ========================================

// ---------- STATE ----------
let games = [];
let filteredGames = [];
let packageGames = [];

let currentStorage = 512;
// V17.4 bridge for robust filter module
window.games = games;
window.filteredGames = filteredGames;

// ---------- DOM ----------
const gameGrid = document.getElementById("game-grid");
const searchInput = document.getElementById("searchInput");

const filterButtons =
document.querySelectorAll(".filter:not(#genreFilterButton)");

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

// V17 builder UI elements (optional on older layouts)
const builderPercent = document.getElementById("builderPercent");
const builderStatus = document.getElementById("builderStatus");
const sharePackage = document.getElementById("sharePackage");

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
        // Support both layouts used by the project. V13/V14 normally uses
        // data/games.json, while some local copies keep games.json at root.
        const paths = ["data/games.json", "games.json"];
        let response = null;
        let lastError = null;

        for (const path of paths) {
            try {
                const candidate = await fetch(path, { cache: "no-store" });
                if (candidate.ok) {
                    response = candidate;
                    console.info("NERBEATS games loaded from:", path);
                    break;
                }
                lastError = new Error(`HTTP ${candidate.status} for ${path}`);
            } catch (err) {
                lastError = err;
            }
        }

        if (!response) {
            throw lastError || new Error("Unable to load games.json");
        }

        const parsed = await response.json();
        if (!Array.isArray(parsed)) {
            throw new Error("games.json must contain a JSON array");
        }

        games = parsed.filter(game => game && game.title);
        window.games = games;
        games.sort((a, b) => String(a.title).localeCompare(String(b.title)));
        filteredGames = [...games];
        window.filteredGames = filteredGames;

        renderGames(filteredGames);
        loadTrendingGames();
        updatePackage();

        if (games.length === 0) {
            console.warn("NERBEATS: games.json loaded but contains 0 valid games.");
        }

    } catch(error){
        console.error("NERBEATS GAME LOAD ERROR:", error);
        if (gameGrid) {
            gameGrid.innerHTML = `
                <div class="error">
                    <h2>Game library could not be loaded.</h2>
                    <p>Check that <b>data/games.json</b> exists in your project.</p>
                </div>
            `;
        }
    }

}

// ========================================
// RENDER GAMES
// ========================================

window.renderGames = function renderGames(list){

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

function animateGameToBuilder(button, game) {

    const card = button.closest(".game-card");
    const sourceImage = card ? card.querySelector("img") : null;
    const planner = document.querySelector(".planner");

    if (!sourceImage || !planner) return;

    const sourceRect = sourceImage.getBoundingClientRect();
    const targetRect = planner.getBoundingClientRect();

    const flying = document.createElement("img");
    flying.className = "flying-game-to-builder";
    flying.src = sourceImage.currentSrc || sourceImage.src || game.cover;
    flying.alt = game.title;

    const size = Math.min(82, Math.max(58, sourceRect.width * 0.34));
    const startLeft = sourceRect.left + (sourceRect.width - size) / 2;
    const startTop = sourceRect.top + (sourceRect.height - size) / 2;
    const targetLeft = targetRect.left + (targetRect.width - size) / 2;
    const targetTop = targetRect.top + (targetRect.height - size) / 2;

    flying.style.width = size + "px";
    flying.style.height = size + "px";
    flying.style.left = startLeft + "px";
    flying.style.top = startTop + "px";
    flying.style.transform = "scale(1) rotate(0deg)";
    flying.style.opacity = "1";

    document.body.appendChild(flying);

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            flying.style.left = targetLeft + "px";
            flying.style.top = targetTop + "px";
            flying.style.transform = "scale(.18) rotate(540deg)";
            flying.style.opacity = ".15";
        });
    });

    setTimeout(() => {
        planner.classList.remove("builder-added");
        void planner.offsetWidth;
        planner.classList.add("builder-added");
    }, 560);

    setTimeout(() => {
        flying.remove();
        planner.classList.remove("builder-added");
    }, 720);
}


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

                // Premium feedback: fly the game cover into the floating package circle.
                animateGameToBuilder(button, game);

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
if (builderPercent) builderPercent.textContent = Math.round(percent) + "% used";
if (builderStatus) {
    builderStatus.textContent = total === 0 ? "Ready" : (percent >= 100 ? "Storage full" : (percent >= 80 ? "Almost full" : "Space available"));
}
const planner = document.getElementById("packageBuilder");
if (planner) {
    planner.classList.toggle("builder-storage-warning", percent >= 80);
}

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

function getFilterName(button){
    if (!button) return "All";
    if (button.id === "pcFilter") return "PC";
    if (button.id === "switchFilter") return "Switch";
    if (button.classList.contains("retro-filter")) return "Retro";
    return "All";
}

function normalizePlatform(value){
    return String(value || "").trim().toLowerCase();
}

function isRetroGame(game){
    const p = normalizePlatform(game.platform);
    return /retro|ps1|ps2|psp|gameboy|game boy|gamecube|n64|famicom|atari|dreamcast|gamegear|mame|nds|neo.?geo|pc engine/i.test(p);
}

window.applyPlatformFilterLegacy = function applyPlatformFilter(filterName){
    const name = String(filterName || "All");
    const q = String(searchInput?.value || "").trim().toLowerCase();

    if (name === "All") {
        filteredGames = games.filter(game =>
            String(game.title || "").toLowerCase().includes(q)
        );
    } else if (name === "Retro") {
        filteredGames = games.filter(game =>
            isRetroGame(game) && String(game.title || "").toLowerCase().includes(q)
        );
    } else {
        filteredGames = games.filter(game =>
            normalizePlatform(game.platform) === name.toLowerCase() &&
            String(game.title || "").toLowerCase().includes(q)
        );
    }

    filteredGames.sort((a,b) => String(a.title || "").localeCompare(String(b.title || "")));
    renderGames(filteredGames);
}

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        filterButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        applyPlatformFilter(getFilterName(button));
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

function buildPackageText(){
    const customer = customerName?.value.trim() || "Customer";
    const total = packageGames.reduce((t,g)=>t+Number(g.size),0);
    let text = `NERBEATS GAME PACKAGE\nCustomer: ${customer}\nStorage: ${currentStorage >= 1024 ? (currentStorage/1024)+" TB" : currentStorage+" GB"}\n\n`;
    packageGames.forEach((game,index)=> text += `${index+1}. ${game.title} (${game.size} GB)\n`);
    text += `\nTOTAL: ${total} GB\nREMAINING: ${Math.max(currentStorage-total,0)} GB`;
    return text;
}

if (copyPackage) {
    copyPackage.onclick = async () => {
        const text = buildPackageText();
        try {
            await navigator.clipboard.writeText(text);
            copyPackage.textContent = "✅ COPIED";
            setTimeout(()=>copyPackage.textContent="📋 COPY PACKAGE",1200);
        } catch(e) {
            window.prompt("Copy your package:", text);
        }
    };
}

if (sharePackage) {
    sharePackage.onclick = async () => {
        const text = buildPackageText();
        if (navigator.share) {
            try { await navigator.share({title:"Nerbeats Game Package", text}); } catch(e) {}
        } else {
            try { await navigator.clipboard.writeText(text); sharePackage.textContent="✅ COPIED"; setTimeout(()=>sharePackage.textContent="↗ SHARE PACKAGE",1200); }
            catch(e) { window.prompt("Copy your package:", text); }
        }
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

    const featuredGames = [
        "red dead redemption 2",
        "Black Myth: Wukong",
        "god of war",
        "spider man miles morales",
        "dragon ball sparking zero",
        "ghost of tsushima",
        "elden ring",
        "forza horizon 6",
        "cyberpunk 2077",
        "crimson desert",
        "avatar frontiers of pandora",
        "fight night champion",
        "battlefield 6",
        "call of duty modern warfare",
        "007 first light",
        "undisputed",
        "resident evil requiem",
        "pragmata",
        "mafia the old country",
        "nba 2k27",
        "the last of us part 2",
        "tekken 8",
        "silent hill f",
        "days gone",
        "uncharted 4",
        "hogwarts legacy"

    ];

    const normalize = value => String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[’‘]/g, "'")
        .replace(/[–—]/g, "-")
        .replace(/[^a-z0-9]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    let html = "";

    featuredGames.forEach(title => {
        const wanted = normalize(title);
        const game = games.find(g => normalize(g.title) === wanted);
        if(!game || !game.cover) return;

        html += `
            <div class="featured-card" data-title="${game.title}" data-platform="${game.platform || ''}" data-size="${game.size || ''}" data-cover="${game.cover}">
                <img src="${game.cover}" alt="${game.title}" loading="lazy">
                <h3>${game.title}</h3>
            </div>
        `;
    });

    // Fallback: always show something if a title differs in games.json.
    if(!html){
        games.slice(0,12).forEach(game => {
            if(!game || !game.cover) return;
            html += `
                <div class="featured-card" data-title="${game.title}">
                    <img src="${game.cover}" alt="${game.title}" loading="lazy">
                    <h3>${game.title}</h3>
                </div>
            `;
        });
    }

    container.innerHTML = html + html;
    container.dataset.trendingReady = "1";

    // Keep all favorite/heart UI disabled.
    container.querySelectorAll('.v21-heart,.favorite-game-btn,.favorite-btn,.fav-btn,.wishlist-btn').forEach(el => el.remove());

    const frame = container.closest('.featured-frame');
    if(!frame) return;

    const next = frame.querySelector('.trending-next');
    const prev = frame.querySelector('.trending-prev');
    const dots = Array.from(frame.querySelectorAll('.trending-dots i'));
    let dotIndex = 0;
    const setDot = () => dots.forEach((dot,i) => dot.classList.toggle('active', i === dotIndex));

    const move = direction => {
        const card = container.querySelector('.featured-card');
        if(!card) return;
        const amount = card.getBoundingClientRect().width + 12;
        if(direction === 'next'){
            if(container.scrollLeft + container.clientWidth >= container.scrollWidth - amount){
                container.scrollTo({left:0, behavior:'smooth'});
            } else {
                container.scrollBy({left:amount, behavior:'smooth'});
            }
            dotIndex = (dotIndex + 1) % Math.max(dots.length,1);
        } else {
            container.scrollBy({left:-amount, behavior:'smooth'});
            dotIndex = (dotIndex - 1 + Math.max(dots.length,1)) % Math.max(dots.length,1);
        }
        setDot();
    };

    if(next) next.onclick = () => move('next');
    if(prev) prev.onclick = () => move('prev');
    setDot();

    clearInterval(window.nerbeatsTrendingTimer);
    window.nerbeatsTrendingTimer = setInterval(() => move('next'), 3500);
}

// ========================================
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

    const playPromise = heroVideo.play();
    if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
    }

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

// ============================================================
// PREMIUM MOBILE TRENDING AUTO-SWIPE
// ============================================================
(function(){
  function startPremiumTrendingSwipe(){
    const row=document.getElementById('trendingGames');
    if(!row || row.dataset.autoSwipe==='1') return;
    row.dataset.autoSwipe='1';
    let timer;
    const step=()=>{
      if(window.innerWidth>768) return;
      const card=row.querySelector('.game-card');
      if(!card) return;
      const amount=card.getBoundingClientRect().width+12;
      const end=row.scrollLeft+row.clientWidth>=row.scrollWidth-8;
      row.scrollTo({left:end?0:row.scrollLeft+amount,behavior:'smooth'});
    };
    const start=()=>{clearInterval(timer);timer=setInterval(step,3200)};
    row.addEventListener('touchstart',()=>clearInterval(timer),{passive:true});
    row.addEventListener('touchend',start,{passive:true});
    start();
    window.addEventListener('resize',start);
  }
  document.addEventListener('DOMContentLoaded',startPremiumTrendingSwipe);
  setTimeout(startPremiumTrendingSwipe,1500);
})();


/* ============================================================
   V14.2 — MOBILE TOP CONTROLS
   ============================================================ */
(function(){
  const menuBtn = document.getElementById('mobileMenuTop');
  const searchBtn = document.getElementById('mobileSearchTop');
  const sidebar = document.querySelector('.sidebar');

  function closeDrawer(){
    if(!sidebar) return;
    sidebar.classList.remove('mobile-drawer');
    document.body.classList.remove('mobile-menu-open');
  }

  if(menuBtn && sidebar){
    menuBtn.addEventListener('click', function(e){
      e.preventDefault();
      const open = sidebar.classList.toggle('mobile-drawer');
      document.body.classList.toggle('mobile-menu-open', open);
    });
  }

  if(searchBtn){
    searchBtn.addEventListener('click', function(){
      const toolbar = document.querySelector('.toolbar');
      const input = document.getElementById('searchInput');
      if(toolbar) toolbar.scrollIntoView({behavior:'smooth', block:'center'});
      setTimeout(function(){ if(input){ input.focus(); input.select(); } }, 350);
    });
  }

  document.addEventListener('click', function(e){
    if(!document.body.classList.contains('mobile-menu-open')) return;
    if(sidebar && !sidebar.contains(e.target) && e.target !== menuBtn){
      closeDrawer();
    }
  });
})();


/* V15 — mobile library view and unified platform navigation. */
(function () {
  const nav = document.querySelector('.mobile-bottom-nav');
  const filters = Array.from(document.querySelectorAll('.filters .filter'));
  const input = document.getElementById('searchInput');
  const grid = document.getElementById('game-grid');
  const toolbar = document.querySelector('.toolbar');
  if (!nav || !grid || !toolbar) return;

  function activeNav(target) {
    nav.querySelectorAll('.mobile-nav-item').forEach(btn => {
      const active = btn.dataset.target === target;
      btn.classList.toggle('active', active);
      if (active) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });
  }
  function showLibrary(platform) {
    document.body.classList.add('v15-library-view');
    activeNav('library');
    if (platform) {
      const selected = filters.find(b => b.textContent.trim().toLowerCase() === platform.toLowerCase());
      if (selected) selected.click();
    }
    window.scrollTo({top:0, behavior:'smooth'});
  }
  function showHome() {
    document.body.classList.remove('v15-library-view');
    activeNav('home');
    window.scrollTo({top:0, behavior:'smooth'});
  }

  // Capture before the older V14 navigation handlers so they don't scroll
  // to hidden home elements or overwrite the active tab.
  nav.addEventListener('click', function (e) {
    const btn = e.target.closest('.mobile-nav-item');
    if (!btn) return;
    const target = btn.dataset.target;
    if (target === 'home' || target === 'library') {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      if (target === 'home') showHome(); else showLibrary();
    }
  }, true);

  // View All should open the complete browseable library, not the preview rail.
  document.querySelectorAll('.latest-view-all, .trending-view-all').forEach(btn => {
    btn.addEventListener('click', function(e) {
      if (window.innerWidth > 768) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      showLibrary();
    }, true);
  });

  // Sidebar platform links enter the library on mobile.
  [['.pc-btn','PC'], ['.switch-btn','Switch'], ['.retro-btn','Retro']].forEach(([selector, platform]) => {
    const btn = document.querySelector(selector);
    if (btn) btn.addEventListener('click', function(e) {
      if (window.innerWidth > 768) return;
      e.stopImmediatePropagation();
      showLibrary(platform);
      document.querySelector('.sidebar')?.classList.remove('mobile-drawer');
      document.body.classList.remove('mobile-menu-open');
    }, true);
  });

  // Search and category choices are always visible in the full Library.
  const topSearch = document.getElementById('mobileSearchTop');
  if (topSearch) topSearch.addEventListener('click', function(e) {
    if (window.innerWidth > 768) return;
    e.stopImmediatePropagation();
    showLibrary();
    setTimeout(() => input?.focus(), 120);
  }, true);

  // Correct the retro chip even if the source JSON uses platform names such
  // as PS1/PS2/PSP, rather than literally "Retro".
  const retro = filters.find(b => b.textContent.trim().toLowerCase() === 'retro');
  if (retro) retro.addEventListener('click', function(e) {
    e.stopImmediatePropagation();
    filters.forEach(b => b.classList.toggle('active', b === retro));
    const retroPlatforms = /retro|ps1|ps2|psp|gameboy|game boy|gamecube|n64|famicom|atari|dreamcast|gamegear|mame|nds|neo.?geo|pc engine/i;
    const q = (input?.value || '').toLowerCase();
    if (typeof games !== 'undefined' && typeof filteredGames !== 'undefined' && typeof renderGames === 'function') {
      filteredGames = games.filter(g => retroPlatforms.test(String(g.platform || '')) &&
        String(g.title || '').toLowerCase().includes(q));
      renderGames(filteredGames);
    }
  }, true);

  // Existing V14 search handler filters all games; preserve the selected
  // platform when typing into the full Library.
  input?.addEventListener('input', function() {
    const selected = filters.find(b => b.classList.contains('active'));
    if (selected && selected.textContent.trim().toLowerCase() !== 'all') selected.click();
  });
})();

/* ==========================================================
   V16 — GAME DETAILS
   ========================================================== */
(function(){
  const modal=document.getElementById('gameDetailsModal');
  const cover=document.getElementById('detailsCover');
  const title=document.getElementById('detailsTitle');
  const platform=document.getElementById('detailsPlatform');
  const platform2=document.getElementById('detailsPlatform2');
  const size=document.getElementById('detailsSize');
  const add=document.getElementById('detailsAdd');
  if(!modal) return;
  let selected=null;
  function close(){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.classList.remove('details-open'); selected=null; }
  function open(game){
    if(!game) return;
    selected=game;
    cover.src=game.cover||''; cover.alt=game.title||'Game cover';
    title.textContent=game.title||'Game';
    platform.textContent=game.platform||'Game';
    platform2.textContent=game.platform||'Unknown';
    size.textContent=game.size ?? '—';
    modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.classList.add('details-open');
  }
  document.addEventListener('click',function(e){
    const card=e.target.closest('.game-card');
    if(!card || e.target.closest('.add-btn') || e.target.closest('.remove-game')) return;
    const game=(typeof games!=='undefined') ? games.find(g=>g.title===card.dataset.title) : null;
    if(game){ e.preventDefault(); e.stopPropagation(); open(game); }
  },true);
  document.querySelectorAll('[data-close-details]').forEach(el=>el.addEventListener('click',close));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))close();});
  add?.addEventListener('click',function(){
    if(!selected) return;
    const existing=typeof packageGames!=='undefined' && packageGames.some(g=>g.title===selected.title);
    if(!existing){ packageGames.push(selected); if(typeof updatePackage==='function') updatePackage(); }
    close();
    const btn=Array.from(document.querySelectorAll('.add-btn')).find(b=>b.dataset.title===selected.title);
    if(btn) btn.click();
  });
})();

/* V17.4 — robust platform matching for existing games.json labels */
(function(){
  const normalize = v => String(v ?? '').trim().toLowerCase();
  const originalApply = window.applyPlatformFilter;

  function platformBucket(game){
    const p = normalize(game && game.platform);
    if (/switch|nintendo/.test(p)) return 'Switch';
    if (/retro|ps1|ps2|psp|gameboy|game boy|gamecube|n64|famicom|atari|dreamcast|gamegear|mame|nds|neo.?geo|pc engine/.test(p)) return 'Retro';
    if (/^pc$|pc game|windows|steam|epic|microsoft|computer/.test(p)) return 'PC';
    return p;
  }

  window.applyPlatformFilter = function(name){
    const target = String(name || 'All');
    const q = String(document.getElementById('searchInput')?.value || '').trim().toLowerCase();
    if (!Array.isArray(window.games) || typeof window.renderGames !== 'function') return;
    let list = window.games.filter(g => String(g.title || '').toLowerCase().includes(q));
    if (target !== 'All') list = list.filter(g => platformBucket(g) === target);
    list.sort((a,b) => String(a.title||'').localeCompare(String(b.title||'')));
    window.filteredGames = list;
    window.renderGames(list);
  };

  // Rebind the four visible filter buttons once, using data-filter instead of
  // textContent so icons never affect the selected platform.
  const buttons = Array.from(document.querySelectorAll('.filters .filter'));
  buttons.forEach(btn => {
    btn.dataset.filter = btn.id === 'pcFilter' ? 'PC' : btn.id === 'switchFilter' ? 'Switch' : btn.classList.contains('retro-filter') ? 'Retro' : 'All';
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      buttons.forEach(b => b.classList.toggle('active', b === btn));
      window.applyPlatformFilter(btn.dataset.filter);
    }, true);
  });

  // Keep search inside the currently selected platform.
  const search = document.getElementById('searchInput');
  if(search) search.addEventListener('input', function(){
    const active = buttons.find(b => b.classList.contains('active')) || buttons[0];
    window.applyPlatformFilter(active?.dataset.filter || 'All');
  }, true);

  // Make the current library render recoverable after any earlier handler.
  window.addEventListener('load', function(){
    const active = buttons.find(b => b.classList.contains('active')) || buttons[0];
    setTimeout(() => window.applyPlatformFilter(active?.dataset.filter || 'All'), 50);
  });
})();


/* V18 — touch feedback only */
(function(){
  document.addEventListener('pointerdown', function(e){
    const card = e.target.closest('.game-card');
    if(!card || e.target.closest('.add-btn')) return;
    card.classList.add('v18-pressed');
  }, {passive:true});
  document.addEventListener('pointerup', function(){
    document.querySelectorAll('.v18-pressed').forEach(el=>el.classList.remove('v18-pressed'));
  }, {passive:true});
  document.addEventListener('pointercancel', function(){
    document.querySelectorAll('.v18-pressed').forEach(el=>el.classList.remove('v18-pressed'));
  }, {passive:true});
})();


/* V19 — search UX layer */
(function(){
  const input = document.getElementById('searchInput');
  const clear = document.getElementById('v19ClearSearch');
  if(!input || !clear) return;

  function sync(){
    clear.style.display = input.value.trim() ? 'flex' : 'none';
  }

  input.addEventListener('input', sync);
  input.addEventListener('search', sync);

  clear.addEventListener('click', function(){
    input.value = '';
    input.dispatchEvent(new Event('input', {bubbles:true}));
    input.focus();
    sync();
  });

  sync();

  // Clear stale hash anchors when entering a clean Library search.
  document.addEventListener('click', function(e){
    const btn = e.target.closest('.v19-clear-search');
    if(btn) window.history.replaceState(null,'',window.location.pathname);
  }, true);
})();


/* V20 — dashboard stats and quick actions */
(function(){
  const $ = (id) => document.getElementById(id);

  function getGames(){
    if(Array.isArray(window.games)) return window.games;
    if(Array.isArray(window.allGames)) return window.allGames;
    if(Array.isArray(window.filteredGames) && window.filteredGames.length) return window.filteredGames;
    return [];
  }

  function platformText(g){
    return String(g?.platform ?? g?.system ?? g?.category ?? '').toLowerCase();
  }

  function isPC(g){
    return /(^|[^a-z])(pc|windows|steam|epic|rog|legion|msi claw)([^a-z]|$)/i.test(platformText(g));
  }
  function isSwitch(g){
    return /switch|nintendo/i.test(platformText(g));
  }
  function isRetro(g){
    return /ps1|ps2|psp|gameboy|game boy|gamecube|n64|famicom|atari|dreamcast|gamegear|mame|nds|neo.?geo|pc engine|retro/i.test(platformText(g));
  }

  function updateDashboard(){
    const games = getGames();
    const set = (id,n) => { const el=$(id); if(el) el.textContent=String(n); };
    set('v20TotalGames', games.length);
    set('v20PcGames', games.filter(isPC).length);
    set('v20SwitchGames', games.filter(isSwitch).length);
    set('v20RetroGames', games.filter(isRetro).length);
  }

  function clickFilter(name){
    const buttons = Array.from(document.querySelectorAll('.filters .filter'));
    const b = buttons.find(btn => {
      const id = (btn.dataset.filter || btn.dataset.platform || '').toLowerCase();
      const text = btn.textContent.toLowerCase();
      return id === name || (name === 'all' && text.includes('all')) ||
        (name === 'pc' && /\bpc\b/.test(text)) ||
        (name === 'switch' && text.includes('switch')) ||
        (name === 'retro' && text.includes('retro'));
    });
    if(b) b.click();
  }

  document.addEventListener('click', function(e){
    const stat = e.target.closest('[data-v20-filter]');
    if(stat){
      e.preventDefault();
      clickFilter(stat.dataset.v20Filter);
      document.getElementById('game-grid')?.scrollIntoView({behavior:'smooth',block:'start'});
      return;
    }
    const scrollBtn = e.target.closest('[data-v20-scroll]');
    if(scrollBtn){
      e.preventDefault();
      const target = document.getElementById(scrollBtn.dataset.v20Scroll);
      target?.scrollIntoView({behavior:'smooth',block:'start'});
    }
  }, true);

  $('v20ResetDashboard')?.addEventListener('click', function(){
    clickFilter('all');
    const input=document.getElementById('searchInput');
    if(input){
      input.value='';
      input.dispatchEvent(new Event('input',{bubbles:true}));
    }
  });

  updateDashboard();
  setTimeout(updateDashboard, 400);
  setTimeout(updateDashboard, 1000);
  window.addEventListener('load', updateDashboard);
})();


/* V21 — client-side Favorites + Recently Viewed */
(function(){
  const FAV_KEY = 'nerbeats_v21_favorites';
  const RECENT_KEY = 'nerbeats_v21_recent';
  let v21View = 'favorites';

  const read = (key) => {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); }
    catch { return []; }
  };
  const write = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  };

  function gameId(g, index){
    return String(g?.id ?? g?.slug ?? g?.title ?? g?.name ?? `game-${index}`);
  }
  function gameTitle(g){
    return String(g?.title ?? g?.name ?? 'Untitled Game');
  }
  function gameImage(g){
    return g?.cover || g?.image || g?.thumbnail || g?.img || '';
  }

  function allLoadedGames(){
    if(Array.isArray(window.games)) return window.games;
    if(Array.isArray(window.allGames)) return window.allGames;
    return [];
  }

  function getByIds(ids){
    const games = allLoadedGames();
    const map = new Map(games.map((g,i)=>[gameId(g,i),g]));
    return ids.map(id=>map.get(String(id))).filter(Boolean);
  }

  function saveRecent(g, index){
    const id = gameId(g,index);
    const recent = read(RECENT_KEY).filter(x=>String(x)!==id);
    recent.unshift(id);
    write(RECENT_KEY, recent.slice(0,12));
    renderCollections();
  }

  function toggleFavorite(g, index){
    const id = gameId(g,index);
    const fav = read(FAV_KEY).map(String);
    const pos = fav.indexOf(id);
    if(pos >= 0) fav.splice(pos,1);
    else fav.unshift(id);
    write(FAV_KEY, fav.slice(0,100));
    updateFavoriteButtons();
    renderCollections();
  }

  function updateFavoriteButtons(){
    const fav = new Set(read(FAV_KEY).map(String));
    document.querySelectorAll('.game-card').forEach((card)=>{
      if(card.querySelector('.v21-heart')) return;
      const titleEl = card.querySelector('h3,.game-title,.title');
      const title = titleEl?.textContent?.trim();
      if(!title) return;
      const games = allLoadedGames();
      const idx = games.findIndex(g=>gameTitle(g).trim().toLowerCase()===title.toLowerCase());
      if(idx < 0) return;
      const id = gameId(games[idx],idx);
      const heart = document.createElement('button');
      heart.type='button';
      heart.className='v21-heart';
      heart.setAttribute('aria-label','Toggle favorite');
      heart.textContent = fav.has(id) ? '♥' : '♡';
      heart.addEventListener('click',(e)=>{
        e.preventDefault(); e.stopPropagation();
        toggleFavorite(games[idx],idx);
      });
      card.style.position='relative';
      card.appendChild(heart);
    });
    document.querySelectorAll('.v21-heart').forEach((heart)=>{
      const card=heart.closest('.game-card');
      const title=card?.querySelector('h3,.game-title,.title')?.textContent?.trim();
      const games=allLoadedGames();
      const idx=games.findIndex(g=>gameTitle(g).trim().toLowerCase()===String(title).toLowerCase());
      if(idx>=0) heart.textContent = new Set(read(FAV_KEY).map(String)).has(gameId(games[idx],idx)) ? '♥' : '♡';
    });
  }

  function renderCollections(){
    const grid=document.getElementById('v21CollectionGrid');
    const empty=document.getElementById('v21Empty');
    if(!grid || !empty) return;

    const favIds=read(FAV_KEY);
    const recentIds=read(RECENT_KEY);
    const ids=v21View==='favorites' ? favIds : recentIds;
    const games=getByIds(ids);

    const fc=document.getElementById('v21FavCount');
    const rc=document.getElementById('v21RecentCount');
    if(fc) fc.textContent=String(favIds.length);
    if(rc) rc.textContent=String(recentIds.length);

    grid.innerHTML='';
    games.slice(0,12).forEach((g)=>{
      const id=gameId(g,0);
      const card=document.createElement('article');
      card.className='v21-mini-card';
      const img=document.createElement('img');
      img.loading='lazy';
      img.src=gameImage(g);
      img.alt=gameTitle(g);
      const info=document.createElement('div');
      info.className='v21-mini-info';
      const strong=document.createElement('strong');
      strong.textContent=gameTitle(g);
      info.appendChild(strong);
      const heart=document.createElement('button');
      heart.type='button'; heart.className='v21-heart';
      heart.textContent='♥'; heart.setAttribute('aria-label','Remove from favorites');
      heart.addEventListener('click',(e)=>{
        e.stopPropagation();
        const all=allLoadedGames(); const idx=all.findIndex(x=>gameId(x,0)===id);
        if(idx>=0) toggleFavorite(all[idx],idx);
      });
      card.append(img,info,heart);
      card.addEventListener('click',()=>{
        const all=allLoadedGames(); const idx=all.findIndex(x=>gameId(x,0)===id);
        if(idx>=0) saveRecent(all[idx],idx);
        document.getElementById('game-grid')?.scrollIntoView({behavior:'smooth',block:'start'});
      });
      grid.appendChild(card);
    });

    empty.hidden=games.length>0;
  }

  function bind(){
    document.querySelectorAll('[data-v21-view]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        v21View=btn.dataset.v21View;
        document.querySelectorAll('[data-v21-view]').forEach(b=>{
          const active=b===btn;
          b.classList.toggle('active',active);
          b.setAttribute('aria-selected',active?'true':'false');
        });
        renderCollections();
      });
    });

    document.getElementById('v21FavoritesOnly')?.addEventListener('click',()=>{
      v21View='favorites';
      document.querySelectorAll('[data-v21-view]').forEach(b=>{
        const active=b.dataset.v21View==='favorites';
        b.classList.toggle('active',active);
        b.setAttribute('aria-selected',active?'true':'false');
      });
      renderCollections();
      document.getElementById('v21Collections')?.scrollIntoView({behavior:'smooth',block:'start'});
    });

    document.addEventListener('click',(e)=>{
      const add=e.target.closest('.add-btn');
      if(add) return;
      const card=e.target.closest('.game-card');
      if(!card) return;
      const title=card.querySelector('h3,.game-title,.title')?.textContent?.trim();
      if(!title) return;
      const games=allLoadedGames();
      const idx=games.findIndex(g=>gameTitle(g).trim().toLowerCase()===title.toLowerCase());
      if(idx>=0) saveRecent(games[idx],idx);
    }, true);

    renderCollections();
    setTimeout(()=>{ updateFavoriteButtons(); renderCollections(); },700);
    setTimeout(()=>{ updateFavoriteButtons(); renderCollections(); },1400);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bind);
  else bind();
})();


/* V22 — franchise grouping */
(function(){
  const rules = [
    ['Grand Theft Auto',/\bgrand theft auto\b|\bgta\b/i],
    ['Assassin’s Creed',/assassin.?s creed/i],
    ['God of War',/\bgod of war\b/i],
    ['Spider-Man',/spider.?man/i],
    ['Batman',/\bbatman\b|\bar?kham\b/i],
    ['Resident Evil',/resident evil/i],
    ['Call of Duty',/call of duty/i],
    ['Battlefield',/battlefield/i],
    ['NBA 2K',/\bnba 2k\b/i],
    ['Madden NFL',/madden nfl/i],
    ['Need for Speed',/need for speed/i],
    ['Final Fantasy',/final fantasy/i],
    ['Dragon Ball',/dragon ball/i],
    ['Tekken',/\btekken\b/i],
    ['Mortal Kombat',/mortal kombat/i],
    ['Street Fighter',/street fighter/i],
    ['Mario',/\bmario\b/i],
    ['The Legend of Zelda',/legend of zelda|\bzelda\b/i],
    ['Pokémon',/pokemon|pokémon/i],
    ['Metroid',/\bmetroid\b/i],
    ['Fire Emblem',/fire emblem/i],
    ['Forza',/\bforza\b/i],
    ['Far Cry',/far cry/i],
    ['Tomb Raider',/tomb raider/i],
    ['Uncharted',/\buncharted\b/i],
    ['The Last of Us',/the last of us/i],
    ['Horizon',/\bhorizon (zero dawn|forbidden west)/i],
    ['Resident Evil',/resident evil/i]
  ];

  let selected='';

  function games(){
    if(Array.isArray(window.games)) return window.games;
    if(Array.isArray(window.allGames)) return window.allGames;
    return [];
  }
  function title(g){return String(g?.title??g?.name??'Untitled Game');}
  function cover(g){return g?.cover||g?.image||g?.thumbnail||g?.img||'';}

  function build(){
    const list=document.getElementById('v22FranchiseList');
    if(!list) return;
    const data=games();
    const seen=new Map();

    rules.forEach(([name,re])=>{
      const matches=data.filter(g=>re.test(title(g)));
      if(matches.length) seen.set(name,matches);
    });

    list.innerHTML='';
    seen.forEach((arr,name)=>{
      const b=document.createElement('button');
      b.type='button'; b.className='v22-franchise';
      b.dataset.franchise=name;
      b.innerHTML=`${name}<span>${arr.length}</span>`;
      b.addEventListener('click',()=>{
        selected=name;
        list.querySelectorAll('.v22-franchise').forEach(x=>x.classList.toggle('active',x===b));
        render(name,arr);
      });
      list.appendChild(b);
    });

    const clear=document.getElementById('v22Clear');
    clear?.addEventListener('click',()=>{
      selected='';
      list.querySelectorAll('.v22-franchise').forEach(x=>x.classList.remove('active'));
      const grid=document.getElementById('v22FranchiseGames');
      if(grid){grid.classList.remove('open');grid.innerHTML='';}
    });
  }

  function render(name,arr){
    const grid=document.getElementById('v22FranchiseGames');
    if(!grid)return;
    grid.innerHTML='';
    arr.slice(0,10).forEach(g=>{
      const card=document.createElement('article');
      card.className='v22-fgame';
      const img=document.createElement('img'); img.loading='lazy'; img.src=cover(g); img.alt=title(g);
      const strong=document.createElement('strong'); strong.textContent=title(g);
      card.append(img,strong);
      card.addEventListener('click',()=>{
        const target=[...document.querySelectorAll('.game-card')].find(c=>{
          const h=c.querySelector('h3,.game-title,.title');
          return h && h.textContent.trim().toLowerCase()===title(g).trim().toLowerCase();
        });
        target?.scrollIntoView({behavior:'smooth',block:'center'});
      });
      grid.appendChild(card);
    });
    grid.classList.add('open');
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',build);
  else build();
  setTimeout(build,900);
})();


/* ===== V23: NEON EFFECT FOR LOGO-SIDE CHARACTERS ===== */
(function initV23NeonCharacters(){
  function enhance(){
    const candidates = Array.from(document.querySelectorAll(
      'img[class*="character"], img[class*="mascot"], .character img, .characters img, .mascot img'
    ));
    candidates.forEach(img => {
      const parent = img.parentElement;
      if (!parent || parent.classList.contains('nb-character-neon')) return;
      parent.classList.add('nb-character-neon');
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhance, {once:true});
  } else {
    enhance();
  }
})();

/* ============================================================
   FINAL V30 — HARD REMOVE LEGACY HEARTS
   ============================================================ */
(function(){
  function removeLegacyHearts(root=document){
    root.querySelectorAll?.('.v21-heart,.favorite-game-btn,.favorite-btn,.fav-btn,.wishlist-btn,.heart-btn,.game-card .heart,.game-card .favorite,.game-card .fav').forEach(el=>el.remove());
  }
  document.addEventListener('DOMContentLoaded',()=>{
    removeLegacyHearts();
    new MutationObserver(()=>removeLegacyHearts()).observe(document.body,{subtree:true,childList:true});
  });
})();


/* ============================================================
   NERBEATS RANDOM GAME PACKAGE BUILDER
   Select 512GB / 1TB / 2TB, then generate a REAL game list whose
   total is exactly the selected capacity.
   ============================================================ */
(function(){
  function initNerbeatsRandomPicker(){
    const modal=document.getElementById('randomPackageModal');
    const result=document.getElementById('randomPackageResult');
    const pick=document.getElementById('pickRandomPackage');
    const use=document.getElementById('useRandomPackage');
    const closeEls=document.querySelectorAll('[data-random-close]');
    const storage=document.getElementById('storageSelect');
    const options=[...document.querySelectorAll('.random-package-option')];
    if(!modal || !pick) return;

    let selectedCapacity=null;
    let generatedGames=[];

    function formatCapacity(v){
      return v>=1024 ? (v/1024)+' TB' : v+' GB';
    }

    function shuffle(arr){
      const a=[...arr];
      for(let i=a.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [a[i],a[j]]=[a[j],a[i]];
      }
      return a;
    }

    // Exact subset-sum. Game sizes are integer GB, so a compact DP can
    // reliably find a package that lands exactly on 512 / 1024 / 2048 GB.
    function findExactPackage(target){
      const source=(Array.isArray(window.games)?window.games:games||[])
        .filter(g=>g && g.title && Number(g.size)>0 && Number(g.size)<=target);
      const candidates=shuffle(source);
      const dp=new Array(target+1).fill(null);
      dp[0]=[];

      for(const game of candidates){
        const size=Math.round(Number(game.size));
        if(!Number.isFinite(size) || size<=0 || size>target) continue;
        for(let sum=target-size;sum>=0;sum--){
          if(dp[sum]!==null && dp[sum+size]===null){
            dp[sum+size]=dp[sum].concat(game);
          }
        }
        if(dp[target]) return shuffle(dp[target]);
      }
      return null;
    }

    function showPackage(gamesList,target){
      const total=gamesList.reduce((sum,g)=>sum+Number(g.size),0);
      const count=gamesList.length;
      result.innerHTML=`<div class="random-result-main">🎉 ${count} GAMES SELECTED</div><div class="random-result-total">TOTAL: <b>${total} GB</b> / ${formatCapacity(target)}</div>`;
      result.classList.add('has-package');
      let list=result.querySelector('.random-result-list');
      if(!list){
        list=document.createElement('div');
        list.className='random-result-list';
        result.appendChild(list);
      }
      list.innerHTML=gamesList.map((g,i)=>`<div><span>${i+1}. ${g.title}</span><b>${g.size} GB</b></div>`).join('');
    }

    function clearResult(){
      generatedGames=[];
      result.classList.remove('has-package');
      result.textContent=selectedCapacity ? `Ready to build ${formatCapacity(selectedCapacity)}` : 'Choose your storage size';
      if(use) use.disabled=true;
    }

    window.openNerbeatsRandomPicker=function(){
      modal.classList.add('show');
      modal.setAttribute('aria-hidden','false');
      selectedCapacity=null;
      options.forEach(o=>o.classList.remove('selected'));
      clearResult();
    };

    function close(){modal.classList.remove('show');modal.setAttribute('aria-hidden','true');}
    closeEls.forEach(el=>el.addEventListener('click',close));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('show')) close();});

    options.forEach(btn=>btn.addEventListener('click',function(){
      selectedCapacity=Number(btn.dataset.package);
      options.forEach(o=>o.classList.toggle('selected',o===btn));
      generatedGames=[];
      result.classList.remove('has-package');
      result.textContent=`Ready to build ${formatCapacity(selectedCapacity)}`;
      if(use) use.disabled=true;
    }));

    pick.addEventListener('click',function(){
      if(!selectedCapacity){
        result.textContent='⚠️ SELECT 512 GB, 1 TB OR 2 TB FIRST';
        return;
      }
      pick.disabled=true;
      if(use) use.disabled=true;
      result.classList.remove('has-package');
      result.innerHTML='<div class="random-result-main">🎲 BUILDING EXACT PACKAGE...</div><div class="random-result-total">Finding games that total exactly '+formatCapacity(selectedCapacity)+'...</div>';

      setTimeout(()=>{
        const found=findExactPackage(selectedCapacity);
        if(found){
          generatedGames=found;
          showPackage(found,selectedCapacity);
          if(use) use.disabled=false;
        }else{
          generatedGames=[];
          result.innerHTML='<div class="random-result-main">⚠️ EXACT PACKAGE NOT FOUND</div><div class="random-result-total">Try Random Again. The library will use a different combination.</div>';
        }
        pick.disabled=false;
      },120);
    });

    if(use) use.addEventListener('click',function(){
      if(!generatedGames.length || !selectedCapacity) return;
      packageGames=[...generatedGames];
      if(storage){
        storage.value=String(selectedCapacity);
        currentStorage=selectedCapacity;
        storage.dispatchEvent(new Event('change',{bubbles:true}));
      }
      if(typeof updatePackage==='function') updatePackage();
      if(typeof renderGames==='function') renderGames(filteredGames);
      close();
      const builder=document.getElementById('packageBuilder');
      if(builder){builder.classList.add('open');builder.scrollIntoView({behavior:'smooth',block:'center'});}
    });

    // Hero Random Game button also opens the same safe picker.
    document.getElementById('randomBtn')?.addEventListener('click',function(e){
      e.preventDefault();
      window.openNerbeatsRandomPicker();
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initNerbeatsRandomPicker,{once:true});
  else initNerbeatsRandomPicker();
})();

/* ============================================================
   GENRE FILTER — standalone and safe
   ============================================================ */
(function(){
  const button=document.getElementById('genreFilterButton');
  const menu=document.getElementById('genreMenu');
  if(!button||!menu) return;

  const keywords={
    Action:['god of war','devil may cry','spider-man','spider man','ghost of tsushima','assassin','tomb raider','uncharted','days gone','resident evil','sekiro','elden ring','batman','doom','control','cyberpunk','deadpool','death stranding'],
    Adventure:['adventure','tomb raider','uncharted','zelda','doraemon','life is strange','little nightmares','resident evil','silent hill','ghost of tsushima','horizon','assassin'],
    RPG:['final fantasy','dragon age','dragon quest','persona','monster hunter','elden ring','dark souls','sekiro','cyberpunk','baldur','octopath','tales of','nier','god eater'],
    Shooter:['call of duty','battlefield','doom','far cry','borderlands','destiny','metro','resident evil','crysis','sniper','counter-strike','halo','gears of war','rainbow six'],
    Racing:['forza','need for speed','nfs','gran turismo','assetto corsa','carx','f1 ','f1 20','f1 21','f1 22','f1 23','f1 24','f1 25','mario kart','riders republic','the crew'],
    Sports:['nba 2k','nba 2k26','nba 2k27','fc 26','fifa','efootball','pes ','wwe','ufc','fight night','madden','nhl ','cricket','tennis','golf','riders republic'],
    Fighting:['tekken','street fighter','mortal kombat','dragon ball fighter','dragon ball sparking','capcom fighting','king of fighters','skullgirls','guilty gear','naruto storm','injustice'],
    Horror:['resident evil','silent hill','dead space','outlast','amnesia','alan wake','little nightmares','granny','until dawn','dead by daylight','cron os','directive 8020'],
    'Open World':['grand theft auto','gta','red dead redemption','cyberpunk','watch dogs','far cry','horizon','ghost of tsushima','assassin','hogwarts legacy','days gone','sleeping dogs','saints row','mafia','just cause'],
    Strategy:['crusader kings','company of heroes','civilization','total war','age of empires','xcom','starcraft','fire emblem','advance wars','triangle strategy'],
    Simulation:['simulator','simulation','chef life','the sims','cities skylines','farming simulator','planet zoo','powerwash','doraemon story of seasons','story of seasons']
  };
  function genresFor(game){
    const explicit=game.genre||game.genres;
    if(explicit) return Array.isArray(explicit)?explicit:[explicit];
    const t=String(game.title||'').toLowerCase();
    return Object.entries(keywords).filter(([,words])=>words.some(w=>t.includes(w))).map(([g])=>g);
  }
  function apply(genre){
    const q=String(document.getElementById('searchInput')?.value||'').toLowerCase().trim();
    const source=Array.isArray(window.games)?window.games:[];
    filteredGames=source.filter(g=>(genre==='All'||genresFor(g).includes(genre))&&String(g.title||'').toLowerCase().includes(q)).sort((a,b)=>String(a.title).localeCompare(String(b.title)));
    window.filteredGames=filteredGames;
    if(typeof window.renderGames==='function') window.renderGames(filteredGames);
  }
  function close(){menu.classList.remove('open');menu.setAttribute('aria-hidden','true');button.setAttribute('aria-expanded','false');}
  button.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();const open=!menu.classList.contains('open');if(open){menu.classList.add('open');menu.setAttribute('aria-hidden','false');button.setAttribute('aria-expanded','true');}else close();});
  menu.querySelectorAll('.genre-option').forEach(opt=>opt.addEventListener('click',e=>{e.stopPropagation();menu.querySelectorAll('.genre-option').forEach(x=>x.classList.toggle('active',x===opt));apply(opt.dataset.genre||'All');close();}));
  document.addEventListener('click',e=>{if(!e.target.closest('.genre-filter-wrap')) close();});
})();

/* Hard-remove any legacy favorite/heart nodes even if another script recreates them. */
(function(){
  const selectors='.v21-heart,.favorite-game-btn,.favorite-btn,.fav-btn,.wishlist-btn,.heart-btn,.heart-button,.game-card .heart,.game-card .favorite,.game-card .fav,.game-card .wishlist,button[aria-label*="favorite" i],button[aria-label*="heart" i],button[title*="favorite" i],button[title*="heart" i],[data-favorite],[data-heart]';
  function clean(root=document){root.querySelectorAll?.(selectors).forEach(el=>el.remove());}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>clean(),{once:true}); else clean();
  new MutationObserver(()=>clean()).observe(document.documentElement,{subtree:true,childList:true});
})();


/* ============================================================
   NERBEATS HARD JS FIX — SMOKE / CARD PARTICLES / CONTACT
   ============================================================ */
(function(){
  function initHardEffects(){
    const ring=document.querySelector('.mobile-brand-ring');
    if(ring && !ring.querySelector('.nb-logo-smoke')){
      const smoke=document.createElement('span');
      smoke.className='nb-logo-smoke';
      smoke.setAttribute('aria-hidden','true');
      ring.prepend(smoke);
    }

    const grid=document.getElementById('game-grid');
    if(grid && !grid.querySelector(':scope > .nb-card-particles')){
      const layer=document.createElement('div');
      layer.className='nb-card-particles';
      layer.setAttribute('aria-hidden','true');
      const count=window.innerWidth<=768?34:55;
      for(let i=0;i<count;i++){
        const p=document.createElement('span');
        p.className='nb-rise-particle';
        p.style.left=(Math.random()*100)+'%';
        p.style.animationDuration=(6+Math.random()*8)+'s';
        p.style.animationDelay=(-Math.random()*12)+'s';
        p.style.setProperty('--drift',((Math.random()-.5)*110)+'px');
        const size=1.8+Math.random()*3.2;
        p.style.width=size+'px';p.style.height=size+'px';
        layer.appendChild(p);
      }
      grid.prepend(layer);
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initHardEffects,{once:true});
  else initHardEffects();
  setTimeout(initHardEffects,700);
  setTimeout(initHardEffects,1800);
})();

/* Reliable mobile Trending auto swipe: the cards are .featured-card, not .game-card. */
(function(){
  function init(){
    const row=document.getElementById('trendingGames');
    if(!row || row.dataset.hardSwipe==='1') return;
    row.dataset.hardSwipe='1';
    let timer=null;
    function step(){
      if(window.innerWidth>768) return;
      const card=row.querySelector('.featured-card, .game-card');
      if(!card) return;
      const amount=card.getBoundingClientRect().width+10;
      const max=Math.max(0,row.scrollWidth-row.clientWidth);
      const next=row.scrollLeft+amount;
      row.scrollTo({left:next>=max-4?0:next,behavior:'smooth'});
    }
    function restart(){clearInterval(timer);timer=setInterval(step,3200);}
    row.addEventListener('touchstart',()=>clearInterval(timer),{passive:true});
    row.addEventListener('touchend',restart,{passive:true});
    restart();
  }
  document.addEventListener('DOMContentLoaded',init,{once:true});
  setTimeout(init,1200);
})();

/* Reliable Contacts popup. Capture phase prevents older navigation handlers from stealing the click. */
(function(){
  function init(){
    const popup=document.getElementById('contactPopup');
    if(!popup || popup.dataset.bound==='1') return;
    popup.dataset.bound='1';
    const buttons=document.querySelectorAll('.mobile-bottom-nav .mobile-nav-item[data-target="contact"]');
    if(!buttons.length) return;
    function open(e){
      if(e){e.preventDefault();e.stopPropagation();}
      document.querySelectorAll('.mobile-bottom-nav .mobile-nav-item').forEach(x=>x.classList.remove('active'));
      buttons.forEach(x=>x.classList.add('active'));
      popup.classList.add('show');
      popup.setAttribute('aria-hidden','false');
      document.body.classList.add('contact-popup-open');
    }
    function close(){
      popup.classList.remove('show');
      popup.setAttribute('aria-hidden','true');
      document.body.classList.remove('contact-popup-open');
    }
    buttons.forEach(btn=>btn.addEventListener('click',open,true));
    popup.querySelectorAll('[data-contact-close]').forEach(el=>el.addEventListener('click',close));
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&popup.classList.contains('show'))close();});
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
  setTimeout(init,500);
})();

/* ============================================================
   NERBEATS V3 FINAL DOM EFFECTS
   ============================================================ */
(function(){
  function addSmoke(){
    const ring=document.querySelector('.mobile-brand-ring');
    if(!ring) return;
    ring.querySelectorAll('.nb-logo-smoke-v3').forEach(x=>x.remove());
    const smoke=document.createElement('span');
    smoke.className='nb-logo-smoke-v3';
    smoke.setAttribute('aria-hidden','true');
    ring.insertBefore(smoke, ring.firstChild);
  }
  function addParticles(){
    const grid=document.getElementById('game-grid');
    if(!grid) return;
    grid.querySelectorAll('.nb-card-particles-v3').forEach(x=>x.remove());
    const layer=document.createElement('div');
    layer.className='nb-card-particles-v3';
    layer.setAttribute('aria-hidden','true');
    const count=window.innerWidth<=768?42:65;
    for(let i=0;i<count;i++){
      const p=document.createElement('span');
      p.className='nb-rise-particle-v3';
      p.style.left=(Math.random()*100)+'%';
      p.style.animationDuration=(5+Math.random()*7)+'s';
      p.style.animationDelay=(-Math.random()*10)+'s';
      p.style.setProperty('--drift',((Math.random()-.5)*140)+'px');
      const s=2+Math.random()*3;
      p.style.width=s+'px';p.style.height=s+'px';
      layer.appendChild(p);
    }
    grid.insertBefore(layer,grid.firstChild);
  }
  function init(){addSmoke();addParticles();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
  setTimeout(init,500); setTimeout(init,1500); setTimeout(init,3000);
  const grid=document.getElementById('game-grid');
  if(grid){new MutationObserver(function(){if(!grid.querySelector('.nb-card-particles-v3')) addParticles();}).observe(grid,{childList:true});}
})();

/* Contact: capture + immediate stop prevents older nav handlers from cancelling it. */
(function(){
  function bind(){
    const popup=document.getElementById('contactPopup');
    if(!popup) return;
    const buttons=document.querySelectorAll('.mobile-bottom-nav .mobile-nav-item[data-target="contact"]');
    if(!buttons.length) return;
    const open=()=>{popup.classList.add('show');popup.setAttribute('aria-hidden','false');document.body.classList.add('contact-popup-open');};
    const close=()=>{popup.classList.remove('show');popup.setAttribute('aria-hidden','true');document.body.classList.remove('contact-popup-open');};
    buttons.forEach(btn=>{
      btn.onclick=null;
      btn.addEventListener('click',function(e){e.preventDefault();e.stopImmediatePropagation();open();},true);
    });
    popup.querySelectorAll('[data-contact-close]').forEach(el=>{el.onclick=null;el.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();close();});});
    document.addEventListener('keydown',function(e){if(e.key==='Escape') close();});
    document.addEventListener('click',function(e){const btn=e.target.closest('.mobile-bottom-nav .mobile-nav-item[data-target="contact"]');if(btn){e.preventDefault();e.stopImmediatePropagation();open();}},true);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bind,{once:true}); else bind();
  setTimeout(bind,800);setTimeout(bind,2000);
})();
