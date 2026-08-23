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

## Fotos (pendente)
O site já está com `<img>` apontando para `assets/img/` (hero, os 10 serviços e a galeria de scroll) e com um fallback em CSS/JS que esconde a imagem quebrada e mantém um fundo em gradiente enquanto os arquivos não existem. Para adicionar fotos reais, salve os arquivos com estes nomes exatos em `assets/img/`:

`hero-oficina.jpg`, `servico-motor.jpg`, `servico-pneus.jpg`, `servico-revisao.jpg`, `servico-freios.jpg`, `servico-suspensao.jpg`, `servico-eletrica.jpg`, `servico-bateria.jpg`, `servico-arcondicionado.jpg`, `servico-estofamento.jpg`, `servico-diagnostico.jpg`

Recomendado: fotos horizontais, ~1200px de largura, licença de uso livre para fins comerciais (ex: Unsplash License / Pexels License).

## Deploy na Vercel
Site 100% estático — a Vercel detecta e publica sem nenhuma configuração adicional (sem `vercel.json`, sem build step).

