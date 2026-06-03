/* ===== TACTICAL COACH BOARD - app.js ===== */
'use strict';

// ===== FORMATIONS DATA =====
// Positions as [x%, y%] on the pitch (0,0 = top-left, 100,100 = bottom-right)
// MY team attacks UP (bottom half), OPP team attacks DOWN (top half)
const FORMATIONS = {
  '4-4-2': {
    positions: [
      // GK
      { pos: 'GK', x: 50, y: 90 },
      // DEF
      { pos: 'LB', x: 18, y: 76 },
      { pos: 'CB', x: 37, y: 79 },
      { pos: 'CB', x: 63, y: 79 },
      { pos: 'RB', x: 82, y: 76 },
      // MID
      { pos: 'LM', x: 18, y: 58 },
      { pos: 'CM', x: 37, y: 60 },
      { pos: 'CM', x: 63, y: 60 },
      { pos: 'RM', x: 82, y: 58 },
      // FWD
      { pos: 'ST', x: 37, y: 40 },
      { pos: 'ST', x: 63, y: 40 },
    ]
  },
  '4-2-3-1': {
    positions: [
      { pos: 'GK', x: 50, y: 90 },
      { pos: 'LB', x: 18, y: 76 },
      { pos: 'CB', x: 37, y: 79 },
      { pos: 'CB', x: 63, y: 79 },
      { pos: 'RB', x: 82, y: 76 },
      { pos: 'DM', x: 38, y: 65 },
      { pos: 'DM', x: 62, y: 65 },
      { pos: 'LW', x: 20, y: 50 },
      { pos: 'AM', x: 50, y: 48 },
      { pos: 'RW', x: 80, y: 50 },
      { pos: 'ST', x: 50, y: 35 },
    ]
  },
  '4-3-3': {
    positions: [
      { pos: 'GK', x: 50, y: 90 },
      { pos: 'LB', x: 18, y: 76 },
      { pos: 'CB', x: 37, y: 79 },
      { pos: 'CB', x: 63, y: 79 },
      { pos: 'RB', x: 82, y: 76 },
      { pos: 'CM', x: 28, y: 60 },
      { pos: 'CM', x: 50, y: 57 },
      { pos: 'CM', x: 72, y: 60 },
      { pos: 'LW', x: 18, y: 40 },
      { pos: 'ST', x: 50, y: 35 },
      { pos: 'RW', x: 82, y: 40 },
    ]
  },
  '3-4-2-1': {
    positions: [
      { pos: 'GK', x: 50, y: 90 },
      { pos: 'CB', x: 28, y: 79 },
      { pos: 'CB', x: 50, y: 81 },
      { pos: 'CB', x: 72, y: 79 },
      { pos: 'LM', x: 16, y: 62 },
      { pos: 'CM', x: 37, y: 64 },
      { pos: 'CM', x: 63, y: 64 },
      { pos: 'RM', x: 84, y: 62 },
      { pos: 'SS', x: 34, y: 44 },
      { pos: 'SS', x: 66, y: 44 },
      { pos: 'ST', x: 50, y: 32 },
    ]
  },
  '3-5-2': {
    positions: [
      { pos: 'GK', x: 50, y: 90 },
      { pos: 'CB', x: 28, y: 79 },
      { pos: 'CB', x: 50, y: 81 },
      { pos: 'CB', x: 72, y: 79 },
      { pos: 'LWB', x: 14, y: 64 },
      { pos: 'CM', x: 34, y: 63 },
      { pos: 'CM', x: 50, y: 60 },
      { pos: 'CM', x: 66, y: 63 },
      { pos: 'RWB', x: 86, y: 64 },
      { pos: 'ST', x: 36, y: 40 },
      { pos: 'ST', x: 64, y: 40 },
    ]
  }
};

