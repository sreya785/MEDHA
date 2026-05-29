const DNA = {

  // Group behavior data into 4 categories
  buildGroups(payload) {
    const groups = {
      slow: [],      // time > 6s
      confused: [],  // switched 2+ times
      master: [],    // correct + fast + minimal switching
      danger: []     // wrong + fast
    };

    payload.forEach(item => {
      const fast = item.timeTaken <= 6;
      const switched = item.switchCount >= 1; // ANY switching = confused
      const correct = item.isCorrect;

      // PRIORITY: confused is always checked first — switching overrides everything
      if (switched) {
        groups.confused.push(item);
      } else if (fast && !correct) {
        // fast + wrong + no switching = danger (confidently wrong)
        groups.danger.push(item);
      } else if (fast && correct) {
        // fast + correct + no switching = mastered
        groups.master.push(item);
      } else {
        // slow (>6s) + no switching = slow
        groups.slow.push(item);
      }
    });

    return groups;
  },

  // Render the DNA report into #dnaGroups
  render(groups) {
    const container = document.getElementById('dnaGroups');
    container.innerHTML = '';

    const groupDefs = [
      {
        key: 'slow',
        groupClass: 'group-slow',
        tag: 'tag-slow',
        label: 'ধীর গতি',
        tagText: 'Group 1 — Slow',
        icon: '⏱',
        emptyMsg: 'কোনো ধীর প্রশ্ন নেই — গতি ভালো!'
      },
      {
        key: 'confused',
        groupClass: 'group-confused',
        tag: 'tag-confused',
        label: 'বিভ্রান্ত',
        tagText: 'Group 2 — Confused',
        icon: '🔀',
        emptyMsg: 'কোনো বিভ্রান্তি নেই — সিদ্ধান্ত দৃঢ় ছিল!'
      },
      {
        key: 'master',
        groupClass: 'group-master',
        tag: 'tag-master',
        label: 'আয়ত্ত',
        tagText: 'Group 3 — Mastered',
        icon: '✦',
        emptyMsg: 'এখনো কোনো আয়ত্ত প্রশ্ন নেই।'
      },
      {
        key: 'danger',
        groupClass: 'group-danger',
        tag: 'tag-danger',
        label: 'আত্মবিশ্বাসী ভুল',
        tagText: 'Group 4 — Danger',
        icon: '⚠',
        emptyMsg: 'কোনো আত্মবিশ্বাসী ভুল নেই — চমৎকার!'
      }
    ];

    groupDefs.forEach(def => {
      const items = groups[def.key];
      const section = document.createElement('div');
      section.className = 'dna-group ' + def.groupClass;

      const header = `
        <div class="dna-group-header">
          <div class="dna-group-icon">${def.icon}</div>
          <div class="dna-group-meta">
            <span class="dna-group-tag ${def.tag}">${def.tagText}</span>
            <span class="dna-group-label">${def.label}</span>
          </div>
          <span class="dna-group-count">${items.length}টি প্রশ্ন</span>
        </div>`;

      if (items.length === 0) {
        section.innerHTML = header + `<div class="no-group">${def.emptyMsg}</div>`;
      } else {
        const cards = items.map(item => DNA.buildCard(item)).join('');
        section.innerHTML = header + `<div class="dna-cards-wrap">${cards}</div>`;
      }

      container.appendChild(section);
    });
  },

  buildInsight(item) {
    const t = item.timeTaken;
    const switched = item.switchCount >= 1;
    const correct = item.isCorrect;
    const fast = t <= 6;

    if (switched) {
      // confused group
      if (correct) {
        return { cls: 'insight-confused', text: `🔀 সঠিক শেষ হয়েছে — কিন্তু ${item.clickSequence.join('→')} পথ দেখাচ্ছে ধারণায় বিভ্রান্তি ছিল।` };
      } else {
        return { cls: 'insight-confused', text: `🔀 ভুল এবং দ্বিধাগ্রস্ত — একাধিকবার পরিবর্তন করেও সঠিক উত্তর খুঁজে পাওনি।` };
      }
    } else if (fast && !correct) {
      // danger group
      return { cls: 'insight-danger', text: `⚠ ভুল এবং দ্রুত — কোনো দ্বিধা ছাড়াই ভুল বেছেছ। আত্মবিশ্বাসী ভুলই সবচেয়ে বিপজ্জনক।` };
    } else if (fast && correct) {
      // master group
      return { cls: 'insight-master', text: `✦ আয়ত্ত — দ্রুত, সঠিক, কোনো দ্বিধা নেই। এই ধারণাটি তোমার পুরোপুরি জানা।` };
    } else {
      // slow group
      if (correct) {
        return { cls: 'insight-slow', text: `⏱ সঠিক — কিন্তু ${t} সেকেন্ড লেগেছে। এই গতিতে পরীক্ষায় সমস্যা হতে পারে।` };
      } else {
        return { cls: 'insight-slow', text: `⏱ ভুল এবং ধীর — ${t} সেকেন্ড নিয়েও সঠিক উত্তর আসেনি। এই বিষয়টি আরও পড়া দরকার।` };
      }
    }
  },

  buildCard(item) {
    const letters = ['A', 'B', 'C', 'D'];
    const opts = item.options.map((opt, i) => {
      let cls = 'dna-opt';
      let icon = '';
      if (i === item.correctAnswerIndex) {
        cls += ' correct';
        icon = '<span class="d-icon">✓</span>';
      } else if (i === item.finalAnswerIndex && !item.isCorrect) {
        cls += ' wrong';
        icon = '<span class="d-icon">✗</span>';
      }
      return `<div class="${cls}"><span class="d-letter">${letters[i]}</span>${opt}${icon}</div>`;
    }).join('');

    // Build click path
    let clickPathHTML = '';
    if (item.clickSequence && item.clickSequence.length > 0) {
      const nodes = item.clickSequence.map((letter, idx) => {
        const isLast = idx === item.clickSequence.length - 1;
        let cls = 'cp-node';
        if (isLast) cls += item.isCorrect ? ' final-right' : ' final-wrong';
        const arrow = idx < item.clickSequence.length - 1 ? '<span class="cp-arrow">→</span>' : '';
        return `<span class="${cls}">${letter}</span>${arrow}`;
      }).join('');
      clickPathHTML = `<div class="click-path"><span class="cp-label">Click path:</span>${nodes}</div>`;
    }

    // Build insight line
    const insight = DNA.buildInsight(item);
    const insightHTML = `<div class="dna-insight ${insight.cls}">${insight.text}</div>`;

    return `
      <div class="dna-card">
        <div class="dna-card-time">⏱ ${item.timeTaken}s</div>
        <div class="dna-qtext">${item.questionText}</div>
        <div class="dna-opts">${opts}</div>
        ${clickPathHTML}
        ${insightHTML}
      </div>`;
  },

  // Returns only groups needed for AI (excludes master)
  getAIInput(groups) {
    return {
      slow: groups.slow,
      confused: groups.confused,
      danger: groups.danger
    };
  }
};
