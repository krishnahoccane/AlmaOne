# AlmaOne — Laravel 11 + Blade + Tailwind CSS Setup

AlmaOne is built with **Laravel 11, Blade templates, Tailwind CSS v4, and Alpine.js** (zero React).

## Architecture Overview
- **Routes:** `routes/web.php` defines the complete multi-tenant alumni portal (`feed`, `directory`, `groups`, `jobs`, `mentorship`, `events`, `businesses`, `giving`, `id-card`, and `admin.*`).
- **Controller:** `app/Http/Controllers/AlumniPortalController.php` handles session-scoped institutional switching (`All Alma Maters` vs. individual verified campuses), post/poll creation, referral submissions, QR pass generation, `.ics` calendar exports, fundraising updates, and B2B Admin verifications & broadcasts.
- **Database Schema:** `database/migrations/2026_01_01_000001_create_almaone_tables.php` models the **"1 App, 1 User"** many-to-many `institution_user` pivot table alongside campus feeds, jobs, events, campaigns, and verification queues.
- **Blade Layout & Views:** `resources/views/layouts/app.blade.php` and `resources/views/pages/*.blade.php` render the editorial Fraunces + Plus Jakarta Sans + IBM Plex Mono Tailwind CSS interface.

## Running Locally with PHP 8.2+ & Composer
```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm install && npm run build
php artisan serve
```

## Live Preview in AI Studio
Because the AI Studio preview sandbox provides a Node.js runtime without PHP/Composer installed, the live preview in `src/` renders the exact same Blade + Tailwind CSS UI and interactivity using pure Vanilla TypeScript + Tailwind CSS (zero React).
