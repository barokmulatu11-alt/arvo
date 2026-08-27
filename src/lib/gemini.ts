import { CV_PARSING_PROMPT, CONVERSATIONAL_CV_EDITING_PROMPT } from './prompts';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-3.6-flash';

// --- PDF / IMAGE PARSING ---
export async function parseCvFromImages(base64Images: string[]) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: CV_PARSING_PROMPT },
              ...base64Images.map((img) => ({
                inline_data: { mime_type: 'image/png', data: img },
              })),
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    const reason = data?.error?.message || data?.promptFeedback?.blockReason || JSON.stringify(data);
    console.error('[Gemini] parseCvFromImages failed:', reason);
    throw new Error(`Gemini error: ${reason}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Failed to parse CV JSON from Gemini response');
  }
}

export async function parseCvFromText(cvText: string) {
  const prompt = CV_PARSING_PROMPT.replace("{{cv_text}}", cvText);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    const reason = data?.error?.message || data?.promptFeedback?.blockReason || JSON.stringify(data);
    console.error('[Gemini] parseCvFromText failed:', reason);
    throw new Error(`Gemini error: ${reason}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Failed to parse CV JSON from Gemini response');
  }
}

// --- CONVERSATIONAL EDITING ---
export async function editCvWithPrompt(cvJson: object, userInstruction: string) {
  const filledPrompt = CONVERSATIONAL_CV_EDITING_PROMPT
    .replace('{{cv_json}}', JSON.stringify(cvJson, null, 2))
    .replace('{{user_instruction}}', userInstruction);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: filledPrompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
        },
      }),
    }
  );

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    const reason = data?.error?.message || data?.promptFeedback?.blockReason || JSON.stringify(data);
    console.error('[Gemini] editCvWithPrompt failed:', reason);
    throw new Error(`Gemini error: ${reason}`);
  }

  try {
    const parsed = JSON.parse(text);
    return {
      updatedCv: parsed.updated_cv,
      assistantMessage: parsed.assistant_message,
    };
  } catch {
    throw new Error('Failed to parse editing response from Gemini');
  }
}
