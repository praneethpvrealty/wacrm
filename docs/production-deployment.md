# Production Deployment Guide: Go Ingress, Redis, and Queue Workers

This guide outlines the steps to deploy your decoupled WhatsApp CRM webhook ingestion pipeline to production.

---

## 1. Managed Redis Setup (Upstash Redis)

For production scaling and simple serverless billing, use **Upstash Serverless Redis**:
1. Sign up/log in at [Upstash Console](https://console.upstash.com).
2. Create a new **Redis Database**:
   - Choose a region close to your primary database/Next.js hosting (e.g. `us-east-1` or `ap-southeast-1`).
   - Enable **TLS** for encrypted in-transit traffic.
3. Copy the **Redis Connection URL** from the Upstash Dashboard:
   - Format: `redis://default:password@host:port`
   - Stash this URL as it will be used by the Go Service, Node Worker, and Next.js Web Server.

---

## 2. Deploy Go Ingress Service (Railway / Render)

The Go Ingress Service should be deployed as a public web server using [go-ingress/Dockerfile](file:///Volumes/work/CRM%20project/waCrmCustomised/wacrm/go-ingress/Dockerfile).

### Option A: Railway (Recommended)
1. Push your repository to GitHub.
2. Go to [Railway Dashboard](https://railway.app) and create a **New Project**.
3. Choose **Deploy from GitHub repository** and select your project.
4. Set the build folder/root directory to `go-ingress`. Railway will automatically locate the `Dockerfile` inside `go-ingress/` and build it.
5. Add the required **Environment Variables** in the Railway service settings:
   - `PORT`: `8080` (Railway will automatically map incoming HTTP port)
   - `REDIS_URL`: `redis://default:password@host:port` (Upstash connection string)
   - `META_APP_SECRET`: *(Your Meta App Secret)*
   - `WHATSAPP_VERIFY_TOKEN`: *(Your custom webhook verify token)*
   - `NEXT_PUBLIC_SITE_URL`: `https://your-nextjs-app.com` (Main Next.js dashboard URL used for proxying GET challenges)
6. Enable a **Public Domain** in the Railway service networking settings. This will give you an HTTPS URL like `https://go-ingress-production.up.railway.app`.

---

## 3. Deploy Node Queue Worker (Railway / Render)

The Queue Worker is deployed as a background daemon container (no public web endpoint needed) using [Dockerfile.worker](file:///Volumes/work/CRM%20project/waCrmCustomised/wacrm/Dockerfile.worker).

### Deployment Steps:
1. In the same Railway/Render project, add a **New Service** from your GitHub repository.
2. Configure the deployment settings:
   - Set **Docker file path** to `Dockerfile.worker` (located in the workspace root).
   - *Do not expose any ports or domains* (it runs strictly as a background worker).
3. Add the **Environment Variables** required to process messages:
   - `REDIS_URL`: `redis://default:password@host:port` (Same Upstash Redis database URL)
   - `NEXT_PUBLIC_SUPABASE_URL`: *(Your Supabase URL)*
   - `SUPABASE_SERVICE_ROLE_KEY`: *(Your Supabase service role API key)*
   - `ENCRYPTION_KEY`: *(Your 64 hex characters encryption key)*
   - `GEMINI_API_KEY`: *(Your Google Gemini API key)*
   - `NEXT_PUBLIC_SITE_URL`: `https://your-nextjs-app.com`
   - `NEXT_PUBLIC_DEFAULT_WEBSITE_NAME`: `ConvoReal`
   - `NEXT_PUBLIC_DEFAULT_WEBSITE_URL`: `https://www.convoreal.com`
   - `NEXT_PUBLIC_BASE_DOMAIN`: `convoreal.com`

---

## 4. Configure Meta Developer Console Webhook

1. Copy the HTTPS endpoint of your deployed Go Ingress service (e.g. `https://go-ingress-production.up.railway.app`).
2. Log into the [Meta Developer Console](https://developers.facebook.com).
3. Navigate to **WhatsApp → Configuration** (or **Webhooks**).
4. Click **Edit Webhook Settings**:
   - **Callback URL**: `https://go-ingress-production.up.railway.app/api/whatsapp/webhook`
   - **Verify Token**: *(The value you configured in `WHATSAPP_VERIFY_TOKEN`)*
5. Click **Verify and Save**. Meta will send a GET challenge. The Go service will proxy it to Next.js, and verify the token instantly.
6. Under Webhook Fields, ensure you subscribe to `messages` events.

---

## 5. Enable Queueing in Next.js Server

Once the worker and Go ingress are online:
1. Set the `REDIS_URL` environment variable on your primary Next.js deployment hosting platform (e.g. Vercel):
   ```env
   REDIS_URL=redis://default:password@host:port
   ```
2. Redeploy/Restart Next.js.
   - Any webhooks arriving at Next.js (from legacy numbers or fallback routes) will now also be safely buffered and enqueued to Redis, instead of executing synchronously.
