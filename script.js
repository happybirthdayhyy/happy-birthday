/* =========================================================
   DIGITAL FLOWER GIFT PREMIUM — SCRIPT
   Vanilla JS, no build step required.
========================================================= */
'use strict';

/* ---------------------------------------------------------
   CONFIG — edit these to personalise the gift
--------------------------------------------------------- */
const CONFIG = {
  PASSWORD: '14022024',          // password kata sandi (angka/teks bebas)
  COUNTDOWN_TARGET: '2026-12-31T00:00:00', // tanggal target hitung mundur
  LOVE_LETTER: `Dari pertama kali kita bertemu, aku tahu ada sesuatu yang berbeda. Waktu terasa berjalan lebih pelan setiap kali bersamamu, dan setiap detail kecil tentangmu terasa begitu berharga untuk diingat.

Bunga-bunga di halaman ini kupilih satu per satu, seperti caraku memilih kata untuk menggambarkan betapa berartinya kamu untukku. Semoga setiap kelopak yang berguguran membawa sedikit rasa hangat dariku untukmu.

Terima kasih sudah menjadi alasan aku tersenyum di hari-hari biasa. Aku menantikan banyak momen indah lainnya bersamamu.`,
  REDUCED_MOTION: window.matchMedia('(prefers-reduced-motion: reduce)').matches
};

