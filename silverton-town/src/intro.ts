/**
 * Portfolio entry: nav button → fullscreen overlay (300ms fade) → typewriter intro.
 * Pure CSS/JS, no game engine.
 */
import './style.css';

const INTRO_PHRASE = 'MATT DESIGN presents...';
const TYPEWRITER_MS = 60;
const FADE_MS = 300;

function typewriter(el: HTMLElement, text: string, speedMs: number): Promise<void> {
  return new Promise((resolve) => {
    let i = 0;
    el.textContent = '';
    const id = setInterval(() => {
      if (i < text.length) {
        el.textContent = text.slice(0, i + 1);
        i++;
      } else {
        clearInterval(id);
        resolve();
      }
    }, speedMs);
  });
}

function runIntro(): void {
  const overlay = document.getElementById('silvertown-overlay');
  const textEl = document.getElementById('silvertown-intro-text');
  if (!overlay || !textEl) return;

  overlay.setAttribute('aria-hidden', 'false');
  overlay.classList.add('is-visible');

  window.setTimeout(() => {
    typewriter(textEl, INTRO_PHRASE, TYPEWRITER_MS);
  }, FADE_MS);
}

function init(): void {
  const btn = document.getElementById('explore-silvertown-btn');
  if (btn) btn.addEventListener('click', runIntro);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
