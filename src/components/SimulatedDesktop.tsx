import React, { useState, useEffect, useRef } from 'react';
import {
  Monitor,
  Trash2,
  FolderOpen,
  Settings,
  Heart,
  Music,
  Maximize2,
  Keyboard as KeyboardIcon,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { CompanionSettings, CatState, DesktopIcon } from '../types';
import CatSprite from './CatSprite';

interface SimulatedDesktopProps {
  settings: CompanionSettings;
  setSettings: React.Dispatch<React.SetStateAction<CompanionSettings>>;
  catState: CatState;
  setCatState: (state: CatState) => void;
}

export default function SimulatedDesktop({
  settings,
  setSettings,
  catState,
  setCatState,
}: SimulatedDesktopProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Cat position state
  const [catPos, setCatPos] = useState({ x: 120, y: 150 });
  const [targetPos, setTargetPos] = useState({ x: 120, y: 150 });
  const [lookAngle, setLookAngle] = useState(0);
  const [lookStrength, setLookStrength] = useState(0);

  // Activity detection
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [isBlinking, setIsBlinking] = useState(false);
  const [typingStep, setTypingStep] = useState(0);
  const [meowText, setMeowText] = useState<string | null>(null);
  const [mouseVelocity, setMouseVelocity] = useState(0);
  const lastMousePos = useRef({ x: 0, y: 0, time: Date.now() });

  // Floating Window State
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [windowPos, setWindowPos] = useState({ x: 180, y: 60 });
  const [windowDragging, setWindowDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Paws press key counts / stats
  const [keystrokeCount, setKeystrokeCount] = useState(0);
  const [clickCount, setClickCount] = useState(0);

  // Desktop Icons
  const [icons, setIcons] = useState<DesktopIcon[]>([
    { id: 'my-pc', label: 'My Computer', icon: 'Monitor', x: 20, y: 20 },
    { id: 'recycle', label: 'Recycle Bin', icon: 'Trash2', x: 20, y: 110 },
    { id: 'cat-palace', label: 'Cat Palace', icon: 'Sparkles', x: 20, y: 200 },
  ]);

  // Food items dropped on desktop
  const [foodItems, setFoodItems] = useState<{ id: string; x: number; y: number }[]>([]);

  // Wallpaper selection
  const wallpapers = [
    { id: 'office', name: 'Cozy Workspace', class: 'bg-slate-900 border-indigo-700/30' },
    { id: 'bliss', name: 'Nostalgic Sky', class: 'bg-sky-500 border-sky-400' },
    { id: 'nebula', name: 'Cyber Space', class: 'bg-[#12121e] border-pink-700/30' },
  ];
  const [currentWallpaper, setCurrentWallpaper] = useState(wallpapers[0]);

  // Keyboard elements layout for simulated typings
  const keyboardKeys = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'],
  ];

  // Synthesize Retro Meow Sound
  const triggerMeowAudio = () => {
    if (!settings.soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Sound signature of a cat meow (pitch slides up slightly then down in a cute mew)
      osc1.type = 'triangle';
      osc2.type = 'sine';

      // Slight detune for cozy chord feeling
      osc2.detune.setValueAtTime(15, now);

      // Pitch sweep
      const startPitch = 850 + Math.random() * 200;
      const peakPitch = 1100 + Math.random() * 150;
      const endPitch = 600 + Math.random() * 100;

      osc1.frequency.setValueAtTime(startPitch, now);
      osc1.frequency.exponentialRampToValueAtTime(peakPitch, now + 0.08);
      osc1.frequency.exponentialRampToValueAtTime(endPitch, now + 0.35);

      osc2.frequency.setValueAtTime(startPitch * 1.01, now);
      osc2.frequency.exponentialRampToValueAtTime(peakPitch * 1.01, now + 0.08);
      osc2.frequency.exponentialRampToValueAtTime(endPitch * 1.01, now + 0.35);

      // Cute feline volume envelope
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.18, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.12, now + 0.15);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
    } catch (e) {
      console.warn('Audio synthesis failed', e);
    }
  };

  // Generate random kitty chat speech bubble
  const triggerMeowText = (customText?: string) => {
    const meows = [
      'Meow~',
      'Prrrrt?',
      'Mew!',
      'Feed me *_*',
      'Click-clack!',
      'Zzz...',
      'Streeeeeetch...',
      'Pet me!',
    ];
    const text = customText || meows[Math.floor(Math.random() * meows.length)];
    setMeowText(text);
    triggerMeowAudio();
    setTimeout(() => {
      setMeowText(null);
    }, 2800);
  };

  // Drag and drop setup for Floating Window
  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setWindowDragging(true);
    setDragOffset({
      x: e.clientX - windowPos.x,
      y: e.clientY - windowPos.y,
    });
  };

  // Background state transitions and idle loops
  useEffect(() => {
    // 1. Blink interval timer
    const blinkInterval = setInterval(() => {
      if (catState !== 'sleeping') {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 160);
      }
    }, 4000);

    // 2. State behavior loops
    const stateLoop = setInterval(() => {
      const isIdle =
        catState === 'idle' ||
        catState.startsWith('look-') ||
        catState === 'sleeping';

      if (isIdle) {
        const inactiveTime = Date.now() - lastActivity;

        // Auto sleep after 14 seconds of total silence (or keyboard + mouse idle)
        const idleSleepLimit = settings.personality === 'lazy' ? 8000 : 16000;
        if (inactiveTime > idleSleepLimit && catState !== 'sleeping') {
          setCatState('sleeping');
          triggerMeowText('*sleepy sigh*');
        } else if (catState !== 'sleeping') {
          // Perform random idle actions if awake
          const rng = Math.random();
          if (rng < 0.15) {
            // Stretch
            setCatState('excited');
            setTimeout(() => setCatState('idle'), 1500);
          } else if (rng < 0.45) {
            // Wander looking around
            const looks: CatState[] = ['look-left', 'look-right', 'look-up', 'look-down'];
            setCatState(looks[Math.floor(Math.random() * looks.length)]);
            setTimeout(() => setCatState('idle'), 1200);
          } else {
            setCatState('idle');
          }
        }
      }
    }, 5000);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(stateLoop);
    };
  }, [catState, lastActivity, settings.personality]);

  // Monitor Global Mouse Movement inside the Preview Desktop
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Boundary cap
    const safeX = Math.max(10, Math.min(rect.width - 10, x));
    const safeY = Math.max(10, Math.min(rect.height - 10, y));

    setTargetPos({ x: safeX, y: safeY });

    // Handle floating window drag helper
    if (windowDragging) {
      const boundedWx = Math.max(10, Math.min(rect.width - 200, e.clientX - dragOffset.x));
      const boundedWy = Math.max(10, Math.min(rect.height - 150, e.clientY - dragOffset.y));
      setWindowPos({ x: boundedWx, y: boundedWy });
    }

    // Wake up if asleep
    if (catState === 'sleeping') {
      setCatState('idle');
      setLastActivity(Date.now());
      triggerMeowText('Ah! Awake!');
    }

    // Velocity tracker for surprise reaction
    const now = Date.now();
    const dt = now - lastMousePos.current.time;
    const dx = x - lastMousePos.current.x;
    const dy = y - lastMousePos.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (dt > 10) {
      const velocity = distance / dt;
      setMouseVelocity(velocity);

      // Rapid movement surprise reaction triggers
      if (velocity > 2.8 && catState !== 'surprised' && catState !== 'sleeping') {
        const soundThreshold = settings.personality === 'hyperactive' ? 1.5 : 2.8;
        if (velocity > soundThreshold) {
          setCatState('surprised');
          triggerMeowAudio();
          setLastActivity(Date.now());
          setTimeout(() => setCatState('idle'), 1800);
        }
      }

      lastMousePos.current = { x, y, time: now };
    }

    // Eyes Gaze tracking math
    const catCenterX = catPos.x + settings.size / 2;
    const catCenterY = catPos.y + settings.size / 2;
    const diffX = x - catCenterX;
    const diffY = y - catCenterY;
    const distanceToCursor = Math.sqrt(diffX * diffX + diffY * diffY);

    const angle = Math.atan2(diffY, diffX);
    setLookAngle(angle);

    // Scaling gaze strength: closer cursor, stronger eye shift
    const strength = Math.min(1.0, distanceToCursor / 160);
    setLookStrength(strength);
  };

  const handleMouseUp = () => {
    setWindowDragging(false);
  };

  // Keyboard input listeners (Capture browser keystrokes inside workspace)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (settings.enableTypingAnimation) {
        setKeystrokeCount((prev) => prev + 1);
        setLastActivity(Date.now());

        if (catState === 'sleeping') {
          setCatState('idle');
          triggerMeowText('Uwah! *wake*');
        } else {
          setCatState('typing');
          setTypingStep((step) => (step + 1) % 4);
        }

        // Return to idle after a quick delay of no keystrokes
        const typingDebounce = setTimeout(() => {
          setCatState('idle');
        }, 1200);

        return () => clearTimeout(typingDebounce);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [catState, settings.enableTypingAnimation]);

  // Main Cat Physics loop (Walking & Chasing logic)
  useEffect(() => {
    const pInterval = setInterval(() => {
      // Is there a treat to chase? Else target mouse cursor
      let chaseTarget = targetPos;
      if (foodItems.length > 0) {
        // Target closest food item
        chaseTarget = foodItems[0];
      }

      const dx = chaseTarget.x - catPos.x;
      const dy = chaseTarget.y - catPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const threshold = 15; // Stop when close enough
      const chaseEnabled = settings.chaseMode || foodItems.length > 0;

      if (chaseEnabled && dist > threshold && catState !== 'sleeping' && catState !== 'surprised') {
        // Walk smoothly toward target
        setCatState('walking');
        setTypingStep((prev) => (prev + 1) % 4);

        // Movement speeds configured by slider multiplier
        const baseSpeed = 2.4 * settings.speed;
        const personalityModifier =
          settings.personality === 'hyperactive'
            ? 1.4
            : settings.personality === 'lazy'
            ? 0.6
            : 1.0;

        const actualSpeed = baseSpeed * personalityModifier;

        const moveX = (dx / dist) * Math.min(actualSpeed, dist);
        const moveY = (dy / dist) * Math.min(actualSpeed, dist);

        setCatPos((prev) => ({
          x: prev.x + moveX,
          y: prev.y + moveY,
        }));
      } else if (foodItems.length > 0 && dist <= threshold) {
        // Eat food treat!
        setCatState('excited');
        triggerMeowText('OM NOM NOM! 🐟');
        setFoodItems([]); // Clear eaten food
        setLastActivity(Date.now());
        setTimeout(() => setCatState('idle'), 2500);
      } else if (catState === 'walking') {
        setCatState('idle');
      }
    }, 45); // ~22 FPS physics ticker

    return () => clearInterval(pInterval);
  }, [catPos, targetPos, foodItems, settings.chaseMode, settings.speed, settings.personality, catState]);

  // Feed treat action
  const dropTreat = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    // Drop fish random near cursor
    const rx = targetPos.x + (Math.random() * 80 - 40);
    const ry = targetPos.y + (Math.random() * 80 - 40);

    const safeRx = Math.max(30, Math.min(rect.width - 30, rx));
    const safeRy = Math.max(30, Math.min(rect.height - 30, ry));

    setFoodItems([{ id: Math.random().toString(), x: safeRx, y: safeRy }]);
    triggerMeowText('Gimme dat fish!');
  };

  // Meow manually
  const clickMeowButton = () => {
    triggerMeowText();
    setCatState('excited');
    setTimeout(() => setCatState('idle'), 1500);
  };

  return (
    <div className="flex flex-col h-full bg-[#fcfcfe] border border-slate-200/80 font-sans text-slate-800 rounded-[28px] overflow-hidden shadow-lg">
      {/* Header Bar */}
      <div className="bg-slate-50 border-b border-slate-205 px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="font-extrabold text-xs text-slate-800 tracking-wider uppercase">
            Virtual Desktop Simulator
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={clickMeowButton}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 border border-orange-200 hover:bg-orange-100 rounded-xl text-xs font-bold text-orange-655 transition-all cursor-pointer"
          >
            <Music className="w-3.5 h-3.5" />
            Meow!
          </button>
          <button
            onClick={dropTreat}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 border border-orange-450 rounded-xl text-xs font-extrabold text-white transition-all cursor-pointer shadow shadow-orange-500/10"
          >
            🐟 Feed Fish
          </button>
        </div>
      </div>

      {/* Main Sandbox Desktop Screen Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`relative flex-1 ${currentWallpaper.class} overflow-hidden transition-all duration-500 flex flex-col justify-between`}
        style={{ cursor: 'crosshair' }}
      >
        {/* Wallpapers background grid overlay for virtual vibe */}
        <div className="absolute inset-0 bg-transparent opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

        {/* Desktop Icons */}
        <div className="absolute left-4 top-4 flex flex-col gap-5 select-none z-10 animate-fade-in">
          {icons.map((ic) => (
            <div
              key={ic.id}
              onClick={() => {
                setActiveWindow(ic.id);
                setClickCount((c) => c + 1);
                // Wake up or bring cat's attention
                setTargetPos({ x: 100, y: ic.y + 40 });
                if (catState !== 'sleeping') {
                  setCatState('surprised');
                  setTimeout(() => setCatState('idle'), 1000);
                }
              }}
              className="flex flex-col items-center justify-center p-2 rounded-xl group hover:bg-white/15 active:bg-white/25 text-center w-20 transition-all cursor-pointer"
            >
              <div className="w-11 h-11 bg-white/20 border border-white/30 flex items-center justify-center rounded-xl text-white group-hover:scale-110 group-hover:bg-white/30 transition-transform shadow-sm">
                {ic.icon === 'Monitor' && <Monitor className="w-6 h-6" />}
                {ic.icon === 'Trash2' && <Trash2 className="w-6 h-6" />}
                {ic.icon === 'Sparkles' && <Sparkles className="w-6 h-6" />}
              </div>
              <span className="text-[11px] font-bold text-white mt-1.5 truncate w-full leading-tight drop-shadow-md">
                {ic.label}
              </span>
            </div>
          ))}
        </div>

        {/* Dropped Food Treats */}
        {foodItems.map((fd) => (
          <div
            key={fd.id}
            style={{ left: fd.x - 12, top: fd.y - 12 }}
            className="absolute z-20 pointer-events-none animate-bounce"
          >
            <span className="text-xl">🐟</span>
          </div>
        ))}

        {/* --- DYNAMIC TRANS TRANSPARENT OVERLAY CAT COMPANION --- */}
        <div
          style={{
            position: 'absolute',
            left: `${catPos.x}px`,
            top: `${catPos.y}px`,
            zIndex: 30,
            transform: 'translate(-50%, -50%)',
          }}
          className="pointer-events-auto filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]"
          onClick={() => {
            // Clicking cat pets it!
            setCatState('excited');
            triggerMeowText('Purrr... ❤️');
            setLastActivity(Date.now());
            setTimeout(() => setCatState('idle'), 2550);
          }}
        >
          {/* Meow Speech Bubble */}
          {meowText && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-slate-900 border border-slate-300 px-2.5 py-1 rounded-xl text-[11px] font-bold shadow-lg animate-fade-in flex flex-row items-center gap-1 shrink-0 whitespace-nowrap whitespace-pre z-50">
              <span className="text-xs">💬</span>
              {meowText}
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-slate-300 rotate-45" />
            </div>
          )}

          {/* Core React Cat Sprite */}
          <CatSprite
            state={catState}
            settings={settings}
            lookAngle={lookAngle}
            lookStrength={lookStrength}
            isBlinking={isBlinking}
            typingStep={typingStep}
            scale={1.5} // Large and cozy in desktop simulator
          />
        </div>

        {/* FLOATING SYSTEM MODAL WINDOWS */}
        {activeWindow && (
          <div
            style={{
              left: `${windowPos.x}px`,
              top: `${windowPos.y}px`,
            }}
            className="absolute w-80 bg-white/95 border border-slate-205 rounded-2xl shadow-xl flex flex-col overflow-hidden z-20 backdrop-blur-md select-none animate-scale-in"
          >
            {/* Header / Drag Bar */}
            <div
              onMouseDown={handleHeaderMouseDown}
              className="bg-slate-50 border-b border-slate-200 px-3.5 py-2.5 flex items-center justify-between cursor-move"
            >
              <div className="flex items-center gap-1.5">
                <FolderOpen className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-bold text-slate-800">
                  {activeWindow === 'my-pc' && 'My Computer Specs'}
                  {activeWindow === 'recycle' && 'Recycle Bin items'}
                  {activeWindow === 'cat-palace' && 'Pet Palace status'}
                </span>
              </div>
              <button
                onClick={() => setActiveWindow(null)}
                className="w-4 h-4 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center text-[9px] font-bold text-white transition-colors cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Window Content */}
            <div className="p-4 text-xs space-y-3.5 text-slate-600 select-text">
              {activeWindow === 'my-pc' && (
                <div className="space-y-2">
                  <p className="font-extrabold text-slate-900 border-b border-slate-100 pb-1.5">Companion OS Environment</p>
                  <p>🖥️ <b className="text-slate-800">Host:</b> Windows 11 Desktop Pro</p>
                  <p>🛸 <b className="text-slate-800">Active Hooks:</b> User32.dll WH_KEYBOARD_LL</p>
                  <p>🐈 <b className="text-slate-800">Cat Size:</b> {settings.size}px</p>
                  <p>🚀 <b className="text-slate-800">Startup Registry:</b> {settings.runAtStartup ? 'Enabled' : 'Disabled'}</p>
                </div>
              )}

              {activeWindow === 'recycle' && (
                <div className="space-y-2.5 text-center py-2 h-28 flex flex-col items-center justify-center">
                  <Trash2 className="w-10 h-10 text-slate-400 mb-1" />
                  <p className="text-slate-500 italic">No deleted code. Clean architecture preserved!</p>
                </div>
              )}

              {activeWindow === 'cat-palace' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1.5">
                    <span className="font-extrabold text-orange-600 flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-550 fill-rose-500 animate-pulse" />
                      Pet Status
                    </span>
                    <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold uppercase">
                      Level 9 {settings.personality}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-150">
                      <p className="text-[10px] text-slate-400 font-semibold">Total Key Taps</p>
                      <p className="text-lg font-bold text-orange-600 font-mono mt-0.5">{keystrokeCount}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-150">
                      <p className="text-[10px] text-slate-400 font-semibold">Times Petted</p>
                      <p className="text-lg font-bold text-orange-600 font-mono mt-0.5">{clickCount}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-450 leading-relaxed italic text-center font-medium">
                    "Tapping keys speeds up my fingers. Keep typing on your physical keyboard to watch my paws go!"
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Taskbar Bottom */}
        <div className="w-full bg-white/95 border-t border-slate-200/80 backdrop-blur-md px-4 py-2 flex items-center justify-between gap-4 z-40 select-none shadow-sm">
          {/* Start button and links */}
          <div className="flex items-center gap-1.5">
            <div className="w-7.5 h-7.5 bg-orange-500 rounded-xl flex items-center justify-center text-sm font-black text-white shadow shadow-orange-555/20 hover:bg-orange-600 transition-colors cursor-pointer">
              ❖
            </div>
            {/* Desktop Wallpaper Switcher */}
            <div className="h-6 w-[1px] bg-slate-200 mx-1.5" />
            <div className="flex gap-1.5">
              {wallpapers.map((wl) => (
                <button
                  key={wl.id}
                  onClick={() => setCurrentWallpaper(wl)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    currentWallpaper.id === wl.id
                      ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/20'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-550'
                  }`}
                >
                  {wl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right Status Clocks */}
          <div className="flex items-center gap-3 text-xs text-slate-650 font-mono bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="flex items-center gap-1 font-sans text-[11px] text-orange-600 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
              Windows Hook Active
            </span>
            <span>|</span>
            <span className="font-bold text-slate-850">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Auxiliary interactive typing area */}
      <div className="bg-slate-50 border-t border-slate-200/80 p-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
            <KeyboardIcon className="w-3.5 h-3.5 text-orange-500" />
            Physical Key Capture Active. Tap keys on keyboard to watch claws press! Or click below:
          </label>
          <span className="text-[11px] bg-orange-50 border border-orange-200 text-orange-650 font-black font-mono px-2.5 py-0.5 rounded-lg select-none">
            {keystrokeCount} taps registered
          </span>
        </div>

        {/* On screen keys trigger typing state */}
        <div className="flex flex-col gap-1 select-none">
          {keyboardKeys.map((row, rIdx) => (
            <div key={rIdx} className="flex gap-1 justify-center">
              {row.map((key) => (
                <button
                  key={key}
                  onMouseDown={() => {
                    setKeystrokeCount((c) => c + 1);
                    setLastActivity(Date.now());
                    if (catState === 'sleeping') {
                      setCatState('idle');
                    } else {
                      setCatState('typing');
                      setTypingStep((step) => (step + 1) % 4);
                    }
                  }}
                  onMouseUp={() => {
                    setTimeout(() => setCatState('idle'), 1000);
                  }}
                  className="w-7.5 h-7.5 bg-white hover:bg-orange-50 border border-slate-200 font-mono text-[10px] font-bold text-slate-705 rounded-lg active:translate-y-0.5 active:bg-orange-500 active:text-white transition-all cursor-pointer flex items-center justify-center shadow-sm"
                >
                  {key}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
