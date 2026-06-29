# 🚀 AI Headshot Generator — Professional Portrait Studio

> **A beautifully designed, fully-integrated AI headshot studio.** Built with Next.js + Supabase + muapi.ai, this open-source template is a complete, self-contained SaaS boilerplate for generating high-quality professional portraits and business headshots for LinkedIn, teams, and personal branding — **no login or authentication required**.

## ✨ Core Features

- **Kinetic Portrait Studio** — Generate stunning professional headshots with text prompts. Tiered resolutions (1K, 2K, 4K) and `Aspect Ratio` tuning tied directly to a flexible credit cost system.
- **Multi-Image Reference Mode** — Upload local images or add external URLs to use as visual nodes for complex portrait configurations.
- **Secure My Headshots Archive** — A dedicated history vault. Displays past portrait sessions fetched from Supabase, viewable in a detailed inspector modal with 1-click downloads and deletion.
- **Credit Tiers** — Three credit top-up tiers (Starter, Professional, Executive). All generations cost **60 credits** per pack.
- **Beautiful & Dynamic UI** — Tailwind CSS + Framer Motion glassmorphic interface with multi-theme support (Indigo, Emerald, Rose, Amber, Violet, Light, Dark).
- **No authentication** — Every user gets a free `60` credit starter balance identified by a random `anonymous_id` stored in `localStorage`.

## 🛠 Stack

- **Frontend** — Next.js 16 (App Router) + React 19 + Tailwind 4 + Framer Motion
- **Database** — Supabase Postgres (tables: `profiles`, `creations`, `uploads`)
- **AI Generation** — [muapi.ai](https://muapi.ai) `photo-pack` model (submit → poll → webhook)
- **Auth** — None. Anonymous, browser-side only.

## ⚡ Local Development

### Prerequisites

- Node.js v18+
- A Supabase project (free tier works)
- A muapi.ai API key

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# SUPABASE_SERVICE_ROLE_KEY, and HEADSHOT_API_KEY (muapi.ai)

# 3. Create database tables
#    Apply the schema in supabase/schema.sql to your Supabase project
#    (SQL editor in the Supabase dashboard)

# 4. Start the dev server
npm run dev
```

Open `http://localhost:3000`.

### Database Schema

The app uses three tables in the `public` schema. See [`supabase/schema.sql`](./supabase/schema.sql):

- **`profiles`** — anonymous user balances (`anonymous_id`, `credits`)
- **`creations`** — every headshot generation request (`request_id`, `status`, `image_url`, `category`, `aspect_ratio`, `is_pack`)
- **`uploads`** — log of uploaded reference images

All tables have RLS enabled with permissive public policies (the app uses the service role key on the server).

### Environment Variables

| Variable                       | Description                                       |
| :----------------------------- | :------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`     | Supabase project URL                              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Supabase anon key (client-side)                   |
| `SUPABASE_SERVICE_ROLE_KEY`    | Supabase service role key (server-side only)      |
| `HEADSHOT_API_KEY`             | muapi.ai API key                                  |
| `WEBHOOK_URL`                  | Public URL where muapi.ai will post webhooks      |
| `NEXT_PUBLIC_APP_URL`          | Public URL of the deployed app                    |
| `NEXT_PUBLIC_THEME`            | `indigo`, `emerald`, `rose`, `amber`, `violet`, `light`, or `dark` |

## 🧠 How It Works

1. The browser generates a random UUID and stores it in `localStorage` as the anonymous user id.
2. On the first request, a `profiles` row is created in Supabase with **60** free credits.
3. Selecting a reference image, category, and aspect ratio, the user clicks **Generate Headshots**.
4. The server deducts 60 credits, submits the job to muapi.ai `photo-pack` (with a webhook URL pointing at `/api/webhook/muapi`), and inserts a `processing` row into `creations`.
5. The browser polls `/api/headshot/status` every 3 seconds. When the job completes, muapi also calls our webhook which writes the final image URL(s) to the `creations` row. The browser picks this up on its next poll.
6. The result renders inline with a "Download Pack" button for batch downloads.
7. All creations are listed in **/creations** with thumbnails, status, and a detail modal for individual download or deletion.

## 🚀 Deploying to Vercel

1. Push the repo to GitHub.
2. Import into Vercel.
3. Add all environment variables from `.env.example` to your Vercel project.
4. Update `WEBHOOK_URL` to your production URL so muapi.ai can reach your webhook.
5. Deploy.

---

_AI Headshot Generator: A modular, mobile-ready, production-grade AI portrait workspace built for creators and builders._