# Guia do projeto para agentes de IA

Documento de entrega. Leia isto **antes** de mexer em qualquer arquivo. Ele existe para
que outro assistente continue o trabalho sem refazer decisões já tomadas nem quebrar
coisas que parecem erradas mas são intencionais.

- **Repositório:** `TheJhonboy/site-demo-mecanica-`
- **Branch de trabalho:** `claude/mechanic-shop-website-yte9kx`
- **Branch publicada:** `main` — a Vercel faz deploy automático dela
- **Histórico narrado, com datas e motivos:** [`HISTORICO.md`](HISTORICO.md)
- **Documentação de uso:** [`README.md`](README.md)

---

## 1. O que é

Site de **demonstração** de uma oficina mecânica multimarcas fictícia chamada **Klaus**.

O site tem **um único objetivo**: levar o visitante para o WhatsApp, onde um bot atende.
Não há formulário, carrinho, login nem back-end. Toda decisão de design deve ser avaliada
por uma pergunta: *isso aumenta ou diminui a chance de a pessoa clicar no WhatsApp?*

Identidade visual: **preto e laranja**. Tipografia: Poppins (títulos) e Inter (texto).

---

## 2. Stack e como rodar

Site **estático puro**: HTML, CSS e JavaScript escritos à mão. **Sem build, sem npm, sem
framework, sem dependências.** É proposital — a Vercel publica direto, sem configuração.

```bash
# rodar localmente
python3 -m http.server 8099
# abrir http://127.0.0.1:8099/index.html

# única verificação automatizada disponível
node --check js/script.js
```

**Não introduza build step, framework ou gerenciador de pacotes** sem que o dono do
projeto peça. Isso quebraria o deploy atual.

---

## 3. Mapa dos arquivos

```
index.html          página inteira (uma só)
css/style.css       todo o estilo, organizado por blocos comentados
js/script.js        todo o comportamento, uma função por recurso
assets/video/       oficina.mp4, oficina.webm, poster.jpg
assets/img/         servico-*.jpg (10 cards), galeria-*.jpg (8), hero-oficina.jpg
assets/favicon.svg
```

Seções da página, na ordem: `#vhero` (vídeo), `#top` (hero), `#servicos`, `#scrollshow`
(galeria com rolagem), `#marcas`, `#horarios`, depoimentos, `#faq`, `#localizacao`,
Instagram, CTA final, rodapé.

---

## 4. PRIMEIRO: os dados são todos fictícios

Tudo que identifica a oficina é inventado e **precisa ser trocado antes de qualquer uso
real**. Fica centralizado em `CONFIG`, no topo de `js/script.js`:

| Campo | Valor atual (fictício) | Onde mais aparece |
| --- | --- | --- |
| `whatsappNumber` | `5511900000000` | 18 links da página são montados a partir daqui |
| `instagramUrl` | `instagram.com/klaus.oficina` | rodapé e bloco do Instagram |
| `businessHours` | Seg–Sex 8–18, Sáb 8–13, Dom fechado | indicador "Aberto agora" |
| `popularTimes` | números inventados | gráfico de movimento |

Fora do `CONFIG`, ainda em `index.html`: endereço (`Av. das Nações, 1450`), telefone
`(11) 90000-0000`, o `<iframe>` do Google Maps e os dados estruturados JSON-LD no `<head>`.
**Trocar o endereço exige trocar os três lugares**, senão o site fica incoerente.

Os depoimentos também são fictícios.

---

## 5. Como as partes não óbvias funcionam — e por que

Esta seção é a mais importante. Cada item aqui já foi feito de outro jeito e teve que ser
refeito. Ler antes de "melhorar".

### 5.1 Vídeo da primeira tela (`#vhero`)

São **dois elementos `<video>`**, não um:

- `#vheroFundo` — preenche a tela, ampliado e desfocado (`filter: blur(34px) ...`).
- `#vheroVideo` — o nítido, centralizado, com `width: min(100%, 58vw, 936px)`.

