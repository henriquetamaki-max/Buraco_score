/** Pontuação de uma rodada. Funções puras. */

import type { LadoBuraco, Rodada } from './tipos'
import {
  BONUS_BATIDA,
  CANASTRAS_ZERO,
  PENALIDADE_SEM_MORTO,
  pontosDeCanastras,
  pontosDeCartas,
} from './regras'

/** Lado neutro: zero pontos. `pegouMorto: true` para não aplicar penalidade por omissão. */
export const LADO_ZERO: LadoBuraco = {
  baixadas: 0,
  canastras: CANASTRAS_ZERO,
  batida: false,
  pegouMorto: true,
  mao: 0,
}

export function lado(parcial: Partial<LadoBuraco> = {}): LadoBuraco {
  return { ...LADO_ZERO, ...parcial }
}

/**
 * Total de UMA equipe em UMA rodada.
 *
 * = cartas baixadas + bônus de canastras + batida − penalidade do morto − cartas na mão
 *
 * PODE SER NEGATIVO: não pegar o morto (-100) somado às cartas que sobraram na mão
 * derruba o acumulado entre rodadas. Ver DECISOES.md ("Fim da partida").
 */
export function totalLado(l: LadoBuraco): number {
  return (
    pontosDeCartas(l.baixadas) +
    pontosDeCanastras(l.canastras) +
    (l.batida ? BONUS_BATIDA : 0) -
    (l.pegouMorto ? 0 : PENALIDADE_SEM_MORTO) -
    pontosDeCartas(l.mao)
  )
}

/** Total de uma equipe numa rodada. Equipe ausente da rodada = 0. */
export function totalRodada(rodada: Rodada, equipeId: string): number {
  const l = rodada.porEquipe[equipeId]
  return l === undefined ? 0 : totalLado(l)
}
