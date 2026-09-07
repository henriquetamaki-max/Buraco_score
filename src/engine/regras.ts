/**
 * Constantes de regra e conversão de cartas em pontos — buraco / canastra.
 *
 * Fontes levantadas em 2026-09-07 (ver MEMORIA.md): Copag, MegaJogos, Jogos do Rei.
 */

import type { Canastras, Cartas, Rank } from './tipos'

/** Valor em pontos de cada carta. */
export const VALOR_CARTA: Record<Rank, number> = {
  '3': 5,
  '4': 5,
  '5': 5,
  '6': 5,
  '7': 5,
  '8': 10,
  '9': 10,
  '10': 10,
  J: 10,
  Q: 10,
  K: 10,
  A: 15,
  '2': 10, // curinga por regra do buraco
  curinga: 10, // joker impresso
}

export const BONUS_CANASTRA = {
  limpa: 200,
  suja: 100,
  as500: 500,
  mil: 1000,
} as const

export const BONUS_BATIDA = 100
export const PENALIDADE_SEM_MORTO = 100
export const ALVO_BURACO_PADRAO = 3000

export const CANASTRAS_ZERO: Canastras = { limpa: 0, suja: 0, as500: 0, mil: 0 }

/**
 * Converte cartas em pontos.
 * Aceita a contagem por rank (o que a câmera produz) ou o total já digitado.
 */
export function pontosDeCartas(c: Cartas): number {
  if (typeof c === 'number') return c
  let total = 0
  for (const chave of Object.keys(c) as Rank[]) {
    const valor = VALOR_CARTA[chave]
    if (valor === undefined) continue // rank desconhecido: ignora em vez de virar NaN
    total += valor * (c[chave] ?? 0)
  }
  return total
}

export function pontosDeCanastras(c: Canastras): number {
  return (
    c.limpa * BONUS_CANASTRA.limpa +
    c.suja * BONUS_CANASTRA.suja +
    c.as500 * BONUS_CANASTRA.as500 +
    c.mil * BONUS_CANASTRA.mil
  )
}
