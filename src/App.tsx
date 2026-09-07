import { useEffect, useState } from 'react'
import type { Rodada as TipoRodada, Torneio as TipoTorneio } from './engine'
import {
  ALVO_BURACO_PADRAO,
  equipe,
  novaPartida,
  partidaTerminou,
  rodada,
  vencedorTorneio,
} from './engine'
import type { Estado } from './armazenamento'
import { carregar, salvar } from './armazenamento'
import { useTema } from './tema'
import { hoje, novoId } from './util'
import { Cabecalho } from './componentes/Cabecalho'
import { Inicio } from './telas/Inicio'
import { NovoTorneio } from './telas/NovoTorneio'
import { Torneio } from './telas/Torneio'
import { Partida } from './telas/Partida'
import { Rodada } from './telas/Rodada'

type Vista =
  | { v: 'inicio' }
  | { v: 'novo' }
  | { v: 'torneio'; t: string }
  | { v: 'partida'; t: string; p: number }
  /** `r: null` = rodada nova; número = índice da rodada em edição. */
  | { v: 'rodada'; t: string; p: number; r: number | null }

function vistaInicial(e: Estado): Vista {
  if (e.ativo !== null && e.torneios.some((t) => t.id === e.ativo)) {
    return { v: 'torneio', t: e.ativo }
  }
  return { v: 'inicio' }
}

/**
 * `status` de partida e de torneio são cache do que o motor já sabe calcular.
 * Recalcular depois de toda mutação evita que fiquem mentindo — é a mesma razão
 * pela qual nenhum total é armazenado (ver DECISOES.md).
 */
function recalcular(t: TipoTorneio): TipoTorneio {
  const partidas = t.partidas.map((p) => ({
    ...p,
    status: partidaTerminou(t, p) ? ('encerrada' as const) : ('em_andamento' as const),
  }))
  const comPartidas: TipoTorneio = { ...t, partidas }
  return {
    ...comPartidas,
    status: vencedorTorneio(comPartidas) !== null ? 'encerrado' : 'em_andamento',
  }
}

