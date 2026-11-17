import { motion, AnimatePresence } from 'motion/react';
import { AnimationStage, HandheldDevice, ScreenFilter, ShellVariant } from './HandheldDevice';
import { GameInputSignals } from './RetroMiniGame';

export type CameraMode = 'auto' | 'scene' | 'closeup';

interface TrainCharacterSceneProps {
  stage: AnimationStage;
  cameraMode: CameraMode;
  shellVariant: ShellVariant;
  screenFilter: ScreenFilter;
  onPowerPress: () => void;
  onStartGame: () => void;
  onActionButton: (action?: 'jump' | 'duck' | 'pause' | 'shell') => void;
  gameSignals: GameInputSignals;
}

export function TrainCharacterScene({
  stage,
  cameraMode,
  shellVariant,
  screenFilter,
  onPowerPress,
  onStartGame,
  onActionButton,
  gameSignals,
}: TrainCharacterSceneProps) {
  const isPowered =
    stage === 'POWER_FLASH' ||
    stage === 'BOOTING_NULLS' ||
    stage === 'TITLE_SCREEN' ||
    stage === 'PLAYING';

  const showCloseupOverlay =
    cameraMode === 'closeup' ||
    (cameraMode === 'auto' &&
      (stage === 'BOOTING_NULLS' || stage === 'TITLE_SCREEN' || stage === 'PLAYING'));

  const isZoomingToHands =
    cameraMode === 'auto' && (stage === 'REACHING_POWER' || stage === 'POWER_FLASH');

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#101318] select-none">
      {/* Main Train Carriage & Character Canvas */}
      <motion.div
        animate={{
          scale: showCloseupOverlay ? 1.18 : isZoomingToHands ? 1.24 : 1,
          y: showCloseupOverlay ? 20 : isZoomingToHands ? -28 : 0,
          filter: showCloseupOverlay ? 'blur(5px) brightness(0.55)' : 'blur(0px) brightness(1)',
        }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="relative h-full w-full flex items-center justify-center"
      >
        {/* Full 16:10 / Widescreen Train Interior SVG */}
        <svg
          viewBox="0 0 1200 820"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
          role="img"
          aria-label="Karakter duduk di dalam kereta senja memegang konsol handheld"
        >
          <defs>
            {/* Warm sunset sky outside train windows */}
            <linearGradient id="sunset-sky" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffe1b0" />
              <stop offset="52%" stopColor="#f0b075" />
              <stop offset="100%" stopColor="#a76b58" />
            </linearGradient>

            {/* Interior carriage wall gradient (cool mint overhead to warm dusk lower) */}
            <linearGradient id="carriage-wall" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e2a28" />
              <stop offset="22%" stopColor="#466058" />
              <stop offset="58%" stopColor="#354742" />
              <stop offset="100%" stopColor="#1b2223" />
            </linearGradient>

            {/* Fluorescent overhead glow */}
            <radialGradient id="overhead-mint-glow" cx="56%" cy="5%" r="55%">
              <stop offset="0%" stopColor="#a9f5d0" stopOpacity="0.48" />
              <stop offset="45%" stopColor="#65b895" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#1f2c29" stopOpacity="0" />
            </radialGradient>

            {/* Dramatic left-side red doorway rim light (matching reference) */}
            <linearGradient id="left-red-rim" x1="0%" y1="50%" x2="45%" y2="50%">
              <stop offset="0%" stopColor="#d92b27" stopOpacity="0.62" />
              <stop offset="40%" stopColor="#a82020" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </linearGradient>

            {/* Teal train bench cushion gradient */}
            <linearGradient id="bench-teal" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#56766d" />
              <stop offset="65%" stopColor="#3c5650" />
              <stop offset="100%" stopColor="#263734" />
            </linearGradient>

            {/* Floor perspective gradient */}
            <linearGradient id="train-floor" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#202a29" />
              <stop offset="100%" stopColor="#313d3a" />
            </linearGradient>

            {/* Motion blur filter for passing scenery */}
            <filter id="window-motion-blur" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="10 0.8" />
            </filter>

            {/* Character electric blue screen bounce light */}
            <radialGradient id="screen-blue-bounce" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.72" />
              <stop offset="55%" stopColor="#1d4ed8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0" />
            </radialGradient>

            {/* Clip path for train windows */}
            <clipPath id="windows-clip">
              <rect x="215" y="175" width="770" height="82" rx="14" />
              <rect x="215" y="274" width="770" height="126" rx="14" />
              <rect x="-40" y="175" width="135" height="225" rx="14" />
              <rect x="1115" y="175" width="135" height="225" rx="14" />
            </clipPath>
          </defs>

          {/* Base Carriage Wall */}
          <rect width="1200" height="820" fill="url(#carriage-wall)" />

          {/* Moving Outside Sunset World (clipped to windows) */}
          <g clipPath="url(#windows-clip)">
            <rect x="-50" y="160" width="1300" height="260" fill="url(#sunset-sky)" />

            {/* Slow-moving distant sunset city silhouette */}
            <g className="animate-train-pass-slow" filter="url(#window-motion-blur)" opacity="0.55">
              <g>
                <rect x="0" y="295" width="120" height="120" fill="#8b5544" />
                <rect x="140" y="265" width="85" height="150" fill="#7c4b3d" />
                <rect x="245" y="310" width="150" height="110" fill="#9a604c" />
                <rect x="430" y="250" width="110" height="165" fill="#734438" />
                <rect x="570" y="290" width="180" height="125" fill="#8c5746" />
                <rect x="780" y="270" width="95" height="145" fill="#7b4a3c" />
                <rect x="910" y="305" width="140" height="115" fill="#965d49" />
                <rect x="1080" y="260" width="120" height="155" fill="#78473a" />
              </g>
              <g transform="translate(1200, 0)">
                <rect x="0" y="295" width="120" height="120" fill="#8b5544" />
                <rect x="140" y="265" width="85" height="150" fill="#7c4b3d" />
                <rect x="245" y="310" width="150" height="110" fill="#9a604c" />
                <rect x="430" y="250" width="110" height="165" fill="#734438" />
                <rect x="570" y="290" width="180" height="125" fill="#8c5746" />
                <rect x="780" y="270" width="95" height="145" fill="#7b4a3c" />
                <rect x="910" y="305" width="140" height="115" fill="#965d49" />
                <rect x="1080" y="260" width="120" height="155" fill="#78473a" />
              </g>
            </g>

            {/* Fast horizontal streaking clouds & light streaks */}
            <g className="animate-train-pass-fast" filter="url(#window-motion-blur)" opacity="0.35">
              <rect x="40" y="210" width="260" height="18" rx="9" fill="#fff3d6" />
              <rect x="480" y="232" width="320" height="12" rx="6" fill="#ffd9a8" />
              <rect x="920" y="205" width="210" height="16" rx="8" fill="#fff3d6" />
              <rect x="1240" y="210" width="260" height="18" rx="9" fill="#fff3d6" />
              <rect x="1680" y="232" width="320" height="12" rx="6" fill="#ffd9a8" />
              <rect x="2120" y="205" width="210" height="16" rx="8" fill="#fff3d6" />
            </g>

            {/* Fast whizzing catenary / utility poles */}
            <g className="animate-train-pass-poles" filter="url(#window-motion-blur)" opacity="0.45">
              <rect x="220" y="170" width="14" height="240" fill="#3a2320" />
              <rect x="820" y="170" width="14" height="240" fill="#3a2320" />
              <rect x="1420" y="170" width="14" height="240" fill="#3a2320" />
              <rect x="2020" y="170" width="14" height="240" fill="#3a2320" />
            </g>
          </g>

          {/* Window frames & horizontal divider bar */}
          <rect
            x="215"
            y="175"
            width="770"
            height="225"
            rx="14"
            fill="none"
            stroke="#222d2a"
            strokeWidth="8"
          />
          <rect x="210" y="254" width="780" height="22" fill="#2d3c38" />

          {/* Ceiling dark overhang & Mint Fluorescent Tube */}
          <rect x="0" y="0" width="1200" height="62" fill="#171e1d" />
          <rect x="572" y="18" width="372" height="18" rx="8" fill="#d8fff0" />
          <rect x="580" y="21" width="356" height="11" rx="5" fill="#f3fff9" />
          <rect width="1200" height="820" fill="url(#overhead-mint-glow)" />

          {/* Left vertical handrail pole */}
          <rect x="128" y="0" width="30" height="710" fill="#232429" />
          <rect x="150" y="0" width="7" height="710" fill="#d9423a" opacity="0.45" />

          {/* Train Floor */}
          <polygon points="0,680 1200,680 1200,820 0,820" fill="url(#train-floor)" />
          {/* Floor tile grid lines */}
          <g stroke="#1b2322" strokeWidth="2" opacity="0.55">
            <line x1="0" y1="735" x2="1200" y2="735" />
            <line x1="180" y1="680" x2="120" y2="820" />
            <line x1="390" y1="680" x2="365" y2="820" />
            <line x1="600" y1="680" x2="600" y2="820" />
            <line x1="810" y1="680" x2="835" y2="820" />
            <line x1="1020" y1="680" x2="1080" y2="820" />
          </g>

          {/* Bench Seat Row (5 cushioned seats across carriage) */}
          <g>
            {/* Under-bench shadow */}
            <rect x="0" y="655" width="1200" height="34" fill="#0d1112" opacity="0.85" />
            {/* Bench legs */}
            {[55, 295, 515, 765, 1020].map((lx) => (
              <rect key={lx} x={lx} y="640" width="18" height="45" fill="#18201f" />
            ))}
            {/* Seat backrests */}
            {[
              { x: -160, w: 190 },
              { x: 34, w: 185 },
              { x: 223, w: 185 },
              { x: 412, w: 188 },
              { x: 604, w: 188 },
              { x: 796, w: 188 },
              { x: 988, w: 188 },
              { x: 1180, w: 188 },
            ].map((seat, i) => (
              <g key={i}>
                <rect
                  x={seat.x}
                  y="456"
                  width={seat.w}
                  height="136"
                  rx="10"
                  fill="url(#bench-teal)"
                  stroke="#202e2b"
                  strokeWidth="2"
                />
                {/* Seat cushion highlight */}
                <rect
                  x={seat.x + 8}
                  y="460"
                  width={seat.w - 16}
                  height="6"
                  rx="3"
                  fill="#87afa2"
                  opacity="0.3"
                />
              </g>
            ))}

            {/* Seat horizontal bench base */}
            <rect x="0" y="588" width="1200" height="54" fill="#2c3e3a" />
            <rect x="0" y="588" width="1200" height="10" fill="#4f6c63" opacity="0.55" />
          </g>

          {/* Warm Left-Side Crimson Rim Light Overlay */}
          <rect width="1200" height="820" fill="url(#left-red-rim)" />

          {/* Floor ambient shadow directly under the character */}
          <ellipse cx="595" cy="762" rx="175" ry="26" fill="#090c0c" opacity="0.72" />

          {/* ================= THE CHARACTER (animated with subtle train sway) ================= */}
          <g className="animate-train-sway" style={{ transformOrigin: '595px 620px' }}>
            {/* Baggy Indigo Denim Jeans (Low-poly faceted shading matching reference) */}
            <g>
              {/* Left Leg */}
              <polygon
                points="515,575 595,575 588,690 558,728 452,728 438,708 468,625"
                fill="#1d3c78"
              />
              <polygon
                points="515,575 562,575 538,678 468,625"
                fill="#274e94"
              />
              <polygon
                points="468,625 538,678 558,728 452,728 438,708"
                fill="#183263"
              />
              {/* Right Leg */}
              <polygon
                points="595,575 685,575 724,638 756,708 738,730 638,728 608,688"
                fill="#1a376e"
              />
              <polygon
                points="612,575 685,575 710,644 646,668"
                fill="#264b90"
              />
              <polygon
                points="646,668 724,638 756,708 738,730 638,728"
                fill="#152d59"
              />
              {/* Left red rim bounce on outer jean */}
              <polygon points="468,625 486,628 456,708 438,708" fill="#b8342e" opacity="0.22" />
            </g>

            {/* Chunky Cream-White Low-Top Sneakers */}
            <g>
              {/* Left Shoe */}
              <polygon points="434,715 532,715 544,752 426,754" fill="#d8cbb8" />
              <polygon points="434,715 516,715 508,744 426,746" fill="#efe5d6" />
              <polygon points="424,746 544,744 544,760 424,762" fill="#232834" />
              {/* Laces */}
              <g stroke="#7a6c5d" strokeWidth="4" strokeLinecap="round">
                <line x1="458" y1="718" x2="492" y2="718" />
                <line x1="454" y1="727" x2="490" y2="727" />
                <line x1="450" y1="736" x2="488" y2="736" />
              </g>

              {/* Right Shoe */}
              <polygon points="658,715 758,715 768,754 648,752" fill="#d8cbb8" />
              <polygon points="672,715 756,715 766,746 680,744" fill="#efe5d6" />
              <polygon points="648,744 768,746 768,762 648,760" fill="#232834" />
              {/* Laces */}
              <g stroke="#7a6c5d" strokeWidth="4" strokeLinecap="round">
                <line x1="696" y1="718" x2="732" y2="718" />
                <line x1="698" y1="727" x2="736" y2="727" />
                <line x1="700" y1="736" x2="740" y2="736" />
              </g>
            </g>

            {/* Oversized Cream-White T-Shirt */}
            <g>
              {/* Left Sleeve */}
              <polygon points="502,380 434,462 490,486 528,442" fill="#ded1be" />
              <polygon points="434,462 490,486 498,476 446,454" fill="#bfa995" />
              {/* Right Sleeve */}
              <polygon points="692,380 762,462 706,486 668,442" fill="#e9dfd0" />
              {/* Main Torso */}
              <polygon points="512,372 684,372 712,588 486,588" fill="#efe6d8" />
              {/* Warm T-shirt folds & shadows */}
              <polygon points="512,372 560,372 522,588 486,588" fill="#d6c6b3" opacity="0.65" />
              <polygon points="550,515 650,515 675,588 525,588" fill="#cab8a3" opacity="0.55" />
              {/* Collar Shadow */}
              <ellipse cx="598" cy="378" rx="34" ry="14" fill="#b7a490" />
            </g>

            {/* Dark Silhouette Arms reaching forward to hold console */}
            <g>
              {/* Left Arm */}
              <path
                d="M 476 472 L 496 520 L 548 482 L 532 458 Z"
                fill="#0b0b0e"
              />
              {/* Right Arm */}
              <path
                d="M 718 472 L 698 520 L 646 482 L 662 458 Z"
                fill="#0e0e12"
              />
            </g>

            {/* Wrist strap loop dangling from bottom-left of handheld */}
            <path
              d="M 556 502 C 538 524, 532 558, 548 564 C 562 569, 570 538, 566 504"
              fill="none"
              stroke="#0a0a0d"
              strokeWidth="4.5"
              strokeLinecap="round"
            />

            {/* Handheld Console in Character's Hands */}
            <g transform="translate(546, 404)">
              {/* Handheld Shadow on Chest */}
              <rect x="-4" y="8" width="110" height="106" rx="14" fill="#000000" opacity="0.32" />

              {/* Console Shell (Classic Red or Translucent Smoked Red) */}
              <rect
                x="0"
                y="0"
                width="102"
                height="98"
                rx="11"
                fill={shellVariant === 'translucent-pcb' ? '#582226' : '#a92c27'}
                stroke={shellVariant === 'translucent-pcb' ? '#8c3b40' : '#d6473f'}
                strokeWidth="2"
              />
              {/* Top bezel ridge */}
              <rect x="6" y="4" width="90" height="12" rx="4" fill="#000000" opacity="0.22" />

              {/* Mini Screen Frame facing slightly upward toward character's eyes (back-shell / angled top view) */}
              {/*Wait: In Image 1 the character faces forward holding the handheld up, so we see the back/front angled slightly. Adding a vivid screen reflection & glow */}
              <rect x="12" y="14" width="78" height="52" rx="5" fill="#090b12" stroke="#181a22" strokeWidth="2" />

              {/* Tiny glowing NULLS screen preview directly inside the character's console */}
              {isPowered ? (
                <g>
                  <rect x="15" y="17" width="72" height="46" rx="3" fill="#04091a" />
                  <text
                    x="51"
                    y="45"
                    textAnchor="middle"
                    fill="#388bff"
                    fontSize="15"
                    fontWeight="800"
                    fontFamily="Outfit, sans-serif"
                    letterSpacing="2"
                  >
                    NULLS
                  </text>
                  <text
                    x="51"
                    y="45"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="15"
                    fontWeight="800"
                    fontFamily="Outfit, sans-serif"
                    letterSpacing="2"
                    opacity="0.55"
                  >
                    NULLS
                  </text>
                </g>
              ) : (
                <rect x="15" y="17" width="72" height="46" rx="3" fill="#12141c" />
              )}

              {/* Power LED on Handheld */}
              <circle
                cx="93"
                cy="20"
                r="2.8"
                fill={isPowered ? '#34d399' : '#2a1212'}
              />

              {/* Side Power Switch Slider */}
              <motion.rect
                x="101"
                y="24"
                width="4"
                height="14"
                rx="1.5"
                animate={{
                  y: isPowered ? 18 : 24,
                  fill: isPowered ? '#34d399' : '#e08b36',
                }}
                transition={{ duration: 0.2 }}
              />
            </g>

            {/* Character Fingers Gripping Console & Animated Thumb Pressing Power */}
            <g>
              {/* Left hand fingers */}
              <rect x="536" y="438" width="16" height="9" rx="4" fill="#0d0d11" />
              <rect x="534" y="451" width="17" height="9" rx="4" fill="#0d0d11" />
              <rect x="536" y="464" width="15" height="9" rx="4" fill="#0d0d11" />
              {/* Left thumb */}
              <motion.rect
                x="546"
                y="454"
                width="14"
                height="10"
                rx="5"
                fill="#16161d"
                animate={
                  stage === 'PLAYING'
                    ? { x: [546, 550, 546], y: [454, 452, 454] }
                    : { x: 546, y: 454 }
                }
                transition={{ repeat: stage === 'PLAYING' ? Infinity : 0, duration: 0.45 }}
              />

              {/* Right hand fingers */}
              <rect x="642" y="438" width="16" height="9" rx="4" fill="#0d0d11" />
              <rect x="643" y="451" width="17" height="9" rx="4" fill="#0d0d11" />
              <rect x="642" y="464" width="15" height="9" rx="4" fill="#0d0d11" />

              {/* Right Thumb — reaches for power switch during REACHING_POWER! */}
              <motion.rect
                width="16"
                height="10"
                rx="5"
                fill="#16161d"
                animate={
                  stage === 'REACHING_POWER'
                    ? { x: 642, y: 428, rotate: -18 }
                    : stage === 'PLAYING'
                    ? { x: [634, 631, 634], y: [454, 451, 454], rotate: 0 }
                    : { x: 634, y: 454, rotate: 0 }
                }
                transition={{
                  duration: stage === 'PLAYING' ? 0.38 : 0.35,
                  repeat: stage === 'PLAYING' ? Infinity : 0,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
            </g>

            {/* Electric-Blue Screen Light Bounce onto T-Shirt & Chin when Console Turns On */}
            <AnimatePresence>
              {isPowered && (
                <motion.ellipse
                  cx="597"
                  cy="440"
                  rx="135"
                  ry="115"
                  fill="url(#screen-blue-bounce)"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                />
              )}
            </AnimatePresence>

            {/* Character Neck & Iconic 3-Spike Black Head */}
            <g>
              {/* Neck */}
              <rect x="577" y="346" width="42" height="36" fill="#08080a" />

              {/* 3 Pointed Spikes (Left, Top Center, Right) */}
              <polygon points="538,288 494,242 562,256" fill="#070709" />
              <polygon points="566,256 595,186 626,256" fill="#070709" />
              <polygon points="656,288 700,242 632,256" fill="#070709" />

              {/* Head Sphere */}
              <circle cx="597" cy="306" r="56" fill="#08080b" />

              {/* Red Over-Ear Headphones */}
              {/* Headband */}
              <path
                d="M 541 304 C 541 246, 653 246, 653 304"
                fill="none"
                stroke="#18181f"
                strokeWidth="7"
              />
              {/* Left Earcup */}
              <ellipse cx="539" cy="312" rx="11" ry="18" fill="#c92c27" />
              <ellipse cx="537" cy="312" rx="6" ry="12" fill="#e44b43" opacity="0.65" />
              {/* Right Earcup */}
              <ellipse cx="655" cy="312" rx="11" ry="18" fill="#c92c27" />
              <ellipse cx="657" cy="312" rx="6" ry="12" fill="#e44b43" opacity="0.65" />

              {/* Swaying Headphone Cord connected from right earcup down to handheld */}
              <path
                d="M 656 328 C 668 386, 646 438, 636 472 C 628 505, 646 565, 655 604"
                fill="none"
                stroke="#0c0c10"
                strokeWidth="3.2"
                strokeLinecap="round"
                className="animate-cord-sway"
              />

              {/* Expressive Downward-Gazing Eyes */}
              <g>
                {/* Left Eye */}
                <path
                  d="M 556 318 C 562 315, 586 319, 588 327 C 587 336, 560 338, 556 324 Z"
                  fill="#f4eee3"
                />
                <motion.circle
                  cx="573"
                  cy="326"
                  fill="#0a0a0e"
                  animate={{
                    r: isPowered ? 6.5 : 5.5,
                    cy: stage === 'REACHING_POWER' ? 327 : 326,
                  }}
                  transition={{ duration: 0.25 }}
                />
                {/* Tiny blue screen glint in eye when powered */}
                {isPowered && <circle cx="575" cy="324" r="1.8" fill="#60a5fa" />}

                {/* Right Eye */}
                <path
                  d="M 638 318 C 632 315, 608 319, 606 327 C 607 336, 634 338, 638 324 Z"
                  fill="#f4eee3"
                />
                <motion.circle
                  cx="621"
                  cy="326"
                  fill="#0a0a0e"
                  animate={{
                    r: isPowered ? 6.5 : 5.5,
                    cy: stage === 'REACHING_POWER' ? 327 : 326,
                  }}
                  transition={{ duration: 0.25 }}
                />
                {isPowered && <circle cx="623" cy="324" r="1.8" fill="#60a5fa" />}
              </g>
            </g>
          </g>
        </svg>

        {/* Interactive Hit Target directly over the Console in Scene View */}
        {!showCloseupOverlay && (
          <button
            type="button"
            onClick={onPowerPress}
            aria-label="Klik konsol di tangan karakter untuk menyalakan"
            className="group absolute left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 h-28 w-28 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 cursor-pointer"
          >
            {stage === 'IDLE' && (
              <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/75 px-2.5 py-1 text-[11px] font-mono-num text-amber-200 border border-amber-300/25 shadow-lg opacity-90 group-hover:opacity-100">
                Klik untuk nyalakan
              </span>
            )}
          </button>
        )}
      </motion.div>

      {/* Crisp Interactive Close-Up Console Stage (Appears smoothly on NULLS Boot & Play) */}
      <AnimatePresence>
        {showCloseupOverlay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.86, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4"
          >
            {/* Subtle blue screen ambiance around close-up console when powered */}
            {isPowered && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute h-[420px] w-[420px] rounded-full bg-blue-600/20 blur-3xl"
              />
            )}

            <HandheldDevice
              stage={stage}
              shellVariant={shellVariant}
              screenFilter={screenFilter}
              onPowerPress={onPowerPress}
              onStartGame={onStartGame}
              onActionButton={onActionButton}
              gameSignals={gameSignals}
              size="closeup"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
