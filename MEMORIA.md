# Memória — Placar de Buraco

## Objetivo
Site/PWA que conta pontos de **buraco/canastra** em jogos presenciais.

Controla o **placar acumulado** em três níveis: soma as rodadas dentro da partida até alguém atingir o
alvo (3000), e soma as partidas ao longo da noite (torneio). O histórico rodada-a-rodada fica visível —
é a folha de papel da mesa, e é ela que os jogadores auditam. Qualquer rodada passada pode ser corrigida.

A câmera do celular lê as cartas na mesa em tempo real (stream em memória, **sem tirar nem salvar
fotos**), **propõe** a pontuação da rodada, e os jogadores **validam na tela** antes de confirmar.
A câmera é acelerador de digitação, nunca fonte da verdade — ver `DECISOES.md`.

Hospedagem: Vercel conta free (Hobby) — 100% estático, zero backend, zero custo.

Repositório (público, por causa da licença AGPL-3.0 do modelo de visão do F2):

```
https://github.com/henriquetamaki-max/Buraco_score
```

## Estado atual
**2026-09-07 — F0 e F1 concluídos.** Motor puro (46 testes verdes, `tsc --noEmit` limpo) mais o app
jogável por toque. Build de produção: **66,4 KB gzip** de JS, 2,20 KB de CSS, service worker com 9
entradas de precache.

Caminho completo validado no navegador via Playwright, em viewport de celular (400×860): partida rápida
→ rodada pelo teclado de cartas → confirmar → placar → **corrigir uma rodada passada e ver o acumulado se
refazer** (860 → 760, sem tocar na rodada seguinte) → classificação da noite → tema escuro → persistência
entre recargas. Conferência aritmética contra cálculo manual: Nós +360, Eles −115, ambos exatos.

Telas: Início (noites salvas) · Nova noite · Torneio (classificação) · Partida (folha de papel) ·
Rodada (entrada por toque).

Próximo passo: **deploy no Vercel** (ação humana) e depois **F2** — câmera assistida.

## Arquitetura
- **Vite + React + TS**, SPA estático → Vercel Hobby. Sem serverless function.
- **PWA** (`vite-plugin-pwa`): offline + ícone na home screen. Jogo em mesa não depende de rede.
- **Estado**: `localStorage`. Sem conta, sem login, sem servidor.
- **Câmera**: `getUserMedia` → `<video>` → `canvas` offscreen. Frames processados em RAM e descartados.
- **Inferência**: `onnxruntime-web` (WebGPU → fallback WASM). Modelo YOLO como asset estático.
- **Temas Light/Dark** com CSS variables, toggle visível, default Light.

## Insight-chave da pesquisa
Para pontuar buraco **o naipe é irrelevante** — o valor depende só do rank (5/10/15) e de ser curinga.
→ Modelo de visão com **14 classes** (A,2,3,4,5,6,7,8,9,10,J,Q,K,Joker) em vez de 52.
Menor, mais rápido, mais preciso. Obtido por *remap de labels* de dataset existente (zero anotação nova).
Confirmado pelo produto concorrente `canastascore.com`, que também lê apenas o rank do canto superior-esquerdo.

## Regras de pontuação (fonte do motor)
Levantadas em 2026-09-07 de Copag, MegaJogos e Jogos do Rei.

- Cartas: **3–7 = 5** · **8,9,10,J,Q,K = 10** · **Ás = 15** · **curinga (2 ou joker) = 10**.
- Canastra **limpa = 200** · **suja = 100** · **Ás→Rei, 13 cartas = 500** · **Ás→Ás, 14 cartas = 1000**.
- **Batida = +100**. **Não pegou o morto = −100**.
- Cartas que sobram na mão: **subtraem** o próprio valor.
- Total da rodada = baixadas + canastras + batida − penalidade do morto − cartas na mão.
- **Placar da partida** = soma dos totais de todas as rodadas, por equipe.
- O total de uma rodada pode ser **negativo** → o acumulado **cai** entre rodadas. Exibir com sinal.
- Partida encerra **ao fim da rodada** em que alguma equipe atinge ou passa o alvo. Duas cruzando na mesma
  rodada: vence o **maior acumulado**; empate exato → rodada de desempate.
