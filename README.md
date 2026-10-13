# Supplier Management System

A responsive supplier directory and purchasing workspace built with Next.js and SQLite. Supplier, product, user, category and Wilaya data persist in `data/suppliers.sqlite`. Algeria's 58 Wilayas and starter supplier categories are seeded automatically.

## Run locally

Use Node.js 22, install dependencies with `pnpm install`, then start the app with `pnpm dev`. Open `http://localhost:3000`.

On the first startup, an Admin account is created with email `admin@supplier.local`. If `INITIAL_ADMIN_PASSWORD` is not set, a random password is saved to `data/initial-admin-password.txt`. The `data/` folder is ignored by Git. To set a password yourself, set `INITIAL_ADMIN_PASSWORD` before the first startup.

## Build

Run `pnpm build` to create the production build, then `pnpm start` to serve it. Keep the SQLite data directory on persistent storage.
