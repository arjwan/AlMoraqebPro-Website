# AlMoraqebPro-Website
الموقع الرسمي لشركة الأرجوان للبرمجيات وتطبيق المراقب برو

## Cloudflare Pages + D1

The Pages Function at `functions/api/visitors.js` uses the `DB` D1 binding and increments the shared visitor count atomically. Before deploying, create a D1 database, replace `database_id` in `wrangler.toml`, apply `schema.sql` with `wrangler d1 execute almoraqebpro-visitors --remote --file=schema.sql`, and add the same `DB` binding to the Cloudflare Pages project. Without that binding, the browser uses a local-only fallback counter.

## AI presenter assets

No local voice recording or animation-generation tool was available, and no synthetic presenter result was created. Add the final generated videos, containing their own H.264 video and AAC audio for real lip-sync, at `media/presenter/mobile-explanation.mp4` and `media/presenter/admin-explanation.mp4`. The existing responsive presenter slot, source switching, and play/stop control will then use them without changing the demo video links. Generate the new female voice and performance from the two explanation recordings through an external AI service, without imitating any identifiable person.
