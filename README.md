# Dr. Jerry Mathew: portfolio website

A scroll-driven portfolio. Desktop windows get a cinematic Three.js film (layered portrait cut-outs, wipes between shots, line-by-line text reveals). Phones and small windows get a simpler stacked layout. Two extra pages: `treatments.html` and `service.html`.

Built on [scroll-driven-camera-three.js](https://github.com/sebastianvasquezechavarria1234/scroll-driven-camera-three.js) (MIT, see LICENSE). Static site, no build step: Three.js 0.170 and Lenis load from a CDN through an import map.

## Run locally

`python serve.py` (no-cache dev server, port 8000) then open http://localhost:8000.

## Edit content

Everything editable is in `content.js`: profile text, experience, stats, treatments, public service, initiatives, contact links, scene timing. Portrait cut-outs live in `public/images/portrait/cutout/`; add real photos for initiatives under `public/images/projects/` and set `media.image` in `content.js`.

## Files

- `stage.js`: Three.js scene (portrait layers, wipes, light, particles)
- `timeline.js`: scroll progress to composition
- `ui.js`, `main.js`, `page.js`: DOM, scene control, secondary pages
- `main.css`, `page.css`: styles

## Deploy

Static hosting works as is. For Cloudflare Pages, set the build output directory to `/` (no build command).
