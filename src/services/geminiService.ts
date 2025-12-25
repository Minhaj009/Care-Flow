export async function processTranscriptWithGemini(transcript) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("Gemini API Key is missing");

  // Models priority
  const modelsToTry = [
    "gemini-2.5-flash", 
    "gemini-2.0-flash",
    "gemini-flash-latest"
  ];

  const prompt = `
    You are an expert Medical Scribe for Pakistan.
    Analyze this transcript: "${transcript}"
    
    CRITICAL TRANSLATION RULES (Roman Urdu -> English):
    - "Ulti" / "Ubh-kai" -> Vomiting
    - "Bukhar" / "Tapt" -> Fever
    - "Dard" / "Pir" -> Pain
    - "Chakar" -> Dizziness
    - "Saans phoolna" -> Shortness of Breath
    - "Pait" -> Stomach
    
    OUTPUT FORMAT (Strict JSON, No Markdown):
    {
      "patient_data": { 
        "name": "string (Title Case)", 
        "age": "string", 
        "gender": "string" 
      },
      "symptoms": [  
        // EXTRACT ALL SYMPTOMS FOUND (Array)
        { 
          "name": "string (Standard Medical English)", 
          "duration": "string (or null)", 
          "severity": "string (Low/Medium/High)" 
        }
      ]
    }
  `;

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });

      if (!response.ok) continue;

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error("Empty response");

      const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);

    } catch (e) {
      console.warn(`Model ${model} failed.`);
    }
  }
  throw new Error("AI Extraction Failed.");
}