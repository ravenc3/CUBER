# CUBER

CUBER is a React and Vite portfolio website for a custom PC workshop. The public Selected Builds section reads its content from Supabase, and `/admin` is an unlisted build-management dashboard.

## Supabase setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env` and set:
   - `VITE_SUPABASE_URL` to the project URL.
   - `VITE_SUPABASE_ANON_KEY` to the project publishable/anon key.
3. In Supabase Authentication settings, disable **Allow new users to sign up**. Create or retain only your own Auth account using the Supabase dashboard; this website has no public registration flow.
4. In the Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql). For an existing project, apply [`supabase/migrations/20260929_lock_admin_to_owner_email.sql`](./supabase/migrations/20260929_lock_admin_to_owner_email.sql) to replace the generic allowlist with the owner-only authorization check. The schema creates the bilingual `builds` table, row-level security policies, and the public-read/private-write `build-images` Storage bucket. It also adds `builds` to the Supabase Realtime publication so an already-open public page refreshes when builds are added, edited, or deleted.
   To enable optional Arabic build names and descriptions on an existing project, apply [`supabase/migrations/20261015_add_arabic_build_fields.sql`](./supabase/migrations/20261015_add_arabic_build_fields.sql). Existing build content is not translated or changed; until Arabic text is entered, Arabic pages show the existing English names and descriptions. Component names and technical values remain unchanged.
5. Restart Vite after changing `.env`, then open the unlinked `/admin` route and sign in with the authorized Auth account.

The browser uses only the project URL and browser-safe anon/publishable key. It never needs the Supabase service-role key. Authentication is handled by Supabase Auth; a database-side function authorizes only the configured account, and the database and Storage row-level security policies enforce that check on every protected write.

Build names, descriptions, categories, and additional specifications have Turkish and English fields. Hardware fields (CPU, GPU, RAM, and storage) are shared between languages. Uploaded image paths are stored in the build row; image files live in the `build-images` bucket.

No sample builds are inserted automatically. Add real portfolio builds from `/admin`; the public page will display database records in the selected language. The previous static build data file has been removed.

## Development

```sh
npm.cmd run dev
npm.cmd run lint
npm.cmd run build
```

For production hosting, configure the host to serve the SPA entry point for `/admin` as well as `/`.
