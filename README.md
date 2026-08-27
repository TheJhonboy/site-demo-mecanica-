# site-demo-mecanica-
Site demonstrativo para uma oficina mecânica ("Klaus"), focado em levar o visitante direto para o WhatsApp.

Site estático (HTML/CSS/JS puro, sem build) com:
- Seções de serviços (motor, pneus, revisão, freios, suspensão, elétrica, bateria, ar-condicionado, estofamento, diagnóstico);
- Marcas atendidas (Honda, Chevrolet, Volkswagen, Fiat, Hyundai, Toyota, Renault, Ford, Nissan...);
- Horários de funcionamento + gráfico de movimento da semana (estilo "horários de pico" do Google);
- Localização com endereço fictício e mapa incorporado;
- Bloco de Instagram e depoimentos;
- Botão flutuante e vários CTAs de WhatsApp com mensagem pré-preenchida por serviço.

## Para assistentes de IA
Se você é um agente de IA trabalhando neste repositório, leia
**[`AGENTS.md`](AGENTS.md)** antes de mexer em qualquer arquivo: ele traz o funcionamento
das partes não óbvias com o motivo de cada uma, as armadilhas conhecidas e as decisões que
não devem ser reabertas.

## Histórico do projeto
Todas as etapas, com data, hora, o que foi pedido e o que mudou, estão em
[HISTORICO.md](HISTORICO.md).

## Como visualizar
Basta abrir `index.html` no navegador, ou servir a pasta com qualquer servidor estático:

```
npx serve .
```

## Como personalizar (todos os dados são fictícios)
Edite `js/script.js`, no topo do arquivo, o objeto `CONFIG`:

- `whatsappNumber`: número real da oficina (só dígitos, com DDI 55 + DDD).
- `instagramUrl`: link do Instagram real da oficina.
- `businessHours`: horário de funcionamento usado no indicador "Aberto agora".
- `popularTimes`: movimento estimado por hora, que alimenta o gráfico da seção
  "Horários". Cada dia é uma lista de números de 0 a 100, uma posição por hora,
  começando na primeira hora de `businessHours` daquele dia. `null` = fechado.
  Abaixo de 40 aparece como "tranquilo", de 40 a 71 "movimentado", 72 ou mais
  "lotado".

Em `index.html`:
- Endereço, telefone e e-mail aparecem na topbar, na seção "Localização" e no rodapé — troque pelos dados reais.
- O mapa (`<iframe>` na seção `#localizacao`) usa um endereço fictício. Depois de criar o local real no Google Maps, gere o link em "Compartilhar → Incorporar mapa" e substitua o `src` do iframe.
- Depoimentos, marcas e demais textos são exemplos genéricos — ajuste conforme a oficina real.
- O JSON-LD (dados estruturados) no `<head>` usa os mesmos dados fictícios — atualize junto.

## Fotos dos serviços
Os 10 cards de `#servicos` usam **fotos reais de oficina**, em 4:3, 960×720, em
`assets/img/servico-*.jpg`. Cada card tem a sua: nenhuma imagem se repete entre dois
cards, e nenhuma mostra logotipo de montadora.

| Arquivo | O que mostra |
| --- | --- |
| `servico-motor.jpg` | vão do motor com o capô aberto |
| `servico-pneus.jpg` | pneu em roda de liga, no box de alinhamento |
| `servico-revisao.jpg` | mecânico conferindo o checklist |
| `servico-freios.jpg` | disco ventilado com pinça vermelha e pastilhas |
| `servico-suspensao.jpg` | amortecedor com mola esportiva na bancada |
| `servico-eletrica.jpg` | farol aceso, caixa de fusíveis, chicote e multímetro |
| `servico-bateria.jpg` | bateria com cabos de teste e alternador |
| `servico-arcondicionado.jpg` | difusores do painel soprando ar gelado |
| `servico-estofamento.jpg` | banco de couro na bancada de estofamento |
| `servico-diagnostico.jpg` | scanner ligado ao carro, mostrando as leituras |

`hero-oficina.jpg` é o fundo do bloco de abertura, exibido a 50% de opacidade atrás do
texto — por isso serve uma foto de ambiente, e não um detalhe.

**Para trocar qualquer uma:** sobrescreva o arquivo mantendo o mesmo nome. Nenhuma
alteração de código é necessária. Recomendado: horizontal, 4:3, 960×720 ou maior.

Se a foto vier em outra proporção, o recorte usado no projeto foi:
```
ffmpeg -i entrada.jpg -vf "crop=2048:1536:384:0,scale=960:720:flags=lanczos" -q:v 3 \
  assets/img/servico-freios.jpg
```
(`crop=largura:altura:x:y` — ajuste `x`/`y` para enquadrar o assunto.)

**Ao trocar uma foto, troque também o `alt` correspondente em `index.html`.** O texto
alternativo precisa descrever o que a imagem realmente mostra: é o que o leitor de tela lê
e o que a busca indexa.

## O vídeo da primeira tela
A primeira coisa que o visitante vê é o vídeo da oficina rodando sozinho em loop, com uma
frase curta no centro e o botão do WhatsApp. Não depende de rolagem: entra tocando.

### Por que ele não estica nem deixa barra preta
O material é **vertical, 720×1280**, e a tela do computador é deitada — as proporções são
quase 3× diferentes. Os dois caminhos óbvios falham: preencher a largura amplia o vídeo 2×
e corta 70% da altura (fica borrado); encaixar pela altura deixa dois terços da tela em
preto.

