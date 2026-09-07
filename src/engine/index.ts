/** Motor de pontuação do buraco — API pública. Zero UI, zero I/O, zero estado. */

export type {
  Canastras,
  Cartas,
  Contagem,
  Equipe,
  LadoBuraco,
  LinhaClassificacao,
  LinhaPlacar,
  Partida,
  Rank,
  Rodada,
  Torneio,
} from './tipos'

export {
  ALVO_BURACO_PADRAO,
  BONUS_BATIDA,
  BONUS_CANASTRA,
  CANASTRAS_ZERO,
  PENALIDADE_SEM_MORTO,
  VALOR_CARTA,
  pontosDeCanastras,
  pontosDeCartas,
} from './regras'

export { LADO_ZERO, lado, totalLado, totalRodada } from './rodada'

export {
  acumuladoPartida,
  classificacaoTorneio,
  partidaTerminou,
  placarPartida,
  vencedorPartida,
  vencedorTorneio,
} from './placar'

export { canastras, equipe, novaPartida, novoTorneio, rodada } from './fabricas'
