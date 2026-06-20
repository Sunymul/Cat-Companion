import random

class PersonalityEngine:
    def __init__(self, preset="orange"):
        self.preset = preset
        # Initialize default traits (0 - 100)
        self.curiosity = 50
        self.friendliness = 50
        self.energy = 50
        self.laziness = 50
        
        self.set_preset(preset)

    def set_preset(self, preset):
        self.preset = preset
        if preset == "orange": # Hyper & Friendly, a bit of a chaotic orange cat
            self.curiosity = 85
            self.friendliness = 90
            self.energy = 95
            self.laziness = 30
        elif preset == "calico": # Curious, extremely playful
            self.curiosity = 90
            self.friendliness = 70
            self.energy = 80
            self.laziness = 40
        elif preset == "black": # Chill, lazy, friendly
            self.curiosity = 40
            self.friendliness = 80
            self.energy = 30
            self.laziness = 85
        elif preset == "tuxedo": # Smart, medium-curious, classy
            self.curiosity = 60
            self.friendliness = 65
            self.energy = 55
            self.laziness = 50
        else: # Default
            self.curiosity = 50
            self.friendliness = 50
            self.energy = 50
            self.laziness = 50

    def select_next_state(self, current_state, mood="idle"):
        """Determines the next state transition using weighted probabilities based on cat personality traits."""
        if current_state == "sleeping":
            # Sleep states are hard to wake up from if lazy
            wake_up_chance = (100 - self.laziness) * 0.1 # Max 10% chance per tick to wake up
            if random.random() * 100 < wake_up_chance:
                return "sitting"
            return "sleeping"

        # Calculate base choices
        choices = ["idle", "walking", "sitting", "grooming", "sleeping", "chasing_cursor"]
        
        # Calculate dynamic weights based on personality attributes
        weights = {
            "idle": 20,
            "walking": 15 + (self.energy * 0.3),
            "sitting": 25 + (self.laziness * 0.2),
            "grooming": 15 + (self.laziness * 0.15),
            "sleeping": 5 + (self.laziness * 0.35),
            "chasing_cursor": 5 + (self.curiosity * 0.4)
        }

        # Normalize and select
        state_list = list(weights.keys())
        weight_list = [weights[s] for s in state_list]
        total_weight = sum(weight_list)
        normalized_weights = [w / total_weight for w in weight_list]

        next_state = random.choices(state_list, weights=normalized_weights, k=1)[0]
        return next_state
