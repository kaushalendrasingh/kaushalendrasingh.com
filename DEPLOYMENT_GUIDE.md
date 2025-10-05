# 🚀 Deployment Guide - CORS Fix

## ✅ CORS Configuration Complete!

### What Changed:

1. **Enhanced CORS Middleware** with explicit methods and headers
2. **Created proper .env files** with multiple allowed origins
3. **Configured both frontend and backend** for EC2 deployment

---

## 📦 Deploying to EC2

### Step 1: Push Changes to GitHub

```bash
# Add all changes
git add .

# Commit the CORS fixes (but NOT the .env files - they're in .gitignore)
git commit -m "Fix CORS configuration and enhance security"

# Push to GitHub
git push origin main
```

### Step 2: SSH into Your EC2 Instance

```bash
ssh -i "your-key.pem" ubuntu@13.200.148.246
```

### Step 3: Pull Latest Code

```bash
cd ~/kaushalendrasingh.com  # or wherever your project is
git pull origin main
```

### Step 4: Create/Update .env Files on EC2

#### Create `apps/api/.env`:
```bash
cat > apps/api/.env << 'EOF'
# API env
DATABASE_URL=postgresql+psycopg://kaustya:supersecret@db:5432/kaustya_portfolio
ADMIN_API_KEY=your-super-secret-api-key-here

# CORS Configuration - Add all origins that need to access your API
ALLOWED_ORIGINS=http://13.200.148.246,http://13.200.148.246:8000,https://kaushalendrasingh.com,https://www.kaushalendrasingh.com

# Admin credentials
VITE_ADMIN_EMAIL=kaushcodes@gmail.com
VITE_ADMIN_PASSWORD=K@ush1234
EOF
```

#### Create `apps/web/.env`:
```bash
cat > apps/web/.env << 'EOF'
# Frontend environment variables
VITE_API_URL=http://13.200.148.246:8000
EOF
```

#### Create root `.env`:
```bash
cat > .env << 'EOF'
DATABASE_URL=postgresql+psycopg://kaustya:supersecret@db:5432/kaustya_portfolio
ADMIN_API_KEY=your-super-secret-api-key-here
ALLOWED_ORIGINS=http://13.200.148.246,http://13.200.148.246:8000,https://kaushalendrasingh.com,https://www.kaushalendrasingh.com
POSTGRES_USER=kaustya
POSTGRES_PASSWORD=supersecret
POSTGRES_DB=kaustya_portfolio
EOF
```

### Step 5: Rebuild and Restart Containers

```bash
# Stop existing containers
docker-compose down

# Rebuild the API container (to pick up CORS changes)
docker-compose build api

# Start all services
docker-compose up -d

# Check if services are running
docker-compose ps

# View API logs to verify CORS configuration
docker-compose logs api
```

### Step 6: Rebuild Frontend (if deploying separately)

```bash
cd apps/web

# Install dependencies (if needed)
npm install

# Build with new environment variables
npm run build

# The dist/ folder now has the correct API URL
```

### Step 7: Test CORS

```bash
# Test from your EC2 instance
curl -I -X OPTIONS http://localhost:8000/profile \
  -H "Origin: http://13.200.148.246" \
  -H "Access-Control-Request-Method: GET"

# Should see:
# access-control-allow-origin: http://13.200.148.246
# access-control-allow-credentials: true
# access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
```

---

## 🧪 Testing from Browser

Open your browser and navigate to your frontend. Check the Network tab:

1. **Preflight Request (OPTIONS)**:
   - Should see 200 OK status
   - Response headers should include `access-control-allow-origin`

2. **Actual Request (GET/POST/etc)**:
   - Should complete successfully
   - No CORS errors in console

---

## 🔍 Troubleshooting

### Still Getting CORS Errors?

1. **Check API Logs**:
   ```bash
   docker-compose logs api -f
   ```

2. **Verify Environment Variables**:
   ```bash
   docker-compose exec api env | grep ALLOWED_ORIGINS
   ```

3. **Check Origin Header**:
   - In browser DevTools → Network tab
   - Look at the request headers
   - Verify the `Origin` matches one in your ALLOWED_ORIGINS

4. **Restart Containers**:
   ```bash
   docker-compose restart api
   ```

5. **Check Nginx Configuration** (if using):
   - Ensure Nginx isn't blocking CORS headers
   - Add proxy headers if needed

### Common Issues:

❌ **"No 'Access-Control-Allow-Origin' header"**
- Origin not in ALLOWED_ORIGINS list
- Check for typos in URLs
- Verify http vs https

❌ **"CORS policy: The value of the 'Access-Control-Allow-Origin' header must not be the wildcard '*'"**
- Using `allow_credentials=True` with `allow_origins=["*"]`
- Specify exact origins instead

❌ **"Method OPTIONS is not allowed"**
- OPTIONS not in allow_methods
- Already fixed in the new configuration

---

## 🔐 Security Checklist

Before going to production:

- [ ] Change ADMIN_API_KEY to a strong, random value
- [ ] Use HTTPS for production (not HTTP)
- [ ] Only allow specific origins (not *)
- [ ] Keep .env files out of Git (already done)
- [ ] Set up environment-specific .env files
- [ ] Enable rate limiting on API
- [ ] Set up monitoring and logging

---

## 📚 Additional Resources

- [FastAPI CORS Documentation](https://fastapi.tiangolo.com/tutorial/cors/)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Understanding Preflight Requests](https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request)

---

## ✨ Summary

Your CORS configuration is now:
- ✅ Properly configured with multiple allowed origins
- ✅ Supports credentials (cookies, auth headers)
- ✅ Handles all necessary HTTP methods
- ✅ Caches preflight requests for performance
- ✅ Ready for EC2 deployment

Deploy the changes and your CORS errors should be gone! 🎉
