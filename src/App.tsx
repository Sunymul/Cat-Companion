import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cat,
  Code,
  Sliders,
  Sparkles,
  Info,
  Layers,
  CheckCircle,
  X,
  Plus,
  Compass,
} from 'lucide-react';
import { CompanionSettings, CatState } from './types';
import SimulatedDesktop from './components/SimulatedDesktop';
import SettingsPanel from './components/SettingsPanel';
import CodeExporter from './components/CodeExporter';

const DEFAULT_SETTINGS: CompanionSettings = {
  size: 50,
  speed: 1.0,
  colorPreset: 'orange',
  customColors: {
    fur: '#F48C42',
    pattern: '#C95F20',
    eyes: '#5CB35C',
    ears: '#FFB17F',
    snout: '#332211',
    paws: '#FFD7B5',
  },
  enableTracking: true,
  enableTypingAnimation: true,
  runAtStartup: false,
  personality: 'lazy',
  chaseMode: false,
  soundEnabled: true,
};

export default function App() {
  const [settings, setSettings] = useState<CompanionSettings>(() => {
    const saved = localStorage.getItem('desktop_cat_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [activeTab, setActiveTab] = useState<'simulator' | 'code' | 'docs'>('simulator');
  const [catState, setCatState] = useState<CatState>('idle');
  const [notification, setNotification] = useState<string | null>(null);

  // Sync settings with local storage
  useEffect(() => {
    localStorage.setItem('desktop_cat_settings', JSON.stringify(settings));
  }, [settings]);

  // Show a notification banner with auto-dismiss
  const triggerNotification = (text: string) => {
    setNotification(text);
    const t = setTimeout(() => {
      setNotification(null);
    }, 2500);
    return () => clearTimeout(t);
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    triggerNotification('Settings restored to initial default presets! 🐾');
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#818cf8] via-[#6366f1] to-[#4338ca] text-slate-800 flex flex-col font-sans selection:bg-orange-500/20 selection:text-orange-950 relative p-3 sm:p-6 md:p-8 justify-center items-center">
      {/* Background Ambient Orbs */}
      <div className="absolute top-10 left-10 w-[350px] h-[350px] bg-orange-400/25 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-indigo-300/30 rounded-full blur-[100px] pointer-events-none" />

      {/* Dynamic Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-white/95 border border-orange-200 text-slate-800 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold backdrop-blur-md"
          >
            <CheckCircle className="w-4 h-4 text-orange-500" />
            <span>{notification}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-600 transition-colors ml-2 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Glass Workspace Card */}
      <div className="w-full max-w-7xl bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white/25 flex flex-col overflow-hidden min-h-[90vh]">
        {/* Navigation Header */}
        <header className="border-b border-slate-100 bg-white/40 backdrop-blur-md px-6 py-5 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo and Titles */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Cat className="w-6 h-6 text-white relative z-10 transition-transform group-hover:scale-110" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 tracking-tight text-lg leading-tight flex items-center gap-2">
                Desktop Cat Companion
                <span className="bg-orange-500 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-widest scale-90 border border-orange-400/25 shadow-sm shadow-orange-500/20">
                  WinUI & WPF
                </span>
              </h1>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Transparent, always-on-top interactive pet engine simulator with system hooks
              </p>
            </div>
          </div>

          {/* Global tab options */}
          <div className="flex bg-slate-100/80 p-1 rounded-2xl border border-slate-200/40 shadow-inner">
            {(['simulator', 'code', 'docs'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-4.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  activeTab === tab
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab === 'simulator' && <Sliders className="w-3.5 h-3.5" />}
                {tab === 'code' && <Code className="w-3.5 h-3.5" />}
                {tab === 'docs' && <Info className="w-3.5 h-3.5" />}
                <span className="capitalize">{tab === 'simulator' ? 'Sim Sandbox' : tab}</span>
              </button>
            ))}
          </div>
        </header>

        {/* Main Dynamic Viewport */}
        <main className="flex-1 w-full p-6 sm:p-8 lg:p-10 flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          {activeTab === 'simulator' && (
            <motion.div
              key="simulator"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start min-h-0 flex-1"
            >
              {/* Controls Form Drawer */}
              <div className="lg:col-span-4 h-full">
                <SettingsPanel
                  settings={settings}
                  setSettings={setSettings}
                  onReset={handleResetSettings}
                  triggerNotification={triggerNotification}
                />
              </div>

              {/* Windows Simulated Workspace playground */}
              <div className="lg:col-span-8 flex flex-col gap-6 h-full min-h-[500px]">
                <SimulatedDesktop
                  settings={settings}
                  setSettings={setSettings}
                  catState={catState}
                  setCatState={setCatState}
                />

                {/* Status Bar Indicators */}
                <div className="bg-[#fafafc] rounded-2xl border border-slate-250/60 p-4.5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-600 shadow-sm">
                  <div className="space-y-1">
                    <span className="text-slate-500 font-bold">Activity state</span>
                    <p className="font-extrabold text-slate-900 flex items-center gap-1.5 capitalize">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                      {catState}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 font-bold">Active Pixel scale</span>
                    <p className="font-extrabold font-mono text-slate-900">
                      {settings.size} × {settings.size}px
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 font-bold">Cat Personality</span>
                    <p className="font-extrabold text-slate-900 capitalize">{settings.personality}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 font-bold">Local AppData Cache</span>
                    <p className="font-extrabold text-slate-900 font-mono text-orange-600">settings.json</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'code' && (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="flex-1 min-h-[600px]"
            >
              <div className="mb-4">
                <h3 className="text-sm font-extrabold text-slate-900">Solution Source Code Workstation</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Inspect the production-ready unmanaged mouse hooks and borderless window compilation structure. Choose C# WPF or Rust Tauri.
                </p>
              </div>
              <CodeExporter />
            </motion.div>
          )}

          {activeTab === 'docs' && (
            <motion.div
              key="docs"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 text-xs leading-relaxed"
            >
              {/* Left Column Architecture specs */}
              <div className="md:col-span-8 bg-white/90 border border-slate-200/60 p-6 sm:p-8 rounded-[24px] space-y-6 text-slate-600 shadow-sm">
                <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                  Cat Companion System Engineering Specs
                </h2>

                <div className="space-y-4">
                  <h3 className="font-extrabold text-orange-600 text-sm flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    1. Low-Level Global OS Hooks (User32 / Win32)
                  </h3>
                  <p>
                    Standard local application events only trigger when windows have active context focus. To track cursor coordinates and typing speeds when the cat resides silently in the background, we register low-level global system hooks via unmanaged C APIs:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-500 leading-snug">
                    <li>
                      <b className="text-slate-800">WH_KEYBOARD_LL (13):</b> Listens to global keyboard keyboard messages like <code className="font-mono bg-slate-100 border border-slate-200 px-1 py-0.5 rounded text-orange-600 font-bold">WM_KEYDOWN</code>.
                    </li>
                    <li>
                      <b className="text-slate-800">WH_MOUSE_LL (14):</b> Listens to global mouse structures like <code className="font-mono bg-slate-100 border border-slate-200 px-1 py-0.5 rounded text-orange-600 font-bold">WM_MOUSEMOVE</code>.
                    </li>
                    <li>
                      These callbacks operate within dedicated Win32 message loops to minimize memory footprints below <b className="text-slate-900">12 MB</b>.
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-extrabold text-orange-600 text-sm flex items-center gap-1.5">
                    <Compass className="w-4 h-4" />
                    2. Mouse Transparency & Click-Through Bypasses
                  </h3>
                  <p>
                    For the Cat to lay overlayed on your active code or games without blocking clicks, we modify the window's style registers immediately upon loaded. By leveraging the Win32 module methods:
                  </p>
                  <div className="p-3 bg-slate-900 rounded-xl font-mono text-[10px] text-amber-400 border border-slate-800 shadow-inner">
                    {"int extendedStyle = GetWindowLong(hwnd, GWL_EXSTYLE);"}<br />
                    {"SetWindowLong(hwnd, GWL_EXSTYLE, extendedStyle | WS_EX_TRANSPARENT | WS_EX_TOOLWINDOW);"}
                  </div>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-500 leading-snug">
                    <li>
                      <b className="text-slate-800">WS_EX_TRANSPARENT:</b> Forwards all mouse hover and click events directly down to whatever application is behind the cat!
                    </li>
                    <li>
                      <b className="text-slate-800">WS_EX_TOOLWINDOW:</b> Hides the companion window entirely from the Windows Alt+Tab dialog so it stays invisible as a background service.
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="font-extrabold text-orange-600 text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    3. Performance & Energy Throttling System
                  </h3>
                  <p>
                    Ensuring CPU utilization remains strictly <b className="text-slate-900">under 2%</b> is accomplished via these key execution principles:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-500 leading-snug">
                    <li>
                      <b className="text-slate-800">Zero Polling Loop:</b> Mouse coordinates are strictly push-based from hook event handlers instead of running heavy polling threads.
                    </li>
                    <li>
                      <b className="text-slate-800">Idle Sleep Deferral:</b> When typing or mouse activities pause, the engine switches to the idle state which yields all animation timer requests completely, bringing cycle draw calls down to zero.
                    </li>
                    <li>
                      <b className="text-slate-800">Nearest Neighbor Scaling:</b> Bitmaps are rendered with pixel-art integrity using GPU accelerated filters, keeping graphics pipeline operations lightweight.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column Asset specs */}
              <div className="md:col-span-4 space-y-6">
                {/* Sprite Pack Specifications */}
                <div className="bg-white/90 border border-slate-200/60 p-6 rounded-[24px] space-y-4 shadow-sm text-slate-600">
                  <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-orange-600" />
                    Sprite Mapping Specifications
                  </h2>
                  <p className="text-slate-500 leading-relaxed text-[11px]">
                    The local asset system parses an image sprite-sheet. Each frame is designed in a <b className="text-slate-800">24x24 pixel grid</b>:
                  </p>
                  <div className="space-y-2 text-[11px] font-mono select-none">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 flex justify-between text-slate-700">
                      <span className="text-slate-500">Row 0 (Frames 0-3):</span>
                      <span className="text-orange-600 font-bold">Blinking / Idle</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 flex justify-between text-slate-700">
                      <span className="text-slate-500">Row 1 (Frames 0-3):</span>
                      <span className="text-orange-600 font-bold">Walking Cycles</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 flex justify-between text-slate-700">
                      <span className="text-slate-500">Row 2 (Frames 0-3):</span>
                      <span className="text-orange-600 font-bold">Active Typing Claws</span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 flex justify-between text-slate-700">
                      <span className="text-slate-500">Row 3 (Frames 0-3):</span>
                      <span className="text-orange-600 font-bold">Sleeping / Awakes</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 italic leading-snug">
                    Tip: To customize companion skins, developers can upload any 24px-based grid sprite sheet mapping these rows.
                  </p>
                </div>

                {/* Packaging & Distribution Card */}
                <div className="bg-orange-50/60 border border-orange-200/50 p-6 rounded-[24px] text-[11px] text-slate-600 space-y-3.5 shadow-sm">
                  <h3 className="font-extrabold text-orange-850 text-xs uppercase tracking-wide flex items-center gap-1.5">
                    📦 Setup Windows Launcher registry
                  </h3>
                  <p className="text-slate-500 leading-snug">
                    To trigger launcher initialization automatically at computer startup, the companion injects an item inside the Windows Registry:
                  </p>
                  <div className="p-2.5 bg-slate-900 rounded-xl font-mono text-[9px] text-amber-400 tracking-tight">
                    {"RegistryKey key = Registry.CurrentUser.OpenSubKey("}<br />
                    {"  \"SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run\", true);"}<br />
                    {"key.SetValue(\"DesktopCatCompanion\", Application.ExecutablePath);"}
                  </div>
                  <p className="text-slate-400 italic text-[10.5px]">
                    This keeps setup fully integrated within standard Microsoft security guidelines.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modern Compact Page Footer */}
      <footer className="border-t border-slate-100 bg-slate-50/70 py-6 px-12 text-center text-xs text-slate-500 mt-auto select-none">
        <p className="flex items-center justify-center gap-1.5 font-bold text-slate-700">
          Developed in high fidelity for .NET Framework WinUI/WPF & Rust Tauri compatibility.
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          Simulated Desktop Cat Companion workstation is offline-ready. Press keys to begin cat typing routine.
        </p>
      </footer>
    </div> {/* Glass Workspace Card ends */}
  </div>
  );
}
