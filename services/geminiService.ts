import { GoogleGenAI } from "@google/genai";
import { ProjectData } from '../types';

// Using Flash for speed and large context window which is great for logs
const MODEL_NAME = 'gemini-3-flash-preview';

const getAiClient = (): GoogleGenAI => {
  const apiKey = sessionStorage.getItem('gemini_api_key');
  if (!apiKey) {
    throw new Error("API Key is missing. Please set your Gemini API Key.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateTaskReport = async (projects: ProjectData[]): Promise<string> => {
  if (projects.length === 0) return '';

  let promptInput = "Here are the git commit logs for the projects:\n\n";

  projects.forEach(p => {
    promptInput += `=== PROJECT: ${p.name} ===\n`;
    // Limit to last 500 commits per project to avoid hitting token limits if history is massive, 
    // though Gemini 1.5/2.0 context is huge, we play safe for the demo.
    const commitsToAnalyze = p.parsedCommits.slice(0, 1000); 
    
    commitsToAnalyze.forEach(c => {
      promptInput += `[${c.date}] ${c.message}\n`;
    });
    promptInput += "\n";
  });

  const systemInstruction = `
    You are an expert Technical Product Manager and Software Architect.
    Your task is to analyze raw git commit logs and generate a structured, professional progress report in Markdown.
    
    Process Guidelines:
    1.  **Cluster & Deduplicate**: Group related commits into high-level tasks or features. Ignore minor typo fixes or merge noise unless they indicate a significant effort.
    2.  **Infer Intent**: Read between the lines. If a commit says "fix bug in auth", infer that "Authentication Module Stability" was improved.
    3.  **Structure**:
        - Create a section for each project.
        - **Summary**: A high-level executive summary of work done.
        - **Key Features & Tasks**: Bullet points of main deliverables. Use sub-bullets for technical implementation details found in the logs.
        - **Technical Improvements**: Refactoring, tooling, library updates.
    4.  **Tone**: Professional, concise, and result-oriented.
    5.  **Output**: Strictly Markdown. No preambles.
  `;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: promptInput,
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 0 } // Disable thinking for faster summarization
      },
    });

    return response.text || "No report generated.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes('API Key')) {
      throw error;
    }
    throw new Error("Failed to generate report. Please check your API key and connection.");
  }
};

export const translateReportToOromo = async (markdown: string): Promise<string> => {
  const systemInstruction = `
    You are a professional translator fluent in English and Afaan Oromoo (Oromo language).
    Your task is to translate the provided Technical Markdown Report into Afaan Oromoo.
    
    Rules:
    1.  **Preserve Structure**: Keep all Markdown headers (#, ##), bullets, bolding (**), and code blocks exactly as they are.
    2.  **Context Aware**: Translate technical terms where appropriate, but keep industry-standard terms (like "API", "Git", "Bug", "React") in English if that is the common usage in technical Oromo contexts, or provide a descriptive translation.
    3.  **Tone**: Professional and formal.
    4.  **Output**: Only the translated Markdown.
  `;

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: markdown,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    return response.text || "Translation failed.";
  } catch (error) {
    console.error("Translation Error:", error);
    throw new Error("Failed to translate report.");
  }
};