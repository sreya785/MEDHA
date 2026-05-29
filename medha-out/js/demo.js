// ─── Demo Controller ─────────────────────────────────────
// Auto-animates the MCQ only. All other navigation is manual.
const Demo = {

  timerVal: 30,
  timerInterval: null,
  autoRunning: false,

  init() {
    document.getElementById('demoSeeResult').addEventListener('click', () => {
      Demo.stopAuto();
      Demo.showPanel('demo-result');
    });
    document.getElementById('demoBtnDNA').addEventListener('click', () => {
      Demo.showPanel('demo-dna');
    });
    document.getElementById('demoBtnNotes').addEventListener('click', () => {
      Demo.showPanel('demo-notes');
    });
    document.getElementById('demoBtnNotes2').addEventListener('click', () => {
      Demo.showPanel('demo-notes');
    });
  },

  showPanel(id) {
    document.querySelectorAll('.demo-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  },

  // Called every time user enters the demo screen
  startAutoExam() {
    // Reset to exam panel first
    Demo.showPanel('demo-exam');
    document.getElementById('demoSeeResult').classList.remove('pulse-btn');
    Demo.clearAllSelections();

    Demo.stopAuto();
    Demo.autoRunning = true;
    Demo.timerVal = 30;
    Demo.updateDemoTimer(30);

    // Countdown timer
    Demo.timerInterval = setInterval(() => {
      Demo.timerVal--;
      Demo.updateDemoTimer(Demo.timerVal);
      if (Demo.timerVal <= 0) Demo.stopAuto();
    }, 1000);

    // Step 1: click option A (wrong) after 1.5s
    setTimeout(() => {
      if (!Demo.autoRunning) return;
      Demo.clickOption(0);
    }, 1500);

    // Step 2: switch to option C (correct) after 3.5s
    setTimeout(() => {
      if (!Demo.autoRunning) return;
      Demo.clickOption(2);
    }, 3500);

    // Step 3: pulse the "See Result" button after 5.5s — user clicks it
    setTimeout(() => {
      if (!Demo.autoRunning) return;
      document.getElementById('demoSeeResult').classList.add('pulse-btn');
    }, 5500);

    // No auto-advance after this — user clicks manually
  },

  stopAuto() {
    Demo.autoRunning = false;
    clearInterval(Demo.timerInterval);
  },

  clickOption(index) {
    Demo.clearAllSelections();
    const opts = document.querySelectorAll('.demo-opt');
    if (opts[index]) opts[index].classList.add('demo-selected');
  },

  clearAllSelections() {
    document.querySelectorAll('.demo-opt').forEach(o => o.classList.remove('demo-selected'));
  },

  updateDemoTimer(val) {
    const el = document.getElementById('demoTimer');
    if (!el) return;
    el.textContent = val;
    el.style.color = val <= 8 ? '#ff4f6a' : '#22c97a';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Demo.init();
});
