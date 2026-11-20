# Redesign mockups

Static HTML mockups for the pollito.dev redesign. They use the real posts, dates, and images from the site.

**Chosen direction:** Aviary. **Chosen share card:** C, branded.

Photo assignments in the Aviary mockup: bamboo portrait = hero; 25 April Bridge = Lisbon band; duck mask = off-clock About photo; Web Summit = article author avatar. The sunset portrait is reserved for the About page.

## View

From the repository root:

```bash
python3 -m http.server 8123
```

Then open:

- <http://localhost:8123/mockups/> — direction chooser
- <http://localhost:8123/mockups/share-preview.html> — share card comparison

The mockups also work when opened directly as files, because image paths are relative.

## Directions

- `field-notes/` — warm editorial: paper, cobalt, chicken yellow, serif reading, list archive.
- `compiler/` — technical journal: blue masthead, dense index, sans reading, sticky TOC.
- `aviary/` — bold and playful: yellow fields, cobalt blocks, thick frames, big display type.

Each direction has a homepage and an article page.

## Not production

These are visual references, not Hugo templates. Links point to mockup pages or `#`. The production redesign keeps the existing URLs, content files, favicon, and Netlify deploy.
