import threading
import time
from pynput import keyboard
import pyautogui

class InputManager:
    def __init__(self, fps_interval=1/60.0):
        self.fps_interval = fps_interval
        self.cursor_x = 0
        self.cursor_y = 0
        self.prev_cursor_x = 0
        self.prev_cursor_y = 0
        self.cursor_speed_x = 0
        self.cursor_speed_y = 0
        
        # Keystroke monitoring parameters (Strict security guidelines applied)
        self.keyboard_activity_detected = False
        self.keystroke_tick_count = 0
        self._last_keystroke_timestamp = 0.0
        
        self.is_running = True
        self._monitor_thread = None
        self._keyboard_listener = None

    def start(self):
        """Launches security-safe background observers for global keystrokes and mouse positioning."""
        # Setup and start keyboard listener cleanly using pynput
        self._keyboard_listener = keyboard.Listener(
            on_press=self._safe_on_press_callback,
            on_release=None
        )
        self._keyboard_listener.daemon = True
        self._keyboard_listener.start()

        # Start mouse frame loop tracker thread
        self._monitor_thread = threading.Thread(target=self._mouse_tracking_loop, daemon=True)
        self._monitor_thread.start()

    def _safe_on_press_callback(self, key):
        """Strict lock hook callback. Tracks typing activity without storing pressed characters."""
        self.keyboard_activity_detected = True
        self.keystroke_tick_count += 1
        self._last_keystroke_timestamp = time.time()

    def _mouse_tracking_loop(self):
        """Standard polling loop tracking mouse coordinates, velocity vector, and idle state."""
        while self.is_running:
            try:
                x, y = pyautogui.position()
                self.cursor_x, self.cursor_y = x, y
                
                # Check delta changes for hover velocity direction
                self.cursor_speed_x = x - self.prev_cursor_x
                self.cursor_speed_y = y - self.prev_cursor_y
                
                self.prev_cursor_x, self.prev_cursor_y = x, y
            except Exception:
                # Shield thread crash from OS-level permission drops
                pass
            time.sleep(self.fps_interval)

    def consume_keyboard_activity(self):
        """Returns and resets keyboard typing activity flag."""
        activity = self.keyboard_activity_detected
        self.keyboard_activity_detected = False
        return activity

    def shutdown(self):
        """Safely stops active listeners and cleanups background threads."""
        self.is_running = False
        if self._keyboard_listener:
            try:
                self._keyboard_listener.stop()
            except Exception:
                pass
