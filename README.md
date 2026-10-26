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
