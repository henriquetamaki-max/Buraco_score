# Decisões — Contador de Pontos (Cacheta + Buraco)

## 2026-09-07 — F2 lê os jogos baixados; a mão e a batida ficam manuais
**Contexto:** o usuário fechou o escopo da câmera — "quero que a câmera leia as sequências e batida, não
precisa ler a mão".
**Decisão:** a câmera lê **os jogos baixados de uma dupla** e preenche exatamente dois campos do
formulário que já existe: `baixadas` e `canastras`. Cartas na mão, "pegou o morto" e "bateu" seguem
manuais.
**Sobre a batida:** a câmera não consegue vê-la. Bater é ficar sem cartas na mão; olhando para os jogos
na mesa não existe sinal visual do evento. Continua sendo um toque no interruptor — que já custa um
toque, então não há o que otimizar.
**Consequências:** o F2 encolheu. Sai o caso mais difícil (cartas na mão são privadas, mal iluminadas e
seguradas em leque) e o app precisa de um só modo de câmera. E o encaixe com o motor é direto: a saída de
`lerMesa` é um `Contagem` e um `Canastras`, que são os tipos que o `LadoBuraco` já espera — sem conversão
e sem tipo novo.

## 2026-09-07 — Agrupar jogos pela posição na imagem, não pelo naipe
**Contexto:** "ler sequências" parecia exigir o naipe, já que sequência no buraco é do mesmo naipe — o
que derrubaria a decisão de usar um modelo de 14 classes.
**Decisão:** agrupar por **proximidade das caixas na imagem** (ligação simples, corte em 1,6 × a largura
mediana da carta detectada). O naipe continua fora do modelo.
**Justificativa:** os jogos ficam fisicamente separados na mesa, e as cartas de um mesmo jogo ficam em
escada sobrepostas. A distância entre cartas vizinhas do mesmo jogo é uma fração da largura da carta;
entre jogos diferentes há vão visível. Além disso, a validade da sequência já foi conferida pelos
jogadores quando baixaram — a câmera não precisa reprovar jogada, precisa contar ponto. E ponto depende
só do valor da carta e de haver curinga.
**Alternativas consideradas:** modelo de 52 classes com naipe — descartado: 4x mais classes, modelo maior
e menos preciso, para uma informação que não entra em nenhuma conta.
**Consequências:** usar a **mediana** da largura como escala faz o corte acompanhar a distância da câmera
à mesa sozinho, sem calibração. Se algum dia os jogos forem baixados encostados uns nos outros, o
agrupamento erra — e é por isso que a tela de conferência mostra os jogos separados, para o jogador ver
o agrupamento antes de confirmar.

## 2026-09-07 — O `2` ambíguo é sinalizado, nunca adivinhado
**Contexto:** um `2` detectado num jogo pode ser curinga ou carta natural da sequência. A diferença vale
100 pontos: canastra limpa 200 contra suja 100.
**Decisão:** quando houver um `A` ou um `3` no mesmo jogo — as posições onde o 2 se encaixaria
naturalmente — o `2` é marcado como **ambíguo** e o jogo vai com `precisaConferir: true`. Sem `A` nem `3`
por perto, o 2 só pode ser curinga, e aí é contado como tal.
**Alternativas consideradas:** (a) chutar sempre curinga — erra a favor de quem não fez canastra limpa;
(b) chutar sempre natural — infla o placar; (c) tentar decidir pela posição do 2 dentro da escada —
depende da ordem em que baixaram, que não é confiável.
**Consequências:** o app propõe limpa (o caso mais comum) mas destaca o jogo na tela de conferência. É a
aplicação concreta da regra de que a câmera propõe e o jogador decide: onde a visão não pode saber, ela
diz que não sabe em vez de inventar um número.