// ===== TACTICAL PATTERNS =====
const PATTERNS = {
  attack: [
    {
      id: 'buildup',
      name: 'ビルドアップ',
      icon: '⬆',
      description: 'GKからCBを経由してビルドアップ',
      moves: [
        // Each move: { playerIndex, dx, dy, delay, arrow }
        { playerIndex: 1, dx: -5, dy: -5, delay: 0 },
        { playerIndex: 3, dx: 5, dy: -5, delay: 100 },
        { playerIndex: 5, dx: -8, dy: -10, delay: 200 },
        { playerIndex: 8, dx: 8, dy: -10, delay: 200 },
        { playerIndex: 6, dx: -5, dy: -12, delay: 300 },
        { playerIndex: 7, dx: 5, dy: -12, delay: 300 },
        { playerIndex: 9, dx: -5, dy: -8, delay: 400 },
        { playerIndex: 10, dx: 5, dy: -8, delay: 400 },
        { ballMove: { x: 37, y: 70 }, delay: 200 },
      ]
    },
    {
      id: 'side-attack',
      name: 'サイド前進',
      icon: '↗',
      description: 'サイドバックを使ったサイド攻撃',
      moves: [
        { playerIndex: 1, dx: -8, dy: -15, delay: 0 },
        { playerIndex: 5, dx: -10, dy: -12, delay: 200 },
        { playerIndex: 9, dx: -6, dy: -10, delay: 400 },
        { playerIndex: 6, dx: -5, dy: -8, delay: 300 },
        { ballMove: { x: 18, y: 55 }, delay: 300 },
      ]
    },
    {
      id: 'central',
      name: '中央突破',
      icon: '⬆',
      description: '中央を経由した縦への突破',
      moves: [
        { playerIndex: 6, dx: 0, dy: -10, delay: 0 },
        { playerIndex: 7, dx: 0, dy: -10, delay: 100 },
        { playerIndex: 9, dx: -5, dy: -12, delay: 200 },
        { playerIndex: 10, dx: 5, dy: -12, delay: 200 },
        { playerIndex: 6, dx: 0, dy: -8, delay: 300 },
        { ballMove: { x: 50, y: 45 }, delay: 200 },
      ]
    },
    {
      id: 'side-change',
      name: 'サイドチェンジ',
      icon: '↔',
      description: '逆サイドへの展開',
      moves: [
        { playerIndex: 5, dx: -5, dy: -8, delay: 0 },
        { playerIndex: 8, dx: 5, dy: -8, delay: 0 },
        { playerIndex: 6, dx: -8, dy: 0, delay: 100 },
        { playerIndex: 7, dx: 8, dy: 0, delay: 100 },
        { playerIndex: 9, dx: 12, dy: -5, delay: 200 },
        { playerIndex: 10, dx: -12, dy: -5, delay: 200 },
        { ballMove: { x: 80, y: 50 }, delay: 300 },
      ]
    },
    {
      id: 'behind',
      name: '背後への抜け出し',
      icon: '→',
      description: '相手DFラインの背後へスルーパス',
      moves: [
        { playerIndex: 9, dx: 5, dy: -18, delay: 0 },
        { playerIndex: 10, dx: -5, dy: -18, delay: 50 },
        { playerIndex: 6, dx: 0, dy: -5, delay: 100 },
        { playerIndex: 7, dx: 0, dy: -5, delay: 100 },
        { ballMove: { x: 37, y: 22 }, delay: 400 },
      ]
    }
  ],
  defense: [
    {
      id: 'press',
      name: '前線プレス',
      icon: '⬆',
      description: '高い位置からの前線プレス',
      moves: [
        { playerIndex: 9, dx: -5, dy: 10, delay: 0 },
        { playerIndex: 10, dx: 5, dy: 10, delay: 0 },
        { playerIndex: 5, dx: -8, dy: 8, delay: 100 },
        { playerIndex: 8, dx: 8, dy: 8, delay: 100 },
        { playerIndex: 6, dx: 0, dy: 8, delay: 200 },
        { playerIndex: 7, dx: 0, dy: 8, delay: 200 },
        { playerIndex: 1, dx: -5, dy: 5, delay: 300 },
        { playerIndex: 3, dx: 5, dy: 5, delay: 300 },
      ]
    },
    {
      id: 'mid-block',
      name: 'ミドルブロック',
      icon: '■',
      description: '中盤でのブロック守備',
      moves: [
        { playerIndex: 9, dx: 0, dy: 5, delay: 0 },
        { playerIndex: 10, dx: 0, dy: 5, delay: 0 },
        { playerIndex: 5, dx: -4, dy: 3, delay: 100 },
        { playerIndex: 8, dx: 4, dy: 3, delay: 100 },
        { playerIndex: 6, dx: -4, dy: 0, delay: 200 },
        { playerIndex: 7, dx: 4, dy: 0, delay: 200 },
        { playerIndex: 1, dx: -3, dy: 2, delay: 300 },
        { playerIndex: 2, dx: 0, dy: 2, delay: 300 },
        { playerIndex: 3, dx: 0, dy: 2, delay: 300 },
        { playerIndex: 4, dx: 3, dy: 2, delay: 300 },
      ]
    },
    {
      id: 'low-block',
      name: 'ローブロック',
      icon: '▼',
      description: '低い位置でのブロック守備',
      moves: [
        { playerIndex: 9, dx: -8, dy: 15, delay: 0 },
        { playerIndex: 10, dx: 8, dy: 15, delay: 0 },
        { playerIndex: 5, dx: -6, dy: 10, delay: 100 },
        { playerIndex: 6, dx: -4, dy: 8, delay: 100 },
        { playerIndex: 7, dx: 4, dy: 8, delay: 100 },
        { playerIndex: 8, dx: 6, dy: 10, delay: 100 },
        { playerIndex: 1, dx: -4, dy: 3, delay: 200 },
        { playerIndex: 3, dx: 4, dy: 3, delay: 200 },
      ]
    },
    {
      id: 'ball-side',
      name: 'ボールサイド圧縮',
      icon: '◀',
      description: 'ボール保持側へのプレッシャー',
      moves: [
        { playerIndex: 9, dx: -10, dy: 5, delay: 0 },
        { playerIndex: 10, dx: -8, dy: 5, delay: 0 },
        { playerIndex: 5, dx: -12, dy: 3, delay: 100 },
        { playerIndex: 6, dx: -10, dy: 2, delay: 100 },
        { playerIndex: 7, dx: -8, dy: 2, delay: 200 },
        { playerIndex: 1, dx: -8, dy: 2, delay: 300 },
        { playerIndex: 2, dx: -5, dy: 2, delay: 300 },
        { playerIndex: 3, dx: -3, dy: 2, delay: 300 },
      ]
    },
    {
      id: 'drop-far-side',
      name: '逆サイドを捨てる',
      icon: '▶',
      description: '逆サイドのスペースを捨てコンパクトに',
      moves: [
        { playerIndex: 8, dx: -18, dy: 2, delay: 0 },
        { playerIndex: 7, dx: -15, dy: 2, delay: 100 },
        { playerIndex: 4, dx: -15, dy: 2, delay: 200 },
        { playerIndex: 10, dx: -12, dy: 5, delay: 100 },
        { playerIndex: 6, dx: -8, dy: 2, delay: 200 },
        { playerIndex: 3, dx: -8, dy: 2, delay: 300 },
      ]
    }
  ]
};

