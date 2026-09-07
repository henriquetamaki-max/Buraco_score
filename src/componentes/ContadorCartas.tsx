import { useState } from 'react'
import type { Cartas, Contagem, Rank } from '../engine'
import { VALOR_CARTA, pontosDeCartas } from '../engine'

/**
 * Teclado de ranks. Toque no rank soma 1; toque na bolinha vermelha tira 1.
 *
 * Existem dois modos porque a mesma estrutura serve à câmera (F2) e ao dedo:
 * `Contagem` é o que o detector vai produzir, `number` é para quem já somou de cabeça.
 */

const RANKS: Rank[] = [
  'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'curinga',
]

const ROTULO: Record<Rank, string> = {
  A: 'A',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '10': '10',
  J: 'J',
  Q: 'Q',
  K: 'K',
  curinga: 'JK',
}

const NOME_LONGO: Record<Rank, string> = {
  ...ROTULO,
  A: 'ás',
  '2': 'dois (curinga)',
  J: 'valete',
  Q: 'dama',
  K: 'rei',
  curinga: 'curinga impresso',
}

type Props = {
  rotulo: string
  ajuda: string
  valor: Cartas
  onChange: (v: Cartas) => void
}

export function ContadorCartas({ rotulo, ajuda, valor, onChange }: Props) {
  /*
   * O modo é estado da UI, não pode ser derivado de `typeof valor`: o lado zero
   * do motor tem `baixadas: 0` (número), o que abria o componente em "Digitar o
   * total" quando o teclado é o caminho principal — e o que a câmera do F2 vai
   * alimentar. Só um valor numérico diferente de zero indica total já digitado.
   */
  const [modoTotal, setModoTotal] = useState(typeof valor === 'number' && valor !== 0)

  const contagem: Contagem = typeof valor === 'number' ? {} : valor
  const pontos = pontosDeCartas(valor)
  const quantidade = RANKS.reduce((soma, r) => soma + (contagem[r] ?? 0), 0)

  function ajustar(rank: Rank, delta: number) {
    const proximo = Math.max(0, (contagem[rank] ?? 0) + delta)
    const novo: Contagem = { ...contagem }
    if (proximo === 0) delete novo[rank]
    else novo[rank] = proximo
    onChange(novo)
  }

  return (
    <div>
      <p className="ajuda" style={{ marginBottom: '0.4rem' }}>
        <strong style={{ color: 'var(--fg)' }}>{rotulo}</strong> — {ajuda}
      </p>

      <div className="abas" style={{ marginBottom: '0.6rem' }}>
        <button
          type="button"
          aria-pressed={!modoTotal}
          onClick={() => {
            if (!modoTotal) return
            setModoTotal(false)
            onChange({})
          }}
        >
          Contar cartas
        </button>
        <button
          type="button"
          aria-pressed={modoTotal}
          onClick={() => {
            if (modoTotal) return
            setModoTotal(true)
            onChange(pontos)
          }}
        >
          Digitar o total
        </button>
      </div>

      {modoTotal ? (
        <label className="campo">
          <span>Total em pontos</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={typeof valor === 'number' ? valor : pontos}
            onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          />
        </label>
      ) : (
        <>
          <div className="grade-ranks">
            {RANKS.map((r) => {
              const q = contagem[r] ?? 0
              return (
                <div key={r} className={q > 0 ? 'rank ativo' : 'rank'}>
                  <button
                    type="button"
                    className="add"
                    onClick={() => ajustar(r, 1)}
                    aria-label={`Somar um ${NOME_LONGO[r]}, vale ${VALOR_CARTA[r]} pontos`}
                  >
                    {ROTULO[r]}
                  </button>
                  {q > 0 && (
                    <button
                      type="button"
                      className="qtd"
                      onClick={() => ajustar(r, -1)}
                      aria-label={`Tirar um ${NOME_LONGO[r]}. Tem ${q} agora`}
                    >
                      {q}
                    </button>
                  )}
                </div>
              )
            })}
          </div>

          <div className="resumo-contagem">
            <span className="ajuda">
              {quantidade} {quantidade === 1 ? 'carta' : 'cartas'}
            </span>
            <b>{pontos} pts</b>
          </div>
        </>
      )}
    </div>
  )
}
