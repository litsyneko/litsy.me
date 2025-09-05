This folder contains SQL migrations used by the project.

- `001_init.sql`: creates `posts` and `projects` tables.
- `002_add_comments_and_author.sql`: adds author fields and creates `comments` table.
- `003_create_users_table.sql`: creates `users` table to cache auth users.
- `004_enhance_auth_system.sql`: enhances tables for authentication system, adds RLS policies, and creates triggers.

If you use Supabase, run these migrations (in order) to ensure the authentication and comments features work.

## Migration Order

1. Run migrations in numerical order (001, 002, 003, 004)
2. The authentication system requires migration 004 to be applied
3. RLS policies will be automatically enabled after migration 004
