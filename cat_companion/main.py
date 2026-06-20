import sys
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
    main()
