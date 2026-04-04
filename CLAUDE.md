# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Liqui2Cal is a Chrome Extension (Manifest V3) that injects "Add to Calendar" buttons on Liquipedia.net match pages. When clicked, buttons open Google Calendar with pre-filled event details (players, tournament, stage, time). No background scripts, no storage, no external API calls — it's a pure content script.

## Commands

- **Build:** `npm run build` — Vite bundles `src/content-script.ts` into `dist/content-script.js` (IIFE format)
- **Dev server:** `npm run dev` — runs Vite dev server (limited use for extensions; mainly for type-checking)
- **Package for Chrome Web Store:** `npm run zip` — builds then zips `dist/` to `~/Downloads/liqui2cal.zip`
- **Load in Chrome:** Go to `chrome://extensions`, enable Developer Mode, "Load unpacked" → select `dist/`

## Architecture

Two source files, one entry point:

- `src/content-script.ts` — Entry point injected on `liquipedia.net/*`. Scrapes match data from `.carousel-item` elements (opponent names, unix timestamps, stage info), creates styled anchor buttons, and appends them to `.match-info` containers.
- `src/google-calendar.ts` — Pure function `buildCalendarUrl(MatchData)` that converts match data into a Google Calendar "create event" URL. Assumes 1-hour event duration.
- `public/manifest.json` — Manifest V3 config. Content script runs on `liquipedia.net` only.
- `public/` — Static assets (icons, manifest) copied directly to `dist/` during build.
- `docs/index.md` — Privacy policy page (hosted via GitHub Pages).

Build produces a single IIFE bundle (`dist/content-script.js`) — no code splitting, no service worker.
