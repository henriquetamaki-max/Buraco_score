import type { Torneio } from '../engine'
import { acumuladoPartida, totalRodada, vencedorPartida } from '../engine'
import { classeSinal, comSinal } from '../util'

type Props = {
  torneio: Torneio
  indice: number
  onEditarRodada: (r: number) => void
  onNovaRodada: () => void
}

export function Partida({ torneio, indice, onEditarRodada, onNovaRodada }: Props) {
  const partida = torneio.partidas[indice]

  if (partida === undefined) {
    return (
      <main>
        <div className="cartao">
          <p className="vazio">Partida não encontrada.</p>
        </div>
      </main>
    )
  }

  const vencedor = vencedorPartida(torneio, partida)
  const nomeVencedor = torneio.equipes.find((e) => e.id === vencedor)?.nome
  const equipes = torneio.equipes

  return (
    <main>
      {vencedor !== null && (
        <div className="faixa campea">
          {nomeVencedor} venceu com {acumuladoPartida(partida, vencedor)} pontos
        </div>
      )}

      <div className="cartao">
        <h2>Placar</h2>
        <p className="ajuda" style={{ marginBottom: '0.6rem' }}>
          Toque numa rodada para corrigir. O acumulado se refaz sozinho.
        </p>

        <div className="rolagem">
          <table className="placar">
            <thead>
              <tr>
                <th>Rodada</th>
                {equipes.map((e) => (
                  <th key={e.id}>{e.nome}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {partida.rodadas.length === 0 ? (
                <tr>
                  <td colSpan={equipes.length + 1} style={{ textAlign: 'center' }}>
                    <span className="ajuda">Nenhuma rodada ainda.</span>
                  </td>
                </tr>
              ) : (
                partida.rodadas.map((rodada, i) => (
                  <tr key={i} className="clicavel" onClick={() => onEditarRodada(i)}>
                    <td>{i + 1}</td>
                    {equipes.map((e) => {
                      const valor = totalRodada(rodada, e.id)
                      return (
                        <td key={e.id} className={classeSinal(valor)}>
                          {comSinal(valor)}
                        </td>
                      )
                    })}
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <td>Total</td>
                {equipes.map((e) => {
                  const valor = acumuladoPartida(partida, e.id)
                  return (
                    <td key={e.id} className={classeSinal(valor)}>
                      {valor}
                    </td>
                  )
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="cartao">
        <p className="ajuda">Esta partida vai até {torneio.alvoPartida} pontos.</p>
        <button
          type="button"
          className="botao principal largo"
          style={{ marginTop: '0.7rem' }}
          onClick={onNovaRodada}
          disabled={vencedor !== null}
        >
          Nova rodada
        </button>
        {vencedor !== null && (
          <p className="ajuda" style={{ marginTop: '0.5rem' }}>
            Partida encerrada. Volte para a noite para abrir a próxima.
          </p>
        )}
      </div>
    </main>
  )
}
