import { useEffect, useRef, useState, useCallback } from 'react';
import { retroAudio } from '../audio/retroAudio';

export interface GameInputSignals {
  jump: number;
  duck: number;
  pause: number;
}

interface RetroMiniGameProps {
  active: boolean;
  onExitToTitle?: () => void;
  externalSignals: GameInputSignals;
}

interface Obstacle {
  x: number;
  width: number;
  height: number;
  yOffset: number; // height above ground
  type: 'barrier' | 'overhead' | 'card';
  collected?: boolean;
}

const HIGH_SCORE_KEY = 'nulls_dusk_rail_highscore';

export function RetroMiniGame({ active, externalSignals }: RetroMiniGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(HIGH_SCORE_KEY);
      return saved ? Math.max(400, parseInt(saved, 10) || 400) : 400;
    } catch {
      return 400;
    }
  });
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const stateRef = useRef({
    playerY: 0,
    velocityY: 0,
    isJumping: false,
    isDucking: false,
    duckTimer: 0,
    obstacles: [] as Obstacle[],
    spawnTimer: 0,
    elapsed: 0,
    score: 0,
    speed: 138, // pixels per second
    isGameOver: false,
    isPaused: false,
  });

  const resetGame = useCallback(() => {
    const st = stateRef.current;
    st.playerY = 0;
    st.velocityY = 0;
    st.isJumping = false;
    st.isDucking = false;
    st.duckTimer = 0;
    st.obstacles = [];
    st.spawnTimer = 0.6;
    st.elapsed = 0;
    st.score = 0;
    st.speed = 138;
    st.isGameOver = false;
    st.isPaused = false;
    setScore(0);
    setIsGameOver(false);
    setIsPaused(false);
    retroAudio.playButtonBlip(820);
  }, []);

  const triggerJump = useCallback(() => {
    const st = stateRef.current;
    if (st.isPaused) {
      st.isPaused = false;
      setIsPaused(false);
      retroAudio.playButtonBlip(760);
      return;
    }
    if (st.isGameOver) {
      resetGame();
      return;
    }
    if (!st.isJumping) {
      st.velocityY = -285;
      st.isJumping = true;
      st.isDucking = false;
      st.duckTimer = 0;
      retroAudio.playJumpSfx();
    }
  }, [resetGame]);

  const triggerDuck = useCallback(() => {
    const st = stateRef.current;
    if (st.isPaused || st.isGameOver) return;
    if (st.isJumping && st.velocityY < 160) {
      // Fast-fall when in air
      st.velocityY = 210;
    }
    st.isDucking = true;
    st.duckTimer = 0.45;
    retroAudio.playButtonBlip(420);
  }, []);

  const togglePause = useCallback(() => {
    const st = stateRef.current;
    if (st.isGameOver) {
      resetGame();
      return;
    }
    st.isPaused = !st.isPaused;
    setIsPaused(st.isPaused);
    retroAudio.playButtonBlip(st.isPaused ? 480 : 720);
  }, [resetGame]);

  // Respond to handheld console hardware buttons
  useEffect(() => {
    if (externalSignals.jump > 0 && active) {
      triggerJump();
    }
  }, [externalSignals.jump, active, triggerJump]);

  useEffect(() => {
    if (externalSignals.duck > 0 && active) {
      triggerDuck();
    }
  }, [externalSignals.duck, active, triggerDuck]);

  useEffect(() => {
    if (externalSignals.pause > 0 && active) {
      togglePause();
    }
  }, [externalSignals.pause, active, togglePause]);

  // Full keyboard controls
  useEffect(() => {
    if (!active) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'KeyZ') {
        e.preventDefault();
        triggerJump();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        triggerDuck();
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        e.preventDefault();
        togglePause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, triggerJump, triggerDuck, togglePause]);

  // Delta-time game loop
  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let lastTime = performance.now();
    const W = 240;
    const H = 160;
    const GROUND_Y = 128;

    const renderLoop = (now: number) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      const st = stateRef.current;

      if (!st.isPaused) {
        st.elapsed += dt;
      }

      // 1. Sunset nostalgic sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      skyGrad.addColorStop(0, '#120d26');
      skyGrad.addColorStop(0.55, '#592038');
      skyGrad.addColorStop(1, '#e67e35');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, GROUND_Y);

      // Retro striped sunset sun
      ctx.fillStyle = '#ffbe55';
      ctx.beginPath();
      ctx.arc(185, 58, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#592038';
      ctx.fillRect(165, 62, 40, 2);
      ctx.fillRect(165, 67, 40, 2);
      ctx.fillRect(165, 72, 40, 3);

      // Parallax distant city blocks
      const cityOffset = (st.elapsed * 24) % 80;
      ctx.fillStyle = '#25152c';
      for (let i = -1; i < 5; i++) {
        const bx = i * 80 - cityOffset;
        ctx.fillRect(bx, GROUND_Y - 26, 22, 26);
        ctx.fillRect(bx + 26, GROUND_Y - 38, 18, 38);
        ctx.fillRect(bx + 48, GROUND_Y - 19, 24, 19);
      }

      // Train roof / track surface
      ctx.fillStyle = '#181a24';
      ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
      ctx.fillStyle = '#384664';
      ctx.fillRect(0, GROUND_Y, W, 3);

      // Moving rail ties
      const tieOffset = (st.elapsed * st.speed * 1.45) % 24;
      ctx.fillStyle = '#2a3248';
      for (let i = -1; i < 12; i++) {
        ctx.fillRect(i * 24 - tieOffset, GROUND_Y + 8, 12, 3);
      }

      // Physics & Spawner
      if (!st.isGameOver && !st.isPaused) {
        st.playerY += st.velocityY * dt;
        st.velocityY += 980 * dt;
        if (st.playerY >= 0) {
          st.playerY = 0;
          st.velocityY = 0;
          st.isJumping = false;
        }

        if (st.isDucking) {
          st.duckTimer -= dt;
          if (st.duckTimer <= 0) {
            st.isDucking = false;
          }
        }

        st.spawnTimer -= dt;
        if (st.spawnTimer <= 0) {
          const roll = Math.random();
          if (roll > 0.65) {
            // Collectible NULLS Memory Card
            st.obstacles.push({
              x: W + 12,
              width: 11,
              height: 13,
              yOffset: 24,
              type: 'card',
            });
          } else if (roll > 0.38 && st.score >= 100) {
            // Overhead signal bar (duck underneath or jump high)
            st.obstacles.push({
              x: W + 12,
              width: 16,
              height: 12,
              yOffset: 14,
              type: 'overhead',
            });
          } else {
            // Ground barrier
            st.obstacles.push({
              x: W + 12,
              width: 12,
              height: 15 + Math.floor(Math.random() * 8),
              yOffset: 0,
              type: 'barrier',
            });
          }
          st.spawnTimer = Math.max(0.68, 1.25 - st.score / 2200) + Math.random() * 0.35;
        }

        st.speed = Math.min(255, 138 + st.score * 0.08);
      }

      // Player Hitbox
      const px = 34;
      const pHeight = st.isDucking ? 12 : 20;
      const py = GROUND_Y - pHeight + st.playerY;

      // Update & Draw Obstacles
      for (let i = st.obstacles.length - 1; i >= 0; i--) {
        const obs = st.obstacles[i];
        if (!st.isGameOver && !st.isPaused) {
          obs.x -= st.speed * dt;
        }

        if (obs.type === 'card' && !obs.collected) {
          const cy = GROUND_Y - obs.yOffset - obs.height;
          ctx.fillStyle = '#0e63ff';
          ctx.fillRect(obs.x, cy, obs.width, obs.height);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(obs.x + 2, cy + 2, 7, 4);
          ctx.fillStyle = '#ff4444';
          ctx.fillRect(obs.x + 2, cy + 9, 7, 2);

          if (
            px < obs.x + obs.width &&
            px + 14 > obs.x &&
            py < cy + obs.height &&
            py + pHeight > cy
          ) {
            obs.collected = true;
            st.score += 100;
            setScore(st.score);
            retroAudio.playScoreSfx();
          }
        } else if (obs.type === 'barrier' || obs.type === 'overhead') {
          const by = GROUND_Y - obs.yOffset - obs.height;
          ctx.fillStyle = obs.type === 'overhead' ? '#f59e0b' : '#d9383a';
          ctx.fillRect(obs.x, by, obs.width, obs.height);
          ctx.fillStyle = obs.type === 'overhead' ? '#78350f' : '#ffcf5c';
          ctx.fillRect(obs.x + 2, by + 2, obs.width - 4, 4);

          if (
            !st.isGameOver &&
            px + 2 < obs.x + obs.width - 2 &&
            px + 12 > obs.x + 2 &&
            py + 2 < by + obs.height &&
            py + pHeight - 1 > by + 2
          ) {
            st.isGameOver = true;
            setIsGameOver(true);
            setHighScore((prev) => {
              const next = Math.max(prev, st.score);
              try {
                localStorage.setItem(HIGH_SCORE_KEY, String(next));
              } catch {
                // Ignore storage quota errors
              }
              return next;
            });
            retroAudio.playGameOverSfx();
          }
        }

        if (obs.x < -30) {
          st.obstacles.splice(i, 1);
          if (!st.isGameOver && !st.isPaused && (obs.type === 'barrier' || obs.type === 'overhead')) {
            st.score += 25;
            setScore(st.score);
          }
        }
      }

      // Draw pixel-art hero character (standing or ducking)
      if (st.isDucking) {
        // Crouched pose
        ctx.fillStyle = '#244b8f';
        ctx.fillRect(px + 1, py + 8, 12, 4);
        ctx.fillStyle = '#f2eadc';
        ctx.fillRect(px + 1, py + 4, 12, 5);
        ctx.fillStyle = '#09090c';
        ctx.fillRect(px + 3, py, 10, 6);
        ctx.fillRect(px + 1, py - 1, 3, 2);
        ctx.fillRect(px + 6, py - 2, 3, 2);
        ctx.fillStyle = '#e03535';
        ctx.fillRect(px + 2, py + 1, 2, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px + 7, py + 2, 2, 2);
        ctx.fillRect(px + 10, py + 2, 2, 2);
      } else {
        const bob = st.isJumping ? 0 : Math.floor(st.elapsed * 9) % 2;
        ctx.fillStyle = '#244b8f';
        ctx.fillRect(px + 2, py + 13, 4, 7 - bob);
        ctx.fillRect(px + 8, py + 13, 4, 7 - (1 - bob));
        ctx.fillStyle = '#f2eadc';
        ctx.fillRect(px + 1, py + 7, 12, 7);
        ctx.fillStyle = '#09090c';
        ctx.fillRect(px + 2, py + 1, 10, 7);
        ctx.fillRect(px, py - 1, 3, 3);
        ctx.fillRect(px + 5, py - 3, 4, 4);
        ctx.fillRect(px + 11, py - 1, 3, 3);
        ctx.fillStyle = '#e03535';
        ctx.fillRect(px + 1, py + 2, 2, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px + 5, py + 3, 2, 2);
        ctx.fillRect(px + 9, py + 3, 2, 2);
      }

      // HUD bar
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, W, 16);
      ctx.fillStyle = '#93c5fd';
      ctx.font = 'bold 9px "JetBrains Mono", monospace';
      ctx.fillText(`SCR ${String(st.score).padStart(4, '0')}`, 8, 11);
      ctx.fillStyle = '#fcd34d';
      ctx.fillText(`HI ${String(Math.max(highScore, st.score)).padStart(4, '0')}`, 174, 11);

      if (st.isPaused && !st.isGameOver) {
        ctx.fillStyle = 'rgba(6, 8, 16, 0.72)';
        ctx.fillRect(46, 52, W - 92, 50);
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 2;
        ctx.strokeRect(46, 52, W - 92, 50);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', W / 2, 74);
        ctx.fillStyle = '#93c5fd';
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillText('PRESS START / P', W / 2, 92);
        ctx.textAlign = 'left';
      }

      if (st.isGameOver) {
        ctx.fillStyle = 'rgba(6, 8, 16, 0.8)';
        ctx.fillRect(28, 42, W - 56, 72);
        ctx.strokeStyle = '#1e7bff';
        ctx.lineWidth = 2;
        ctx.strokeRect(28, 42, W - 56, 72);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', W / 2, 68);

        ctx.fillStyle = '#60a5fa';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText('PRESS A / SPACE TO RETRY', W / 2, 92);
        ctx.textAlign = 'left';
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [active, highScore]);

  return (
    <div
      onClick={triggerJump}
      className="relative w-full h-full cursor-pointer select-none overflow-hidden bg-[#0a0c18]"
      title="Spasi/Atas: Lompat · Bawah: Menunduk · P: Jeda"
    >
      <canvas
        ref={canvasRef}
        width={240}
        height={160}
        className="w-full h-full object-cover [image-rendering:pixelated]"
      />
      <div className="pointer-events-none absolute bottom-1 inset-x-0 flex justify-between px-2 text-[9px] font-mono-num text-white/65">
        <span>
          {isGameOver
            ? 'A / SPACE: RETRY'
            : isPaused
            ? 'PAUSED'
            : 'SPACE: JUMP · DOWN: DUCK'}
        </span>
        <span>SCORE {score}</span>
      </div>
    </div>
  );
}
