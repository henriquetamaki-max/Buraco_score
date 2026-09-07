# Placar de Buraco

Contador de pontos de **buraco / canastra** para jogar na mesa. Abre no navegador do celular, instala na
tela de início e funciona sem internet. Sem conta, sem cadastro, sem anúncio, sem servidor — o placar
fica guardado no seu próprio aparelho.

| Placar da partida | Classificação da noite |
|---|---|
| ![Placar da partida](docs/placar.png) | ![Classificação da noite](docs/classificacao.png) |

## Para que serve

Substitui o papel e a caneta da mesa de buraco. Ele soma três coisas ao mesmo tempo:

- **a rodada** — quanto cada dupla fez naquela mão;
- **a partida** — o acumulado, rodada a rodada, até alguém chegar aos 3000;
- **a noite** — quantas partidas cada dupla ganhou e quantos pontos fez no total.

O diferencial é a **correção**: se no meio da partida alguém contestar a rodada 3, você toca nela,
arruma, e todo o placar abaixo se refaz sozinho. Não precisa recomeçar nem refazer conta nenhuma.

## Como usar

### 1. Instalar no celular

Abra o endereço do app no navegador do celular. No menu do navegador, escolha **Adicionar à tela de
início** (Android) ou **Adicionar à Tela de Início** (iPhone, pelo botão de compartilhar).

Pronto — vira um ícone como o de qualquer aplicativo, e a partir daí abre offline.

