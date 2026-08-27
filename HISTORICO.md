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

### 27/08/2026 · 04:58 — Galeria com rolagem ganha imagens de verdade diferentes
`(este commit)` · *Troca a galeria por 8 cenas distintas do vídeo, em resolução de tela cheia*

**O que foi pedido:** no comentário sobre essa seção você escreveu que ali *"precisa ser
uma outra imagem scrolável para que funcione de forma dinâmica"*.

**Qual era o problema, de fato:** a galeria reaproveitava as mesmas 10 fotos dos serviços.
Colocadas lado a lado, não eram 10 cenas — eram **5**: o mesmo farol aparecia duas vezes,
a mesma roda com pinça vermelha três vezes, o mesmo painel duas vezes. Como quadros
vizinhos eram praticamente a mesma imagem, rolar não mudava nada na tela. Havia também um
segundo problema de qualidade: as imagens são 800×600, feitas para os cards de serviço,
mas a galeria exibe em **tela cheia** — num monitor de 1080p isso significa ampliar 2,4×.

**O que foi feito:**

1. *8 cenas distintas em vez de 10 repetidas* — o vídeo foi mapeado quadro a quadro e tem
   cerca de 8 assuntos diferentes: farol, roda com pinça, retrovisor, lanterna, tampa
   traseira, painel, banco e a frente com o farol aceso. Melhor 8 realmente diferentes do
   que 10 com repetição: agora cada rolada troca a imagem de verdade. A ordem foi montada
   para que quadros vizinhos contrastem (exterior → interior → detalhe → interior).
2. *Resolução própria para tela cheia* — arquivos novos em 1440×1080, separados dos
   serviços, gerados com lanczos e leve realce. Somam 588 KB e carregam sob demanda.
3. *O contador deixou de mentir* — o "/ 10" estava fixo no HTML e continuaria errado a cada
   troca de galeria. Agora o total sai da contagem real de imagens.
4. *Menos marca à mostra* — a última imagem era a tampa traseira com o logo da montadora em
   destaque, o que destoa de uma oficina **multimarcas**. Foi trocada pela frente com o
   farol aceso, que combina melhor com a legenda "Entrega" e não mostra marca.

**Verificado em navegador:** percorrendo a seção, as 8 imagens aparecem (8 de 8 distintas),
o contador vai de 1/8 a 8/8, os títulos passam na ordem, nenhuma imagem quebrada e nenhum
erro de JavaScript. Conferido também em tela de celular, onde o corte é mais agressivo:
os oito assuntos continuam reconhecíveis.

**O que isso ainda não resolve — e é bom você saber:** continua sendo **um único carro**,
o do seu vídeo, e um carro pronto, não a oficina trabalhando. Não há ferramenta, elevador
nem mecânico em nenhuma imagem. E, como a fonte é 720p na vertical, tela cheia no
computador é inevitavelmente um pouco mole. As duas coisas só se resolvem com fotos reais
da oficina.

**Arquivos:** `index.html`, `js/script.js`, 8 imagens novas em `assets/img/`

---

### 27/08/2026 · 16:29 — Cards de serviço deixam de repetir a mesma foto
`(este commit)` · *Refaz os 10 recortes dos serviços e tira a marca da montadora de cena*

**O que foi pedido:** no comentário sobre os serviços você escreveu que ali *"precisa de
outras imagens para ficar mais diversificado"*.

**Qual era o problema, de fato:** o mesmo defeito da galeria, e bem visível na grade. As 10
fotos eram 6 cenas: **Motor e Sistema Elétrico usavam o mesmo farol**, um logo abaixo do
outro na grade de 4 colunas; **Pneus, Freios e Suspensão usavam a mesma roda**; e
**Ar-Condicionado e Diagnóstico usavam o mesmo painel**. Além disso, o card de Bateria
mostrava a tampa traseira com o **logo da montadora em destaque** — o que passa a mensagem
errada num site de oficina multimarcas.

**O que foi feito:**

1. *10 recortes que não se repetem* — em vez de recortes quase idênticos da mesma cena, cada
   card ganhou um enquadramento próprio, variando o assunto e a aproximação. Freios virou um
   macro na pinça vermelha; Pneus ficou com a roda inteira e o pneu; Suspensão passou a ser a
   frente baixa com o para-choque, e não mais o farol. Assim nenhum par de cards lê como a
   mesma foto.
2. *Marca fora de cena* — o card de Bateria trocou a tampa traseira pelo retrovisor. Não
   sobrou logo de montadora em nenhum card.
3. *Textos alternativos honestos* — os `alt` descreviam coisas que não estão nas imagens
   ("mecânico realizando manutenção em motor"). Não há mecânico nem motor em nenhuma foto.
   Agora descrevem o que a foto realmente mostra — isso vale para quem usa leitor de tela e
   para busca.
4. *Instagram sem repetir os cards* — os seis quadradinhos da seção do Instagram usavam as
   mesmas fotos dos serviços. Passaram a usar as da galeria, que não aparecem nos cards.

**Verificado em navegador:** 10 cards, 8 imagens na galeria, nenhuma imagem quebrada, 18
links de WhatsApp, gráfico de movimento intacto, vídeo tocando no desktop e no celular, e o
destravamento por toque continua funcionando com o autoplay bloqueado. Zero erros de
JavaScript. Todas as imagens do site somam 1,1 MB e carregam sob demanda.

**A ressalva continua a mesma:** é um carro só, o do seu vídeo, e um carro pronto. Não há
ferramenta, elevador nem mecânico em nenhuma imagem. Os recortes agora são variados, mas
variedade de enquadramento não substitui foto de serviço de verdade.

