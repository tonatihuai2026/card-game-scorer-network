# Card Game Score Trackers

Free, static, no-account score calculators for card games that don't already have good
apps. Each game gets its own page sharing one generic round-based scoring engine
(`tracker.js`), configured per page via a small `TRACKER_CONFIG` object.

## Pages
- `index.html` — landing page, lists all games
- `pinochle.html` — Pinochle score tracker + scoring reference
- `hollywood-gin.html` — Hollywood Gin score tracker + scoring reference
- `tracker.js` — shared generic engine: editable team count/names, per-round point entry,
  running history table, localStorage persistence (one save-slot per game, keyed by
  `gameSlug`)
- `styles.css` — shared theme

## Adding a new game
1. Copy `pinochle.html`, change the title/meta/JSON-LD, the team-vs-player label, and the
   "How scoring works" content for the new game.
2. Set a unique `gameSlug` in that page's `TRACKER_CONFIG` (this is the localStorage key —
   must not collide with another game).
3. Add a link from `index.html`'s game grid and an entry in `sitemap.xml`.

## Local development
No build step. Serve the directory with any static server, e.g.:
```
python3 -m http.server 8000
```

## Deploy
Push to a GitHub repo with Pages enabled on the root of `main` (or push `site/` as the
repo root).
