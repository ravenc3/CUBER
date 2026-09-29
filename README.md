# CUBER

CUBER is a React and Vite portfolio website for a custom PC workshop. The public Selected Builds section reads its content from Supabase, and `/admin` is a private build-management dashboard.

## Supabase setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env` and set:
   - `VITE_SUPABASE_URL` to the project URL.
   - `VITE_SUPABASE_ANON_KEY` to the project publishable/anon key.
3. In the Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql). This creates the bilingual `builds` table, an admin-user allowlist, row-level security policies, and the public-read/private-write `build-images` Storage bucket. It also adds `builds` to the Supabase Realtime publication so an already-open public page refreshes when builds are added, edited, or deleted.
4. In Supabase Authentication, create an admin user with email and password. Public sign-up is not provided by this website.
5. In the SQL Editor, allowlist the administrator using their Auth user UUID:

   ```sql
   insert into public.admin_users (user_id)
   select id from auth.users where email = 'admin@example.com';
   ```

   Only trusted project administrators should run this SQL. To remove dashboard access, delete the user's row from `public.admin_users`.

6. Restart Vite after changing `.env`, then open `/admin` and sign in with that account.

The browser uses only the project URL and browser-safe anon/publishable key. It never needs the Supabase service-role key. Authentication is handled by Supabase Auth; the admin allowlist, database policies, and Storage policies enforce access on the Supabase side as well as in the interface.

Build names, descriptions, categories, and additional specifications have Turkish and English fields. Hardware fields (CPU, GPU, RAM, and storage) are shared between languages. Uploaded image paths are stored in the build row; image files live in the `build-images` bucket.

No sample builds are inserted automatically. Add real portfolio builds from `/admin`; the public page will display database records in the selected language. The previous static build data file has been removed.

## Development

```sh
npm.cmd run dev
npm.cmd run lint
npm.cmd run build
```

For production hosting, configure the host to serve the SPA entry point for `/admin` as well as `/`.