- Alvo configurável (default 3000).

## Modelo de dados
Fonte da verdade é **só** a árvore `torneio -> partidas[] -> rodadas[]`. Nenhum total é armazenado:
os três níveis de acumulado são função pura dela. Ver `DECISOES.md`.

```
Torneio  (a noite de jogo)   -> partidas ganhas + soma de pontos
  Partida  (até o alvo, 3000) -> acumulado por equipe
    Rodada  (uma mão/batida)  -> total da rodada por equipe
```

**Não existe partida solta.** Uma partida única é um torneio com uma partida — um só caminho de código.
Na UI isso vira um botão "partida rápida"; a palavra "torneio" nem aparece.

Tipos completos em:

```
e:\BD\Kids\Baralho\src\engine\tipos.ts
```

Pontos estruturais: `Equipe` vive no **torneio** (duplas fixas a noite toda); `Partida` não tem `equipes`
nem `id`, só `n`/`rodadas`/`status`; `Cartas = Contagem | number` aceita tanto a contagem por rank (o que
a câmera produz) quanto o total digitado direto.

## API do motor (F0, pronto)

```ts
// regras.ts
pontosDeCartas(cartas: Cartas): number
pontosDeCanastras(c: Canastras): number

// rodada.ts
lado(parcial?: Partial<LadoBuraco>): LadoBuraco
totalLado(l: LadoBuraco): number
totalRodada(rodada: Rodada, equipeId: string): number

// placar.ts — os três níveis, todos derivados
acumuladoPartida(partida, equipeId, ateRodada?): number
placarPartida(torneio, partida): LinhaPlacar[]
vencedorPartida(torneio, partida): string | null
partidaTerminou(torneio, partida): boolean
classificacaoTorneio(torneio): LinhaClassificacao[]      // as DUAS métricas
vencedorTorneio(torneio): string | null                  // só em formato 'melhor_de'

// fabricas.ts — construtores com defaults sãos
equipe, canastras, novaPartida, rodada, novoTorneio
```

Tudo reexportado por:

```
e:\BD\Kids\Baralho\src\engine\index.ts
```

## Como rodar / testar / debugar

```
npm install
npm run dev        # servidor de desenvolvimento
npm run build      # typecheck + bundle + service worker em dist/
npm run preview    # serve o dist/ para conferir o build de produção
npm test           # 46 testes do motor
npm run typecheck  # tsc --noEmit
npm run check      # typecheck + testes, o portão antes de commitar
npm run icones     # regera os PNG do PWA a partir do gerador sem dependência
```

Câmera (F2) exige HTTPS. `localhost` também é origem segura, mas testar no celular exige HTTPS real —
usar o preview do Vercel.

## Gotchas / Aprendizados
- 2026-09-07 — **Curinga no buraco é o `2`**, não o joker impresso. O modelo de visão detecta o rank `2`;
  quem decide se ele conta como curinga ou como carta natural é o motor, não a visão.
- 2026-09-07 — Modelos YOLO da Ultralytics são **AGPL-3.0**. Usar → repositório público. Vercel Hobby
  já é restrito a uso pessoal/não-comercial, então não há conflito prático.
- 2026-09-07 — iOS Safari tem WebGPU recente/instável. Fallback WASM roda ~1–3 fps a 640px.
  Mitigação: input 320px, detectar a **2–4 fps** (não por frame) e acumular votos por ~2 s.
- 2026-09-07 — Cartas baixadas em escada mostram só o canto superior-esquerdo. Isso é *bom*: os datasets
  sintéticos (geaxgx) rotulam exatamente os cantos impressos.
