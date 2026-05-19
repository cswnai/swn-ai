# SWN AI — Lead Scoring System Setup Guide

This guide takes you from a fresh clone to a fully running AI lead scoring and automation system, both locally and on Vercel.

---

## Prerequisites

Before you start, make sure you have the following installed and ready:

- **Node.js 18+** — check with `node -v`
- **npm 9+** — check with `npm -v`
- **Git**

You'll also need accounts at the following services (all have free tiers):

| Service | Purpose | Sign up |
|---|---|---|
| **Neon** | Serverless PostgreSQL database | console.neon.tech |
| **Anthropic** | Claude AI (scoring + email drafting) | console.anthropic.com |
| **Resend** | Sending outbound emails | resend.com |
| **Vercel** | Hosting + cron jobs | vercel.com |
| **Slack** *(optional)* | High-lead alerts | slack.com |

---

## Step 1 — Clone the repository and install dependencies

```bash
git clone https://github.com/cswnai/swn-ai.git
cd swn-ai
npm install
```

---

## Step 2 — Create a Neon database

1. Go to **[console.neon.tech](https://console.neon.tech)** and sign in
2. Click **New Project**
3. Give it a name (e.g. `swn-ai`) and choose a region closest to you
4. Once created, go to the **Dashboard** tab of your project
5. Under **Connection string**, click **Copy** — it looks like:
   ```
   postgresql://user:password@ep-quiet-lake-12345.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
6. Keep this handy — you'll need it in Step 4

---

## Step 3 — Get your API keys

### Anthropic (Claude AI)

1. Go to **[console.anthropic.com](https://console.anthropic.com)**
2. Navigate to **API Keys** in the left sidebar
3. Click **Create Key**, give it a name (e.g. `swn-ai`)
4. Copy the key — it starts with `sk-ant-`

> The system uses `claude-haiku-4-5-20251001` for fast lead scoring and `claude-sonnet-4-6` for writing emails. Make sure your account has access to both models.

### Resend (Email sending)

1. Go to **[resend.com](https://resend.com)** and sign in
2. Navigate to **API Keys**
3. Click **Create API Key**, give it a name
4. Copy the key — it starts with `re_`
5. While you're here, go to **Domains** and add + verify your sending domain (e.g. `swn-ai.com`). Without a verified domain, you can only send to your own email address on the free plan.

### Generate secrets

Run these two commands in your terminal to generate secure random strings:

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32

# CRON_SECRET (can be any random string, but make it strong)
openssl rand -base64 24
```

Copy the outputs — you'll use them in the next step.

---

## Step 4 — Create your .env.local file

In the project root, create a file called `.env.local`:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in all six values:

```env
# From Neon dashboard (Step 2)
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Generated with openssl rand -base64 32 (Step 3)
NEXTAUTH_SECRET="your-generated-secret-here"

# For local development
NEXTAUTH_URL="http://localhost:3000"

# From Anthropic console (Step 3)
ANTHROPIC_API_KEY="sk-ant-..."

# From Resend dashboard (Step 3)
RESEND_API_KEY="re_..."

# Generated with openssl rand -base64 24 (Step 3)
CRON_SECRET="your-cron-secret-here"
```

> `.env.local` is already in `.gitignore` — it will never be committed.

---

## Step 5 — Generate the Prisma client

```bash
npm run db:generate
```

This reads your `prisma/schema.prisma` and generates the type-safe database client into `node_modules/@prisma/client`.

---

## Step 6 — Run the database migration

This creates all the tables in your Neon database:

```bash
npm run db:migrate
```

When prompted for a migration name, type something like `init` and press Enter.

You should see output like:
```
✓ Generated Prisma Client
✓ Applied migration `init`
```

> If you ever update the schema in the future, run this command again to apply new migrations.

---

## Step 7 — Seed the database

This creates a demo tenant, a 9-field lead form, a default admin user, and a 3-step nurture email sequence:

```bash
npm run db:seed
```

You should see:
```
Seed complete. Demo credentials: admin@swn-ai.com / admin123
Demo form URL: /form/swn-demo
```

What was created:
- **Tenant:** `SWN AI Demo` (slug: `swn-demo`)
- **Form:** "Get Your Free AI Audit" with 9 fields (name, business, email, phone, industry, team size, challenge, revenue, timeline)
- **Admin user:** `admin@swn-ai.com` / `admin123`
- **Nurture sequence:** 3 emails at days 3, 10, and 21

---

## Step 8 — Run locally

```bash
npm run dev
```

Once running, open these URLs:

| URL | What it is |
|---|---|
| `http://localhost:3000` | Marketing homepage |
| `http://localhost:3000/form/swn-demo` | Demo lead intake form |
| `http://localhost:3000/admin` | Admin dashboard (redirects to login) |
| `http://localhost:3000/admin/login` | Admin login page |

Log in with `admin@swn-ai.com` / `admin123`.

### Test the full pipeline

1. Go to `http://localhost:3000/form/swn-demo`
2. Fill in the form — use a real email you can check, describe a specific business problem in the "challenge" field
3. Click **Get My Free AI Audit** — you'll see the thank-you message instantly
4. Wait ~5–10 seconds (the AI pipeline runs in the background)
5. Go to `http://localhost:3000/admin/leads` — you should see your lead with a score and tier
6. Go to `http://localhost:3000/admin/queue` — if the tier was HIGH or MEDIUM (and auto-send is set to "Require approval"), you'll see the AI-drafted email waiting for review

---

## Step 9 — Deploy to Vercel

### Option A: GitHub integration (recommended)

1. Push the repo to GitHub (if it isn't already)
2. Go to **[vercel.com](https://vercel.com)** → **Add New Project**
3. Import your GitHub repository
4. Vercel will detect it as a Next.js app automatically
5. Before clicking Deploy, click **Environment Variables** and add all six variables from your `.env.local`:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` ← set this to your Vercel deployment URL (e.g. `https://swn-ai.vercel.app`)
   - `ANTHROPIC_API_KEY`
   - `RESEND_API_KEY`
   - `CRON_SECRET`
6. Click **Deploy**

### Option B: Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts, then add your environment variables in the Vercel dashboard under **Settings → Environment Variables**.

> After deploying, update `NEXTAUTH_URL` in Vercel's environment variables to match your actual deployment URL, then redeploy for it to take effect.

---

## Step 10 — Verify the cron job

The nurture email cron is defined in `vercel.json` and runs automatically every hour on Vercel. You don't need to configure anything — Vercel picks it up from the file.

To test it manually (replace the URL and secret with your own):

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/nurture
```

Expected response:
```json
{ "processed": 0, "sent": 0, "failed": 0 }
```

Once low-tier leads have been in the system for 3+ days, `processed` will be greater than 0.

---

## Step 11 — Change the default admin password

The seed script creates the admin user with password `admin123`. Change it before sharing access with anyone:

1. Log in to the admin panel
2. Or connect directly to your Neon database using the Neon SQL Editor (available in the Neon console)
3. Run this query (replace `NEW_HASHED_PASSWORD` with the bcrypt hash of your new password):

You can generate a bcrypt hash using Node:
```bash
node -e "const b = require('bcryptjs'); b.hash('your-new-password', 10).then(console.log)"
```

Then in the Neon SQL Editor:
```sql
UPDATE "User"
SET "hashedPassword" = 'PASTE_HASH_HERE'
WHERE email = 'admin@swn-ai.com';
```

---

## Step 12 — Add a new client tenant

For each new client you onboard, you need to add a Tenant record and User record to the database. Use the Neon SQL Editor or a script.

### Using the Neon SQL Editor

```sql
-- 1. Create the tenant
INSERT INTO "Tenant" (
  id, name, slug, "fromEmail", "highTierThreshold", "mediumTierThreshold",
  "highAutoSend", "mediumAutoSend", "lowAutoSend", "scoringCriteria",
  "createdAt", "updatedAt"
) VALUES (
  gen_random_uuid()::text,
  'Client Business Name',
  'client-slug',           -- used in /form/client-slug and /admin
  'leads@clientdomain.com',
  75,                      -- HIGH threshold
  40,                      -- MEDIUM threshold
  'APPROVAL_REQUIRED',
  'APPROVAL_REQUIRED',
  'NEVER',
  'Score higher for businesses with specific pain points and larger team sizes.',
  NOW(),
  NOW()
);

-- 2. Get the tenant ID you just created
SELECT id FROM "Tenant" WHERE slug = 'client-slug';

-- 3. Create the admin user (replace <tenant_id> and <bcrypt_hash>)
INSERT INTO "User" (id, "tenantId", email, name, "hashedPassword", role, "createdAt")
VALUES (
  gen_random_uuid()::text,
  '<tenant_id>',
  'admin@clientdomain.com',
  'Client Admin',
  '<bcrypt_hash>',         -- generate with the Node command above
  'admin',
  NOW()
);
```

The client can now:
- Submit leads at `/form/client-slug`
- Log in at `/admin` with their email/password
- Their leads are fully isolated from all other tenants

---

## Step 13 — Customise scoring criteria for a client

Each tenant has their own scoring criteria that tells Claude how to rank leads. To customise it:

1. Log in to `/admin` as that tenant's admin user
2. Go to `/admin/config`
3. Under **Scoring & Automation**, edit the **Scoring Criteria** textarea

Write it in plain English, for example:

> Prioritise B2B service businesses with 5 or more employees. Score higher for leads who mention specific revenue goals or pain points around time-wasting manual processes. Leads from the legal, finance, or healthcare industry should score slightly higher. Urgency signals (launching soon, losing clients, falling behind competitors) increase the score significantly. Vague enquiries with no specifics should score low.

You can also:
- Adjust the **HIGH** and **MEDIUM** tier score thresholds
- Set whether emails are **sent automatically**, **require approval**, or are **never sent** for each tier

Click **Save Config** when done.

---

## Step 14 — Set up Slack alerts for high-value leads

To receive an instant Slack notification whenever a HIGH-tier lead comes in:

### Create a Slack Incoming Webhook

1. Go to **[api.slack.com/apps](https://api.slack.com/apps)** → **Create New App** → **From scratch**
2. Give it a name (e.g. `SWN Lead Alerts`) and select your workspace
3. In the left sidebar, click **Incoming Webhooks**
4. Toggle **Activate Incoming Webhooks** to On
5. Click **Add New Webhook to Workspace**
6. Choose the channel where alerts should go (e.g. `#leads`) and click **Allow**
7. Copy the webhook URL — it starts with `https://hooks.slack.com/services/` followed by three path segments

### Add the webhook URL in the admin config

1. Log in to `/admin`
2. Go to `/admin/config`
3. Under **Scoring & Automation**, paste the webhook URL into the **Slack Webhook URL** field
4. Click **Save Config**

From now on, every HIGH-tier lead will trigger a Slack message with the lead's name, company, score, key answers, and a direct link to the admin panel.

---

## Reference — all URLs

| URL | Description |
|---|---|
| `/form/[slug]` | Public lead intake form for a given tenant |
| `/admin/login` | Admin login |
| `/admin/leads` | All leads, filterable by tier and status |
| `/admin/leads/[id]` | Individual lead detail with AI score and rationale |
| `/admin/queue` | Email drafts awaiting approval, sorted by score |
| `/admin/queue/[id]` | Edit and approve/reject a specific email draft |
| `/admin/config` | Form builder, scoring criteria, and automation settings |
| `/api/form/[slug]` | POST endpoint for form submissions |
| `/api/cron/nurture` | Cron endpoint for sending scheduled nurture emails |

## Reference — environment variables

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Neon dashboard → Connection string |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your deployment URL (e.g. `https://swn-ai.vercel.app`) |
| `ANTHROPIC_API_KEY` | console.anthropic.com → API Keys |
| `RESEND_API_KEY` | resend.com → API Keys |
| `CRON_SECRET` | `openssl rand -base64 24` (any random string) |

## Reference — npm scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start local development server |
| `npm run build` | Build production bundle |
| `npm run db:generate` | Regenerate Prisma client after schema changes |
| `npm run db:migrate` | Create and apply a new database migration |
| `npm run db:push` | Push schema to DB without a migration file (quick, for prototyping) |
| `npm run db:seed` | Seed the database with demo data |
