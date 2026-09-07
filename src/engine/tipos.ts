/**
 * Tipos do domínio — BURACO / CANASTRA.
 *
 * Fonte da verdade é a árvore `torneio -> partidas[] -> rodadas[]`.
 * NENHUM total é armazenado: os três níveis de acumulado são função pura dela.
 * Ver DECISOES.md (2026-09-07, "Placar acumulado é derivado das rodadas").
 *
 * Cacheta está fora de escopo por decisão de 2026-09-07 — as regras seguem
 * documentadas em MEMORIA.md caso volte.
 */

/**
 * Rank de uma carta. `'2'` vale como curinga por regra do buraco;
 * `'curinga'` é o joker impresso. Naipe não existe aqui de propósito:
 * a pontuação não depende dele (DECISOES.md, "Modelo de 14 classes").
 */
export type Rank =
  | 'A' | '2' | '3' | '4' | '5' | '6' | '7'
  | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'curinga'

/** Quantas cartas de cada rank. É exatamente o que a câmera (F2) produz. */
export type Contagem = Partial<Record<Rank, number>>

/**
 * Cartas contadas uma a uma (`Contagem`) ou o total em pontos digitado direto (`number`).
 * A união existe para a câmera e a digitação rápida usarem o mesmo motor.
 */
export type Cartas = Contagem | number

/** Fixas no torneio, não na partida — duplas fixas a noite toda (confirmado 2026-09-07). */
export type Equipe = {
  id: string
  nome: string
  jogadores: string[]
}

export type Canastras = {
  limpa: number
  suja: number
  /** Ás→Rei, 13 cartas. */
  as500: number
  /** Ás→Ás, 14 cartas. */
  mil: number
}

/** O que UMA equipe fez em UMA rodada. */
export type LadoBuraco = {
  /** Cartas baixadas na mesa, sem os bônus de canastra. */
  baixadas: Cartas
  canastras: Canastras
  /** Bateu nesta rodada: +100. */
  batida: boolean
  /** Pegou o morto. Se `false`: -100. */
  pegouMorto: boolean
  /** Cartas que sobraram na mão: subtraem. */
  mao: Cartas
}

/** Uma mão, do embaralhar até alguém bater. */
export type Rodada = {
  n: number
  porEquipe: Record<string, LadoBuraco>
}

/** Não tem `equipes` nem `id`: toda partida vive dentro de um torneio (DECISOES.md). */
export type Partida = {
  n: number
  rodadas: Rodada[]
  status: 'em_andamento' | 'encerrada'
}

export type Torneio = {
  id: string
  nome: string
  /** AAAA-MM-DD */
  criadoEm: string
  equipes: Equipe[]
  /** Pontos para encerrar uma partida. Default 3000. */
  alvoPartida: number
  formato: 'aberto' | 'melhor_de'
  /** Só em `formato: 'melhor_de'`. 3, 5, 7... encerra na maioria simples. */
  melhorDe?: number
  partidas: Partida[]
  status: 'em_andamento' | 'encerrado'
}

/** Uma linha do placar de uma partida — a "folha de papel" da mesa. */
export type LinhaPlacar = {
  equipeId: string
  nome: string
  /** Pontos acumulados na partida. Pode ser negativo. */
  total: number
  /** Total de cada rodada, na ordem. */
  porRodada: number[]
}

/** Uma linha da classificação do torneio — as DUAS métricas juntas. */
export type LinhaClassificacao = {
  equipeId: string
  nome: string
  /** Métrica 1 (primária): quantas partidas esta equipe ganhou. */
  partidasGanhas: number
  /** Métrica 2 (desempate): soma dos acumulados de todas as partidas. */
  somaPontos: number
  /** O acumulado de cada partida, na ordem. */
  porPartida: number[]
}
