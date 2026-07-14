# Railway Deployment Guide

## Quick Setup

### 1. Create Railway Account
- Visit https://railway.app
- Sign up with GitHub
- Connect your GitHub repository

### 2. Deploy Backend Service

```bash
# 1. Push to GitHub
git push origin main

# 2. Create new Project in Railway
# - Go to https://railway.app/dashboard
# - Click "New Project"
# - Select "Deploy from GitHub repo"
# - Choose tienda-puntos repository

# 3. Configure Backend Service
# - Select backend directory
# - Railway auto-detects Node.js environment
# - Add environment variables
```

### 3. Deploy Database

Railway integrates with PostgreSQL plugin:

```bash
# In Railway Dashboard:
# 1. Click "Add Service"
# 2. Select "PostgreSQL"
# 3. Connect to backend via DATABASE_URL
```

### 4. Environment Variables

Set in Railway Dashboard (Project Settings → Environment):

**Backend:**
```
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=your-secure-jwt-secret
JWT_EXPIRE=24h
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
LOG_LEVEL=info
```

**Web Admin:**
```
VITE_API_URL=https://tienda-puntos-backend.railway.app
```

### 5. Deploy Web Admin Frontend

```bash
# 1. Add new Service in Railway
# 2. Select web-admin directory
# 3. Configure build:
#    - Build command: npm run build
#    - Start command: npm run preview
# 4. Set VITE_API_URL to backend service URL
```

### 6. Custom Domain

```bash
# Railway → Project Settings → Domains
# Add your custom domain and configure DNS
```

### 7. View Logs

```bash
# Railway Dashboard → Service → Logs
# Real-time streaming of application logs
```

### 8. Testing

```bash
# Get service URLs from Railway Dashboard
curl https://tienda-puntos-backend.railway.app/health
curl https://tienda-puntos-web-admin.railway.app
```

## CLI Deployment

### Install Railway CLI

```bash
npm install -g @railway/cli
```

### Login and Deploy

```bash
# 1. Login
railway login

# 2. Create new project
railway init

# 3. Link to repository
railway link

# 4. Deploy
railway up

# 5. Add environment variables
railway variables set JWT_SECRET=your-secret
railway variables set TWILIO_ACCOUNT_SID=your-sid
```

### View Status

```bash
# Check deployment status
railway status

# View logs
railway logs

# View environment variables
railway variables
```

## Docker Deployment with Railway

Railway automatically uses Dockerfile if present:

```bash
# Ensure these files exist:
# - backend/Dockerfile (production multi-stage)
# - .dockerignore

# Railway will:
# 1. Build Docker image
# 2. Push to Railway registry
# 3. Deploy container
# 4. Set up automatic restarts
```

## Troubleshooting

### Service won't start
```bash
# Check logs in Railway Dashboard
railway logs --follow

# Verify environment variables are set correctly
railway variables
```

### Database connection fails
```bash
# Get database URL
railway variables | grep DATABASE_URL

# Test connection
psql $DATABASE_URL
```

### Frontend can't reach backend
- Verify VITE_API_URL in web-admin env vars
- Check CORS in backend (app.use(cors()))
- Ensure backend service is running

## CI/CD Integration

Railway automatically deploys on push to main:

```yaml
# .github/workflows/deploy.yml (optional)
name: Deploy to Railway
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: railwayapp/deploy-action@v1
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}
```

## Related Documentation
- https://docs.railway.app
- https://docs.railway.app/guides/dockerfiles
- https://docs.railway.app/reference/cli
