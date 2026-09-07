import { describe, expect, it } from 'vitest'
import {
  acumuladoPartida,
  partidaTerminou,
  placarPartida,
  vencedorPartida,
} from '../placar'
import { novaPartida, novoTorneio, rodada } from '../fabricas'

describe('acumuladoPartida', () => {
  const p = novaPartida(1, [
    rodada(1, { a: { baixadas: 500 }, b: { baixadas: 200 } }),
    rodada(2, { a: { baixadas: 300, batida: true }, b: { baixadas: 100, pegouMorto: false } }),
  ])

  it('soma as rodadas', () => {
    expect(acumuladoPartida(p, 'a')).toBe(900) // 500 + 400
    expect(acumuladoPartida(p, 'b')).toBe(200) // 200 + 0
  })

  it('ateRodada corta o acumulado no indice pedido', () => {
    expect(acumuladoPartida(p, 'a', 0)).toBe(500)
    expect(acumuladoPartida(p, 'a', 1)).toBe(900)
  })

  it('partida sem rodadas = 0', () => {
    expect(acumuladoPartida(novaPartida(), 'a')).toBe(0)
  })

  it('o acumulado CAI quando a rodada e negativa', () => {
    const q = novaPartida(1, [
      rodada(1, { a: { baixadas: 800 } }),
      rodada(2, { a: { pegouMorto: false, mao: { A: 4 } } }), // -100 - 60 = -160
    ])
    expect(acumuladoPartida(q, 'a', 0)).toBe(800)
    expect(acumuladoPartida(q, 'a')).toBe(640)
  })
})

describe('vencedorPartida', () => {
  const t = novoTorneio({ alvoPartida: 3000 })

  it('null antes de alguem alcancar o alvo', () => {
    const p = novaPartida(1, [rodada(1, { a: { baixadas: 2500 }, b: { baixadas: 900 } })])
    expect(vencedorPartida(t, p)).toBeNull()
    expect(partidaTerminou(t, p)).toBe(false)
  })

  it('null em partida sem rodadas', () => {
    expect(vencedorPartida(t, novaPartida())).toBeNull()
  })

  it('vence quem passa do alvo', () => {
    const p = novaPartida(1, [
      rodada(1, { a: { baixadas: 2900 }, b: { baixadas: 1000 } }),
      rodada(2, { a: { baixadas: 250, batida: true }, b: { baixadas: 100 } }),
    ])
    expect(acumuladoPartida(p, 'a')).toBe(3250)
    expect(vencedorPartida(t, p)).toBe('a')
    expect(partidaTerminou(t, p)).toBe(true)
  })

  it('atingir o alvo exato tambem vence', () => {
    const p = novaPartida(1, [rodada(1, { a: { baixadas: 3000 }, b: { baixadas: 500 } })])
    expect(vencedorPartida(t, p)).toBe('a')
  })

  it('NAO vence se o morto e as cartas na mao derrubarem abaixo do alvo', () => {
    // baixou 250, que sozinhos passariam de 3000 — mas -100 do morto e -100 da mao seguram.
    // É o bug que a arquitetura existe para impedir: avaliar o alvo SÓ ao fim da rodada.
    const p = novaPartida(1, [
      rodada(1, { a: { baixadas: 2900 }, b: { baixadas: 1000 } }),
      rodada(2, { a: { baixadas: 250, pegouMorto: false, mao: { K: 10 } }, b: { baixadas: 100 } }),
    ])
    expect(acumuladoPartida(p, 'a')).toBe(2950)
    expect(vencedorPartida(t, p)).toBeNull()
  })

  it('empate exato acima do alvo vai para rodada de desempate', () => {
    const p = novaPartida(1, [rodada(1, { a: { baixadas: 3000 }, b: { baixadas: 3000 } })])
    expect(vencedorPartida(t, p)).toBeNull()
  })

  it('empate no topo mas com um terceiro atras nao impede o desempate', () => {
    const t3 = novoTorneio({
      alvoPartida: 3000,
      equipes: [
        { id: 'a', nome: 'Nós', jogadores: [] },
        { id: 'b', nome: 'Eles', jogadores: [] },
        { id: 'c', nome: 'Elas', jogadores: [] },
      ],
    })
    const p = novaPartida(1, [
      rodada(1, { a: { baixadas: 3100 }, b: { baixadas: 3100 }, c: { baixadas: 500 } }),
    ])
    expect(vencedorPartida(t3, p)).toBeNull()
  })
})

describe('placarPartida', () => {
  it('ordena por total desc e traz o historico rodada a rodada', () => {
    const t = novoTorneio()
    const p = novaPartida(1, [
      rodada(1, { a: { baixadas: 300 }, b: { baixadas: 700 } }),
      rodada(2, { a: { baixadas: 900 }, b: { baixadas: 100 } }),
    ])
    const placar = placarPartida(t, p)
    expect(placar.map((l) => l.equipeId)).toEqual(['a', 'b'])
    expect(placar[0]).toMatchObject({ nome: 'Nós', total: 1200, porRodada: [300, 900] })
    expect(placar[1]).toMatchObject({ nome: 'Eles', total: 800, porRodada: [700, 100] })
  })

  it('partida sem rodadas: todos zerados, ordem pelo nome', () => {
    const placar = placarPartida(novoTorneio(), novaPartida())
    expect(placar.map((l) => l.nome)).toEqual(['Eles', 'Nós'])
    expect(placar.every((l) => l.total === 0 && l.porRodada.length === 0)).toBe(true)
  })
})

describe('derivado, nunca armazenado', () => {
  it('corrigir uma rodada passada recalcula o acumulado, sem nenhum recompute explicito', () => {
    const t = novoTorneio()
    const p = novaPartida(1, [
      rodada(1, { a: { baixadas: 500 } }),
      rodada(2, { a: { baixadas: 400 } }),
    ])
    expect(acumuladoPartida(p, 'a')).toBe(900)

    // jogador contesta a rodada 1: eram 250 baixados, nao 500
    p.rodadas[0]!.porEquipe['a']!.baixadas = 250

    expect(acumuladoPartida(p, 'a')).toBe(650)
    expect(placarPartida(t, p)[0]).toMatchObject({ total: 650, porRodada: [250, 400] })
  })

  it('apagar uma rodada tambem recalcula', () => {
    const p = novaPartida(1, [
      rodada(1, { a: { baixadas: 500 } }),
      rodada(2, { a: { baixadas: 400 } }),
    ])
    p.rodadas.splice(1, 1)
    expect(acumuladoPartida(p, 'a')).toBe(500)
  })
})
