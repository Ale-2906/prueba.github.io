// ===== Simulación de carga =====
const loading = document.getElementById('loadingScreen');
const loaderProgress = document.getElementById('loaderProgress');
const loaderPercent = document.getElementById('loaderPercent');

let pct = 0;
const int = setInterval(()=>{
  pct = Math.min(pct + Math.random()*14, 100);
  loaderProgress.style.width = pct + '%';
  loaderPercent.textContent = Math.round(pct) + '%';
  if (pct >= 100){ clearInterval(int); setTimeout(()=> loading.style.display='none', 300); }
}, 220);

// ===== Overlay show/hide =====
const cake = document.getElementById('cake');
const overlay = document.getElementById('overlay');
const closeOverlay = document.getElementById('closeOverlay');

cake.addEventListener('click', ()=>{
  overlay.classList.add('open');
  // auto play (si el navegador lo permite)
  tryPlay();
});

closeOverlay.addEventListener('click', ()=>{
  overlay.classList.remove('open');
  audio.pause();
  syncPlayButtons(false);
});

// ===== Reproductor =====
const audio = document.getElementById('audio');
const bigPlay = document.getElementById('bigPlay');
const centerPlay = document.getElementById('centerPlay');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const repeatBtn = document.getElementById('repeatBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const bar = document.getElementById('bar');
const fill = document.getElementById('fill');
const knob = document.getElementById('knob');
const tCurrent = document.getElementById('tCurrent');
const tDuration = document.getElementById('tDuration');

const fmt = (t)=> {
  if (!isFinite(t)) return '0:00';
  const m = Math.floor(t/60);
  const s = Math.floor(t%60).toString().padStart(2,'0');
  return `${m}:${s}`;
};

function syncPlayButtons(playing){
  bigPlay.textContent = playing ? '⏸' : '▶';
  centerPlay.textContent = playing ? '⏸' : '▶';
}

function tryPlay(){
  audio.play().then(()=> syncPlayButtons(true)).catch(()=>{
    // bloqueo de autoplay: botones siguen listos
    syncPlayButtons(false);
  });
}

function togglePlay(){
  if (audio.paused){ audio.play().then(()=> syncPlayButtons(true)); }
  else { audio.pause(); syncPlayButtons(false); }
}

bigPlay.addEventListener('click', togglePlay);
centerPlay.addEventListener('click', togglePlay);

prevBtn.addEventListener('click', ()=> { audio.currentTime = 0; });
nextBtn.addEventListener('click', ()=> { audio.currentTime = Math.max(audio.duration - .3, 0); });

let repeat = false;
repeatBtn.addEventListener('click', ()=>{
  repeat = !repeat;
  repeatBtn.style.color = repeat ? '#1DB954' : '';
});

audio.addEventListener('ended', ()=>{
  if (repeat){ audio.currentTime = 0; audio.play(); }
  else { syncPlayButtons(false); }
});

// Timeline
audio.addEventListener('loadedmetadata', ()=> { tDuration.textContent = fmt(audio.duration); });
audio.addEventListener('timeupdate', ()=>{
  tCurrent.textContent = fmt(audio.currentTime);
  const pct = (audio.currentTime / audio.duration) * 100;
  fill.style.width = (pct||0) + '%';
  knob.style.left = (pct||0) + '%';
});

// Seek con clic/touch
function setTimeFromPointer(clientX){
  const rect = bar.getBoundingClientRect();
  const x = clientX - rect.left;
  const ratio = Math.min(Math.max(x / rect.width, 0), 1);
  audio.currentTime = ratio * audio.duration;
}
bar.addEventListener('click', (e)=> setTimeFromPointer(e.clientX));

// Drag en el knob
let dragging = false;
knob.addEventListener('pointerdown', (e)=>{ dragging = true; knob.setPointerCapture(e.pointerId); });
window.addEventListener('pointermove', (e)=>{ if(dragging) setTimeFromPointer(e.clientX); });
window.addEventListener('pointerup', ()=> dragging = false);

// Accesibilidad tecla espacio
window.addEventListener('keydown', (e)=>{
  if (!overlay.classList.contains('open')) return;
  if (e.code === 'Space'){ e.preventDefault(); togglePlay(); }
});
