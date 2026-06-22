# Production Deployment Guide: Go Ingress, Redis, and Queue Workers

This guide outlines the steps to deploy your decoupled WhatsApp CRM webhook ingestion pipeline to production.

---

## 1. Managed Redis Setup (Upstash Redis)

For production scaling and simple serverless billing, use **Upstash Serverless Redis**:
1. Sign up/log in at [Upstash Console](https://console.upstash.com).
2. Create a new **Redis Database**:
   - **Primary Region**: Select **AWS - Sydney, Australia (`ap-southeast-2`)** to match your Supabase database region (which is hosted in Sydney).
   - **Plan**: Select the **Free** plan for development/testing, or **Pay as You Go** for production load.
3. Copy the secure **Redis Connection URL** from the Upstash Dashboard:
   - Since TLS is enabled by default, use the secure scheme **`rediss://`** (double `s`) instead of `redis://`.
   - Format: `rediss://default:password@host:port`
   - Stash this URL as it will be used by the Go Service, Node Worker, and Next.js Web Server.

---

## 2. Deploy Go Ingress Service (Railway / Render)

The Go Ingress Service should be deployed as a public web server using [go-ingress/Dockerfile](file:///Volumes/work/CRM%20project/waCrmCustomised/wacrm/go-ingress/Dockerfile).

### Option A: Railway (Recommended)
1. Push your repository to GitHub.
2. Go to [Railway Dashboard](https://railway.app) and create a **New Project**.
3. Choose **Deploy from GitHub repository** and select your project.
4. Open the service settings and set **Root Directory** to `go-ingress`. Railway will automatically locate the `Dockerfile` inside `go-ingress/` (which copies both `go.mod` and `go.sum`) and build it.
5. Rename the service from `wacrm` to **`go-ingress`** in the settings.
6. Add the required **Environment Variables** in the Railway service settings:
   - `PORT`: `8080` (Railway will automatically map incoming HTTP port)
   - `REDIS_URL`: `rediss://default:password@host:port` (Your secure Upstash connection string)
   - `META_APP_SECRET`: *(Your Meta App Secret)*
   - `WHATSAPP_VERIFY_TOKEN`: *(Your custom webhook verify token)*
   - `NEXT_PUBLIC_SITE_URL`: `https://your-nextjs-app.com` (Main Next.js dashboard URL used for proxying GET challenges)
7. Enable a **Public Domain** in the Railway service networking settings. This will give you an HTTPS URL like `https://go-ingress-production.up.railway.app`.

---

## 3. Deploy Node Queue Worker (Railway / Render)

The Queue Worker is deployed as a background daemon container (no public web endpoint needed) using [Dockerfile.worker](file:///Volumes/work/CRM%20project/waCrmCustomised/wacrm/Dockerfile.worker).

### Deployment Steps (Railway):
1. In the same Railway project, return to the main canvas (click the **`X`** in the top-right of any open service panel).
2. Add a new service by clicking the **`+`** button on the bottom-left toolbar, right-clicking on the canvas, or pressing **`Cmd + K`** and selecting **`New Service`**.
3. Choose **`Deploy from GitHub repo`** and select the same **`wacrm`** repository.
4. Click on this new service block to open its settings and configure:
   - **Service Name**: Rename it to **`queue-worker`** under settings.
   - **Docker File Path**: Under **Settings** ➔ **Build** ➔ scroll to the **Docker** section, and set **Dockerfile Path** to `Dockerfile.worker`. Leave the root directory empty/default `/` (since the Dockerfile is in the main directory).
   - *Do not expose any ports or domains* (it runs strictly as a background daemon).
5. Add the **Environment Variables** required to process messages:
   - `REDIS_URL`: `rediss://default:password@host:port` (Same secure Upstash URL)
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
   REDIS_URL=rediss://default:password@host:port
   ```
2. Redeploy/Restart Next.js.
   - Any webhooks arriving at Next.js (from legacy numbers or fallback routes) will now also be safely buffered and enqueued to Redis, instead of executing synchronously.

---

## 6. Monorepo Build Optimization on Vercel

To prevent Vercel from unnecessarily building your Next.js application whenever you push changes that only affect your Go server or background worker, use the pre-configured [**`vercel.json`**](file:///Volumes/work/CRM%20project/waCrmCustomised/wacrm/vercel.json) in your root directory.

This file uses the **Ignored Build Step** feature to tell Vercel to check if changes occurred outside the Go, docs, and worker files before triggering a build:

```json
{
  "ignoreCommand": "git diff --quiet HEAD^ HEAD -- . ':!go-ingress' ':!docs' ':!Dockerfile.worker'"
}
```

No additional setup is required. Vercel will automatically detect this `vercel.json` file on your next deployment.
