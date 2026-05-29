const Notes = {

  // Render AI-generated notes into the UI
  // aiData shape: { slow: [...], confused: [...], danger: [...] }
  render(aiData) {
    const container = document.getElementById('notesContent');
    container.innerHTML = '';

    const sections = [
      {
        key: 'slow',
        label: 'ধীর গতি',
        badgeClass: 'nb-slow',
        sectionClass: 'sec-slow',
        sectionNum: 'Section 1 — Slow',
        icon: '⏱',
        renderer: Notes.renderSlowCard
      },
      {
        key: 'confused',
        label: 'বিভ্রান্ত',
        badgeClass: 'nb-confused',
        sectionClass: 'sec-confused',
        sectionNum: 'Section 2 — Confused',
        icon: '🔀',
        renderer: Notes.renderConfusedCard
      },
      {
        key: 'danger',
        label: 'আত্মবিশ্বাসী ভুল',
        badgeClass: 'nb-danger',
        sectionClass: 'sec-danger',
        sectionNum: 'Section 3 — Danger',
        icon: '⚠',
        renderer: Notes.renderDangerCard
      }
    ];

    sections.forEach(sec => {
      const items = aiData[sec.key];
      if (!items || items.length === 0) return;

      const section = document.createElement('div');
      section.className = 'notes-section ' + sec.sectionClass;

      let cards = '';
      items.forEach(item => { cards += sec.renderer(item); });

      section.innerHTML = `
        <div class="notes-section-title">
          <span class="notes-badge ${sec.badgeClass}">${sec.sectionNum}</span>
          <span class="notes-section-label">${sec.label}</span>
        </div>
        <div class="notes-cards-wrap">${cards}</div>`;

      container.appendChild(section);
    });

    container.style.display = 'block';
  },

  // Section 1: Slow
  renderSlowCard(item) {
    return `
      <div class="demo-note-card">
        <div class="demo-note-topic">${item.topic}</div>
        <div class="demo-note-row">
          <span class="demo-note-lbl">Explanation</span>
          <span class="demo-note-val">${item.explanation}</span>
        </div>
        <div class="demo-note-row">
          <span class="demo-note-lbl">Memory trick</span>
          <span class="demo-note-val">${item.memoryTrick}</span>
        </div>
        <div class="demo-note-trap">${item.trapQuestion}</div>
      </div>`;
  },

  // Section 2: Confused — with comparison table (same flex layout as demo)
  renderConfusedCard(item) {
    // item.comparisonTable = [{ concept, description }, ...]
    // First entry is always the correct concept
    const headers = item.comparisonTable.map((col, i) =>
      `<div class="dct-th ${i === 0 ? 'correct-th' : 'wrong-th'}">${col.concept}</div>`
    ).join('');

    const cells = item.comparisonTable.map((col, i) =>
      `<div class="dct-td ${i === 0 ? 'correct-td' : 'wrong-td'}">${col.description}</div>`
    ).join('');

    return `
      <div class="demo-note-card">
        <div class="demo-note-topic">${item.topic}</div>
        <div class="demo-confusion-table">
          <div class="dct-head">${headers}</div>
          <div class="dct-body">${cells}</div>
        </div>
        <div class="demo-note-row">
          <span class="demo-note-lbl">Memory trick</span>
          <span class="demo-note-val">${item.memoryTrick}</span>
        </div>
        <div class="demo-note-trap">${item.trapQuestion}</div>
      </div>`;
  },

  // Section 3: Danger — confidently wrong
  renderDangerCard(item) {
    return `
      <div class="demo-note-card">
        <div class="demo-note-topic">${item.topic}</div>
        <div class="demo-note-row">
          <span class="demo-note-lbl">Explanation</span>
          <span class="demo-note-val">${item.explanation}</span>
        </div>
        <div class="demo-note-row">
          <span class="demo-note-lbl">Why correct</span>
          <span class="demo-note-val">${item.whyCorrect}</span>
        </div>
        <div class="demo-note-row">
          <span class="demo-note-lbl">Why tricked</span>
          <span class="demo-note-val">${item.whyTricked}</span>
        </div>
        <div class="demo-note-trap">${item.trapQuestion}</div>
      </div>`;
  },

  // Show error state if API fails
  renderError(message) {
    const container = document.getElementById('notesContent');
    container.innerHTML = `
      <div class="no-group" style="padding: 2rem; text-align:center;">
        <p style="color: var(--red); margin-bottom: 8px;">Could not generate study notes</p>
        <p style="font-size:13px; color: var(--text3);">${message || 'Please check your backend connection and try again.'}</p>
      </div>`;
    container.style.display = 'block';
  }
};
