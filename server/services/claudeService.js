import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const MODEL = 'claude-sonnet-4-20250514'
export const MAX_TOKENS = 4096

export async function callClaude(systemPrompt, userMessage) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })
  return response.content[0].text
}

export async function callClaudeJSON(systemPrompt, userMessage) {
  const text = await callClaude(systemPrompt, userMessage)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Claude returned no JSON object')
  return JSON.parse(jsonMatch[0])
}
