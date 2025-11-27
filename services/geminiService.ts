import { GoogleGenAI, Content, Part } from "@google/genai";
import { DocumentFile, Message, MessageRole } from '../types';
import { GEMINI_MODEL, SYSTEM_INSTRUCTION_TEMPLATE } from '../constants';

const apiKey = process.env.API_KEY || '';

// Initialize client securely (client-side specific for this demo environment)
const ai = new GoogleGenAI({ apiKey });

export const generateResponseStream = async (
  history: Message[],
  documents: DocumentFile[],
  currentPrompt: string,
  onChunk: (text: string) => void
): Promise<string> => {
  
  if (!apiKey) {
    const errorMsg = "API Key not found in environment.";
    onChunk(errorMsg);
    return errorMsg;
  }

  try {
    // 1. Construct the System Instruction with Document Context
    // In a production app, we would use RAG (Vector DB) here.
    // For this powerful demo, we use Gemini's massive context window to inject all docs.
    let context = "";
    documents.forEach(doc => {
      context += `\n--- START DOCUMENT: ${doc.name} ---\n${doc.content}\n--- END DOCUMENT: ${doc.name} ---\n`;
    });

    const systemInstruction = SYSTEM_INSTRUCTION_TEMPLATE + (context || "No documents uploaded yet.");

    // 2. Prepare History for the API
    // Filter out error messages or system notifications from UI history if needed
    // Map internal Message type to GenAI SDK Content type if using multi-turn chat directly
    // Ideally, for one-off retrieval, we can just use generateContent with history as context, 
    // but chat.sendMessageStream is better for conversation continuity.

    const chat = ai.chats.create({
      model: GEMINI_MODEL,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3, // Low temperature for factual grounding
      },
      history: history.filter(m => m.role !== 'system').map(m => ({
        role: m.role,
        parts: [{ text: m.text }],
      })),
    });

    // 3. Send Message Stream
    const result = await chat.sendMessageStream({
      message: currentPrompt
    });

    let fullText = "";
    for await (const chunk of result) {
      const chunkText = chunk.text || "";
      fullText += chunkText;
      onChunk(fullText);
    }

    return fullText;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    const errorMessage = `Error: ${error.message || "Failed to generate response."}`;
    onChunk(errorMessage);
    return errorMessage;
  }
};
