/**
 * Camada de derivados — os TRÊS níveis de acumulado.
 *
 *   Torneio (a noite)      -> partidas ganhas + soma de pontos
 *     Partida (até o alvo) -> acumulado por equipe
 *       Rodada (uma mão)   -> total da rodada por equipe
 *
 * Tudo aqui é FUNÇÃO PURA da árvore do torneio. Nada é armazenado, então editar
 * ou apagar uma rodada passada recalcula os três níveis de graça — que é o caso
 * de uso central (jogador contesta a rodada 3 no meio da partida).
 */

import type { LinhaClassificacao, LinhaPlacar, Partida, Torneio } from './tipos'
import { totalRodada } from './rodada'

/**
 * Pontos acumulados de uma equipe numa partida. Pode ser negativo.
 *
 * @param ateRodada índice 0-based da última rodada incluída. Omitido = partida inteira.
 */
export function acumuladoPartida(
  partida: Partida,
  equipeId: string,
  ateRodada?: number,
): number {
  const ultima = ateRodada === undefined ? partida.rodadas.length - 1 : ateRodada
  let total = 0
  for (let i = 0; i <= ultima && i < partida.rodadas.length; i++) {
    const rodada = partida.rodadas[i]
    if (rodada === undefined) continue
    total += totalRodada(rodada, equipeId)
  }
  return total
}

/** Ordem do placar: maior total primeiro; nome como desempate para ser determinístico. */
function ordenaPlacar(a: LinhaPlacar, b: LinhaPlacar): number {
  return b.total - a.total || a.nome.localeCompare(b.nome, 'pt-BR')
}

/** O placar de uma partida — a "folha de papel" da mesa, uma coluna por rodada. */
export function placarPartida(torneio: Torneio, partida: Partida): LinhaPlacar[] {
  return torneio.equipes
    .map((equipe): LinhaPlacar => {
      const porRodada = partida.rodadas.map((r) => totalRodada(r, equipe.id))
      return {
        equipeId: equipe.id,
        nome: equipe.nome,
        total: porRodada.reduce((a, b) => a + b, 0),
        porRodada,
      }
    })
    .sort(ordenaPlacar)
}

/**
 * Vencedor da partida, ou `null` se ela não terminou.
 *
 * Avaliado SÓ AO FIM DA RODADA, nunca no instante em que o alvo é cruzado: a penalidade
 * do morto e as cartas que sobraram na mão podem derrubar quem já tinha passado de 3000.
 * Empate exato no topo, acima do alvo, também devolve `null` — vai para rodada de desempate.
 */
export function vencedorPartida(torneio: Torneio, partida: Partida): string | null {
  if (partida.rodadas.length === 0) return null

  const placar = placarPartida(torneio, partida) // já ordenado por total desc
  const lider = placar[0]
  if (lider === undefined || lider.total < torneio.alvoPartida) return null

  const segundo = placar[1]
  if (segundo !== undefined && segundo.total === lider.total) return null

  return lider.equipeId
}

export function partidaTerminou(torneio: Torneio, partida: Partida): boolean {
  return vencedorPartida(torneio, partida) !== null
}

/**
 * Classificação do torneio com as DUAS métricas juntas.
 * Ordem: partidas ganhas (primária) -> soma de pontos (desempate) -> nome.
 *
 * `somaPontos` inclui a partida em andamento, para o placar ficar vivo durante a noite.
 */
export function classificacaoTorneio(torneio: Torneio): LinhaClassificacao[] {
  return torneio.equipes
    .map((equipe): LinhaClassificacao => {
      let partidasGanhas = 0
      const porPartida: number[] = []

      for (const partida of torneio.partidas) {
        porPartida.push(acumuladoPartida(partida, equipe.id))
        if (vencedorPartida(torneio, partida) === equipe.id) partidasGanhas++
      }

      return {
        equipeId: equipe.id,
        nome: equipe.nome,
        partidasGanhas,
        somaPontos: porPartida.reduce((a, b) => a + b, 0),
        porPartida,
      }
    })
    .sort(
      (a, b) =>
        b.partidasGanhas - a.partidasGanhas ||
        b.somaPontos - a.somaPontos ||
        a.nome.localeCompare(b.nome, 'pt-BR'),
    )
}

/** Vencedor do torneio. Só existe em `formato: 'melhor_de'` — 'aberto' joga até parar. */
export function vencedorTorneio(torneio: Torneio): string | null {
  if (torneio.formato !== 'melhor_de') return null

  const total = torneio.melhorDe
  if (total === undefined || total < 1) return null

  const necessarias = Math.floor(total / 2) + 1
  const lider = classificacaoTorneio(torneio)[0]
  return lider !== undefined && lider.partidasGanhas >= necessarias ? lider.equipeId : null
}
