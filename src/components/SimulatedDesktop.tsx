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
  Award,
  Gift,
  Clock,
  ShieldAlert,
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
  const [palaceTab, setPalaceTab] = useState<'certificate' | 'stats'>('certificate');

  // Paws press key counts / stats
  const [keystrokeCount, setKeystrokeCount] = useState(0);
  const [clickCount, setClickCount] = useState(() => {
    const saved = localStorage.getItem('cat_companion_click_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Progressive Dynamic Trait System
  const [affection, setAffection] = useState(() => {
    const saved = localStorage.getItem('cat_companion_affection');
    return saved ? parseFloat(saved) : 30;
  });
  const [shyness, setShyness] = useState(() => {
    const saved = localStorage.getItem('cat_companion_shyness');
    return saved ? parseFloat(saved) : 30;
  });
  const [laziness, setLaziness] = useState(() => {
    const saved = localStorage.getItem('cat_companion_laziness');
    return saved ? parseFloat(saved) : 30;
  });
  const [huntingDrive, setHuntingDrive] = useState(() => {
    const saved = localStorage.getItem('cat_companion_hunting_drive');
    return saved ? parseFloat(saved) : 30;
  });
  const [feedCount, setFeedCount] = useState(() => {
    const saved = localStorage.getItem('cat_companion_feed_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  // --- PREMIUM EXTENSION STATES ---
  // Adoption state values
  const [adoptedName, setAdoptedName] = useState(() => {
    return settings.catName || localStorage.getItem('cat_companion_adopted_name') || '';
  });
  const [adoptedDate, setAdoptedDate] = useState(() => {
    return settings.birthday || localStorage.getItem('cat_companion_adopted_date') || new Date().toLocaleDateString('en-US');
  });
  const [adoptedTrait, setAdoptedTrait] = useState(() => {
    return localStorage.getItem('cat_companion_adopted_trait') || 'Sassy Explorer';
  });

  // Dynamic Mood variables
  const [hunger, setHunger] = useState(() => {
    const saved = localStorage.getItem('cat_companion_mood_hunger');
    return saved ? Number(saved) : 25;
  });
  const [energy, setEnergy] = useState(() => {
    const saved = localStorage.getItem('cat_companion_mood_energy');
    return saved ? Number(saved) : 85;
  });
  const [happiness, setHappiness] = useState(() => {
    const saved = localStorage.getItem('cat_companion_mood_happiness');
    return saved ? Number(saved) : 75;
  });

  // Unique memory system values
  const [favSleepSpot, setFavSleepSpot] = useState<{ x: number, y: number } | null>(() => {
    const saved = localStorage.getItem('cat_companion_fav_sleep');
    return saved ? JSON.parse(saved) : null;
  });
  const [sleepCountTimer, setSleepCountTimer] = useState(0);

  // Rare Random Events
  const [rareEvent, setRareEvent] = useState<'none' | 'box' | 'butterfly'>('none');
  const [butterflyPos, setButterflyPos] = useState({ x: 220, y: 120 });
  const [butterflyAngle, setButterflyAngle] = useState(0);

  // Idle dreams bubble content
  const [isDreaming, setIsDreaming] = useState(false);
  const [dreamIdea, setDreamIdea] = useState('🐟 juicy fish!');

  const developPersonality = React.useCallback((action: 'pet' | 'feed' | 'keystroke' | 'tick') => {
    setAffection(prevAff => {
      let next = prevAff;
      if (action === 'pet') next = Math.min(100, prevAff + 4.5);
      else if (action === 'feed') next = Math.min(100, prevAff + 6.0);
      else if (action === 'tick') next = Math.min(100, Math.max(5, prevAff + (Math.random() * 0.2 - 0.1)));
      localStorage.setItem('cat_companion_affection', next.toString());
      return next;
    });

    setShyness(prevShy => {
      let next = prevShy;
      if (action === 'pet') next = Math.max(5, prevShy - 3.5);
      else if (action === 'feed') next = Math.max(5, prevShy - 5.0);
      else if (action === 'tick') next = Math.min(100, Math.max(5, prevShy + (Math.random() * 0.4 - 0.2)));
      localStorage.setItem('cat_companion_shyness', next.toString());
      return next;
    });

    setLaziness(prevLazy => {
      let next = prevLazy;
      if (action === 'feed') next = Math.min(100, prevLazy + 3.0);
      else if (action === 'keystroke') next = Math.max(5, prevLazy - 0.3);
      else if (action === 'tick') next = Math.min(100, Math.max(5, prevLazy + (Math.random() * 0.3 - 0.15)));
      localStorage.setItem('cat_companion_laziness', next.toString());
      return next;
    });

    setHuntingDrive(prevHunt => {
      let next = prevHunt;
      if (action === 'keystroke') next = Math.min(100, prevHunt + 0.5);
      else if (action === 'tick') next = Math.min(100, Math.max(5, prevHunt + (Math.random() * 0.2 - 0.1)));
      localStorage.setItem('cat_companion_hunting_drive', next.toString());
      return next;
    });

    if (action === 'feed') {
      setFeedCount(prev => {
        const next = prev + 1;
        localStorage.setItem('cat_companion_feed_count', next.toString());
        return next;
      });
    }

    if (action === 'pet') {
      setClickCount(prev => {
        const next = prev + 1;
        localStorage.setItem('cat_companion_click_count', next.toString());
        return next;
      });
    }
  }, []);

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

    // 2. State behavior loops (Runs every 4 seconds for smoother ticks)
    const stateLoop = setInterval(() => {
      // Productivity / Focus Mode Override
      if (settings.focusMode) {
        setCatState('sleeping');
        const rng = Math.random();
        if (rng < 0.2) {
          triggerMeowText('💭 Shhh... focus-mode active 📚');
        }
        return;
      }

      // Update basic mood variables
      setHunger((prev) => {
        const next = Math.min(100, prev + 2);
        localStorage.setItem('cat_companion_mood_hunger', next.toString());
        return next;
      });

      setEnergy((prev) => {
        let next = prev;
        if (catState === 'sleeping') {
          next = Math.min(100, prev + 8);
        } else if (catState === 'walking' || catState === 'typing') {
          next = Math.max(0, prev - 3);
        } else {
          next = Math.max(0, prev - 1);
        }
        localStorage.setItem('cat_companion_mood_energy', next.toString());
        return next;
      });

      setHappiness((prev) => {
        const next = Math.max(10, prev - 0.5);
        localStorage.setItem('cat_companion_mood_happiness', next.toString());
        return next;
      });

      // Force sleep on complete exhaustion
      if (energy <= 15 && catState !== 'sleeping') {
        setCatState('sleeping');
        triggerMeowText('Zzz... completely exhausted... 🐾');
        return;
      }

      const isIdle =
        catState === 'idle' ||
        catState.startsWith('look-') ||
        catState === 'sleeping';

      developPersonality('tick');

      // Smart Inactivity Detection & Sleep Tracking
      if (isIdle) {
        const inactiveTime = Date.now() - lastActivity;

        // Auto sleep after 12 seconds of total user inactivity
        const idleSleepLimit = settings.personality === 'lazy' ? 6000 : 12000;
        if (inactiveTime > idleSleepLimit && catState !== 'sleeping') {
          setCatState('sleeping');
          triggerMeowText('Yawn... entering sleep mode 💤');
        } else if (catState === 'sleeping') {
          // Track favorite spot memory: if sleeping peacefully for 4 consecutive ticks
          setSleepCountTimer((prev) => {
            const next = prev + 1;
            if (next === 4) {
              setFavSleepSpot(catPos);
              localStorage.setItem('cat_companion_fav_sleep', JSON.stringify(catPos));
              triggerMeowText('📍 Sleeping spot saved to memory! 💖');
            }
            return next;
          });

          // Show dreaming bubbles!
          if (Math.random() < 0.4) {
            const dreams = [
              '🐟 juicy salmon!',
              '🐭 active wind-up mouse',
              '🧶 pink wool ball',
              '🥛 warm creamy milk',
              '📦 spacious cardboard box',
              '🦋 beautiful fluttery fly'
            ];
            setDreamIdea(dreams[Math.floor(Math.random() * dreams.length)]);
            setIsDreaming(true);
            setTimeout(() => setIsDreaming(false), 2400);
          }
        } else {
          // Reset sleep counts if awake
          setSleepCountTimer(0);

          // Check late night owl meow greeting (after 8 PM / 20:00)
          const hour = new Date().getHours();
          const isLate = hour >= 20 || hour < 5;

          // Perform random idle actions if awake
          const rng = Math.random();
          if (isLate && rng < 0.25) {
            triggerMeowText('Late night coding buddy? 🌙💻👀');
          } else if (rng < 0.12) {
            // Stretch
            setCatState('excited');
            triggerMeowText('Streeeeetch... 🐾');
            setTimeout(() => setCatState('idle'), 1300);
          } else if (rng < 0.35) {
            // Wander looking around
            const looks: CatState[] = ['look-left', 'look-right', 'look-up', 'look-down'];
            setCatState(looks[Math.floor(Math.random() * looks.length)]);
            setTimeout(() => setCatState('idle'), 1200);
          } else if (rng < 0.45 && hunger > 75) {
            triggerMeowText('My tummy is empty... 🐟 *mew*');
          } else {
            setCatState('idle');
          }

          // Trigger Rare events with a 6% chance on Tick
          if (Math.random() < 0.06 && rareEvent === 'none') {
            const ev = Math.random() < 0.5 ? 'butterfly' : 'box';
            setRareEvent(ev);
            if (ev === 'butterfly') {
              setButterflyPos({ x: 100 + Math.random() * 200, y: 80 + Math.random() * 120 });
              triggerMeowText('A butterfly! 🦋 Chase!!');
            } else {
              triggerMeowText('What is that cardboard box? 📦👀');
            }
          }
        }
      }
    }, 4000);

    return () => {
      clearInterval(blinkInterval);
      clearInterval(stateLoop);
    };
  }, [catState, lastActivity, settings.personality, developPersonality]);

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
        developPersonality('keystroke');

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
  }, [catState, settings.enableTypingAnimation, developPersonality]);

  // Main Cat Physics loop (Walking & Chasing logic with window gravity & rare events)
  useEffect(() => {
    const pInterval = setInterval(() => {
      // 1. Focus Mode Override: No physics walking, stay in bottom-right corner snoring!
      if (settings.focusMode) {
        setCatPos({ x: 512, y: 310 });
        setCatState('sleeping');
        return;
      }

      // 2. Animate butterfly wave path if butterfly event is active
      if (rareEvent === 'butterfly') {
        const time = Date.now() * 0.0024;
        const bX = Math.max(20, Math.min(560, 260 + Math.sin(time) * 160 + Math.cos(time * 0.5) * 60));
        const bY = Math.max(30, Math.min(270, 130 + Math.cos(time) * 70 + Math.sin(time * 0.8) * 30));
        setButterflyPos({ x: bX, y: bY });
      }

      // Determine active chase target
      let targetX = targetPos.x;
      let targetY = targetPos.y;
      let targetSource: 'cursor' | 'food' | 'butterfly' | 'box' | 'window' = 'cursor';

      if (foodItems.length > 0) {
        targetX = foodItems[0].x;
        targetY = foodItems[0].y;
        targetSource = 'food';
      } else if (rareEvent === 'butterfly') {
        targetX = butterflyPos.x;
        targetY = butterflyPos.y;
        targetSource = 'butterfly';
      } else if (rareEvent === 'box') {
        targetX = 230;
        targetY = 265;
        targetSource = 'box';
      } else if (activeWindow && !settings.chaseMode) {
        // Desktop-aware snap: Walk across window header top with a 75% affinity when nearby
        const windowHeaderY = windowPos.y - 12;
        const dxWin = (windowPos.x + 160) - catPos.x;
        const dyWin = windowHeaderY - catPos.y;
        const distToWindow = Math.sqrt(dxWin * dxWin + dyWin * dyWin);

        if (distToWindow < 220) {
          // Walk across top border of the simulated window
          const sweep = (Math.sin(Date.now() * 0.001) * 110) + 140; // values between 30 and 250
          targetX = windowPos.x + sweep;
          targetY = windowHeaderY;
          targetSource = 'window';
        }
      }

      const dx = targetX - catPos.x;
      const dy = targetY - catPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const threshold = targetSource === 'window' ? 8 : 15;
      const chaseEnabled =
        settings.chaseMode ||
        targetSource === 'food' ||
        targetSource === 'butterfly' ||
        targetSource === 'box' ||
        targetSource === 'window';

      if (chaseEnabled && dist > threshold && catState !== 'sleeping' && catState !== 'surprised') {
        // Play physical walking stepping frames
        setCatState('walking');
        setTypingStep((prev) => (prev + 1) % 4);

        // Movement Speed multipliers
        const baseSpeed = 2.4 * settings.speed;
        const personalityMod =
          settings.personality === 'hyperactive'
            ? 1.45
            : settings.personality === 'lazy'
            ? 0.55
            : 1.0;

        const actualSpeed = baseSpeed * personalityMod;
        const stepX = (dx / dist) * Math.min(actualSpeed, dist);
        const stepY = (dy / dist) * Math.min(actualSpeed, dist);

        setCatPos((prev) => ({
          x: prev.x + stepX,
          y: prev.y + stepY,
        }));
      } else if (targetSource === 'food' && dist <= threshold) {
        // Eats food
        setCatState('excited');
        triggerMeowText('OM NOM NOM! 🐟🐾');
        developPersonality('feed');
        setFoodItems([]); // eat
        setHunger(0); // Fed!
        setEnergy((e) => Math.min(100, e + 20));
        setHappiness((h) => Math.min(100, h + 15));
        setLastActivity(Date.now());
        setTimeout(() => setCatState('idle'), 2500);
      } else if (targetSource === 'butterfly' && dist <= 22) {
        // Cat catches butterfly!
        setCatState('excited');
        triggerMeowText('Caught the butterfly! 🦋✨ Meow!');
        setHappiness((h) => Math.min(100, h + 10));
        setRareEvent('none');
        setLastActivity(Date.now());
        setTimeout(() => setCatState('idle'), 2500);
      } else if (targetSource === 'box' && dist <= threshold) {
        // Cat hides in cardboard box!
        setCatState('sleeping');
        triggerMeowText('I fits, I sits! 📦💤');
        setHappiness((h) => Math.min(100, h + 8));
        setLastActivity(Date.now());
        // Stays sleeping in box for 6 seconds, then reset
        setTimeout(() => {
          setRareEvent('none');
          setCatState('idle');
          triggerMeowText('Leaving my box! 📦🐾');
        }, 8000);
      } else if (catState === 'walking') {
        setCatState('idle');
      }
    }, 45); // ~22 FPS physics ticker

    return () => clearInterval(pInterval);
  }, [
    catPos,
    targetPos,
    foodItems,
    rareEvent,
    butterflyPos,
    activeWindow,
    windowPos,
    settings.chaseMode,
    settings.speed,
    settings.personality,
    settings.focusMode,
    catState,
  ]);

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

        {/* Favorite sleep spot memory marker rug */}
        {favSleepSpot && (
          <div
            style={{ left: `${favSleepSpot.x}px`, top: `${favSleepSpot.y + 12}px` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-0 border border-dashed border-orange-400/30 bg-orange-100/10 rounded-full px-2 py-1 text-center select-none pointer-events-none animate-pulse"
          >
            <span className="text-[7.5px] font-black text-orange-450 font-mono tracking-widest uppercase">
              📍 {settings.catName || 'Noodle'}'s Spot
            </span>
          </div>
        )}

        {/* Butterfly event render */}
        {rareEvent === 'butterfly' && (
          <div
            style={{ left: `${butterflyPos.x - 10}px`, top: `${butterflyPos.y - 10}px` }}
            className="absolute z-25 pointer-events-none text-xl select-none animate-bounce"
          >
            🦋
          </div>
        )}

        {/* Cardboard box event render */}
        {rareEvent === 'box' && (
          <div
            style={{ left: '210px', top: '240px' }}
            className="absolute z-10 pointer-events-none select-none text-3xl"
          >
            📦
          </div>
        )}

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
            developPersonality('pet');
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

          {/* Dream Thought Bubble */}
          {isDreaming && !meowText && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-slate-950 border border-indigo-250 px-2.5 py-1 rounded-xl text-[10.5px] font-bold shadow-md animate-fade-in flex flex-row items-center gap-1 shrink-0 whitespace-nowrap z-50">
              <span>💭 {dreamIdea}</span>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-r border-b border-indigo-200 rotate-45" />
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

              {activeWindow === 'cat-palace' && (() => {
                const companionName = settings.catName || adoptedName;
                const isAdopted = !!companionName;

                if (!isAdopted) {
                  // Adoption Intake Wizard Form
                  return (
                    <div className="space-y-3.5 py-1 animate-fade-in text-slate-700">
                      <div className="text-center pb-2 border-b border-slate-100">
                        <Award className="w-9 h-9 text-orange-500 mx-auto animate-pulse mb-1" />
                        <h3 className="font-extrabold text-[#111111] text-xs uppercase tracking-wider">Companion Adoption Portal</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                          A stray pixel cat wants to join your desktop! Fill out their official license contract.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Cat Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Milo, Luna, Oliver..."
                          value={adoptedName}
                          onChange={(e) => setAdoptedName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold font-sans text-slate-800 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                        />
                        {/* Suggestions tags */}
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                          {['Noodle', 'Luna', 'Milo', 'Garfield', 'Oreo'].map((n) => (
                            <button
                              key={n}
                              onClick={() => setAdoptedName(n)}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-orange-50 border border-slate-200 text-[10px] font-bold rounded-md hover:text-orange-655 transition cursor-pointer"
                            >
                              🐾 {n}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Chosen Breed / Subspecies</label>
                        <select
                          value={settings.colorPreset}
                          onChange={(e) => {
                            setSettings((prev) => ({
                              ...prev,
                              colorPreset: e.target.value as any
                            }));
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-805 font-bold outline-none cursor-pointer"
                        >
                          <option value="orange">🍊 Orange Tabby Unit</option>
                          <option value="calico">🍕 Exotic Calico</option>
                          <option value="gray">🩶 Velvet Silver-Grey</option>
                          <option value="black">🖤 Tuxedo Midnight Panther</option>
                          <option value="white">🤍 Snow Pearl Shorthair</option>
                        </select>
                      </div>

                      <button
                        onClick={() => {
                          const name = adoptedName.trim() || 'Noodle';
                          const today = new Date().toLocaleDateString('en-US');
                          setAdoptedName(name);
                          setAdoptedDate(today);
                          setSettings((prev) => ({
                            ...prev,
                            catName: name,
                            birthday: today
                          }));
                          triggerMeowText('Mew! Adopted! 🎉😻');
                          triggerMeowAudio();
                        }}
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-3 py-2.5 text-xs font-black text-white rounded-xl shadow-md cursor-pointer transition active:scale-95 text-center mt-2"
                      >
                        Adopt Companion Kitty! 🐾❤️
                      </button>
                    </div>
                  );
                }

                // Normal state: Display Adoption Certificate OR Live Trait Stats!
                const traits = [
                  { id: 'affection', value: affection, label: 'Attention Seeker' },
                  { id: 'shyness', value: shyness, label: 'Shy Cat' },
                  { id: 'laziness', value: laziness, label: 'Lazy Cat' },
                  { id: 'hunting', value: huntingDrive, label: 'Hunter Cat' }
                ];
                traits.sort((a, b) => b.value - a.value);
                const dominantTrait = traits[0].value > 40 ? traits[0].label : 'Balanced';

                if (palaceTab === 'certificate') {
                  // Beautiful Formal Adoption Certificate view
                  return (
                    <div className="space-y-4 py-1.5 animate-fade-in text-slate-700">
                      {/* Ribbon toggle */}
                      <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
                        <button
                          onClick={() => setPalaceTab('certificate')}
                          className="flex-1 text-[10px] font-black py-1 rounded-lg text-center bg-white text-slate-800 shadow-sm transition"
                        >
                          📜 Certificate
                        </button>
                        <button
                          onClick={() => setPalaceTab('stats')}
                          className="flex-1 text-[10px] font-black py-1 rounded-lg text-center text-slate-500 hover:text-slate-800 transition"
                        >
                          📊 Trait Progression
                        </button>
                      </div>

                      {/* Official framed document */}
                      <div className="border-[3px] border-amber-600/30 p-4 bg-amber-50/20 rounded-xl relative overflow-hidden flex flex-col text-center">
                        <div className="absolute top-0 right-0 p-1">
                          <Award className="w-12 h-12 text-amber-500/18 stroke-[1]" />
                        </div>

                        <span className="text-[9px] uppercase font-black tracking-widest text-amber-700">Official Certificate of Adoption</span>
                        
                        <div className="h-1 w-12 bg-amber-600 mx-auto my-1.5" />

                        <p className="text-[10px] text-slate-400 italic">This certifies that stray pixel kitten</p>
                        
                        <h4 className="text-[19px] font-black tracking-tight text-amber-805 my-2.5 font-serif font-semibold italic">
                          🐾 {companionName} 🐾
                        </h4>

                        <p className="text-[10px] text-slate-400">has been formally adopted and protected by</p>
                        <p className="text-[10px] text-slate-800 font-extrabold pb-2 border-b border-slate-100">
                          Google AI Studio Developer
                        </p>

                        <div className="grid grid-cols-2 gap-2 pt-3 text-[9.5px]">
                          <div className="text-left space-y-0.5">
                            <span className="text-slate-400 block">Breed Archetype</span>
                            <span className="font-extrabold capitalize text-slate-800">{settings.colorPreset} Shorthair</span>
                          </div>
                          <div className="text-right space-y-0.5">
                            <span className="text-slate-400 block">Adopted On</span>
                            <span className="font-extrabold text-slate-800 font-mono">{adoptedDate}</span>
                          </div>
                        </div>

                        {/* Gold Seal vector badge */}
                        <div className="flex items-center justify-center gap-1 mt-4 text-[10px] text-amber-750 font-black tracking-widest bg-amber-100/60 border border-amber-200 rounded-lg py-1">
                          <span>🏅 GUARANTEED COMPANIONSHIP</span>
                        </div>
                      </div>

                      <div className="flex gap-2 text-[10px] text-slate-400 font-semibold justify-center items-center italic">
                        <span>Current mood:</span>
                        <span className="text-emerald-600 font-bold">😊 Joyful</span>
                        <span>•</span>
                        <span>Energy:</span>
                        <span className="text-amber-600 font-bold font-mono">{energy.toFixed(0)}%</span>
                      </div>
                    </div>
                  );
                }

                // Stats Page
                return (
                  <div className="space-y-3.5 py-1.5 animate-fade-in text-slate-700">
                    {/* Ribbon toggler */}
                    <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => setPalaceTab('certificate')}
                        className="flex-1 text-[10px] font-black py-1 rounded-lg text-center text-slate-500 hover:text-slate-800 transition"
                      >
                        📜 Certificate
                      </button>
                      <button
                        onClick={() => setPalaceTab('stats')}
                        className="flex-1 text-[10px] font-black py-1 rounded-lg text-center bg-white text-slate-800 shadow-sm transition"
                      >
                        📊 Trait Progression
                      </button>
                    </div>

                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                      <span className="font-extrabold text-xs text-orange-600 flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
                        Dynamic Traits
                      </span>
                      <span className="text-[9px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                        {dominantTrait} Personality
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2 border border-slate-150 rounded-xl mb-1 text-center font-mono text-[10px]">
                      <div>
                        <span className="text-slate-400 block text-[8px] font-sans font-bold uppercase">Hunger</span>
                        <span className="font-bold text-red-650">{hunger.toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[8px] font-sans font-bold uppercase">Energy</span>
                        <span className="font-bold text-amber-550">{energy.toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[8px] font-sans font-bold uppercase">Happiness</span>
                        <span className="font-bold text-emerald-600">{happiness.toFixed(0)}%</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div>
                        <div className="flex justify-between text-[10px] font-extrabold text-slate-500 mb-0.5">
                          <span>Affection (Attention Seeker)</span>
                          <span className="text-pink-500 font-mono">{affection.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-pink-500 h-full rounded-full transition-all duration-500" style={{ width: `${affection}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-extrabold text-slate-500 mb-0.5">
                          <span>Shyness (Flee/Corners)</span>
                          <span className="text-violet-500 font-mono">{shyness.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-violet-500 h-full rounded-full transition-all duration-500" style={{ width: `${shyness}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-extrabold text-slate-500 mb-0.5">
                          <span>Laziness (Slow Sleeper)</span>
                          <span className="text-blue-500 font-mono">{laziness.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${laziness}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-extrabold text-slate-500 mb-0.5">
                          <span>Hunting Drive (Fly Chasing)</span>
                          <span className="text-amber-500 font-mono">{huntingDrive.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-150 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${huntingDrive}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-100 text-center">
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">Fish Eaten</p>
                        <p className="text-xs font-bold text-cyan-600 font-mono mt-0.5">{feedCount}</p>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-100 text-center">
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">Times Petted</p>
                        <p className="text-xs font-bold text-rose-550 font-mono mt-0.5">{clickCount}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
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
