/** Utilidades pequenas, sem dependência de domínio. */

export function novoId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  }
}

/** Data de hoje em AAAA-MM-DD, no fuso local. */
export function hoje(): string {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

/** O placar pode ser negativo, então o sinal é sempre explícito. */
export function comSinal(n: number): string {
  return n > 0 ? `+${n}` : String(n)
}

/** Classe de cor conforme o sinal — usada no placar e nos totais de rodada. */
export function classeSinal(n: number): string {
  if (n > 0) return 'pos'
  if (n < 0) return 'neg'
  return ''
}
