(() => {
  'use strict';

  const CONFIG = {
    petalPhrases: [
      'Me gusta cómo poco a poco te has vuelto alguien especial para mí.',
      'Contigo hasta las cosas más simples terminan teniendo algo bonito.',
      'Me gusta la tranquilidad que siento cuando estoy contigo.',
      'Gracias por esos momentos que probablemente tú ni sabes cuánto significan para mí.',
      'Me gusta seguir descubriendo quién eres.',
      'De todas las cosas que pudieron pasar, me gusta que nos hayamos encontrado.',
      'Contigo me dan ganas de ver qué sigue.',
      'Esta flor no se compara con una de verdad, pero la hice pensando en ti.'
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
    intro: $('#screen-intro'), game: $('#screen-game'), completed: $('#screen-completed'),
    story: $('#screen-story'), outro: $('#screen-outro')
  };

  let gameReady = false;
  let placedCount = 0;
  const totalPetals = CONFIG.petalPhrases.length;
  let storyIndex = 0;
  let phraseShown = false;

  function go(from, to) {
    if (!from || !to) return;
    from.classList.remove('active');
    to.classList.add('active');
  }

  function showPhrase(index) {
    const phrase = $('#game-phrase');
    if (!phrase || phraseShown) return;
    phraseShown = true;
    phrase.textContent = CONFIG.petalPhrases[index];
    phrase.classList.add('show');
    window.setTimeout(() => {
      phrase.classList.remove('show');
      phraseShown = false;
    }, 2600);
  }

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

    function getTargetPoint(target) {
      const targetRect = target.getBoundingClientRect();
      const boardRect = board.getBoundingClientRect();
      return {
        x: targetRect.left - boardRect.left + targetRect.width / 2,
        y: targetRect.top - boardRect.top + targetRect.height / 2
      };
    }

    function placePetalAtTarget(petal, target) {
      const point = getTargetPoint(target);
      petal.style.position = 'absolute';
      petal.style.left = `${point.x - petal.offsetWidth / 2}px`;
      petal.style.top = `${point.y - petal.offsetHeight / 2}px`;
      petal.style.transform = `rotate(${Number(target.dataset.i) * 45}deg)`;
      petal.dataset.target = target.dataset.i;
      petal.classList.remove('dragging');
      petal.classList.add('placed');
      target.classList.add('filled');
    }

    function repaintTargets() {
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

      petalBox.querySelectorAll('.petal.placed').forEach(petal => {
        const target = targetBox.querySelector(`.target[data-i="${petal.dataset.target}"]`);
        if (target) placePetalAtTarget(petal, target);
      });
    }

    function resetPetal(petal) {
      petal.style.position = 'absolute';
      petal.style.left = `${10 + Math.random() * 78}%`;
      petal.style.top = `${70 + Math.random() * 24}%`;
      petal.style.transform = `rotate(${Math.random() * 36 - 18}deg)`;
      petal.classList.remove('dragging');
    }

    function dropPetal(petal, clientX, clientY) {
      const available = [...targetBox.querySelectorAll('.target:not(.filled)')];
      let nearest = null;
      let nearestDistance = Infinity;
      available.forEach(target => {
        const rect = target.getBoundingClientRect();
        const distance = Math.hypot(
          clientX - (rect.left + rect.width / 2),
          clientY - (rect.top + rect.height / 2)
        );
        if (distance < nearestDistance) {
          nearest = target;
          nearestDistance = distance;
        }
      });

      if (!nearest || nearestDistance > 82) {
        resetPetal(petal);
        return;
      }

      placePetalAtTarget(petal, nearest);
      placedCount += 1;
      const hint = $('#game-hint');
      if (hint) hint.textContent = placedCount === totalPetals
        ? '🌻 ¡Lo lograste!'
        : `Te faltan ${totalPetals - placedCount} pétalos`;
      showPhrase(Number(petal.dataset.i));

      if (placedCount === totalPetals) {
        window.setTimeout(() => go(screens.game, screens.completed), 1500);
      }
    }

    function makeDraggable(petal) {
      let dragging = false;
      let pointerId = null;

      petal.addEventListener('pointerdown', event => {
        if (petal.classList.contains('placed')) return;
        event.preventDefault();
        dragging = true;
        pointerId = event.pointerId;
        petal.setPointerCapture(pointerId);
        petal.classList.add('dragging');
        petal.style.position = 'fixed';
        petal.style.left = `${event.clientX - petal.offsetWidth / 2}px`;
        petal.style.top = `${event.clientY - petal.offsetHeight / 2}px`;
        petal.style.transform = 'rotate(0deg)';
      });

      petal.addEventListener('pointermove', event => {
        if (!dragging || event.pointerId !== pointerId) return;
        event.preventDefault();
        petal.style.left = `${event.clientX - petal.offsetWidth / 2}px`;
        petal.style.top = `${event.clientY - petal.offsetHeight / 2}px`;
      });

      petal.addEventListener('pointerup', event => {
        if (!dragging || event.pointerId !== pointerId) return;
        event.preventDefault();
        dragging = false;
        petal.releasePointerCapture(pointerId);
        dropPetal(petal, event.clientX, event.clientY);
        pointerId = null;
      });

      petal.addEventListener('pointercancel', () => {
        if (!dragging) return;
        dragging = false;
        resetPetal(petal);
        pointerId = null;
      });
    }

    repaintTargets();
    window.addEventListener('resize', repaintTargets);
    for (let index = 0; index < totalPetals; index += 1) {
      const petal = document.createElement('button');
      petal.type = 'button';
      petal.className = 'petal';
      petal.dataset.i = index;
      petal.setAttribute('aria-label', `Pétalo ${index + 1}`);
      petal.style.left = `${10 + (index % 4) * 25 + Math.random() * 3}%`;
      petal.style.top = `${70 + Math.floor(index / 4) * 14}%`;
      petal.style.transform = `rotate(${[-12, 8, 20, -8, 12, -18, 4, 16][index]}deg)`;
      petalBox.appendChild(petal);
      makeDraggable(petal);
    }
  }

  function showStory() {
    const card = $('#story-card');
    if (!card) return;
    card.classList.remove('visible');
    window.setTimeout(() => {
      $('#story-text').textContent = CONFIG.storyTimeline[storyIndex];
      $('#story-number').textContent = String(storyIndex + 1).padStart(2, '0');
      $('#story-progress').style.setProperty('--progress', `${((storyIndex + 1) / CONFIG.storyTimeline.length) * 100}%`);
      $('#btn-next-story').innerHTML = storyIndex === CONFIG.storyTimeline.length - 1
        ? 'Ver la sorpresa <span>→</span>' : 'Siguiente <span>→</span>';
      card.classList.add('visible');
    }, 220);
  }

  function startExperience(event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    go(screens.intro, screens.game);
    initGame();
  }

  window.startFlowerExperience = startExperience;
  window.addEventListener('flower-experience-start', initGame);

  document.addEventListener('DOMContentLoaded', () => {
    $('#btn-start')?.addEventListener('click', startExperience);
    $('#btn-story')?.addEventListener('click', () => { go(screens.completed, screens.story); showStory(); });
    $('#btn-next-story')?.addEventListener('click', () => {
      storyIndex += 1;
      if (storyIndex >= CONFIG.storyTimeline.length) go(screens.story, screens.outro);
      else showStory();
    });
    if ($('#ambient')) {
      for (let i = 0; i < 18; i += 1) {
        const dust = document.createElement('i');
        dust.className = 'dust';
        dust.style.left = `${Math.random() * 100}%`;
        dust.style.animationDelay = `${Math.random() * 8}s`;
        $('#ambient').appendChild(dust);
      }
    }
  });
})();
