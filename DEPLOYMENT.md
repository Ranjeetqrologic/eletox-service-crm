# Eletox Service CRM - Deployment Guide

## Local Development (already working)

```bash
# Terminal 1 - Backend
cd /Users/ranjeetkumarsaini/CascadeProjects/escm/backend
npm run dev

# Terminal 2 - Frontend
cd /Users/ranjeetkumarsaini/CascadeProjects/escm/frontend
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5050
- Default admin login: `admin@escm.com` / `admin123`

## Recommended production setup

Because Hostinger shared hosting (Single/Premium) does not support Node.js, the easiest free setup is:

- **Backend**: Render (free Node.js hosting)
- **Frontend**: Hostinger static files (upload the `out` folder)
- **Domain**: `eletox.com` → Hostinger, `api.eletox.com` → Render

---

## Step 1: Backend on Render

1. Create a free account on https://render.com
2. Connect your GitHub repo, or use the `render.yaml` in the project root.
3. Create a new **Web Service**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
4. Add environment variables (copy from `backend/.env`):
   - `NODE_ENV=production`
   - `PORT=10000`
   - `MONGO_URI=mongodb+srv://...`
   - `JWT_SECRET=your_strong_secret`
   - `JWT_EXPIRES_IN=7d`
   - Cloudinary, SMTP, Twilio keys (optional)
5. Deploy. Render will give you a URL like:
   ```
   https://escm-backend-xyz.onrender.com
   ```
6. (Optional) Add custom domain `api.eletox.com` in Render dashboard and create a CNAME record in Hostinger DNS pointing to Render.

---

## Step 2: Frontend static build for Hostinger

1. Create `frontend/.env.production`:
   ```
   NEXT_PUBLIC_API_URL=https://escm-backend-xyz.onrender.com
   ```
2. Build static files:
   ```bash
   cd /Users/ranjeetkumarsaini/CascadeProjects/escm/frontend
   npm run build
   ```
3. This creates a `.next` folder with static content. If you need plain HTML/CSS/JS, enable `output: 'export'` in `next.config.js` and it will create an `out` folder.
4. Upload the contents of `out` (or `.next/static`) to Hostinger `public_html` using File Manager.

---

## Step 3: DNS settings in Hostinger

If you use a custom domain for the backend:

- **A record** for `@` → Hostinger server IP (for frontend)
- **CNAME record** for `api` → Render domain (e.g., `escm-backend-xyz.onrender.com`)

If you only use Render's default URL, you only need the frontend DNS.

---

## Hostinger Node.js Web App (only Business/Cloud plans)

If your Hostinger plan supports Node.js:

1. hPanel → **Node.js Web App** → Create.
2. For backend:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
3. For frontend:
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
   - Environment: `NEXT_PUBLIC_API_URL=https://api.eletox.com`
4. Point `eletox.com` to frontend and `api.eletox.com` to backend in Hostinger domains.

---

## Important notes

- Never commit `backend/.env` to GitHub. It is already in `.gitignore`.
- For production, use a real MongoDB URI (Atlas). The `MONGO_URI=memory` option is only for local demos.
- The backend runs on port 5050 locally, but production platforms usually provide their own `PORT` env variable.
