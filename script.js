/* =========================================================
   🌻 CONFIGURACIÓN PERSONAL (EDITA ESTO) 🌻
   ========================================================= */
const CONFIG = {
    // Frases que aparecen cada que coloca un pétalo correctamente
    petalPhrases: [
        "Porque me haces sonreír.",
        "Porque me gusta conocerte.",
        "Porque contigo todo se siente diferente.",
        "Porque quería hacerte algo solamente a ti.",
        "Porque haces que mis días sean mejores.",
        "Porque eres alguien muy especial."
    ],
    
    // Tu historia (cada elemento es una "tarjeta" que deberá leer y avanzar)
    storyTimeline: [
        "Antes de conocerte...",
        "No sabía que iba a terminar haciendo esto a estas horas JAJA.",
        "Después apareciste tú...",
        "Y de repente las conversaciones se volvieron mi parte favorita del día.",
        "Quería darte un detalle diferente, algo hecho a mano (o a código).",
        "Porque te mereces cosas bonitas."
    ]
};
/* ========================================================= */

// Referencias de UI
const screens = {
    intro: document.getElementById('screen-intro'),
    game: document.getElementById('screen-game'),
    completed: document.getElementById('screen-completed'),
    story: document.getElementById('screen-story'),
    outro: document.getElementById('screen-outro')
};

// --- AUDIO LÓGICA ---
const bgMusic = document.getElementById('bg-music');
const musicBtn = document.getElementById('music-btn');
let isPlaying = false;

musicBtn.addEventListener('click', () => {
    if (isPlaying) {
        bgMusic.pause();
        musicBtn.classList.remove('playing');
        musicBtn.style.opacity = '0.5';
    } else {
        bgMusic.play();
        musicBtn.classList.add('playing');
        musicBtn.style.opacity = '1';
    }
    isPlaying = !isPlaying;
});

// --- PANTALLA INTRO ---
setTimeout(() => document.getElementById('intro-text-1').classList.add('show-text'), 500);
setTimeout(() => document.getElementById('intro-text-2').classList.add('show-text'), 2000);
setTimeout(() => document.getElementById('intro-text-3').classList.add('show-text'), 4000);
setTimeout(() => document.getElementById('btn-start').classList.add('show-text'), 6000);

function switchScreen(from, to) {
    from.classList.remove('active');
    setTimeout(() => to.classList.add('active'), 1000);
}

document.getElementById('btn-start').addEventListener('click', () => {
    switchScreen(screens.intro, screens.game);
    initGame();
});

// --- JUEGO DE PÉTALOS ---
let placedPetals = 0;
const totalPetals = 6;

function initGame() {
    const container = document.getElementById('petals-container');
    const phrases = [...CONFIG.petalPhrases];
    
    for (let i = 0; i < totalPetals; i++) {
        const petal = document.createElement('div');
        petal.classList.add('petal');
        // Posición inicial aleatoria en la parte inferior
        petal.style.left = `${Math.random() * 80 + 10}%`;
        petal.style.bottom = `${Math.random() * 20}%`;
        petal.dataset.index = i;
        
        setupDrag(petal, phrases);
        container.appendChild(petal);
    }
}

function setupDrag(petal, phrases) {
    let isDragging = false;
    let startX, startY, initialX, initialY;

    petal.addEventListener('pointerdown', (e) => {
        if (petal.classList.contains('placed')) return;
        isDragging = true;
        petal.classList.add('dragging');
        petal.setPointerCapture(e.pointerId);
        
        const rect = petal.getBoundingClientRect();
        startX = e.clientX;
        startY = e.clientY;
        initialX = rect.left;
        initialY = rect.top;
        
        petal.style.position = 'fixed';
        petal.style.left = initialX + 'px';
        petal.style.top = initialY + 'px';
        petal.style.bottom = 'auto';
    });

    petal.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        petal.style.left = (initialX + dx) + 'px';
        petal.style.top = (initialY + dy) + 'px';
    });

    petal.addEventListener('pointerup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        petal.classList.remove('dragging');
        petal.releasePointerCapture(e.pointerId);
        checkDrop(petal, e.clientX, e.clientY, phrases);
    });
}

