# CORS Configuration Guide

## ✅ CORS Issue Fixed!

### What Was Done:

1. **Updated CORS Middleware** in `apps/api/app/main.py`:
   - Explicitly specified allowed HTTP methods (GET, POST, PUT, DELETE, OPTIONS, PATCH)
   - Added `expose_headers` to allow all response headers
   - Added `max_age` for preflight request caching (1 hour)
   - Added detailed comments explaining each setting

2. **Created `.env` files** with proper CORS origins:
   - `apps/api/.env` - Backend environment variables
   - `apps/web/.env` - Frontend environment variables
   - `.env` - Root environment variables for Docker Compose

3. **Configured Multiple Origins**:
   ```
   http://localhost:5173         # Local Vite dev server
   http://localhost:3000         # Alternative local port
   http://YOUR_EC2_IP            # Your EC2 public IP
   http://YOUR_EC2_IP:8000       # Your API endpoint
   https://your-domain.com       # Your production domain
   https://www.your-domain.com   # WWW subdomain
   ```

### How CORS Works Now:

1. **Preflight Requests (OPTIONS)**:
   - Browser automatically sends OPTIONS request before actual request
   - Server responds with allowed origins, methods, and headers
   - Response is cached for 1 hour (max_age=3600)

2. **Actual Requests**:
   - Include credentials (cookies, authorization headers)
   - Must come from an allowed origin
   - Can use any of the specified HTTP methods

### Environment Variables Required:

#### Backend (`apps/api/.env`):
```bash
DATABASE_URL=postgresql+psycopg://username:password@db:5432/database_name
ADMIN_API_KEY=your-secure-api-key-here
ALLOWED_ORIGINS=http://localhost:5173,http://your-server-ip,https://your-domain.com
```

#### Frontend (`apps/web/.env`):
```bash
VITE_API_URL=http://your-server-ip:8000
```

### Testing CORS:

1. **Start the backend**:
   ```bash
   docker-compose up -d
   ```

2. **Check API health**:
   ```bash
   curl -I http://localhost:8000/health
   ```

3. **Test CORS headers**:
   ```bash
   curl -I -X OPTIONS http://localhost:8000/profile \
     -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET"
   ```

   Should return:
   ```
   access-control-allow-origin: http://localhost:5173
   access-control-allow-credentials: true
   access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
   ```

### On EC2 Deployment:

1. **Update ALLOWED_ORIGINS** to include:
   - Your EC2 public IP
   - Your domain name (if you have one)
   - Any other origins that need access

2. **Restart the API**:
   ```bash
   docker-compose restart api
   ```

### Security Notes:

⚠️ **NEVER use `ALLOWED_ORIGINS=*` in production!**
- Only specify trusted origins
- Use HTTPS in production
- Keep your ADMIN_API_KEY secret and strong

### Troubleshooting:

If you still get CORS errors:

1. **Check browser console** for the exact error
2. **Verify the Origin header** matches one in ALLOWED_ORIGINS
3. **Check if API is running**: `docker-compose ps`
4. **View API logs**: `docker-compose logs api`
5. **Ensure .env is loaded**: Restart containers after changing .env

### Additional Configuration Options:

If you need to allow all origins (DEV ONLY):
```python
# In apps/api/.env
ALLOWED_ORIGINS=*
```

For specific headers only:
```python
# In main.py
allow_headers=["Content-Type", "Authorization", "X-API-Key"]
```

---

## 🔒 Remember: These .env files contain sensitive data!
- Keep them in .gitignore (already done)
- Never commit them to Git
- Rotate credentials if exposed
