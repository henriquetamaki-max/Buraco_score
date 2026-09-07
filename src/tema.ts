/** Tema claro/escuro. Default claro, escolha persistida por navegador. */

import { useEffect, useState } from 'react'

export type Tema = 'claro' | 'escuro'

const CHAVE = 'placar-buraco:tema'

function inicial(): Tema {
  try {
    const salvo = localStorage.getItem(CHAVE)
    if (salvo === 'claro' || salvo === 'escuro') return salvo
  } catch {
    // storage bloqueado: cai no default
  }
  return 'claro'
}

export function useTema(): [Tema, () => void] {
  const [tema, setTema] = useState<Tema>(inicial)

  useEffect(() => {
    document.documentElement.dataset['tema'] = tema
    try {
      localStorage.setItem(CHAVE, tema)
    } catch {
      // sem persistência: o tema vale só nesta sessão
    }
  }, [tema])

  return [tema, () => setTema((t) => (t === 'claro' ? 'escuro' : 'claro'))]
}
