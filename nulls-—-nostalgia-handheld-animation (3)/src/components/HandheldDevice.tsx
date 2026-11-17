import { motion, AnimatePresence } from 'motion/react';
import { NullsLogo } from './NullsLogo';
import { RetroMiniGame, GameInputSignals } from './RetroMiniGame';

export type AnimationStage =
  | 'IDLE'
  | 'REACHING_POWER'
  | 'POWER_FLASH'
  | 'BOOTING_NULLS'
  | 'TITLE_SCREEN'
  | 'PLAYING';

export type ShellVariant = 'classic-red' | 'translucent-pcb';
export type ScreenFilter = 'crt' | 'lcd' | 'clean';

interface HandheldDeviceProps {
  stage: AnimationStage;
  shellVariant: ShellVariant;
  screenFilter: ScreenFilter;
  onPowerPress: () => void;
  onStartGame: () => void;
  onActionButton: (action?: 'jump' | 'duck' | 'pause' | 'shell') => void;
  gameSignals: GameInputSignals;
  size?: 'closeup' | 'compact';
}

export function HandheldDevice({
  stage,
  shellVariant,
  screenFilter,
  onPowerPress,
  onStartGame,
  onActionButton,
  gameSignals,
  size = 'closeup',
}: HandheldDeviceProps) {
  const isPowered =
    stage === 'POWER_FLASH' ||
    stage === 'BOOTING_NULLS' ||
    stage === 'TITLE_SCREEN' ||
    stage === 'PLAYING';

  const isTranslucent = shellVariant === 'translucent-pcb';

  return (
    <div
      className={`relative select-none ${
        size === 'closeup' ? 'w-[310px] sm:w-[348px]' : 'w-[220px]'
      }`}
    >
      {/* Side Power Slider / Switch (Right Edge, inspired by GBA SP / DS) */}
      <button
        type="button"
        onClick={onPowerPress}
        aria-label={isPowered ? 'Matikan atau ulangi nyalakan konsol' : 'Nyalakan konsol Nintendo'}
        className="group absolute -right-2.5 top-[72px] z-20 flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-r"
      >
        <motion.div
          animate={{
            y: stage === 'REACHING_POWER' ? -4 : isPowered ? -8 : 0,
            backgroundColor: isPowered ? '#34d399' : '#d97706',
          }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="h-9 w-3 rounded-r-md border border-black/40 shadow-md flex flex-col items-center justify-center gap-0.5"
        >
          <span className="w-1.5 h-[1px] bg-black/50" />
          <span className="w-1.5 h-[1px] bg-black/50" />
          <span className="w-1.5 h-[1px] bg-black/50" />
        </motion.div>
      </button>

      {/* Main Handheld Body */}
      <div
        className={`relative rounded-[26px] p-4 pb-6 transition-colors duration-300 ${
          isTranslucent
            ? 'bg-gradient-to-b from-[#5e2328]/90 via-[#42181c]/95 to-[#2d1013]/95 border border-[#a84a4f]/50 shadow-[0_28px_60px_rgba(0,0,0,0.75),inset_0_1px_1px_rgba(255,210,190,0.3)]'
            : 'bg-gradient-to-b from-[#c83931] via-[#ab2a24] to-[#871f1b] border border-[#e35c54]/50 shadow-[0_28px_60px_rgba(0,0,0,0.75),inset_0_1px_2px_rgba(255,215,200,0.35)]'
        }`}
      >
        {/* Translucent PCB internal circuit layer (from Reference Image 2) */}
        {isTranslucent && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-2 rounded-[20px] overflow-hidden opacity-85"
          >
            <svg viewBox="0 0 320 440" className="w-full h-full">
              {/* Green PCB board */}
              <rect x="14" y="18" width="292" height="404" rx="14" fill="#1b3b28" opacity="0.72" />
              {/* Copper traces */}
              <g stroke="#4f8e64" strokeWidth="2" fill="none" opacity="0.65">
                <path d="M 40 250 L 90 250 L 110 270 L 180 270" />
                <path d="M 40 264 L 82 264 L 104 286 L 210 286" />
                <path d="M 240 250 L 240 330 L 195 360" />
                <path d="M 140 245 L 140 385" />
                <path d="M 275 180 L 275 300 L 250 325" />
              </g>
              {/* Main IC processor chip */}
              <rect x="122" y="255" width="76" height="58" rx="4" fill="#13161c" stroke="#64748b" strokeWidth="1.5" />
              <text x="160" y="287" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                NULLS-CPU
              </text>
              {/* Copper coil & capacitor */}
              <rect x="44" y="340" width="38" height="28" rx="4" fill="#a86532" opacity="0.85" />
              <circle cx="245" cy="368" r="14" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
              {/* USG-003 stamp */}
              <text x="28" y="405" fill="#9ca3af" fontSize="8" fontFamily="monospace" opacity="0.8">
                NULLS USG-003 · Z/N-SC01
              </text>
              {/* Diagonal glass specular reflection */}
              <polygon points="0,60 140,0 190,0 0,110" fill="white" opacity="0.06" />
              <polygon points="180,440 320,300 320,340 220,440" fill="white" opacity="0.05" />
            </svg>
          </div>
        )}

        {/* Top ridge / cartridge seam */}
        <div className="relative z-10 mb-3 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono-num tracking-[0.18em] text-white/55 uppercase">
              {isTranslucent ? 'NULLBOY · PCB' : 'NULLS · USG-003'}
            </span>
          </div>

          {/* Real Power & Charge Indicator LEDs */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono-num text-white/50">PWR</span>
            <span
              className={`h-2.5 w-2.5 rounded-full transition-all duration-200 ${
                isPowered
                  ? 'bg-emerald-400 shadow-[0_0_10px_#34d399,0_0_4px_#ffffff]'
                  : 'bg-[#2a1212] border border-black/40'
              }`}
            />
          </div>
        </div>

        {/* Screen Lens Bezel */}
        <div className="relative z-10 rounded-[14px] bg-[#0e0f14] p-3 shadow-[inset_0_2px_8px_rgba(0,0,0,0.9),0_1px_0_rgba(255,255,255,0.12)] border border-black/70">
          {/* Actual Screen Display */}
          <div className="relative aspect-[3/2] w-full overflow-hidden rounded-[8px] bg-[#05060b] border border-white/5">
            {/* Screen Backlight Ambient Glow when ON */}
            {isPowered && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-radial from-blue-500/15 via-transparent to-black/60"
              />
            )}

            {/* Stage: OFF / IDLE */}
            {!isPowered && (
              <button
                type="button"
                onClick={onPowerPress}
                className="group relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#12151c] via-[#090b10] to-[#050608] text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                {/* Warm train sunset reflection across matte dark glass */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-amber-400/[0.06] to-orange-300/[0.12]"
                />
                <span className="text-[11px] font-mono-num tracking-wider text-white/40 group-hover:text-white/75 transition-colors">
                  {stage === 'REACHING_POWER' ? 'MENYALAKAN...' : 'KLIK UNTUK NYALAKAN'}
                </span>
              </button>
            )}

            {/* Stage: POWER_FLASH (CRT Cathode Wake-up Line) */}
            <AnimatePresence>
              {stage === 'POWER_FLASH' && (
                <motion.div
                  initial={{ scaleY: 0.02, scaleX: 0.1, opacity: 1 }}
                  animate={{ scaleY: [0.02, 0.04, 1], scaleX: [0.1, 1, 1], opacity: [1, 1, 0.15] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 bg-gradient-to-b from-blue-300 via-white to-blue-400"
                />
              )}
            </AnimatePresence>

            {/* Stage: BOOTING_NULLS */}
            {stage === 'BOOTING_NULLS' && (
              <div className="relative flex h-full w-full flex-col items-center justify-center bg-[#02040a] px-6">
                <NullsLogo visible animateBoot className="w-[78%] max-w-[230px]" />
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 0.78, y: 0 }}
                  transition={{ delay: 0.85, duration: 0.45 }}
                  className="mt-4 text-[9px] font-mono-num tracking-[0.22em] text-blue-200/80 uppercase"
                >
                  © 1998 NULLS ENTERTAINMENT
                </motion.p>
              </div>
            )}

            {/* Stage: TITLE_SCREEN */}
            {stage === 'TITLE_SCREEN' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
                onClick={onStartGame}
                className="relative flex h-full w-full cursor-pointer flex-col items-center justify-between bg-gradient-to-b from-[#110c24] via-[#4a1c36] to-[#d96d2b] p-4 text-center"
              >
                <div className="w-full flex items-center justify-between text-[9px] font-mono-num text-blue-200/80">
                  <span>NULLBOY OS</span>
                  <span>1998</span>
                </div>

                <div className="flex flex-col items-center">
                  <NullsLogo visible animateBoot={false} className="w-28 mb-1.5" />
                  <h3 className="font-display text-base sm:text-lg font-extrabold tracking-wide text-[#ffe8b3] drop-shadow-[0_2px_0_rgba(0,0,0,0.85)]">
                    DUSK RAIL ’98
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartGame();
                  }}
                  className="animate-blink-retro rounded px-2.5 py-1 text-[10px] font-mono-num font-bold tracking-[0.16em] text-white bg-black/45 border border-white/25 hover:bg-black/65"
                >
                  PRESS START / A
                </button>
              </motion.div>
            )}

            {/* Stage: PLAYING */}
            {stage === 'PLAYING' && (
              <RetroMiniGame active externalSignals={gameSignals} />
            )}

            {/* Screen Overlay Filters */}
            {screenFilter === 'crt' && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 crt-scanlines crt-vignette opacity-80"
              />
            )}
            {screenFilter === 'lcd' && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 lcd-grid opacity-90"
              />
            )}
          </div>

          {/* Lower Screen Bezel Brand */}
          <div className="mt-2 flex items-center justify-between px-1">
            <span className="text-[10px] font-display font-bold tracking-[0.22em] text-white/45">
              NULLS
            </span>
            <span className="text-[9px] font-mono-num text-white/30">STEREO · PHONES</span>
          </div>
        </div>

        {/* Lower Controls Deck */}
        <div className="relative z-10 mt-5 flex items-center justify-between px-2">
          {/* Tactile Cross D-Pad with Up (Jump) & Down (Duck) zones */}
          <div className="relative h-20 w-20 flex items-center justify-center">
            <div className="relative h-[68px] w-[68px]">
              {/* Vertical & Horizontal cross visuals */}
              <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-full w-6 rounded-[4px] bg-[#1a1b22] border border-black/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_3px_0_#09090c]" />
              <div className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2 w-full h-6 rounded-[4px] bg-[#1a1b22] border border-black/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_3px_0_#09090c]" />
              {/* Center pivot dimple */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-[#131419] shadow-inner" />

              {/* D-Pad Up (Jump) */}
              <button
                type="button"
                onClick={() => onActionButton('jump')}
                aria-label="D-Pad Atas (Lompat)"
                className="absolute left-1/2 top-0 -translate-x-1/2 h-6 w-6 rounded-t-[4px] hover:bg-white/10 active:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              />
              {/* D-Pad Down (Duck) */}
              <button
                type="button"
                onClick={() => onActionButton('duck')}
                aria-label="D-Pad Bawah (Menunduk)"
                className="absolute left-1/2 bottom-0 -translate-x-1/2 h-6 w-6 rounded-b-[4px] hover:bg-white/10 active:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              />
              {/* D-Pad Left / Right */}
              <button
                type="button"
                onClick={() => onActionButton('jump')}
                aria-label="D-Pad Kiri"
                className="absolute top-1/2 left-0 -translate-y-1/2 h-6 w-6 rounded-l-[4px] hover:bg-white/10 active:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              />
              <button
                type="button"
                onClick={() => onActionButton('jump')}
                aria-label="D-Pad Kanan"
                className="absolute top-1/2 right-0 -translate-y-1/2 h-6 w-6 rounded-r-[4px] hover:bg-white/10 active:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              />
            </div>
          </div>

          {/* Center Speaker Grille */}
          <div className="grid grid-cols-3 gap-1.5 opacity-60" aria-hidden="true">
            {Array.from({ length: 9 }).map((_, idx) => (
              <span key={idx} className="h-1.5 w-1.5 rounded-full bg-black/75 shadow-[0_1px_0_rgba(255,255,255,0.15)]" />
            ))}
          </div>

          {/* A & B Action Buttons */}
          <div className="flex items-center gap-3 -rotate-12">
            <div className="flex flex-col items-center gap-1 mt-3">
              <button
                type="button"
                onClick={() => onActionButton('duck')}
                aria-label="Tombol B (Menunduk)"
                className="h-9 w-9 rounded-full bg-[#1b1c24] border border-black/80 text-[11px] font-display font-bold text-white/70 shadow-[inset_0_2px_2px_rgba(255,255,255,0.18),0_3px_0_#09090c] active:translate-y-[2px] active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                B
              </button>
            </div>
            <div className="flex flex-col items-center gap-1 -mt-3">
              <button
                type="button"
                onClick={() => {
                  if (stage === 'TITLE_SCREEN') onStartGame();
                  else onActionButton('jump');
                }}
                aria-label="Tombol A (Lompat / Mulai)"
                className="h-9 w-9 rounded-full bg-[#1b1c24] border border-black/80 text-[11px] font-display font-bold text-white/80 shadow-[inset_0_2px_2px_rgba(255,255,255,0.18),0_3px_0_#09090c] active:translate-y-[2px] active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                A
              </button>
            </div>
          </div>
        </div>

        {/* Select / Start & Headphone Jack Bottom Row */}
        <div className="relative z-10 mt-4 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => onActionButton('shell')}
            title="Ganti cangkang konsol (Merah Klasik / Transparan PCB)"
            className="flex flex-col items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded px-1"
          >
            <span className="h-2.5 w-7 rounded-full bg-[#17181f] border border-black/70 shadow-inner" />
            <span className="text-[8px] font-mono-num tracking-widest text-white/50">SELECT</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (stage === 'IDLE') onPowerPress();
              else if (stage === 'TITLE_SCREEN') onStartGame();
              else onActionButton('pause');
            }}
            className="flex flex-col items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded px-1"
          >
            <span className="h-2.5 w-7 rounded-full bg-[#17181f] border border-black/70 shadow-inner" />
            <span className="text-[8px] font-mono-num tracking-widest text-white/50">START</span>
          </button>
        </div>

        {/* Wrist strap loop & headphone jack detail at bottom edge */}
        <div className="pointer-events-none absolute -bottom-5 left-6 flex items-center gap-2">
          <div className="h-6 w-3 rounded-b-full border-2 border-[#121318] border-t-0" />
        </div>
      </div>
    </div>
  );
}
