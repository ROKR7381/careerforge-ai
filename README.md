This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Setting up Smart Job Discovery

The `/jobs` page surfaces real jobs (Naukri, LinkedIn, Indeed, etc.) sourced via the [Adzuna Jobs API](https://developer.adzuna.com/) and match-scored against the user's latest saved resume.

### 1. Sign up for Adzuna (free tier)

1. Go to https://developer.adzuna.com/ and create an account.
2. Create a new application in the dashboard.
3. Copy your **App ID** and **App Key**.

### 2. Configure environment

Add these to your `.env`:

```
ADZUNA_APP_ID="your_app_id"
ADZUNA_APP_KEY="your_app_key"
ADZUNA_BASE_URL="https://api.adzuna.com/v1/api"
```

The free tier covers 250 API calls per month, which is enough for the first ~250 active users per month given the 24-hour per-user cache.

### 3. Run the database migration

```bash
npx prisma migrate dev
```

This adds the `externalId` and `source` fields to the `SavedJob` model (which is used to bookmark jobs from the recommendations feed).

### 4. Restart the dev server

```bash
npm run dev
```

Visit `/jobs` while signed in with a saved resume and you'll see your personalised ranked feed.

### How source attribution works

We do **not** scrape Naukri.com or LinkedIn.com directly — both prohibit scraping in their Terms of Service. Instead, Adzuna aggregates listings from those boards and many others, and we tag each job with whatever source Adzuna reports. To preserve brand recognition, each job card also surfaces one-click deep links to Naukri and LinkedIn pre-filled with the user's search query.