A solução são **dois elementos `<video>`** compartilhando o mesmo arquivo:

- `#vheroFundo` preenche a tela, ampliado e desfocado. As laterais carregam a cor e o
  movimento da própria cena, em vez de virarem barra.
- `#vheroVideo` fica nítido no centro, com `width: min(100%, 58vw, 936px)`. O teto de
  936px é 1,3× o tamanho nativo — o limite antes de aparecer borrão. Em telas até 1100px
  ele nem chega a ser ampliado.

No celular a tela também é vertical: o da frente preenche sozinho (`object-fit: cover`) e
o de trás fica escondido **e pausado** — vídeo escondido continuaria decodificando e
gastando bateria. A troca é feita por `@media (orientation: portrait)`.

O `contrast(.78)` no desfoque não é enfeite: sem ele, as cenas escuras do interior do
carro fazem as laterais virarem preto puro de novo.

### Dois formatos
| arquivo | codec | tamanho | para quem |
|---|---|---|---|
| `oficina.mp4` | H.264 | 3,5 MB | todo mundo — decodificado em hardware, poupa bateria |
| `oficina.webm` | VP9 | 2,1 MB | navegadores sem H.264 (algumas builds de Chromium, Firefox no Linux) |

O JavaScript escolhe com `canPlayType` e prefere o MP4. Os dois são mudos (a trilha de
áudio foi removida — o vídeo toca sem som de qualquer forma).

Para trocar o vídeo: substitua `assets/video/oficina.mp4`, gere o WebM e um novo poster:
```
ffmpeg -i novo.mp4 -c:v copy -an -movflags +faststart assets/video/oficina.mp4
ffmpeg -i assets/video/oficina.mp4 -c:v libvpx-vp9 -crf 33 -b:v 0 -an assets/video/oficina.webm
ffmpeg -i assets/video/oficina.mp4 -frames:v 1 -q:v 4 assets/video/poster.jpg
```

### As frases
As quatro frases trocam acompanhando o **tempo do vídeo**, não um cronômetro solto — a
volta do loop e a volta das frases coincidem. Cada `<p class="vhero__line">` tem um
`data-at` (0 a 1) dizendo em que ponto do vídeo ela assume. Para mudar os textos, edite
direto no `index.html`.

Se o navegador recusar o autoplay (política de economia de bateria, aba em segundo plano),
o poster fica na tela e as frases passam a girar no tempo: a primeira tela nunca fica muda.
Com `prefers-reduced-motion` ativado o vídeo não toca — fica só o poster.

### Tela de carregamento
`#loader` mostra o progresso **real** do download do vídeo (não um timer falso): o arquivo
é baixado em pedaços com `fetch` e vira um blob que o `<video>` consome já pronto, então a
primeira tela não começa engasgando. Um prazo de 8s revela o site de qualquer forma —
ninguém pode ficar preso na tela de carregamento por causa de um arquivo.

## A galeria de fotos com scroll (mais abaixo na página)
A seção `#scrollshow` é um scrub controlado pelo scroll: as fotos são as frames e o
dedo/roda controla a posição, como arrastar a linha do tempo de um vídeo.

São **8 imagens próprias** (`assets/img/galeria-*.jpg`, 1440×1080), separadas das dos
serviços de propósito: repetir as mesmas fotos fazia a rolagem não mudar nada na tela.
Cada quadro tem legenda própria (`data-title` e `data-text` no `<img>`), e o total do
contador sai da contagem real de imagens — trocar a galeria não deixa número velho para
trás. Hoje 1 das 8 é foto de oficina; as outras 7 ainda são recortes do vídeo.

O que mantém isso em 60fps (medido também com CPU 6x mais lenta, em 390x844 @DPR3):
- o listener de scroll só grava um número; todo o desenho acontece dentro de um único
  `requestAnimationFrame`;
- só `transform` e `opacity` são animados — as duas propriedades que o browser resolve
  no compositor, sem layout nem repaint;
- geometria (`getBoundingClientRect`) é medida uma vez e cacheada; ler layout dentro do
  loop causaria reflow forçado a cada frame;
- apenas as 2 frames em transição ficam visíveis e promovidas a camada; as outras saem
  com `visibility:hidden` para não ocupar memória de GPU no celular;
- as imagens são decodificadas antes da seção entrar em tela;
- o loop dorme quando a seção sai de vista ou quando o movimento assenta;
- `prefers-reduced-motion` desliga o scrub e mostra uma frame estática.

**Para virar um vídeo de verdade** (movimento contínuo em vez de 10 fotos), exporte o
vídeo como sequência de frames JPEG (~60–120 arquivos) e troque a lista de `<img>` dentro
de `.scrollshow__frames`. A engine não muda: ela já interpola entre frames adjacentes, e
quanto mais frames, mais o resultado vira vídeo. Evite `<video>` + `currentTime` no scroll
— buscar no vídeo é assíncrono e engasga no iOS; sequência de frames é a técnica que
sites como o da Apple usam justamente por isso.

A velocidade do scrub é controlada por `--frames` e pela altura de `.scrollshow__track`
no CSS (hoje ~38vh de rolagem por frame no desktop, 30vh no mobile).

## Deploy na Vercel
Site 100% estático — a Vercel detecta e publica sem nenhuma configuração adicional (sem
`vercel.json`, sem build step).

**A branch publicada é a `main`.** Todo push para ela dispara um novo deploy automático.
O desenvolvimento acontece em `claude/mechanic-shop-website-yte9kx` e é levado para a
`main` quando fica pronto.

