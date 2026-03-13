import OpenAI from 'openai';
import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";

export interface AIResponse {
    summary: string;
    nextSteps: string[];
    riskLevel: 'low' | 'medium' | 'high';
    categories: string[];
}

export interface AIProvider {
    generateSummary(input: { title: string; description: string }): Promise<AIResponse>;
}

export class GeminiProvider implements AIProvider {
    private genAI: GoogleGenerativeAI;
    private model: GenerativeModel;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY is missing");
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });
    }

    async generateSummary(input: { title: string; description: string }): Promise<AIResponse> {
        const prompt = `
      Você é um assistente de DevOps/Suporte especializado. Analise o título e a descrição do ticket fornecidos abaixo.
      Retorne um JSON estrito com o seguinte formato exato:
      {
        "summary": "string (resumo de 3-6 linhas, máx 320 caracteres)",
        "nextSteps": ["• Passo 1", "• Passo 2", "..."], // 3 a 7 bullets começando com •
        "riskLevel": "low" | "medium" | "high",
        "categories": ["bug", "incident", "feature", "maintenance"] // escolha as categorias mais relevantes
      }

      Título: ${input.title}
      Descrição: ${input.description}
    `;

        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        try {
            return JSON.parse(text) as AIResponse;
        } catch {
            throw new Error("Failed to parse AI response JSON");
        }
    }
}

export class MockAIProvider implements AIProvider {
    // Este mock é usado quando nao existe chave real de IA no ambiente.
    // Assim eu consigo demonstrar o fluxo de IA no projeto sem depender de API externa.
    async generateSummary(input: { title: string; description: string }): Promise<AIResponse> {
        // Simulando latencia de rede
        await new Promise(resolve => setTimeout(resolve, 800));

        return {
            summary: `This is a simulated AI summary for "${input.title}". The issue described appears to be a standard operational request that needs support team review.`,
            nextSteps: [
                "• Review the reported issue details.",
                "• Assign a technician if necessary.",
                "• Communicate progress to the reporter."
            ],
            riskLevel: "low",
            categories: ["maintenance", "mocked"]
        };
    }
}

export class OpenAIProvider implements AIProvider {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async generateSummary(input: { title: string; description: string }): Promise<AIResponse> {
        const systemPrompt = `
      Você é um assistente de DevOps/Suporte. Analise o título e a descrição do ticket.
      Retorne um JSON estrito com o seguinte formato:
      {
        "summary": "string (resumo de 3-6 linhas, máx 320 caracteres)",
        "nextSteps": ["• Passo 1", "• Passo 2", "..."], // 3 a 7 bullets
        "riskLevel": "low" | "medium" | "high",
        "categories": ["bug", "incident", "feature", "maintenance"] // escolha as categorias mais relevantes
      }
    `;

        const response = await this.openai.chat.completions.create({
            model: "gpt-4o-mini", // fallback fast model
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Título: ${input.title}\nDescrição: ${input.description}` }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3,
        });

        const content = response.choices[0]?.message.content;
        if (!content) {
            throw new Error("Failed to generate AI response");
        }

        try {
            const parsed = JSON.parse(content) as AIResponse;
            return parsed;
        } catch {
            throw new Error("Failed to parse AI response JSON");
        }
    }
}

export function getAIProvider(): AIProvider {
    // Regra de fallback:
    // 1) Se eu tiver GEMINI_API_KEY, uso Gemini.
    // 2) Se nao tiver Gemini e eu tiver OPENAI_API_KEY, uso OpenAI.
    // 3) Se nao tiver nenhuma chave, uso MockAIProvider.
    if (process.env.GEMINI_API_KEY) {
        return new GeminiProvider();
    }
    if (process.env.OPENAI_API_KEY) {
        return new OpenAIProvider();
    }
    return new MockAIProvider();
}
