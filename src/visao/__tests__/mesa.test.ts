import { describe, expect, it } from 'vitest'
import type { Rank } from '../../engine'
import { lado, pontosDeCartas, totalLado } from '../../engine'
import type { Deteccao } from '../mesa'
import { agruparEmJogos, classificarJogo, lerMesa } from '../mesa'

/** Carta em coordenadas normalizadas. Valores realistas de um celular sobre a mesa. */
const LARGURA = 0.06
const ALTURA = 0.09
/** Cartas em escada se sobrepõem: o passo é bem menor que a largura da carta. */
const PASSO = 0.025

/** Monta um jogo em escada da esquerda para a direita. */
function escada(ranks: Rank[], x0: number, y0: number, confianca = 0.9): Deteccao[] {
  return ranks.map((rank, i) => ({
    rank,
    caixa: { x: x0 + i * PASSO, y: y0, largura: LARGURA, altura: ALTURA },
    confianca,
  }))
}

/** Mesmo jogo, mas empilhado para baixo — algumas mesas baixam assim. */
function escadaVertical(ranks: Rank[], x0: number, y0: number): Deteccao[] {
  return ranks.map((rank, i) => ({
    rank,
    caixa: { x: x0, y: y0 + i * PASSO, largura: LARGURA, altura: ALTURA },
    confianca: 0.9,
  }))
}

const CANASTRA_LIMPA: Rank[] = ['3', '4', '5', '6', '7', '8', '9']

describe('agruparEmJogos', () => {
  it('separa dois jogos distantes na mesa', () => {
    const deteccoes = [
      ...escada(CANASTRA_LIMPA, 0.05, 0.1),
      ...escada(['K', 'K', 'K'], 0.6, 0.1),
    ]
    const grupos = agruparEmJogos(deteccoes)
    expect(grupos).toHaveLength(2)
    expect(grupos[0]).toHaveLength(7)
    expect(grupos[1]).toHaveLength(3)
  })

  it('mantem junto o jogo baixado na vertical', () => {
    expect(agruparEmJogos(escadaVertical(CANASTRA_LIMPA, 0.2, 0.1))).toHaveLength(1)
  })

  it('tres jogos separados', () => {
    const grupos = agruparEmJogos([
      ...escada(['4', '5', '6'], 0.02, 0.1),
      ...escada(['9', '9', '9'], 0.4, 0.1),
      ...escada(['Q', 'Q', 'Q'], 0.8, 0.1),
    ])
    expect(grupos).toHaveLength(3)
  })

  it('carta sozinha vira um jogo; mesa vazia nao vira nada', () => {
    expect(agruparEmJogos(escada(['A'], 0.5, 0.5))).toHaveLength(1)
    expect(agruparEmJogos([])).toEqual([])
  })

  it('devolve os jogos na ordem em que aparecem na mesa', () => {
    const grupos = agruparEmJogos([
      ...escada(['Q', 'Q', 'Q'], 0.8, 0.1),
      ...escada(['4', '5', '6'], 0.02, 0.1),
    ])
    expect(grupos[0]?.[0]?.rank).toBe('4')
    expect(grupos[1]?.[0]?.rank).toBe('Q')
  })
})

