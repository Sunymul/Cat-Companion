# 🐈 Desktop Cat Companion - Production Python PyQt6 Edition

Welcome to the production-ready **Desktop Cat Companion** core codebase. This is a fully local, ultra-efficient desktop companion written in Python using a native unmanaged-free **PyQt6** window architecture.

It lives directly on top of your physical Windows environment (overplaying active applications, games, and web pages), tracks your cursor movements dynamically, and reacts to typing activity with zero administrative rights required.

---

## 🛠️ Tech Stack & Architecture

- **Language:** Python 3.12+
- **GUI Engine:** `PyQt6` (translucent frameless `Qt.WindowStaysOnTopHint` widgets)
- **Input Tracking:** `pynput` (low-level keystroke telemetry) & `pyautogui` (cursor position coordinates)
- **Physics Solver:** Lightweight 2D Euler integrator supporting gravity, screen collisions, bounce coefficients, and surface friction
- **Configuration Storage:** JSON serialization persisted safely in `%APPDATA%/DesktopCatCompanion/settings.json`
- **Asset Fallback:** Dynamic vector drawing utilizing standard `QPainter` paths in case external sprite images are absent (bulletproof crash resilience!)

---

## 🔒 Security Audit & Privacy Compliance

This code was engineered in accordance with the **Pre-Release Security Audit Checklist** to ensure strict safety:

1. **100% Offline Operation:** No sockets, HTTP fetch, WebSocket, or analytics integrations. Absolutely zero data leaves your local machine.
2. **True Event-Based Keystroke Passivity:** The `InputManager` counts typing frequency and alerts the state machine to trigger paw tapping. It **never** stores, records, copies, or translates the characters pressed. Your passwords and credentials remain fully secure.
3. **No Elevation Required:** Runs fully within the User space. Zero administrative requirements or UAC prompts.
4. **No Dynamic Execution:** Contains zero usage of `eval()`, `exec()`, or dynamic runtime script interpretation.

---

## 🚀 Fast Installation & Running

### 1. Install Dependencies
Ensure you have Python 3.12+ installed. Run the standard pip command to load required packages:

```bash
pip install -r requirements.txt
```

### 2. Run the Application
Launch the companion core application:

```bash
python main.py
```

*Look closely at your system's notification taskbar tray! Double-click the orange cat icon to toggle the Settings Dashboard.*

---

## 📦 Packaging into a Standalone `.exe`

To compile this Python codebase into a single compact, high-performance Windows executable (`CatCompanion.exe`) containing all assemblies built-in, use **PyInstaller**:

```bash
pyinstaller --onefile --windowed --name="CatCompanion" main.py
```

Upon completion, your standalone release binary will be available inside the generated `dist/` directory:
- 📁 `dist/CatCompanion.exe` (Ready for distribution!)
