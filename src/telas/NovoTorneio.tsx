import { useState } from 'react'
import type { Torneio } from '../engine'
import { ALVO_BURACO_PADRAO, equipe } from '../engine'
import { hoje, novoId } from '../util'

type Props = {
  onCriar: (t: Torneio) => void
}

export function NovoTorneio({ onCriar }: Props) {
  const [nome, setNome] = useState('')
  const [nomes, setNomes] = useState<string[]>(['Nós', 'Eles'])
  const [alvo, setAlvo] = useState(ALVO_BURACO_PADRAO)
  const [formato, setFormato] = useState<'aberto' | 'melhor_de'>('aberto')
  const [melhorDe, setMelhorDe] = useState(3)

  const limpos = nomes.map((n) => n.trim()).filter((n) => n.length > 0)
  const repetido = new Set(limpos).size !== limpos.length
  const podeCriar = limpos.length >= 2 && !repetido && alvo > 0

  function trocarNome(i: number, valor: string) {
    setNomes((atual) => atual.map((n, idx) => (idx === i ? valor : n)))
  }

  function criar() {
    const torneio: Torneio = {
      id: novoId(),
      nome: nome.trim().length > 0 ? nome.trim() : `Noite de ${hoje()}`,
      criadoEm: hoje(),
      equipes: limpos.map((n, i) => equipe(`e${i + 1}`, n)),
      alvoPartida: alvo,
      formato,
      ...(formato === 'melhor_de' ? { melhorDe } : {}),
      partidas: [],
      status: 'em_andamento',
    }
    onCriar(torneio)
  }

  return (
    <main>
      <div className="cartao">
        <h2>A noite</h2>
        <label className="campo">
          <span>Nome (opcional)</span>
          <input
            type="text"
            value={nome}
            placeholder={`Noite de ${hoje()}`}
            onChange={(e) => setNome(e.target.value)}
          />
        </label>
        <label className="campo">
          <span>Pontos para encerrar cada partida</span>
          <input
            type="number"
            inputMode="numeric"
            min={100}
            step={100}
            value={alvo}
            onChange={(e) => setAlvo(Math.max(100, Number(e.target.value) || 0))}
          />
        </label>
      </div>

      <div className="cartao">
        <h2>Duplas</h2>
        <p className="ajuda" style={{ marginBottom: '0.7rem' }}>
          As duplas ficam fixas a noite toda — é o que permite somar as partidas entre si.
        </p>
        {nomes.map((n, i) => (
          <div className="linha" key={i} style={{ marginBottom: '0.5rem' }}>
            <label className="campo cresce" style={{ marginBottom: 0 }}>
              <span>Dupla {i + 1}</span>
              <input
                type="text"
                value={n}
                onChange={(e) => trocarNome(i, e.target.value)}
                placeholder={`Dupla ${i + 1}`}
              />
            </label>
            {nomes.length > 2 && (
              <button
                type="button"
                className="botao pequeno"
                style={{ marginTop: '1.1rem' }}
                onClick={() => setNomes((atual) => atual.filter((_, idx) => idx !== i))}
                aria-label={`Remover a dupla ${i + 1}`}
              >
                Remover
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="botao pequeno"
          onClick={() => setNomes((atual) => [...atual, ''])}
        >
          Mais uma dupla
        </button>
        {repetido && (
          <p className="ajuda" style={{ marginTop: '0.6rem', color: 'var(--negativo)' }}>
            Tem dupla com nome repetido — o placar não conseguiria separar as duas.
          </p>
        )}
      </div>

      <div className="cartao">
        <h2>Formato</h2>
        <div className="abas">
          <button
            type="button"
            aria-pressed={formato === 'aberto'}
            onClick={() => setFormato('aberto')}
          >
            Joga até parar
          </button>
          <button
            type="button"
            aria-pressed={formato === 'melhor_de'}
            onClick={() => setFormato('melhor_de')}
          >
            Melhor de N
          </button>
        </div>
        {formato === 'melhor_de' ? (
          <label className="campo" style={{ marginTop: '0.7rem' }}>
            <span>Melhor de quantas partidas</span>
            <select value={melhorDe} onChange={(e) => setMelhorDe(Number(e.target.value))}>
              <option value={3}>3 (vence com 2)</option>
              <option value={5}>5 (vence com 3)</option>
              <option value={7}>7 (vence com 4)</option>
            </select>
          </label>
        ) : (
          <p className="ajuda" style={{ marginTop: '0.7rem' }}>
            Sem número fixo de partidas. A classificação mostra quem está ganhando a noite.
          </p>
        )}
      </div>

      <button type="button" className="botao principal largo" disabled={!podeCriar} onClick={criar}>
        Criar a noite
      </button>
    </main>
  )
}
