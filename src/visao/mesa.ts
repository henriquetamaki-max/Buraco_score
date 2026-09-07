/**
 * Leitura da mesa — transforma detecções de cartas em JOGOS baixados.
 *
 * É a ponte entre a câmera (F2) e o formulário da rodada que já existe: a saída
 * de `lerMesa` preenche exatamente os campos `baixadas` e `canastras` de um
 * `LadoBuraco`. A mão NÃO entra aqui — segue manual, por decisão de escopo.
 *
 * Nada neste arquivo depende de câmera, de modelo ou do DOM. É função pura de
 * uma lista de detecções, então dá para testar inteiro sem hardware.
 *
 * Duas premissas que vêm do jogo, não da visão:
 *
 * 1. Jogos ficam FISICAMENTE SEPARADOS na mesa. Por isso o agrupamento sai da
 *    posição das caixas na imagem — não é preciso ler naipe para saber o que é
 *    sequência, o que já mantém o modelo em 14 classes.
 * 2. Cartas de um mesmo jogo ficam em escada, sobrepostas, mostrando só o canto
 *    superior-esquerdo. A distância entre cartas vizinhas do mesmo jogo é uma
 *    fração da largura da carta; entre jogos diferentes há vão visível.
 */

import type { Canastras, Contagem, Rank } from '../engine'
import { CANASTRAS_ZERO, VALOR_CARTA } from '../engine'

export type Caixa = {
  /** Canto superior-esquerdo, em coordenadas normalizadas 0..1 da imagem. */
  x: number
  y: number
  largura: number
  altura: number
}

export type Deteccao = {
  rank: Rank
  caixa: Caixa
  /** 0..1, saída do detector. */
  confianca: number
}

export type TipoJogo = 'incompleto' | 'limpa' | 'suja' | 'as500' | 'mil'

export type Jogo = {
  /** Na ordem em que aparecem na escada, da esquerda para a direita. */
  ranks: Rank[]
  pontosCartas: number
  /** Curingas certos: joker impresso, ou `2` fora de posição natural. */
  curingas: number
  /** `2` que pode ser carta natural da sequência. Quem decide é o jogador. */
  doisAmbiguos: number
  tipo: TipoJogo
  /** Menor confiança entre as cartas do jogo. */
  confiancaMinima: number
  precisaConferir: boolean
}

export type LeituraDaMesa = {
  jogos: Jogo[]
  /** Entra direto em `LadoBuraco.baixadas`. */
  baixadas: Contagem
  /** Entra direto em `LadoBuraco.canastras`. */
  canastras: Canastras
  precisaConferir: boolean
}

/** Multiplicador da largura mediana da carta usado como corte do agrupamento. */
export const FATOR_DISTANCIA_PADRAO = 1.6

/** Confiança abaixo da qual o jogo vai marcado para conferência humana. */
export const CONFIANCA_MINIMA = 0.55

/** Cartas para fechar canastra. */
export const CARTAS_PARA_CANASTRA = 7

/** Ordem do rank numa sequência. O ás vale 1 aqui; o caso ás-alto é tratado à parte. */
const ORDEM: Record<Rank, number> = {
  A: 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  J: 11,
  Q: 12,
  K: 13,
  curinga: 0,
}

const AS_A_REI: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

function centro(c: Caixa): { x: number; y: number } {
  return { x: c.x + c.largura / 2, y: c.y + c.altura / 2 }
}

function distancia(a: Caixa, b: Caixa): number {
  const ca = centro(a)
  const cb = centro(b)
  return Math.hypot(ca.x - cb.x, ca.y - cb.y)
}

function mediana(valores: number[]): number {
  if (valores.length === 0) return 0
  const ordenado = [...valores].sort((x, y) => x - y)
  const meio = Math.floor(ordenado.length / 2)
  if (ordenado.length % 2 === 1) return ordenado[meio] ?? 0
  return ((ordenado[meio - 1] ?? 0) + (ordenado[meio] ?? 0)) / 2
}

/**
 * Agrupa detecções em jogos por proximidade (ligação simples).
 *
 * Duas cartas entram no mesmo jogo se a distância entre os centros for menor que
 * `fator` vezes a largura mediana das cartas detectadas. Usar a mediana em vez de
 * um valor fixo faz o corte acompanhar a distância da câmera à mesa sozinho.
 */
