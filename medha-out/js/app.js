// ─── App State ───────────────────────────────────────────
const App = {
  currentQuestion: 0,
  totalQuestions: QUESTIONS.length,
  timerInterval: null,
  timeLeft: 30,          // ONE shared timer for the entire exam
  selectedOption: null,
  dnaGroups: null,
  notesGenerated: false,

  // ─── Init ─────────────────────────────────────────────
  init() {
    document.getElementById('btnStart').addEventListener('click', () => App.startExam());
    document.getElementById('btnNext').addEventListener('click', () => App.nextQuestion());
    document.getElementById('btnViewDNA').addEventListener('click', () => {
      App.showScreen('dna');
      App.renderDNA();
    });
    document.getElementById('btnViewNotes').addEventListener('click', () => App.loadNotes());

    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const screen = tab.dataset.screen;
        if (screen === 'notes') {
          App.loadNotes();
        } else {
          if (screen === 'dna') App.renderDNA();
          App.showScreen(screen);
        }
      });
    });
  },

  // ─── Screen Management ────────────────────────────────
  showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + name).classList.add('active');
    document.querySelectorAll('.nav-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.screen === name);
    });
  },

  // ─── Exam Flow ────────────────────────────────────────
  startExam() {
    App.currentQuestion = 0;
    App.timeLeft = 30;
    App.notesGenerated = false;
    document.getElementById('navTabs').style.display = 'flex';
    App.showScreen('exam');
    App.startSharedTimer();   // start ONCE for the whole exam
    App.renderQuestion();
  },

  renderQuestion() {
    const q = QUESTIONS[App.currentQuestion];
    App.selectedOption = null;

    // Progress bar
    const pct = ((App.currentQuestion + 1) / App.totalQuestions) * 100;
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('progressLabel').textContent =
      (App.currentQuestion + 1) + ' / ' + App.totalQuestions;

    // Question
    document.getElementById('questionText').textContent = q.text;

    // Options
    const grid = document.getElementById('optionsGrid');
    grid.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `<span class="option-letter">${letters[i]}</span>${opt}`;
      btn.addEventListener('click', () => App.selectOption(i, btn));
      grid.appendChild(btn);
    });

    // Next button
    const btnNext = document.getElementById('btnNext');
    btnNext.disabled = true;
    btnNext.textContent =
      App.currentQuestion < App.totalQuestions - 1 ? 'Next →' : 'Finish Exam →';

    // Start tracking this question
    Tracker.startQuestion(q.id, App.currentQuestion);
  },

  selectOption(index, btn) {
    document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    App.selectedOption = index;
    Tracker.recordClick(index);
    document.getElementById('btnNext').disabled = false;
  },

  nextQuestion() {
    Tracker.endQuestion();
    App.currentQuestion++;

    if (App.currentQuestion < App.totalQuestions) {
      App.renderQuestion();
    } else {
      App.stopTimer();
      App.finishExam();
    }
  },

  finishExam() {
    App.stopTimer();
    const payload = Tracker.buildPayload();
    App.dnaGroups = DNA.buildGroups(payload);
    App.renderResult(payload);
    App.showScreen('result');
  },

  // ─── Shared Timer (runs once for the whole exam) ──────
  startSharedTimer() {
    App.updateTimerUI(App.timeLeft);
    clearInterval(App.timerInterval);

    App.timerInterval = setInterval(() => {
      App.timeLeft--;
      App.updateTimerUI(App.timeLeft);

      if (App.timeLeft <= 0) {
        clearInterval(App.timerInterval);
        // Time's up — end current question and force finish
        Tracker.endQuestion();
        App.finishExam();
      }
    }, 1000);
  },

  stopTimer() {
    clearInterval(App.timerInterval);
  },

  updateTimerUI(seconds) {
    document.getElementById('timerNum').textContent = seconds;
    const circumference = 2 * Math.PI * 18; // 113.1
    const offset = circumference * (1 - seconds / 30);
    const ring = document.getElementById('timerRing');
    ring.style.strokeDashoffset = offset;
    ring.classList.toggle('urgent', seconds <= 8);
  },

  // ─── Result ───────────────────────────────────────────
  renderResult(payload) {
    const correct = payload.filter(p => p.isCorrect).length;
    const total = payload.length;
    const letters = ['A', 'B', 'C', 'D'];

    document.getElementById('scoreNum').textContent = correct;
    const circumference = 2 * Math.PI * 50;
    const offset = circumference * (1 - correct / total);
    setTimeout(() => {
      document.getElementById('scoreArc').style.strokeDashoffset = offset;
    }, 200);

    const pct = correct / total;
    let title = 'Keep Practicing';
    if (pct === 1) title = 'Perfect Score!';
    else if (pct >= 0.8) title = 'Excellent Work!';
    else if (pct >= 0.6) title = 'Good Effort';
    document.getElementById('scoreTitle').textContent = title;

    const list = document.getElementById('resultList');
    list.innerHTML = '';

    payload.forEach((item, i) => {
      const card = document.createElement('div');
      card.className = 'result-card';
      const opts = item.options.map((opt, j) => {
        let cls = 'result-opt';
        let icon = '';
        if (j === item.correctAnswerIndex) {
          cls += ' correct';
          icon = '<span class="r-icon">✓</span>';
        } else if (j === item.finalAnswerIndex && !item.isCorrect) {
          cls += ' wrong';
          icon = '<span class="r-icon">✗</span>';
        }
        return `<div class="${cls}"><span class="r-letter">${letters[j]}</span>${opt}${icon}</div>`;
      }).join('');
      card.innerHTML = `
        <div class="result-qtext">${i + 1}. ${item.questionText}</div>
        <div class="result-opts">${opts}</div>`;
      list.appendChild(card);
    });
  },

  // ─── DNA ──────────────────────────────────────────────
  renderDNA() {
    if (App.dnaGroups) DNA.render(App.dnaGroups);
  },

  // ─── Notes ────────────────────────────────────────────
  async loadNotes() {
    App.showScreen('notes');
    if (App.notesGenerated) return;

    document.getElementById('notesLoading').style.display = 'flex';
    document.getElementById('notesContent').style.display = 'none';

    const aiInput = DNA.getAIInput(App.dnaGroups);

    try {
      const response = await fetch('/generate-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dnaReport: aiInput })
      });
      if (!response.ok) throw new Error('Server error: ' + response.status);
      const data = await response.json();
      document.getElementById('notesLoading').style.display = 'none';
      Notes.render(data.notes);
      App.notesGenerated = true;
    } catch (err) {
      document.getElementById('notesLoading').style.display = 'none';
      Notes.renderError(err.message);
    }
  }
};

// ─── Boot ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// Demo screen wiring (added for MEDHA)
document.addEventListener('DOMContentLoaded', () => {
  const btnDemo = document.getElementById('btnDemo');
  const btnDemoBack = document.getElementById('btnDemoBack');
  if (btnDemo) {
    btnDemo.addEventListener('click', () => {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById('screen-demo').classList.add('active');
      if (typeof Demo !== 'undefined') Demo.startAutoExam();
    });
  }
  if (btnDemoBack) {
    btnDemoBack.addEventListener('click', () => {
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById('screen-landing').classList.add('active');
      if (typeof Demo !== 'undefined') Demo.stopAuto();
    });
  }
});
