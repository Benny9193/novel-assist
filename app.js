// Novel Workspace - Client-side logic
(function () {
  'use strict';

  /* -------------------- Sample Data -------------------- */
  const data = {
    projects: [
      {
        id: 1,
        title: "The Last Symphony",
        author: "Jane Doe",
        genre: "Fantasy",
        wordCount: 45000,
        targetWords: 80000,
        lastModified: "2025-01-20",
        status: "In Progress",
        chapters: [
          {id: 1, title: "The Mysterious Composer", wordCount: 3200},
          {id: 2, title: "Hidden Melodies", wordCount: 2800},
          {id: 3, title: "The Academy of Sound", wordCount: 4100}
        ]
      },
      {
        id: 2,
        title: "Digital Hearts",
        author: "Jane Doe", 
        genre: "Science Fiction",
        wordCount: 12000,
        targetWords: 70000,
        lastModified: "2025-01-18",
        status: "Planning",
        chapters: []
      }
    ],
    characters: [
      {
        id: 1,
        name: "Elena Harmonicus",
        age: 24,
        role: "Protagonist",
        description: "A talented young musician who discovers she can hear the emotions behind every melody",
        backstory: "Raised in a family of deaf musicians who taught her that music transcends sound",
        goals: "To restore the lost Symphony of Souls and save her world from eternal silence",
        conflicts: "Struggles with self-doubt and the weight of destiny"
      },
      {
        id: 2,
        name: "Master Cadence", 
        age: 67,
        role: "Mentor",
        description: "The last keeper of the ancient musical traditions",
        backstory: "Former court composer who witnessed the Great Silence",
        goals: "To pass on the forbidden knowledge before it dies with him"
      }
    ],
    scenes: [
      {
        id: 1,
        title: "Elena's Discovery",
        chapter: 1,
        description: "Elena first realizes her unique ability while practicing in the abandoned concert hall",
        wordCount: 1200,
        status: "Complete"
      },
      {
        id: 2,
        title: "Meeting Master Cadence",
        chapter: 2,
        description: "Elena encounters the mysterious master who will become her guide",
        wordCount: 800,
        status: "Draft"
      }
    ],
    writingGoals: {
      dailyWordTarget: 1000,
      currentStreak: 5,
      todayWords: 650
    },
    plotStructure: {
      act1: {title: "Setup", scenes: ["Elena's Discovery", "The Calling"]},
      act2: {title: "Confrontation", scenes: ["Training Begins", "First Challenge", "The Revelation"]},
      act3: {title: "Resolution", scenes: ["Final Battle", "The New Symphony"]}
    }
  };

  let currentProject = data.projects[0];
  let writerContent = '';

  /* -------------------- DOM References -------------------- */
  const root = document.documentElement;
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.nav-link');
  const themeToggleBtn = document.getElementById('themeToggle');
  const dashboardContent = document.getElementById('dashboardContent');
  const projectGrid = document.getElementById('projectGrid');
  const chapterSelect = document.getElementById('chapterSelect');
  const editor = document.getElementById('editor');
  const wordCountDisplay = document.getElementById('wordCountDisplay');
  const progressBar = document.querySelector('.progress__bar');
  const focusModeBtn = document.getElementById('focusModeBtn');
  const characterList = document.getElementById('characterList');
  const characterDialog = document.getElementById('characterDialog');
  const plotTimeline = document.getElementById('plotTimeline');
  const notesList = document.getElementById('notesList');
  const exportCurrentBtn = document.getElementById('exportCurrentBtn');
  const backupAllBtn = document.getElementById('backupAllBtn');
  const newProjectBtn = document.getElementById('newProjectBtn');
  const globalSearch = document.getElementById('globalSearch');

  /* -------------------- Utilities -------------------- */
  function $(tag, cls, txt) {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (txt) el.textContent = txt;
    return el;
  }

  function switchSection(sectionId) {
    // Hide all sections
    sections.forEach((sec) => sec.classList.add('hidden'));
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.classList.remove('hidden');
    }
    
    // Update active nav link
    navLinks.forEach((btn) => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
  }

  function humanDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  /* -------------------- Theme -------------------- */
  function toggleTheme() {
    const currentScheme = root.getAttribute('data-color-scheme');
    const newScheme = currentScheme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-color-scheme', newScheme);
    themeToggleBtn.setAttribute('aria-pressed', newScheme === 'dark' ? 'true' : 'false');
    themeToggleBtn.textContent = newScheme === 'dark' ? '☀️' : '🌗';
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  /* -------------------- Navigation -------------------- */
  navLinks.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const sectionId = btn.dataset.section;
      if (sectionId) {
        switchSection(sectionId);
        
        // Render specific section content when switching
        switch (sectionId) {
          case 'dashboard':
            renderDashboard();
            break;
          case 'projects':
            renderProjects();
            break;
          case 'characters':
            renderCharacters();
            break;
          case 'plot':
            renderPlot();
            break;
          case 'notes':
            renderNotes();
            break;
        }
      }
    });
  });

  /* -------------------- Dashboard -------------------- */
  function renderDashboard() {
    if (!dashboardContent) return;
    
    dashboardContent.innerHTML = '';

    // Current project card
    const card = $('div', 'card');
    const body = $('div', 'card__body flex flex-col gap-8');
    body.appendChild($('h3', 'h3', currentProject.title));
    body.appendChild(
      $('p', '', `Words: ${currentProject.wordCount.toLocaleString()} / ${currentProject.targetWords.toLocaleString()}`)
    );
    body.appendChild($('p', 'status status--info', currentProject.status));
    card.appendChild(body);
    dashboardContent.appendChild(card);

    // Daily goal progress
    const goalCard = $('div', 'card');
    const goalBody = $('div', 'card__body flex flex-col gap-8');
    goalBody.appendChild($('h4', 'h4', 'Daily Goal'));
    const progressWrapper = $('div', 'progress', '');
    const bar = $('div', 'progress__bar', '');
    const pct = Math.min(
      (data.writingGoals.todayWords / data.writingGoals.dailyWordTarget) * 100,
      100
    );
    bar.style.width = `${pct}%`;
    progressWrapper.appendChild(bar);
    goalBody.appendChild(progressWrapper);
    goalBody.appendChild(
      $('p', '', `${data.writingGoals.todayWords} / ${data.writingGoals.dailyWordTarget} words today`)
    );
    goalCard.appendChild(goalBody);
    dashboardContent.appendChild(goalCard);

    // Streak counter
    const streakCard = $('div', 'card');
    const streakBody = $('div', 'card__body flex flex-col gap-8 items-center');
    streakBody.appendChild($('h4', 'h4', 'Writing Streak'));
    const streakNum = $('div', 'h2', `${data.writingGoals.currentStreak}`);
    streakBody.appendChild(streakNum);
    streakBody.appendChild($('p', '', 'days in a row'));
    streakCard.appendChild(streakBody);
    dashboardContent.appendChild(streakCard);
  }

  /* -------------------- Projects -------------------- */
  function renderProjects() {
    if (!projectGrid) return;
    
    projectGrid.innerHTML = '';
    data.projects.forEach((proj) => {
      const card = $('div', 'card');
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.addEventListener('click', () => selectProject(proj.id));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectProject(proj.id);
        }
      });
      const body = $('div', 'card__body flex flex-col gap-8');
      body.appendChild($('h3', 'h3', proj.title));
      body.appendChild($('p', '', `Genre: ${proj.genre || '—'}`));
      body.appendChild(
        $('p', '', `Words: ${proj.wordCount ? proj.wordCount.toLocaleString() : 0}`)
      );
      body.appendChild($('p', '', `Last edit: ${humanDate(proj.lastModified)}`));
      card.appendChild(body);
      projectGrid.appendChild(card);
    });
  }

  function selectProject(id) {
    const proj = data.projects.find((p) => p.id === id);
    if (!proj) return;
    currentProject = proj;
    populateChapters();
    switchSection('writer');
  }

  if (newProjectBtn) {
    newProjectBtn.addEventListener('click', () => {
      const title = prompt('Project title:');
      if (title && title.trim()) {
        const id = Date.now();
        const proj = {
          id,
          title: title.trim(),
          author: 'Unknown',
          genre: '',
          wordCount: 0,
          targetWords: 50000,
          lastModified: new Date().toISOString(),
          status: 'Planning',
          chapters: [],
        };
        data.projects.push(proj);
        renderProjects();
      }
    });
  }

  /* -------------------- Writer -------------------- */
  function populateChapters() {
    if (!chapterSelect) return;
    
    chapterSelect.innerHTML = '';
    if (!currentProject.chapters?.length) {
      const opt = $('option', '', 'No chapters');
      chapterSelect.appendChild(opt);
      chapterSelect.disabled = true;
      return;
    }
    chapterSelect.disabled = false;
    currentProject.chapters.forEach((chap, idx) => {
      const opt = $('option', '', `${idx + 1}. ${chap.title}`);
      opt.value = chap.id;
      chapterSelect.appendChild(opt);
    });
  }

  let saveTimer;
  function updateWordCount() {
    if (!editor || !wordCountDisplay) return;
    
    const text = editor.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    wordCountDisplay.textContent = `${words} words`;
    
    if (progressBar) {
      const pct = Math.min((words / data.writingGoals.dailyWordTarget) * 100, 100);
      progressBar.style.width = `${pct}%`;
    }

    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      writerContent = editor.value;
      console.info('Auto-saved (in-memory)');
    }, 1000);
  }

  if (editor) {
    editor.addEventListener('input', updateWordCount);
  }

  if (focusModeBtn) {
    focusModeBtn.addEventListener('click', () => {
      document.body.classList.toggle('focus-mode');
      focusModeBtn.textContent = document.body.classList.contains('focus-mode') 
        ? 'Exit Focus' 
        : 'Focus Mode';
    });
  }

  /* Keyboard shortcut: Ctrl+S to trigger save */
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (editor) {
        writerContent = editor.value;
        alert('Content saved (in-memory).');
      }
    }
  });

  /* -------------------- Characters -------------------- */
  function renderCharacters() {
    if (!characterList) return;
    
    characterList.innerHTML = '';
    data.characters.forEach((char) => {
      const card = $('div', 'card');
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.addEventListener('click', () => openCharacter(char));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openCharacter(char);
        }
      });
      const body = $('div', 'card__body');
      body.appendChild($('h4', 'h4', char.name));
      body.appendChild($('p', '', char.role));
      body.appendChild($('p', '', char.description));
      card.appendChild(body);
      characterList.appendChild(card);
    });
  }

  function openCharacter(char) {
    if (!characterDialog) return;
    
    characterDialog.innerHTML = '';
    const header = $('div', 'card__header');
    header.appendChild($('h3', 'h3', char.name));
    const body = $('div', 'card__body flex flex-col gap-8');
    body.appendChild($('p', '', `Age: ${char.age}`));
    body.appendChild($('p', '', `Role: ${char.role}`));
    body.appendChild($('p', '', char.description));
    if (char.goals) body.appendChild($('p', '', `Goals: ${char.goals}`));
    if (char.conflicts) body.appendChild($('p', '', `Conflicts: ${char.conflicts}`));
    const footer = $('div', 'card__footer flex justify-end');
    const closeBtn = $('button', 'btn btn--secondary btn--sm', 'Close');
    closeBtn.addEventListener('click', () => characterDialog.close());
    footer.appendChild(closeBtn);
    characterDialog.appendChild(header);
    characterDialog.appendChild(body);
    characterDialog.appendChild(footer);
    characterDialog.showModal();
  }

  /* -------------------- Plot -------------------- */
  function renderPlot() {
    if (!plotTimeline) return;
    
    plotTimeline.innerHTML = '';
    Object.entries(data.plotStructure).forEach(([key, act]) => {
      const actCol = $('div', 'plot-act');
      actCol.appendChild($('h4', 'h4', act.title));
      act.scenes.forEach((sceneTitle) => {
        const sceneCard = $('div', 'scene-card');
        sceneCard.appendChild($('p', '', sceneTitle));
        actCol.appendChild(sceneCard);
      });
      plotTimeline.appendChild(actCol);
    });
  }

  /* -------------------- Notes -------------------- */
  const notesData = [
    {
      id: 1,
      title: 'Magic System',
      content: 'Notes about how the Symphony magic works in this world. Music can affect reality when played with true emotion and understanding...'
    },
    {
      id: 2,
      title: 'World Building',
      content: 'The world is divided into regions based on musical scales. Each region has its own culture and magical properties...'
    }
  ];

  function renderNotes() {
    if (!notesList) return;
    
    notesList.innerHTML = '';
    notesData.forEach((note) => {
      const card = $('div', 'card');
      const body = $('div', 'card__body');
      body.appendChild($('h4', 'h4', note.title));
      body.appendChild($('p', '', note.content.substring(0, 120) + (note.content.length > 120 ? '…' : '')));
      card.appendChild(body);
      notesList.appendChild(card);
    });
  }

  const newNoteBtn = document.getElementById('newNoteBtn');
  if (newNoteBtn) {
    newNoteBtn.addEventListener('click', () => {
      const title = prompt('Note title:');
      if (title && title.trim()) {
        const content = prompt('Note content:') || '';
        notesData.push({ id: Date.now(), title: title.trim(), content });
        renderNotes();
      }
    });
  }

  /* -------------------- Export & Backup -------------------- */
  function download(filename, content, type = 'application/json') {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (exportCurrentBtn) {
    exportCurrentBtn.addEventListener('click', () => {
      const projectData = {
        ...currentProject,
        content: writerContent
      };
      download(`${currentProject.title}.json`, JSON.stringify(projectData, null, 2));
    });
  }

  if (backupAllBtn) {
    backupAllBtn.addEventListener('click', () => {
      const txt = data.projects.map((p) => `${p.title} - ${p.wordCount} words - ${p.status}`).join('\n');
      download('backup.txt', txt, 'text/plain');
    });
  }

  /* -------------------- Search -------------------- */
  if (globalSearch) {
    globalSearch.addEventListener('input', () => {
      const term = globalSearch.value.toLowerCase();
      if (!term) return;
      
      // Find matching project titles
      const proj = data.projects.find((p) => p.title.toLowerCase().includes(term));
      if (proj) {
        currentProject = proj;
        populateChapters();
        switchSection('projects');
        return;
      }
      
      // Find character names
      const char = data.characters.find((c) => c.name.toLowerCase().includes(term));
      if (char) {
        switchSection('characters');
        setTimeout(() => openCharacter(char), 100);
      }
    });
  }

  /* -------------------- Initialize -------------------- */
  function init() {
    // Set initial theme
    root.setAttribute('data-color-scheme', 'light');
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute('aria-pressed', 'false');
      themeToggleBtn.textContent = '🌗';
    }
    
    // Render initial content
    renderDashboard();
    renderProjects();
    populateChapters();
    renderCharacters();
    renderPlot();
    renderNotes();
    
    // Start on dashboard
    switchSection('dashboard');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();