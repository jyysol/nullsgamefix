/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  AnimationStage,
  ScreenFilter,
  ShellVariant,
} from './components/HandheldDevice';
import { GameInputSignals } from './components/RetroMiniGame';
import { CameraMode, TrainCharacterScene } from './components/TrainCharacterScene';
import { retroAudio } from './audio/retroAudio';

export default function App() {
  const [stage, setStage] = useState<AnimationStage>('IDLE');
  const [cameraMode] = useState<CameraMode>('auto');
  const [shellVariant, setShellVariant] = useState<ShellVariant>('classic-red');
  const [screenFilter] = useState<ScreenFilter>('crt');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [gameSignals, setGameSignals] = useState<GameInputSignals>({
    jump: 0,
    duck: 0,
    pause: 0,
  });

  const timersRef = useRef<number[]>([]);

  const clearSequenceTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, delayMs: number) => {
    const id = window.setTimeout(fn, delayMs);
    timersRef.current.push(id);
  }, []);

  // Full cinematic boot sequence: Idle -> Reach Power -> Flash -> NULLS Boot -> Title Screen
  const startBootSequence = useCallback(
    (withAudioUnlock = true) => {
      clearSequenceTimers();
      if (withAudioUnlock) {
        retroAudio.unlock();
        if (!isMuted) {
          retroAudio.startTrainAmbience();
        }
      }

      setStage('IDLE');

      schedule(() => {
        setStage('REACHING_POWER');
      }, 650);

      schedule(() => {
        retroAudio.playPowerSwitchClick();
        setStage('POWER_FLASH');
      }, 1350);

      schedule(() => {
        retroAudio.playScreenStaticWarmup();
        setStage('BOOTING_NULLS');
        retroAudio.playNullsBootChime();
      }, 1780);

      schedule(() => {
        setStage('TITLE_SCREEN');
      }, 4500);
    },
    [clearSequenceTimers, schedule, isMuted]
  );

  // Auto-play the animation smoothly once on initial mount
  useEffect(() => {
    startBootSequence(false);
    return () => {
      clearSequenceTimers();
      retroAudio.stopTrainAmbience();
    };
  }, [startBootSequence, clearSequenceTimers]);

  // Unlock browser audio on first pointer or key interaction + optional keyboard shortcuts
  useEffect(() => {
    const unlockOnce = () => {
      retroAudio.unlock();
      if (!retroAudio.getMuted()) {
        retroAudio.startTrainAmbience();
      }
      window.removeEventListener('pointerdown', unlockOnce);
      window.removeEventListener('keydown', unlockOnce);
    };
    const handleShortcuts = (e: KeyboardEvent) => {
      if (e.code === 'KeyM') {
        setIsMuted((prev) => {
          const next = !prev;
          retroAudio.setMuted(next);
          if (!next) {
            retroAudio.unlock();
            retroAudio.startTrainAmbience();
          }
          return next;
        });
      } else if (e.code === 'KeyR') {
        startBootSequence(true);
      }
    };
    window.addEventListener('pointerdown', unlockOnce);
    window.addEventListener('keydown', unlockOnce);
    window.addEventListener('keydown', handleShortcuts);
    return () => {
      window.removeEventListener('pointerdown', unlockOnce);
      window.removeEventListener('keydown', unlockOnce);
      window.removeEventListener('keydown', handleShortcuts);
    };
  }, [startBootSequence]);

  const handlePowerPress = () => {
    retroAudio.unlock();
    if (!isMuted) retroAudio.startTrainAmbience();

    if (stage === 'IDLE') {
      clearSequenceTimers();
      setStage('REACHING_POWER');
      schedule(() => {
        retroAudio.playPowerSwitchClick();
        setStage('POWER_FLASH');
      }, 520);
      schedule(() => {
        retroAudio.playScreenStaticWarmup();
        setStage('BOOTING_NULLS');
        retroAudio.playNullsBootChime();
      }, 920);
      schedule(() => {
        setStage('TITLE_SCREEN');
      }, 3600);
    } else {
      startBootSequence(true);
    }
  };

  const handleStartGame = () => {
    retroAudio.unlock();
    retroAudio.playButtonBlip(920);
    clearSequenceTimers();
    setStage('PLAYING');
  };

  const handleActionButton = (action: 'jump' | 'duck' | 'pause' | 'shell' = 'jump') => {
    retroAudio.unlock();
    if (action === 'shell') {
      retroAudio.playButtonBlip(700);
      setShellVariant((prev) => (prev === 'classic-red' ? 'translucent-pcb' : 'classic-red'));
      return;
    }
    if (stage === 'IDLE') {
      handlePowerPress();
      return;
    }
    if (stage === 'TITLE_SCREEN') {
      handleStartGame();
      return;
    }
    if (stage === 'PLAYING') {
      setGameSignals((prev) => ({
        ...prev,
        [action]: prev[action] + 1,
      }));
      return;
    }
    retroAudio.playButtonBlip(620);
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-[#09080c]">
      <TrainCharacterScene
        stage={stage}
        cameraMode={cameraMode}
        shellVariant={shellVariant}
        screenFilter={screenFilter}
        onPowerPress={handlePowerPress}
        onStartGame={handleStartGame}
        onActionButton={handleActionButton}
        gameSignals={gameSignals}
      />
    </main>
  );
}
