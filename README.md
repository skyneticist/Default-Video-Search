# YouTube Necromancer

A small single-page web app for generating YouTube lead search terms from real camera, phone, recorder, and app-default filename patterns.

## Run

Open `index.html` in a browser, or serve the folder locally:

```sh
python3 -m http.server 5173
```

Then visit `http://localhost:5173`.

## Notes

- `filename-patterns.js` is generated from the filename catalog in `yt_search_leads.ts`.
- Spin chooses a filename family, then picks a weighted pattern from that family.
- New roll keeps the selected family and regenerates the filename, extension, and query template.
- Copy copies the generated search term.
- Randomness tries the public drand randomness beacon first and falls back to browser crypto.
