import { ExtractedPatientData } from '../types';

export async function processTranscriptWithGemini(transcript: string) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API Key is missing");

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

    const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("Critical AI Failure:", error);
    throw error;
  }
}

export async function extractPatientData(transcript: string): Promise<ExtractedPatientData> {
  const result = await processTranscriptWithGemini(transcript);

  return {
    patient_name: result.patient_data?.name || null,
    age: result.patient_data?.age || null,
    symptoms: result.symptoms_data?.primary_symptom ? [result.symptoms_data.primary_symptom] : null,
    duration: result.symptoms_data?.duration || null,
  };
}