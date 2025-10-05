# 🚨 QUICK FIX - CORS Errors

## What Was Fixed:

### 1. Updated CORS Middleware (`apps/api/app/main.py`)
- Added explicit HTTP methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
- Added `expose_headers=["*"]` to expose response headers
- Added `max_age=3600` to cache preflight requests
- Better comments explaining each setting

### 2. Created Proper .env Files
- `apps/api/.env` - Backend config with ALLOWED_ORIGINS
- `apps/web/.env` - Frontend config with VITE_API_URL
- `.env` - Root config for Docker Compose

### 3. Configured Multiple Origins
```
http://localhost:5173              ← Local development
http://YOUR_EC2_IP                 ← EC2 IP
http://YOUR_EC2_IP:8000            ← API endpoint
https://your-domain.com            ← Production domain
https://www.your-domain.com        ← WWW subdomain
```

## 🚀 Quick Deploy to EC2:

```bash
# 1. Commit and push (from local)
git add apps/api/app/main.py apps/api/app/config.py
git commit -m "Fix CORS configuration"
git push origin main

# 2. SSH to EC2
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP

# 3. Pull and setup
cd ~/your-project-directory
git pull

# 4. Create .env file (IMPORTANT!)
cat > apps/api/.env << 'EOF'
DATABASE_URL=postgresql+psycopg://username:password@db:5432/database_name
ADMIN_API_KEY=your-super-secret-api-key
ALLOWED_ORIGINS=http://YOUR_EC2_IP,http://YOUR_EC2_IP:8000,https://your-domain.com
EOF

# 5. Restart API
docker-compose restart api

# 6. Check logs
docker-compose logs api -f
```

## ✅ Test CORS:

```bash
# From EC2 or local terminal
curl -I -X OPTIONS http://YOUR_EC2_IP:8000/profile \
  -H "Origin: http://YOUR_EC2_IP" \
  -H "Access-Control-Request-Method: GET"

# Expected response headers:
# access-control-allow-origin: http://YOUR_EC2_IP
# access-control-allow-credentials: true
# access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
```

## 🔍 If Still Getting Errors:

1. **Check allowed origins match exactly**:
   ```bash
   docker-compose exec api env | grep ALLOWED_ORIGINS
   ```

2. **Verify in browser DevTools**:
   - Network tab → Click failed request
   - Check "Origin" header in Request Headers
   - Must match one of your ALLOWED_ORIGINS

3. **Restart with fresh build**:
   ```bash
   docker-compose down
   docker-compose build api
   docker-compose up -d
   ```

## 📝 Key Points:

- ✅ .env files are in .gitignore (not tracked by Git)
- ✅ CORS now allows credentials and all necessary methods
- ✅ Multiple origins supported for different environments
- ✅ Preflight requests cached for 1 hour for performance
- ⚠️ Remember to create .env on EC2 (not pushed to Git!)

## 🔐 Security:

- Change ADMIN_API_KEY to something secure
- Use HTTPS in production (not HTTP)
- Never set ALLOWED_ORIGINS=* in production
- Keep .env files secret and out of Git

---

**Need help?** Check `CORS_CONFIGURATION.md` or `DEPLOYMENT_GUIDE.md` for detailed instructions.
