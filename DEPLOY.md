# Vercel Deployment Guide for TypeSprint

## Quick Deploy (Recommended)

### Option 1: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "Add New Project"
3. Import your `SKSHAMKAUSHAL/TypeSprint` repository
4. Vercel will auto-detect Next.js settings
5. Add environment variables (if using database):
   - `DATABASE_URL` - Your PostgreSQL connection string
6. Click "Deploy"

Your app will be live at: `https://your-project-name.vercel.app`

### Option 2: Deploy via Vercel CLI

```powershell
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd D:\TYPING
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: TypeSprint
# - Directory: ./
# - Override settings? No

# Deploy to production
vercel --prod
```

## Environment Variables

If you're using the database features, add these in Vercel Dashboard:

1. Go to Project Settings → Environment Variables
2. Add:
   - `DATABASE_URL` = `postgresql://user:pass@host:5432/dbname`
   - (Add any other secrets from your `.env.local`)

## Build Configuration

Vercel auto-detects Next.js but here's what it uses:

- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 20.x (recommended)

## Post-Deployment

After successful deployment:

1. Visit your deployment URL
2. Test the typing functionality
3. Check browser console for any errors
4. If using Prisma, run migrations:
   ```bash
   # In Vercel Dashboard → Settings → General → Build & Development Settings
   # Add to Build Command:
   npm run build && npx prisma migrate deploy
   ```

## Troubleshooting

### Build Fails

- Check that all dependencies are in `package.json`
- Ensure `next.config.js` is valid
- Review build logs in Vercel dashboard

### Hydration Errors

- Already handled in code (targetText generated client-side)
- If you see warnings, check that no server-side randomness exists

### Caret Not Showing

- Ensure custom CSS in `globals.css` is loaded
- Check that `.caret-base` and `.caret-blinking` classes exist

### Database Connection

- Verify `DATABASE_URL` is set in Vercel environment variables
- Use connection pooling (e.g., Supabase, Neon, PlanetScale)
- Add `?pgbouncer=true` to connection string if needed

## Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

## Continuous Deployment

Every push to `main` branch will auto-deploy to production.

For preview deployments:
- Push to any other branch
- Vercel creates a preview URL automatically

---

**Your repo is ready! Just connect it to Vercel and deploy.**