export function App() {
  const [tema, alternarTema] = useTema()
  const [estado, setEstado] = useState<Estado>(carregar)
  const [vista, setVista] = useState<Vista>(() => vistaInicial(estado))

  useEffect(() => {
    salvar(estado)
  }, [estado])

  function mudarTorneio(id: string, fn: (t: TipoTorneio) => TipoTorneio) {
    setEstado((e) => ({
      ...e,
      torneios: e.torneios.map((t) => (t.id === id ? recalcular(fn(t)) : t)),
    }))
  }

  function adicionar(t: TipoTorneio) {
    setEstado((e) => ({ torneios: [t, ...e.torneios], ativo: t.id }))
  }

  function partidaRapida() {
    const t: TipoTorneio = {
      id: novoId(),
      nome: `Partida rápida de ${hoje()}`,
      criadoEm: hoje(),
      equipes: [equipe('e1', 'Nós'), equipe('e2', 'Eles')],
      alvoPartida: ALVO_BURACO_PADRAO,
      formato: 'aberto',
      partidas: [novaPartida(1)],
      status: 'em_andamento',
    }
    adicionar(t)
    setVista({ v: 'partida', t: t.id, p: 0 })
  }

  function abrirNovaPartida(id: string) {
    const indice = estado.torneios.find((t) => t.id === id)?.partidas.length ?? 0
    mudarTorneio(id, (t) => ({
      ...t,
      partidas: [...t.partidas, novaPartida(t.partidas.length + 1)],
    }))
    setVista({ v: 'partida', t: id, p: indice })
  }

  /** Renumera sempre, para o `n` não mentir depois de inserir ou apagar no meio. */
  function gravarRodada(id: string, p: number, r: number | null, nova: TipoRodada) {
    mudarTorneio(id, (t) => ({
      ...t,
      partidas: t.partidas.map((partida, i) => {
        if (i !== p) return partida
        const rodadas =
          r === null
            ? [...partida.rodadas, nova]
            : partida.rodadas.map((x, j) => (j === r ? nova : x))
        return { ...partida, rodadas: rodadas.map((x, j) => ({ ...x, n: j + 1 })) }
      }),
    }))
    setVista({ v: 'partida', t: id, p })
  }

  function apagarRodada(id: string, p: number, r: number) {
    mudarTorneio(id, (t) => ({
      ...t,
      partidas: t.partidas.map((partida, i) =>
        i !== p
          ? partida
          : {
              ...partida,
              rodadas: partida.rodadas
                .filter((_, j) => j !== r)
                .map((x, j) => ({ ...x, n: j + 1 })),
            },
      ),
    }))
    setVista({ v: 'partida', t: id, p })
  }

  const torneio =
    vista.v === 'torneio' || vista.v === 'partida' || vista.v === 'rodada'
      ? estado.torneios.find((t) => t.id === vista.t)
      : undefined

  // Torneio apagado ou id órfão no armazenamento: volta para o início em vez de quebrar.
  if (vista.v !== 'inicio' && vista.v !== 'novo' && torneio === undefined) {
    return (
      <div className="app">
        <Cabecalho titulo="Placar de Buraco" tema={tema} alternarTema={alternarTema} />
        <main>
          <div className="cartao">
            <p className="vazio">Essa noite não existe mais.</p>
            <button
              type="button"
              className="botao largo"
              onClick={() => setVista({ v: 'inicio' })}
            >
              Voltar ao início
            </button>
          </div>
        </main>
      </div>
    )
  }

  if (vista.v === 'inicio') {
    return (
      <div className="app">
        <Cabecalho titulo="Placar de Buraco" tema={tema} alternarTema={alternarTema} />
        <Inicio
          torneios={estado.torneios}
          onAbrir={(id) => {
            setEstado((e) => ({ ...e, ativo: id }))
            setVista({ v: 'torneio', t: id })
          }}
          onNovo={() => setVista({ v: 'novo' })}
          onRapida={partidaRapida}
          onApagar={(id) =>
            setEstado((e) => ({
              torneios: e.torneios.filter((t) => t.id !== id),
              ativo: e.ativo === id ? null : e.ativo,
            }))
          }
        />
      </div>
    )
  }

  if (vista.v === 'novo') {
    return (
      <div className="app">
        <Cabecalho
          titulo="Nova noite"
          voltar={() => setVista({ v: 'inicio' })}
          tema={tema}
          alternarTema={alternarTema}
        />
        <NovoTorneio
          onCriar={(t) => {
            adicionar(t)
            setVista({ v: 'torneio', t: t.id })
          }}
        />
      </div>
    )
  }

  if (torneio === undefined) return null

  if (vista.v === 'torneio') {
    const partidas = torneio.partidas.length
    return (
      <div className="app">
        <Cabecalho
          titulo={torneio.nome}
          sub={`alvo ${torneio.alvoPartida} · ${partidas} ${partidas === 1 ? 'partida' : 'partidas'}`}
          voltar={() => setVista({ v: 'inicio' })}
          tema={tema}
          alternarTema={alternarTema}
        />
        <Torneio
          torneio={torneio}
          onAbrirPartida={(i) => setVista({ v: 'partida', t: torneio.id, p: i })}
          onNovaPartida={() => abrirNovaPartida(torneio.id)}
        />
      </div>
    )
  }

  if (vista.v === 'partida') {
    return (
      <div className="app">
        <Cabecalho
          titulo={`Partida ${vista.p + 1}`}
          sub={torneio.nome}
          voltar={() => setVista({ v: 'torneio', t: torneio.id })}
          tema={tema}
          alternarTema={alternarTema}
        />
        <Partida
          torneio={torneio}
          indice={vista.p}
          onEditarRodada={(r) => setVista({ v: 'rodada', t: torneio.id, p: vista.p, r })}
          onNovaRodada={() => setVista({ v: 'rodada', t: torneio.id, p: vista.p, r: null })}
        />
      </div>
    )
  }

  const partida = torneio.partidas[vista.p]
  const existente = vista.r !== null ? partida?.rodadas[vista.r] : undefined
  const numero = vista.r !== null ? vista.r + 1 : (partida?.rodadas.length ?? 0) + 1
  const inicial =
    existente ??
    rodada(
      numero,
      Object.fromEntries(torneio.equipes.map((e) => [e.id, {}])),
    )
  const indiceEmEdicao = vista.r

  return (
    <div className="app">
      <Cabecalho
        titulo={`Rodada ${numero}`}
        sub={`Partida ${vista.p + 1} · ${torneio.nome}`}
        voltar={() => setVista({ v: 'partida', t: torneio.id, p: vista.p })}
        tema={tema}
        alternarTema={alternarTema}
      />
      <Rodada
        key={`${vista.p}-${indiceEmEdicao ?? 'nova'}`}
        torneio={torneio}
        numero={numero}
        inicial={inicial}
        editando={indiceEmEdicao !== null}
        onSalvar={(r) => gravarRodada(torneio.id, vista.p, indiceEmEdicao, r)}
        {...(indiceEmEdicao !== null
          ? { onApagar: () => apagarRodada(torneio.id, vista.p, indiceEmEdicao) }
          : {})}
        onCancelar={() => setVista({ v: 'partida', t: torneio.id, p: vista.p })}
      />
    </div>
  )
}
