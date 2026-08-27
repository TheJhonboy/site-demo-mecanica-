# Histórico do projeto — site da oficina Klaus

Registro de tudo que foi feito, em ordem cronológica. Cada item traz o **pedido**,
o **que mudou** e os **arquivos tocados**, com o commit correspondente.

Horários em **Brasília (UTC−3)**. Os commits no Git guardam o horário em UTC —
por isso a hora aqui aparece 3h antes da que o GitHub mostra por padrão.

- **Repositório:** `TheJhonboy/site-demo-mecanica-`
- **Branch de trabalho:** `claude/mechanic-shop-website-yte9kx`
- **Tipo:** site estático (HTML/CSS/JS puro, sem build) — publica na Vercel sem configuração

---

## Linha do tempo

### 23/08/2026 · 00:37 — Repositório criado
`b6cb86e` · *Initial commit*

Criação do repositório no GitHub, ainda vazio (só o README de uma linha).

**Arquivos:** `README.md`

---

### 23/08/2026 · 02:13 — Primeira versão do site
`af6b769` · *Cria site demo da oficina, focado em conversão para WhatsApp*

**O que foi pedido:** um site demonstrativo de oficina mecânica multimarcas, direto ao
ponto e profissional, com o único objetivo de levar o visitante para o WhatsApp (onde um
bot atende). Endereço claro, lista de serviços clara, calendário com a disponibilidade da
oficina. Endereço e Instagram fictícios. Nome inicial "TorqueMax", identidade em preto e
laranja, hospedagem na Vercel.

**O que foi feito:** estrutura completa do site — topo com status "Aberto agora",
serviços, marcas atendidas, horários com agenda semanal, depoimentos, FAQ, localização
com mapa, bloco de Instagram, rodapé, botão flutuante de WhatsApp e vários CTAs com
mensagem já preenchida por serviço. Dados de contato fictícios centralizados num único
objeto `CONFIG` no JavaScript, para troca fácil pelos dados reais.

**Arquivos:** `index.html`, `css/style.css`, `js/script.js`, `assets/favicon.svg`, `README.md`

---

### 23/08/2026 · 02:49 — Nome Klaus e as primeiras animações
`04545a2` · *Renomeia oficina para Klaus e adiciona animações scroll motion*

**O que foi pedido:** trocar o nome de TorqueMax para **Klaus**; deixar o site com
animações, em especial um efeito de *scroll motion* — a pessoa desliza o dedo e o
conteúdo passa pela tela; e colocar imagens em cada serviço.

**O que foi feito:** renomeação em todo o site (textos, título, dados estruturados),
animações de entrada nas seções, contadores animados, faixa de marcas em movimento e a
primeira versão da galeria controlada por rolagem.

**Arquivos:** `index.html`, `css/style.css`, `js/script.js`, `README.md`

---

### 23/08/2026 · 06:42 — Reescrita para 60fps
`1b43cfa` · *Reescreve o scroll motion como scrub em rAF a 60fps*

**O que foi pedido:** que a animação rodasse de forma fluida, **60fps ou mais**, tanto no
celular quanto no computador.

**O que foi feito:** a galeria foi reescrita como *scrub* de verdade — o listener de
rolagem só anota um número e todo o desenho acontece dentro de um único
`requestAnimationFrame`. Só `transform` e `opacity` são animados (as duas propriedades
que o navegador resolve sem recalcular layout), a geometria é medida uma vez e guardada,
e o loop dorme quando a seção sai da tela. Medido em Chromium: 60fps no desktop e no
celular, inclusive com a CPU 6× mais lenta.

**Arquivos:** `index.html`, `css/style.css`, `js/script.js`, 11 imagens em `assets/img/`, `README.md`

---

### 25/08/2026 · 15:58 — O vídeo vira a primeira tela
`d017b84` · *Coloca o vídeo da oficina como primeira tela, com scrub por scroll e loader*

**O que foi pedido:** você enviou o vídeo e pediu que ele fosse a **tela central** — a
primeira coisa que a pessoa vê ao entrar: tela cheia, uma frase curta no meio, frases
trocando conforme rola, e o botão do WhatsApp logo ali. Também pediu uma **tela de
carregamento com barra vermelha**, que revela o site quando completa.

**O que foi feito:** o vídeo foi transformado em 120 quadros JPEG desenhados num
`<canvas>` — a rolagem passa o vídeo quadro a quadro. Quatro frases se revezam conforme a
rolagem avança. A tela de carregamento mostra o progresso **real** do download dos
quadros (não um timer falso) e trava a rolagem até terminar; se algum arquivo falhar, um
prazo de 8 segundos revela o site mesmo assim, para ninguém ficar preso ali.

