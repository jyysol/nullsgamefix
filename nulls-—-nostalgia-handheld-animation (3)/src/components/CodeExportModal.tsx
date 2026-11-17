import { useState } from 'react';
import { X, Copy, Check, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CodeExportModalProps {
  open: boolean;
  onClose: () => void;
}

const STANDALONE_HTML_GAME = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NULLS — Dusk Rail '98 (Siap Pakai)</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #09080c;
      color: #f5efe6;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .console {
      width: 350px;
      padding: 18px 18px 26px;
      border-radius: 26px;
      background: linear-gradient(180deg, #c83931 0%, #9c241f 100%);
      border: 1px solid rgba(255, 160, 145, 0.35);
      box-shadow: 0 28px 60px rgba(0, 0, 0, 0.75);
      user-select: none;
    }
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-size: 10px;
      font-family: monospace;
      letter-spacing: 0.14em;
      color: rgba(255,255,255,0.65);
    }
    .led {
      width: 9px;
      height: 9px;
      border-radius: 50%;
      background: #2a1212;
      transition: all 0.2s;
    }
    .led.on {
      background: #34d399;
      box-shadow: 0 0 10px #34d399;
    }
    .bezel {
      background: #0e0f14;
      padding: 12px;
      border-radius: 14px;
      box-shadow: inset 0 2px 8px rgba(0,0,0,0.9);
    }
    .screen {
      position: relative;
      width: 100%;
      aspect-ratio: 3 / 2;
      background: #04060d;
      border-radius: 8px;
      overflow: hidden;
    }
    canvas {
      width: 100%;
      height: 100%;
      display: block;
      image-rendering: pixelated;
    }
    .scanlines {
      pointer-events: none;
      position: absolute;
      inset: 0;
      background: repeating-linear-gradient(
        to bottom,
        transparent 0px,
        transparent 2px,
        rgba(0,0,0,0.3) 3px,
        rgba(0,0,0,0.3) 4px
      );
    }
    .controls {
      margin-top: 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 8px;
    }
    .dpad {
      display: grid;
      grid-template-columns: repeat(3, 22px);
      grid-template-rows: repeat(3, 22px);
    }
    .dpad button, .ab button {
      border: 1px solid #000;
      background: #1a1b22;
      color: #fff;
      font-weight: 700;
      cursor: pointer;
    }
    .dpad button:active, .ab button:active { transform: translateY(1px); }
    .d-up { grid-column: 2; grid-row: 1; border-radius: 4px 4px 0 0; }
    .d-left { grid-column: 1; grid-row: 2; border-radius: 4px 0 0 4px; }
    .d-mid { grid-column: 2; grid-row: 2; background: #14151b; }
    .d-right { grid-column: 3; grid-row: 2; border-radius: 0 4px 4px 0; }
    .d-down { grid-column: 2; grid-row: 3; border-radius: 0 0 4px 4px; }
    .ab { display: flex; gap: 12px; transform: rotate(-12deg); }
    .ab button {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      font-size: 12px;
      box-shadow: 0 3px 0 #09090c;
    }
    .bottom-row {
      margin-top: 16px;
      display: flex;
      justify-content: center;
      gap: 14px;
    }
    .pill-btn {
      padding: 5px 12px;
      border-radius: 999px;
      border: 1px solid #000;
      background: #17181f;
      color: rgba(255,255,255,0.75);
      font-size: 9px;
      font-family: monospace;
      letter-spacing: 0.12em;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="console">
    <div class="top-bar">
      <span>NULLS · USG-003</span>
      <div class="led" id="pwr-led"></div>
    </div>
    <div class="bezel">
      <div class="screen">
        <canvas id="game" width="240" height="160"></canvas>
        <div class="scanlines"></div>
      </div>
    </div>
    <div class="controls">
      <div class="dpad">
        <button class="d-up" onclick="handleJump()" aria-label="Lompat">▲</button>
        <button class="d-left" onclick="handleJump()" aria-label="Kiri"></button>
        <div class="d-mid"></div>
        <button class="d-right" onclick="handleJump()" aria-label="Kanan"></button>
        <button class="d-down" onclick="handleDuck()" aria-label="Menunduk">▼</button>
      </div>
      <div class="ab">
        <button onclick="handleDuck()" style="margin-top:10px">B</button>
        <button onclick="handleAction()">A</button>
      </div>
    </div>
    <div class="bottom-row">
      <button class="pill-btn" onclick="powerToggle()">POWER</button>
      <button class="pill-btn" onclick="handleStart()">START</button>
    </div>
  </div>

  <script>
    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');
    const led = document.getElementById('pwr-led');
    const W = 240, H = 160, GROUND_Y = 128;

    let audioCtx = null;
    function beep(freq, dur, type = 'square', vol = 0.08) {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(vol, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
      osc.connect(gain); gain.connect(audioCtx.destination);
      osc.start(); osc.stop(audioCtx.currentTime + dur);
    }

    let state = 'OFF'; // OFF | BOOT | TITLE | PLAY | PAUSE | OVER
    let bootTimer = 0, elapsed = 0, score = 0;
    let highScore = Number(localStorage.getItem('nulls_hs') || 400);
    let playerY = 0, velocityY = 0, isJumping = false, isDucking = false, duckTimer = 0;
    let speed = 138, spawnTimer = 0.8, obstacles = [];

    function powerToggle() {
      if (state === 'OFF') {
        state = 'BOOT';
        bootTimer = 0;
        led.classList.add('on');
        beep(523.25, 0.14);
        setTimeout(() => beep(659.25, 0.14), 100);
        setTimeout(() => beep(783.99, 0.16), 200);
        setTimeout(() => beep(1046.5, 0.45), 320);
      } else {
        state = 'OFF';
        led.classList.remove('on');
        beep(220, 0.08, 'triangle');
      }
    }

    function startGame() {
      state = 'PLAY';
      score = 0; playerY = 0; velocityY = 0; isJumping = false;
      isDucking = false; speed = 138; spawnTimer = 0.6; obstacles = [];
      beep(880, 0.09);
    }

    function handleStart() {
      if (state === 'OFF') powerToggle();
      else if (state === 'TITLE' || state === 'OVER') startGame();
      else if (state === 'PLAY') state = 'PAUSE';
      else if (state === 'PAUSE') state = 'PLAY';
    }

    function handleAction() {
      if (state === 'OFF') powerToggle();
      else if (state === 'TITLE' || state === 'OVER') startGame();
      else handleJump();
    }

    function handleJump() {
      if (state !== 'PLAY') return;
      if (!isJumping) {
        velocityY = -285;
        isJumping = true;
        isDucking = false;
        beep(440, 0.1);
      }
    }

    function handleDuck() {
      if (state !== 'PLAY') return;
      if (isJumping && velocityY < 160) velocityY = 210;
      isDucking = true;
      duckTimer = 0.45;
      beep(280, 0.06);
    }

    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault(); handleAction();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault(); handleDuck();
      } else if (e.code === 'Enter' || e.code === 'KeyP') {
        handleStart();
      }
    });

    function drawNullsLogo(alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.shadowColor = '#1e7bff';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#0a5bff';
      ctx.font = 'bold 34px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NULLS', W / 2, 84);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.strokeText('NULLS', W / 2, 84);
      ctx.restore();
    }

    let last = performance.now();
    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (state === 'OFF') {
        ctx.fillStyle = '#07080e';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('TEKAN POWER / SPACE', W / 2, H / 2);
      } else if (state === 'BOOT') {
        bootTimer += dt;
        ctx.fillStyle = '#02040a';
        ctx.fillRect(0, 0, W, H);
        drawNullsLogo(Math.min(1, bootTimer * 1.4));
        if (bootTimer > 0.8) {
          ctx.fillStyle = 'rgba(191,219,254,0.75)';
          ctx.font = '7px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('© 1998 NULLS ENTERTAINMENT', W / 2, 114);
        }
        if (bootTimer > 2.4) state = 'TITLE';
      } else {
        if (state === 'PLAY') elapsed += dt;
        const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
        grad.addColorStop(0, '#120d26');
        grad.addColorStop(0.55, '#592038');
        grad.addColorStop(1, '#e67e35');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, GROUND_Y);

        ctx.fillStyle = '#ffbe55';
        ctx.beginPath(); ctx.arc(185, 58, 18, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#181a24';
        ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
        ctx.fillStyle = '#384664';
        ctx.fillRect(0, GROUND_Y, W, 3);

        if (state === 'TITLE') {
          drawNullsLogo(1);
          ctx.fillStyle = '#ffe8b3';
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText("DUSK RAIL '98", W / 2, 108);
          if (Math.floor(now / 500) % 2 === 0) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '9px monospace';
            ctx.fillText('PRESS START / SPACE', W / 2, 144);
          }
        } else {
          if (state === 'PLAY') {
            playerY += velocityY * dt;
            velocityY += 980 * dt;
            if (playerY >= 0) { playerY = 0; velocityY = 0; isJumping = false; }
            if (isDucking) { duckTimer -= dt; if (duckTimer <= 0) isDucking = false; }

            spawnTimer -= dt;
            if (spawnTimer <= 0) {
              const isCard = Math.random() > 0.65;
              obstacles.push({
                x: W + 12,
                w: 12,
                h: isCard ? 13 : 16,
                yOff: isCard ? 24 : 0,
                type: isCard ? 'card' : 'barrier',
                done: false
              });
              spawnTimer = Math.max(0.7, 1.25 - score / 2000) + Math.random() * 0.3;
            }
            speed = Math.min(250, 138 + score * 0.08);
          }

          const px = 34;
          const ph = isDucking ? 12 : 20;
          const py = GROUND_Y - ph + playerY;

          for (let i = obstacles.length - 1; i >= 0; i--) {
            const o = obstacles[i];
            if (state === 'PLAY') o.x -= speed * dt;
            const oy = GROUND_Y - o.yOff - o.h;
            if (o.type === 'card' && !o.done) {
              ctx.fillStyle = '#0e63ff';
              ctx.fillRect(o.x, oy, o.w, o.h);
              if (px < o.x + o.w && px + 14 > o.x && py < oy + o.h && py + ph > oy) {
                o.done = true; score += 100; beep(1100, 0.08);
              }
            } else if (o.type === 'barrier') {
              ctx.fillStyle = '#d9383a';
              ctx.fillRect(o.x, oy, o.w, o.h);
              if (state === 'PLAY' && px + 2 < o.x + o.w - 2 && px + 12 > o.x + 2 && py + 2 < oy + o.h && py + ph - 1 > oy + 2) {
                state = 'OVER';
                highScore = Math.max(highScore, score);
                localStorage.setItem('nulls_hs', String(highScore));
                beep(180, 0.25, 'sawtooth');
              }
            }
            if (o.x < -25) {
              obstacles.splice(i, 1);
              if (state === 'PLAY' && o.type === 'barrier') score += 25;
            }
          }

          // Hero sprite
          ctx.fillStyle = '#244b8f'; ctx.fillRect(px + 2, py + ph - 7, 10, 7);
          ctx.fillStyle = '#f2eadc'; ctx.fillRect(px + 1, py + ph - 13, 12, 7);
          ctx.fillStyle = '#09090c'; ctx.fillRect(px + 2, py, 10, 7);
          ctx.fillStyle = '#e03535'; ctx.fillRect(px + 1, py + 2, 2, 4);
          ctx.fillStyle = '#ffffff'; ctx.fillRect(px + 5, py + 3, 2, 2); ctx.fillRect(px + 9, py + 3, 2, 2);

          // HUD
          ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(0, 0, W, 16);
          ctx.fillStyle = '#93c5fd'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'left';
          ctx.fillText('SCR ' + String(score).padStart(4, '0'), 8, 11);
          ctx.fillStyle = '#fcd34d';
          ctx.fillText('HI ' + String(Math.max(highScore, score)).padStart(4, '0'), 175, 11);

          if (state === 'PAUSE') {
            ctx.fillStyle = 'rgba(6,8,16,0.75)'; ctx.fillRect(50, 54, 140, 44);
            ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
            ctx.fillText('PAUSED', W / 2, 80);
          } else if (state === 'OVER') {
            ctx.fillStyle = 'rgba(6,8,16,0.8)'; ctx.fillRect(30, 46, 180, 62);
            ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', W / 2, 70);
            ctx.fillStyle = '#60a5fa'; ctx.font = '9px monospace';
            ctx.fillText('SPACE / A: MAIN LAGI', W / 2, 92);
          }
        }
      }
      requestAnimationFrame(loop);
    }

    powerToggle();
    requestAnimationFrame(loop);
  </script>
