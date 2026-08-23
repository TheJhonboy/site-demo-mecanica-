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

## Fotos — os arquivos atuais são PLACEHOLDERS
As 11 imagens em `assets/img/` **não são fotos reais**: são placeholders gerados
localmente (fundo escuro + ícone + nome do serviço + o selo "IMAGEM DEMO"). Existem
só para o layout e a animação ficarem apresentáveis e testáveis.

Para usar fotos de verdade, basta sobrescrever os arquivos mantendo os mesmos nomes:

`hero-oficina.jpg`, `servico-motor.jpg`, `servico-pneus.jpg`, `servico-revisao.jpg`,
`servico-freios.jpg`, `servico-suspensao.jpg`, `servico-eletrica.jpg`,
`servico-bateria.jpg`, `servico-arcondicionado.jpg`, `servico-estofamento.jpg`,
`servico-diagnostico.jpg`

Recomendado: horizontais, ~1600px de largura, licença livre para uso comercial
(Unsplash License / Pexels License) ou fotos da própria oficina. Nenhuma alteração
de código é necessária.

## A animação de scroll (scroll motion)
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

