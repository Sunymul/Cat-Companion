import os
import json
import sys

class CompanionSettings:
    def __init__(self):
        # Default choices matching high-quality defaults
        self.size = 50                 # 20px - 50px
        self.speed = 1.0               # 0.5 - 2.5
        self.opacity = 0.95            # 0.2 - 1.0
        self.personality = "orange"    # "orange", "calico", "black", "tuxedo"
        self.enable_sound = True
        self.sound_volume = 0.5
        self.run_at_startup = False
        
    @staticmethod
    def get_settings_path():
        """Gets a user-accessible secure directory path to store settings.json."""
        if sys.platform == "win32":
            base_dir = os.environ.get("APPDATA", os.path.expanduser("~"))
        else:
            base_dir = os.path.expanduser("~")
            
        app_dir = os.path.join(base_dir, "DesktopCatCompanion")
        try:
            os.makedirs(app_dir, exist_ok=True)
        except Exception:
            pass
        return os.path.join(app_dir, "settings.json")

    @classmethod
    def load(cls):
        """Loads companion configuration from settings.json."""
        settings = cls()
        path = cls.get_settings_path()
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    settings.size = max(20, min(50, data.get("size", settings.size)))
                    settings.speed = max(0.5, min(2.5, data.get("speed", settings.speed)))
                    settings.opacity = max(0.2, min(1.0, data.get("opacity", settings.opacity)))
                    settings.personality = data.get("personality", settings.personality)
                    settings.enable_sound = bool(data.get("enable_sound", settings.enable_sound))
                    settings.sound_volume = max(0.0, min(1.0, data.get("sound_volume", settings.sound_volume)))
                    settings.run_at_startup = bool(data.get("run_at_startup", settings.run_at_startup))
            except Exception:
                # Fallback to defaults on file corruption (Security & Resilience Guideline)
                pass
        return settings

    def save(self):
        """Saves current companion configuration securely to settings.json."""
        path = self.get_settings_path()
        data = {
            "size": self.size,
            "speed": self.speed,
            "opacity": self.opacity,
            "personality": self.personality,
            "enable_sound": self.enable_sound,
            "sound_volume": self.sound_volume,
            "run_at_startup": self.run_at_startup
        }
        try:
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=4)
        except Exception:
            pass

    def apply_startup_registry(self):
        """Registers the companion in the Windows Registry for startup with explicit consent."""
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
            pass