// ===== APP STATE =====
let state = {
  myFormation: '4-4-2',
  oppFormation: '4-4-2',
  phase: 'attack',
  selectedPattern: null,
  isPlaying: false,
  animationSpeed: 1.0,
  showBall: true,
  ballPos: { x: 50, y: 50 },
  myPlayers: [],
  oppPlayers: [],
  savedPatterns: [],
  memo: '',
  currentAnimationFrame: null,
  animationTimers: [],
};

// ===== DOM REFS =====
const canvas = document.getElementById('pitch');
const ctx = canvas.getContext('2d');
const playersLayer = document.getElementById('players-layer');
const ballEl = document.getElementById('ball-el');
const arrowsSvg = document.getElementById('arrows-svg');
const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
const speedSlider = document.getElementById('speedSlider');
const speedLabel = document.getElementById('speedLabel');
const ballToggle = document.getElementById('ballToggle');
const patternList = document.getElementById('patternList');
const savedPatternsList = document.getElementById('savedPatternsList');
const memoArea = document.getElementById('memoArea');
const toast = document.getElementById('toast');
const saveDialog = document.getElementById('saveDialog');

// ===== INIT =====
function init() {
  loadFromStorage();
  resizePitch();
  drawPitch();
  spawnPlayers();
  updateBallPosition();
  renderPatternList();
  renderSavedPatterns();
  updateInfoBox();
  bindEvents();
  window.addEventListener('resize', () => {
    resizePitch();
    drawPitch();
    updateAllPlayerPositions();
    updateBallPosition();
  });
}

// ===== PITCH SIZING =====
function getPitchSize() {
  const container = document.getElementById('pitch-container');
  const w = container.clientWidth - 16;
  const h = container.clientHeight - 40;
  // Maintain aspect ratio 2:3
  let pw, ph;
  if (w / h > 2 / 3) {
    ph = Math.min(h, 600);
    pw = ph * (2 / 3);
  } else {
    pw = Math.min(w, 400);
    ph = pw * 1.5;
  }
  return { pw: Math.floor(pw), ph: Math.floor(ph) };
}

function resizePitch() {
  const { pw, ph } = getPitchSize();
  canvas.width = pw;
  canvas.height = ph;
  canvas.style.width = pw + 'px';
  canvas.style.height = ph + 'px';
  const wrapper = document.getElementById('pitch-wrapper');
  wrapper.style.width = pw + 'px';
  wrapper.style.height = ph + 'px';
  const playersLayer = document.getElementById('players-layer');
  playersLayer.style.width = pw + 'px';
  playersLayer.style.height = ph + 'px';
  arrowsSvg.setAttribute('width', pw);
  arrowsSvg.setAttribute('height', ph);
  arrowsSvg.style.width = pw + 'px';
  arrowsSvg.style.height = ph + 'px';
}

