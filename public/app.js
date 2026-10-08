// Chevrolet Corsa Maxx 1.4 2008 - Interactive Cinematic Experience

const TOTAL_FRAMES = 165;
const FRAMES_PATH = 'frames/frame_';
const frames = [];
let imagesLoaded = 0;
let currentFrameIndex = 0;
let targetFrameIndex = 0;

const canvas = document.getElementById('frame-canvas');
const ctx = canvas.getContext('2d');

const preloader = document.getElementById('preloader');
const loaderFill = document.getElementById('loader-fill');
const loaderText = document.getElementById('loader-text');

const hudFrameNum = document.getElementById('hud-frame-num');
const hudTime = document.getElementById('hud-time');

const btnTake1 = document.getElementById('btn-take-1');
const btnTake2 = document.getElementById('btn-take-2');
const btnTake3 = document.getElementById('btn-take-3');

const cardTake1 = document.getElementById('card-take-1');
const cardTake2 = document.getElementById('card-take-2');
const cardTake3 = document.getElementById('card-take-3');

// ----------------- FRAME PRELOADING -----------------
function padNumber(num, size) {
  let s = num + '';
  while (s.length < size) s = '0' + s;
  return s;
}

function preloadFrames() {
  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const img = new Image();
    const frameNumber = padNumber(i, 3);
    img.src = `${FRAMES_PATH}${frameNumber}.jpg`;

    img.onload = () => {
      imagesLoaded++;
      const progress = Math.round((imagesLoaded / TOTAL_FRAMES) * 100);
      if (loaderFill) loaderFill.style.width = `${progress}%`;
      if (loaderText) loaderText.textContent = `CARREGANDO FRAMES: ${imagesLoaded} / ${TOTAL_FRAMES} (${progress}%)`;

      if (imagesLoaded === 1) {
        // Draw first frame immediately
        drawFrame(0);
      }

      if (imagesLoaded === TOTAL_FRAMES) {
        onAllFramesLoaded();
      }
    };

    img.onerror = () => {
      console.warn(`Failed to load frame ${i}`);
      imagesLoaded++;
      if (imagesLoaded === TOTAL_FRAMES) {
        onAllFramesLoaded();
      }
    };

    frames.push(img);
  }
}

function onAllFramesLoaded() {
  setTimeout(() => {
    preloader.classList.add('loaded');
  }, 400);
}

// ----------------- CANVAS RENDERING (ASPECT COVER) -----------------
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);
  drawFrame(Math.round(currentFrameIndex));
}

function drawFrame(index) {
  const img = frames[index];
  if (!img || !img.complete || img.naturalWidth === 0) return;

  const cWidth = canvas.clientWidth;
  const cHeight = canvas.clientHeight;

  ctx.clearRect(0, 0, cWidth, cHeight);

  // Calculate cover dimensions
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const canvasRatio = cWidth / cHeight;

  let renderWidth, renderHeight, offsetX, offsetY;

  if (canvasRatio > imgRatio) {
    renderWidth = cWidth;
    renderHeight = cWidth / imgRatio;
    offsetX = 0;
    offsetY = (cHeight - renderHeight) / 2;
  } else {
    renderHeight = cHeight;
    renderWidth = cHeight * imgRatio;
    offsetX = (cWidth - renderWidth) / 2;
    offsetY = 0;
  }

  ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);
}

// ----------------- SMOOTH LERP RENDER LOOP -----------------
function renderLoop() {
  // Smoothly interpolate current frame to target frame
  currentFrameIndex += (targetFrameIndex - currentFrameIndex) * 0.15;
  const activeFrame = Math.min(Math.max(Math.round(currentFrameIndex), 0), TOTAL_FRAMES - 1);
  drawFrame(activeFrame);
  updateTelemetry(activeFrame);
  requestAnimationFrame(renderLoop);
}

function updateTelemetry(frameIndex) {
  // Format frame
  hudFrameNum.textContent = `${padNumber(frameIndex + 1, 3)} / ${TOTAL_FRAMES}`;

  // Time in seconds (30fps)
  const seconds = (frameIndex / 30).toFixed(1);
  hudTime.textContent = `00:0${seconds}s`;

  // Update active take tabs and cards
  // Take 1: frames 0 to 59 (0.0s to 2.0s)
  // Take 2: frames 60 to 104 (2.0s to 3.5s)
  // Take 3: frames 105 to 164 (3.5s to 5.5s)
  if (frameIndex < 60) {
    setActiveTake(1);
  } else if (frameIndex < 105) {
    setActiveTake(2);
  } else {
    setActiveTake(3);
  }
}

function setActiveTake(takeNumber) {
  [btnTake1, btnTake2, btnTake3].forEach((btn, idx) => {
    btn.classList.toggle('active', idx + 1 === takeNumber);
  });

  cardTake1.classList.toggle('visible', takeNumber === 1);
  cardTake2.classList.toggle('visible', takeNumber === 2);
  cardTake3.classList.toggle('visible', takeNumber === 3);
}

