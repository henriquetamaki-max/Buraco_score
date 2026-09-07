import { describe, expect, it } from 'vitest'
import type { Contagem } from '../tipos'
import { BONUS_CANASTRA, VALOR_CARTA, pontosDeCanastras, pontosDeCartas } from '../regras'
import { canastras } from '../fabricas'

describe('valor das cartas', () => {
  it('3 a 7 valem 5', () => {
    for (const r of ['3', '4', '5', '6', '7'] as const) expect(VALOR_CARTA[r]).toBe(5)
  })

  it('8 a K valem 10', () => {
    for (const r of ['8', '9', '10', 'J', 'Q', 'K'] as const) expect(VALOR_CARTA[r]).toBe(10)
  })

  it('as vale 15', () => {
    expect(VALOR_CARTA.A).toBe(15)
  })

  it('curinga vale 10, tanto o 2 quanto o joker impresso', () => {
    expect(VALOR_CARTA['2']).toBe(10)
    expect(VALOR_CARTA.curinga).toBe(10)
  })
})

describe('pontosDeCartas', () => {
  it('soma a contagem por rank', () => {
    // 2 ases (30) + 3 reis (30) + 4 cincos (20) = 80
    expect(pontosDeCartas({ A: 2, K: 3, '5': 4 })).toBe(80)
  })

  it('aceita o total digitado direto', () => {
    expect(pontosDeCartas(215)).toBe(215)
  })

  it('contagem vazia = 0', () => {
    expect(pontosDeCartas({})).toBe(0)
  })

  it('ignora rank desconhecido em vez de virar NaN', () => {
    const sujo = { A: 1, xis: 9 } as unknown as Contagem
    expect(pontosDeCartas(sujo)).toBe(15)
  })

  it('mao real de 7 cartas', () => {
    // A(15) + 2(10) + K(10) + 10(10) + 7(5) + 4(5) + curinga(10) = 65
    expect(
      pontosDeCartas({ A: 1, '2': 1, K: 1, '10': 1, '7': 1, '4': 1, curinga: 1 }),
    ).toBe(65)
  })
})

describe('pontosDeCanastras', () => {
  it('limpa 200 e suja 100', () => {
    expect(pontosDeCanastras(canastras({ limpa: 2, suja: 1 }))).toBe(500)
  })

  it('as500 e mil', () => {
    expect(pontosDeCanastras(canastras({ as500: 1, mil: 1 }))).toBe(1500)
  })

  it('sem canastra = 0', () => {
    expect(pontosDeCanastras(canastras())).toBe(0)
  })

  it('constantes conferem com a tabela oficial', () => {
    expect(BONUS_CANASTRA).toEqual({ limpa: 200, suja: 100, as500: 500, mil: 1000 })
  })
})