// ===== DRAW PITCH =====
function drawPitch() {
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#1e4a1a');
  bg.addColorStop(0.5, '#2d5a27');
  bg.addColorStop(1, '#1e4a1a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Stripes
  ctx.globalAlpha = 0.12;
  const stripeH = H / 10;
  for (let i = 0; i < 10; i++) {
    if (i % 2 === 0) {
      ctx.fillStyle = '#4a9e42';
      ctx.fillRect(0, i * stripeH, W, stripeH);
    }
  }
  ctx.globalAlpha = 1;

  const lw = Math.max(1, W * 0.006);
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = lw;

  const pad = W * 0.07;

  function line(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  function rect(x, y, w, h) {
    ctx.strokeRect(x, y, w, h);
  }

  // Outer boundary
  rect(pad, pad, W - pad * 2, H - pad * 2);

  // Halfway line
  line(pad, H / 2, W - pad, H / 2);

  // Center circle
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, W * 0.15, 0, Math.PI * 2);
  ctx.stroke();

  // Center spot
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, lw * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // TOP penalty area
  const paW = W * 0.6, paH = H * 0.16;
  const paX = (W - paW) / 2;
  rect(paX, pad, paW, paH);

  // TOP goal area
  const gaW = W * 0.32, gaH = H * 0.07;
  const gaX = (W - gaW) / 2;
  rect(gaX, pad, gaW, gaH);

  // TOP goal
  const gW = W * 0.2, gH = H * 0.025;
  const gX = (W - gW) / 2;
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(gX, pad - gH, gW, gH);
  rect(gX, pad - gH, gW, gH);

  // TOP penalty spot
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  ctx.arc(W / 2, pad + paH * 0.7, lw * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // TOP penalty arc
  ctx.save();
  ctx.beginPath();
  ctx.arc(W / 2, pad + paH * 0.7, W * 0.13, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.clip();
  ctx.beginPath();
  ctx.arc(W / 2, pad + paH * 0.7, W * 0.13, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // BOTTOM penalty area
  const paY2 = H - pad - paH;
  rect(paX, paY2, paW, paH);

  // BOTTOM goal area
  const gaY2 = H - pad - gaH;
  rect(gaX, gaY2, gaW, gaH);

  // BOTTOM goal
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.fillRect(gX, H - pad, gW, gH);
  rect(gX, H - pad, gW, gH);

  // BOTTOM penalty spot
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.beginPath();
  ctx.arc(W / 2, paY2 + paH * 0.3, lw * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // BOTTOM penalty arc
  ctx.save();
  ctx.beginPath();
  ctx.arc(W / 2, paY2 + paH * 0.3, W * 0.13, 1.15 * Math.PI, 1.85 * Math.PI);
  ctx.clip();
  ctx.beginPath();
  ctx.arc(W / 2, paY2 + paH * 0.3, W * 0.13, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Corner arcs
  const cr = W * 0.04;
  [
    [pad, pad, 0, Math.PI / 2],
    [W - pad, pad, Math.PI / 2, Math.PI],
    [W - pad, H - pad, Math.PI, Math.PI * 1.5],
    [pad, H - pad, Math.PI * 1.5, Math.PI * 2],
  ].forEach(([cx, cy, sa, ea]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, cr, sa, ea);
    ctx.stroke();
  });
}

// ===== PLAYERS =====
function getFormationPositions(formationKey, isOpp) {
  const formation = FORMATIONS[formationKey];
  if (!formation) return FORMATIONS['4-4-2'].positions;
  return formation.positions.map(p => {
    if (isOpp) {
      // Mirror vertically for opponent
      return { pos: p.pos, x: 100 - p.x, y: 100 - p.y };
    }
    return { ...p };
  });
}

function pctToPixel(xPct, yPct) {
  return { x: (xPct / 100) * canvas.width, y: (yPct / 100) * canvas.height };
}

function pixelToPct(px, py) {
  return { x: (px / canvas.width) * 100, y: (py / canvas.height) * 100 };
}

function spawnPlayers() {
  // Clear existing
  playersLayer.innerHTML = '';
  state.myPlayers = [];
  state.oppPlayers = [];

  const myPositions = getFormationPositions(state.myFormation, false);
  const oppPositions = getFormationPositions(state.oppFormation, true);

  myPositions.forEach((p, i) => {
    const el = createPlayerEl(p, 'my', i);
    playersLayer.appendChild(el);
    state.myPlayers.push({ ...p, el, baseX: p.x, baseY: p.y, currentX: p.x, currentY: p.y });
  });

  oppPositions.forEach((p, i) => {
    const el = createPlayerEl(p, 'opp', i);
    playersLayer.appendChild(el);
    state.oppPlayers.push({ ...p, el, baseX: p.x, baseY: p.y, currentX: p.x, currentY: p.y });
  });

  positionAllPlayers();
}

function createPlayerEl(p, team, idx) {
  const div = document.createElement('div');
  div.className = `player ${team}`;
  div.dataset.team = team;
  div.dataset.idx = idx;
  div.innerHTML = `<div class="player-circle">${p.pos}</div><div class="player-label">${p.pos}</div>`;

  // Drag support
  makeDraggable(div, team, idx);
  return div;
}

function positionAllPlayers() {
  state.myPlayers.forEach(p => positionPlayer(p));
  state.oppPlayers.forEach(p => positionPlayer(p));
}

function positionPlayer(p) {
  const { x, y } = pctToPixel(p.currentX, p.currentY);
  p.el.style.left = x + 'px';
  p.el.style.top = y + 'px';
}

function updateAllPlayerPositions() {
  positionAllPlayers();
}

// ===== DRAGGING =====
function makeDraggable(el, team, idx) {
  let startX, startY, startLeft, startTop, isDragging = false;

  const getPlayers = () => team === 'my' ? state.myPlayers : state.oppPlayers;

  const onStart = (clientX, clientY) => {
    isDragging = true;
    startX = clientX;
    startY = clientY;
    const p = getPlayers()[idx];
    const px = pctToPixel(p.currentX, p.currentY);
    startLeft = px.x;
    startTop = px.y;
    el.style.transition = 'none';
    el.style.zIndex = 50;
  };

  const onMove = (clientX, clientY) => {
    if (!isDragging) return;
    const wrapper = document.getElementById('pitch-wrapper');
    const rect = wrapper.getBoundingClientRect();
    const dx = clientX - startX;
    const dy = clientY - startY;
    const newX = Math.max(0, Math.min(canvas.width, startLeft + dx));
    const newY = Math.max(0, Math.min(canvas.height, startTop + dy));
    el.style.left = newX + 'px';
    el.style.top = newY + 'px';
    const pct = pixelToPct(newX, newY);
    const p = getPlayers()[idx];
    p.currentX = pct.x;
    p.currentY = pct.y;
    p.baseX = pct.x;
    p.baseY = pct.y;
  };

  const onEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    el.style.zIndex = 10;
  };

  // Mouse
  el.addEventListener('mousedown', e => { e.preventDefault(); onStart(e.clientX, e.clientY); });
  document.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
  document.addEventListener('mouseup', onEnd);

  // Touch
  el.addEventListener('touchstart', e => { e.preventDefault(); const t = e.touches[0]; onStart(t.clientX, t.clientY); }, { passive: false });
  document.addEventListener('touchmove', e => { if (isDragging) { e.preventDefault(); const t = e.touches[0]; onMove(t.clientX, t.clientY); } }, { passive: false });
  document.addEventListener('touchend', onEnd);
}

// ===== BALL =====
function updateBallPosition() {
  const { x, y } = pctToPixel(state.ballPos.x, state.ballPos.y);
  ballEl.style.left = x + 'px';
  ballEl.style.top = y + 'px';
  ballEl.style.display = state.showBall ? 'block' : 'none';
}

function makeBallDraggable() {
  let isDragging = false, startX, startY;

  ballEl.addEventListener('mousedown', e => {
    e.preventDefault();
    isDragging = true;
    ballEl.classList.add('dragging');
  });
  ballEl.addEventListener('touchstart', e => {
    e.preventDefault();
    isDragging = true;
    ballEl.classList.add('dragging');
  }, { passive: false });

  document.addEventListener('mousemove', e => {
    if (!isDragging) return;
    moveBall(e.clientX, e.clientY);
  });
  document.addEventListener('touchmove', e => {
    if (!isDragging) return;
    e.preventDefault();
    moveBall(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: false });

  const end = () => {
    isDragging = false;
    ballEl.classList.remove('dragging');
  };
  document.addEventListener('mouseup', end);
  document.addEventListener('touchend', end);
}

function moveBall(clientX, clientY) {
  const wrapper = document.getElementById('pitch-wrapper');
  const rect = wrapper.getBoundingClientRect();
  const x = Math.max(0, Math.min(canvas.width, clientX - rect.left));
  const y = Math.max(0, Math.min(canvas.height, clientY - rect.top));
  const pct = pixelToPct(x, y);
  state.ballPos = pct;
  ballEl.style.left = x + 'px';
  ballEl.style.top = y + 'px';
}

// ===== PATTERN LIST =====
function renderPatternList() {
  patternList.innerHTML = '';
  const patterns = PATTERNS[state.phase];
  patterns.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'pattern-item' + (state.selectedPattern === p.id ? ' active' : '');
    btn.dataset.id = p.id;
    btn.textContent = p.icon + ' ' + p.name;
    btn.title = p.description;
    btn.addEventListener('click', () => selectPattern(p.id));
    patternList.appendChild(btn);
  });
}

function selectPattern(id) {
  state.selectedPattern = id;
  renderPatternList();
  updateInfoBox();
  resetPlayersToBase();
  clearArrows();
  showToast('パターン: ' + getPatternById(id).name);
}

function getPatternById(id) {
  return [...PATTERNS.attack, ...PATTERNS.defense].find(p => p.id === id);
}

// ===== ANIMATION =====
function playPattern() {
  if (!state.selectedPattern) {
    showToast('パターンを選んでください');
    return;
  }
  if (state.isPlaying) return;

  const pattern = getPatternById(state.selectedPattern);
  if (!pattern) return;

  state.isPlaying = true;
  playBtn.textContent = '⏸ 再生中...';
  playBtn.classList.add('playing');

  resetPlayersToBase();
  clearArrows();

  const speed = state.animationSpeed;
  const baseDuration = 600 / speed;

  state.animationTimers = [];

  // Animate each move
  pattern.moves.forEach(move => {
    const delay = (move.delay || 0) / speed;

    if (move.ballMove) {
      const t = setTimeout(() => {
        animateBall(move.ballMove.x, move.ballMove.y, baseDuration);
      }, delay);
      state.animationTimers.push(t);
      return;
    }

    if (move.playerIndex === undefined) return;

    const players = state.myPlayers;
    const player = players[move.playerIndex];
    if (!player) return;

    // Draw arrow
    const t1 = setTimeout(() => {
      const fromPx = pctToPixel(player.currentX, player.currentY);
      const toPx = pctToPixel(player.currentX + move.dx, player.currentY + move.dy);
      drawArrow(fromPx.x, fromPx.y, toPx.x, toPx.y, state.phase === 'attack' ? '#ff3355' : '#3399ff');
    }, delay);
    state.animationTimers.push(t1);

    // Move player
    const t2 = setTimeout(() => {
      animatePlayer(player, player.currentX + move.dx, player.currentY + move.dy, baseDuration);
    }, delay + 100 / speed);
    state.animationTimers.push(t2);

    // Highlight
    const t3 = setTimeout(() => {
      player.el.classList.add('animating');
    }, delay);
    state.animationTimers.push(t3);
  });

  // End animation
  const maxDelay = Math.max(...pattern.moves.map(m => m.delay || 0)) / speed + baseDuration + 200;
  const tEnd = setTimeout(() => {
    stopAnimation();
  }, maxDelay);
  state.animationTimers.push(tEnd);
}

function animatePlayer(player, targetX, targetY, duration) {
  const startX = player.currentX;
  const startY = player.currentY;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const ease = easeOutCubic(progress);

    player.currentX = startX + (targetX - startX) * ease;
    player.currentY = startY + (targetY - startY) * ease;
    positionPlayer(player);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      player.baseX = targetX;
      player.baseY = targetY;
      player.el.classList.remove('animating');
    }
  }
  requestAnimationFrame(step);
}

function animateBall(targetX, targetY, duration) {
  if (!state.showBall) return;
  const startX = state.ballPos.x;
  const startY = state.ballPos.y;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const ease = easeOutCubic(progress);

    state.ballPos.x = startX + (targetX - startX) * ease;
    state.ballPos.y = startY + (targetY - startY) * ease;

    const px = pctToPixel(state.ballPos.x, state.ballPos.y);
    ballEl.style.left = px.x + 'px';
    ballEl.style.top = px.y + 'px';

    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function stopAnimation() {
  state.isPlaying = false;
  playBtn.textContent = '▶ 再生';
  playBtn.classList.remove('playing');
  state.animationTimers.forEach(t => clearTimeout(t));
  state.animationTimers = [];
  state.myPlayers.forEach(p => p.el.classList.remove('animating'));
  state.oppPlayers.forEach(p => p.el.classList.remove('animating'));
}

function resetPlayersToBase() {
  const myPositions = getFormationPositions(state.myFormation, false);
  const oppPositions = getFormationPositions(state.oppFormation, true);

  state.myPlayers.forEach((p, i) => {
    const base = myPositions[i];
    if (base) {
      p.currentX = base.x;
      p.currentY = base.y;
      p.baseX = base.x;
      p.baseY = base.y;
      positionPlayer(p);
    }
  });

  state.oppPlayers.forEach((p, i) => {
    const base = oppPositions[i];
    if (base) {
      p.currentX = base.x;
      p.currentY = base.y;
      p.baseX = base.x;
      p.baseY = base.y;
      positionPlayer(p);
    }
  });
}

// ===== ARROWS =====
function drawArrow(x1, y1, x2, y2, color) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const headLen = Math.min(12, len * 0.3);

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  const ax = x2 - headLen * Math.cos(angle - 0.4);
  const ay = y2 - headLen * Math.sin(angle - 0.4);
  const bx = x2 - headLen * Math.cos(angle + 0.4);
  const by = y2 - headLen * Math.sin(angle + 0.4);

  path.setAttribute('d', `M${x1},${y1} L${x2},${y2} M${ax},${ay} L${x2},${y2} L${bx},${by}`);
  path.setAttribute('stroke', color);
  path.setAttribute('stroke-width', '2');
  path.setAttribute('stroke-opacity', '0.75');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke-linecap', 'round');
  path.classList.add('arrow-path');

  arrowsSvg.appendChild(path);

  // Remove after a while
  setTimeout(() => {
    if (arrowsSvg.contains(path)) arrowsSvg.removeChild(path);
  }, 2500);
}

function clearArrows() {
  while (arrowsSvg.firstChild) arrowsSvg.removeChild(arrowsSvg.firstChild);
}

// ===== SAVED PATTERNS =====
function savePattern(name) {
  const snap = {
    id: Date.now(),
    name,
    myFormation: state.myFormation,
    oppFormation: state.oppFormation,
    phase: state.phase,
    patternId: state.selectedPattern,
    ballPos: { ...state.ballPos },
    memo: state.memo,
    timestamp: new Date().toLocaleString('ja-JP'),
  };
  state.savedPatterns.unshift(snap);
  saveToStorage();
  renderSavedPatterns();
  showToast('保存しました: ' + name);
}

function loadPattern(id) {
  const snap = state.savedPatterns.find(p => p.id === id);
  if (!snap) return;

  state.myFormation = snap.myFormation;
  state.oppFormation = snap.oppFormation;
  state.phase = snap.phase;
  state.selectedPattern = snap.patternId;
  state.ballPos = { ...snap.ballPos };
  state.memo = snap.memo || '';

  updateFormationButtons();
  updatePhaseButtons();
  renderPatternList();
  spawnPlayers();
  updateBallPosition();
  memoArea.value = state.memo;
  updateInfoBox();
  showToast('読み込みました: ' + snap.name);
}

function deletePattern(id) {
  state.savedPatterns = state.savedPatterns.filter(p => p.id !== id);
  saveToStorage();
  renderSavedPatterns();
}

function renderSavedPatterns() {
  if (state.savedPatterns.length === 0) {
    savedPatternsList.innerHTML = '<div class="empty-state">保存されたパターンはありません</div>';
    return;
  }
  savedPatternsList.innerHTML = '';
  state.savedPatterns.forEach(snap => {
    const div = document.createElement('div');
    div.className = 'saved-item';
    div.innerHTML = `
      <span class="saved-item-name" title="${snap.timestamp}" data-id="${snap.id}">${snap.name}</span>
      <button class="saved-item-del" data-id="${snap.id}">✕</button>
    `;
    div.querySelector('.saved-item-name').addEventListener('click', () => loadPattern(snap.id));
    div.querySelector('.saved-item-del').addEventListener('click', () => deletePattern(snap.id));
    savedPatternsList.appendChild(div);
  });
}

// ===== INFO BOX =====
function updateInfoBox() {
  document.getElementById('infoMyFormation').textContent = state.myFormation;
  document.getElementById('infoOppFormation').textContent = state.oppFormation;
  document.getElementById('infoPhase').textContent = state.phase === 'attack' ? '攻撃' : '守備';
  const p = state.selectedPattern ? getPatternById(state.selectedPattern) : null;
  document.getElementById('infoPattern').textContent = p ? p.name : '-';
}

// ===== TOAST =====
let toastTimer;
function showToast(msg) {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

// ===== STORAGE =====
function saveToStorage() {
  try {
    localStorage.setItem('tacticalBoard_saved', JSON.stringify(state.savedPatterns));
    localStorage.setItem('tacticalBoard_memo', state.memo);
    localStorage.setItem('tacticalBoard_myFormation', state.myFormation);
    localStorage.setItem('tacticalBoard_oppFormation', state.oppFormation);
  } catch (e) {}
}

function loadFromStorage() {
  try {
    const saved = localStorage.getItem('tacticalBoard_saved');
    if (saved) state.savedPatterns = JSON.parse(saved);
    const memo = localStorage.getItem('tacticalBoard_memo');
    if (memo) { state.memo = memo; memoArea.value = memo; }
    const myF = localStorage.getItem('tacticalBoard_myFormation');
    if (myF) state.myFormation = myF;
    const oppF = localStorage.getItem('tacticalBoard_oppFormation');
    if (oppF) state.oppFormation = oppF;
  } catch (e) {}
}

// ===== BUTTON STATE UPDATES =====
function updateFormationButtons() {
  document.querySelectorAll('#myFormationGrid .formation-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.formation === state.myFormation);
  });
  document.querySelectorAll('#oppFormationGrid .formation-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.formation === state.oppFormation);
  });
}

