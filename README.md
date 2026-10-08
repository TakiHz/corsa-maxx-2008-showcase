# 🚗 Chevrolet Corsa Maxx 1.4 2008 Branco // Apresentação Cinematográfica 360°

Site editorial e cinematográfico de apresentação e venda do **Chevrolet Corsa Hatch Maxx 1.4 8V Econoflex 2008** na cor **Branco Summit**.

Desenvolvido com experiência visual de nível **Awwwards**:
- **3 Takes Cinematográficos**:
  - `Take 01` (2.0s): Apresentação frontal 3/4 em pavilhão minimalista de concreto com iluminação dramática de estúdio.
  - `Take 02` (1.5s): Macro zoom nos detalhes da grade cromada, gravata dourada GM e conjunto óptico biparábola cristalino.
  - `Take 03` (2.0s): Perspectiva traseira com lanternas verticais clássicas e badges originais.
- **Scroll Scrubber em Canvas 60fps**: Scrubbing contínuo de 165 frames gerados a 30fps sincronizados com **Lenis Smooth Scroll** e **GSAP ScrollTrigger**.
- **Player de Vídeo Modal**: Reprodução do comercial cinematográfico completo de 5.5s com trilha sonora atmosférica em sub-bass.
- **Áudio Sintetizado**: Ronco grave do motor simulado via Web Audio API.
- **Dossiê Técnico & Opcionais**: Bento grid com especificações detalhadas (105 cv, 13.4 kgfm, ar-condicionado, direção hidráulica, vidros e travas elétricas, 4 pneus novos Pirelli, laudo 100% aprovado).
- **Simulador de Financiamento em Tempo Real**: Cálculo de parcelas e integração direta com WhatsApp para envio de proposta pré-formatada.

---

## 🚀 Como Executar Localmente

```bash
# Instalar dependências (opcional se for apenas rodar o servidor)
npm install

# Iniciar servidor local
node server.js
```

Acesse no navegador:
👉 `http://localhost:3000`

---

## 🛠️ Tecnologias Utilizadas

- **HTML5 Canvas** (Renderização interpolada por lerp e DPR automático)
- **CSS3 / Vanilla Moderno** (Tipografia editorial com *Space Grotesk*, *Plus Jakarta Sans* e *JetBrains Mono*, dark luxury aesthetic)
- **GSAP 3.12 + ScrollTrigger** (Sincronização milimétrica de scroll)
- **Lenis Smooth Scroll** (Física de rolagem suave)
- **FFmpeg** (Geração dos takes cinematográficos com zoompan e extração sequencial de frames)
- **Web Audio API** (Síntese de áudio dinâmico)
- **Lucide Icons**
