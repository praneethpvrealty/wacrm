import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Load env variables manually from .env.local
const envPath = resolve(__dirname, '../.env.local');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2].trim();
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      process.env[key] = value;
    }
  }
}

import { classifyImageOrText, parseContactFromImageOrText } from '../src/lib/ai/gemini';

async function main() {
  const msg1 = "Hi User, Shreenath, 917893444713 is interested in SJR Blue Waters, Sarjapur Road Magicbricks";
  console.log(`Classifying: "${msg1}"`);
  const classification = await classifyImageOrText(msg1);
  console.log("Classification result:", classification);

  if (classification === 'contact') {
    console.log("Parsing contact details...");
    const parsed = await parseContactFromImageOrText(msg1);
    console.log("Parsed result:", JSON.stringify(parsed, null, 2));
  }
}

main().catch(console.error);
