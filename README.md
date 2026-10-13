# Supplier Management System

A supplier directory and purchasing workspace built with Next.js. Local development uses SQLite; Netlify deployments use Netlify Database (Postgres) so data persists between serverless function invocations.

## Run locally

Use Node.js 22, install dependencies with `pnpm install`, then start the app with `pnpm dev`. Open `http://localhost:3000`.

On first startup, a local Admin account is created with email `admin@supplier.local`. A random password is saved in `data/initial-admin-password.txt` unless `INITIAL_ADMIN_PASSWORD` is set before startup. The `data/` directory is ignored by Git.

## Deploy to Netlify

Connect the GitHub repository to Netlify and deploy. Netlify Database uses the migration in `netlify/database/migrations/` to create the Postgres schema and seed categories and Wilayas. This requires a Netlify plan that supports Netlify Database.

Before deploying, set `INITIAL_ADMIN_PASSWORD` in the Netlify site's environment variables. The initial administrator email is `admin@supplier.local`; use the password you set in that environment variable. Keep the password secret and do not commit it to Git.

If the site has no database enabled, provision one under the Netlify site's **Data & Storage → Database** settings. Redeploy after configuring it.

## Build

Run `pnpm build` to create a production build, then `pnpm start` to serve it locally.