Três problemas de desempenho foram resolvidos nesta etapa, cada um medido antes de
mexer: o custo de decodificar cada quadro (WebP 1080 custava 26ms, JPEG 720 nativo custa
6ms, contra um orçamento de 16,7ms por quadro), o canvas sendo redesenhado do zero
durante a rolagem (resolvido promovendo-o a camada de GPU) e os aparelhos mais fracos
(resolvido pulando quadros automaticamente quando o aparelho não dá conta).

**Sobre a resolução:** o vídeo original é 720×1280. Ampliar para 2K não cria detalhe que
não existe — só deixa mais pesado e mais mole. Ficou em 720p nativo, que é o mais nítido
que esse material entrega.

**Arquivos:** `index.html`, `css/style.css`, `js/script.js`, `assets/video/` (vídeo, poster e 120 quadros), `README.md`

---

### 25/08/2026 · 22:18 — Fotos reais no lugar dos placeholders
`6dd78b4` · *Troca os placeholders dos serviços por recortes do vídeo real*

**O que foi pedido:** nada de imagens vetoriais ou genéricas — você queria fotos de
verdade.

**O que foi feito:** as 11 imagens dos serviços passaram a ser recortes do seu próprio
vídeo (mesmo carro, mesma luz), o que dá identidade visual coesa ao site inteiro. Roda
com pinça de freio, farol, painel, bancos, retrovisor.

**Ressalva honesta:** o vídeo mostra um carro pronto, não a oficina trabalhando. Por isso
**Motor** e **Bateria** ficaram com imagem de contexto (frente e traseira do carro) em vez
de foto do serviço em si. São as duas primeiras a trocar quando houver fotos reais.

**Arquivos:** 11 imagens em `assets/img/`, `README.md`

---

### 26/08/2026 · 15:35 — Dica de movimento e agenda vira gráfico
`82593a3` · *Adiciona dica de movimento no vídeo e troca a agenda por gráfico de movimento*

**O que foi pedido:** duas coisas. Você relatou que a primeira tela parecia **estática**.
E, sobre a agenda semanal, pediu que ficasse **igual à do Google**, em forma de gráfico,
mostrando os dias lotados e os dias mais tranquilos.

**O que foi feito:**

1. *Dica de movimento* — parado no topo, a primeira tela era indistinguível de uma foto:
   nada sinalizava que a rolagem controla o vídeo. Agora o vídeo anda sozinho uns 9
   quadros e volta enquanto ninguém rolou, e a seta ganhou o rótulo "role para ver o
   vídeo". A dica morre no primeiro scroll e se encerra sozinha depois de algumas voltas,
   para não segurar um `requestAnimationFrame` eterno gastando bateria.
2. *Gráfico de movimento* — a grade semanal virou um gráfico por hora no estilo "horários
   de pico" do Google: abas de Seg a Dom, barras coloridas em três níveis (tranquilo,
   movimentado, lotado), marca de "agora" no dia corrente e uma frase dizendo quando o dia
   está mais vazio. Domingo aparece como fechado. Os números são fictícios e ficam em
   `CONFIG.popularTimes`.

**Arquivos:** `index.html`, `css/style.css`, `js/script.js`

---

### 26/08/2026 · 15:41 — Vídeo passa a rodar sozinho dentro de frames
`ca8fe3e` · *Faz o vídeo rodar sozinho quando o site está dentro de um frame*

**O que foi pedido:** você insistiu que o vídeo não rodava — a tela continuava parada.

**Qual era a causa:** você estava vendo o site pela prévia, que roda o site dentro de um
`<iframe>`. Nesse caso quem rola é o container de fora: o `window.scrollY` da página fica
em zero para sempre, o scrub congela no primeiro quadro e a primeira tela vira uma foto.
Não era o site — foi confirmado gravando a tela de um navegador real em tamanho de
celular, onde o vídeo passa normalmente.

**O que foi feito:** se o site detecta que está dentro de um frame, o vídeo já entra
rodando sozinho em loop de 16 segundos. O primeiro scroll que de fato chegar desliga o
loop e devolve o controle para o dedo. Numa aba normal do navegador nada disso acontece —
o scrub continua sendo o comportamento padrão.

**Arquivos:** `js/script.js`

---

### 26/08/2026 · 15:42 — Documentação
`397853e` · *Documenta o gráfico de movimento, a dica de rolagem e o modo em frame*

Registro no README de como editar os números do gráfico, o que é a dica de rolagem e como
funciona o modo automático dentro de frames.

**Arquivos:** `README.md`

---

### 26/08/2026 · 16:20 — Vídeo de fundo rodando sozinho, sem esticar no computador
`(este commit)` · *Troca o scrub por vídeo de fundo em loop, encaixado pela altura no desktop*

**O que foi pedido:** você abriu o site publicado na Vercel, num monitor largo, e o vídeo
estava **esticado e feio** — e continuava parecendo parado. Pediu: vídeo rodando de fundo,
sem depender de rolagem, e cortando as laterais com barra na cor do site para ele caber
numa resolução boa e ficar nítido no computador.

