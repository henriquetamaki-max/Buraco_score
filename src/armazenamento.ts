/**
 * Persistência em `localStorage`. Sem conta, sem servidor, sem rede.
 *
 * Todo acesso é embrulhado em try/catch: aba privada, storage bloqueado por
 * política do navegador ou JSON corrompido não podem derrubar o app no meio de
 * uma partida — o pior caso é a noite começar vazia.
 */

import type { Torneio } from './engine'

const CHAVE = 'placar-buraco:v1'

export type Estado = {
  torneios: Torneio[]
  /** id do torneio aberto, ou `null` na tela inicial. */
  ativo: string | null
}

export const ESTADO_VAZIO: Estado = { torneios: [], ativo: null }

export function carregar(): Estado {
  try {
    const bruto = localStorage.getItem(CHAVE)
    if (bruto === null) return ESTADO_VAZIO

    const dado = JSON.parse(bruto) as Partial<Estado>
    if (!Array.isArray(dado.torneios)) return ESTADO_VAZIO

    return { torneios: dado.torneios, ativo: dado.ativo ?? null }
  } catch {
    return ESTADO_VAZIO
  }
}

export function salvar(estado: Estado): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado))
  } catch {
    // storage cheio ou bloqueado: o app segue em memória até fechar a aba
  }
}
