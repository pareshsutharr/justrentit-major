# JustRentIt Client

## Local Development

```bash
npm install
npm run dev
```

## Environment Variables

Create `.env` in `client/`:

```env
VITE_API_BASE_URL=https://your-render-service.onrender.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

## Vercel Deployment

1. Import `client` folder as a Vercel project.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add environment variables in Vercel Project Settings:
   - `VITE_API_BASE_URL`
   - `VITE_GOOGLE_CLIENT_ID`
5. Redeploy after saving env vars.

`vercel.json` is included for SPA route rewrites (`/dashboard`, `/admin`, etc. -> `index.html`).
