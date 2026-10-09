import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import type { LanguageModel } from 'ai'
import { env } from '@/lib/env'

/**
 * One provider for everything. The OpenAI-compatible surface covers
 * OpenRouter, Groq, Together, DeepSeek, Gemini and a local Ollama, so
 * swapping models is an environment change, not a code change.
 */

let cached: LanguageModel | null = null

export function languageModel(): LanguageModel {
  if (cached) return cached

  const e = env()
  if (!e.LLM_API_KEY) {
    throw new Error('LLM_API_KEY is not set. Add it to .env.local to enable replies.')
  }

  const provider = createOpenAICompatible({
    name: 'llm',
    baseURL: e.LLM_BASE_URL,
    apiKey: e.LLM_API_KEY,
  })

  cached = provider(e.LLM_MODEL)
  return cached
}
