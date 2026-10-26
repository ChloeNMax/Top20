# TOP20 v3

A black-and-white, mobile-friendly TOP 20 ranking creator, with English / Korean switching.

## Run / deploy

Upload `index.html`, `css/style.css`, and all files in `js/` to GitHub Pages, preserving their relative paths. `html2canvas` loads from a public CDN; an internet connection is required for search and JPG export.

## Features

- Wikipedia-powered general title search
- Add up to 100 picks and rearrange them by drag/drop or arrows
- Manual title/image entries, local autosave, JSON export/import, print/PDF
- Download JPG on desktop; iOS Share sheet where supported, otherwise an image preview with long-press Save to Photos fallback
- Fixed five-column JPG export regardless of narrow mobile screen; responsive mobile editor layout
- EN / KO toggle

## Known limits

External Wikipedia images can be blocked from canvas rendering by cross-origin restrictions. If an image is missing from JPG export, consider manually uploading an image you can use. Safari and iOS versions vary; test the iPhone share/save flow on real devices. Data is stored per browser and is not synced between devices.

## Supported by AI

Used Chatgpt to make it smooth