function checkDrop(petal, x, y, phrases) {
    const zones = document.querySelectorAll('.drop-zone:not(.filled)');
    let placed = false;

    zones.forEach(zone => {
        if (placed) return;
        const rect = zone.getBoundingClientRect();
        // Área de tolerancia para soltar el pétalo
        if (x > rect.left - 30 && x < rect.right + 30 && 
            y > rect.top - 30 && y < rect.bottom + 30) {
            
            zone.classList.add('filled');
            petal.classList.add('placed');
            
            // Ajustar el pétalo exactamente en la zona
            petal.style.position = 'absolute';
            petal.style.left = '50%';
            petal.style.top = '50%';
            petal.style.transform = `translate(-50%, -50%) ${zone.style.transform}`;
            zone.appendChild(petal);
            placed = true;
            placedPetals++;

            // Mostrar frase
            const phraseEl = document.getElementById('game-phrase');
            const randomPhrase = phrases.splice(Math.floor(Math.random() * phrases.length), 1)[0];
            phraseEl.innerText = randomPhrase || "";
            phraseEl.style.opacity = 1;
            setTimeout(() => phraseEl.style.opacity = 0, 2500);

            if (placedPetals === totalPetals) {
                setTimeout(() => {
                    const finalFlower = document.querySelector('.flower-container').cloneNode(true);
                    document.querySelector('.completed-flower-wrapper').appendChild(finalFlower);
                    switchScreen(screens.game, screens.completed);
                }, 1500);
            }
        }
    });

    if (!placed) {
        // Volver abajo si falla
        petal.style.position = 'absolute';
        petal.style.top = 'auto';
        petal.style.bottom = `${Math.random() * 20}%`;
        petal.style.left = `${Math.random() * 80 + 10}%`;
    }
}

// --- PANTALLA HISTORIA ---
let storyIndex = 0;
document.getElementById('btn-story').addEventListener('click', () => {
    switchScreen(screens.completed, screens.story);
    showStoryCard();
});

document.getElementById('btn-next-story').addEventListener('click', () => {
    storyIndex++;
    if (storyIndex < CONFIG.storyTimeline.length) {
        showStoryCard();
    } else {
        switchScreen(screens.story, screens.outro);
        playOutro();
    }
});

function showStoryCard() {
    const card = document.getElementById('story-card');
    card.classList.remove('visible');
    setTimeout(() => {
        document.getElementById('story-text').innerText = CONFIG.storyTimeline[storyIndex];
        card.classList.add('visible');
    }, 500);
}

// --- PANTALLA OUTRO (CAMPO DE FLORES) ---
function playOutro() {
    setTimeout(() => document.getElementById('outro-text-1').classList.add('show-text'), 1000);
    setTimeout(() => document.getElementById('outro-text-1').classList.remove('show-text'), 4000);
    
    setTimeout(() => {
        generateField();
        document.getElementById('outro-text-2').classList.add('show-text');
    }, 5000);

    setTimeout(() => {
        document.getElementById('outro-text-3').classList.add('show-text');
        document.getElementById('outro-text-4').classList.add('show-text');
    }, 7000);
}

function generateField() {
    const field = document.getElementById('field-container');
    // Generar 30 florecitas de fondo
    for(let i=0; i<30; i++) {
        setTimeout(() => {
            const flower = document.createElement('div');
            flower.className = 'mini-flower';
            // Dibujar una florecita sencilla con CSS
            flower.style.background = 'radial-gradient(circle, #5C4033 20%, #F4D03F 25%)';
            flower.style.borderRadius = '50%';
            flower.style.left = Math.random() * 100 + 'vw';
            flower.style.top = Math.random() * 100 + 'vh';
            
            // Añadir pétalos falsos con box-shadow
            flower.style.boxShadow = '0 -10px 0 -2px #F4D03F, 0 10px 0 -2px #F4D03F, -10px 0 0 -2px #F4D03F, 10px 0 0 -2px #F4D03F, -7px -7px 0 -2px #F4D03F, 7px -7px 0 -2px #F4D03F, -7px 7px 0 -2px #F4D03F, 7px 7px 0 -2px #F4D03F';

            field.appendChild(flower);
            
            // Trigger animation
            requestAnimationFrame(() => {
                flower.classList.add('bloom');
            });
        }, i * 150); // Aparecen una por una
    }
}
