import OpenAI from "openai"
import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai"

export interface AIResponse {
  summary: string
  nextSteps: string[]
  riskLevel: "low" | "medium" | "high"
  categories: string[]
}

export interface AIProvider {
  generateSummary(input: { title: string; description: string }): Promise<AIResponse>
}

export class GeminiProvider implements AIProvider {
  private genAI: GoogleGenerativeAI
  private model: GenerativeModel

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error("GEMINI_API_KEY ausente")

    this.genAI = new GoogleGenerativeAI(apiKey)
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    })
  }

  async generateSummary(input: { title: string; description: string }): Promise<AIResponse> {
    const prompt = `
Voce e um assistente de DevOps/Suporte.
Analise o titulo e a descricao do ticket.
Retorne JSON estrito com:
{
  "summary": "3 a 6 linhas",
  "nextSteps": ["3 a 7 itens"],
  "riskLevel": "low|medium|high",
  "categories": ["tags de classificacao"]
}

Titulo: ${input.title}
Descricao: ${input.description}
`

    const result = await this.model.generateContent(prompt)
    const text = result.response.text()

    try {
      return JSON.parse(text) as AIResponse
    } catch {
      throw new Error("Falha ao parsear resposta do Gemini")
    }
  }
}

export class OpenAIProvider implements AIProvider {
  private openai: OpenAI

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error("OPENAI_API_KEY ausente")

    this.openai = new OpenAI({ apiKey })
  }

  async generateSummary(input: { title: string; description: string }): Promise<AIResponse> {
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "Retorne apenas JSON com summary (3-6 linhas), nextSteps (3-7 itens), riskLevel (low|medium|high), categories (array).",
        },
        {
          role: "user",
          content: `Titulo: ${input.title}\nDescricao: ${input.description}`,
        },
      ],
    })

    const content = response.choices[0]?.message.content
    if (!content) {
      throw new Error("Resposta vazia da OpenAI")
    }

    try {
      return JSON.parse(content) as AIResponse
    } catch {
      throw new Error("Falha ao parsear resposta da OpenAI")
    }
  }
}

export class RealAIProvider implements AIProvider {
  private provider: AIProvider

  constructor() {
    if (process.env.GEMINI_API_KEY) {
      this.provider = new GeminiProvider()
      return
    }

    if (process.env.OPENAI_API_KEY) {
      this.provider = new OpenAIProvider()
      return
    }

    throw new Error("Nenhuma chave de IA real configurada")
  }

  async generateSummary(input: { title: string; description: string }): Promise<AIResponse> {
    return this.provider.generateSummary(input)
  }
}

export class MockAIProvider implements AIProvider {
  async generateSummary(input: { title: string; description: string }): Promise<AIResponse> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const title = input.title.toLowerCase()
    const riskLevel: AIResponse["riskLevel"] = title.includes("indispon") || title.includes("falha") ? "high" : "medium"

    return {
      summary: [
        "Ticket analisado em modo mock.",
        "O problema indica impacto operacional e precisa de triagem inicial.",
        "Recomenda-se validacao de causa raiz e acompanhamento ate estabilizacao.",
      ].join("\n"),
      nextSteps: [
        "Validar escopo e impacto com o solicitante.",
        "Priorizar atendimento conforme risco identificado.",
        "Executar checklist tecnico inicial e registrar evidencias.",
      ],
      riskLevel,
      categories: riskLevel === "high" ? ["incident", "bug", "operations"] : ["incident", "operations", "support"],
    }
  }
}

export function isMockMode(): boolean {
  return !process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY
}

export function getAIProvider(): AIProvider {
  if (isMockMode()) {
    return new MockAIProvider()
  }

  return new RealAIProvider()
}