**Por quê:** o vídeo é 720×1280 (em pé) e a tela do computador é deitada — proporções quase
3× diferentes. Preencher a largura ampliava 2× e cortava 70% da altura (ficava borrado).
Encaixar pela altura (`object-fit: contain`) deixava dois terços da tela em preto morto, e
o dono do projeto rejeitou isso explicitamente. O fundo desfocado é a saída padrão para
vídeo vertical, a mesma que Instagram e YouTube usam.

**Não volte para `contain` com barras nem para `cover` na tela toda.** As duas já foram
tentadas e rejeitadas.

Detalhes que parecem estranhos mas são intencionais:
- O teto de **936px** é 1,3× o tamanho nativo — o limite antes de aparecer borrão.
- O `contrast(.78)` no desfoque **impede** que as cenas escuras do vídeo virem preto puro.
- Em tela vertical (celular) o fundo é `display:none` **e pausado por JavaScript** — um
  vídeo escondido continuaria decodificando e gastando bateria.
- Os dois vídeos compartilham o mesmo arquivo; se a distância entre eles passa de 0,5s, o
  de trás é recolocado no ponto do da frente.

### 5.2 Autoplay pode ser recusado

Safari em modo de baixo consumo e economia de dados recusam autoplay **mesmo com o vídeo
mudo**. `setupHeroVideo()` trata isso: se `play()` falha, arma um ouvinte para o primeiro
gesto (toque, rolagem ou tecla) e tenta de novo — é a única forma de destravar, porque o
navegador exige gesto humano.

Enquanto o vídeo não está correndo, as frases giram num relógio de 4,2s. Essa decisão é
tomada por `decidirRelogio()`, que checa o **estado real** do vídeo (`paused` e
`readyState`) a cada evento. **Não amarre isso a um único evento** — um `playing` solto
chega antes da hora e congela vídeo e frases ao mesmo tempo.

### 5.3 Loader

`setupLoader()` baixa o vídeo com `fetch` + stream, pinta a barra com o progresso **real**
em bytes e entrega um blob pronto para o `<video>`. Um prazo de segurança de **8 segundos**
revela o site de qualquer jeito — ninguém pode ficar preso na tela de carregamento.

### 5.4 Galeria com rolagem (`#scrollshow`)

Scrub controlado pela rolagem: o ouvinte de scroll só anota um número e todo o desenho
acontece dentro de um único `requestAnimationFrame`. Só `transform` e `opacity` são
animados. A geometria é medida uma vez e guardada; o loop dorme quando a seção sai da tela.

O total do contador (`#scrollshowTotal`) sai da **contagem real de imagens** — já esteve
fixo no HTML e ficou mentindo depois de uma troca.

### 5.5 Gráfico de movimento (`#horarios`)

Estilo "horários de pico" do Google. Barras crescem com `transform: scaleY()`, nunca com
`height` (que forçaria recálculo de layout a cada quadro). Três níveis: até 39 tranquilo,
40–71 movimentado, 72+ lotado. Domingo aparece como fechado.

### 5.6 Botão de fechamento animado

Só o botão "Chamar no WhatsApp agora" tem `.btn--pulse`. O pulso usa **box-shadow** porque
sombra não é cortada pelo `overflow:hidden` do próprio botão — assim o anel cresce para
fora enquanto a onda do clique fica presa dentro da pílula. A onda é criada em
`pointerdown` na posição exata do clique e removida no fim da animação.

**Os outros 17 links de WhatsApp são discretos de propósito.** Animar todos transformaria
a página num pisca-pisca.

### 5.7 Marcas atendidas (`#marcas`)

Cada marca tem um **círculo com a inicial, na cor da montadora** — não o logotipo.

