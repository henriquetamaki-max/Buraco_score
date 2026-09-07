/** Construtores com defaults sãos. Usados pelos testes e, em F1, pela UI. */

import type { Canastras, Equipe, LadoBuraco, Partida, Rodada, Torneio } from './tipos'
import { ALVO_BURACO_PADRAO, CANASTRAS_ZERO } from './regras'
import { lado } from './rodada'

export function equipe(id: string, nome = id, jogadores: string[] = []): Equipe {
  return { id, nome, jogadores }
}

export function canastras(parcial: Partial<Canastras> = {}): Canastras {
  return { ...CANASTRAS_ZERO, ...parcial }
}

export function novaPartida(n = 1, rodadas: Rodada[] = []): Partida {
  return { n, rodadas, status: 'em_andamento' }
}

/** Preenche os lados omitidos com o lado zero, para o teste declarar só o que importa. */
export function rodada(n: number, porEquipe: Record<string, Partial<LadoBuraco>>): Rodada {
  const completo: Record<string, LadoBuraco> = {}
  for (const [id, parcial] of Object.entries(porEquipe)) completo[id] = lado(parcial)
  return { n, porEquipe: completo }
}

export function novoTorneio(parcial: Partial<Torneio> = {}): Torneio {
  return {
    id: parcial.id ?? 't1',
    nome: parcial.nome ?? 'Noite de jogo',
    criadoEm: parcial.criadoEm ?? '2026-09-07',
    equipes: parcial.equipes ?? [equipe('a', 'Nós'), equipe('b', 'Eles')],
    alvoPartida: parcial.alvoPartida ?? ALVO_BURACO_PADRAO,
    formato: parcial.formato ?? 'aberto',
    ...(parcial.melhorDe === undefined ? {} : { melhorDe: parcial.melhorDe }),
    partidas: parcial.partidas ?? [],
    status: parcial.status ?? 'em_andamento',
  }
}
