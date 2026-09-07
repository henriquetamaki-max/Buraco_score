# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/). Versionamento semântico.

## [1.0.0] — 2026-09-07

Primeira versão utilizável. Conta pontos de buraco/canastra numa noite inteira de jogo,
por toque, sem papel e sem caneta.

### Motor de pontuação (`src/engine`)

- Três níveis de acumulado — rodada, partida e torneio — todos **função pura** da árvore
  `torneio → partidas → rodadas`. Nenhum total é armazenado, então corrigir uma rodada
  passada recalcula o placar inteiro sem nenhuma etapa extra.
- Tabela de pontos completa: 3–7 valem 5, 8–K valem 10, ás vale 15, curinga vale 10;
  canastra limpa 200, suja 100, ás ao rei 500, ás ao ás 1000; batida +100; sem morto −100;
  cartas na mão subtraem.
- Total de rodada pode ser negativo, e o acumulado cai entre rodadas.
- Fim de partida avaliado **ao fim da rodada**, nunca no instante em que o alvo é cruzado —
  a penalidade do morto e as cartas na mão podem derrubar quem já tinha passado de 3000.
  Empate exato no topo vai para rodada de desempate.
- Classificação de torneio com duas métricas simultâneas: partidas ganhas (primária) e
  soma de pontos (desempate). Formatos "joga até parar" e "melhor de N".
- 46 testes cobrindo a tabela de pontos, a fórmula da rodada, os casos negativos, o
  recálculo retroativo e a ordenação da classificação.

### Aplicativo

- Cinco telas: noites salvas, nova noite, classificação do torneio, placar da partida
  (a folha de papel) e entrada de rodada.
- Teclado de cartas por rank, com contagem por toque — a mesma estrutura de dados que a
  câmera vai produzir na próxima fase. Alternativa "digitar o total" para quem soma de cabeça.
- Só uma dupla pode bater por rodada; ligar em uma desliga nas outras.
- Temas claro e escuro, com a escolha guardada no navegador.
- PWA: instala na tela de início e abre offline.
- Estado em `localStorage`, com todo acesso protegido — aba privada ou storage bloqueado
  não derrubam o app no meio da partida.
- Ícones gerados por script próprio, sem dependência externa.

### Escopo

- Somente buraco/canastra. Cacheta foi cortada por já estar atendida por aplicativo
  gratuito existente; as regras dela seguem registradas em `MEMORIA.md`.

### Notas técnicas

- `pool: 'vmThreads'` no `vitest.config.ts` contorna uma falha de coleta do vitest 5.0.0
  quando lançado por um processo Node pai. Diagnóstico completo no próprio arquivo.
- Build de produção: 66,4 KB gzip de JavaScript, 2,20 KB de CSS.
