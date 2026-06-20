import random
from PyQt6.QtCore import QTimer, QPoint
from cat import DesktopCat

class CatManager:
    def __init__(self, settings, input_manager):
        self.settings = settings
        self.input_manager = input_manager
        self.cats = []
        self._next_id = 0
        
        # Inter-cat social timer (runs every 5 seconds to match playful behaviors)
        self.social_timer = QTimer()
        self.social_timer.timeout.connect(self._orchestrate_cat_socials)
        self.social_timer.start(5000)

    def spawn_cat(self):
        """Creates and initializes a new frameless transparent Cat widget window."""
        cat = DesktopCat(self._next_id, self.settings, self.input_manager)
        cat.show() # Make window visible
        self.cats.append(cat)
        self._next_id += 1
        return cat

    def remove_cat(self):
        """Safely terminates and removes the most recently spawned cat companion."""
        if self.cats:
            cat = self.cats.pop()
            cat.close()
            cat.deleteLater()

    def update_all_settings(self):
        """Dispatches settings update commands to all active cats."""
        for cat in self.cats:
            cat.update_settings()

    def hide_all(self):
        """Hides every cat window."""
        for cat in self.cats:
            cat.hide()

    def show_all(self):
        """Shows every cat window."""
        for cat in self.cats:
            cat.show()

    def clear(self):
        """Removes all cats on termination."""
        while self.cats:
            self.remove_cat()

    def _orchestrate_cat_socials(self):
        """Orchestrates social interactions between cats so they sleep, follow, or play together."""
        if len(self.cats) < 2:
            return

        for i, cat in enumerate(self.cats):
            # 20% chance to follow or interact with a sibling cat
            if random.random() < 0.25:
                potential_siblings = [c for j, c in enumerate(self.cats) if j != i]
                sibling = random.choice(potential_siblings)
                
                # Align moods or states
                if sibling.current_state == "sleeping":
                    # Lazy sleep together behavior
                    cat.current_state = "sleeping"
                    cat.x = sibling.x + (random.choice([-1, 1]) * cat.width() * 0.7)
                    cat.y = sibling.y
                elif sibling.current_state in ["walking", "chasing_cursor"]:
                    # Playful follow-the-leader behavior
                    cat.current_state = "walking"
                    cat.direction_facing = sibling.direction_facing
                    cat.vx = sibling.vx

    def pet_all(self):
        """Dispatches petting triggers to all active cats."""
        for cat in self.cats:
            cat.pet_cat()

    def feed_all(self):
        """Dispatches feeding triggers to all active cats."""
        for cat in self.cats:
            cat.feed_cat()

