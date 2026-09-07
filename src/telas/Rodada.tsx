import { useState } from 'react'
import type { Canastras, LadoBuraco, Rodada as TipoRodada, Torneio } from '../engine'
import { BONUS_CANASTRA, LADO_ZERO, totalLado } from '../engine'
import { ContadorCartas } from '../componentes/ContadorCartas'
import { Interruptor, Passo } from '../componentes/Controles'
import { classeSinal, comSinal } from '../util'

type Props = {
  torneio: Torneio
  numero: number
  inicial: TipoRodada
  editando: boolean
  onSalvar: (r: TipoRodada) => void
  onApagar?: () => void
  onCancelar: () => void
}

export function Rodada({
  torneio,
  numero,
  inicial,
  editando,
  onSalvar,
  onApagar,
  onCancelar,
}: Props) {
  const [porEquipe, setPorEquipe] = useState<Record<string, LadoBuraco>>(() => {
    const base: Record<string, LadoBuraco> = {}
    for (const e of torneio.equipes) base[e.id] = inicial.porEquipe[e.id] ?? LADO_ZERO
    return base
  })

  function atualizar(id: string, mudanca: Partial<LadoBuraco>) {
    setPorEquipe((atual) => ({ ...atual, [id]: { ...(atual[id] ?? LADO_ZERO), ...mudanca } }))
  }

  function mudarCanastra(id: string, chave: keyof Canastras, valor: number) {
    const lado = porEquipe[id] ?? LADO_ZERO
    atualizar(id, { canastras: { ...lado.canastras, [chave]: valor } })
  }

  /** Só uma dupla bate por rodada — ligar numa desliga nas outras. */
  function marcarBatida(id: string, ligado: boolean) {
    setPorEquipe((atual) => {
      const novo: Record<string, LadoBuraco> = {}
      for (const [chave, lado] of Object.entries(atual)) {
        novo[chave] = {
          ...lado,
          batida: ligado ? chave === id : chave === id ? false : lado.batida,
        }
      }
      return novo
    })
  }

  return (
    <main>
      <div className="cartao">
        {torneio.equipes.map((equipe) => {
          const lado = porEquipe[equipe.id] ?? LADO_ZERO
          const total = totalLado(lado)
          return (
            <div className="equipe-bloco" key={equipe.id}>
              <div className="equipe-topo">
                <strong>{equipe.nome}</strong>
                <span className={`total ${classeSinal(total)}`}>{comSinal(total)}</span>
              </div>

              <ContadorCartas
                rotulo="Cartas baixadas"
                ajuda="o que está na mesa, sem contar o bônus de canastra"
                valor={lado.baixadas}
                onChange={(v) => atualizar(equipe.id, { baixadas: v })}
              />

              <div style={{ marginTop: '0.8rem' }}>
                <Passo
                  rotulo="Canastra limpa"
                  ajuda={`${BONUS_CANASTRA.limpa} pontos cada, sem curinga`}
                  valor={lado.canastras.limpa}
                  onChange={(n) => mudarCanastra(equipe.id, 'limpa', n)}
                />
                <Passo
                  rotulo="Canastra suja"
                  ajuda={`${BONUS_CANASTRA.suja} pontos cada, com curinga`}
                  valor={lado.canastras.suja}
                  onChange={(n) => mudarCanastra(equipe.id, 'suja', n)}
                />
                <Passo
                  rotulo="Ás ao Rei"
                  ajuda={`${BONUS_CANASTRA.as500} pontos, 13 cartas`}
                  valor={lado.canastras.as500}
                  onChange={(n) => mudarCanastra(equipe.id, 'as500', n)}
                />
                <Passo
                  rotulo="Ás ao Ás"
                  ajuda={`${BONUS_CANASTRA.mil} pontos, 14 cartas`}
                  valor={lado.canastras.mil}
                  onChange={(n) => mudarCanastra(equipe.id, 'mil', n)}
                />
              </div>

              <Interruptor
                rotulo="Bateu"
                ajuda="soma 100. Só uma dupla bate por rodada"
                ligado={lado.batida}
                onChange={(b) => marcarBatida(equipe.id, b)}
              />
              <Interruptor
                rotulo="Pegou o morto"
                ajuda="se não pegou, desconta 100"
                ligado={lado.pegouMorto}
                onChange={(b) => atualizar(equipe.id, { pegouMorto: b })}
              />

              <div style={{ marginTop: '0.5rem' }}>
                <ContadorCartas
                  rotulo="Cartas que sobraram na mão"
                  ajuda="descontam do total"
                  valor={lado.mao}
                  onChange={(v) => atualizar(equipe.id, { mao: v })}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="linha">
        <button
          type="button"
          className="botao principal cresce"
          onClick={() => onSalvar({ n: numero, porEquipe })}
        >
          {editando ? 'Salvar correção' : 'Confirmar rodada'}
        </button>
        <button type="button" className="botao" onClick={onCancelar}>
          Cancelar
        </button>
      </div>

      {onApagar !== undefined && (
        <button
          type="button"
          className="botao perigo largo"
          onClick={() => {
            if (confirm(`Apagar a rodada ${numero}? O placar se refaz sem ela.`)) onApagar()
          }}
        >
          Apagar esta rodada
        </button>
      )}
    </main>
  )
}
