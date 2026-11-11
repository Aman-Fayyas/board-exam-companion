# Boardmate — Class 10 Study Companion

A lightweight, mobile-first Progressive Web App (PWA) prototype designed around a Samsung Galaxy S9+ sized screen. The app uses plain HTML, CSS and JavaScript; it has no framework runtime, external font dependency, analytics, ads, account system or remote database.

## Prototype scope

- Nine subject spaces: Mathematics, Biology, Chemistry, Physics, History, Civics, Economics, Geography and Malayalam.
- Biology, Chemistry and Physics are independent subjects, not one combined Science page.
- **No chapters, chapter titles, PYQs, formulas or notes are included yet.** All chapter arrays start empty by design.
- Each future chapter is planned to contain Value Points, Previous Year Questions (PYQs), a Formula Bank / Key Facts area, and Quick Revision.
- A simple study planner stores tasks in the browser's local storage on the device.
- The app shell can be cached for offline use after the first successful load over HTTPS.

## Run locally

Because service workers require a secure context (HTTPS or localhost), serve this directory with a local web server instead of opening `index.html` directly.

```bash
python -m http.server 8000
```

Open `http://localhost:8000` in a browser.

## Install on the Galaxy S9+

1. Open the deployed HTTPS app in Chrome or Samsung Internet.
2. In Chrome, use the browser menu and choose **Install app** or **Add to Home screen** (the wording varies by version). In Samsung Internet, use its **Add page to** / **Add to Home screen** option.
3. Launch Boardmate from the home screen. Load it once while online so the app shell can be cached for later offline use.

## GitHub Pages deployment

The repository is configured for a static site. In GitHub, open **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/ (root)`, then save. Once GitHub Pages finishes publishing, open the Pages URL over HTTPS on the phone. The manifest and service worker use relative paths so the project also works at a repository subpath.

## Local data and privacy

Planner tasks are stored in the browser's `localStorage` under `boardmate-class10-v1`. They are not sent to GitHub or any server. Clearing browser/site data will remove those local tasks. There is no cloud sync in this prototype.

## Tests

Run the automated logic and structure checks with `node --test tests/node-smoke.mjs`. A test checklist is in [`tests/TEST-REPORT.md`](tests/TEST-REPORT.md). A physical S9+ install check is still required before calling this production-ready.

## Design and accessibility decisions

- Compact-width bottom navigation with three destinations.
- Interactive controls are designed around 48 CSS-pixel minimum heights where practical, visible keyboard focus, and clear labels.
- Responsive subject grids, safe-area padding, readable system fonts, and reduced-motion support.
- Warm off-white, deep green, teal and terracotta palette; no purple/black theme.

## Roadmap after chapter lists arrive

1. Add only the chapter names and order supplied by the student.
2. Create each chapter's Value Points, PYQs, Formula Bank / Key Facts, and Quick Revision areas.
3. Add verified content and source references only after the chapter list and relevant study material are supplied.
