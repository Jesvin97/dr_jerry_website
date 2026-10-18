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

## Booking requests (Supabase)

The "Book appointment" popup posts to `api/book.js` (a Vercel serverless function), which saves the request to Supabase. Set up once:

1. Create a Supabase project and run this in its SQL editor:

   ```sql
   create table bookings (
     id uuid primary key default gen_random_uuid(),
     created_at timestamptz not null default now(),
     name text not null,
     phone text not null,
     clinic text,
     note text,
     status text not null default 'new'
   );
   alter table bookings enable row level security; -- no policies: only the server key can read or write
   ```

2. In the Vercel project settings add environment variables `SUPABASE_URL` (the project URL) and `SUPABASE_SERVICE_KEY` (the service_role key; keep it server-side only), then redeploy.
3. View requests in the Supabase Table Editor (`bookings`). Without these variables the popup shows an error asking visitors to call instead.

`python serve.py` does not run `/api/book`; test it with `vercel dev` or on a Vercel preview deployment.