## 2026-09-07 — F1 antes da câmera, e repositório público aceito
**Contexto:** com o F0 pronto e testado, restava decidir a próxima frente: a UI por toque ou a visão
computacional. E, para a visão, se o repositório podia ser público (os modelos YOLO prontos são AGPL-3.0,
que obriga abrir o código de quem usa).
**Decisão:** **F1 primeiro** — o marcador por toque, PWA, no ar no Vercel. E **repositório público
aceito**, o que libera usar modelo pronto no F2 em vez de treinar de uma base permissiva.
**Justificativa:** o F1 vira o instrumento de decisão do F2. Usar o marcador numa noite de jogo real
mostra onde a digitação incomoda de fato — se incomoda. Construir a câmera antes seria otimizar por
suposição a parte de maior risco técnico.
**Alternativas consideradas:** câmera primeiro (dias sem nada usável na mão, e detecção perfeita sem as
telas não produz placar nenhum); cortar a câmera de vez (entrega em ~2 dias, mas abandona o pedido
original do `Novo.md` antes de ter evidência de que ele não vale).
**Consequências:** F2 economiza 1–2 dias e começa com acurácia de modelo já treinado em 20 k imagens.
Em troca, o código do projeto fica público no GitHub — sem impacto prático, já que o Vercel Hobby é
restrito a uso pessoal/não-comercial de qualquer forma.

