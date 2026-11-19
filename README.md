# Neon Sunset Cover Studio

[![gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/kainze29/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/kainze29/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

An offline web app that turns a person's photo and caption into GTA-style
multi-panel cover art and exports it as a PNG. Built for the
[gta6-cover-art-01](https://make.fun/bounty/gta6-cover-art-01) competition on
[make.fun](https://make.fun).

## What it does

- Upload one or several photos from your machine (they never leave it), or
  load a built-in sample with one click.
- Pick from 6 panel layouts: Hero + 3, 4-Panel Grid, 9-Panel Mosaic,
  Full Bleed + Strip, Tilted Collage, Portrait Story.
- Pick from 4 colour grades: Vice Sunset, Neon Night, Palm Gold, Teal Dusk,
  with film grain and vignette toggles.
- Edit the caption (bold condensed Anton capitals, with a sunset gradient
  option) and the subtitle (Pacifico neon script).
- Drag any panel on the live preview to reposition its photo, zoom it with
  the slider, or fill every panel with one photo.
- Export a real PNG at 1080 x 1080, 1080 x 1350 or 1920 x 1080, rendered at
  full export size on an offscreen canvas.

Everything is original work: no Rockstar Games logo, wordmark, artwork,
character or font. The fonts are Anton and Pacifico, both under the SIL Open
Font License, shipped as local files under `app/fonts/`. The sample photos
were made for make.fun and are free to use.

## How to run

```sh
node serve.ts
```

Then open http://localhost:8080 in desktop Chrome. No build step, no network
requests: every script, font and image loads from under `app/`.

## Shots

`?shot=cover` draws a full cover at export size, `?shot=editor` shows the
editor with a sample photo loaded, and `?shot=selftest` runs the export path
headlessly and writes PASS/FAIL into the page. See `shots.json`.