- 2026-09-07 — Baralho Copag tem tipografia diferente do Bicycle dos datasets. Fine-tune com ~200 fotos
  do baralho real será provavelmente necessário.
- 2026-09-07 — `noUncheckedIndexedAccess: true` no `tsconfig.json`: todo acesso indexado devolve
  `T | undefined`. Custa alguns `?? 0`, mas num motor de pontuação é exatamente onde um `undefined`
  silencioso viraria `NaN` no placar da mesa.
- 2026-09-07 — vitest 2.x arrasta `vite <= 6.4.2` com CVE do esbuild (5 alertas, 1 crítico). São
  devDependencies e afetam só o dev-server, mas a correção é atualizar a versão, não silenciar o audit.
- 2026-09-07 — **`pool: 'vmThreads'` no `vitest.config.ts` é correção de bug, não preferência.** Com os
  pools default (`forks`/`threads`), o vitest 5.0.0 nesta máquina falha a coleta de TODO teste com
  `TypeError: Cannot read properties of undefined (reading 'config')` — mas só quando lançado por um
  processo Node pai via `child_process`, que é como o hook `test-after-edit` roda `npm test`. Direto no
  Git Bash ou no PowerShell, passa. Bisseccionado e descartado: shell, stdin, `--maxWorkers=1`,
  `--no-file-parallelism`, `--no-isolate`, config explícita, `NODE_PATH`, ambiente mínimo. Se um dia os
  testes precisarem de DOM ou módulo nativo, revisitar essa escolha.
- 2026-09-07 — Testando o build local, o **service worker serve o bundle antigo** do cache e some com a
  correção que você acabou de fazer. Antes de conferir mudança no `npm run preview`, desregistre o SW e
  limpe o cache pelo console do navegador, ou o resultado engana.
- 2026-09-07 — Modo de entrada de cartas é **estado da UI, não pode ser derivado de `typeof valor`**: o
  lado zero do motor tem `baixadas: 0` (número), o que abria o `ContadorCartas` em "Digitar o total"
  quando o teclado é o caminho principal — e é ele que a câmera do F2 vai alimentar.
- **TODO F2** — quando entrar o caminho do arquivo `.onnx`, criar o smoke universal "config aponta para
  arquivo existente" (quality gate 3). Hoje não há config de path, então não se aplica.

## Fora de escopo

**Cacheta** foi cortada em 2026-09-07 (ver `DECISOES.md`) — já atendida por app grátis existente.
As regras ficam registradas aqui para o caso de voltar:

- Cada jogador começa com **7 ou 10 vidas** (configurável). Sai do jogo ao chegar a 0.
- Quem **bate** faz os outros perderem **1 vida**; batida com 10 cartas (seca) → **2 vidas**.
- Quem bateu não perde vida. Eliminado não perde mais nem fica negativo.
- **Compra** recupera vidas — variante comum: iguala ao menor jogador vivo da mesa.
- Variante por pontos de mão: 1–9 = valor impresso · 10/J/Q/K = 10 · Ás = 15 · curinga = 25.
- Ao contrário do buraco (soma comutativa), a **ordem** das rodadas importa: é um fold, não uma soma.
- Vencedor = o último com vidas.

## Histórico de tarefas concluídas
- 2026-09-07 — Repositório publicado no GitHub, commit inicial `80756c0` (42 arquivos).
- 2026-09-07 — **F1**: 5 telas, teclado de cartas, temas claro/escuro, PWA, persistência em
  `localStorage`, gerador de ícones sem dependência. Validado ponta a ponta no navegador.
- 2026-09-07 — **F0**: motor de pontuação puro (regras, rodada, os três níveis de placar) + 46 testes.
- 2026-09-07 — Escopo reduzido a buraco; cacheta removida do motor.
- 2026-09-07 — Pesquisa de referências (GitHub/Roboflow/HF), regras de pontuação e viabilidade no browser.
