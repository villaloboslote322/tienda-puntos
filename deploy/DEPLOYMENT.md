# Deployment Guide - Tienda Puntos

This guide covers deploying Tienda Puntos to production using Render, Railway, or local Docker.

## Quick Overview

**Three deployment options:**
1. **Render** - Easiest setup, free tier available
2. **Railway** - CLI-based, great for staging/prod
3. **Docker** - Local or self-hosted deployment

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Web Clients                          │
│         (Mobile App + Web Admin + API Consumers)        │
└────────────┬─────────────────────────────────┬──────────┘
             │                                 │
             ▼                                 ▼
      ┌──────────────┐            ┌───────────────────┐
      │  Web Admin   │            │  Mobile App       │
      │  (Nginx)     │            │  (Expo/iOS/APK)   │
      │  Port: 80    │            │                   │
      └──────┬───────┘            └─────────┬─────────┘
             │                              │
             └──────────────┬───────────────┘
                            │
                            ▼
                    ┌──────────────────┐
                    │  Backend API     │
                    │  (Express/Node)  │
                    │  Port: 3001      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  PostgreSQL DB   │
                    │  Port: 5432      │
                    └──────────────────┘
```

## Environment Variables Required

### Backend (.env or platform settings)
```
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host/dbname
PORT=3001
JWT_SECRET=your-secure-random-secret
JWT_EXPIRE=24h
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890
LOG_LEVEL=info
```

### Web Admin (.env or build-time)
```
VITE_API_URL=https://backend-service-url.com
```

## Deployment Methods

### Option 1: Render (Recommended for Quick Start)

**Pros:**
- No credit card for free tier
- Automatic GitHub integration
- Built-in PostgreSQL
- Blueprint support

**Steps:**
```bash
git push origin main
# Go to https://dashboard.render.com
# Click "New Blueprint"
# Select render.yaml from deploy/render/
# Set environment variables
# Deploy
```

**More info:** See `deploy/render/render.md`

### Option 2: Railway (Recommended for Production)

**Pros:**
- Pay-as-you-go pricing
- CLI tooling
- Great performance
- Easy environment management

**Steps:**
```bash
npm install -g @railway/cli
railway login
railway init
railway up
railway variables set JWT_SECRET=xxx
railway variables set TWILIO_ACCOUNT_SID=xxx
```

**More info:** See `deploy/railway/railway.md`

### Option 3: Local Docker (Self-Hosted)

**Pros:**
- Full control
- Deploy anywhere
- No platform vendor lock-in

**Steps:**
```bash
# Build and run production stack
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop
docker-compose -f docker-compose.prod.yml down
```

**More info:** See root docker-compose.prod.yml

## Production Checklist

- [ ] Environment variables set in deployment platform
- [ ] Database backups configured
- [ ] SSL/TLS certificates configured (auto with Render/Railway)
- [ ] API rate limiting enabled (already in backend)
- [ ] CORS properly configured for frontend domain
- [ ] Logging and monitoring set up
- [ ] Database migrations run successfully
- [ ] Health endpoints respond (GET /health)
- [ ] Frontend can reach backend API
- [ ] Admin login works
- [ ] Cliente registration works
- [ ] SMS notifications send correctly
- [ ] Custom domain configured (optional)

## Monitoring

### Health Checks

```bash
# Backend health
curl https://your-backend.com/health

# Frontend availability
curl https://your-frontend.com
```

### Logs

**Render:**
- Dashboard → Service → Logs

**Railway:**
```bash
railway logs --follow
```

**Docker:**
```bash
docker-compose -f docker-compose.prod.yml logs -f backend
```

## Scaling

### Horizontal Scaling (Multiple Instances)

**Render:**
- Service Settings → Scaling
- Adjust number of instances

**Railway:**
- Edit railway.json → replicas

**Docker:**
```bash
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

### Vertical Scaling (More Resources)

**Render:**
- Service Settings → Plan
- Choose larger tier

**Railway:**
- Dashboard → Service → Settings
- Adjust resources

**Docker:**
- Update resource limits in docker-compose.prod.yml

## Database Migrations

### Automatic (Recommended)

Migrations run automatically on first deploy. For subsequent deployments:

```bash
# Before deploying, in package.json scripts:
"postinstall": "prisma generate && prisma migrate deploy"
```

### Manual

```bash
# In deployment environment
npx prisma migrate deploy

# Create snapshot of current schema
npx prisma db push
```

## Rollback Strategy

### Render
- Dashboard → Deployments
- Click previous version
- Click "Redeploy"

### Railway
```bash
railway deployments
railway rollback <deployment-id>
```

### Docker
```bash
# Tag releases
docker tag tienda-puntos:latest tienda-puntos:v1.0.0

# Rollback to previous image
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d  # Uses previous image
```

## Security Best Practices

1. **Secrets Management:**
   - Never commit .env files
   - Use platform-provided secret management
   - Rotate secrets regularly

2. **Database:**
   - Enable automatic backups
   - Use strong passwords
   - Restrict database access

3. **API:**
   - Rate limiting enabled (Express middleware)
   - CORS configured correctly
   - Input validation on all endpoints

4. **Frontend:**
   - HTTPS only
   - Content Security Policy headers
   - Nginx security headers (included in nginx.conf)

5. **Monitoring:**
   - Enable error tracking (Sentry recommended)
   - Set up alerts for failures
   - Regular log review

## Troubleshooting

### Backend won't start
```bash
# Check logs
# Verify DATABASE_URL is correct
# Ensure migrations ran: npx prisma migrate deploy
# Check JWT_SECRET is set
```

### Frontend can't reach backend
```bash
# Verify VITE_API_URL points to correct backend URL
# Check CORS is enabled in backend
# Verify backend health: curl /health
```

### Database connection errors
```bash
# Check DATABASE_URL format
# Verify database is running
# Check network connectivity
# Verify database user/password
```

### SSL certificate issues
```bash
# Render: Auto-configured
# Railway: Auto-configured
# Custom domain: Use Let's Encrypt (certbot) for Docker
```

## Performance Optimization

1. **Database:**
   - Add indexes on frequently queried columns
   - Use connection pooling (PgBouncer)
   - Monitor query performance

2. **Frontend:**
   - Enable gzip compression (in nginx.conf)
   - Use CDN for static assets
   - Implement code splitting

3. **Backend:**
   - Cache frequently accessed data
   - Implement request queuing
   - Use connection pooling

4. **Monitoring:**
   - Set up performance alerts
   - Use APM tools (New Relic, DataDog)
   - Monitor resource usage

## Cost Estimation

### Render (Monthly)
- Backend: $7 (starter) to $25+ (standard)
- PostgreSQL: $15 (free tier), $25+ (prod)
- Web Admin: $7 (starter) to $25+ (standard)
- **Total:** ~$40-75/month for prod

### Railway (Monthly)
- Varies by usage (pay-as-you-go)
- Typical: $20-60/month for small to medium load

### Self-Hosted Docker
- Depends on infrastructure cost
- VPS: $5-20/month (DigitalOcean, Linode, etc.)

## Next Steps

1. Choose deployment platform
2. Read platform-specific guide (Render or Railway)
3. Set up environment variables
4. Deploy and test
5. Configure custom domain
6. Set up monitoring
7. Create runbooks for common issues

## Support & Resources

- Backend Dockerfile: `backend/Dockerfile`
- Web Admin Dockerfile: `web-admin/Dockerfile`
- Render Config: `deploy/render/render.yaml`
- Railway Config: `deploy/railway/railway.json`
- Docker Compose (Prod): `docker-compose.prod.yml`

Questions? Check the specific platform guide or error logs.
