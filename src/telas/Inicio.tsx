import type { Torneio } from '../engine'
import { classificacaoTorneio } from '../engine'

type Props = {
  torneios: Torneio[]
  onAbrir: (id: string) => void
  onNovo: () => void
  onRapida: () => void
  onApagar: (id: string) => void
}

export function Inicio({ torneios, onAbrir, onNovo, onRapida, onApagar }: Props) {
  return (
    <main>
      <div className="cartao">
        <h2>Começar</h2>
        <p className="ajuda">
          Cada partida vai até o alvo (3000 por padrão). Várias partidas na mesma noite somam entre
          si, em partidas ganhas e em pontos.
        </p>
        <div className="linha" style={{ marginTop: '0.8rem' }}>
          <button type="button" className="botao principal cresce" onClick={onRapida}>
            Partida rápida
          </button>
          <button type="button" className="botao cresce" onClick={onNovo}>
            Nova noite
          </button>
        </div>
        <p className="ajuda" style={{ marginTop: '0.6rem' }}>
          Partida rápida usa Nós contra Eles, alvo 3000, sem limite de partidas.
        </p>
      </div>

      {torneios.length === 0 ? (
        <div className="cartao">
          <p className="vazio">Nenhuma noite salva ainda.</p>
        </div>
      ) : (
        <div className="cartao">
          <h2>Noites salvas</h2>
          <div className="classificacao">
            {torneios.map((t) => {
              const lider = classificacaoTorneio(t)[0]
              const partidas = t.partidas.length
              return (
                <div
                  key={t.id}
                  className="item"
                  style={{ gridTemplateColumns: '1fr auto auto' }}
                >
                  <button
                    type="button"
                    onClick={() => onAbrir(t.id)}
                    style={{
                      border: 'none',
                      background: 'none',
                      padding: 0,
                      textAlign: 'left',
                      cursor: 'pointer',
                      minWidth: 0,
                    }}
                  >
                    <span className="nome">
                      {t.nome}
                      <small>
                        {t.criadoEm} · {partidas} {partidas === 1 ? 'partida' : 'partidas'}
                        {lider !== undefined && partidas > 0
                          ? ` · lidera ${lider.nome}`
                          : ' · sem partidas'}
                      </small>
                    </span>
                  </button>
                  <span className="ajuda">{t.status === 'encerrado' ? 'encerrada' : 'aberta'}</span>
                  <button
                    type="button"
                    className="botao pequeno"
                    onClick={() => {
                      if (confirm(`Apagar "${t.nome}" e todas as partidas dela?`)) onApagar(t.id)
                    }}
                    aria-label={`Apagar a noite ${t.nome}`}
                  >
                    Apagar
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </main>
  )
}