export function agruparEmJogos(
  deteccoes: Deteccao[],
  fator: number = FATOR_DISTANCIA_PADRAO,
): Deteccao[][] {
  if (deteccoes.length === 0) return []

  const corte = fator * mediana(deteccoes.map((d) => d.caixa.largura))
  const visitado = new Array<boolean>(deteccoes.length).fill(false)
  const grupos: Deteccao[][] = []

  for (let i = 0; i < deteccoes.length; i++) {
    if (visitado[i] === true) continue

    // busca em largura sobre o grafo de vizinhança
    const grupo: Deteccao[] = []
    const fila = [i]
    visitado[i] = true

    while (fila.length > 0) {
      const atual = fila.pop()
      if (atual === undefined) break
      const carta = deteccoes[atual]
      if (carta === undefined) continue
      grupo.push(carta)

      for (let j = 0; j < deteccoes.length; j++) {
        if (visitado[j] === true) continue
        const outra = deteccoes[j]
        if (outra === undefined) continue
        if (distancia(carta.caixa, outra.caixa) <= corte) {
          visitado[j] = true
          fila.push(j)
        }
      }
    }

    grupos.push(grupo)
  }

  // ordena os jogos pela posição na mesa, para a tela listar na ordem que se vê
  return grupos.sort((a, b) => (a[0]?.caixa.x ?? 0) - (b[0]?.caixa.x ?? 0))
}

/** Mesmo multiconjunto de ranks, sem olhar ordem. */
function mesmasCartas(ranks: Rank[], alvo: Rank[]): boolean {
  if (ranks.length !== alvo.length) return false
  const conta = (lista: Rank[]) => {
    const m = new Map<Rank, number>()
    for (const r of lista) m.set(r, (m.get(r) ?? 0) + 1)
    return m
  }
  const a = conta(ranks)
  const b = conta(alvo)
  for (const [rank, qtd] of b) if (a.get(rank) !== qtd) return false
  return true
}

/**
 * Um `2` é ambíguo quando pode ser carta natural da sequência — isto é, quando
 * existe um `A` ou um `3` no mesmo jogo, que é onde o 2 se encaixaria.
 * Fora disso, ele só pode estar ali como curinga.
 *
 * A distinção não é decidida aqui: o jogo vai marcado para o jogador conferir,
 * porque limpa (200) e suja (100) dependem exatamente disso.
 */
function classificarDois(ranks: Rank[]): { curingas: number; ambiguos: number } {
  const dois = ranks.filter((r) => r === '2').length
  if (dois === 0) return { curingas: 0, ambiguos: 0 }

  const podeSerNatural = ranks.includes('A') || ranks.includes('3')
  return podeSerNatural ? { curingas: 0, ambiguos: dois } : { curingas: dois, ambiguos: 0 }
}

/** Classifica um grupo já agrupado em um jogo com pontos e tipo. */
export function classificarJogo(cartas: Deteccao[]): Jogo {
  const emOrdem = [...cartas].sort(
    (a, b) => a.caixa.x - b.caixa.x || a.caixa.y - b.caixa.y,
  )
  const ranks = emOrdem.map((d) => d.rank)

  const pontosCartas = ranks.reduce((soma, r) => soma + (VALOR_CARTA[r] ?? 0), 0)
  const jokers = ranks.filter((r) => r === 'curinga').length
  const { curingas: doisCuringa, ambiguos } = classificarDois(ranks)
  const curingas = jokers + doisCuringa

  let tipo: TipoJogo = 'incompleto'
  if (ranks.length === 14 && mesmasCartas(ranks, [...AS_A_REI, 'A'])) tipo = 'mil'
  else if (ranks.length === 13 && mesmasCartas(ranks, AS_A_REI)) tipo = 'as500'
  else if (ranks.length >= CARTAS_PARA_CANASTRA) tipo = curingas > 0 ? 'suja' : 'limpa'

  const confiancaMinima = emOrdem.reduce((menor, d) => Math.min(menor, d.confianca), 1)

  return {
    ranks,
    pontosCartas,
    curingas,
    doisAmbiguos: ambiguos,
    tipo,
    confiancaMinima,
    // Ambiguidade de curinga muda limpa (200) para suja (100): sempre confere.
    precisaConferir: ambiguos > 0 || confiancaMinima < CONFIANCA_MINIMA,
  }
}

/**
 * Lê a mesa inteira de UMA dupla e devolve o que preencher no formulário.
 * `baixadas` e `canastras` entram direto no `LadoBuraco` — a batida, o morto e
 * as cartas na mão continuam manuais.
 */
export function lerMesa(
  deteccoes: Deteccao[],
  fator: number = FATOR_DISTANCIA_PADRAO,
): LeituraDaMesa {
  const jogos = agruparEmJogos(deteccoes, fator).map(classificarJogo)

  const baixadas: Contagem = {}
  for (const jogo of jogos) {
    for (const rank of jogo.ranks) baixadas[rank] = (baixadas[rank] ?? 0) + 1
  }

  const canastras: Canastras = { ...CANASTRAS_ZERO }
  for (const jogo of jogos) {
    if (jogo.tipo === 'limpa') canastras.limpa += 1
    else if (jogo.tipo === 'suja') canastras.suja += 1
    else if (jogo.tipo === 'as500') canastras.as500 += 1
    else if (jogo.tipo === 'mil') canastras.mil += 1
  }

  return {
    jogos,
    baixadas,
    canastras,
    precisaConferir: jogos.some((j) => j.precisaConferir),
  }
}

/** Exposto para a sobreposição da câmera desenhar as cartas na ordem certa. */
export function ordemDoRank(rank: Rank): number {
  return ORDEM[rank] ?? 0
}
