# StudioSpace

The name of the project is StudioSpace - A peer-to-peer marketplace where creators book creative production spaces by the hour — photo studios, film stages, sound stages, podcast lounges, music suites and workshops — and where hosts list their own space, manage availability and approve bookings.

**Live site:** client at `https://studio-space-client-lilac.vercel.app`, API at `https://studio-space-server-sepia.vercel.app` · locally the client runs at `https://studio-space-client-lilac.vercel.app` and the API at `https://studio-space-server-sepia.vercel.app`

---

## Features

- **Editorial explore page with URL-driven filters** — search across title, tagline, city and amenities, filter by category (including **Sound Stage**), price range and minimum capacity, and sort by newest, price or rating. Every filter lives in the query string, so any result view is shareable and survives a reload.
- **Swiper hero and react-slick photo gallery** — the home page opens with a Swiper fade slider over high-res visuals with the dual CTAs "Explore Studios" and "Host Your Space", and every studio page carries a react-slick gallery with fade transitions, dot navigation, a slide counter and clickable thumbnails.
- **Rating badges on every card** — each featured and catalogue card shows a star rating badge with its review count, and the studio page lists real creator reviews with an average score, avatar, date and star row.
- **Studio detail page with a full booking flow** — image gallery, specifications, amenities, included gear and house rules, plus a sticky booking panel that computes the live price breakdown (subtotal + security deposit + cleaning fee + 5% platform fee) before the request is sent.
- **Double-booking prevention** — the client checks requested times against the studio's confirmed slots, and the API rejects any overlapping reservation with a `409 DOUBLE_BOOKING` response; the UI surfaces it as a toast plus an inline field error instead of a browser `alert()`.
- **Full CRUD for hosts** — publish a new studio from a validated multi-section form (basics, location, pricing, specs, images, amenities/gear/rules), edit any listing you own in a pre-filled form, and delete it through a confirmation dialog. `/my-listings` only ever returns the signed-in host's own spaces.
- **Booking management with status badges** — `/my-bookings` lists the signed-in creator's reservations with `Pending / Confirmed / Completed / Cancelled` badges and lets them cancel a booking while it is still `Pending`.
- **Better Auth + JWT security on both sides** — email/password plus Google and GitHub sign-in, with the `jwt()` plugin publishing a JWKS that the Express API fetches to verify every protected request; private routes (`/add-studio`, `/my-listings`, `/my-bookings`, `/studios/edit/[id]`) are guarded by `proxy.ts`, which remembers the exact route (query string included) and returns the user there after signing in.
- **Polished auth flow** — registration collects name, email, an optional photo URL and a validated password, then signs the user out and sends them to the login page; a "Forgot password?" affordance on the login form explains that password reset is intentionally disabled, and both auth views cross-link to each other.
- **Light/dark theme, toasts, skeletons and empty states** — a `next-themes` toggle, Sonner toasts for every mutation, Suspense loading skeletons, a custom 404 with a route back home, and empty states with CTAs — all responsive from mobile to desktop.

## Tech stack

**Client** — Next.js 16 (App Router, Turbopack, React Compiler) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui on Base UI · Better Auth (`jwtClient`) · Swiper.js · react-slick · Sonner · next-themes · lucide-react

**Server** — Node.js (ESM) · Express · MongoDB Node driver · `jose` (JWT verification via remote JWKS) · cors · dotenv

**Database** — MongoDB Atlas (`studiospace` database, collections `studios`, `bookings`, `reviews`, plus the Better Auth collections)

## Local setup

You need Node.js 20+ and a MongoDB connection string. Run the server and the client in two terminals.

### 1. Server — `StudioSpace-Server`

```bash
cd StudioSpace-Server
npm install
```

Create `.env`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mr9tml6.mongodb.net/
BETTER_AUTH_DB_URL=mongodb+srv://<user>:<password>@cluster0.mr9tml6.mongodb.net/
PORT=8000
CLIENT_URL=https://studio-space-client-lilac.vercel.app
```

Load the catalogue, then start the API:

```bash
npm run seed   # imports the official studios.json / bookings.json plus the extra showcase data (studios, bookings, reviews)
npm start      # or: npm run dev  (nodemon)
```

The API listens on `https://studio-space-server-sepia.vercel.app`.

### 2. Client — `StudioSpace-Client`

```bash
cd StudioSpace-Client
npm install
```

Create `.env`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mr9tml6.mongodb.net/
BETTER_AUTH_DB_URL=mongodb+srv://<user>:<password>@cluster0.mr9tml6.mongodb.net/

BETTER_AUTH_SECRET=replace-with-a-long-random-string
BETTER_AUTH_URL=https://studio-space-client-lilac.vercel.app
NEXT_PUBLIC_APP_URL=https://studio-space-client-lilac.vercel.app
BETTER_AUTH_TRUSTED_ORIGINS=https://studio-space-client-lilac.vercel.app

# optional — each button only appears when both of its values are set
BETTER_AUTH_GOOGLE_CLIENT_ID=
BETTER_AUTH_GOOGLE_SECRET=
NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=false
BETTER_AUTH_GITHUB_CLIENT_ID=
BETTER_AUTH_GITHUB_SECRET=
NEXT_PUBLIC_AUTH_GITHUB_ENABLED=false

NEXT_PUBLIC_API_URL=https://studio-space-server-sepia.vercel.app
```

Then:

```bash
npm run dev     # https://studio-space-client-lilac.vercel.app
```

Both processes must be running together: the API verifies tokens by fetching the JWKS from the client at `${CLIENT_URL}/api/auth/jwks`.

## Examiner test credentials

Register (or sign in) with the seeded host account to land on a populated dashboard:

- **Email:** `examiner@studiospace.io`
- **Password:** `Examiner1`

This account already owns **Lumen Cyc Studio & Natural Light Room** (visible on `/my-listings`) and has bookings with a `Confirmed` and a `Completed` status on `/my-bookings`.

To exercise the double-booking guard, open **Aetheria Apex Cinema Stage & Cyclorama** and request any time on **2026-11-15** that overlaps its confirmed `09:00 – 17:00` block — the API responds `409` and the form shows an inline error.

No email verification is enabled and password reset is intentionally disabled, so sign-up works immediately; the login form still shows a "Forgot password?" link that explains this. Every seeded studio also comes with creator reviews, visible in the **Reviews** section of its detail page.