describe('classificarJogo', () => {
  it('sete cartas sem curinga = canastra limpa', () => {
    const jogo = classificarJogo(escada(CANASTRA_LIMPA, 0.05, 0.1))
    expect(jogo.tipo).toBe('limpa')
    expect(jogo.curingas).toBe(0)
    expect(jogo.precisaConferir).toBe(false)
    // 3+4+5+6+7 valem 5 cada (25) e 8+9 valem 10 cada (20)
    expect(jogo.pontosCartas).toBe(45)
  })

  it('sete cartas com joker impresso = canastra suja', () => {
    const jogo = classificarJogo(escada(['3', '4', '5', '6', '7', '8', 'curinga'], 0.05, 0.1))
    expect(jogo.tipo).toBe('suja')
    expect(jogo.curingas).toBe(1)
  })

  it('menos de sete cartas nao fecha canastra', () => {
    expect(classificarJogo(escada(['K', 'K', 'K'], 0.05, 0.1)).tipo).toBe('incompleto')
    expect(classificarJogo(escada(CANASTRA_LIMPA.slice(0, 6), 0.05, 0.1)).tipo).toBe('incompleto')
  })

  it('o 2 sem As nem 3 por perto so pode ser curinga: suja', () => {
    const jogo = classificarJogo(escada(['5', '6', '7', '8', '9', '10', '2'], 0.05, 0.1))
    expect(jogo.curingas).toBe(1)
    expect(jogo.doisAmbiguos).toBe(0)
    expect(jogo.tipo).toBe('suja')
  })

  it('o 2 com As ou 3 no jogo e AMBIGUO e vai para conferencia humana', () => {
    // A,2,3,4,5,6,7: o 2 pode ser natural (limpa, 200) ou curinga (suja, 100).
    // A visao nao decide isso — propoe limpa e marca para conferir.
    const jogo = classificarJogo(escada(['A', '2', '3', '4', '5', '6', '7'], 0.05, 0.1))
    expect(jogo.doisAmbiguos).toBe(1)
    expect(jogo.curingas).toBe(0)
    expect(jogo.tipo).toBe('limpa')
    expect(jogo.precisaConferir).toBe(true)
  })

  it('As ao Rei com 13 cartas vale 500', () => {
    const jogo = classificarJogo(
      escada(['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'], 0.02, 0.1),
    )
    expect(jogo.tipo).toBe('as500')
  })

  it('As ao As com 14 cartas vale 1000', () => {
    const jogo = classificarJogo(
      escada(['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'], 0.02, 0.1),
    )
    expect(jogo.tipo).toBe('mil')
  })

  it('treze cartas que nao formam As ao Rei sao so canastra', () => {
    const jogo = classificarJogo(
      escada(['3', '3', '3', '3', '4', '4', '4', '4', '5', '5', '5', '5', '6'], 0.02, 0.1),
    )
    expect(jogo.tipo).toBe('limpa')
  })

  it('confianca baixa marca para conferencia', () => {
    const fraco = escada(CANASTRA_LIMPA, 0.05, 0.1, 0.4)
    const jogo = classificarJogo(fraco)
    expect(jogo.confiancaMinima).toBeCloseTo(0.4)
    expect(jogo.precisaConferir).toBe(true)
  })

  it('le a escada na ordem da esquerda para a direita', () => {
    const embaralhado = [...escada(['3', '4', '5'], 0.05, 0.1)].reverse()
    expect(classificarJogo(embaralhado).ranks).toEqual(['3', '4', '5'])
  })
})

describe('lerMesa', () => {
  it('devolve baixadas e canastras prontas para o formulario', () => {
    const leitura = lerMesa([
      ...escada(CANASTRA_LIMPA, 0.05, 0.1),
      ...escada(['K', 'K', 'K'], 0.6, 0.1),
    ])

    expect(leitura.jogos).toHaveLength(2)
    expect(leitura.canastras).toEqual({ limpa: 1, suja: 0, as500: 0, mil: 0 })
    expect(leitura.baixadas).toEqual({
      '3': 1, '4': 1, '5': 1, '6': 1, '7': 1, '8': 1, '9': 1, K: 3,
    })
    // a contagem devolvida vale o mesmo que a soma dos jogos
    expect(pontosDeCartas(leitura.baixadas)).toBe(45 + 30)
    expect(leitura.precisaConferir).toBe(false)
  })

  it('mesa vazia nao propoe nada', () => {
    const leitura = lerMesa([])
    expect(leitura.jogos).toEqual([])
    expect(leitura.baixadas).toEqual({})
    expect(leitura.canastras).toEqual({ limpa: 0, suja: 0, as500: 0, mil: 0 })
    expect(leitura.precisaConferir).toBe(false)
  })

  it('um jogo ambiguo contamina a conferencia da mesa inteira', () => {
    const leitura = lerMesa([
      ...escada(CANASTRA_LIMPA, 0.05, 0.1),
      ...escada(['A', '2', '3', '4', '5', '6', '7'], 0.6, 0.1),
    ])
    expect(leitura.precisaConferir).toBe(true)
  })

  it('a saida da camera encaixa no motor de pontuacao sem conversao', () => {
    // O ponto do F2: a leitura preenche `baixadas` e `canastras`; batida, morto
    // e cartas na mao continuam manuais.
    const leitura = lerMesa([
      ...escada(CANASTRA_LIMPA, 0.05, 0.1),
      ...escada(['K', 'K', 'K'], 0.6, 0.1),
    ])

    const total = totalLado(
      lado({
        baixadas: leitura.baixadas,
        canastras: leitura.canastras,
        batida: true,
        pegouMorto: true,
        mao: 0,
      }),
    )

    // 75 de cartas + 200 da canastra limpa + 100 da batida
    expect(total).toBe(375)
  })
})