**Arquivos:** `index.html`, 10 imagens em `assets/img/`

---

### 27/08/2026 · 17:22 — Fim das barras pretas na primeira tela
`(este commit)` · *Põe o vídeo desfocado ao fundo e aumenta o nítido no centro*

**O que foi pedido:** você abriu a prévia e disse que a primeira tela ficou feia no
computador — *"cortou a imagem, ficou amarronada, preta nas laterais, uma coisa esquisita"*
— e que era para **cortar só um pouquinho as laterais**, não encher de barra.

**Eu errei antes, e vale registrar por quê.** Na conversa anterior você tinha dito "corte as
laterais, deixa uma barra preta", mas emendou que ia pensar numa ideia melhor. Eu fui pelo
caminho literal: encaixei o vídeo pela altura e pintei as laterais. Numa tela de 1400px isso
deixava o vídeo numa faixa de 495px — **dois terços da tela em preto morto**. Não parecia
decisão de design, parecia buraco. E, num quadro tão estreito, o movimento quase não se
percebe: é parte da razão de você continuar vendo a tela como parada.

**Por que não dava para simplesmente preencher:** o vídeo é 720×1280 (em pé) e a tela do
computador é deitada. As duas proporções são quase 3× diferentes. Preencher a largura
ampliava o vídeo 2× e cortava 70% da altura — foi o "repuxado" que você reclamou antes.
Encaixar pela altura deixava as barras. Não existe meio-termo entre os dois.

**O que foi feito** — a saída que Instagram e YouTube usam para vídeo em pé:

1. *O fundo virou o próprio vídeo* — uma segunda cópia preenche a tela inteira, ampliada e
   desfocada. As laterais passam a carregar a cor e o movimento da cena, em vez de preto.
   O contraste do desfoque é reduzido de propósito: sem isso, as cenas escuras do interior
   do carro voltavam a virar duas barras pretas.
2. *O vídeo nítido ficou maior* — antes ocupava 35% da largura; agora ocupa 58%, com teto de
   936px. Esse teto é 1,3× o tamanho original: é o limite em que ainda não aparece borrão.
   Em telas até 1100px ele nem chega a ser ampliado — fica menor que o original, ou seja,
   mais nítido ainda.
3. *No celular nada mudou* — a tela também é vertical, o vídeo preenche sozinho. O vídeo de
   fundo fica escondido **e pausado**, para não gastar bateria decodificando o que ninguém vê.
4. *Os dois andam juntos* — se a distância entre eles passa de meio segundo, o de trás é
   recolocado no ponto do da frente. Desfocado, ninguém nota o ajuste.

**Medido em navegador:** 1920px → vídeo com 936px (49% da tela, ampliação 1,30×);
1400px → 812px (58%, 1,13×); 1100px → 638px (58%, 0,89×, sem ampliar nada);
celular → 100% da tela, fundo desligado e pausado. Os dois vídeos em sincronia (2 a 3
centésimos de diferença). Sem erros de JavaScript, e o destravamento por toque continua
funcionando com o autoplay bloqueado.

**Arquivos:** `index.html`, `css/style.css`, `js/script.js`

---

### 27/08/2026 · 17:45 — Suas fotos entram nos serviços
`(este commit)` · *Troca 9 imagens de serviço pelas fotos reais enviadas por você*

**O que foi pedido:** você mandou as fotos num arquivo `.zip` como anexo, depois de duas
tentativas que não chegaram como arquivo (foto no chat e pasta do Drive — o Drive é
bloqueado pela rede desta máquina e as ferramentas dele não estão disponíveis nesta sessão).

**O que foi feito:** as 8 fotos foram identificadas, recortadas em 4:3 para os cards
(960×720, saindo de originais de 2816×1536 na maioria) e instaladas:

| Card | Foto |
| --- | --- |
| Freios | disco ventilado com pinça vermelha e pastilhas |
| Bateria e Alternador | bateria com cabos de teste e alternador |
| Pneus e Alinhamento | pneu em roda de liga no box de alinhamento |
| Revisão Completa | mecânico com o checklist e o capô aberto |
| Ar-Condicionado | difusores soprando ar gelado |
| Estofamento e Bancos | banco de couro na bancada, com linha e ferramentas |
| Diagnóstico e Injeção | scanner ligado ao carro mostrando as leituras |
| Sistema Elétrico | farol aceso com caixa de fusíveis, chicote e multímetro |

**Motor** ganhou um recorte fechado do vão do motor, tirado da mesma foto do capô aberto —
enquadramento bem diferente do card de Revisão, que mostra o mecânico e a prancheta.

**A foto do topo** passou a ser a mesma cena do capô aberto, em versão larga. Ela aparece a
50% de opacidade atrás do texto, então funciona como ambiente de oficina sem competir com a
foto do card.

Os textos alternativos foram reescritos para descrever cada foto nova.

**O que ainda falta:** **Suspensão** é o único card sem foto real. Não há nada no conjunto
que sirva, e forçar um recorte de outra foto traria de volta a repetição que acabamos de
resolver. Por ora ficou o recorte antigo do vídeo, mas com o tom escurecido para não destoar
das fotos de oficina ao redor. É provisório e some assim que chegar a imagem certa.

**Verificado em navegador:** 10 cards, nenhuma imagem quebrada, 18 links de WhatsApp,
galeria e gráfico intactos, vídeo tocando no desktop e no celular. As imagens do site somam
1,8 MB, carregadas sob demanda.

**Arquivos:** `index.html`, 10 imagens em `assets/img/`

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
