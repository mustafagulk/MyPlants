# 🌱 Plant Nutrient Guide

A Progressive Web App (PWA) for tracking nutrient schedules across growth stages for your plants. Works offline, installable on mobile and desktop.

---

## Project structure

```
plant-nutrient-guide/
├── index.html          # App shell + styles + HTML
├── app.js              # All JavaScript (data, rendering, state)
├── manifest.json       # PWA manifest (icons, theme, display mode)
├── service-worker.js   # Offline caching (cache-first strategy)
├── icons/              # App icons — see "Icons" section below
│   ├── icon-192.png
│   └── icon-512.png
└── README.md
```

---

## Icons

The manifest references two icon files that you need to create before deploying:

- `icons/icon-192.png` — 192×192 px
- `icons/icon-512.png` — 512×512 px

A quick way to generate them: use [RealFaviconGenerator](https://realfavicongenerator.net/) or [PWABuilder](https://www.pwabuilder.com/imageGenerator) and drop the exported files into an `icons/` folder.

---

## Deploying to GitHub Pages

1. Push this folder to a GitHub repository (or the root of one).
2. Go to **Settings → Pages** in your repo.
3. Under **Source**, select the branch (e.g. `main`) and folder (`/ (root)` or `/docs`).
4. Click **Save**. GitHub will give you a URL like `https://<username>.github.io/<repo>/`.
5. Make sure `start_url` in `manifest.json` matches your subdirectory path if the app is not at the root:
   ```json
   "start_url": "/<repo-name>/"
   ```

> **HTTPS is required for service workers.** GitHub Pages serves over HTTPS by default, so this works out of the box.

---

## Deploying to Firebase Hosting

### First-time setup

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
```

When prompted:
- **Public directory**: `.` (the folder containing `index.html`) or whichever subdirectory you're deploying from
- **Single-page app**: `No` (this app uses no client-side routing)
- **Overwrite `index.html`**: `No`

### Deploy

```bash
firebase deploy --only hosting
```

Your app will be live at `https://<project-id>.web.app`.

### firebase.json reference

```json
{
  "hosting": {
    "public": ".",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "headers": [
      {
        "source": "service-worker.js",
        "headers": [
          { "key": "Cache-Control", "value": "no-cache" }
        ]
      }
    ]
  }
}
```

> The `Cache-Control: no-cache` header on `service-worker.js` is important — it ensures browsers always fetch the latest SW and don't serve a stale cached version.

---

## Bumping the cache version

When you deploy new code, update the cache name in `service-worker.js` so users receive the new version:

```js
const CACHE_NAME = 'png-v2'; // increment this each release
```

---

## Local development

No build step required — open `index.html` directly in a browser, or run a local server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Service workers require either `localhost` or HTTPS, so use one of the above rather than opening the file directly via `file://`.

---

## Data storage

All plant data and preferences are stored in `localStorage` under two keys:

| Key | Contents |
|-----|----------|
| `png_data_v2` | Full plant dataset (JSON array) |
| `png_plant_prefs_v2` | Per-plant on/off state and selected growth stage |

Use **Edit Data → Export JSON** in the app to back up your data, or **Reset to original data** to restore defaults.
