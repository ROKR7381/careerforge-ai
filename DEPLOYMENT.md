# CareerForge AI - Deployment Guide

## Quick Start: Vercel + Railway (Recommended - Free Tier)

### Prerequisites
- GitHub account
- Vercel account (free): https://vercel.com
- Railway account (free trial): https://railway.app
- Domain name (optional, ~$10-15/year)

---

## Step 1: Push to GitHub

```bash
cd C:\Roshan\websiteResumeAI
git init
git add .
git commit -m "Production-ready deployment"
git remote add origin https://github.com/YOUR_USERNAME/careerforge-ai.git
git push -u origin main
```

---

## Step 2: Deploy PostgreSQL Database (Railway)

1. Go to https://railway.app and sign up with GitHub
2. Click **"New Project"** → **"PostgreSQL"**
3. Wait for database to be provisioned
4. Go to **Variables** tab
5. Copy the `DATABASE_URL` value (looks like: `postgresql://user:pass@host:5432/dbname`)

---

## Step 3: Deploy Python Backend (Railway)

1. In the same Railway project, click **"New Service"** → **"GitHub Repo"**
2. Select your `careerforge-ai` repository
3. Configure settings:
   - **Root Directory:** `python-backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Go to **Variables** tab and add:
   ```
   DATABASE_URL = <paste from Step 2>
   OPENAI_API_KEY = your-key-here
   GROQ_API_KEY = your-key-here
   TAVILY_API_KEY = your-key-here (optional)
   ENV = production
   ```
5. Click **Deploy**
6. Note the Railway URL (e.g., `https://careerforge-backend.up.railway.app`)

---

## Step 4: Deploy Next.js Frontend (Vercel)

1. Go to https://vercel.com and sign up with GitHub
2. Click **"Import Project"** → Select your repository
3. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (leave empty)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
4. Click **"Environment Variables"** and add:
   ```
   DATABASE_URL = <paste from Railway Step 2>
   NEXT_PUBLIC_PYTHON_API_URL = <Railway backend URL from Step 3>
   JWT_SECRET = <generate: openssl rand -base64 32>
   ENCRYPTION_KEY = <generate: openssl rand -base64 24>
   NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
   NEXTAUTH_URL = https://your-app.vercel.app
   OPENAI_API_KEY = your-key-here
   GROQ_API_KEY = your-key-here
   ```
5. Click **Deploy**

---

## Step 5: Run Database Migration

After Vercel deployment, the database schema needs to be pushed:

### Option A: Via Vercel Terminal (Recommended)
1. In Vercel dashboard, go to your project
2. Click **"Terminal"** tab
3. Run:
   ```bash
   npx prisma db push
   ```

### Option B: Locally with production DB
```bash
set DATABASE_URL=<your-railway-postgresql-url>
npx prisma db push
```

---

## Step 6: Configure Custom Domain (Optional)

1. Buy domain from Namecheap or Cloudflare (~$10-15/year)
2. In Vercel dashboard → **Settings** → **Domains**
3. Enter your domain name
4. Update DNS at your registrar:
   - **CNAME record:** `www` → `cname.vercel-dns.com`
   - **A record:** `@` → `76.76.21.21`
5. Wait for SSL certificate (automatic, ~5 minutes)
6. Update environment variables:
   ```
   NEXT_PUBLIC_APP_URL = https://your-domain.com
   NEXTAUTH_URL = https://your-domain.com
   ```

---

## Step 7: Update CORS for Production

Update `python-backend/main.py` with your actual Vercel URL:

```python
allow_origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://your-app.vercel.app",
    "https://your-domain.com",
],
```

Then push changes to GitHub (auto-deploys).

---

## Troubleshooting

### Database Connection Issues
- Ensure `DATABASE_URL` includes `?pgbouncer=true` for Railway
- Check Railway logs for connection errors

### CORS Errors
- Verify your Vercel URL is in the CORS `allow_origins` list
- Check that `NEXT_PUBLIC_PYTHON_API_URL` is correct

### Build Failures
- Check Vercel build logs
- Ensure all environment variables are set
- Run `npx prisma generate` locally to verify schema

### AI Features Not Working
- Verify at least one AI API key is set (OPENAI_API_KEY or GROQ_API_KEY)
- Check Railway backend logs for errors

---

## Cost Summary

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Free tier | $0/mo |
| Railway | Free trial ($5 credit) | ~$0-5/mo |
| Domain | Annual | ~$1/mo |
| **Total** | | **~$1-6/mo** |

---

## Alternative: Hostinger VPS

If you prefer full control:

1. Get Hostinger VPS KVM 2 (~$6/mo)
2. Install Node.js, Python, PostgreSQL
3. Clone repository
4. Use PM2 for Node.js, systemd for Python
5. Configure Nginx as reverse proxy
6. Set up SSL with Certbot

See `setup-hostinger.sh` for VPS setup commands.
