/**
 * Centralized Gemini AI client helper.
 * Uses the Generative Language REST API directly to avoid additional SDK dependencies.
 */

// Define models to try. We prioritize the latest Gemini 2.5 Flash,
// but fall back to the extremely stable Gemini 1.5 Flash if needed.
const MODELS = ["gemini-2.5-flash", "gemini-1.5-flash"];

interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

interface GeminiContent {
  parts: GeminiPart[];
}

interface GeneratePayload {
  contents: GeminiContent[];
  systemInstruction?: {
    parts: [{ text: string }];
  };
  generationConfig?: {
    responseMimeType?: string;
  };
}

/**
 * Base generic content generator for Gemini with API failover chain.
 */
async function generateContentRaw(
  contents: GeminiContent[],
  systemInstructionText?: string,
  jsonMode: boolean = false
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Please add it to your .env.local file.");
  }

  let lastError: Error | null = null;

  for (const model of MODELS) {
    try {
      console.log(`[Gemini AI] Attempting generation using model: ${model}`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const payload: GeneratePayload = {
        contents
      };

      if (systemInstructionText) {
        payload.systemInstruction = {
          parts: [{ text: systemInstructionText }]
        };
      }

      if (jsonMode) {
        payload.generationConfig = {
          responseMimeType: "application/json"
        };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Gemini API returned error: ${response.statusText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("No text returned in Gemini response candidates.");
      }

      console.log(`[Gemini AI] Generation succeeded with model: ${model}`);
      return text.trim();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.warn(`[Gemini AI] Failed with model ${model}:`, errorMessage);
      lastError = err instanceof Error ? err : new Error(errorMessage);

      // If it is a transient error (rate limit, service unavailable, high demand),
      // we proceed to try the fallback model.
      const isTransientError = 
        errorMessage.includes("high demand") || 
        errorMessage.includes("quota") || 
        errorMessage.includes("429") || 
        errorMessage.includes("503");

      if (isTransientError && model !== MODELS[MODELS.length - 1]) {
        console.log("[Gemini AI] Falling back to the next model due to transient error...");
        continue;
      }
      
      // For non-transient errors (like invalid API keys), fail fast.
      throw err;
    }
  }

  throw lastError || new Error("Failed to generate content with all available models.");
}

/**
 * Standard utility to generate plain text using prompt and system instruction.
 */
export async function generateText(prompt: string, systemInstruction?: string): Promise<string> {
  const contents = [{ parts: [{ text: prompt }] }];
  return generateContentRaw(contents, systemInstruction, false);
}

/**
 * Classifies if a message text is a real estate listing / advertisement.
 */
export async function isListingMessage(text: string): Promise<boolean> {
  const cleanText = text.trim();
  if (!cleanText) return false;

  const systemInstruction = 
    "You are an expert real estate classifier. Your job is to classify if the incoming message contains real estate property details, " +
    "advertisements, or requirements for buying/selling/renting properties. " +
    "Only respond with exactly 'true' or 'false'. Absolutely no markdown, no punctuation, and no other text.";

  const prompt = `Classify this message:\n\n"${cleanText}"`;
  
  try {
    const response = await generateText(prompt, systemInstruction);
    return response.toLowerCase().includes("true");
  } catch (err) {
    console.error("[Gemini AI] Error in isListingMessage classification:", err);
    // Fallback search logic in case of API failure
    const keywords = ["bhk", "sqft", "flat", "plot", "villa", "sale", "rent", "layout", "devanahalli", "furnish", "crore", "lakh", "price", "location", "acres", "commercial", "industrial"];
    return keywords.some(kw => cleanText.toLowerCase().includes(kw));
  }
}

export interface ParsedPropertyDraft {
  title: string | null;
  price: number | null;
  location: string | null;
  type: "Flat/ Apartment" | "Villa" | "Residential Land/ Plot" | "Commercial/ Industrial" | "Others" | null;
  sublocality: string | null;
  city: string | null;
  state: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqft: number | null;
  description: string | null;
  features: string[] | null;
  dimensions: string | null;
  facing_direction: string | null;
  images: string[];
}

/**
 * Parses listing details from an image buffer and/or text block.
 */
export async function parseListingFromImageOrText(
  text?: string,
  buffer?: Buffer,
  mimeType?: string
): Promise<ParsedPropertyDraft> {
  const systemInstruction = 
    "You are an expert real estate data parser. Extract property details from the provided text and/or image.\n" +
    "You must return a JSON object conforming to the following structure:\n" +
    "{\n" +
    "  \"title\": \"A descriptive title (e.g. '3 BHK Apartment in HSR Layout' or '30x40 Residential Plot in Devanahalli') or null\",\n" +
    "  \"price\": Numeric price in INR (e.g. if text says '1.2 Cr' or '120 Lakhs', price is 12000000) or null,\n" +
    "  \"location\": \"Exact location or address or null\",\n" +
    "  \"type\": \"Must be exactly one of: 'Flat/ Apartment', 'Villa', 'Residential Land/ Plot', 'Commercial/ Industrial', 'Others' or null\",\n" +
    "  \"sublocality\": \"Sublocality or neighborhood name or null\",\n" +
    "  \"city\": \"City name (default 'Bangalore')\",\n" +
    "  \"state\": \"State name (default 'Karnataka')\",\n" +
    "  \"bedrooms\": Number of bedrooms (numeric) or null,\n" +
    "  \"bathrooms\": Number of bathrooms (numeric) or null,\n" +
    "  \"area_sqft\": Area in Sq.Ft. (numeric) or null,\n" +
    "  \"description\": \"A professional description summarizing the listing or null\",\n" +
    "  \"features\": Array of string features/amenities (e.g., ['Fenced Boundary', 'Access Road']) or empty array,\n" +
    "  \"dimensions\": \"Dimensions if land/plot (e.g., '30x40') or null\",\n" +
    "  \"facing_direction\": \"E.g. 'North', 'East', 'West', 'South' or null\"\n" +
    "}\n\n" +
    "Important parsing rules:\n" +
    "1. For Price: Convert terms like 'Crore', 'Cr', 'Lakhs', 'L' to standard numeric integer values (e.g., '80 Lakhs' -> 8000000, '1.5 Cr' -> 15000000).\n" +
    "2. For Location/Sublocality: Infer the sublocality / layout name (e.g. HSR Layout, Koramangala) if mentioned.\n" +
    "3. Set any fields that cannot be found or reasonably inferred to null.\n" +
    "4. Output MUST be valid JSON.";

  const parts: GeminiPart[] = [];

  if (buffer && mimeType) {
    parts.push({
      inlineData: {
        mimeType,
        data: buffer.toString("base64")
      }
    });
  }

  const promptText = text 
    ? `Parse the following real estate listing details:\n\n"${text}"`
    : "Extract all visible real estate listing details from the provided image.";

  parts.push({ text: promptText });

  const contents = [{ parts }];

  try {
    const rawResult = await generateContentRaw(contents, systemInstruction, true);
    const parsed = JSON.parse(rawResult);
    return {
      title: parsed.title || null,
      price: parsed.price || null,
      location: parsed.location || null,
      type: parsed.type || null,
      sublocality: parsed.sublocality || null,
      city: parsed.city || "Bangalore",
      state: parsed.state || "Karnataka",
      bedrooms: parsed.bedrooms || null,
      bathrooms: parsed.bathrooms || null,
      area_sqft: parsed.area_sqft || null,
      description: parsed.description || null,
      features: parsed.features || [],
      dimensions: parsed.dimensions || null,
      facing_direction: parsed.facing_direction || null,
      images: []
    };
  } catch (err) {
    console.error("[Gemini AI] Error parsing listing details:", err);
    throw err;
  }
}

/**
 * Updates an existing parsed listing draft JSON with a conversational update instruction from the user.
 */
export async function updateListingDraft(
  currentDraft: ParsedPropertyDraft,
  updateRequest: string
): Promise<ParsedPropertyDraft> {
  const systemInstruction = 
    "You are an expert real estate data updater. You are given a current property draft JSON object and a natural language instruction from the user.\n" +
    "Your job is to apply the updates requested by the user and return the complete updated JSON object matching the exact structure.\n" +
    "Do not change any other fields unless requested by the user.\n" +
    "Convert terms like 'Crore', 'Cr', 'Lakhs', 'L' to standard numeric integer values for the price field.\n" +
    "Output MUST be valid JSON.";

  const prompt = `Current Draft:\n${JSON.stringify(currentDraft, null, 2)}\n\nUser Update Request:\n"${updateRequest}"\n\nApply these updates and return the updated JSON.`;
  const contents = [{ parts: [{ text: prompt }] }];

  try {
    const rawResult = await generateContentRaw(contents, systemInstruction, true);
    const parsed = JSON.parse(rawResult);
    return {
      ...currentDraft,
      ...parsed,
      // Retain images and other fields if they were omitted in the response
      images: currentDraft.images || []
    };
  } catch (err) {
    console.error("[Gemini AI] Error updating draft:", err);
    return currentDraft; // Return unchanged on error
  }
}
