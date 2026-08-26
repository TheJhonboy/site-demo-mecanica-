# site-demo-mecanica-
Site demonstrativo para uma oficina mecânica ("Klaus"), focado em levar o visitante direto para o WhatsApp.

Site estático (HTML/CSS/JS puro, sem build) com:
- Seções de serviços (motor, pneus, revisão, freios, suspensão, elétrica, bateria, ar-condicionado, estofamento, diagnóstico);
- Marcas atendidas (Honda, Chevrolet, Volkswagen, Fiat, Hyundai, Toyota, Renault, Ford, Nissan...);
- Horários de funcionamento + agenda semanal ilustrativa;
- Localização com endereço fictício e mapa incorporado;
- Bloco de Instagram e depoimentos;
- Botão flutuante e vários CTAs de WhatsApp com mensagem pré-preenchida por serviço.

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

Em `index.html`:
- Endereço, telefone e e-mail aparecem na topbar, na seção "Localização" e no rodapé — troque pelos dados reais.
- O mapa (`<iframe>` na seção `#localizacao`) usa um endereço fictício. Depois de criar o local real no Google Maps, gere o link em "Compartilhar → Incorporar mapa" e substitua o `src` do iframe.
- Depoimentos, marcas e demais textos são exemplos genéricos — ajuste conforme a oficina real.
- O JSON-LD (dados estruturados) no `<head>` usa os mesmos dados fictícios — atualize junto.

## Fotos dos serviços — recortadas do próprio vídeo
As 11 imagens em `assets/img/` são recortes do vídeo em `assets/video/oficina.mp4`
(mesmo carro, mesma luz), o que dá identidade visual coesa ao site inteiro. Não são
mais os placeholders com o selo "IMAGEM DEMO".

Duas ressalvas honestas: o vídeo mostra um carro pronto, não a oficina trabalhando.
Então **Motor** e **Bateria** ficaram com imagem de contexto (frente e traseira do
carro) em vez de foto do serviço em si — troque essas duas primeiro quando tiver
fotos reais. Os outros oito casam bem com o serviço: roda com pinça de freio, farol,
painel, bancos, retrovisor.

Comando usado (ajuste `-ss` para o instante e o offset do `crop` para o enquadramento):
```
ffmpeg -ss 4.6 -i assets/video/oficina.mp4 -frames:v 1 \
  -vf "crop=720:540:0:296,scale=800:600:flags=lanczos,unsharp=5:5:0.3" -q:v 5 \
  assets/img/servico-freios.jpg
```

Para usar fotos próprias, basta sobrescrever os arquivos mantendo os mesmos nomes:

`hero-oficina.jpg`, `servico-motor.jpg`, `servico-pneus.jpg`, `servico-revisao.jpg`,
`servico-freios.jpg`, `servico-suspensao.jpg`, `servico-eletrica.jpg`,
`servico-bateria.jpg`, `servico-arcondicionado.jpg`, `servico-estofamento.jpg`,
`servico-diagnostico.jpg`

Recomendado: horizontais, proporção 4:3, ~800×600 ou maior. Fotos da própria oficina são
o ideal. Nenhuma alteração de código é necessária.

## O vídeo da primeira tela (scroll motion)
A primeira coisa que o visitante vê é o vídeo da oficina em tela cheia, e a rolagem passa o
vídeo quadro a quadro. Os 120 quadros ficam em `assets/video/frames/` e são desenhados num
`<canvas>`; o vídeo original está em `assets/video/oficina.mp4`.

### Como os quadros foram gerados
```
ffmpeg -i assets/video/oficina.mp4 \
  -vf "fps=7.286,unsharp=5:5:0.35" -q:v 6 \
  assets/video/frames/f-%03d.jpg
```
`fps` = nº de quadros ÷ duração do vídeo (120 ÷ 16,47s). Para trocar o vídeo: substitua o mp4,
rode o comando ajustando o `fps`, e atualize `VHERO_FRAMES` em `js/script.js`.

### Por que não é 2K nem 60fps
O material original é **720×1280 a 30fps**. Ampliar para 2K não cria detalhe que não existe —
só deixa mais pesado e mais mole. E num scrub o "fps" não vem do arquivo: quem manda é a taxa
de atualização da tela (o `requestAnimationFrame`), então 120 quadros já rodam a 60fps.

Testei 1080p com upscale antes de decidir: decodificar um quadro custava 26ms em WebP 1080 e
custa 6ms em JPEG 720 nativo, contra um orçamento de 16,7ms por frame a 60fps. Ou seja, o
upscale pagava caro sem entregar nitidez.

### Medições (Playwright/Chromium, rolagem contínua)
| cenário | FPS |
|---|---|
| Desktop 1440×900 | 59,9 |
| Mobile 390×844 @DPR3 | 59,9 |
| Mobile + CPU 4× e 6× mais lenta | 59,9 (com quadros pulados) |

Carga até revelar: ~4,6s em 4G bom, ~13s em 4G fraco (6MB no total).

### Tela de carregamento
`#loader` mostra o progresso **real** do download dos quadros (não um timer falso) e trava a
rolagem até terminar. Se algum arquivo falhar ou demorar, um timeout de 8s revela o site mesmo
assim — ninguém pode ficar preso na tela de carregamento por causa de um arquivo.

## A galeria de fotos com scroll (mais abaixo na página)
A seção `#scrollshow` é um scrub controlado pelo scroll: as fotos são as frames e o
dedo/roda controla a posição, como arrastar a linha do tempo de um vídeo.

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
Site 100% estático — a Vercel detecta e publica sem nenhuma configuração adicional (sem `vercel.json`, sem build step).