// ----------------- LENIS & GSAP SCROLLTRIGGER -----------------
let lenis;
function initScroll() {
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });
    window.lenis = lenis;

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  // Register ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  ScrollTrigger.create({
    trigger: '#cinematic-experience',
    start: 'top top',
    end: 'bottom bottom',
    pin: '.pinned-canvas-container',
    pinSpacing: true,
    scrub: 0.5,
    onUpdate: (self) => {
      targetFrameIndex = self.progress * (TOTAL_FRAMES - 1);
    }
  });

  // Jump to Take buttons
  btnTake1.addEventListener('click', () => jumpToTake(1));
  btnTake2.addEventListener('click', () => jumpToTake(2));
  btnTake3.addEventListener('click', () => jumpToTake(3));
}

function jumpToTake(takeNumber) {
  const trigger = ScrollTrigger.getById(undefined) || ScrollTrigger.getAll()[0];
  if (!trigger) return;

  const start = trigger.start;
  const end = trigger.end;
  const totalDistance = end - start;

  let targetProgress = 0;
  if (takeNumber === 1) targetProgress = 0.05;
  if (takeNumber === 2) targetProgress = 0.45;
  if (takeNumber === 3) targetProgress = 0.85;

  const targetScroll = start + totalDistance * targetProgress;

  if (lenis) {
    lenis.scrollTo(targetScroll, { duration: 1.5 });
  } else {
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
  }
}
window.jumpToTake = jumpToTake;

// ----------------- WEB AUDIO SYNTHESIZER -----------------
let audioCtx = null;
let oscillator = null;
let gainNode = null;
let isAudioPlaying = false;

const audioToggle = document.getElementById('audio-toggle');
const audioIcon = document.getElementById('audio-icon');

audioToggle.addEventListener('click', () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    oscillator = audioCtx.createOscillator();
    gainNode = audioCtx.createGain();

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(55, audioCtx.currentTime); // Low 55Hz rumble

    // Filter to make it warm and automotive
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);

    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
  }

  if (isAudioPlaying) {
    gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
    audioIcon.setAttribute('data-lucide', 'volume-x');
    isAudioPlaying = false;
  } else {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    gainNode.gain.setTargetAtTime(0.06, audioCtx.currentTime, 0.1);
    audioIcon.setAttribute('data-lucide', 'volume-2');
    isAudioPlaying = true;
  }
  lucide.createIcons();
});

// ----------------- VIDEO MODAL -----------------
const videoModal = document.getElementById('video-modal');
const modalVideo = document.getElementById('modal-video');
const openVideoBtn = document.getElementById('open-video-btn');
const closeVideoBtn = document.getElementById('close-video-btn');

openVideoBtn.addEventListener('click', () => {
  videoModal.classList.add('active');
  modalVideo.currentTime = 0;
  modalVideo.play().catch(e => console.log('Autoplay prevented:', e));
});

closeVideoBtn.addEventListener('click', () => {
  videoModal.classList.remove('active');
  modalVideo.pause();
});

videoModal.addEventListener('click', (e) => {
  if (e.target === videoModal) {
    videoModal.classList.remove('active');
    modalVideo.pause();
  }
});

// ----------------- FINANCING CALCULATOR -----------------
const entrySlider = document.getElementById('entry-slider');
const entryValText = document.getElementById('entry-val-text');
const termText = document.getElementById('term-text');
const monthlyVal = document.getElementById('monthly-val');
const resultSummary = document.getElementById('result-summary');
const termChips = document.querySelectorAll('.term-chip');
const calcWhatsappBtn = document.getElementById('calc-whatsapp-btn');

const CAR_PRICE = 26900;
let currentTerm = 36;

function formatCurrency(val) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

function updateCalculation() {
  const entry = parseInt(entrySlider.value, 10);
  entryValText.textContent = formatCurrency(entry);
  termText.textContent = `${currentTerm} vezes`;

  const financed = CAR_PRICE - entry;
  // Estimated interest rate: 1.49% per month
  const monthlyRate = 0.0149;
  const installment = (financed * (monthlyRate * Math.pow(1 + monthlyRate, currentTerm))) / (Math.pow(1 + monthlyRate, currentTerm) - 1);

  monthlyVal.innerHTML = `${formatCurrency(Math.round(installment))}<span style="font-size: 1rem; color: var(--text-muted);">/mês</span>`;
  resultSummary.textContent = `Entrada de ${formatCurrency(entry)} + ${currentTerm} parcelas fixas`;

  // WhatsApp formatted link
  const message = `Olá! Gostei muito do anúncio do Corsa Maxx 1.4 2008 Branco (R$ 26.900). Gostaria de negociar com a simulação: Entrada de ${formatCurrency(entry)} + ${currentTerm}x de ${formatCurrency(Math.round(installment))}. O carro ainda está disponível para visita?`;
  calcWhatsappBtn.href = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
}

entrySlider.addEventListener('input', updateCalculation);

termChips.forEach(chip => {
  chip.addEventListener('click', () => {
    termChips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    currentTerm = parseInt(chip.getAttribute('data-months'), 10);
    updateCalculation();
  });
});

// Photo viewer modal fallback
window.openPhotoModal = function(src, title) {
  window.open(src, '_blank');
};

// ----------------- INIT -----------------
window.addEventListener('DOMContentLoaded', () => {
  preloadFrames();
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  initScroll();
  renderLoop();
  updateCalculation();
  lucide.createIcons();
});