/* ---------------------------------------------------------
   UTILITIES
--------------------------------------------------------- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const rand = (min, max) => Math.random() * (max - min) + min;

function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

/* Smooth scroll with custom easing (works even without native smooth support) */
function smoothScrollTo(targetY, duration = 900){
  const startY = window.pageYOffset;
  const diff = targetY - startY;
  let startTime = null;
  function step(ts){
    if(!startTime) startTime = ts;
    const progress = clamp((ts - startTime) / duration, 0, 1);
    window.scrollTo(0, startY + diff * easeOutCubic(progress));
    if(progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ---------------------------------------------------------
   1. LOADING SCREEN
--------------------------------------------------------- */
function initLoadingScreen(onDone){
  const screen = $('#loadingScreen');
  const fill = $('#progressFill');
  const percentLabel = $('#progressPercent');
  let progress = 0;

  const interval = setInterval(() => {
    progress += rand(4, 12);
    if(progress >= 100){
      progress = 100;
      clearInterval(interval);
      fill.style.width = '100%';
      percentLabel.textContent = '100%';
      setTimeout(() => {
        screen.classList.add('fade-out');
        setTimeout(() => {
          screen.setAttribute('hidden', '');
          onDone();
        }, 900);
      }, 350);
      return;
    }
    fill.style.width = progress + '%';
    percentLabel.textContent = Math.floor(progress) + '%';
  }, 180);
}

/* ---------------------------------------------------------
   2. PASSWORD SCREEN
--------------------------------------------------------- */
function initPasswordScreen(onUnlock){
  const screen = $('#passwordScreen');
  const card = $('.password-card', screen);
  const form = $('#passwordForm');
  const input = $('#passwordInput');
  const error = $('#passwordError');

  screen.removeAttribute('hidden');
  setTimeout(() => input.focus(), 400);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if(value.length === 0) return;

    if(value === CONFIG.PASSWORD){
      error.classList.remove('show');
      screen.classList.add('hide');
      setTimeout(() => {
        screen.setAttribute('hidden', '');
        onUnlock();
      }, 650);
    } else {
      error.textContent = 'Kata sandi salah. Coba lagi ya 💗';
      error.classList.add('show');
      card.classList.remove('shake');
      // force reflow to restart animation
      void card.offsetWidth;
      card.classList.add('shake');
      input.value = '';
      input.focus();
    }
  });
}

/* ---------------------------------------------------------
   MAIN CONTENT REVEAL
--------------------------------------------------------- */
function revealMainContent(){
  const main = $('#main-content');
  main.removeAttribute('hidden');
  startAllExperiences();
}

/* ---------------------------------------------------------
   4. FALLING PETALS (canvas, continuous, wind)
--------------------------------------------------------- */
function initPetals(){
  const canvas = $('#petals-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, petals = [];
  const COUNT = CONFIG.REDUCED_MOTION ? 0 : (window.innerWidth < 700 ? 16 : 28);

  function resize(){
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function makePetal(fromTop = false){
    return {
      x: rand(0, W),
      y: fromTop ? rand(-H, 0) : rand(-40, -10),
      size: rand(8, 16),
      speedY: rand(0.4, 1.1),
      speedX: rand(-0.3, 0.3),
      rot: rand(0, Math.PI * 2),
      rotSpeed: rand(-0.02, 0.02),
      sway: rand(0.5, 2),
      swaySpeed: rand(0.005, 0.02),
      t: rand(0, 1000),
      hue: rand(330, 350),
      alpha: rand(0.55, 0.9)
    };
  }
  for(let i=0;i<COUNT;i++) petals.push(makePetal(true));

  let windTime = 0;
  function drawPetal(p){
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = `hsl(${p.hue}, 70%, ${window.matchMedia('(prefers-color-scheme: dark)').matches ? 70 : 80}%)`;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size * 0.55, p.size, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function tick(){
    ctx.clearRect(0, 0, W, H);
    windTime += 0.01;
    const windForce = Math.sin(windTime) * 0.6;
    petals.forEach(p => {
      p.t += p.swaySpeed;
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.t) * p.sway * 0.05 + windForce * 0.3;
      p.rot += p.rotSpeed;
      if(p.y > H + 20){
        Object.assign(p, makePetal(false));
        p.y = -20;
      }
      if(p.x > W + 30) p.x = -30;
      if(p.x < -30) p.x = W + 30;
      drawPetal(p);
    });
    requestAnimationFrame(tick);
  }
  if(!CONFIG.REDUCED_MOTION) tick();
}

/* ---------------------------------------------------------
   HERO PARTICLES + LIGHT EFFECT (canvas, on hero section)
--------------------------------------------------------- */
function initHeroParticles(){
  const canvas = $('#particles-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const hero = $('#hero');
  let W, H, dots = [];

  function resize(){
    W = canvas.width = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  const COUNT = CONFIG.REDUCED_MOTION ? 0 : Math.min(60, Math.floor((W*H)/22000));
  for(let i=0;i<COUNT;i++){
    dots.push({
      x: rand(0,W), y: rand(0,H),
      r: rand(0.8, 2.4),
      vx: rand(-0.15,0.15), vy: rand(-0.15,0.15),
      alpha: rand(0.2,0.7)
    });
  }

  function tick(){
    ctx.clearRect(0,0,W,H);
    dots.forEach(d => {
      d.x += d.vx; d.y += d.vy;
      if(d.x < 0 || d.x > W) d.vx *= -1;
      if(d.y < 0 || d.y > H) d.vy *= -1;
      ctx.beginPath();
      ctx.fillStyle = `rgba(199,138,147,${d.alpha})`;
      ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  if(!CONFIG.REDUCED_MOTION) tick();
}

/* ---------------------------------------------------------
   12. FIREFLIES (night ambience canvas)
--------------------------------------------------------- */
function initFireflies(){
  const canvas = $('#fireflies-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, flies = [];
  const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const COUNT = CONFIG.REDUCED_MOTION ? 0 : (isDark ? 22 : 10);

  function resize(){
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  for(let i=0;i<COUNT;i++){
    flies.push({
      x: rand(0,W), y: rand(0,H),
      baseX: rand(0,W), baseY: rand(0,H),
      r: rand(1.5,3),
      t: rand(0,1000),
      speed: rand(0.005,0.02),
      range: rand(40,120),
      glow: rand(0.5,1)
    });
  }

  function tick(){
    ctx.clearRect(0,0,W,H);
    flies.forEach(f => {
      f.t += f.speed;
      f.x = f.baseX + Math.sin(f.t) * f.range;
      f.y = f.baseY + Math.cos(f.t*1.3) * f.range * 0.6;
      const flicker = (Math.sin(f.t*4) + 1) / 2;
      const alpha = 0.3 + flicker * 0.7 * f.glow;
      const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, 10);
      grad.addColorStop(0, `rgba(255,241,180,${alpha})`);
      grad.addColorStop(1, 'rgba(255,241,180,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(f.x, f.y, 10, 0, Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,250,220,${alpha})`;
      ctx.arc(f.x, f.y, f.r*0.4, 0, Math.PI*2);
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  if(!CONFIG.REDUCED_MOTION) tick();
}

/* ---------------------------------------------------------
   14. CURSOR GLOW (desktop only)
--------------------------------------------------------- */
function initCursorGlow(){
  if(!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const glow = $('#cursorGlow');
  let raf = null;
  window.addEventListener('mousemove', (e) => {
    glow.classList.add('active');
    if(raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    });
  });
  window.addEventListener('mouseleave', () => glow.classList.remove('active'));
}

/* ---------------------------------------------------------
   10 & 11 & 13. TAP EFFECTS — floating hearts, ripple, sparkle
--------------------------------------------------------- */
function initTapEffects(){
  const layer = $('#fxLayer');
  const MAX_FX = 40;

  function spawn(el){
    layer.appendChild(el);
    if(layer.childElementCount > MAX_FX){
      layer.removeChild(layer.firstElementChild);
    }
    el.addEventListener('animationend', () => el.remove(), { once:true });
  }

  function burst(x, y){
    // ripple
    const ripple = document.createElement('div');
    ripple.className = 'ripple-fx';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    spawn(ripple);

    // heart (30% chance to avoid clutter)
    if(Math.random() < 0.5){
      const heart = document.createElement('div');
      heart.className = 'floating-heart';
      heart.textContent = ['💗','🌷','✨','🌸'][Math.floor(rand(0,4))];
      heart.style.left = (x + rand(-14,14)) + 'px';
      heart.style.top = y + 'px';
      spawn(heart);
    }
    // sparkle
    for(let i=0;i<3;i++){
      const s = document.createElement('div');
      s.className = 'sparkle-fx';
      s.style.left = (x + rand(-24,24)) + 'px';
      s.style.top = (y + rand(-24,24)) + 'px';
      s.style.animationDelay = (i*0.08) + 's';
      spawn(s);
    }
  }

  window.addEventListener('pointerdown', (e) => {
    // ignore clicks on interactive controls to not clutter UI feedback
    burst(e.clientX, e.clientY);
  }, { passive:true });
}

/* ---------------------------------------------------------
   5. INTERACTIVE 3D BOUQUET (Three.js)
--------------------------------------------------------- */
function initBouquet3D(){
  const stage = $('#bouquetStage');
  const canvas = $('#bouquetCanvas');
  const loader = $('#bouquetLoader');
  if(!window.THREE){ loader.classList.add('hidden'); return; }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, stage.clientWidth/stage.clientHeight, 0.1, 100);
  camera.position.set(0, 1.2, 7);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(stage.clientWidth, stage.clientHeight);

  // Lights
  scene.add(new THREE.AmbientLight(0xfff1e8, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(4, 6, 5);
  scene.add(key);
  const rim = new THREE.PointLight(0xffc8d6, 0.8, 20);
  rim.position.set(-4, 2, -3);
  scene.add(rim);

  // Bouquet group
  const bouquet = new THREE.Group();
  scene.add(bouquet);

  const petalColors = [0xF6C6D6, 0xE9A3B8, 0xF7DDE4, 0xD98CA0, 0xFBEAF0];

  function createFlower(){
    const flower = new THREE.Group();
    const petalGeo = new THREE.SphereGeometry(0.22, 10, 10);
    petalGeo.scale(1, 0.55, 1.4);
    const color = petalColors[Math.floor(rand(0,petalColors.length))];
    const petalMat = new THREE.MeshStandardMaterial({ color, roughness:0.55, metalness:0.05 });

    const petalCount = 6;
    for(let i=0;i<petalCount;i++){
      const petal = new THREE.Mesh(petalGeo, petalMat);
      const angle = (i / petalCount) * Math.PI * 2;
      petal.position.set(Math.cos(angle)*0.22, 0, Math.sin(angle)*0.22);
      petal.rotation.y = -angle;
      petal.rotation.z = 0.35;
      flower.add(petal);
    }
    const centerGeo = new THREE.SphereGeometry(0.14, 12, 12);
    const centerMat = new THREE.MeshStandardMaterial({ color:0xE8B84B, roughness:0.5 });
    const center = new THREE.Mesh(centerGeo, centerMat);
    flower.add(center);
    return flower;
  }

  const stemMat = new THREE.MeshStandardMaterial({ color:0x5C8A5C, roughness:0.7 });
  const leafMat = new THREE.MeshStandardMaterial({ color:0x6EA36E, roughness:0.7, side: THREE.DoubleSide });

  const flowerStems = [];
  const STEM_COUNT = window.innerWidth < 700 ? 9 : 13;

  for(let i=0;i<STEM_COUNT;i++){
    const angle = (i / STEM_COUNT) * Math.PI * 2;
    const radius = rand(0.15, 0.9);
    const height = rand(1.6, 2.3);

    const stemGeo = new THREE.CylinderGeometry(0.025, 0.03, height, 6);
    const stem = new THREE.Mesh(stemGeo, stemMat);
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    stem.position.set(x, -1.1 + height/2, z);
    stem.rotation.z = rand(-0.08, 0.08);
    stem.rotation.x = rand(-0.08, 0.08);
    bouquet.add(stem);

    // leaf
    if(Math.random() < 0.6){
      const leafGeo = new THREE.SphereGeometry(0.16, 8, 8);
      leafGeo.scale(1, 0.15, 2.2);
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(x, -1.1 + height*0.4, z);
      leaf.rotation.y = angle;
      bouquet.add(leaf);
    }

    const flower = createFlower();
    flower.position.set(x, -1.1 + height, z);
    flower.scale.setScalar(rand(0.8, 1.15));
    flower.userData.baseY = flower.position.y;
    flower.userData.swayPhase = rand(0, Math.PI*2);
    bouquet.add(flower);
    flowerStems.push(flower);
  }

  // wrapping cone (paper wrap)
  const wrapGeo = new THREE.ConeGeometry(0.75, 1.3, 32, 1, true);
  const wrapMat = new THREE.MeshStandardMaterial({ color:0xFCEFE6, roughness:0.85, side:THREE.DoubleSide });
  const wrap = new THREE.Mesh(wrapGeo, wrapMat);
  wrap.position.y = -1.75;
  bouquet.add(wrap);

  // Ribbon
  const ribbonGeo = new THREE.TorusGeometry(0.32, 0.045, 8, 24);
  const ribbonMat = new THREE.MeshStandardMaterial({ color:0xB76E79, roughness:0.4, metalness:0.2 });
  const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
  ribbon.position.y = -1.15;
  ribbon.rotation.x = Math.PI/2;
  bouquet.add(ribbon);

  bouquet.position.y = -0.2;

  // Controls
  let controls = null;
  if(THREE.OrbitControls){
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 4;
    controls.maxDistance = 11;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;
    controls.target.set(0, 0.2, 0);
  }

  // Touch-shake interaction
  let shakeStrength = 0;
  function triggerShake(){
    shakeStrength = 1;
    if(controls) controls.autoRotate = false;
  }
  renderer.domElement.addEventListener('pointerdown', triggerShake);
  renderer.domElement.addEventListener('pointermove', (e) => {
    if(e.buttons > 0) shakeStrength = Math.min(shakeStrength + 0.06, 1);
  });

  function resize(){
    const w = stage.clientWidth, h = stage.clientHeight;
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', resize);

  let clock = new THREE.Clock();
  let visible = true;
  const io = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
  }, { threshold: 0.05 });
  io.observe(stage);

  function animate(){
    requestAnimationFrame(animate);
    if(!visible) return;
    const t = clock.getElapsedTime();

    flowerStems.forEach(f => {
      const sway = Math.sin(t * 1.2 + f.userData.swayPhase) * (0.02 + shakeStrength*0.12);
      f.rotation.z = sway;
      f.rotation.x = Math.cos(t*0.9 + f.userData.swayPhase) * (0.015 + shakeStrength*0.1);
    });

    shakeStrength *= 0.965;
    if(shakeStrength < 0.02 && controls) controls.autoRotate = true;

    if(controls) controls.update();
    renderer.render(scene, camera);
  }
  animate();

  loader.classList.add('hidden');
}

/* ---------------------------------------------------------
   9. PHOTO GALLERY (fade slider + swipe + lightbox)
--------------------------------------------------------- */
function initGallery(){
  const track = $('#galleryTrack');
  const slides = $$('.gallery-slide', track);
  const dotsWrap = $('#galleryDots');
  const prevBtn = $('#galleryPrev');
  const nextBtn = $('#galleryNext');
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightboxImg');
  const lightboxClose = $('#lightboxClose');
  let index = 0;
  let autoTimer = null;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('role','tab');
    dot.setAttribute('aria-label', `Foto ${i+1}`);
    if(i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = $$('button', dotsWrap);

  function goTo(i){
    slides[index].classList.remove('active');
    dots[index].classList.remove('active');
    index = (i + slides.length) % slides.length;
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    resetAuto();
  }

  prevBtn.addEventListener('click', () => goTo(index - 1));
  nextBtn.addEventListener('click', () => goTo(index + 1));

  function resetAuto(){
    if(CONFIG.REDUCED_MOTION) return;
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(index + 1), 5000);
  }
  resetAuto();

  // swipe
  let startX = 0, deltaX = 0, dragging = false;
  track.addEventListener('pointerdown', (e) => {
    dragging = true; startX = e.clientX;
  });
  track.addEventListener('pointermove', (e) => {
    if(!dragging) return;
    deltaX = e.clientX - startX;
  });
  function endDrag(){
    if(!dragging) return;
    dragging = false;
    if(deltaX > 50) goTo(index - 1);
    else if(deltaX < -50) goTo(index + 1);
    deltaX = 0;
  }
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointerleave', endDrag);

  // lightbox zoom
  slides.forEach(slide => {
    slide.addEventListener('click', () => {
      const img = $('img', slide);
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden','false');
      lightboxClose.focus();
    });
  });
  function closeLightbox(){
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden','true');
  }
  lightboxClose.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => { if(e.target === lightbox) closeLightbox(); });
  window.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeLightbox(); });
}

/* ---------------------------------------------------------
   6. LOVE LETTER (typing effect)
--------------------------------------------------------- */
function initLoveLetter(){
  const openBtn = $('#openLetterBtn');
  const paper = $('#letterPaper');
  const scroll = $('#letterScroll');
  const textEl = $('#letterText');
  const cursor = $('#typingCursor');
  let typed = false;

  openBtn.addEventListener('click', () => {
    const isOpen = !paper.hasAttribute('hidden');
    if(isOpen){
      paper.setAttribute('hidden','');
      paper.classList.remove('reveal');
      openBtn.setAttribute('aria-expanded','false');
      return;
    }
    paper.removeAttribute('hidden');
    requestAnimationFrame(() => paper.classList.add('reveal'));
    openBtn.setAttribute('aria-expanded','true');
    paper.scrollIntoView({ behavior:'smooth', block:'center' });

    if(!typed){
      typed = true;
      typeText(CONFIG.LOVE_LETTER);
    }
  });

  function typeText(fullText){
    let i = 0;
    const speed = CONFIG.REDUCED_MOTION ? 0 : 22;

    if(CONFIG.REDUCED_MOTION){
      textEl.textContent = fullText;
      cursor.classList.add('done');
      return;
    }

    function step(){
      if(i <= fullText.length){
        textEl.textContent = fullText.slice(0, i);
        scroll.scrollTop = scroll.scrollHeight;
        i++;
        setTimeout(step, speed);
      } else {
        cursor.classList.add('done');
      }
    }
    step();
  }
}

/* ---------------------------------------------------------
   7. COUNTDOWN TIMER (flip clock)
--------------------------------------------------------- */
function initCountdown(){
  const target = new Date(CONFIG.COUNTDOWN_TARGET).getTime();
  const label = $('#countdownDateLabel');
  const dateFmt = new Intl.DateTimeFormat('id-ID', { day:'numeric', month:'long', year:'numeric' });
  if(!isNaN(target)) label.textContent = dateFmt.format(new Date(target));

  const units = {
    days: $('.flip-card-wrap[data-unit="days"]'),
    hours: $('.flip-card-wrap[data-unit="hours"]'),
    minutes: $('.flip-card-wrap[data-unit="minutes"]'),
    seconds: $('.flip-card-wrap[data-unit="seconds"]')
  };
  const prevValues = { days:null, hours:null, minutes:null, seconds:null };

  function setUnit(wrap, value){
    const spans = $$('span', wrap);
    spans.forEach(s => s.textContent = String(value).padStart(2,'0'));
  }

  function flipUnit(wrap, value){
    wrap.classList.remove('flipping');
    void wrap.offsetWidth;
    wrap.classList.add('flipping');
    setUnit(wrap, value);
  }

  function tick(){
    const now = Date.now();
    let diff = Math.max(0, target - now);

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    const next = { days, hours, minutes, seconds };
    Object.keys(units).forEach(key => {
      if(prevValues[key] !== next[key]){
        if(prevValues[key] === null) setUnit(units[key], next[key]);
        else flipUnit(units[key], next[key]);
        prevValues[key] = next[key];
      }
    });
  }
  tick();
  setInterval(tick, 1000);
}

/* ---------------------------------------------------------
   8. BACKGROUND MUSIC PLAYER
--------------------------------------------------------- */
function initMusicPlayer(){
  const audio = $('#bgMusic');
  const toggle = $('#musicToggle');
  const iconPlay = $('.icon-play', toggle);
  const iconPause = $('.icon-pause', toggle);
  const progressTrack = $('#musicProgressTrack');
  const progressFill = $('#musicProgressFill');
  const volumeSlider = $('#volumeSlider');
  const volumeToggle = $('#volumeToggle');

  audio.volume = parseFloat(volumeSlider.value);
  let lastVolume = audio.volume;

  function play(){
    audio.play().then(() => {
      iconPlay.setAttribute('hidden','');
      iconPause.removeAttribute('hidden');
      toggle.setAttribute('aria-label','Jeda musik');
    }).catch(() => { /* autoplay blocked, user can retry */ });
  }
  function pause(){
    audio.pause();
    iconPause.setAttribute('hidden','');
    iconPlay.removeAttribute('hidden');
    toggle.setAttribute('aria-label','Putar musik');
  }

  toggle.addEventListener('click', () => {
    if(audio.paused) play(); else pause();
  });

  audio.addEventListener('timeupdate', () => {
    if(!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = pct + '%';
    progressTrack.setAttribute('aria-valuenow', Math.round(pct));
  });

  function seek(clientX){
    const rect = progressTrack.getBoundingClientRect();
    const pct = clamp((clientX - rect.left) / rect.width, 0, 1);
    if(audio.duration) audio.currentTime = pct * audio.duration;
  }
  progressTrack.addEventListener('click', (e) => seek(e.clientX));
  progressTrack.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowRight') audio.currentTime = Math.min(audio.duration||0, audio.currentTime + 5);
    if(e.key === 'ArrowLeft') audio.currentTime = Math.max(0, audio.currentTime - 5);
  });

  volumeSlider.addEventListener('input', () => {
    audio.volume = parseFloat(volumeSlider.value);
  });
  volumeToggle.addEventListener('click', () => {
    if(audio.volume > 0){
      lastVolume = audio.volume;
      audio.volume = 0;
      volumeSlider.value = 0;
    } else {
      audio.volume = lastVolume || 0.6;
      volumeSlider.value = audio.volume;
    }
  });

  // Attempt autoplay right after unlocking the gift (a user gesture already happened
  // via the password form submit, which browsers count as an interaction).
  play();

  // Fallback: if blocked, first interaction anywhere on the page will start it.
  const resumeOnGesture = () => {
    if(audio.paused) play();
    window.removeEventListener('pointerdown', resumeOnGesture);
  };
  window.addEventListener('pointerdown', resumeOnGesture, { once:true });
}

/* ---------------------------------------------------------
   NAV DOTS — scroll spy + smooth scroll
--------------------------------------------------------- */
function initNavDots(){
  const dots = $$('.nav-dot');
  if(!dots.length) return;
  const sections = dots.map(d => $(d.getAttribute('href')));

  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      const target = $(dot.getAttribute('href'));
      if(target) smoothScrollTo(target.getBoundingClientRect().top + window.pageYOffset - 20);
    });
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const idx = sections.indexOf(entry.target);
        if(idx > -1){
          dots.forEach(d => d.classList.remove('active'));
          dots[idx].classList.add('active');
        }
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => s && io.observe(s));
}

/* ---------------------------------------------------------
   SMOOTH SCROLL FOR ALL ANCHOR LINKS (hero CTA etc.)
--------------------------------------------------------- */
function initAnchorScroll(){
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const targetSel = a.getAttribute('href');
      const target = $(targetSel);
      if(!target) return;
      e.preventDefault();
      smoothScrollTo(target.getBoundingClientRect().top + window.pageYOffset - 20);
    });
  });
}

/* ---------------------------------------------------------
   BOOTSTRAP EVERYTHING AFTER UNLOCK
--------------------------------------------------------- */
let experiencesStarted = false;
function startAllExperiences(){
  if(experiencesStarted) return;
  experiencesStarted = true;

  initHeroParticles();
  initBouquet3D();
  initGallery();
  initLoveLetter();
  initCountdown();
  initMusicPlayer();
  initNavDots();
  initAnchorScroll();
}

/* ---------------------------------------------------------
   ENTRY POINT
--------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  initPetals();
  initFireflies();
  initCursorGlow();
  initTapEffects();

  initLoadingScreen(() => {
    initPasswordScreen(() => {
      revealMainContent();
    });
  });
});