function updatePhaseButtons() {
  document.querySelectorAll('.phase-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.phase === state.phase);
  });
}

// ===== EVENT BINDING =====
function bindEvents() {
  // Formation
  document.querySelectorAll('.formation-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const team = btn.dataset.team;
      const formation = btn.dataset.formation;
      if (team === 'my') {
        state.myFormation = formation;
        document.querySelectorAll('#myFormationGrid .formation-btn').forEach(b => b.classList.remove('active'));
      } else {
        state.oppFormation = formation;
        document.querySelectorAll('#oppFormationGrid .formation-btn').forEach(b => b.classList.remove('active'));
      }
      btn.classList.add('active');
      stopAnimation();
      spawnPlayers();
      updateInfoBox();
      saveToStorage();
      showToast((team === 'my' ? '自チーム' : '相手') + ': ' + formation);
    });
  });

  // Phase
  document.querySelectorAll('.phase-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      state.phase = btn.dataset.phase;
      document.querySelectorAll('.phase-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedPattern = null;
      renderPatternList();
      updateInfoBox();
      clearArrows();
    });
  });

  // Play / Stop
  playBtn.addEventListener('click', () => {
    if (state.isPlaying) { stopAnimation(); } else { playPattern(); }
  });
  stopBtn.addEventListener('click', () => {
    stopAnimation();
    resetPlayersToBase();
    clearArrows();
  });

  // Speed
  speedSlider.addEventListener('input', () => {
    state.animationSpeed = parseFloat(speedSlider.value);
    speedLabel.textContent = state.animationSpeed.toFixed(1) + 'x';
  });

  // Ball toggle
  ballToggle.addEventListener('change', () => {
    state.showBall = ballToggle.checked;
    updateBallPosition();
  });

  // Memo
  memoArea.addEventListener('input', () => {
    state.memo = memoArea.value;
    saveToStorage();
  });

  // Save / Load / Reset buttons
  document.getElementById('saveBtn').addEventListener('click', () => {
    saveDialog.style.display = 'flex';
    document.getElementById('saveNameInput').value = '';
    document.getElementById('saveNameInput').focus();
  });
  document.getElementById('saveCancelBtn').addEventListener('click', () => {
    saveDialog.style.display = 'none';
  });
  document.getElementById('saveConfirmBtn').addEventListener('click', () => {
    const name = document.getElementById('saveNameInput').value.trim();
    if (!name) { showToast('名前を入力してください'); return; }
    savePattern(name);
    saveDialog.style.display = 'none';
  });
  document.getElementById('saveNameInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('saveConfirmBtn').click();
  });

  document.getElementById('loadBtn').addEventListener('click', () => {
    if (state.savedPatterns.length === 0) { showToast('保存済みパターンがありません'); return; }
    showToast('右パネルから読み込めます');
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    stopAnimation();
    resetPlayersToBase();
    clearArrows();
    state.ballPos = { x: 50, y: 50 };
    updateBallPosition();
    showToast('リセットしました');
  });

  // Mobile bottom nav
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.dataset.tab;
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      openDrawer(tabId);
    });
  });

  // Drawer overlay
  document.getElementById('drawer-overlay').addEventListener('click', closeDrawer);

  makeBallDraggable();
}

