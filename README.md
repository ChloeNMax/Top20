# TOP RANKING - V2

A black-and-white, bilingual (EN/KO) ranking maker. Add and reorder any number of items up to **100**.

## Features
- Search existing media via Wikipedia / Open Library or add titles and images manually
- Drag to reorder, edit list title/description, export/import JSON
- Export JPG, including mobile iOS preview fallback, and print/PDF
- Automatically saves to `localStorage` key `top_ranking_v1`
- Migrates existing browser data from `top20_studio_v1` if the new key does not exist; the legacy key is not deleted
- Keeps the existing World Cup link as navigation only; World Cup is a separate application

## GitHub Pages
Upload `index.html`, `css/`, and `js/` to the repository root. Deploy `main` / `(root)` in Settings → Pages.

**Note:** Exporting up to 100 images as one JPG may exceed mobile browser canvas/memory limits. Browser storage space can also be exhausted by large uploaded images.

### Anime search

Choose **Anime** to search AniList using its public GraphQL API. The **All** tab preserves Wikipedia search and TVmaze TV-image fallback. Both modes produce the same saved item data structure. No API key required.

## Supported by AI

Used Chatgpt to make it smooth


---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


# TOP RANKING – Jikan replacement patch

Anime search uses the Jikan API (MyAnimeList data), replacing AniList. All-mode Wikipedia/TVmaze search is unchanged.

**GitHub replacement files:** `js/api.js`, `js/app.js`. Other website files can stay as-is.

**Cloudflare:** paste `cloudflare-worker.js` into your existing Worker and deploy; the Worker now allows `images.myanimelist.net` and sends CORS headers on errors. Only Jikan/MyAnimeList poster URLs use the Worker for JPG export.

**Existing lists:** Previously saved `anilist-*` items keep their old image URLs, so for those posters you will need to remove and re-add the entries from the new Anime search (or back up the list with Export JSON first). Existing items and localStorage are not erased by the update.

**Verification:** Jikan API connectivity is independently documented; the image CDN allowing Worker downloads is **not** verified here. If you receive 502, check the Worker URL with a `?url=` parameter. Do not treat this patch as proven to fix JPG downloads on all devices until tested.
