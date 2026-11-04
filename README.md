# Mi Español

A daily Spanish listening tracker: 60 minutes a day, five phases, 1,500 hours.
Liquid-glass design, rising bubbles, installable on your phone, works offline.

Live site (once GitHub Pages is on): https://doulav.github.io/Espaniol/

## Run it on your computer

```bash
npm install
npm run dev      # opens a local dev server
npm test         # checks the sync logic
npm run build    # production build into dist/
```

## How the code is laid out

```
index.html              page markup (all screens and sheets)
src/main.js             starts everything
src/content.js          the plan: phases, routine blocks, shows, resources
src/state.js            your data and the maths (hours, streak, averages)
src/storage/            where data is saved (see below)
src/views/              one file per screen: today, progress, watch, resources,
                        plus the session timer and the "log listening" sheet
src/ui/                 bubbles, theme, tabs, toast, chime, sheets
src/styles/             CSS split by area, same design as the original
public/                 app icons
```

## Storage and sync

Data is always saved on the device first (`localStorage`), so the app works
offline.

**Sync between devices** uses a private (secret) GitHub gist on your account.
Turn it on in Progreso > Sync across devices: make a token with only the
`gist` permission, paste it, tap Connect. Do the same on each device. The
token stays in that browser only. The app checks GitHub when it opens, when
you come back to it, and every minute while it is on screen. If two devices
change things while both are offline, the most recent change wins.

How it is built, if you ever want another service:

- `src/storage/sync.js` is the engine (last write wins by timestamp).
- `src/storage/adapters/gist.js` talks to GitHub.
- `src/storage/adapters/template.js` describes the three functions any
  adapter needs (`connect`, `subscribe`, `save`), with a Supabase sketch.
- `src/storage/config.js` picks which adapter is used.

Moving data from the old Claude artifact: open the old version, go to
Progreso, tap **Copy backup**. In the new app, tap **Restore backup**, paste,
then tap **Restore**.

## Deploying

Every push to `main` runs `.github/workflows/deploy.yml`, which tests,
builds and publishes to GitHub Pages. You can also run it by hand from the
Actions tab ("Deploy to GitHub Pages", then "Run workflow").
