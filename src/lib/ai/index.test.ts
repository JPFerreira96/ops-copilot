import { afterEach, describe, expect, it } from "vitest"
import {
    GeminiProvider,
    getAIProvider,
    MockAIProvider,
    OpenAIProvider,
} from "./index"

describe("AIProvider - selecao e fallback", () => {
    const originalGeminiKey = process.env.GEMINI_API_KEY
    const originalOpenAIKey = process.env.OPENAI_API_KEY

    afterEach(() => {
        // Aqui eu restauro o ambiente para um teste nao contaminar o outro.
        process.env.GEMINI_API_KEY = originalGeminiKey
        process.env.OPENAI_API_KEY = originalOpenAIKey
    })

    it("usa MockAIProvider quando nenhuma API key foi configurada", () => {
        delete process.env.GEMINI_API_KEY
        delete process.env.OPENAI_API_KEY

        const provider = getAIProvider()
        expect(provider).toBeInstanceOf(MockAIProvider)
    })

    it("usa OpenAIProvider quando so OPENAI_API_KEY esta configurada", () => {
        delete process.env.GEMINI_API_KEY
        process.env.OPENAI_API_KEY = "test-openai-key"

        const provider = getAIProvider()
        expect(provider).toBeInstanceOf(OpenAIProvider)
    })

    it("prioriza GeminiProvider quando GEMINI_API_KEY existe", () => {
        process.env.OPENAI_API_KEY = "test-openai-key"
        process.env.GEMINI_API_KEY = "test-gemini-key"

        const provider = getAIProvider()
        expect(provider).toBeInstanceOf(GeminiProvider)
    })
})

describe("MockAIProvider", () => {
    it("retorna um objeto no formato esperado e respeita o delay simulado", async () => {
        const provider = new MockAIProvider()

        const input = {
            title: "Sistema fora do ar",
            description: "O sistema principal nao esta respondendo desde as 10h da manha.",
        }

        const startTime = Date.now()
        const result = await provider.generateSummary(input)
        const endTime = Date.now()

        // Aqui eu valido que o mock realmente simula latencia de rede.
        expect(endTime - startTime).toBeGreaterThanOrEqual(700)

        // Aqui eu valido o contrato de saida da IA.
        expect(result).toHaveProperty("summary")
        expect(typeof result.summary).toBe("string")

        expect(result).toHaveProperty("nextSteps")
        expect(Array.isArray(result.nextSteps)).toBe(true)
        expect(result.nextSteps.length).toBeGreaterThan(0)

        expect(result).toHaveProperty("riskLevel")
        expect(["low", "medium", "high"]).toContain(result.riskLevel)

        expect(result).toHaveProperty("categories")
        expect(Array.isArray(result.categories)).toBe(true)
    })
})