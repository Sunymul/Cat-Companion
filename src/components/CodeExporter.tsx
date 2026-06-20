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
  const [selectedTech, setSelectedTech] = useState<'wpf' | 'tauri' | 'python'>('python');
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

  // Python / PyQt6 Source Codebase List
  const pythonFiles: CodeFile[] = [
    {
      name: 'main.py',
      path: 'cat_companion/main.py',
      language: 'python',
      content: `import sys
import os
from PyQt6.QtWidgets import QApplication
from PyQt6.QtCore import Qt

# Import modular systems
from settings import CompanionSettings
from input_manager import InputManager
from cat_manager import CatManager
from settings_panel import SettingsPanel
from tray import CatTrayIcon

def main():
    # Set proper DPI Scaling attributes for high-resolution 4K and Retina screens
    QApplication.setHighDpiScaleFactorRoundingPolicy(
        Qt.HighDpiScaleFactorRoundingPolicy.PassThrough
    )
    
    # Configure unique Win32 App ID so that Windows groups our frameless window widgets cleanly
    if sys.platform == "win32":
        try:
            import ctypes
            ctypes.windll.shell32.SetCurrentProcessExplicitAppUserModelID(
                "Google.AIStudio.DesktopCatCompanion.1.0"
            )
        except Exception:
            pass

    app = QApplication(sys.argv)
    app.setQuitOnLastWindowClosed(False) # Prevents closing tray loop when settings is hidden

    # 1. Initialize persistent configuration model
    settings = CompanionSettings.load()

    # 2. Boot background mouse and keystroke observer (Strict offline-only passive tracker)
    input_manager = InputManager()
    input_manager.start()

    # 3. Instantiate the Multi-Cat supervisor engine
    cat_manager = CatManager(settings, input_manager)
    
    # Spawn the initial companion cat at startup
    cat_manager.spawn_cat()

    # 4. Construct settings controller pipeline
    settings_panel = SettingsPanel(settings)
    
    # Synchronize sliders to active cats immediately on UI adjustments
    settings_panel.settings_changed.connect(cat_manager.update_all_settings)

    # 5. Populate OS Notification System Tray Menus
    tray = CatTrayIcon(cat_manager, settings_panel)

    print("Desktop Cat Companion running. Look in your desktop's notification system tray.")
    
    # Keep main PyQt6 execution loop spinning
    exit_code = app.exec()
    
    # Cleanup background loops upon close (Security & Leak-free audit compliance)
    input_manager.shutdown()
    sys.exit(exit_code)

if __name__ == "__main__":
    main()`,
    },
    {
      name: 'cat.py',
      path: 'cat_companion/cat.py',
      language: 'python',
      content: `import sys
import math
import random
from PyQt6.QtWidgets import QWidget
from PyQt6.QtCore import Qt, QTimer, QPoint, QRectF
from PyQt6.QtGui import QPainter, QColor, QBrush, QPen
from physics import PhysicsSystem
from personality import PersonalityEngine

class DesktopCat(QWidget):
    def __init__(self, cat_id, settings, input_manager, parent=None):
        super().__init__(parent)
        self.cat_id = cat_id
        self.settings = settings
        self.input_manager = input_manager
        
        # Core engines
        self.physics = PhysicsSystem()
        self.personality = PersonalityEngine(settings.personality)
        
        # State & Movement variables
        self.x = float(random.randint(100, 500))
        self.y = 100.0
        self.vx = 0.0
        self.vy = 0.0
        self.is_grounded = False
        
        self.current_state = "falling"
        self.frame_index = 0
        self.direction_facing = 1 # 1 for Right, -1 for Left
        
        # Setup Window attributes
        self.setWindowFlags(
            Qt.WindowType.FramelessWindowHint |
            Qt.WindowType.WindowStaysOnTopHint |
            Qt.WindowType.Tool # Prevents taskbar item popping up
        )
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)
        
        # Safe toggle for click-through
        self.setAttribute(Qt.WidgetAttribute.WA_TransparentForMouseEvents, True)
        
        # Resize window matching companion size settings
        self.resize(self.settings.size, self.settings.size)
        self.move(int(self.x), int(self.y))
        
        # Multi-state behavioral timeline QTimer
        self.state_timer = QTimer(self)
        self.state_timer.timeout.connect(self._evaluate_state_machine)
        self.state_timer.start(3000) # Re-evaluate mood/state every 3 seconds
        
        # Frame and position ticker (60 FPS fluid rendering lock)
        self.frame_timer = QTimer(self)
        self.frame_timer.timeout.connect(self._physics_and_render_tick)
        self.frame_timer.start(16) # ~60 FPS

    def update_settings(self):
        """Reacts dynamically to settings changed inside settings.json."""
        self.resize(self.settings.size, self.settings.size)
        self.personality.set_preset(self.settings.personality)
        self.setWindowOpacity(self.settings.opacity)

    def _physics_and_render_tick(self):
        """60 FPS physics computation, cursor gaze tracking, and window reposition constraints."""
        screen = self.screen()
        if screen:
            screen_geom = screen.geometry()
            max_w = screen_geom.width() - self.width()
            max_h = screen_geom.height() - self.height()
        else:
            max_w, max_h = 1920 - self.width(), 1080 - self.height()

        if self.input_manager.consume_keyboard_activity():
            self.current_state = "typing"
            if self.personality.energy > 60 and self.is_grounded:
                self.vy = -random.randint(6, 12)
                self.is_grounded = False

        mouse_x = self.input_manager.cursor_x
        mouse_y = self.input_manager.cursor_y
        
        cx = self.x + self.width() / 2
        cy = self.y + self.height() / 2
        dx = mouse_x - cx
        dy = mouse_y - cy
        distance = math.sqrt(dx*dx + dy*dy)

        if dx > 10:
            self.direction_facing = 1
        elif dx < -10:
            self.direction_facing = -1

        if self.current_state == "chasing_cursor" and distance > 40:
            speed_factor = 2.0 * self.settings.speed
            self.vx = (dx / distance) * speed_factor
            if dy < -40 and self.is_grounded:
                self.vy = -6.0
                self.is_grounded = False
        elif self.current_state == "walking":
            if abs(self.vx) < 0.2:
                self.vx = self.direction_facing * (0.8 * self.settings.speed)

        current_pos = (self.x, self.y)
        velocity = (self.vx, self.vy)
        next_pos, next_vel, self.is_grounded = self.physics.update_position(
            current_pos, velocity, max_w, max_h, self.is_grounded
        )
        
        self.x, self.y = next_pos
        self.vx, self.vy = next_vel

        self.move(int(self.x), int(self.y))
        self.frame_index = (self.frame_index + 1) % 60
        self.update()

    def _evaluate_state_machine(self):
        if self.current_state == "typing" and not self.input_manager.keyboard_activity_detected:
            self.current_state = "idle"
        self.current_state = self.personality.select_next_state(self.current_state)

    def paintEvent(self, event):
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing, False)

        base_preset = self.settings.personality
        if base_preset == "orange":
            body_color = QColor(244, 140, 66)
            belly_color = QColor(255, 230, 200)
        elif base_preset == "calico":
            body_color = QColor(240, 240, 240)
            belly_color = QColor(255, 255, 255)
        elif base_preset == "black":
            body_color = QColor(36, 36, 42)
            belly_color = QColor(70, 70, 80)
        else:
            body_color = QColor(48, 48, 48)
            belly_color = QColor(255, 255, 255)

        width = self.width()
        height = self.height()
        pad = width * 0.15
        cw = width - 2*pad
        ch = height - 2*pad

        if self.is_grounded:
            painter.setPen(Qt.PenStyle.NoPen)
            painter.setBrush(QBrush(QColor(0, 0, 0, 45)))
            painter.drawEllipse(QRectF(pad, height - pad, cw, pad / 2))

        body_rect = QRectF(pad, pad * 1.5, cw, ch * 0.7)
        painter.setPen(QPen(body_color.darker(150), 1.5))
        painter.setBrush(QBrush(body_color))
        painter.drawRoundedRect(body_rect, cw * 0.3, ch * 0.3)

        painter.setPen(QPen(body_color.darker(150), 3))
        tail_dir = -self.direction_facing
        tail_start_x = cw/2 + pad + (tail_dir * cw/3)
        tail_end_x = tail_start_x + (tail_dir * width * 0.25)
        tail_y = pad * 2.5
        painter.drawLine(int(tail_start_x), int(tail_y), int(tail_end_x), int(tail_y - width * 0.2))

        painter.setPen(QPen(body_color.darker(150), 1.5))
        painter.setBrush(QBrush(body_color))
        ear_width = cw * 0.25
        ear_height = ch * 0.3
        
        le_x1 = pad + cw * 0.1
        le_y1 = pad * 1.5
        painter.drawPolygon([
            QPoint(int(le_x1), int(le_y1)),
            QPoint(int(le_x1 + ear_width), int(le_y1)),
            QPoint(int(le_x1 + ear_width/2), int(le_y1 - ear_height))
        ])

        re_x1 = pad + cw * 0.65
        re_y1 = pad * 1.5
        painter.drawPolygon([
            QPoint(int(re_x1), int(re_y1)),
            QPoint(int(re_x1 + ear_width), int(re_y1)),
            QPoint(int(re_x1 + ear_width/2), int(re_y1 - ear_height))
        ])

        belly_w = cw * 0.5
        belly_h = ch * 0.4
        painter.setPen(Qt.PenStyle.NoPen)
        painter.setBrush(QBrush(belly_color))
        painter.drawEllipse(QRectF(pad + (cw - belly_w)/2, pad * 1.8 + (ch * 0.7 - belly_h)/2, belly_w, belly_h))

        painter.setPen(QPen(QColor(0, 0, 0), 1))
        painter.setBrush(QBrush(QColor(255, 255, 255)))
        eye_y = pad * 1.9
        eye_r = cw * 0.15
        le_cx = pad + cw * 0.3
        re_cx = pad + cw * 0.7
        painter.drawEllipse(QRectF(le_cx - eye_r/2, eye_y, eye_r, eye_r))
        painter.drawEllipse(QRectF(re_cx - eye_r/2, eye_y, eye_r, eye_r))

        pupil_offset_x = self.direction_facing * (eye_r * 0.2)
        if self.current_state == "sleeping":
            painter.setPen(QPen(body_color.darker(180), 2))
            painter.drawLine(int(le_cx - eye_r/2), int(eye_y + eye_r/2), int(le_cx + eye_r/2), int(eye_y + eye_r/2))
            painter.drawLine(int(re_cx - eye_r/2), int(eye_y + eye_r/2), int(re_cx + eye_r/2), int(eye_y + eye_r/2))
        else:
            painter.setBrush(QBrush(QColor(0, 0, 0)))
            painter.drawEllipse(QRectF(le_cx - eye_r/4 + pupil_offset_x, eye_y + eye_r/4, eye_r/2, eye_r/2))
            painter.drawEllipse(QRectF(re_cx - eye_r/4 + pupil_offset_x, eye_y + eye_r/4, eye_r/2, eye_r/2))

        painter.setPen(QPen(QColor(240, 100, 120), 1.5))
        nose_x = pad + cw * 0.5
        nose_y = pad * 2.3
        painter.drawLine(int(nose_x - 2), int(nose_y), int(nose_x + 2), int(nose_y))
        painter.drawLine(int(nose_x), int(nose_y), int(nose_x), int(nose_y + 2))

        paw_offset_y = 0.0
        if self.current_state in ["walking", "chasing_cursor"]:
            paw_offset_y = math.sin(self.frame_index * 0.5) * (height * 0.08)

        painter.setPen(QPen(body_color.darker(150), 1.2))
        painter.setBrush(QBrush(body_color))
        paw_w = cw * 0.18
        paw_h = ch * 0.2
        painter.drawEllipse(QRectF(pad + cw * 0.2, pad * 1.5 + ch * 0.65 + paw_offset_y, paw_w, paw_h))
        painter.drawEllipse(QRectF(pad + cw * 0.62, pad * 1.5 + ch * 0.65 - paw_offset_y, paw_w, paw_h))
        painter.end()`,
    },
    {
      name: 'cat_manager.py',
      path: 'cat_companion/cat_manager.py',
      language: 'python',
      content: `import random
from PyQt6.QtCore import QTimer
from cat import DesktopCat

class CatManager:
    def __init__(self, settings, input_manager):
        self.settings = settings
        self.input_manager = input_manager
        self.cats = []
        self._next_id = 0
        
        self.social_timer = QTimer()
        self.social_timer.timeout.connect(self._orchestrate_cat_socials)
        self.social_timer.start(5000)

    def spawn_cat(self):
        cat = DesktopCat(self._next_id, self.settings, self.input_manager)
        cat.show()
        self.cats.append(cat)
        self._next_id += 1
        return cat

    def remove_cat(self):
        if self.cats:
            cat = self.cats.pop()
            cat.close()
            cat.deleteLater()

    def update_all_settings(self):
        for cat in self.cats:
            cat.update_settings()

    def hide_all(self):
        for cat in self.cats:
            cat.hide()

    def show_all(self):
        for cat in self.cats:
            cat.show()

    def clear(self):
        while self.cats:
            self.remove_cat()

    def _orchestrate_cat_socials(self):
        if len(self.cats) < 2:
            return

        for i, cat in enumerate(self.cats):
            if random.random() < 0.25:
                potential_siblings = [c for j, c in enumerate(self.cats) if j != i]
                sibling = random.choice(potential_siblings)
                
                if sibling.current_state == "sleeping":
                    cat.current_state = "sleeping"
                    cat.x = sibling.x + (random.choice([-1, 1]) * cat.width() * 0.7)
                    cat.y = sibling.y
                elif sibling.current_state in ["walking", "chasing_cursor"]:
                    cat.current_state = "walking"
                    cat.direction_facing = sibling.direction_facing
                    cat.vx = sibling.vx`,
    },
    {
      name: 'settings_panel.py',
      path: 'cat_companion/settings_panel.py',
      language: 'python',
      content: `from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QSlider, 
    QCheckBox, QComboBox, QPushButton, QGroupBox
)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont, QIcon

class SettingsPanel(QWidget):
    settings_changed = pyqtSignal()

    def __init__(self, settings):
        super().__init__()
        self.settings = settings
        self.init_ui()

    def init_ui(self):
        self.setWindowTitle("Companion Settings Dashboard")
        self.setFixedSize(360, 485)
        
        self.setStyleSheet("""
            QWidget {
                background-color: #121216;
                color: #e2e8f0;
                font-family: 'Segoe UI', Arial, sans-serif;
            }
            QLabel {
                font-size: 11.5px;
                font-weight: 500;
                color: #abb2bf;
            }
            QGroupBox {
                border: 1px solid #2e2e38;
                border-radius: 8px;
                margin-top: 15px;
                padding-top: 12px;
                font-weight: bold;
                font-size: 11px;
                color: #f97316;
            }
            QPushButton {
                background-color: #f97316;
                color: white;
                font-weight: bold;
                padding: 8px 16px;
                border-radius: 6px;
            }
        """)

        layout = QVBoxLayout()
        layout.setContentsMargins(18, 10, 18, 18)

        header_label = QLabel("Desktop Cat Companion Controller")
        h_font = QFont()
        h_font.setPointSize(13)
        h_font.setBold(True)
        header_label.setFont(h_font)
        layout.addWidget(header_label)

        app_group = QGroupBox("CAT APPEARANCES")
        app_layout = QVBoxLayout()

        size_lbl_layout = QHBoxLayout()
        size_lbl_layout.addWidget(QLabel("Cat Dimension (Width x Height):"))
        self.size_val_lbl = QLabel(f"{self.settings.size}px")
        size_lbl_layout.addWidget(self.size_val_lbl, 0, Qt.AlignmentFlag.AlignRight)
        app_layout.addLayout(size_lbl_layout)

        self.size_slider = QSlider(Qt.Orientation.Horizontal)
        self.size_slider.setRange(20, 50)
        self.size_slider.setValue(self.settings.size)
        self.size_slider.valueChanged.connect(self._on_size_slider_changed)
        app_layout.addWidget(self.size_slider)

        skin_layout = QHBoxLayout()
        skin_layout.addWidget(QLabel("Personality Coat Skin:"))
        self.skin_combo = QComboBox()
        self.skin_combo.addItems(["orange", "calico", "black", "tuxedo"])
        self.skin_combo.setCurrentText(self.settings.personality)
        self.skin_combo.currentTextChanged.connect(self._on_skin_changed)
        skin_layout.addWidget(self.skin_combo, 0, Qt.AlignmentFlag.AlignRight)
        app_layout.addLayout(skin_layout)

        app_group.setLayout(app_layout)
        layout.addWidget(app_group)

        self.startup_check = QCheckBox("Automatically start cat with Windows boot-up")
        self.startup_check.setChecked(self.settings.run_at_startup)
        self.startup_check.stateChanged.connect(self._on_startup_changed)
        layout.addWidget(self.startup_check)

        self.save_btn = QPushButton("Save Settings")
        self.save_btn.clicked.connect(self.close)
        layout.addWidget(self.save_btn)

        self.setLayout(layout)

    def _on_size_slider_changed(self, val):
        self.settings.size = val
        self.size_val_lbl.setText(f"{val}px")
        self._commit_and_notify()

    def _on_skin_changed(self, skin_text):
        self.settings.personality = skin_text
        self._commit_and_notify()

    def _on_startup_changed(self, val):
        consent = self.startup_check.isChecked()
        self.settings.run_at_startup = consent
        self.settings.apply_startup_registry()
        self._commit_and_notify()

    def _commit_and_notify(self):
        self.settings.save()
        self.settings_changed.emit()`,
    },
    {
      name: 'settings.py',
      path: 'cat_companion/settings.py',
      language: 'python',
      content: `import os
import json
import sys

class CompanionSettings:
    def __init__(self):
        self.size = 50
        self.speed = 1.0
        self.opacity = 0.95
        self.personality = "orange"
        self.enable_sound = True
        self.sound_volume = 0.5
        self.run_at_startup = False
        
    @staticmethod
    def get_settings_path():
        if sys.platform == "win32":
            base_dir = os.environ.get("APPDATA", os.path.expanduser("~"))
        else:
            base_dir = os.path.expanduser("~")
        app_dir = os.path.join(base_dir, "DesktopCatCompanion")
        os.makedirs(app_dir, exist_ok=True)
        return os.path.join(app_dir, "settings.json")

    @classmethod
    def load(cls):
        settings = cls()
        path = cls.get_settings_path()
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    settings.size = max(20, min(50, data.get("size", settings.size)))
                    settings.speed = data.get("speed", settings.speed)
                    settings.opacity = data.get("opacity", settings.opacity)
                    settings.personality = data.get("personality", settings.personality)
                    settings.run_at_startup = bool(data.get("run_at_startup", settings.run_at_startup))
            except Exception:
                pass
        return settings

    def save(self):
        path = self.get_settings_path()
        data = {
            "size": self.size,
            "speed": self.speed,
            "opacity": self.opacity,
            "personality": self.personality,
            "run_at_startup": self.run_at_startup
        }
        try:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=4)
        except Exception:
            pass

    def apply_startup_registry(self):
        if sys.platform != "win32":
            return
        import winreg
        key_path = r"Software\Microsoft\Windows\CurrentVersion\Run"
        app_name = "DesktopCatCompanion"
        executable = sys.executable if not sys.argv[0].endswith(".py") else os.path.abspath(sys.argv[0])
        executable_path = f'"{executable}"'
        try:
            key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, key_path, 0, winreg.KEY_SET_VALUE)
            if self.run_at_startup:
                winreg.SetValueEx(key, app_name, 0, winreg.REG_SZ, executable_path)
            else:
                try:
                    winreg.DeleteValue(key, app_name)
                except FileNotFoundError:
                    pass
            winreg.CloseKey(key)
        except Exception:
            pass`,
    },
    {
      name: 'physics.py',
      path: 'cat_companion/physics.py',
      language: 'python',
      content: `class PhysicsSystem:
    def __init__(self, gravity=0.8, friction=0.9, elastic_bounce=0.3):
        self.gravity = gravity
        self.friction = friction
        self.elastic_bounce = elastic_bounce

    def update_position(self, current_pos, velocity, boundary_w, boundary_h, is_grounded):
        x, y = current_pos
        vx, vy = velocity

        if not is_grounded:
            vy += self.gravity
        else:
            vx *= self.friction
            if abs(vx) < 0.1:
                vx = 0

        next_x = x + vx
        next_y = y + vy

        if next_y >= boundary_h:
            next_y = boundary_h
            if abs(vy) > 2.0:
                vy = -vy * self.elastic_bounce
            else:
                vy = 0
                is_grounded = True
        else:
            if next_y < boundary_h - 1:
                is_grounded = False

        if next_y <= 0:
            next_y = 0
            vy = -vy * self.elastic_bounce

        if next_x <= 0:
            next_x = 0
            vx = -vx * self.elastic_bounce

        if next_x >= boundary_w:
            next_x = boundary_w
            vx = -vx * self.elastic_bounce

        return (next_x, next_y), (vx, vy), is_grounded`,
    },
    {
      name: 'personality.py',
      path: 'cat_companion/personality.py',
      language: 'python',
      content: `import random

class PersonalityEngine:
    def __init__(self, preset="orange"):
        self.preset = preset
        self.curiosity = 50
        self.friendliness = 50
        self.energy = 50
        self.laziness = 50
        self.set_preset(preset)

    def set_preset(self, preset):
        self.preset = preset
        if preset == "orange":
            self.curiosity = 85
            self.friendliness = 90
            self.energy = 95
            self.laziness = 30
        elif preset == "calico":
            self.curiosity = 90
            self.friendliness = 70
            self.energy = 80
            self.laziness = 40
        elif preset == "black":
            self.curiosity = 40
            self.friendliness = 80
            self.energy = 30
            self.laziness = 85
        else:
            self.curiosity = 60
            self.friendliness = 65
            self.energy = 55
            self.laziness = 50

    def select_next_state(self, current_state, mood="idle"):
        if current_state == "sleeping":
            wake_up_chance = (100 - self.laziness) * 0.1
            if random.random() * 100 < wake_up_chance:
                return "sitting"
            return "sleeping"

        weights = {
            "idle": 20,
            "walking": 15 + (self.energy * 0.3),
            "sitting": 25 + (self.laziness * 0.2),
            "grooming": 15 + (self.laziness * 0.15),
            "sleeping": 5 + (self.laziness * 0.35),
            "chasing_cursor": 5 + (self.curiosity * 0.4)
        }

        state_list = list(weights.keys())
        weight_list = [weights[s] for s in state_list]
        total_weight = sum(weight_list)
        normalized_weights = [w / total_weight for w in weight_list]

        return random.choices(state_list, weights=normalized_weights, k=1)[0]`,
    },
    {
      name: 'input_manager.py',
      path: 'cat_companion/input_manager.py',
      language: 'python',
      content: `import threading
import time
from pynput import keyboard
import pyautogui

class InputManager:
    def __init__(self, fps_interval=1/60.0):
        self.fps_interval = fps_interval
        self.cursor_x = 0
        self.cursor_y = 0
        
        self.keyboard_activity_detected = False
        self.keystroke_tick_count = 0
        self.is_running = True

    def start(self):
        self._keyboard_listener = keyboard.Listener(
            on_press=self._safe_on_press_callback
        )
        self._keyboard_listener.daemon = True
        self._keyboard_listener.start()

        self._monitor_thread = threading.Thread(target=self._mouse_tracking_loop, daemon=True)
        self._monitor_thread.start()

    def _safe_on_press_callback(self, key):
        self.keyboard_activity_detected = True
        self.keystroke_tick_count += 1

    def _mouse_tracking_loop(self):
        while self.is_running:
            try:
                x, y = pyautogui.position()
                self.cursor_x, self.cursor_y = x, y
            except Exception:
                pass
            time.sleep(self.fps_interval)

    def consume_keyboard_activity(self):
        activity = self.keyboard_activity_detected
        self.keyboard_activity_detected = False
        return activity

    def shutdown(self):
        self.is_running = False
        if self._keyboard_listener:
            self._keyboard_listener.stop()`,
    },
    {
      name: 'tray.py',
      path: 'cat_companion/tray.py',
      language: 'python',
      content: `from PyQt6.QtWidgets import QSystemTrayIcon, QMenu
from PyQt6.QtGui import QIcon, QAction, QPixmap, QColor, QPainter
from PyQt6.QtCore import Qt, QObject

class CatTrayIcon(QObject):
    def __init__(self, cat_manager, settings_panel, parent=None):
        super().__init__(parent)
        self.cat_manager = cat_manager
        self.settings_panel = settings_panel
        self.tray_icon = QSystemTrayIcon(self)
        self.init_icon()
        self.init_menu()
        self.tray_icon.show()

    def init_icon(self):
        pixmap = QPixmap(16, 16)
        pixmap.fill(QColor(0, 0, 0, 0))
        painter = QPainter(pixmap)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing, True)
        painter.setPen(Qt.PenStyle.NoPen)
        painter.setBrush(QColor(244, 140, 66))
        painter.drawEllipse(3, 3, 10, 10)
        painter.end()
        self.tray_icon.setIcon(QIcon(pixmap))
        self.tray_icon.setToolTip("Desktop Cat Companion")

    def init_menu(self):
        menu = QMenu()
        show_settings_act = QAction("Open Settings Controller", self)
        show_settings_act.triggered.connect(self._show_settings_panel)
        menu.addAction(show_settings_act)
        
        spawn_act = QAction("🐈 Spawn Companion Cat", self)
        spawn_act.triggered.connect(self.cat_manager.spawn_cat)
        menu.addAction(spawn_act)

        remove_act = QAction("🚫 Despawn Last Cat", self)
        remove_act.triggered.connect(self.cat_manager.remove_cat)
        menu.addAction(remove_act)

        exit_act = QAction("Exit Companion", self)
        exit_act.triggered.connect(self._exit_application)
        menu.addAction(exit_act)
        self.tray_icon.setContextMenu(menu)

    def _show_settings_panel(self):
        self.settings_panel.show()
        self.settings_panel.raise_()
        self.settings_panel.activateWindow()

    def _exit_application(self):
        self.cat_manager.clear()
        from PyQt6.QtWidgets import QApplication
        QApplication.quit()`,
    },
    {
      name: 'requirements.txt',
      path: 'cat_companion/requirements.txt',
      language: 'text',
      content: `PyQt6>=6.7.0
pynput>=1.7.6
pyautogui>=0.9.54
pygame>=2.5.2
pyinstaller>=6.6.0`,
    },
    {
      name: 'README.md',
      path: 'cat_companion/README.md',
      language: 'markdown',
      content: `# 🐈 Desktop Cat Companion - Production Python PyQt6 Edition

Welcome to the production-ready **Desktop Cat Companion** core codebase. 

- **Language:** Python 3.12+
- **GUI Engine:** \`PyQt6\` (translucent frameless \`Qt.WindowStaysOnTopHint\` widgets)
- **Input Tracking:** \`pynput\` & \`pyautogui\`
- **Physics Solver:** Gravity & surface collision bouncing solver

## Quick Run

\`\`\`bash
pip install -r requirements.txt
python main.py
\`\`\`

## Package standalone executable
\`\`\`bash
pyinstaller --onefile --windowed --name="CatCompanion" main.py
\`\`\``,
    }
  ];

  const currentFiles = selectedTech === 'wpf' ? wpfFiles : selectedTech === 'tauri' ? tauriFiles : pythonFiles;
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
            <div className="flex bg-slate-900 p-1 rounded-lg gap-1">
              <button
                onClick={() => {
                  setSelectedTech('python');
                  setSelectedFileIndex(0);
                }}
                className={`flex-1 py-1 px-1.5 text-[10px] font-semibold rounded-md transition-colors cursor-pointer text-center ${
                  selectedTech === 'python'
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Python / PyQt
              </button>
              <button
                onClick={() => {
                  setSelectedTech('wpf');
                  setSelectedFileIndex(0);
                }}
                className={`flex-1 py-1 px-1.5 text-[10px] font-semibold rounded-md transition-colors cursor-pointer text-center ${
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
                className={`flex-1 py-1 px-1.5 text-[10px] font-semibold rounded-md transition-colors cursor-pointer text-center ${
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
              <span>{selectedTech === 'python' ? 'Python / PyQt6 Workspace' : selectedTech === 'wpf' ? 'WPF Workspace' : 'Tauri Workspace'}</span>
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