**Por quê:** logotipo de montadora é marca registrada, com regras próprias de uso por
terceiros. Num site ainda demonstrativo é risco desnecessário. Se o dono do projeto pedir
os logos de novo, avise do risco antes de trocar, e não baixe logo de banco de imagens sem
verificar a licença.

---

## 6. Convenções deste repositório

- **Comentários e textos em português.** Todo o site, o código e a documentação.
- **Comentário explica o *porquê*, não o *o quê*.** O código já diz o que faz.
- **Um commit por mudança**, com mensagem explicando o que mudou e por quê, em português.
- **Toda mudança ganha uma entrada nova em `HISTORICO.md`**, com data e hora de Brasília
  (UTC−3), no topo da lista.
- **Só `transform` e `opacity` em animação.** Nada que force recálculo de layout.
- **`prefers-reduced-motion` é respeitado** em toda animação nova.
- **Texto alternativo descreve o que a imagem realmente mostra.** Já houve `alt` falando de
  "mecânico consertando motor" em foto que não tinha nem mecânico nem motor.

---

## 7. Estado atual (27/08/2026)

Pronto e verificado em navegador:

- Vídeo de fundo rodando em loop, com fundo desfocado no computador e tela cheia no celular.
- 10 cards de serviço, **todos com foto real de oficina**, nenhuma repetida entre si.
- Galeria com 8 quadros distintos; 1 é foto de oficina, 7 ainda são recortes do vídeo.
- Gráfico de movimento por dia e hora, com marca de "agora".
- 18 links de WhatsApp, todos com mensagem pré-preenchida por contexto.
- Botão de fechamento animado.
- Imagens do site somam ~1,8 MB, carregadas sob demanda.

---

## 8. O que está pendente

Em ordem de importância:

1. **Trocar os dados fictícios** (seção 4). Sem isso o site não serve para uso real.
2. **Fotos para a galeria.** 7 dos 8 quadros ainda são recortes do vídeo, todos do mesmo
   carro parado. Fotos de oficina trabalhando melhoram muito essa seção.
3. **Registrar o endereço da Vercel** no README quando o dono informar.

---

## 9. Armadilhas conhecidas

- **A Vercel, o Google Drive e os bancos de imagem são inacessíveis** da máquina onde o
  assistente roda (o gateway responde 403). Publicação e download de imagem partem do
  navegador do dono. Não tente contornar.
- **O Chromium de teste do ambiente não decodifica H.264.** Testar o vídeo ali dá falso
  negativo; o WebM existe em parte por isso. Sempre confirme com `canPlayType` antes de
  concluir que o vídeo está quebrado.
- **Prévia dentro de `<iframe>` não rola.** Se o site for aberto numa prévia embutida, quem
  rola é o container de fora e `window.scrollY` fica em zero. Isso já foi confundido com
  bug do site mais de uma vez.
- **Nunca reutilize a mesma imagem em dois cards.** A seção de serviços já teve o mesmo
  farol em dois cards e a mesma roda em três; ficou visivelmente repetida e teve que ser
  refeita.
- **O `.crdownload` do Chrome** aparece em arquivo baixado pela metade. Antes de usar uma
  imagem com esse nome, confira a integridade (marcadores `ffd8`/`ffd9` e decodificação
  completa).

---

## 10. Decisões já tomadas — não reabrir sem pedido

| Decisão | Motivo |
| --- | --- |
| Site estático, sem framework | Publica na Vercel sem configuração |
| `main` é a branch publicada | O dono escolheu jogar tudo para `main` |
| Vídeo roda sozinho, sem depender de rolagem | Scrub por rolagem foi tentado e rejeitado |
| Fundo desfocado em vez de barras laterais | Barras pretas foram rejeitadas explicitamente |
| Iniciais coloridas em vez de logotipos | Marca registrada; risco desnecessário num demo |
| Vídeo em MP4 **e** WebM | MP4 para compatibilidade, WebM para quem não tem H.264 |
| Animação forte só no botão de fechamento | Animar os 18 links viraria pisca-pisca |
