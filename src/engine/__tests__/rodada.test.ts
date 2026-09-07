import { describe, expect, it } from 'vitest'
import { lado, totalLado, totalRodada } from '../rodada'
import { canastras, rodada } from '../fabricas'

describe('totalLado', () => {
  it('lado zero = 0', () => {
    expect(totalLado(lado())).toBe(0)
  })

  it('rodada boa: baixadas + canastra limpa + batida', () => {
    // 200 + 200 + 100 = 500
    expect(
      totalLado(lado({ baixadas: 200, canastras: canastras({ limpa: 1 }), batida: true })),
    ).toBe(500)
  })

  it('penalidade do morto se aplica somente quando pegouMorto = false', () => {
    expect(totalLado(lado({ baixadas: 300, pegouMorto: true }))).toBe(300)
    expect(totalLado(lado({ baixadas: 300, pegouMorto: false }))).toBe(200)
  })

  it('cartas na mao subtraem', () => {
    // 300 - (2 ases + 1 rei = 40) = 260
    expect(totalLado(lado({ baixadas: 300, mao: { A: 2, K: 1 } }))).toBe(260)
  })

  it('rodada PODE SER NEGATIVA: sem morto mais cartas na mao', () => {
    // 0 - 100 (morto) - 40 (mao) = -140
    expect(totalLado(lado({ pegouMorto: false, mao: { A: 2, K: 1 } }))).toBe(-140)
  })

  it('rodada completa, com todos os termos da formula', () => {
    // baixadas: 3 ases (45) + 5 reis (50) + 4 setes (20) = 115
    // canastras: limpa (200) + suja (100)                = 300
    // batida                                             = +100
    // sem morto                                          = -100
    // mao: 1 as                                          = -15
    //                                                      = 400
    expect(
      totalLado(
        lado({
          baixadas: { A: 3, K: 5, '7': 4 },
          canastras: canastras({ limpa: 1, suja: 1 }),
          batida: true,
          pegouMorto: false,
          mao: { A: 1 },
        }),
      ),
    ).toBe(400)
  })

  it('canastra de mil domina o placar', () => {
    expect(totalLado(lado({ canastras: canastras({ mil: 1 }) }))).toBe(1000)
  })
})

describe('totalRodada', () => {
  it('pega o lado da equipe pedida', () => {
    const r = rodada(1, {
      a: { baixadas: 250, batida: true },
      b: { baixadas: 80, pegouMorto: false },
    })
    expect(totalRodada(r, 'a')).toBe(350)
    expect(totalRodada(r, 'b')).toBe(-20)
  })

  it('equipe ausente da rodada = 0', () => {
    expect(totalRodada(rodada(1, { a: { baixadas: 100 } }), 'b')).toBe(0)
  })
})
