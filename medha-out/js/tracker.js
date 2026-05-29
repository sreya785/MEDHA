// Silent behavior tracker — student never sees this working
const Tracker = {
  sessions: [],
  current: null,

  startQuestion(questionId, questionIndex) {
    this.current = {
      questionId,
      questionIndex,
      startTime: Date.now(),
      clickHistory: [],      // full sequence of options clicked
      finalAnswer: null,
      correctAnswer: QUESTIONS[questionIndex].correct,
      timeTaken: 0
    };
  },

  recordClick(optionIndex) {
    if (!this.current) return;
    this.current.clickHistory.push({
      option: optionIndex,
      timestamp: Date.now() - this.current.startTime
    });
    this.current.finalAnswer = optionIndex;
  },

  endQuestion() {
    if (!this.current) return;
    this.current.timeTaken = (Date.now() - this.current.startTime) / 1000;
    this.sessions.push({ ...this.current });
    this.current = null;
  },

  // Called when timer expires with no selection
  timeoutQuestion() {
    if (!this.current) return;
    this.current.timeTaken = 30;
    this.current.finalAnswer = null;
    this.sessions.push({ ...this.current });
    this.current = null;
  },

  getAll() {
    return this.sessions;
  },

  // Build the raw payload to send to backend
  buildPayload() {
    return this.sessions.map((s, i) => {
      const q = QUESTIONS[i];
      const letters = ['A', 'B', 'C', 'D'];
      return {
        questionId: s.questionId,
        questionText: q.text,
        options: q.options,
        correctAnswerIndex: s.correctAnswer,
        correctAnswerText: q.options[s.correctAnswer],
        finalAnswerIndex: s.finalAnswer,
        finalAnswerText: s.finalAnswer !== null ? q.options[s.finalAnswer] : null,
        timeTaken: parseFloat(s.timeTaken.toFixed(2)),
        clickSequence: s.clickHistory.map(c => letters[c.option]),
        isCorrect: s.finalAnswer === s.correctAnswer,
        switchCount: s.clickHistory.length - 1 < 0 ? 0 : s.clickHistory.length - 1
      };
    });
  }
};