</body>
</html>`;

export function CodeExportModal({ open, onClose }: CodeExportModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(STANDALONE_HTML_GAME);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API restricted
    }
  };

  const handleDownload = () => {
    const blob = new Blob([STANDALONE_HTML_GAME], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nulls-dusk-rail-98.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 sm:p-6"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label="Kode Game Siap Pakai"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex w-full max-w-4xl flex-col rounded-2xl bg-[#100f15] border border-white/12 p-5 sm:p-6 shadow-2xl max-h-[88vh]"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-[#f5efe6]">
                  Kode Game Siap Pakai (HTML5 Mandiri)
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-[#a69f94]">
                  Satu file lengkap berisi animasi boot logo NULLS, Web Audio SFX, dan game Dusk Rail ’98. Simpan sebagai file .html dan langsung buka di browser.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-white/10 px-3.5 text-xs font-semibold text-white hover:bg-white/15 transition-colors whitespace-nowrap"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? 'Tersalin' : 'Salin Kode'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#1560ff] px-3.5 text-xs font-semibold text-white hover:bg-[#236cff] transition-colors whitespace-nowrap"
                >
                  <Download className="h-4 w-4" />
                  <span>Unduh .html</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Tutup jendela kode"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-[#d7d0c5] hover:bg-white/10 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex-1 overflow-auto rounded-xl bg-[#07070b] border border-white/10 p-4">
              <pre className="text-xs leading-relaxed font-mono-num text-blue-100/90 whitespace-pre">
                <code>{STANDALONE_HTML_GAME}</code>
              </pre>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
