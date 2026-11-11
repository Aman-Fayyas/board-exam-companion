(() => {
  "use strict";

  const SUBJECTS = [
    { id: "maths", title: "Mathematics", short: "MATH", group: "Core", tone: "green", blurb: "Concepts, practice & problem solving", chapters: [] },
    { id: "biology", title: "Biology", short: "BIO", group: "Science", tone: "green", blurb: "Living systems & processes", chapters: [] },
    { id: "chemistry", title: "Chemistry", short: "CHEM", group: "Science", tone: "orange", blurb: "Reactions, materials & concepts", chapters: [] },
    { id: "physics", title: "Physics", short: "PHY", group: "Science", tone: "blue", blurb: "Motion, energy & applications", chapters: [] },
    { id: "history", title: "History", short: "HIST", group: "Social Science", tone: "orange", blurb: "Events, timelines & people", chapters: [] },
    { id: "civics", title: "Civics", short: "CIV", group: "Social Science", tone: "blue", blurb: "Democracy, institutions & society", chapters: [] },
    { id: "economics", title: "Economics", short: "ECO", group: "Social Science", tone: "yellow", blurb: "Ideas, resources & development", chapters: [] },
    { id: "geography", title: "Geography", short: "GEO", group: "Social Science", tone: "green", blurb: "Places, resources & environments", chapters: [] },
    { id: "malayalam", title: "Malayalam", short: "മ", group: "Language", tone: "orange", blurb: "Language, literature & writing", chapters: [] }
  ];

  const CHAPTER_SECTIONS = [
    { id: "value-points", title: "Value points", subtitle: "Exam-ready points & explanations", description: "A clear, chapter-wise list of the important points to remember, with short explanations that are easy to revise." },
    { id: "pyqs", title: "Previous year questions", subtitle: "PYQs with answer space", description: "Previous-year questions grouped by chapter and question type. Answers will only be added when the correct source material is available." },
    { id: "formula-facts", title: "Formula bank & key facts", subtitle: "Formulas, dates, terms & rules", description: "A chapter-specific reference area. Maths, Physics and Chemistry can use formulas; other subjects can use dates, definitions, terms and key facts." },
    { id: "quick-revision", title: "Quick revision", subtitle: "Short notes & last-minute recap", description: "Compact recap notes, important diagrams or maps, and a quick self-check for each chapter." }
  ];

  const STORAGE_KEY = "boardmate-class10-v1";
  const app = document.getElementById("app");
  const toast = document.getElementById("toast");
  let currentView = "home";
  let selectedSubjectId = null;
  let searchTerm = "";
  let toastTimer = null;
  let focusSeconds = 1500;
  let focusInterval = null;
  let taskFilter = "all";
  let state = loadState();

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return { tasks: Array.isArray(parsed.tasks) ? parsed.tasks.filter(isValidTask) : [] };
    } catch (error) {
      return { tasks: [] };
    }
  }

  function isValidTask(task) {
    return task && typeof task.id === "string" && typeof task.title === "string" && typeof task.done === "boolean";
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (error) {
      showToast("This browser could not save locally. Check storage permissions.");
      return false;
    }
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  }

  function icon(name) {
    const paths = {
      arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
      back: '<path d="m15 18-6-6 6-6"/>',
      book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20M8 7h8M8 11h7"/>',
      note: '<path d="M6 3h9l4 4v14H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M14 3v5h5M8 12h8M8 16h8"/>',
      question: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9a2.5 2.5 0 1 1 4.5 1.5c-.9 1.1-2.1 1.3-2.1 3M12 17h.01"/>',
      formula: '<path d="M7 4h10M7 20h10M14 4 9 20M5 12h14"/>',
      spark: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
      check: '<path d="m5 12 4 4L19 6"/>',
      close: '<path d="m18 6-12 12M6 6l12 12"/>',
      trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.2 4.2"/>',
      calendar: '<rect x="3" y="4.5" width="18" height="17" rx="2.5"/><path d="M7.5 2.5v4M16.5 2.5v4M3.5 9h17"/>'
    };
    return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.book}</svg>`;
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
  }

  function dateLabel(date = new Date()) {
    return new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long" }).format(date);
  }

  function greeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  function subjectCard(subject) {
    return `
      <button class="subject-card" type="button" data-subject="${subject.id}" aria-label="Open ${escapeHTML(subject.title)}">
        <span class="subject-card-top"><span class="subject-icon ${subject.tone}">${escapeHTML(subject.short)}</span>${icon("arrow")}</span>
        <span class="subject-card-copy"><strong>${escapeHTML(subject.title)}</strong><small>Chapter library ready to fill</small></span>
      </button>`;
  }

  function renderHome() {
    const pending = state.tasks.filter(task => !task.done).length;
    app.innerHTML = `
      <section aria-labelledby="home-title">
        <div class="greeting-row">
          <div><p class="eyebrow">Your study space</p><h1 class="page-heading" id="home-title">${greeting()}.</h1><p class="date-label">${dateLabel()}</p></div>
        </div>
        <div class="hero-card">
          <div class="hero-topline"><span class="hero-label">Your board year, organised</span><span class="hero-mini-tag">Class 10</span></div>
          <h2 class="hero-title">Small steps.<br>Strong finish.</h2>
          <p class="hero-copy">A clear space for every subject, chapter and revision session. Your syllabus will go in when you send it.</p>
          <div class="hero-bottom">
            <div class="hero-stat"><strong>09</strong><span>subject spaces</span></div>
            <div class="hero-stat"><strong>${pending}</strong><span>plans to do</span></div>
            <button class="hero-cta" type="button" data-nav="subjects">Explore subjects ${icon("arrow")}</button>
          </div>
        </div>

        <div class="section-heading"><div><h2>Your subjects</h2><p>Every subject has its own space</p></div><button class="text-button" type="button" data-nav="subjects">View all</button></div>
        <div class="subject-grid">${SUBJECTS.map(subjectCard).join("")}</div>

        <div class="section-heading"><div><h2>Make today count</h2><p>Tools for a calmer, smarter study routine</p></div><button class="text-button" type="button" data-nav="guide">Open guide</button></div>
        <div class="quick-link-grid"><button class="quick-link" type="button" data-nav="guide"><strong>25-minute focus</strong><small>Short, distraction-light study sessions</small></button><button class="quick-link" type="button" data-nav="planner"><strong>Plan your day</strong><small>Turn a big goal into small tasks</small></button></div>
        <div class="info-strip">
          <span class="info-icon">${icon("spark")}</span>
          <div><strong>Chapters are intentionally empty</strong><p>No chapter names, formulas or PYQs have been preloaded. Once you send your chapter list, we can build the exact content around your syllabus.</p></div>
        </div>
      </section>`;
  }

  function renderSubjects() {
    const query = searchTerm.trim().toLocaleLowerCase();
    const filtered = SUBJECTS.filter(subject => `${subject.title} ${subject.group}`.toLocaleLowerCase().includes(query));
    const groups = ["Core", "Science", "Social Science", "Language"];
    const content = groups.map(group => {
      const entries = filtered.filter(subject => subject.group === group);
      if (!entries.length) return "";
      const label = group === "Core" ? "Core subject" : group === "Science" ? "Science · kept separate" : group === "Social Science" ? "Social science" : "Language";
      return `<section aria-label="${label}"><h2 class="group-label">${label}</h2><div class="subject-grid">${entries.map(subjectCard).join("")}</div></section>`;
    }).join("");
    app.innerHTML = `
      <section aria-labelledby="subjects-title">
        <p class="eyebrow">The full line-up</p><h1 class="page-heading" id="subjects-title">Your subjects</h1>
        <p class="page-subtitle">Nine separate spaces, ready for your chapter lists. Biology, Chemistry and Physics each get their own workspace.</p>
        <div class="search-wrap">${icon("search")}<input id="subject-search" class="search-input" type="search" autocomplete="off" placeholder="Find a subject…" value="${escapeHTML(searchTerm)}" aria-label="Search subjects"></div>
        ${content || '<div class="empty-search">No subject matches that search. Try another name.</div>'}
      </section>`;
    const input = document.getElementById("subject-search");
    input?.addEventListener("input", event => {
      const cursor = event.target.selectionStart;
      searchTerm = event.target.value;
      renderSubjects();
      const next = document.getElementById("subject-search");
      next?.focus();
      next?.setSelectionRange(cursor, cursor);
    });
  }

  function sectionCard(section) {
    const names = { "value-points": "note", pyqs: "question", "formula-facts": "formula", "quick-revision": "spark" };
    return `<button class="template-card" type="button" data-section="${section.id}"><span class="template-icon">${icon(names[section.id])}</span><span><strong>${section.title}</strong><small>${section.subtitle}</small></span></button>`;
  }

  function renderSubjectDetail() {
    const subject = SUBJECTS.find(item => item.id === selectedSubjectId);
    if (!subject) { currentView = "subjects"; renderSubjects(); return; }
    app.innerHTML = `
      <section aria-labelledby="subject-title">
        <button class="back-button" type="button" data-nav="subjects">${icon("back")} All subjects</button>
        <div class="subject-hero"><span class="subject-icon ${subject.tone}">${escapeHTML(subject.short)}</span><div><h1 id="subject-title">${escapeHTML(subject.title)}</h1><p>${escapeHTML(subject.blurb)}</p></div></div>
        <div class="chapter-empty">
          <span class="empty-illustration">${icon("book")}</span>
          <h2>No chapters added yet</h2>
          <p>This ${escapeHTML(subject.title)} workspace is ready. Send your chapter list when you’re ready and we’ll add only those chapters.</p>
          <span class="ready-tag"><span></span> Waiting for your chapter list</span>
        </div>
        <div class="section-heading template-heading"><div><h2>Inside every chapter</h2><p>The study sections we’ll use</p></div></div>
        <div class="template-grid">${CHAPTER_SECTIONS.map(sectionCard).join("")}</div>
        <p class="small-note">These are structure previews only. There are no chapter titles, PYQs, notes or formulas in the app yet.</p>
      </section>`;
  }


  function renderGuide() {
    app.innerHTML = `<section aria-labelledby="guide-title"><p class="eyebrow">Study smarter, not longer</p><h1 class="page-heading" id="guide-title">Your study guide</h1><p class="page-subtitle">Practical methods, gentle reminders and a focus timer. No chapter content is assumed.</p>
    <div class="guide-hero"><h2>One focused session is a win.</h2><p>Pick one small task, put distractions aside, and give it your attention. Take a proper break afterwards.</p></div>
    <div class="section-heading"><div><h2>Focus timer</h2><p>A simple 25-minute study block</p></div></div>
    <div class="focus-clock"><div class="clock-face" id="focus-clock">25:00</div><span class="clock-caption" id="focus-caption">Ready when you are · Take a 5-minute break afterwards</span><div class="clock-actions"><button type="button" data-focus="toggle" id="focus-toggle">Start focus</button><button type="button" class="secondary" data-focus="reset">Reset</button></div></div>
    <div class="section-heading"><div><h2>Methods that actually help</h2><p>Use these across every subject</p></div></div>
    <div class="guide-grid">
    <article class="guide-card"><span class="tip-label">01 · Remembering</span><h3>Active recall</h3><p>Read a small section, close the book, and explain the idea in your own words. Check what you missed, then try again.</p></article>
    <article class="guide-card"><span class="tip-label">02 · Long-term memory</span><h3>Spaced revision</h3><p>Revisit a topic after a day, a few days, and a week. Short repeat sessions usually beat one huge last-minute reread.</p></article>
    <article class="guide-card"><span class="tip-label">03 · Exam practice</span><h3>Practise under time</h3><p>Use a timer for question practice. After checking, write down why an answer was incomplete and what you will do differently.</p></article>
    <article class="guide-card"><span class="tip-label">04 · Better notes</span><h3>Keep notes useful</h3><p>Use headings, keywords, diagrams and short explanations. Avoid copying entire paragraphs when a few meaningful points will do.</p></article>
    <article class="guide-card"><span class="tip-label">05 · Maths & science</span><h3>Show your working</h3><p>Write the formula or principle, substitute carefully, keep units visible and check whether the final answer makes sense.</p></article>
    <article class="guide-card"><span class="tip-label">06 · Languages & social science</span><h3>Practise clear expression</h3><p>Plan answers with a beginning, organised points and a short conclusion where appropriate. Practise writing, not just reading.</p></article></div>
    <div class="section-heading"><div><h2>Exam-day habits</h2><p>A calm checklist to practise beforehand</p></div></div><div class="guide-card"><ul><li>Read instructions and question choices carefully.</li><li>Plan your time across the paper; keep a little time to review.</li><li>Answer what is asked and make handwriting easy to read.</li><li>Label diagrams, maps, units and steps where relevant.</li><li>If a question feels difficult, move on and return later.</li><li>Pack permitted stationery and required documents the night before.</li></ul></div>
    <div class="section-heading"><div><h2>A balanced study routine</h2><p>Consistency without burning out</p></div></div><div class="guide-card"><h3>Try this flexible pattern</h3><ul><li>Choose 2–3 realistic priorities for the day.</li><li>Start with one focused block of 25 minutes.</li><li>Take a 5-minute movement or water break.</li><li>Switch subject or task after a couple of blocks.</li><li>Finish by recalling what you learned and choosing tomorrow's first task.</li><li>Protect regular meals, sleep and free time. Rest is part of learning.</li></ul></div></section>`;
    updateFocusDisplay();
  }
  function updateFocusDisplay() {
    const clock=document.getElementById("focus-clock"), caption=document.getElementById("focus-caption"), toggle=document.getElementById("focus-toggle");
    if(clock) clock.textContent=`${String(Math.floor(focusSeconds/60)).padStart(2,"0")}:${String(focusSeconds%60).padStart(2,"0")}`;
    if(caption&&!focusInterval) caption.textContent=focusSeconds===0?"Session complete · Take a proper break.":"Ready when you are · Take a 5-minute break afterwards";
    if(toggle) toggle.textContent=focusInterval?"Pause timer":focusSeconds===0?"Start again":"Start focus";
  }
  function stopFocusTimer(){if(focusInterval)clearInterval(focusInterval);focusInterval=null;}
  function handleFocusAction(action){
    if(action==="reset"){stopFocusTimer();focusSeconds=1500;updateFocusDisplay();return;}
    if(focusInterval){stopFocusTimer();updateFocusDisplay();return;}
    if(focusSeconds===0)focusSeconds=1500;
    focusInterval=setInterval(()=>{focusSeconds=Math.max(0,focusSeconds-1);if(focusSeconds===0){stopFocusTimer();showToast("Focus session complete. Take a short break.");}updateFocusDisplay();},1000);
    updateFocusDisplay();
  }

  function todayISO() {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function taskDateText(iso) {
    if (!iso) return "No date";
    const date = new Date(`${iso}T00:00:00`);
    return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(date);
  }

  function renderTask(task) {
    const subject = SUBJECTS.find(item => item.id === task.subjectId);
    return `<article class="task-item ${task.done ? "is-done" : ""}">
      <button class="task-check" type="button" data-toggle-task="${escapeHTML(task.id)}" aria-label="${task.done ? "Mark as not done" : "Mark as done"}" aria-pressed="${task.done}">${task.done ? icon("check") : ""}</button>
      <div class="task-copy"><strong>${escapeHTML(task.title)}</strong><span class="task-meta">${subject ? escapeHTML(subject.title) + " · " : ""}${taskDateText(task.date)}</span></div>
      <button class="delete-task" type="button" data-delete-task="${escapeHTML(task.id)}" aria-label="Delete task">${icon("trash")}</button>
    </article>`;
  }

  function renderPlanner() {
    const sorted = [...state.tasks].sort((a, b) => Number(a.done) - Number(b.done) || String(a.date || "9999").localeCompare(String(b.date || "9999")));
    const done = state.tasks.filter(task => task.done).length;
    const pending = state.tasks.length - done;
    const visibleTasks = sorted.filter(task => taskFilter === "all" || (taskFilter === "open" && !task.done) || (taskFilter === "done" && task.done));
    app.innerHTML = `
      <section aria-labelledby="planner-title">
        <p class="eyebrow">One day at a time</p><h1 class="page-heading" id="planner-title">Study planner</h1>
        <p class="page-subtitle">Keep small, manageable study tasks in one place. Your plan is saved only on this device.</p>
        <div class="planner-summary"><div class="summary-chip"><strong>${pending}</strong><span>To do</span></div><div class="summary-chip"><strong>${done}</strong><span>Completed</span></div></div>
        <form id="task-form" class="planner-card">
          <label class="form-label" for="task-title">What do you want to work on?</label>
          <input id="task-title" class="form-control" name="title" maxlength="90" required placeholder="e.g. Revise today's class notes" autocomplete="off">
          <div class="form-row"><div><label class="form-label" for="task-subject">Subject</label><select id="task-subject" class="form-control" name="subject"><option value="">Any subject</option>${SUBJECTS.map(subject => `<option value="${subject.id}">${escapeHTML(subject.title)}</option>`).join("")}</select></div><div><label class="form-label" for="task-date">Date</label><input id="task-date" class="form-control" type="date" name="date" value="${todayISO()}"></div></div>
          <button class="primary-button" type="submit">${icon("plus")} Add to my plan</button>
        </form>
        <div class="section-heading"><div><h2>Your tasks</h2><p>Stored on this phone</p></div>${done ? '<button class="text-button" type="button" data-clear-done>Clear completed</button>' : ''}</div>
        <div class="filter-pills" role="group" aria-label="Filter tasks">${[["all","All"],["open","To do"],["done","Done"]].map(([value,label]) => `<button class="filter-pill ${taskFilter === value ? "active" : ""}" type="button" data-task-filter="${value}" aria-pressed="${taskFilter === value}">${label}</button>`).join("")}</div>
        ${visibleTasks.length ? `<div class="task-list">${visibleTasks.map(renderTask).join("")}</div>` : `<div class="planner-empty">${taskFilter === "done" ? "No completed tasks yet." : taskFilter === "open" ? "You're all caught up." : "Your plan is clear for now. Add one small task to get started."}</div>`}
      </section>`;
    document.getElementById("task-form")?.addEventListener("submit", addTask);
  }

  function addTask(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("title") || "").trim();
    if (!title) { showToast("Add a task name first."); return; }
    state.tasks.push({ id: makeId(), title, subjectId: String(formData.get("subject") || ""), date: String(formData.get("date") || ""), done: false });
    saveState();
    renderPlanner();
    showToast("Added to your study plan.");
  }

  function makeId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  function showSectionInfo(sectionId) {
    const section = CHAPTER_SECTIONS.find(item => item.id === sectionId);
    if (!section) return;
    const existing = document.getElementById("section-modal");
    existing?.remove();
    const modal = document.createElement("div");
    modal.className = "modal-backdrop";
    modal.id = "section-modal";
    modal.innerHTML = `<section class="modal-sheet" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-top"><h2 id="modal-title">${section.title}</h2><button class="modal-close" type="button" aria-label="Close">${icon("close")}</button></div><p>${section.description}</p><p>This section will be created under each chapter after you share the chapter list. Nothing has been prefilled.</p></section>`;
    document.body.appendChild(modal);
    modal.querySelector(".modal-close")?.focus();
    modal.addEventListener("click", event => { if (event.target === modal || event.target.closest(".modal-close")) modal.remove(); });
    modal.addEventListener("keydown", event => { if (event.key === "Escape") modal.remove(); });
  }

  function setView(view) {
    currentView = view;
    selectedSubjectId = null;
    searchTerm = view === "subjects" ? searchTerm : "";
    render();
  }

  function render() {
    if (currentView === "home") renderHome();
    else if (currentView === "subjects") renderSubjects();
    else if (currentView === "planner") renderPlanner();
    else if (currentView === "guide") renderGuide();
    else if (currentView === "subject") renderSubjectDetail();
    updateNavigation();
  }

  function updateNavigation() {
    document.querySelectorAll(".nav-item").forEach(button => {
      const active = button.dataset.nav === currentView || (currentView === "subject" && button.dataset.nav === "subjects");
      button.classList.toggle("is-active", active);
      if (active) button.setAttribute("aria-current", "page"); else button.removeAttribute("aria-current");
    });
  }

  document.addEventListener("click", event => {
    const navButton = event.target.closest("[data-nav]");
    if (navButton) {
      const next = navButton.dataset.nav;
      if (["home", "subjects", "planner", "guide"].includes(next)) setView(next);
      return;
    }
    const focusButton = event.target.closest("[data-focus]");
    if (focusButton) { handleFocusAction(focusButton.dataset.focus); return; }
    const subjectButton = event.target.closest("[data-subject]");
    if (subjectButton) {
      selectedSubjectId = subjectButton.dataset.subject;
      currentView = "subject";
      render();
      document.getElementById("app")?.focus({ preventScroll: true });
      return;
    }
    const sectionButton = event.target.closest("[data-section]");
    if (sectionButton) { showSectionInfo(sectionButton.dataset.section); return; }
    const toggleButton = event.target.closest("[data-toggle-task]");
    if (toggleButton) {
      const task = state.tasks.find(item => item.id === toggleButton.dataset.toggleTask);
      if (task) { task.done = !task.done; saveState(); renderPlanner(); }
      return;
    }
    const deleteButton = event.target.closest("[data-delete-task]");
    if (deleteButton) {
      state.tasks = state.tasks.filter(item => item.id !== deleteButton.dataset.deleteTask);
      saveState(); renderPlanner(); showToast("Task removed.");
      return;
    }
    const filterButton = event.target.closest("[data-task-filter]");
    if (filterButton) { taskFilter = filterButton.dataset.taskFilter; renderPlanner(); return; }
    if (event.target.closest("[data-clear-done]")) {
      state.tasks = state.tasks.filter(item => !item.done);
      saveState(); renderPlanner(); showToast("Completed tasks cleared.");
    }
  });

  window.addEventListener("hashchange", () => {
    if (location.hash === "#subjects") setView("subjects");
    else if (location.hash === "#planner") setView("planner");
    else if (location.hash === "#guide") setView("guide");
    else if (location.hash === "#home" || !location.hash) setView("home");
  });

  // A small, read-only surface for automated smoke checks; it does not add content.
  window.__BOARDMATE_TEST__ = {
    subjects: () => SUBJECTS.map(({ id, title, chapters }) => ({ id, title, chapterCount: chapters.length })),
    sections: () => CHAPTER_SECTIONS.map(({ id, title }) => ({ id, title })),
    state: () => JSON.parse(JSON.stringify(state)),
    view: () => currentView,
    openSubject: id => { if (SUBJECTS.some(subject => subject.id === id)) { selectedSubjectId = id; currentView = "subject"; render(); } },
    openView: view => { if (["home", "subjects", "planner", "guide"].includes(view)) setView(view); },
    addTask: (title, subjectId = "", date = todayISO()) => { state.tasks.push({ id: makeId(), title, subjectId, date, done: false }); saveState(); renderPlanner(); },
    clearTasks: () => { state.tasks = []; saveState(); renderPlanner(); },
    focusSeconds: () => focusSeconds
  };

  render();

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => showToast("Offline mode could not be enabled in this browser.")));
  }
})();
