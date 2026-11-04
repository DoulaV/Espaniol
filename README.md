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
offline. Sync to other devices is an optional, swappable "adapter":

- `src/storage/sync.js` is the engine. It keeps the latest version by
  timestamp (last write wins), the same rule the original app used.
- `src/storage/adapters/template.js` describes the three functions an adapter
  needs (`connect`, `subscribe`, `save`) and has a Supabase sketch.
- `src/storage/config.js` is the one line you change to switch it on.

Moving data from the old Claude artifact: open the old version, go to
Progreso, tap **Copy backup**. In the new app, tap **Restore backup**, paste,
then tap **Restore**.

## Deploying

Every push to `main` runs `.github/workflows/deploy.yml`, which tests,
builds and publishes to GitHub Pages. You can also run it by hand from the
Actions tab ("Deploy to GitHub Pages", then "Run workflow").
