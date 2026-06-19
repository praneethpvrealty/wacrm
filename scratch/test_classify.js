const fs = require('fs');
const path = require('path');

// Load env variables manually from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
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

const MODELS = ["gemini-2.5-flash", "gemini-1.5-flash"];

async function generateContentRaw(contents, systemInstructionText) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  const model = MODELS[0];
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const payload = {
    contents,
  };
  if (systemInstructionText) {
    payload.systemInstruction = {
      parts: [{ text: systemInstructionText }]
    };
  }
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text;
}

async function classifyImageOrText(text) {
  const systemInstruction =
    "You are an expert real estate CRM classifier. Your job is to classify if the incoming message (which can be text and/or an image) is:\n" +
    "1. 'property': A property listing to be added to inventory, layout plan, listing advertisement, or property details description.\n" +
    "2. 'contact': Contact details, vCard details, request to add/save a contact/lead, screenshot of contact/profile details, or lead forwarding/inquiry messages containing contact name/phone and their property interest (e.g. 'VaishaliGaur, 917737932199 is interested in SJR Blue Waters' or Magicbricks/99acres/Housing forwards).\n" +
    "3. 'none': Neither of the above.\n\n" +
    "Only respond with exactly 'property', 'contact', or 'none'. Absolutely no markdown, no punctuation, and no other text.";
  const promptText = `Classify this content:\n\n"${text}"`;
  const contents = [{ parts: [{ text: promptText }] }];
  const response = await generateContentRaw(contents, systemInstruction);
  return response?.toLowerCase().trim();
}

async function main() {
  const msg1 = "Hi User, Shreenath, 917893444713 is interested in SJR Blue Waters, Sarjapur Road Magicbricks";
  console.log(`Classifying: "${msg1}"`);
  const classification = await classifyImageOrText(msg1);
  console.log("Classification result:", classification);
}

main().catch(console.error);
