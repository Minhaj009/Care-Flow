// src/lib/gemini.ts (or wherever your API logic lives)

export async function processTranscriptWithGemini(transcript) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API Key is missing");

  // WE ARE HITTING THE ENDPOINT DIRECTLY
  // Model: gemini-1.5-flash (Standard, fast, cheap)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
    You are a medical data structure engine. 
    Analyze this transcript: "${transcript}"
    
    Extract the following JSON strictly. Do not use Markdown formatting (no \`\`\`json blocks). Just return the raw JSON string.
    If the language is mixed (Roman Urdu), translate to English first.
    
    Structure:
    {
      "patient_data": { "name": "string or null", "age": "string or null", "gender": "string or null" },
      "symptoms_data": { "primary_symptom": "string", "duration": "string", "severity": "string" }
    }
  `;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const rawText = data.candidates[0].content.parts[0].text;
    
    // Clean up if Gemini accidentally adds markdown code blocks
    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("Critical AI Failure:", error);
    throw error;
  }
}