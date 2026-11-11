import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');

function boot(store = new Map()) {
  const app = { innerHTML: '', focus() {} };
  const toast = { textContent: '', classList: { add() {}, remove() {} } };
  const listeners = new Map();
  const searchInput = { value: '', selectionStart: 0, addEventListener(type, fn) { listeners.set(\`search:\${type}\`, fn); }, focus() {}, setSelectionRange() {} };
  const form = { addEventListener(type, fn) { listeners.set(\`form:\${type}\`, fn); } };
  const navs = ['home','subjects','planner'].map(nav => ({ dataset: { nav }, classList: { toggle() {} }, setAttribute() {}, removeAttribute() {} }));
  const documentListeners = new Map();
  const document = {
    body: { appendChild() {} },
    getElementById(id) {
      if (id === 'app') return app;
      if (id === 'toast') return toast;
      if (id === 'subject-search') return searchInput;
      if (id === 'task-form') return form;
      return null;
    },
    querySelectorAll(selector) { return selector === '.nav-item' ? navs : []; },
    addEventListener(type, fn) { documentListeners.set(type, fn); },
    createElement() { return { className: '', id: '', innerHTML: '', addEventListener() {}, querySelector() { return { focus() {} }; } }; }
  };
  const localStorage = {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, value); }
  };
  const window = {
    crypto: { randomUUID: () => \`id-\${Math.random().toString(36).slice(2)}\` },
    location: { hash: '', protocol: 'file:' },
    addEventListener() {}
  };
  const context = {
    window, document, localStorage, navigator: {}, location: window.location,
    console, Intl, Date, Math, JSON, String, Array, Object, Number, RegExp,
    setTimeout: () => 1, clearTimeout() {},
  };
  vm.runInNewContext(source, context, { filename: 'app.js' });
  return { api: window.__BOARDMATE_TEST__, app, listeners, documentListeners, store };
}

test('all requested subjects exist and science is split into three workspaces', () => {
  const { api } = boot();
  const subjects = api.subjects();
  assert.equal(subjects.length, 9);
  for (const id of ['maths','biology','chemistry','physics','history','civics','economics','geography','malayalam']) {
    assert.ok(subjects.some(s => s.id === id), \`missing \${id}\`);
  }
});

test('no chapters are seeded for any subject', () => {
  const { api } = boot();
  assert.ok(api.subjects().every(s => s.chapterCount === 0));
});

test('subject detail has an empty chapter state and four future section types', () => {
  const { api, app } = boot();
  api.openSubject('biology');
  assert.match(app.innerHTML, /Biology/);
  assert.match(app.innerHTML, /No chapters added yet/);
  for (const label of ['Value points','Previous year questions','Formula bank & key facts','Quick revision']) {
    assert.ok(app.innerHTML.includes(label), \`missing \${label}\`);
  }
});

test('subject search filters to Chemistry', () => {
  const { api, app, listeners } = boot();
  api.openView('subjects');
  const handler = listeners.get('search:input');
  assert.equal(typeof handler, 'function');
  handler({ target: { value: 'chem', selectionStart: 4 } });
  assert.match(app.innerHTML, /Chemistry/);
  assert.doesNotMatch(app.innerHTML, /data-subject="biology"/);
});

test('planner creates, completes and deletes tasks', () => {
  const { api, app, documentListeners } = boot();
  api.openView('planner');
  api.addTask('Revise today\\'s notes', 'maths', '2026-11-12');
  const task = api.state().tasks[0];
  assert.equal(task.title, 'Revise today\\'s notes');
  assert.match(app.innerHTML, /Revise today&#39;s notes/);
  const click = documentListeners.get('click');
  click({ target: { closest(selector) { return selector === '[data-toggle-task]' ? { dataset: { toggleTask: task.id } } : null; } } });
  assert.equal(api.state().tasks[0].done, true);
  click({ target: { closest(selector) { return selector === '[data-delete-task]' ? { dataset: { deleteTask: task.id } } : null; } } });
  assert.equal(api.state().tasks.length, 0);
});

test('planner data survives app reload through localStorage', () => {
  const store = new Map();
  const first = boot(store);
  first.api.addTask('Persist this plan', 'physics', '2026-11-13');
  const second = boot(store);
  assert.equal(second.api.state().tasks.length, 1);
  assert.equal(second.api.state().tasks[0].title, 'Persist this plan');
});

test('PWA shell files and responsive accessibility rules are present', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const css = fs.readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const manifest = JSON.parse(fs.readFileSync(new URL('../manifest.webmanifest', import.meta.url), 'utf8'));
  const sw = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
  assert.match(html, /manifest\\.webmanifest/);
  assert.match(html, /viewport-fit=cover/);
  assert.match(css, /@media \\(min-width: 600px\\)/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.equal(manifest.icons.length, 2);
  assert.match(sw, /addAll\\(APP_SHELL\\)/);
});

test('touch targets and install icons are sized for mobile', () => {
  const css = fs.readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(css, /\\.nav-item\\s*\\{[^}]*min-height:\\s*50px/s);
  assert.match(css, /\\.hero-cta\\s*\\{[^}]*min-height:\\s*48px/s);
  assert.match(css, /\\.task-check\\s*\\{[^}]*width:\\s*48px;\\s*height:\\s*48px/s);
  assert.match(css, /\\.delete-task\\s*\\{[^}]*width:\\s*48px;\\s*height:\\s*48px/s);
  assert.match(html, /viewport-fit=cover/);
  for (const [file, expected] of [['icon-192.png',192],['icon-512.png',512]]) {
    const png = fs.readFileSync(new URL(\`../assets/\${file}\`, import.meta.url));
    assert.equal(png.toString('hex',0,8), '89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16), expected);
    assert.equal(png.readUInt32BE(20), expected);
  }
});