## 2026-09-07 — Cacheta sai do escopo: só buraco
**Contexto:** o usuário testou o cenário e concluiu que a contagem de cacheta já está atendida por app
grátis existente (`Marcador de Cacheta`, Android, pt-BR — vidas, compra, quem embaralha). Construir de
novo o que já funciona de graça é retrabalho.
**Decisão:** o produto cobre **somente buraco/canastra**. `cacheta.ts` foi removido do motor em vez de
ficar como código morto atrás de uma flag.
**Alternativas consideradas:** (a) manter cacheta desabilitada por flag — descartado, paga o custo de
manutenção e de teste de um caminho que ninguém executa; (b) manter o arquivo fora da API pública —
descartado, é código morto com aparência de código vivo.
**Consequências:** o motor perdeu o despacho por jogo, a união `Rodada`, o campo `Torneio.jogo`, o
contador de vidas e o campo `LinhaPlacar.eliminado`. Menos tipos, menos ramos, menos teste — e a UI de F1
tem uma tela a menos. As **regras de cacheta seguem documentadas em `MEMORIA.md`** (seção "Fora de
escopo"), então retomá-la é reescrever ~90 linhas de fold, não redescobrir as regras.

## 2026-09-07 — Nível torneio acima da partida, e as duas métricas juntas
**Contexto:** o usuário confirmou que precisa dos dois acumulados — somar as rodadas dentro da partida
(até 3000) **e** somar as partidas ao longo da noite. Ficou sem resposta se o torneio conta *partidas
ganhas* ou *soma total de pontos*.
**Decisão:** criar o nível `Torneio` envolvendo `Partida[]`, e calcular **as duas métricas
simultaneamente** — `partidasGanhas` e `somaPontos` — exibidas na mesma tabela de classificação, ordenada
por partidas ganhas com soma de pontos como desempate.
**Justificativa:** as duas são função pura de `partidas[]`. Implementar uma custa o mesmo que implementar
as duas, e escolher uma agora criaria uma pergunta bloqueante sem necessidade. O usuário decide qual olhar
na hora de jogar, não na hora de programar.
**Alternativas consideradas:** só partidas ganhas (perde o critério de desempate e apaga a dimensão de
"quão folgada foi a vitória"); só soma de pontos (não responde "quem ganhou a noite" no formato melhor-de-N).
**Consequências:** as equipes migram de `Partida` para `Torneio` — precisam ser **fixas ao longo da
noite**, senão não há o que agregar. **Confirmado pelo usuário em 2026-09-07:** as duplas são fixas a
noite toda, então a classificação é **por dupla** e `Torneio.equipes` é a modelagem correta. Alternativa
descartada com a confirmação: modelo **por jogador** (jogadores fixos no torneio, equipes remontadas a
cada partida, agregação somando os pontos de qualquer dupla em que a pessoa jogou). Se um dia passarem a
trocar de parceiro, é esse o caminho a retomar — custo estimado ~2 h no motor. Formato `'aberto'` (default, joga até parar) e `'melhor_de'` (encerra
na maioria simples). (A cacheta usaria o mesmo modelo, mas saiu do escopo — ver a decisão acima.)

## 2026-09-07 — Não existe partida solta: toda partida vive dentro de um torneio
**Contexto:** com o nível `Torneio` criado, aparece a tentação de suportar dois casos — "partida avulsa"
(com equipes próprias) e "partida dentro de torneio" (equipes herdadas).
**Decisão:** só existe um caso. Uma partida única é um **torneio com uma partida**. `Partida` não tem
`equipes` nem `id` próprio — só `n`, `rodadas[]` e `status`.
**Alternativas consideradas:** `Partida.equipes?: Equipe[]` opcional, caindo para as do torneio quando
ausente — descartado: duplica a definição de equipe, abre a porta para equipes divergentes entre partidas
do mesmo torneio (o que quebra a agregação) e obriga todo derivado a ter dois caminhos.
**Consequências:** um único caminho de código em toda a árvore de derivados. Custo: abrir o app para uma
partida rápida cria um torneio implícito — resolvido na UI com um botão "partida rápida" que cria o
torneio nos bastidores, sem o usuário ver a palavra "torneio".

## 2026-09-07 — Placar acumulado é derivado das rodadas, nunca armazenado
**Contexto:** o requisito central do buraco é o placar que soma rodada a rodada até o alvo — a folha de
papel que todo mundo usa na mesa. E o app existe para ser **auditado** pelos jogadores: se alguém
contestar a rodada 3, ela tem que ser corrigível sem refazer a partida.
**Decisão:** a árvore `torneio.partidas[].rodadas[]` é a única fonte da verdade. Os **três** níveis de
acumulado — total da rodada, acumulado da partida e classificação do torneio — são **função pura** dela,
recalculados na renderização. Nenhum total mutável em estado, em nenhum nível.
**Alternativas consideradas:** guardar `acumulado` por equipe e ir somando a cada rodada — descartado:
qualquer edição de rodada passada deixa o placar inconsistente, e essa edição **é** o caso de uso.
**Consequências:** editar/apagar qualquer rodada recalcula tudo de graça; undo sai grátis; o histórico
rodada-a-rodada passa a ser o próprio artefato de validação exibido na tela. Custo: recalcular N rodadas
por render — irrelevante (N < 30).

## 2026-09-07 — Fim da partida: alvo, acumulado negativo e empate
**Contexto:** no buraco o total de uma rodada pode ser negativo (não pegou o morto −100, mais as cartas
que sobraram na mão), então o acumulado **cai** entre rodadas. E duas equipes podem cruzar o alvo na
mesma rodada.
**Decisão:** acumulado aceita negativo e é sempre exibido com sinal. A partida encerra **ao fim da
rodada** em que alguma equipe atinge ou passa o alvo — nunca no meio. Duas cruzando juntas: vence o maior
acumulado. Empate exato: rodada de desempate. Alvo configurável, default 3000.
**Alternativas consideradas:** encerrar no instante em que o alvo é cruzado — descartado, a rodada de
buraco só fecha depois de contar a mão de todos, e a penalidade do morto pode reverter a liderança.
**Consequências:** `vencedor(partida)` é função pura do placar; nenhuma regra de fim de jogo fica
espalhada na UI. Impede o bug clássico de declarar vencedor antes de descontar as cartas na mão.

## 2026-09-07 — Câmera é assistente de entrada, não o motor de pontuação
**Contexto:** o pedido original é "via câmera do celular, sem tirar fotos, ele calcula os pontos".
Ler isso como "a câmera resolve o placar" leva o projeto a um beco: o placar do buraco **não é função
das cartas visíveis**. Ele depende de estado de jogo que nenhuma câmera enxerga — quem bateu (+100),
quem não pegou o morto (−100), se a canastra é limpa ou suja, e quantas cartas sobraram na mão
(informação privada até o fim da rodada).
**Decisão:** a câmera entra como **acelerador de digitação**, nunca como fonte da verdade.
Fluxo: aponta → detecta ranks → agrupa em jogos → **propõe** os pontos → humano confirma/edita → grava.
A tela de validação (que o usuário já pediu: "conta para validação dos jogadores") deixa de ser
enfeite e passa a ser o mecanismo de correção do sistema.
**Alternativas consideradas:** (a) câmera como única entrada — descartada, matematicamente insuficiente
e sem caminho de recuperação de erro; (b) foto + upload para servidor fazer a visão — descartada,
contraria "sem tirar fotos", cria custo/privacidade e quebra o uso offline.
**Consequências:** o produto funciona 100% mesmo se a visão errar ou não carregar. A câmera pode ser
cortada sem matar o projeto. Prior art `canastascore.com` adota o mesmo "review before confirm".

## 2026-09-07 — Modelo de 14 classes (ranks), não 52 (rank+naipe)
**Contexto:** todos os datasets/modelos prontos são de 52 classes (poker: rank+naipe).
**Decisão:** treinar/derivar um modelo de **14 classes** — A,2,3,4,5,6,7,8,9,10,J,Q,K,Joker.
**Justificativa:** a pontuação do buraco depende só do rank (5/10/15) e de ser curinga. O naipe só serve
para validar se a sequência é do mesmo naipe — e isso os jogadores já fizeram na mesa.
**Alternativas consideradas:** modelo de 52 classes pré-treinado (HF `mustafakemal0146`, MIT;
`TeogopK`, CC0) — mantido apenas como *baseline* de comparação.
**Consequências:** ~4x menos classes → maior acurácia com modelo nano, arquivo menor (ONNX int8 ~3–6 MB),
inferência mais rápida no fallback WASM. Custo de obtenção: **remap de labels** de dataset existente
(`52 → 13 ranks`), sem anotação manual nova.

## 2026-09-07 — Stack: Vite + React + TS estático, PWA, zero backend
**Contexto:** hospedar no Vercel em conta **free (Hobby)**: 100 GB de transferência, 1 M edge requests,
uso pessoal/não-comercial.
**Decisão:** SPA estática (Vite + React + TS) + `vite-plugin-pwa`, estado em `localStorage`,
visão computacional 100% no cliente via `onnxruntime-web`. Nenhuma serverless function.
**Alternativas consideradas:** (a) Next.js — descartado, App Router não agrega nada aqui e o repo-base
de detecção já é Vite+React; (b) inferência via API do Roboflow — descartada, cria dependência de rede,
limite de cota no free e envia imagem para terceiro.
**Consequências:** custo operacional zero e sem risco de estourar cota (todo o processamento é no
celular do jogador). Funciona offline na mesa, que é o cenário real de uso. Modelo pode ser servido pelo
CDN da Hugging Face se a transferência do Vercel virar gargalo.

## 2026-09-07 — Reaproveitar o shell de detecção, escrever o motor de pontuação
**Contexto:** varredura do GitHub por código pronto (regra de pesquisa de referências).
**Decisão:**
- **Fork/adotar** `nomi30701/yolo-object-detection-onnxruntime-web` (MIT, Vite+React, webcam ao vivo,
  WebGPU com fallback WASM, upload de modelo `.onnx` customizado) como shell de câmera+inferência.
- **Adotar como dados** o gerador sintético `geaxgx/playing-card-detection` (MIT, 441 stars, rotula os
  cantos impressos) e/ou o dataset de 20 k imagens de `TeogopK` (CC0).
- **Escrever do zero** o motor de pontuação e a UI de marcador.
**Alternativas consideradas:** `pontosdacanastra/pontosdacanastra.github.io` — descartado como base:
0 stars, 11 commits, vanilla JS, **sem licença declarada** (sem licença = sem direito de uso). Serve
apenas como referência de UX. Modelos `.pt` prontos: úteis, mas nenhum é 14 classes nem tem joker.
**Consequências:** a parte difícil e chata (pipeline de inferência no browser, WebGPU/WASM, overlay,
NMS) vem de graça e com licença permissiva. O que escrevemos é o que é específico do domínio —
~200 LOC de regras de buraco/cacheta, que nenhum repo entrega correto e que precisa de teste próprio.

## 2026-09-07 — Fatia vertical antes de polimento: F1 é o produto, câmera é F2
**Contexto:** quality gate "vertical slice antes de polish" — a fase 1 tem que ser um caminho
ponta-a-ponta funcional, e o bloqueador conhecido tem que vir primeiro.
**Decisão:** ordem de execução **F0 → F1 → F2 → F3**:
- **F0** motor de pontuação puro em TS, com testes (nenhuma UI).
- **F1** MVP jogável por toque: cacheta (contador de vidas) + buraco (rodada por toque)
  + **placar acumulado da partida** (histórico rodada-a-rodada editável) + **classificação do
  torneio** (partidas ganhas e soma de pontos). **Este é o produto.**
- **F2** câmera assistida, **só no buraco**.
- **F3** polimento divertido: animação, som, histórico, compartilhar resultado.
**Alternativas consideradas:** começar pela câmera (parte "legal") — descartado: é a parte de maior risco
técnico e a de menor valor isolado. Sem F0/F1, uma detecção perfeita não produz placar nenhum.
**Consequências:** existe produto usável no fim de F1, independente de a visão funcionar. F2 pode ser
adiada ou cortada sem retrabalho. Cacheta nunca depende de câmera — é uma decisão de escopo, não uma
limitação a resolver depois.
