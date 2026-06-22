import fs from 'fs';
import path from 'path';
import Redis from 'ioredis';
import { processWebhook } from '../lib/whatsapp/webhook-handler';

// Helper to manually load Next.js environment files
function loadEnv() {
  const files = ['.env.local', '.env.development', '.env'];
  for (const file of files) {
    const envPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, 'utf8').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const equalsIdx = trimmed.indexOf('=');
        if (equalsIdx === -1) continue;
        const key = trimmed.substring(0, equalsIdx).trim();
        let value = trimmed.substring(equalsIdx + 1).trim();
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        } else if (value.startsWith("'") && value.endsWith("'")) {
          value = value.substring(1, value.length - 1);
        }
        if (process.env[key] === undefined) {
          process.env[key] = value;
        }
      }
      console.log(`[Worker] Loaded environment from ${file}`);
    }
  }
}

// Load env variables
loadEnv();

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  console.error('[Worker] REDIS_URL is not set. Worker cannot start.');
  process.exit(1);
}

// Connect to Redis
const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

console.log('[Worker] Connected to Redis. Starting queue consumption...');

async function startWorker() {
  while (true) {
    try {
      // BLPOP blocks until a webhook payload is pushed to 'whatsapp-webhooks'
      const result = await redis.blpop('whatsapp-webhooks', 0);
      if (result) {
        const [, payloadStr] = result;
        const body = JSON.parse(payloadStr);
        console.log(`[Worker] Popped job from queue. Processing...`);
        const startTime = Date.now();
        await processWebhook(body);
        console.log(`[Worker] Processed job in ${Date.now() - startTime}ms`);
      }
    } catch (err) {
      console.error('[Worker] Error processing job:', err);
      // Wait 1 second before retrying to prevent hot loops
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

// Handle termination gracefully
process.on('SIGTERM', () => {
  console.log('[Worker] SIGTERM received. Closing Redis connection...');
  redis.disconnect();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[Worker] SIGINT received. Closing Redis connection...');
  redis.disconnect();
  process.exit(0);
});

startWorker();