**O que foi feito:**

1. *Roda sozinho* — a primeira tela deixou de ser um scrub controlado pela rolagem e virou
   um `<video>` normal, tocando em loop assim que carrega. A seção também encolheu de 450vh
   para uma tela cheia: rolou uma vez, já está nos serviços.
2. *Não estica mais* — o material é vertical (720×1280). Numa tela de 1920px, preencher a
   largura ampliava o vídeo quase 3×, daí o borrão. Agora ele se encaixa pela **altura** e
   as laterais ficam na cor do site. No celular, tela também vertical, ele preenche
   naturalmente, sem barra.
3. *Dois formatos* — MP4/H.264 (3,5 MB, decodificado em hardware, poupa bateria) e
   WebM/VP9 (2,1 MB) para navegadores sem H.264. O áudio foi removido dos dois.
4. *Mais leve* — os 120 quadros JPEG (6 MB) saíram do repositório; o vídeo é um arquivo só.
   O carregamento caiu de ~4,6s para menos de 1s em rede boa.
5. As frases agora trocam acompanhando o tempo do vídeo, então a volta do loop e a volta
   das frases coincidem.

**Arquivos:** `index.html`, `css/style.css`, `js/script.js`, `assets/video/` (WebM novo, MP4 sem áudio, 120 quadros removidos), `README.md`

---

### 27/08/2026 · 04:47 — Vídeo destrava no toque quando o navegador recusa o autoplay
`(este commit)` · *Destrava o vídeo no primeiro gesto e mantém as frases girando*

**Por que mexer nisso:** o vídeo de fundo já roda sozinho, mas existe um caso em que
nenhum site consegue começar tocando: **Safari em modo de baixo consumo**, economia de
dados e algumas políticas de energia recusam o autoplay mesmo com o vídeo mudo. Nesse
cenário a pessoa cai numa tela parada no poster — exatamente a impressão de "site travado"
que você vinha relatando.

**O que foi feito:**

1. *Destrava no primeiro gesto* — se o navegador recusa o autoplay, o site passa a esperar
   o primeiro toque, rolagem ou tecla e tenta tocar de novo ali. É o próprio navegador que
   exige esse gesto, então é o único caminho que funciona.
2. *A tela nunca fica muda* — enquanto o vídeo não estiver correndo (recusado, pausado ou
   engasgado na rede), as frases passam a girar no relógio. Quando o vídeo pega, o relógio
   sai e quem manda nas frases volta a ser o tempo do vídeo.

**Um erro meu, encontrado no teste:** a primeira versão amarrava o desligamento do relógio
a um único evento `playing`. Ao simular a recusa de verdade num navegador, um `playing`
solto chegava antes da hora e matava o relógio — resultado: vídeo parado **e** frases
paradas, pior que antes. A decisão passou a ser uma checagem do estado real do vídeo,
disparada por qualquer mudança (`play`, `pause`, `waiting`, `stalled`, `ended`, `error`).

**Como foi verificado:** navegador de verdade com o autoplay bloqueado na marra (o atributo
`autoplay` do HTML não passa por `play()`, então foi preciso interceptar os dois). Resultado:
vídeo parado no início, frases girando mesmo assim (0 → 0.3), toque na tela liberou o vídeo,
e a partir daí as frases voltaram a seguir o tempo do vídeo. Zero erros de JavaScript.
No caminho normal nada mudou: desktop encaixado pela altura, celular preenchendo a tela,
ambos tocando em loop, revelados em ~165ms.

**Arquivos:** `js/script.js`

---

## O que ainda está pendente

- **Fotos suas.** Você disse que enviaria imagens. Duas frentes: as 11 fotos dos serviços
  (Motor e Bateria são as mais urgentes) e a galeria com rolagem, que hoje usa as mesmas
  fotos dos serviços — como são todas do mesmo carro, rolar ali quase não muda nada.
  Quanto mais variadas, mais a rolagem vira movimento de verdade.
- **Publicação na Vercel.** A rede da máquina onde o assistente roda bloqueia o acesso à
  Vercel (o gateway responde 403), então a publicação parte do seu navegador:
  Add New → Project → importar `site-demo-mecanica-` → em **Branch** escolher
  `claude/mechanic-shop-website-yte9kx` → Deploy. O passo que costuma dar errado é o da
  branch: por padrão a Vercel pega `main`, que está vazia.
- **Dados reais.** Número de WhatsApp, Instagram, endereço, telefone e o mapa continuam
  fictícios. O README explica onde trocar cada um.

---

## Como este arquivo é mantido

Cada mudança no site entra em um commit separado, com mensagem explicando **o que** mudou
e **por quê**, e ganha uma entrada nova aqui em cima da lista, com data e hora. O histórico
completo com os horários exatos também fica no Git:

```
git log --date=iso-strict --pretty=format:"%h %ad %s"
```