> O endereço público ainda não foi definido. Enquanto isso, dá para rodar no seu computador seguindo a
> seção [Para desenvolvedores](#para-desenvolvedores).

### 2. Começar

- **Partida rápida** — um toque e já está jogando: Nós contra Eles, até 3000 pontos, sem limite de
  partidas. É o caminho para a maioria das noites.
- **Nova noite** — quando você quiser nomear as duplas, mudar o alvo (3000 é o padrão) ou jogar num
  formato "melhor de 3, 5 ou 7".

As duplas ficam fixas a noite toda. É isso que permite somar as partidas entre si no fim.

### 3. Lançar uma rodada

Ao fim de cada mão, toque em **Nova rodada**. Para cada dupla, preencha:

- **Cartas baixadas** — o que está na mesa, sem contar o bônus de canastra. Toque no valor da carta para
  somar uma (o número vermelho no canto mostra quantas você já pôs; toque nele para tirar uma). Quem
  preferir somar de cabeça troca para a aba **Digitar o total**.
- **Canastras** — use o mais e o menos em cada tipo. O app já sabe quanto cada uma vale.
- **Bateu** — marque na dupla que bateu. Só uma dupla bate por rodada, então marcar numa desmarca a outra.
- **Pegou o morto** — vem marcado, porque é o caso comum. Desmarque se a dupla não pegou, e o app
  desconta os 100.
- **Cartas que sobraram na mão** — mesmo teclado das baixadas. Elas descontam.

O total da dupla aparece grande, no alto do bloco, e vai mudando conforme você preenche. Verde para
positivo, vermelho para negativo. Confira antes de tocar em **Confirmar rodada**.

### 4. Conferir e corrigir

Na tela do placar, cada linha é uma rodada e o rodapé é o acumulado. **Toque em qualquer linha para
abrir aquela rodada de novo**, corrigir e salvar — ou apagá-la. O placar se recalcula na hora.

### 5. Ver quem está ganhando a noite

Toque na seta do canto superior esquerdo. A classificação mostra as duas contas lado a lado: **ganhas**
(quantas partidas) e **pontos** (a soma de todas). A ordem é por partidas ganhas, e a soma de pontos
desempata.

## O que ele calcula

| Item | Pontos |
|---|---|
| 3, 4, 5, 6, 7 | 5 cada |
| 8, 9, 10, J, Q, K | 10 cada |
| Ás | 15 cada |
| Curinga — o `2` ou o joker impresso | 10 cada |
| Canastra limpa | 200 |
| Canastra suja | 100 |
| Ás ao Rei, 13 cartas | 500 |
| Ás ao Ás, 14 cartas | 1000 |
| Batida | +100 |
| Não pegou o morto | −100 |
| Cartas que sobraram na mão | descontam o próprio valor |

**Total da rodada** = baixadas + canastras + batida − penalidade do morto − cartas na mão.

Duas regras que o app trata com cuidado, porque são onde a conta manual costuma errar:

1. **A rodada pode dar negativo**, e aí o acumulado da dupla cai. Não pegar o morto custa 100, e as
   cartas na mão ainda descontam por cima.
2. **A partida só termina no fim da rodada**, nunca no instante em que alguém passa dos 3000. A
   penalidade do morto e as cartas na mão podem derrubar quem já tinha passado. Se as duas duplas
   terminarem empatadas acima do alvo, o app não declara vencedor — vai para rodada de desempate.

## Perguntas frequentes

**Preciso de internet?** Só para abrir da primeira vez. Depois disso funciona offline.

**Meus dados vão para algum servidor?** Não. Não existe servidor. Tudo fica no armazenamento do próprio
navegador do seu aparelho.

**Se eu trocar de celular, o placar vai junto?** Não. Como não há conta nem nuvem, o histórico fica no
aparelho onde você jogou.

**Dá para jogar em mais de duas duplas?** Sim. Em **Nova noite**, toque em "Mais uma dupla" quantas vezes
precisar.

**E se eu limpar os dados do navegador?** O histórico das noites se perde. É o custo de não ter cadastro.

**Serve para cacheta?** Não. Este app é só de buraco/canastra.

## Para desenvolvedores

Precisa de [Node.js](https://nodejs.org) 20 ou mais novo.

```
git clone https://github.com/henriquetamaki-max/Buraco_score.git
cd Buraco_score
npm install
npm run dev
```

Outros comandos:

```
npm run build      # typecheck + bundle + service worker em dist/
npm run preview    # serve o dist/ para conferir o build de produção
npm test           # 46 testes do motor de pontuação
npm run check      # typecheck + testes
npm run icones     # regera os ícones PNG do PWA
```

### Arquitetura

- **Vite + React + TypeScript**, aplicação estática. Zero backend, zero função serverless — dá para
  hospedar em qualquer lugar que sirva arquivos, inclusive nos planos gratuitos.
- `src/engine/` é o motor de pontuação: TypeScript puro, sem interface, sem entrada e saída, sem estado.
  É onde vivem as regras, e é o que tem os 46 testes.
- `src/telas/` e `src/componentes/` são a interface. O estado da aplicação fica em `localStorage`.
- Os ícones do PWA saem de `scripts/gerar-icones.mjs`, que escreve o PNG na mão usando o `zlib` do
  próprio Node — três imagens não justificavam a dependência do `sharp`.

A decisão central: **nenhum total é armazenado**. Rodada, partida e classificação são todas função pura
da árvore `torneio → partidas → rodadas`, recalculadas a cada renderização. É isso que faz a correção de
uma rodada passada funcionar de graça, e é por isso que o histórico exibido na tela nunca diverge do
placar. O raciocínio completo, com as alternativas descartadas, está em [`DECISOES.md`](DECISOES.md).

Estado do projeto, regras de negócio e armadilhas operacionais estão em [`MEMORIA.md`](MEMORIA.md).
Histórico de versões em [`CHANGELOG.md`](CHANGELOG.md).

## Próximo passo

**Câmera assistida.** A ideia é apontar a câmera do celular para as cartas na mesa — sem tirar foto, com
o quadro processado na memória e descartado — e o app **propor** a pontuação da rodada, para os jogadores
conferirem e confirmarem na tela.

A câmera entra como acelerador de digitação, nunca como fonte da verdade. O placar do buraco não é função
das cartas visíveis: depende de quem bateu, de quem pegou o morto e das cartas que sobraram na mão, que é
informação privada até o fim da rodada. Por isso o app funciona inteiro sem a câmera, e continuará
funcionando se ela errar.

Detalhe técnico que simplifica bastante: para pontuar, **o naipe é irrelevante**. O valor depende só do
valor da carta e de ela ser curinga — então o modelo de visão precisa distinguir 14 classes, não 52.

## Licença

A definir. Se a fase da câmera adotar um dos modelos YOLO prontos (Ultralytics, AGPL-3.0), o projeto
herda a obrigação de manter o código aberto — que é o motivo de este repositório já nascer público.
