import os
import json
import random
import sys

class PersonalityEngine:
    def __init__(self, preset="orange"):
        self.preset = preset
        
        # Core Progressive Traits (0 to 100)
        self.affection = 30
        self.shyness = 30
        self.laziness = 30
        self.hunting_drive = 30
        
        # Interaction counters (grows over time)
        self.pet_count = 0
        self.feed_count = 0
        self.keystroke_hits = 0
        self.ticks_active = 0
        
        # Current dominant personality archetype
        self.dominant_trait = "balanced" # "shy", "attention_seeker", "lazy", "hunter", "balanced"
        
        self.set_preset(preset)
        self.load_growth_data()

    def set_preset(self, preset):
        self.preset = preset
        if preset == "orange": # Lively, playful & affectionate
            self.affection = 65
            self.shyness = 15
            self.laziness = 35
            self.hunting_drive = 75
        elif preset == "calico": # Highly curious, nimble hunter
            self.affection = 45
            self.shyness = 20
            self.laziness = 25
            self.hunting_drive = 85
        elif preset == "black": # Chill, sweet & lazy
            self.affection = 70
            self.shyness = 25
            self.laziness = 75
            self.hunting_drive = 30
        elif preset == "tuxedo": # Smart, elegant & slightly shy
            self.affection = 40
            self.shyness = 65
            self.laziness = 40
            self.hunting_drive = 45
        else: # custom or custom custom
            self.affection = 50
            self.shyness = 30
            self.laziness = 40
            self.hunting_drive = 50
        self.recalculate_archetype()

    def get_save_dir(self):
        """Builds proper AppData path directory target."""
        if sys.platform == "win32":
            base_dir = os.environ.get("APPDATA", os.path.expanduser("~"))
        else:
            base_dir = os.path.expanduser("~")
        return os.path.join(base_dir, "DesktopCatCompanion")

    def load_growth_data(self):
        """Loads developed traits and counters from personality_development.json."""
        path = os.path.join(self.get_save_dir(), "personality_development.json")
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.affection = max(0, min(100, data.get("affection", self.affection)))
                    self.shyness = max(0, min(100, data.get("shyness", self.shyness)))
                    self.laziness = max(0, min(100, data.get("laziness", self.laziness)))
                    self.hunting_drive = max(0, min(100, data.get("hunting_drive", self.hunting_drive)))
                    self.pet_count = data.get("pet_count", self.pet_count)
                    self.feed_count = data.get("feed_count", self.feed_count)
                    self.keystroke_hits = data.get("keystroke_hits", self.keystroke_hits)
                    self.ticks_active = data.get("ticks_active", self.ticks_active)
                self.recalculate_archetype()
            except Exception:
                pass

    def save_growth_data(self):
        """Saves current dynamic traits to personality_development.json."""
        path = os.path.join(self.get_save_dir(), "personality_development.json")
        data = {
            "affection": self.affection,
            "shyness": self.shyness,
            "laziness": self.laziness,
            "hunting_drive": self.hunting_drive,
            "pet_count": self.pet_count,
            "feed_count": self.feed_count,
            "keystroke_hits": self.keystroke_hits,
            "ticks_active": self.ticks_active,
            "dominant_trait": self.dominant_trait
        }
        try:
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=4)
        except Exception:
            pass

    def record_interaction(self, action_type):
        """Integrates actions and modifies multipliers to grow personality traits over time."""
        if action_type == "pet":
            self.pet_count += 1
            self.affection = min(100, self.affection + 2.5)
            self.shyness = max(0, self.shyness - 1.5)
            self.laziness = min(100, self.laziness + 0.2)
        elif action_type == "feed":
            self.feed_count += 1
            self.affection = min(100, self.affection + 3.0)
            self.laziness = min(100, self.laziness + 1.5)
            self.hunting_drive = max(0, self.hunting_drive - 0.5)
        elif action_type == "keystroke":
            self.keystroke_hits += 1
            if self.keystroke_hits % 20 == 0:
                self.hunting_drive = min(100, self.hunting_drive + 0.8)
                self.laziness = max(0, self.laziness - 0.5)
        elif action_type == "tick":
            self.ticks_active += 1
            # Passive development based on environment tracking activity
            if self.ticks_active % 100 == 0:
                if random.random() < 0.3:
                    self.shyness = min(100, self.shyness + 1.0)
                else:
                    self.laziness = min(100, self.laziness + 0.5)

        self.recalculate_archetype()
        if random.random() < 0.1:  # Debounce saving frequency
            self.save_growth_data()

    def recalculate_archetype(self):
        """Resolves current state variables into the primary dominant psychological profile."""
        traits = {
            "shy": self.shyness,
            "attention_seeker": self.affection,
            "lazy": self.laziness,
            "hunter": self.hunting_drive
        }
        
        # Max Trait checks
        max_trait = max(traits, key=traits.get)
        if traits[max_trait] >= 60:
            self.dominant_trait = max_trait
        else:
            self.dominant_trait = "balanced"

    def select_next_state(self, current_state):
        """Weighs and triggers future behavior states depending on the dominant archetype."""
        if current_state == "sleeping":
            # Lazy cat takes much longer to wake up
            base_chance = 12 if self.dominant_trait == "lazy" else 25
            if random.randint(1, 100) < base_chance:
                return "sitting"
            return "sleeping"

        # General choices
        state_choices = ["idle", "walking", "sitting", "grooming", "sleeping", "chasing_cursor"]

        # Base probabilities
        weights = {
            "idle": 20,
            "walking": 20,
            "sitting": 20,
            "grooming": 15,
            "sleeping": 10,
            "chasing_cursor": 15
        }

        # Apply progressive multipliers reflecting developed personality
        if self.dominant_trait == "lazy":
            weights["sleeping"] += 35
            weights["sitting"] += 25
            weights["walking"] -= 10
            weights["chasing_cursor"] -= 10
        elif self.dominant_trait == "shy":
            weights["sitting"] += 30
            weights["chasing_cursor"] -= 12
            weights["walking"] += 15
        elif self.dominant_trait == "attention_seeker":
            weights["chasing_cursor"] += 45
            weights["idle"] -= 10
            weights["sleeping"] -= 5
        elif self.dominant_trait == "hunter":
            weights["chasing_cursor"] += 35
            weights["walking"] += 25
            weights["sleeping"] -= 7

        # Clip values to ensure non-negative weights
        for k in weights:
            weights[k] = max(1, weights[k])

        states = list(weights.keys())
        w_list = [weights[s] for s in states]
        total = sum(w_list)
        norm_w = [w / total for w in w_list]

        return random.choices(states, weights=norm_w, k=1)[0]
