# Boardmate — Class 10 Study Companion

A lightweight, mobile-first PWA designed around a Samsung Galaxy S9+ sized screen. Built with plain HTML, CSS and JavaScript.

## Live prototype
https://aman-fayyas.github.io/board-exam-companion/

## Included
- Nine separate subject spaces: Mathematics, Biology, Chemistry, Physics, History, Civics, Economics, Geography and Malayalam.
- No chapter names, PYQs, formulas or notes are preloaded. Chapter arrays remain empty until the student supplies the exact list.
- Planned chapter sections: Value Points, Previous Year Questions, Formula Bank / Key Facts and Quick Revision.
- Local study planner with add, complete, delete, task filters and clear-completed controls.
- Study guide with focus timer and practical revision methods.
- Offline PWA shell with a versioned service-worker cache.

## Visual direction
Warm cream, deep olive and muted amber, following the Grain camera project's visual direction. Editorial serif headings, soft surfaces, restrained borders and mobile-first navigation. No purple-black styling.

## Run locally
```bash
python -m http.server 8000
```
Open http://localhost:8000. Service workers require HTTPS or localhost.

## Install on the Galaxy S9+
Open the HTTPS site in Chrome or Samsung Internet, use Install app / Add to Home screen, then launch once while online so the app shell can be cached.

## Local data
Planner tasks are stored in localStorage on this device under `boardmate-class10-v1`. They are not sent to a server. Clearing browser/site data removes them; there is no cloud sync.

## Tests
Run `node --test tests/node-smoke.mjs`. A physical S9+ install and touch-interaction check is still required before calling this production-ready.