// ===== MOBILE DRAWER =====
function openDrawer(tab) {
  const drawer = document.getElementById('mobile-drawer');
  const content = document.getElementById('drawerContent');
  const overlay = document.getElementById('drawer-overlay');

  if (tab === 'play') {
    // Close drawer, just play
    closeDrawer();
    if (state.isPlaying) { stopAnimation(); } else { playPattern(); }
    return;
  }

  content.innerHTML = buildDrawerContent(tab);
  bindDrawerEvents(tab);
  drawer.classList.add('open');
  overlay.classList.add('visible');
}

function closeDrawer() {
  document.getElementById('mobile-drawer').classList.remove('open');
  document.getElementById('drawer-overlay').classList.remove('visible');
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
}

function buildDrawerContent(tab) {
  if (tab === 'formation') {
    return `
      <div class="panel-section">
        <h3 class="section-title"><span class="dot red"></span>自チーム</h3>
        <div class="formation-grid" id="drawerMyGrid">
          ${['4-4-2','4-2-3-1','4-3-3','3-4-2-1','3-5-2'].map(f => 
            `<button class="formation-btn ${state.myFormation === f ? 'active' : ''}" data-team="my" data-formation="${f}">${f}</button>`
          ).join('')}
        </div>
      </div>
      <div class="panel-section">
        <h3 class="section-title"><span class="dot blue"></span>相手チーム</h3>
        <div class="formation-grid" id="drawerOppGrid">
          ${['4-4-2','4-2-3-1','4-3-3','3-4-2-1','3-5-2'].map(f => 
            `<button class="formation-btn ${state.oppFormation === f ? 'active' : ''}" data-team="opp" data-formation="${f}">${f}</button>`
          ).join('')}
        </div>
      </div>`;
  }
  if (tab === 'pattern') {
    const patterns = PATTERNS[state.phase];
    return `
      <div class="panel-section">
        <h3 class="section-title">⚡ フェーズ</h3>
        <div class="phase-tabs">
          <button class="phase-tab ${state.phase === 'attack' ? 'active' : ''}" data-phase="attack">攻撃</button>
          <button class="phase-tab ${state.phase === 'defense' ? 'active' : ''}" data-phase="defense">守備</button>
        </div>
      </div>
      <div class="panel-section">
        <h3 class="section-title">📋 パターン</h3>
        <div class="pattern-list">
          ${patterns.map(p => 
            `<button class="pattern-item ${state.selectedPattern === p.id ? 'active' : ''}" data-id="${p.id}">${p.icon} ${p.name}</button>`
          ).join('')}
        </div>
        <div style="margin-top:12px">
          <button class="play-btn" id="drawerPlayBtn" style="width:100%;padding:12px">${state.isPlaying ? '⏸ 停止' : '▶ 再生'}</button>
        </div>
      </div>`;
  }
  if (tab === 'save') {
    return `
      <div class="panel-section">
        <h3 class="section-title">💾 保存・読込</h3>
        <div style="display:flex;gap:8px;margin-bottom:12px">
          <button class="play-btn" id="drawerSaveBtn" style="flex:1">💾 保存</button>
          <button class="stop-btn" id="drawerResetBtn" style="flex:1">↺ リセット</button>
        </div>
        <h3 class="section-title" style="margin-top:8px">保存済み</h3>
        <div class="saved-list">
          ${state.savedPatterns.length === 0 
            ? '<div class="empty-state">保存されたパターンはありません</div>'
            : state.savedPatterns.map(s => 
              `<div class="saved-item">
                <span class="saved-item-name" data-id="${s.id}">${s.name}</span>
                <button class="saved-item-del" data-id="${s.id}">✕</button>
              </div>`
            ).join('')
          }
        </div>
        <h3 class="section-title" style="margin-top:12px">📝 メモ</h3>
        <textarea id="drawerMemo" style="width:100%;min-height:80px;background:var(--bg);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:var(--font-body);font-size:12px;padding:8px;resize:vertical;outline:none">${state.memo}</textarea>
      </div>`;
  }
  return '';
}

