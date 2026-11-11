import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const read = (name) => fs.readFileSync(new URL(name, root), 'utf8');
const app = read('app.js');
const html = read('index.html');
const css = read('styles.css');
const manifest = JSON.parse(read('manifest.webmanifest'));
const sw = read('sw.js');

test('all nine requested subjects remain separate', () => {
  for (const id of ['maths','biology','chemistry','physics','history','civics','economics','geography','malayalam']) {
    assert.match(app, new RegExp('id: "' + id + '"'));
  }
  assert.equal((app.match(/chapters: \[\]/g) || []).length, 9);
});

test('chapter library remains empty until the student supplies chapters', () => {
  assert.match(app, /No chapters added yet/);
  assert.match(app, /There are no chapter titles, PYQs, notes or formulas/);
  assert.match(app, /Value points/);
  assert.match(app, /Previous year questions/);
  assert.match(app, /Formula bank & key facts/);
  assert.match(app, /Quick revision/);
});

test('new Guide tab and study methods are present', () => {
  assert.match(html, /data-nav="guide"/);
  for (const phrase of ['Active recall','Spaced revision','Practise under time','Exam-day habits','balanced study routine','Focus timer']) {
    assert.ok(app.toLowerCase().includes(phrase.toLowerCase()), 'missing ' + phrase);
  }
});

test('focus timer supports start, pause and reset actions', () => {
  assert.match(app, /function handleFocusAction/);
  assert.match(app, /focusSeconds=1500/);
  assert.match(app, /data-focus="toggle"/);
  assert.match(app, /data-focus="reset"/);
});

test('planner and guide links are available from home', () => {
  assert.match(app, /Make today count/);
  assert.match(app, /data-nav="planner"/);
  assert.match(app, /data-nav="guide"/);
});

test('PWA manifest and offline cache use refreshed theme version', () => {
  assert.equal(manifest.theme_color, '#3e4c32');
  assert.equal(manifest.background_color, '#f4f1e7');
  assert.match(sw, /boardmate-shell-v3/);
  assert.match(sw, /addAll\(APP_SHELL\)/);
  assert.match(html, /manifest\.webmanifest/);
});

test('responsive and accessibility styles remain present', () => {
  assert.match(css, /@media \(min-width: 600px\)/);
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /min-height: 48px/);
  assert.match(css, /\.bottom-nav[\s\S]*grid-template-columns: repeat\(4, 1fr\)/);
});

test('Grain palette uses warm cream, olive and amber', () => {
  assert.match(css, /--green-dark:#3e4c32/);
  assert.match(css, /--paper:#f4f1e7/);
  assert.match(css, /--yellow-soft:#f4ead5/);
  assert.match(css, /--orange:#ad725b/);
});

test('planner has task filters and clear-completed action', () => {
  assert.match(app, /data-task-filter/);
  assert.match(app, /data-clear-done/);
  assert.match(app, /taskFilter === "done"/);
});
