import type { Torneio as TipoTorneio } from '../engine'
import { acumuladoPartida, classificacaoTorneio, vencedorPartida, vencedorTorneio } from '../engine'

type Props = {
  torneio: TipoTorneio
  onAbrirPartida: (i: number) => void
  onNovaPartida: () => void
}

export function Torneio({ torneio, onAbrirPartida, onNovaPartida }: Props) {
  const classificacao = classificacaoTorneio(torneio)
  const campeao = vencedorTorneio(torneio)
  const nomeCampeao = torneio.equipes.find((e) => e.id === campeao)?.nome
  const indiceAberta = torneio.partidas.findIndex((p) => p.status === 'em_andamento')
  const temPartidas = torneio.partidas.length > 0

  return (
    <main>
      {campeao !== null && (
        <div className="faixa campea">{nomeCampeao} ganhou a noite</div>
      )}

      <div className="cartao">
        <h2>Classificação</h2>
        <p className="ajuda" style={{ marginBottom: '0.7rem' }}>
          Ordena por partidas ganhas. Empate desempata pela soma de pontos.
        </p>
        <div className="classificacao">
          {classificacao.map((linha, i) => (
            <div
              key={linha.equipeId}
              className={i === 0 && temPartidas ? 'item lider' : 'item'}
            >
              <span className="posicao">{i + 1}</span>
              <span className="nome">
                {linha.nome}
                <small>
                  {linha.porPartida.length === 0
                    ? 'sem partidas'
                    : linha.porPartida.join(' · ')}
                </small>
              </span>
              <span className="metrica">
                <b>{linha.partidasGanhas}</b>
                <small>ganhas</small>
              </span>
              <span className="metrica">
                <b>{linha.somaPontos}</b>
                <small>pontos</small>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="cartao">
        <h2>Partidas</h2>
        {!temPartidas ? (
          <p className="vazio">Nenhuma partida ainda.</p>
        ) : (
          <div className="classificacao">
            {torneio.partidas.map((partida, i) => {
              const vencedor = vencedorPartida(torneio, partida)
              const nomeVencedor = torneio.equipes.find((e) => e.id === vencedor)?.nome
              const rodadas = partida.rodadas.length
              return (
                <button
                  key={i}
                  type="button"
                  className="item"
                  onClick={() => onAbrirPartida(i)}
                  style={{ gridTemplateColumns: '1fr auto', textAlign: 'left', cursor: 'pointer' }}
                >
                  <span className="nome">
                    Partida {i + 1}
                    <small>
                      {rodadas} {rodadas === 1 ? 'rodada' : 'rodadas'}
                      {vencedor !== null ? ` · ${nomeVencedor} venceu` : ' · em andamento'}
                    </small>
                  </span>
                  <span className="metrica">
                    <b>
                      {torneio.equipes.map((e) => acumuladoPartida(partida, e.id)).join(' × ')}
                    </b>
                    <small>placar</small>
                  </span>
                </button>
              )
            })}
          </div>
        )}

        <button
          type="button"
          className="botao principal largo"
          style={{ marginTop: '0.8rem' }}
          onClick={onNovaPartida}
          disabled={indiceAberta >= 0 || campeao !== null}
        >
          Nova partida
        </button>

        {indiceAberta >= 0 && (
          <p className="ajuda" style={{ marginTop: '0.5rem' }}>
            Termine a partida {indiceAberta + 1} antes de abrir outra.
          </p>
        )}
        {campeao !== null && (
          <p className="ajuda" style={{ marginTop: '0.5rem' }}>
            A noite terminou no formato melhor de {torneio.melhorDe}.
          </p>
        )}
      </div>
    </main>
  )
}
