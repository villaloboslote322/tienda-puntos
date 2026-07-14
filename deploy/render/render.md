# Render Deployment Guide

## Quick Setup

### 1. Create Render Account
- Visit https://render.com
- Sign up with GitHub or email
- Connect your GitHub repository

### 2. Deploy Using render.yaml

Option A: Manual Deployment
```bash
# 1. Push to GitHub
git push origin main

# 2. Go to Render Dashboard
# https://dashboard.render.com

# 3. Click "New +" → "Blueprint"
# 4. Select your GitHub repository (tienda-puntos)
# 5. Select the render.yaml file location: deploy/render/render.yaml
# 6. Review and create services
```

Option B: Automated via GitHub
```bash
# Render automatically detects render.yaml in root or specified directory
# Just push to GitHub and services deploy automatically
```

### 3. Required Environment Variables

Set these in Render Dashboard for each service:

**Backend Service:**
```
JWT_SECRET=your-secure-jwt-secret
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number
```

**Web Admin Service:**
```
VITE_API_URL=https://tienda-puntos-backend.onrender.com
```

### 4. Database Setup

The render.yaml automatically creates:
- PostgreSQL database on Render
- Automatic backups
- Connection pooling

Prisma migrations run on first deploy.

### 5. Testing Deployment

```bash
# Check backend health
curl https://tienda-puntos-backend.onrender.com/health

# Visit web admin
https://tienda-puntos-web-admin.onrender.com
```

### 6. Custom Domain (Optional)

1. Go to Service Settings → Custom Domains
2. Add your domain (e.g., app.tienda-puntos.com)
3. Update DNS records as instructed

### 7. Monitoring & Logs

- View logs in Render Dashboard
- Set up alerts for service failures
- Monitor resource usage in Metrics

### 8. Troubleshooting

**Build fails:**
- Check logs in Render Dashboard
- Verify environment variables are set
- Ensure package.json scripts are correct

**Database connection fails:**
- Verify DATABASE_URL is set correctly
- Check PostgreSQL service is running
- Run migrations: `npx prisma migrate deploy`

**Frontend can't reach backend:**
- Verify VITE_API_URL is correct
- Check CORS settings in backend
- Ensure backend service is running

## Advanced Configuration

### Custom Build Command
Edit render.yaml to customize build:
```yaml
buildCommand: "npm install && npm run build && npx prisma migrate deploy"
```

### Environment-Specific Configs
Create separate files:
- `deploy/render/render.staging.yaml`
- `deploy/render/render.production.yaml`

### Performance Optimization
- Use Render's caching for Docker images
- Set appropriate resource limits
- Enable compression on nginx (included in web-admin/nginx.conf)

## Related Documentation
- https://render.com/docs
- https://render.com/docs/blueprint-spec
