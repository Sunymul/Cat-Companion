export type CatColorPreset = 'orange' | 'black' | 'white' | 'gray' | 'brown' | 'calico' | 'custom';

export type CatPersonality = 'lazy' | 'hyperactive' | 'clumsy' | 'curious';

export interface CustomColors {
  fur: string;
  pattern: string;
  eyes: string;
  ears: string;
  snout: string;
  paws: string;
}

export interface CompanionSettings {
  size: number; // 20 - 50 px in the app overlay (scaleable in demo)
  speed: number; // 0.5 - 2.5
  colorPreset: CatColorPreset;
  customColors: CustomColors;
  enableTracking: boolean;
  enableTypingAnimation: boolean;
  runAtStartup: boolean;
  personality: CatPersonality;
  chaseMode: boolean;
  soundEnabled: boolean;
}

export type CatState =
  | 'idle'
  | 'walking'
  | 'look-left'
  | 'look-right'
  | 'look-up'
  | 'look-down'
  | 'typing'
  | 'sleeping'
  | 'waking'
  | 'excited'
  | 'surprised';

export interface CodeFile {
  name: string;
  path: string;
  language: 'csharp' | 'rust' | 'json' | 'xaml' | 'markdown' | 'toml' | 'python' | 'text';
  content: string;
}

export interface DesktopIcon {
  id: string;
  label: string;
  icon: string; // lucide icon name
  x: number;
  y: number;
}
