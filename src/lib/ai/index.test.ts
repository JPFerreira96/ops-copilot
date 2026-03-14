import { afterEach, describe, expect, it } from "vitest"

import { MockAIProvider, RealAIProvider, getAIProvider, isMockMode } from "./index"

describe("AIProvider - selecao de provider", () => {
  const originalGeminiKey = process.env.GEMINI_API_KEY
  const originalOpenAIKey = process.env.OPENAI_API_KEY

  afterEach(() => {
    // Aqui eu restauro as variaveis para manter os testes isolados.
    process.env.GEMINI_API_KEY = originalGeminiKey
    process.env.OPENAI_API_KEY = originalOpenAIKey
  })

  it("usa MockAIProvider quando nenhuma chave de IA real foi configurada", () => {
    delete process.env.GEMINI_API_KEY
    delete process.env.OPENAI_API_KEY

    const provider = getAIProvider()
    expect(provider).toBeInstanceOf(MockAIProvider)
    expect(isMockMode()).toBe(true)
  })

  it("usa RealAIProvider quando existe OPENAI_API_KEY", () => {
    delete process.env.GEMINI_API_KEY
    process.env.OPENAI_API_KEY = "test-openai-key"

    const provider = getAIProvider()
    expect(provider).toBeInstanceOf(RealAIProvider)
    expect(isMockMode()).toBe(false)
  })

  it("prioriza IA real quando GEMINI_API_KEY existe", () => {
    process.env.OPENAI_API_KEY = "test-openai-key"
    process.env.GEMINI_API_KEY = "test-gemini-key"

    const provider = getAIProvider()
    expect(provider).toBeInstanceOf(RealAIProvider)
    expect(isMockMode()).toBe(false)
  })
})

describe("MockAIProvider", () => {
  it("retorna um contrato valido e nunca falha", async () => {
    const provider = new MockAIProvider()

    const result = await provider.generateSummary({
      title: "Falha no servico de login",
      description: "Usuarios nao conseguem autenticar desde as 10h e o erro aparece no gateway.",
    })

    // Aqui eu valido que o contrato de resposta segue o combinado para a API de IA.
    expect(result.summary.split("\n")).toHaveLength(3)
    expect(result.nextSteps.length).toBeGreaterThanOrEqual(3)
    expect(result.nextSteps.length).toBeLessThanOrEqual(7)
    expect(["low", "medium", "high"]).toContain(result.riskLevel)
    expect(Array.isArray(result.categories)).toBe(true)
    expect(result.categories.length).toBeGreaterThan(0)
  })
})
