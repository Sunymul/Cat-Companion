import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Sliders,
  Volume2,
  VolumeX,
  Compass,
  FileDown,
  FileUp,
  Settings,
  Heart,
  Palette,
} from 'lucide-react';
import { CompanionSettings, CatColorPreset, CatPersonality, CustomColors } from '../types';

interface SettingsPanelProps {
  settings: CompanionSettings;
  setSettings: React.Dispatch<React.SetStateAction<CompanionSettings>>;
  onReset: () => void;
  triggerNotification: (text: string) => void;
}

export default function SettingsPanel({
  settings,
  setSettings,
  onReset,
  triggerNotification,
}: SettingsPanelProps) {
  // Config state keys
  const [showExporterFields, setShowExporterFields] = useState(false);

  // Handle color preset selection
  const handlePresetChange = (preset: CatColorPreset) => {
    setSettings((prev) => ({
      ...prev,
      colorPreset: preset,
    }));
    triggerNotification(`Switched to ${preset.toUpperCase()} cat breed!`);
  };

  // Custom color pickers helper
  const handleCustomColorChange = (key: keyof CustomColors, value: string) => {
    setSettings((prev) => ({
      ...prev,
      colorPreset: 'custom',
      customColors: {
        ...prev.customColors,
        [key]: value,
      },
    }));
  };

  // Switch / Checkbox helpers
  const handleToggle = (key: keyof CompanionSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    triggerNotification(`${String(key)} setting toggled!`);
  };

  // Slider helpers
  const handleNumberChange = (key: keyof CompanionSettings, val: number) => {
    setSettings((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  // Personality description mapper
  const getPersonalityDescription = (p: CatPersonality) => {
    switch (p) {
      case 'lazy':
        return '🐱 Loves sleeping, moves slowly, sleeps sooner when idle.';
      case 'hyperactive':
        return '⚡ Super fast movement, scared easily by rapid cursors.';
      case 'clumsy':
        return '💫 Waddles happily, trips over boundaries periodically.';
      case 'curious':
        return '👀 Constant gaze lock, climbs quickly on screen icons.';
    }
  };

  // Export settings config payload as JSON
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(settings, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'companion-settings.json';
    link.click();
    URL.revokeObjectURL(url);
    triggerNotification('Settings exported successfully! 💾');
  };

  // Import JSON configuration helper
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          // Perform structural check inside parsed payload
          setSettings({
            ...settings,
            ...parsed,
          });
          triggerNotification('Settings imported successfully! 🔮');
        }
      } catch (err) {
        triggerNotification('Invalid JSON configuration layout ❌');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-md space-y-6 text-slate-700">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-orange-500" />
          <h2 className="font-extrabold text-base text-slate-900 tracking-tight">Companion Controls Panel</h2>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 font-bold border border-slate-200 rounded-xl text-slate-600 transition-colors cursor-pointer shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-505" />
          Reset All
        </button>
      </div>

      {/* Preset Breeds */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-black text-slate-450 uppercase tracking-widest">
          <Palette className="w-3.5 h-3.5 text-orange-500" />
          Select Breed Preset
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {(['orange', 'black', 'white', 'gray', 'brown', 'calico'] as CatColorPreset[]).map((preset) => (
            <button
              key={preset}
              onClick={() => handlePresetChange(preset)}
              className={`py-2.5 px-3 text-xs font-bold rounded-xl border capitalize transition-all cursor-pointer ${
                settings.colorPreset === preset
                  ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20 scale-[1.02]'
                  : 'bg-slate-50 border-slate-200/60 hover:bg-slate-100 hover:border-slate-300 text-slate-600'
              }`}
            >
              {preset} Unit
            </button>
          ))}
        </div>
      </div>

      {/* Custom Color Picker Drawer */}
      <div className="space-y-3 pt-2">
        <button
          onClick={() => setShowExporterFields(!showExporterFields)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            🎨 Custom Pixel Canvas Hex Editor
          </span>
          <span className="text-[10px] bg-orange-100 text-orange-600 px-2.5 py-0.5 rounded-full font-black">
            {showExporterFields ? 'Hide Pickers' : 'Show Pickers'}
          </span>
        </button>

        {showExporterFields && (
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-205/60 animate-fade-in text-xs">
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-bold">Base Fur Color</label>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-lg shadow-sm">
                <input
                  type="color"
                  value={settings.customColors.fur}
                  onChange={(e) => handleCustomColorChange('fur', e.target.value)}
                  className="w-6 h-6 border-0 bg-transparent cursor-pointer rounded overflow-hidden"
                />
                <input
                  type="text"
                  value={settings.customColors.fur}
                  onChange={(e) => handleCustomColorChange('fur', e.target.value)}
                  className="font-mono text-[10px] text-slate-850 bg-transparent outline-none w-full"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-bold">Stripes/Patterns</label>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-lg shadow-sm">
                <input
                  type="color"
                  value={settings.customColors.pattern}
                  onChange={(e) => handleCustomColorChange('pattern', e.target.value)}
                  className="w-6 h-6 border-0 bg-transparent cursor-pointer rounded overflow-hidden"
                />
                <input
                  type="text"
                  value={settings.customColors.pattern}
                  onChange={(e) => handleCustomColorChange('pattern', e.target.value)}
                  className="font-mono text-[10px] text-slate-850 bg-transparent outline-none w-full"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-bold">Glowing Eyes</label>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-lg shadow-sm">
                <input
                  type="color"
                  value={settings.customColors.eyes}
                  onChange={(e) => handleCustomColorChange('eyes', e.target.value)}
                  className="w-6 h-6 border-0 bg-transparent cursor-pointer rounded overflow-hidden"
                />
                <input
                  type="text"
                  value={settings.customColors.eyes}
                  onChange={(e) => handleCustomColorChange('eyes', e.target.value)}
                  className="font-mono text-[10px] text-slate-855 bg-transparent outline-none w-full"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 font-bold">Paws / Mittens</label>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-lg shadow-sm">
                <input
                  type="color"
                  value={settings.customColors.paws}
                  onChange={(e) => handleCustomColorChange('paws', e.target.value)}
                  className="w-6 h-6 border-0 bg-transparent cursor-pointer rounded overflow-hidden"
                />
                <input
                  type="text"
                  value={settings.customColors.paws}
                  onChange={(e) => handleCustomColorChange('paws', e.target.value)}
                  className="font-mono text-[10px] text-slate-855 bg-transparent outline-none w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Physics / Tuning Sliders */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-1.5 text-xs font-black text-slate-450 uppercase tracking-widest">
          <Sliders className="w-3.5 h-3.5 text-orange-500" />
          Size & Velocity Physics
        </div>

        <div className="space-y-3.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/60">
          {/* Size */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-650">
              <span className="font-bold">Overlay Cat Size (px)</span>
              <span className="font-mono text-orange-600 font-black">{settings.size}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="50"
              value={settings.size}
              onChange={(e) => handleNumberChange('size', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          {/* Speed */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-650">
              <span className="font-bold">Animation Speed / Mult</span>
              <span className="font-mono text-orange-600 font-black">x{settings.speed.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={settings.speed}
              onChange={(e) => handleNumberChange('speed', Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Personality selection */}
      <div className="space-y-2 pt-1">
        <label className="text-xs font-black text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-orange-500" />
          Brain Personality Module
        </label>
        <select
          value={settings.personality}
          onChange={(e) => {
            setSettings((prev) => ({
              ...prev,
              personality: e.target.value as CatPersonality,
            }));
            triggerNotification(`Cat's personality updated to ${e.target.value}!`);
          }}
          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 font-bold outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 cursor-pointer shadow-sm"
        >
          <option value="lazy">Lazy / Slow Rest Mode</option>
          <option value="hyperactive">Hyperactive / Chase & Fear</option>
          <option value="clumsy">Wobbly Cute Clumsiness</option>
          <option value="curious">Curious Observer Gaze</option>
        </select>
        <p className="text-[10px] text-slate-450 italic leading-dashed pl-1.5 mt-1 font-medium">
          {getPersonalityDescription(settings.personality)}
        </p>
      </div>

      {/* Function Toggle Toggles */}
      <div className="space-y-3 pt-2">
        <label className="text-xs font-black text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
          Windows Features & Hooks
        </label>

        <div className="space-y-2">
          {/* Cursor Tracking */}
          <label className="flex items-center justify-between p-3 bg-slate-50/65 hover:bg-slate-100/80 border border-slate-200/50 rounded-xl cursor-pointer transition select-none">
            <span className="text-xs font-bold text-slate-700">Enable Windows Cursor Gaze</span>
            <input
              type="checkbox"
              checked={settings.enableTracking}
              onChange={() => handleToggle('enableTracking')}
              className="w-4 h-4 text-orange-600 bg-white border-slate-300 rounded accent-orange-500 focus:ring-orange-500"
            />
          </label>

          {/* Typing Trigger */}
          <label className="flex items-center justify-between p-3 bg-slate-50/65 hover:bg-slate-100/80 border border-slate-200/50 rounded-xl cursor-pointer transition select-none">
            <span className="text-xs font-bold text-slate-700">Active Paws Keyboard Tapping</span>
            <input
              type="checkbox"
              checked={settings.enableTypingAnimation}
              onChange={() => handleToggle('enableTypingAnimation')}
              className="w-4 h-4 text-orange-600 bg-white border-slate-300 rounded accent-orange-500 focus:ring-orange-500"
            />
          </label>

          {/* Chase Mode */}
          <label className="flex items-center justify-between p-3 bg-slate-50/65 hover:bg-slate-100/80 border border-slate-200/50 rounded-xl cursor-pointer transition select-none">
            <span className="text-xs font-bold text-slate-700">Curious Cursor Chase mode</span>
            <input
              type="checkbox"
              checked={settings.chaseMode}
              onChange={() => handleToggle('chaseMode')}
              className="w-4 h-4 text-orange-600 bg-white border-slate-300 rounded accent-orange-500 focus:ring-orange-500"
            />
          </label>

          {/* Sound Synthesizer */}
          <label className="flex items-center justify-between p-3 bg-slate-50/65 hover:bg-slate-100/80 border border-slate-200/50 rounded-xl cursor-pointer transition select-none">
            <span className="text-xs font-bold text-slate-700">Enforce Meow Audio (Synth Sound)</span>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={() => handleToggle('soundEnabled')}
              className="w-4 h-4 text-orange-600 bg-white border-slate-300 rounded accent-orange-500 focus:ring-orange-500"
            />
          </label>

          {/* Startup Registry */}
          <label className="flex items-center justify-between p-3 bg-slate-50/65 hover:bg-slate-100/80 border border-slate-200/50 rounded-xl cursor-pointer transition select-none">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              Launch on Windows Startup
            </span>
            <input
              type="checkbox"
              checked={settings.runAtStartup}
              onChange={() => handleToggle('runAtStartup')}
              className="w-4 h-4 text-orange-600 bg-white border-slate-300 rounded accent-orange-500 focus:ring-orange-500"
            />
          </label>
        </div>
      </div>

      {/* Premium Collectibles & Focus Utilities */}
      <div className="space-y-4 pt-2 border-t border-slate-100">
        <label className="text-xs font-black text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-orange-500" />
          Premium Outfits & Focus
        </label>

        <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/50">
          {/* Outfits Accessories selector */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 block">Equipped Costume / Hats</span>
            <select
              value={settings.equippedAccessory || 'none'}
              onChange={(e) => {
                setSettings((prev) => ({
                  ...prev,
                  equippedAccessory: e.target.value as any,
                }));
                triggerNotification(`Costume changed to ${e.target.value}! ✨`);
              }}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold outline-none cursor-pointer"
            >
              <option value="none">🐱 Classic Naked Kitty</option>
              <option value="santa">🎅 Christmas Holiday Santa Hat</option>
              <option value="wizard">🧙 Starry Wizarding pointed Hat</option>
              <option value="sunglasses">🕶️ Cool Pixel-Art Sunglasses</option>
              <option value="bowtie">🎀 Cute Red Bowtie</option>
              <option value="wings">👼 Angel Feather Wings</option>
            </select>
          </div>

          {/* Productivity / Focus Mode Toggle */}
          <label className="flex items-center justify-between p-2 mt-1 cursor-pointer transition select-none">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-700">Productivity Focus Mode</span>
              <span className="text-[10px] text-slate-400 font-medium leading-tight">Curls up corner quietly to avoid distraction</span>
            </div>
            <input
              type="checkbox"
              checked={settings.focusMode || false}
              onChange={() => {
                const nextFocus = !settings.focusMode;
                setSettings((prev) => ({
                  ...prev,
                  focusMode: nextFocus,
                }));
                triggerNotification(nextFocus ? 'Focus Mode enabled! Kitty sits quietly in study mode.' : 'Focus Mode disabled! Kitty is active!');
              }}
              className="w-4 h-4 text-orange-600 bg-white border-slate-300 rounded accent-orange-500 focus:ring-orange-500"
            />
          </label>
        </div>
      </div>

      {/* File backup JSON IO */}
      <div className="flex gap-2.5 pt-4 border-t border-slate-100/80">
        <button
          onClick={handleExportJSON}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-xs font-extrabold text-slate-700 border border-slate-200 rounded-xl transition-colors cursor-pointer shadow-sm"
        >
          <FileDown className="w-3.5 h-3.5 text-orange-600" />
          Backup JSON
        </button>

        <label className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-orange-500 hover:bg-orange-600 text-xs font-extrabold text-white rounded-xl transition-colors cursor-pointer shadow-lg shadow-orange-500/20 text-center select-none">
          <FileUp className="w-3.5 h-3.5 text-white" />
          Import Back
          <input
            type="file"
            accept=".json"
            onChange={handleImportJSON}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
}
