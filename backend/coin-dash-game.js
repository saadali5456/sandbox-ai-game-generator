const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const finalScoreEl = document.getElementById('finalScore');
const gameOverScreen = document.getElementById('gameOverScreen');
const restartBtn = document.getElementById('restartBtn');

// Audio Synthesis for Sound Effects
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playCoinSound() {
  try {
    const actx = getAudioContext();
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, actx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, actx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.2, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(actx.destination);
    osc.start();
    osc.stop(actx.currentTime + 0.15);
  } catch (e) {}
}

function playHitSound() {
  try {
    const actx = getAudioContext();
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, actx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, actx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(actx.destination);
    osc.start();
    osc.stop(actx.currentTime + 0.3);
  } catch (e) {}
}

// Game State
let score = 0;
let highScore = parseInt(localStorage.getItem('coinDashHighScore') || '0', 10);
highScoreEl.textContent = highScore;
let isGameOver = false;
let animationId = null;

// Input State
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  KeyW: false,
  KeyS: false,
  KeyA: false,
  KeyD: false
};

window.addEventListener('keydown', (e) => {
  if (e.code in keys) {
    keys[e.code] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
  }
  if (e.code === 'Space' && isGameOver) {
    restartGame();
  }
});

window.addEventListener('keyup', (e) => {
  if (e.code in keys) {
    keys[e.code] = false;
  }
});

// Entities
const player = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 16,
  speed: 4.5,
  color: '#38bdf8'
};

let coins = [];
let obstacles = [];
let particles = [];

function spawnCoin() {
  const padding = 35;
  const x = Math.random() * (canvas.width - padding * 2) + padding;
  const y = Math.random() * (canvas.height - padding * 2) + padding;
  coins.push({
    x,
    y,
    radius: 11,
    pulse: Math.random() * Math.PI
  });
}

function spawnObstacle() {
  const padding = 40;
  let x, y, dist;
  do {
    x = Math.random() * (canvas.width - padding * 2) + padding;
    y = Math.random() * (canvas.height - padding * 2) + padding;
    const dx = x - player.x;
    const dy = y - player.y;
    dist = Math.hypot(dx, dy);
  } while (dist < 150);

  const speed = 1.5 + Math.random() * 1.5 + score * 0.05;
  const angle = Math.random() * Math.PI * 2;
  const vx = Math.cos(angle) * speed;
  const vy = Math.sin(angle) * speed;

  obstacles.push({
    x,
    y,
    radius: 14 + Math.random() * 4,
    vx,
    vy,
    color: '#ef4444'
  });
}

function createCoinParticles(x, y) {
  for (let i = 0; i < 10; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 3;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 2 + Math.random() * 2,
      life: 1,
      color: '#fbbf24'
    });
  }
}

function initGame() {
  score = 0;
  scoreEl.textContent = score;
  isGameOver = false;
  gameOverScreen.classList.add('hidden');

  player.x = canvas.width / 2;
  player.y = canvas.height / 2;

  coins = [];
  obstacles = [];
  particles = [];

  for (let i = 0; i < 4; i++) {
    spawnCoin();
  }

  for (let i = 0; i < 3; i++) {
    spawnObstacle();
  }
}

function restartGame() {
  initGame();
}

restartBtn.addEventListener('click', restartGame);

function triggerGameOver() {
  isGameOver = true;
  playHitSound();
  if (score > highScore) {
  highScore = score;
  highScoreEl.textContent = highScore;
}
  finalScoreEl.textContent = score;
  gameOverScreen.classList.remove('hidden');
}

function update() {
  if (isGameOver) return;

  // Player Movement
  let moveX = 0;
  let moveY = 0;

  if (keys.ArrowUp || keys.KeyW) moveY -= 1;
  if (keys.ArrowDown || keys.KeyS) moveY += 1;
  if (keys.ArrowLeft || keys.KeyA) moveX -= 1;
  if (keys.ArrowRight || keys.KeyD) moveX += 1;

  if (moveX !== 0 && moveY !== 0) {
    moveX *= Math.SQRT1_2;
    moveY *= Math.SQRT1_2;
  }

  player.x += moveX * player.speed;
  player.y += moveY * player.speed;

  // Wall Collision for Player
  player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
  player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));

  // Update Obstacles
  for (const obs of obstacles) {
    obs.x += obs.vx;
    obs.y += obs.vy;

    if (obs.x - obs.radius <= 0) {
      obs.x = obs.radius;
      obs.vx *= -1;
    } else if (obs.x + obs.radius >= canvas.width) {
      obs.x = canvas.width - obs.radius;
      obs.vx *= -1;
    }

    if (obs.y - obs.radius <= 0) {
      obs.y = obs.radius;
      obs.vy *= -1;
    } else if (obs.y + obs.radius >= canvas.height) {
      obs.y = canvas.height - obs.radius;
      obs.vy *= -1;
    }

    // Obstacle vs Player Collision
    const dist = Math.hypot(player.x - obs.x, player.y - obs.y);
    if (dist < player.radius + obs.radius) {
      triggerGameOver();
      return;
    }
  }

  // Coin Collection
  for (let i = coins.length - 1; i >= 0; i--) {
    const coin = coins[i];
    coin.pulse += 0.08;
    const dist = Math.hypot(player.x - coin.x, player.y - coin.y);
    if (dist < player.radius + coin.radius) {
      createCoinParticles(coin.x, coin.y);
      playCoinSound();
      coins.splice(i, 1);
      score += 1;
      scoreEl.textContent = score;

      spawnCoin();

      // Spawn an extra obstacle every 5 coins
      if (score % 5 === 0 && obstacles.length < 12) {
        spawnObstacle();
      }
    }
  }

  // Update Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.035;
    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw subtle grid
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x < canvas.width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Draw Particles
  for (const p of particles) {
    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Draw Coins
  for (const coin of coins) {
    const pulseOffset = Math.sin(coin.pulse) * 1.5;
    ctx.save();
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, coin.radius + pulseOffset, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fef3c7';
    ctx.stroke();

    // Inner dollar / star shine
    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('$', coin.x, coin.y);
    ctx.restore();
  }

  // Draw Obstacles
  for (const obs of obstacles) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
    ctx.fillStyle = obs.color;
    ctx.shadowColor = '#dc2626';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#fca5a5';
    ctx.stroke();

    // Center danger dot
    ctx.beginPath();
    ctx.arc(obs.x, obs.y, obs.radius * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#7f1d1d';
    ctx.fill();
    ctx.restore();
  }

  // Draw Player
  ctx.save();
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
  ctx.fillStyle = player.color;
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 14;
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#e0f2fe';
  ctx.stroke();

  // Eyes
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(player.x - 5, player.y - 3, 2.5, 0, Math.PI * 2);
  ctx.arc(player.x + 5, player.y - 3, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Smile
  ctx.beginPath();
  ctx.arc(player.x, player.y + 2, 6, 0.2, Math.PI - 0.2);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.8;
  ctx.stroke();
  ctx.restore();
}

function loop() {
  update();
  render();
  animationId = requestAnimationFrame(loop);
}

// Start Game
initGame();
loop();