function bindDrawerEvents(tab) {
  if (tab === 'formation') {
    document.querySelectorAll('#drawerMyGrid .formation-btn, #drawerOppGrid .formation-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const team = btn.dataset.team;
        const formation = btn.dataset.formation;
        if (team === 'my') {
          state.myFormation = formation;
          document.querySelectorAll('#drawerMyGrid .formation-btn').forEach(b => b.classList.remove('active'));
        } else {
          state.oppFormation = formation;
          document.querySelectorAll('#drawerOppGrid .formation-btn').forEach(b => b.classList.remove('active'));
        }
        btn.classList.add('active');
        stopAnimation();
        spawnPlayers();
        updateInfoBox();
        updateFormationButtons();
        saveToStorage();
        showToast((team === 'my' ? '自チーム' : '相手') + ': ' + formation);
      });
    });
  }
  if (tab === 'pattern') {
    document.querySelectorAll('#mobile-drawer .phase-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        state.phase = btn.dataset.phase;
        document.querySelectorAll('#mobile-drawer .phase-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.selectedPattern = null;
        renderPatternList();
        updatePhaseButtons();
        updateInfoBox();
        clearArrows();
        // Re-render drawer patterns
        const drawerPatternList = document.querySelector('#mobile-drawer .pattern-list');
        const patterns = PATTERNS[state.phase];
        if (drawerPatternList) {
          drawerPatternList.innerHTML = patterns.map(p =>
            `<button class="pattern-item" data-id="${p.id}">${p.icon} ${p.name}</button>`
          ).join('');
          drawerPatternList.querySelectorAll('.pattern-item').forEach(pBtn => {
            pBtn.addEventListener('click', () => {
              selectPattern(pBtn.dataset.id);
              drawerPatternList.querySelectorAll('.pattern-item').forEach(b => b.classList.remove('active'));
              pBtn.classList.add('active');
            });
          });
        }
      });
    });
    document.querySelectorAll('#mobile-drawer .pattern-item').forEach(btn => {
      btn.addEventListener('click', () => {
        selectPattern(btn.dataset.id);
        document.querySelectorAll('#mobile-drawer .pattern-item').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
    const drawerPlayBtn = document.getElementById('drawerPlayBtn');
    if (drawerPlayBtn) {
      drawerPlayBtn.addEventListener('click', () => {
        closeDrawer();
        setTimeout(() => {
          if (state.isPlaying) { stopAnimation(); } else { playPattern(); }
        }, 100);
      });
    }
  }
  if (tab === 'save') {
    const drawerSaveBtn = document.getElementById('drawerSaveBtn');
    if (drawerSaveBtn) {
      drawerSaveBtn.addEventListener('click', () => {
        saveDialog.style.display = 'flex';
        document.getElementById('saveNameInput').value = '';
        setTimeout(() => document.getElementById('saveNameInput').focus(), 100);
      });
    }
    const drawerResetBtn = document.getElementById('drawerResetBtn');
    if (drawerResetBtn) {
      drawerResetBtn.addEventListener('click', () => {
        stopAnimation();
        resetPlayersToBase();
        clearArrows();
        state.ballPos = { x: 50, y: 50 };
        updateBallPosition();
        showToast('リセットしました');
      });
    }
    document.querySelectorAll('#mobile-drawer .saved-item-name').forEach(el => {
      el.addEventListener('click', () => { loadPattern(parseInt(el.dataset.id)); closeDrawer(); });
    });
    document.querySelectorAll('#mobile-drawer .saved-item-del').forEach(el => {
      el.addEventListener('click', () => { deletePattern(parseInt(el.dataset.id)); closeDrawer(); });
    });
    const drawerMemo = document.getElementById('drawerMemo');
    if (drawerMemo) {
      drawerMemo.addEventListener('input', () => {
        state.memo = drawerMemo.value;
        memoArea.value = state.memo;
        saveToStorage();
      });
    }
  }
}

// ===== START =====
window.addEventListener('DOMContentLoaded', init);
