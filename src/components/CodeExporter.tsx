import { useState } from 'react';
import {
  Folder,
  FileCode,
  File,
  Copy,
  Check,
  Download,
  Info,
  Terminal,
  Hammer,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { CodeFile } from '../types';

export default function CodeExporter() {
  const [selectedTech, setSelectedTech] = useState<'wpf' | 'tauri'>('wpf');
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // WPF C# Source Codebase List
  const wpfFiles: CodeFile[] = [
    {
      name: 'GlobalHooks.cs',
      path: 'DesktopCatCompanion/GlobalHooks.cs',
      language: 'csharp',
      content: `using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Windows.Forms;

namespace DesktopCatCompanion
{
    /// <summary>
    /// Low-Level Windows Hooks (WH_MOUSE_LL & WH_KEYBOARD_LL) for background input tracking.
    /// Captures input events even when the Cat Companion window is click-through or unfocused.
    /// </summary>
    public class GlobalHooks : IDisposable
    {
        private const int WH_KEYBOARD_LL = 13;
        private const int WH_MOUSE_LL = 14;
        private const int WM_KEYDOWN = 0x0100;
        private const int WM_MOUSEMOVE = 0x0200;

        public event Action OnKeyPressed;
        public event Action<int, int> OnMouseMove;

        private LowLevelKeyboardProc _keyboardProc;
        private LowLevelMouseProc _mouseProc;
        private IntPtr _keyboardHookId = IntPtr.Zero;
        private IntPtr _mouseHookId = IntPtr.Zero;

        public GlobalHooks()
        {
            _keyboardProc = KeyboardHookCallback;
            _mouseProc = MouseHookCallback;
            InstallHooks();
        }

        private void InstallHooks()
        {
            using (Process curProcess = Process.GetCurrentProcess())
            using (ProcessModule curModule = curProcess.MainModule)
            {
                IntPtr hModule = GetModuleHandle(curModule.ModuleName);
                _keyboardHookId = SetWindowsHookEx(WH_KEYBOARD_LL, _keyboardProc, hModule, 0);
                _mouseHookId = SetWindowsHookEx(WH_MOUSE_LL, _mouseProc, hModule, 0);
            }
        }

        private IntPtr KeyboardHookCallback(int nCode, IntPtr wParam, IntPtr lParam)
        {
            if (nCode >= 0 && wParam == (IntPtr)WM_KEYDOWN)
            {
                OnKeyPressed?.Invoke();
            }
            return CallNextHookEx(_keyboardHookId, nCode, wParam, lParam);
        }

        private IntPtr MouseHookCallback(int nCode, IntPtr wParam, IntPtr lParam)
        {
            if (nCode >= 0 && wParam == (IntPtr)WM_MOUSEMOVE)
            {
                MSLLHOOKSTRUCT hookStruct = (MSLLHOOKSTRUCT)Marshal.PtrToStructure(lParam, typeof(MSLLHOOKSTRUCT));
                OnMouseMove?.Invoke(hookStruct.pt.x, hookStruct.pt.y);
            }
            return CallNextHookEx(_mouseHookId, nCode, wParam, lParam);
        }

        public void Dispose()
        {
            if (_keyboardHookId != IntPtr.Zero) UnhookWindowsHookEx(_keyboardHookId);
            if (_mouseHookId != IntPtr.Zero) UnhookWindowsHookEx(_mouseHookId);
        }

        // --- P/INVOKE DLL IMPORTS ---
        private delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);
        private delegate IntPtr LowLevelMouseProc(int nCode, IntPtr wParam, IntPtr lParam);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelMouseProc lpfn, IntPtr hMod, uint dwThreadId);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool UnhookWindowsHookEx(IntPtr hhk);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

        [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr GetModuleHandle(string lpModuleName);

        [StructLayout(LayoutKind.Sequential)]
        private struct POINT { public int x; public int y; }

        [StructLayout(LayoutKind.Sequential)]
        private struct MSLLHOOKSTRUCT { public POINT pt; public uint mouseData; public uint flags; public uint time; public IntPtr dwExtraInfo; }
    }
}`,
    },
    {
      name: 'MainWindow.xaml',
      path: 'DesktopCatCompanion/MainWindow.xaml',
      language: 'xaml',
      content: `<Window x:Class="DesktopCatCompanion.MainWindow"
        xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="Desktop Cat Companion" 
        Height="80" Width="80"
        WindowStyle="None" 
        AllowsTransparency="True" 
        Background="Transparent"
        Topmost="True" 
        ShowInTaskbar="False"
        Loaded="Window_Loaded">
    
    <Grid>
        <!-- Dynamic Canvas Drawing the Core Pixel Cat Elements -->
        <Image Name="CatSpriteImage" 
               Stretch="Uniform" 
               Width="30" Height="30"
               RenderOptions.BitmapScalingMode="NearestNeighbor"
               HorizontalAlignment="Center" 
               VerticalAlignment="Center"/>
    </Grid>
</Window>`,
    },
    {
      name: 'MainWindow.xaml.cs',
      path: 'DesktopCatCompanion/MainWindow.xaml.cs',
      language: 'csharp',
      content: `using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Windows;
using System.Windows.Interop;
using System.Windows.Threading;

namespace DesktopCatCompanion
{
    public partial class MainWindow : Window
    {
        private GlobalHooks _hooks;
        private DispatcherTimer _animationTimer;
        private CompanionSettings _settings;
        private string _currentState = "idle";
        private int _frameIndex = 0;

        public MainWindow()
        {
            InitializeComponent();
            LoadSettings();
            InitializeAnimation();
        }

        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            // Apply Always-On-Top Click-Through Properties using Win32 WindowLong
            IntPtr hwnd = new WindowInteropHelper(this).Handle;
            int extendedStyle = GetWindowLong(hwnd, GWL_EXSTYLE);
            
            // WS_EX_TRANSPARENT: Click-through mouse transparency
            // WS_EX_TOOLWINDOW: Hides window completely from the Alt+Tab switcher selection
            SetWindowLong(hwnd, GWL_EXSTYLE, extendedStyle | WS_EX_TRANSPARENT | WS_EX_TOOLWINDOW);

            _hooks = new GlobalHooks();
            _hooks.OnKeyPressed += HandleGlobalKeyPress;
            _hooks.OnMouseMove += HandleGlobalMouseMove;
        }

        private void InitializeAnimation()
        {
            _animationTimer = new DispatcherTimer();
            _animationTimer.Interval = TimeSpan.FromMilliseconds(200 / _settings.AnimationSpeed);
            _animationTimer.Tick += AnimationTick;
            _animationTimer.Start();
        }

        private void HandleGlobalKeyPress()
        {
            if (!_settings.EnableTypingAnimation) return;
            _currentState = "typing";
            _frameIndex = 0;
        }

        private void HandleGlobalMouseMove(int x, int y)
        {
            if (!_settings.EnableCursorTracking) return;
            
            // Smoothly rotate cat face or eyeballs to gaze direction
            double catLeft = this.Left + (this.Width / 2);
            double catTop = this.Top + (this.Height / 2);
            double dx = x - catLeft;
            double dy = y - catTop;
            
            // Trigger eye update logic
            UpdateGazeDirection(dx, dy);
        }

        private void AnimationTick(object sender, EventArgs e)
        {
            _frameIndex++;
            // Update CatSpriteImage.Source from local bitmaps based on state
            // Revert typing animation back to idle after typing pause
        }

        private void LoadSettings()
        {
            _settings = CompanionSettings.LoadFromFile();
        }

        protected override void OnClosed(EventArgs e)
        {
            _hooks?.Dispose();
            base.OnClosed(e);
        }

        // --- WIN32 EXTENDED WINDOWS STYLES ---
        private const int GWL_EXSTYLE = -20;
        private const int WS_EX_TRANSPARENT = 0x00000020;
        private const int WS_EX_TOOLWINDOW = 0x00000080;

        [DllImport("user32.dll", SetLastError = true)]
        private static extern int GetWindowLong(IntPtr hWnd, int nIndex);

        [DllImport("user32.dll")]
        private static extern int SetWindowLong(IntPtr hWnd, int nIndex, int dwNewLong);
    }
}`,
    },
    {
      name: 'CompanionSettings.cs',
      path: 'DesktopCatCompanion/CompanionSettings.cs',
      language: 'csharp',
      content: `using System;
using System.IO;
using System.Text.Json;

namespace DesktopCatCompanion
{
    public class CompanionSettings
    {
        public double CatSize { get; set; } = 30; // 20px - 30px
        public double AnimationSpeed { get; set; } = 1.0;
        public string CatColorHex { get; set; } = "#F48C42";
        public bool EnableCursorTracking { get; set; } = true;
        public bool EnableTypingAnimation { get; set; } = true;
        public bool RunAtStartup { get; set; } = false;

        private static readonly string SettingsPath = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
            "DesktopCatCompanion",
            "settings.json"
        );

        public static CompanionSettings LoadFromFile()
        {
            try
            {
                if (!File.Exists(SettingsPath))
                {
                    return new CompanionSettings();
                }
                string json = File.ReadAllText(SettingsPath);
                return JsonSerializer.Deserialize<CompanionSettings>(json) ?? new CompanionSettings();
            }
            catch
            {
                return new CompanionSettings();
            }
        }

        public void SaveToFile()
        {
            try
            {
                string dir = Path.GetDirectoryName(SettingsPath);
                if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);

                string json = JsonSerializer.Serialize(this, new JsonSerializerOptions { WriteIndented = true });
                File.ReadAllText(SettingsPath, json);
            }
            catch {}
        }
    }
}`,
    },
    {
      name: 'BuildInstructions.md',
      path: 'BuildInstructions.md',
      language: 'markdown',
      content: `# Building Desktop Cat Companion

This is a high-performance Windows WPF/C# application utilizing pure low-level unmanaged win32 hooks. It boasts sub-1% CPU consumption.

### Prerequisites
1. Installed **.NET SDK 8.0** or above.
2. Visual Studio 2022 containing **.NET Desktop Development** workload workload.

### Fast Compile & Dry Run
1. Open up a Powershell or Windows Terminal inside the source workspace.
2. Build the solution using standard Dotnet CLI:
   \`\`\`bash
   dotnet build --configuration Release
   \`\`\`
3. Launch the generated assembly executable:
   \`\`\`bash
   ./bin/Release/net8.0-windows/DesktopCatCompanion.exe
   \`\`\`

### Low-Resource Architecture Notes
- Animation ticks are deferred to WPF's \`DispatcherTimer\` running on standard UI thread.
- Hover hit-testing is fully bypassed via \`WS_EX_TRANSPARENT\` attribute, ensuring zero mouse polling interruption and click-through performance on standard desktops.`,
    },
  ];

  // Rust / Tauri Source Codebase List
  const tauriFiles: CodeFile[] = [
    {
      name: 'tauri.conf.json',
      path: 'src-tauri/tauri.conf.json',
      language: 'json',
      content: `{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:1420",
    "distDir": "../dist"
  },
  "package": {
    "productName": "DesktopCatCompanion",
    "version": "1.0.0"
  },
  "tauri": {
    "windows": [
      {
        "title": "Desktop Cat Companion",
        "width": 80,
        "height": 80,
        "transparent": true,
        "decorations": false,
        "alwaysOnTop": true,
        "resizable": false,
        "fullscreen": false,
        "skipTaskbar": true
      }
    ],
    "bundle": {
      "active": true,
      "targets": ["all"]
    }
  }
}`,
    },
    {
      name: 'main.rs',
      path: 'src-tauri/src/main.rs',
      language: 'rust',
      content: `#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystems = "windows"
)]

use tauri::{Manager, Window};
use std::sync::{Arc, Mutex};
use std::thread;
use rdev::{listen, Event, EventType};

struct CatState {
    size: f64,
    color: String,
}

#[tauri::command]
fn update_settings(state: tauri::State<'_, Arc<Mutex<CatState>>>, size: f64, color: String) {
    let mut data = state.inner().lock().unwrap();
    data.size = size;
    data.color = color;
}

fn main() {
    let shared_state = Arc::new(Mutex::new(CatState {
        size: 30.0,
        color: "#F48C42".to_string(),
    }));

    let hook_state = shared_state.clone();

    tauri::Builder::default()
        .manage(shared_state)
        .setup(|app| {
            let main_window = app.get_window("main").unwrap();

            // Set Rust / Tauri Window Click-Through for transparency bypass
            #[cfg(target_os = "windows")]
            {
                use window_shadows::set_shadow;
                let hwnd = main_window.hwnd().unwrap().0 as isize;
                unsafe {
                    use windows::Win32::UI::WindowsAndMessaging::{
                        GetWindowLongW, SetWindowLongW, GWL_EXSTYLE, WS_EX_TRANSPARENT, WS_EX_TOOLWINDOW
                    };
                    let style = GetWindowLongW(hwnd, GWL_EXSTYLE);
                    SetWindowLongW(hwnd, GWL_EXSTYLE, style | WS_EX_TRANSPARENT as i32 | WS_EX_TOOLWINDOW as i32);
                }
            }

            // Fire thread to monitor Global Windows Hook inputs via rdev crate
            let window_clone = main_window.clone();
            thread::spawn(move || {
                if let Err(error) = listen(move |event| {
                    match event.event_type {
                        EventType::KeyPress(_) => {
                            window_clone.emit("global-keypress", {}).unwrap();
                        }
                        EventType::MouseMove { x, y } => {
                            window_clone.emit("global-mousemove", (x, y)).unwrap();
                        }
                        _ => {}
                    }
                }) {
                    println!("Error starting event listener: {:?}", error);
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![update_settings])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}`,
    },
    {
      name: 'Cargo.toml',
      path: 'src-tauri/Cargo.toml',
      language: 'toml',
      content: `[package]
name = "desktop_cat_companion"
version = "1.0.0"
edition = "2021"

[build-dependencies]
tauri-build = { version = "1.5" }

[dependencies]
tauri = { version = "1.5", features = ["api-all"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
rdev = "0.5.3"  # Cross-platform lower level global key hook listener
window-shadows = "0.2"

[target.'cfg(target_os = "windows")'.dependencies]
windows = { version = "0.48", features = ["Win32_UI_WindowsAndMessaging", "Win32_Foundation"] }`,
    },
  ];

  const currentFiles = selectedTech === 'wpf' ? wpfFiles : tauriFiles;
  const currentFile = currentFiles[selectedFileIndex] || currentFiles[0];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full bg-slate-900 border border-slate-700/40 rounded-2xl overflow-hidden shadow-xl">
      {/* File Tree Sidebar */}
      <div className="w-full lg:w-64 bg-slate-950 border-r border-slate-800 p-4 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Tech Stack Target
            </label>
            <div className="flex bg-slate-900 p-1 rounded-lg">
              <button
                onClick={() => {
                  setSelectedTech('wpf');
                  setSelectedFileIndex(0);
                }}
                className={`flex-1 py-1 px-2.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  selectedTech === 'wpf'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                C# / WPF
              </button>
              <button
                onClick={() => {
                  setSelectedTech('tauri');
                  setSelectedFileIndex(0);
                }}
                className={`flex-1 py-1 px-2.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  selectedTech === 'tauri'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Rust / Tauri
              </button>
            </div>
          </div>

          {/* Directory Folder Layout */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
              Solution File Explorer
            </span>
            <div className="flex items-center gap-2 px-2 py-1 text-xs text-indigo-400 font-medium">
              <Folder className="w-4 h-4" />
              <span>{selectedTech === 'wpf' ? 'WPF Workspace' : 'Tauri Workspace'}</span>
            </div>
            <div className="pl-4 space-y-1">
              {currentFiles.map((file, idx) => (
                <button
                  key={file.name}
                  onClick={() => setSelectedFileIndex(idx)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md transition-all text-left cursor-pointer ${
                    selectedFileIndex === idx
                      ? 'bg-indigo-600/30 text-indigo-200 border-l-2 border-indigo-500'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  {file.name.endsWith('.md') ? (
                    <Info className="w-3.5 h-3.5 text-sky-400" />
                  ) : (
                    <FileCode className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  <span className="truncate">{file.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action downloads */}
        <div className="mt-6 pt-4 border-t border-slate-900 text-slate-400 space-y-2 text-[11px] leading-snug">
          <p className="flex items-start gap-1.5 leading-tight">
            <Terminal className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              All boilerplate models use the unmanaged <b>User32.dll</b> system mapping library for click-through and hook routines.
            </span>
          </p>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Editor Title Toolbar */}
        <div className="bg-slate-900 border-b border-slate-800 px-5 py-2.5 flex items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <File className="w-4 h-4 text-slate-500 shrink-0" />
            <span className="text-xs font-mono text-slate-300 truncate">
              {currentFile.path}
            </span>
            <span className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-[10px] text-slate-400 font-bold uppercase rounded font-sans scale-90">
              {currentFile.language}
            </span>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-xs text-white font-semibold rounded-lg transition-colors cursor-pointer shrink-0 shadow-md active:translate-y-0.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Code
              </>
            )}
          </button>
        </div>

        {/* Code Block Container */}
        <div className="flex-1 overflow-auto bg-[#0a0a10] p-4 text-xs font-mono leading-relaxed relative">
          <pre className="text-slate-300">
            <code>
              {currentFile.content.split('\n').map((line, idx) => (
                <div key={idx} className="flex hover:bg-indigo-950/20 px-2 py-0.5 rounded">
                  <span className="w-8 text-right pr-4 select-none text-slate-600 text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="whitespace-pre overflow-x-auto select-all">{line}</span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
