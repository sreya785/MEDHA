// ─── MEDHA Intro Animation ───────────────────────────────
// Plays once on first visit. Pure CSS + JS — no dependencies.
// Mirrors the Framer Motion spec with cubic-bezier(0.22,1,0.36,1)

const Intro = {

  words: [
    { letter: 'M', rest: 'erit' },
    { letter: 'E', rest: 'xcellence' },
    { letter: 'D', rest: 'edication' },
    { letter: 'H', rest: 'ustle' },
    { letter: 'A', rest: 'chievement' }
  ],

  played: false,

  shouldPlay() {
    // Only play once — check sessionStorage so it plays each new tab
    // but not on page refresh during the same session
    return !sessionStorage.getItem('medha_intro_played');
  },

  init(onComplete) {
    if (!Intro.shouldPlay()) {
      onComplete();
      return;
    }

    sessionStorage.setItem('medha_intro_played', '1');
    Intro.play(onComplete);
  },

  play(onComplete) {
    // Build overlay
    const overlay = document.createElement('div');
    overlay.id = 'intro-overlay';
    overlay.innerHTML = `
      <div id="intro-stage">
        <div id="intro-words-wrap">
          ${Intro.words.map((w, i) => `
            <div class="intro-word" data-index="${i}">
              <span class="intro-letter">${w.letter}</span><span class="intro-rest">${w.rest}</span>
            </div>
          `).join('')}
        </div>
        <div id="intro-brand">MEDHA</div>
        <div id="intro-tagline">Know how you think.</div>
      </div>
    `;
    document.body.appendChild(overlay);

    const wordEls    = overlay.querySelectorAll('.intro-word');
    const letterEls  = overlay.querySelectorAll('.intro-letter');
    const restEls    = overlay.querySelectorAll('.intro-rest');
    const wordsWrap  = overlay.querySelector('#intro-words-wrap');
    const brand      = overlay.querySelector('#intro-brand');
    const tagline    = overlay.querySelector('#intro-tagline');

    // ── Phase 1: 0.0s–3.4s — staggered word fade-in ──────
    wordEls.forEach((el, i) => {
      setTimeout(() => {
        el.classList.add('word-visible');
      }, 200 + i * 560);  // ~0.2s, 0.76s, 1.32s, 1.88s, 2.44s → all done ~3.2s
    });

    // ── Phase 2: 3.4s–4.0s — accent first letters, dim rest ──
    setTimeout(() => {
      letterEls.forEach(el => el.classList.add('letter-accent'));
      restEls.forEach(el => el.classList.add('rest-dim'));
    }, 3400);

    // ── Phase 3: 4.6s–5.0s — compress + form MEDHA ──────
    setTimeout(() => {
      wordsWrap.classList.add('words-compress');
      wordEls.forEach(el => el.classList.add('word-compress'));
    }, 4600);

    setTimeout(() => {
      wordsWrap.style.opacity = '0';
      brand.classList.add('brand-visible');
    }, 5000);

    // ── Phase 4: 5.2s–5.8s — tagline fade in ────────────
    setTimeout(() => {
      tagline.classList.add('tagline-visible');
    }, 5200);

    // ── Phase 5: 6.2s–6.6s — fade to black + complete ───
    setTimeout(() => {
      overlay.classList.add('overlay-fadeout');
    }, 6200);

    setTimeout(() => {
      overlay.remove();
      onComplete();
    }, 6700);
  }
};
