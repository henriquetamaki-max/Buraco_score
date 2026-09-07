import { describe, expect, it } from 'vitest'
import type { Partida } from '../tipos'
import { classificacaoTorneio, vencedorTorneio } from '../placar'
import { equipe, novaPartida, novoTorneio, rodada } from '../fabricas'

/** Partida já decidida numa rodada: o vencedor bate 3000, o outro fica com `perdedorPontos`. */
function partidaDecidida(
  n: number,
  vencedorId: string,
  perdedorId: string,
  perdedorPontos: number,
): Partida {
  return novaPartida(n, [
    rodada(n, { [vencedorId]: { baixadas: 3000 }, [perdedorId]: { baixadas: perdedorPontos } }),
  ])
}

describe('classificacaoTorneio', () => {
  it('conta partidas ganhas E soma os pontos, as duas metricas juntas', () => {
    const t = novoTorneio({
      partidas: [partidaDecidida(1, 'a', 'b', 1200), partidaDecidida(2, 'b', 'a', 800)],
    })
    const c = classificacaoTorneio(t)

    // 1 a 1 em partidas ganhas -> desempata pela soma de pontos
    // a: 3000 + 800 = 3800 | b: 1200 + 3000 = 4200
    expect(c).toHaveLength(2)
    expect(c[0]).toMatchObject({ equipeId: 'b', partidasGanhas: 1, somaPontos: 4200 })
    expect(c[1]).toMatchObject({ equipeId: 'a', partidasGanhas: 1, somaPontos: 3800 })
  })

  it('partidas ganhas tem prioridade sobre soma de pontos', () => {
    const t = novoTorneio({
      partidas: [
        partidaDecidida(1, 'a', 'b', 2900),
        partidaDecidida(2, 'a', 'b', 2900),
        partidaDecidida(3, 'b', 'a', 0),
      ],
    })
    const c = classificacaoTorneio(t)

    // a ganhou 2 partidas com 6000 pontos; b ganhou 1 com 8800.
    // Quem lidera e o 'a' — partidas ganhas manda.
    expect(c[0]).toMatchObject({ equipeId: 'a', partidasGanhas: 2, somaPontos: 6000 })
    expect(c[1]).toMatchObject({ equipeId: 'b', partidasGanhas: 1, somaPontos: 8800 })
  })

  it('inclui a partida em andamento na soma de pontos', () => {
    const t = novoTorneio({
      partidas: [
        partidaDecidida(1, 'a', 'b', 500),
        novaPartida(2, [rodada(1, { b: { baixadas: 700 } })]),
      ],
    })
    const b = classificacaoTorneio(t).find((l) => l.equipeId === 'b')
    expect(b).toMatchObject({ partidasGanhas: 0, somaPontos: 1200, porPartida: [500, 700] })
  })

  it('torneio sem partidas: todo mundo zerado', () => {
    const c = classificacaoTorneio(novoTorneio())
    expect(c.every((l) => l.partidasGanhas === 0 && l.somaPontos === 0)).toBe(true)
  })

  it('ordem e deterministica no empate total: cai no nome', () => {
    const t = novoTorneio({ equipes: [equipe('z', 'Zebras'), equipe('c', 'Corujas')] })
    expect(classificacaoTorneio(t).map((l) => l.nome)).toEqual(['Corujas', 'Zebras'])
  })
})

describe('vencedorTorneio', () => {
  it('formato aberto nunca tem vencedor de torneio: joga ate parar', () => {
    const t = novoTorneio({
      formato: 'aberto',
      partidas: [partidaDecidida(1, 'a', 'b', 0), partidaDecidida(2, 'a', 'b', 0)],
    })
    expect(vencedorTorneio(t)).toBeNull()
  })

  it('melhor de 3: vence com 2 partidas', () => {
    const uma = novoTorneio({
      formato: 'melhor_de',
      melhorDe: 3,
      partidas: [partidaDecidida(1, 'a', 'b', 0)],
    })
    expect(vencedorTorneio(uma)).toBeNull()

    const duas = novoTorneio({
      formato: 'melhor_de',
      melhorDe: 3,
      partidas: [partidaDecidida(1, 'a', 'b', 0), partidaDecidida(2, 'a', 'b', 0)],
    })
    expect(vencedorTorneio(duas)).toBe('a')
  })

  it('melhor de 5: vence com 3 partidas', () => {
    const partidas = [partidaDecidida(1, 'a', 'b', 0), partidaDecidida(2, 'a', 'b', 0)]
    const t = novoTorneio({ formato: 'melhor_de', melhorDe: 5, partidas })
    expect(vencedorTorneio(t)).toBeNull()

    partidas.push(partidaDecidida(3, 'a', 'b', 0))
    expect(vencedorTorneio(t)).toBe('a')
  })

  it('melhor_de sem melhorDe definido = null', () => {
    const t = novoTorneio({ formato: 'melhor_de', partidas: [partidaDecidida(1, 'a', 'b', 0)] })
    expect(vencedorTorneio(t)).toBeNull()
  })
})
