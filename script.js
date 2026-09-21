(() => {
  'use strict';

  const CONFIG = {
    petalPhrases: [
      'Un pétalo para iluminar tu día.',
      'Porque contigo todo se siente más bonito.',
      'Este detalle lleva un poquito de mi cariño.',
      'Me encanta compartir momentos contigo.',
      'Te mereces flores y cosas bonitas siempre.',
      'Gracias por hacerme sonreír.',
      'Eres alguien muy especial para mí.',
      'La flor está completa, pero el cariño sigue creciendo.'
    ],
    storyTimeline: [
      'Quería regalarte flores, pero también quería que este detalle tuviera algo de ti.',
      'Por eso puedes armarla pétalo a pétalo, con calma y sin prisa.',
      'Cada pétalo representa una razón por la que eres especial para mí.',
      'Ojalá esta pequeña flor te acompañe y te saque una sonrisa.',
      'Gracias por estar en mi vida, Poncho.'
    ]
  };

  const $ = selector => document.querySelector(selector);
  const screens = {
    intro: $('#screen-intro'),
    game: $('#screen-game'),
    completed: $('#screen-completed'),
    story: $('#screen-story'),
    outro: $('#screen-outro')
  };

  function go(from, to) {
    if (!from || !to) return;
    from.classList.remove('active');
    to.classList.add('active');
  }

  function addAmbient() {
    const ambient = $('#ambient');
    if (!ambient) return;
    for (let i = 0; i < 18; i += 1) {
      const dust = document.createElement('i');
      dust.className = 'dust';
      dust.style.left = `${Math.random() * 100}%`;
      dust.style.animationDelay = `${Math.random() * 8}s`;
      ambient.appendChild(dust);
    }
  }

  let placed = 0;
  const total = 8;
  let phraseIndex = 0;
  let gameReady = false;

  function initGame() {
    if (gameReady) return;
    const board = $('#game-board');
    const targetBox = $('#targets');
    const petalBox = $('#petals-container');
    if (!board || !targetBox || !petalBox) return;
    gameReady = true;

    const angles = [-90, -45, 0, 45, 90, 135, 180, 225];
    const center = () => ({
      x: board.clientWidth / 2,
      y: Math.min(150, board.clientHeight * 0.34)
    });

    function paintTargets() {
      const point = center();
      targetBox.innerHTML = '';
      angles.forEach((angle, index) => {
        const radians = angle * Math.PI / 180;
        const target = document.createElement('div');
        target.className = 'target';
        target.dataset.i = index;
        target.style.left = `${point.x + Math.cos(radians) * 91}px`;
        target.style.top = `${point.y + Math.sin(radians) * 91}px`;
        target.style.transform = `translate(-50%, -50%) rotate(${angle + 90}deg)`;
        targetBox.appendChild(target);
      });
    }

    function resetPetal(petal) {
      petal.style.position = 'absolute';
      petal.style.left = `${12 + Math.random() * 74}%`;
      petal.style.top = `${70 + Math.random() * 24}%`;
      petal.style.transform = `rotate(${Math.random() * 36 - 18}deg)`;
    }

    function drop(petal, x, y) {
      let nearest = null;
      let distance = Infinity;
      targetBox.querySelectorAll('.target:not(.filled)').forEach(target => {
        const rect = target.getBoundingClientRect();
        const currentDistance = Math.hypot(x - (rect.left + rect.width / 2), y - (rect.top + rect.height / 2));
        if (currentDistance < distance) {
          distance = currentDistance;
          nearest = target;
        }
      });

      if (!nearest || distance > 78) {
        resetPetal(petal);
        return;
      }

      const rect = nearest.getBoundingClientRect();
      petal.style.position = 'fixed';
      petal.style.left = `${rect.left + (rect.width - petal.offsetWidth) / 2}px`;
      petal.style.top = `${rect.top + (rect.height - petal.offsetHeight) / 2}px`;
      petal.style.transform = `rotate(${Number(nearest.dataset.i) * 45}deg)`;
      petal.classList.add('placed');
      nearest.classList.add('filled');
      placed += 1;

      const hint = $('#game-hint');
      if (hint) hint.textContent = placed === total ? '¡Tu flor quedó completa!' : `Te faltan ${total - placed} pétalos`;
      showPhrase();
      if (placed === total) window.setTimeout(() => go(screens.game, screens.completed), 900);
    }

    function makeDraggable(petal) {
      let active = false;
      petal.addEventListener('pointerdown', event => {
        if (petal.classList.contains('placed')) return;
        active = true;
        petal.setPointerCapture(event.pointerId);
        petal.classList.add('dragging');
        const rect = petal.getBoundingClientRect();
        petal.style.position = 'fixed';
        petal.style.left = `${rect.left}px`;
        petal.style.top = `${rect.top}px`;
        petal.style.transform = 'rotate(0deg)';
      });
      petal.addEventListener('pointermove', event => {
        if (!active) return;
        petal.style.left = `${event.clientX - petal.offsetWidth / 2}px`;
        petal.style.top = `${event.clientY - petal.offsetHeight / 2}px`;
      });
      petal.addEventListener('pointerup', event => {
        if (!active) return;
        active = false;
        petal.classList.remove('dragging');
        drop(petal, event.clientX, event.clientY);
      });
      petal.addEventListener('pointercancel', () => {
        if (active) resetPetal(petal);
        active = false;
        petal.classList.remove('dragging');
      });
    }

    paintTargets();
    window.addEventListener('resize', paintTargets);
    for (let index = 0; index < total; index += 1) {
      const petal = document.createElement('button');
      petal.type = 'button';
      petal.className = 'petal';
      petal.setAttribute('aria-label', `Pétalo ${index + 1}`);
      petal.style.left = `${12 + (index % 4) * 24 + Math.random() * 4}%`;
      petal.style.top = `${72 + Math.floor(index / 4) * 13}%`;
      petal.style.transform = `rotate(${[-12, 8, 20, -8, 12, -18, 4, 16][index]}deg)`;
      petalBox.appendChild(petal);
      makeDraggable(petal);
    }
  }

  function showPhrase() {
    const phrase = $('#game-phrase');
    if (!phrase) return;
    phrase.textContent = CONFIG.petalPhrases[phraseIndex % CONFIG.petalPhrases.length];
    phraseIndex += 1;
    phrase.classList.add('show');
    window.setTimeout(() => phrase.classList.remove('show'), 1900);
  }

  let storyIndex = 0;
  function showStory() {
    const card = $('#story-card');
    if (!card) return;
    card.classList.remove('visible');
    window.setTimeout(() => {
      $('#story-text').textContent = CONFIG.storyTimeline[storyIndex];
      $('#story-number').textContent = String(storyIndex + 1).padStart(2, '0');
      $('#story-progress').style.setProperty('--progress', `${((storyIndex + 1) / CONFIG.storyTimeline.length) * 100}%`);
      $('#btn-next-story').innerHTML = storyIndex === CONFIG.storyTimeline.length - 1 ? 'Ver la sorpresa <span>→</span>' : 'Siguiente <span>→</span>';
      card.classList.add('visible');
    }, 220);
  }

  function generateField() {
    const field = $('#field-container');
    if (!field) return;
    field.innerHTML = '';
    for (let i = 0; i < 38; i += 1) {
      window.setTimeout(() => {
        const flower = document.createElement('i');
        flower.className = 'mini-flower';
        flower.style.left = `${Math.random() * 96}%`;
        flower.style.top = `${35 + Math.random() * 58}%`;
        flower.style.transform = `scale(${0.55 + Math.random() * 0.8})`;
        field.appendChild(flower);
        requestAnimationFrame(() => flower.classList.add('bloom'));
      }, i * 55);
    }
  }

  function playOutro() {
    window.setTimeout(() => $('#outro-1')?.classList.add('visible'), 500);
    window.setTimeout(() => { generateField(); $('#outro-2')?.classList.add('visible'); }, 1900);
    window.setTimeout(() => {
      $('#outro-3')?.classList.add('visible');
      $('#outro-4')?.classList.add('visible');
      $('.spotify-final')?.classList.add('visible');
    }, 3300);
  }

  function bindEvents() {
    const start = $('#btn-start');
    if (start) start.addEventListener('click', event => {
      event.preventDefault();
      go(screens.intro, screens.game);
      initGame();
    });
    $('#btn-story')?.addEventListener('click', () => { go(screens.completed, screens.story); showStory(); });
    $('#btn-next-story')?.addEventListener('click', () => {
      storyIndex += 1;
      if (storyIndex >= CONFIG.storyTimeline.length) { go(screens.story, screens.outro); playOutro(); }
      else showStory();
    });
  }

  addAmbient();
  bindEvents();
})();
