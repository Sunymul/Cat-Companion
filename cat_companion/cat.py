import sys
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

        # Speech bubble
        self.current_bubble_text = None
        self.bubble_timer = QTimer(self)
        self.bubble_timer.setSingleShot(True)
        self.bubble_timer.timeout.connect(self._clear_bubble)

        # Virtual bug chasing for Hunters
        self.bug_target = None
        
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

    def show_message(self, text):
        self.current_bubble_text = text
        self.bubble_timer.start(2800)
        self.update()

    def _clear_bubble(self):
        self.current_bubble_text = None
        self.update()

    def pet_cat(self):
        self.personality.record_interaction("pet")
        self.current_state = "excited"
        self.show_message(random.choice(["Purrr... ❤️", "Miaow! *nuzzle*", "Happy companion!"]))
        self.update()

    def feed_cat(self):
        self.personality.record_interaction("feed")
        self.current_state = "excited"
        self.show_message(random.choice(["OM NOM NOM! 🐟", "Yummy fish!", "Yummm~"]))
        self.update()

    def _physics_and_render_tick(self):
        """60 FPS physics computation, cursor gaze tracking, and window reposition constraints."""
        # Get active primary screen dimensions
        screen = self.screen()
        if screen:
            screen_geom = screen.geometry()
            max_w = screen_geom.width() - self.width()
            max_h = screen_geom.height() - self.height()
        else:
            max_w, max_h = 1920 - self.width(), 1080 - self.height()

        # Check for keyboard typing state activation
        if self.input_manager.consume_keyboard_activity():
            self.current_state = "typing"
            self.personality.record_interaction("keystroke")
            # Jump on key-hits if energetic
            is_high_energy = self.personality.dominant_trait == "hunter" or self.settings.personality == "orange"
            if is_high_energy and self.is_grounded:
                self.vy = -random.randint(6, 12)
                self.is_grounded = False

        # Look/chase behavior logic
        mouse_x = self.input_manager.cursor_x
        mouse_y = self.input_manager.cursor_y
        
        cx = self.x + self.width() / 2
        cy = self.y + self.height() / 2
        dx = mouse_x - cx
        dy = mouse_y - cy
        distance = math.sqrt(dx*dx + dy*dy)

        # Record passive time ticks
        if self.frame_index == 0:
            self.personality.record_interaction("tick")

        # Set face directions based on cursor orientation
        if dx > 10:
            self.direction_facing = 1
        elif dx < -10:
            self.direction_facing = -1

        # Determine personality dynamics
        dominant = self.personality.dominant_trait
        speed_modifier = 0.55 if dominant == "lazy" else (1.35 if dominant == "hunter" else 1.0)
        base_speed = 2.0 * self.settings.speed * speed_modifier

        # Special personality traits: Fleeing / Bug chasing checks
        shy_fleeing = False
        bug_chasing = False

        if dominant == "shy" and distance < 160 and distance > 5:
            shy_fleeing = True
            # Move in opposite direction of mouse
            self.current_state = "walking"
            self.vx = -(dx / distance) * base_speed * 1.5
            if self.is_grounded and dy > 10:
                self.vy = -4.0
                self.is_grounded = False
            if random.random() < 0.05:
                self.show_message(random.choice(["*hides*", "Nervous...", "Don't look... >////<"]))

        elif dominant == "attention_seeker" and distance > 160 and random.random() < 0.015 and self.current_state != "chasing_cursor":
            self.current_state = "chasing_cursor"
            if random.random() < 0.05:
                self.show_message(random.choice(["Watch me! ✨", "Follow you! ❤️", "Meow!"]))

        elif dominant == "hunter" and not (self.current_state == "chasing_cursor" and distance < 350):
            if not self.bug_target:
                if random.random() < 0.006:
                    self.bug_target = QPoint(random.randint(50, max_w), random.randint(50, max_h))
                    self.show_message("Got a bug! 🐞")
            else:
                bx = self.bug_target.x() - cx
                by = self.bug_target.y() - cy
                b_dist = math.sqrt(bx*bx + by*by)
                if b_dist > 25:
                    bug_chasing = True
                    self.vx = (bx / b_dist) * base_speed * 1.5
                    if by < -30 and self.is_grounded:
                        self.vy = -6.0
                        self.is_grounded = False
                else:
                    self.bug_target = None
                    self.vx = 0
                    self.current_state = "excited"
                    self.show_message("Got it! 🦟")

        # Core movement resolution matching active states
        if not shy_fleeing and not bug_chasing:
            if self.current_state == "chasing_cursor" and distance > 40:
                self.vx = (dx / distance) * base_speed
                if dy < -40 and self.is_grounded:
                    self.vy = -6.0 # Jump to catch cursor
                    self.is_grounded = False
            elif self.current_state == "walking":
                # Idle wanderings
                if abs(self.vx) < 0.2:
                    self.vx = self.direction_facing * (0.8 * self.settings.speed * speed_modifier)
            elif self.current_state in ["sleeping", "sitting", "grooming", "idle"]:
                # Slide to stop on inactive states
                pass

        # Parse physical position changes through standard solver
        current_pos = (self.x, self.y)
        velocity = (self.vx, self.vy)
        next_pos, next_vel, self.is_grounded = self.physics.update_position(
            current_pos, velocity, max_w, max_h, self.is_grounded
        )
        
        self.x, self.y = next_pos
        self.vx, self.vy = next_vel

        # Synchronize PyQt widget window visual on physical coordinates
        self.move(int(self.x), int(self.y))
        
        # Trigger incremental redraw callback
        self.frame_index = (self.frame_index + 1) % 60
        self.update()

    def _evaluate_state_machine(self):
        """Periodic weighted state flow selector matching cat personalities."""
        if self.current_state == "typing" and not self.input_manager.keyboard_activity_detected:
            self.current_state = "idle"
            
        self.current_state = self.personality.select_next_state(
            self.current_state
        )

    def paintEvent(self, event):
        """Draws procedural 2D retro-style pixel art if sprite textures are absent."""
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing, False) # For retro-pixel precision

        # Gather custom colors aligned with skin selection
        base_preset = self.settings.personality
        if base_preset == "orange":
            body_color = QColor(244, 140, 66)
            belly_color = QColor(255, 230, 200)
            stripe_color = QColor(190, 80, 20)
        elif base_preset == "calico":
            body_color = QColor(240, 240, 240)
            belly_color = QColor(255, 255, 255)
            stripe_color = QColor(210, 105, 30)
        elif base_preset == "black":
            body_color = QColor(36, 36, 42)
            belly_color = QColor(70, 70, 80)
            stripe_color = QColor(20, 20, 25)
        else: # tuxedo
            body_color = QColor(48, 48, 48)
            belly_color = QColor(255, 255, 255)
            stripe_color = QColor(255, 255, 255)

        width = self.width()
        height = self.height()

        # Canvas drawing measurements matching size scaling
        pad = width * 0.15
        cw = width - 2*pad
        ch = height - 2*pad

        # Draw shadows on ground if landed
        if self.is_grounded:
            painter.setPen(Qt.PenStyle.NoPen)
            painter.setBrush(QBrush(QColor(0, 0, 0, 45)))
            painter.drawEllipse(QRectF(pad, height - pad, cw, pad / 2))

        # Body Layout rect
        body_rect = QRectF(pad, pad * 1.5, cw, ch * 0.7)
        painter.setPen(QPen(body_color.darker(150), 1.5))
        painter.setBrush(QBrush(body_color))
        painter.drawRoundedRect(body_rect, cw * 0.3, ch * 0.3)

        # Draw decorative tail
        painter.setPen(QPen(body_color.darker(150), 3))
        tail_dir = -self.direction_facing
        tail_start_x = cw/2 + pad + (tail_dir * cw/3)
        tail_end_x = tail_start_x + (tail_dir * width * 0.25)
        tail_y = pad * 2.5
        painter.drawLine(int(tail_start_x), int(tail_y), int(tail_end_x), int(tail_y - width * 0.2))

        # Ears Setup
        painter.setPen(QPen(body_color.darker(150), 1.5))
        painter.setBrush(QBrush(body_color))
        ear_width = cw * 0.25
        ear_height = ch * 0.3
        
        # Left Ear
        le_x1 = pad + cw * 0.1
        le_y1 = pad * 1.5
        painter.drawPolygon([
            QPoint(int(le_x1), int(le_y1)),
            QPoint(int(le_x1 + ear_width), int(le_y1)),
            QPoint(int(le_x1 + ear_width/2), int(le_y1 - ear_height))
        ])

        # Right Ear
        re_x1 = pad + cw * 0.65
        re_y1 = pad * 1.5
        painter.drawPolygon([
            QPoint(int(re_x1), int(re_y1)),
            QPoint(int(re_x1 + ear_width), int(re_y1)),
            QPoint(int(re_x1 + ear_width/2), int(re_y1 - ear_height))
        ])

        # Belly Overlay
        belly_w = cw * 0.5
        belly_h = ch * 0.4
        painter.setPen(Qt.PenStyle.NoPen)
        painter.setBrush(QBrush(belly_color))
        painter.drawEllipse(QRectF(pad + (cw - belly_w)/2, pad * 1.8 + (ch * 0.7 - belly_h)/2, belly_w, belly_h))

        # Gaze Eyes Tracking Target coordinates
        painter.setPen(QPen(QColor(0, 0, 0), 1))
        painter.setBrush(QBrush(QColor(255, 255, 255)))
        
        eye_y = pad * 1.9
        eye_r = cw * 0.15
        
        le_cx = pad + cw * 0.3
        re_cx = pad + cw * 0.7
        
        painter.drawEllipse(QRectF(le_cx - eye_r/2, eye_y, eye_r, eye_r))
        painter.drawEllipse(QRectF(re_cx - eye_r/2, eye_y, eye_r, eye_r))

        # Pupil lookup offsets towards gaze direction
        pupil_offset_x = self.direction_facing * (eye_r * 0.2)
        pupil_color = QColor(0, 0, 0)
        
        # Custom sleeping eyelids overlay
        if self.current_state == "sleeping":
            painter.setPen(QPen(body_color.darker(180), 2))
            painter.drawLine(int(le_cx - eye_r/2), int(eye_y + eye_r/2), int(le_cx + eye_r/2), int(eye_y + eye_r/2))
            painter.drawLine(int(re_cx - eye_r/2), int(eye_y + eye_r/2), int(re_cx + eye_r/2), int(eye_y + eye_r/2))
        else:
            # Draw Pupils
            painter.setBrush(QBrush(pupil_color))
            painter.drawEllipse(QRectF(le_cx - eye_r/4 + pupil_offset_x, eye_y + eye_r/4, eye_r/2, eye_r/2))
            painter.drawEllipse(QRectF(re_cx - eye_r/4 + pupil_offset_x, eye_y + eye_r/4, eye_r/2, eye_r/2))

        # Cute Nose & Mouth
        painter.setPen(QPen(QColor(240, 100, 120), 1.5))
        nose_x = pad + cw * 0.5
        nose_y = pad * 2.3
        painter.drawLine(int(nose_x - 2), int(nose_y), int(nose_x + 2), int(nose_y))
        painter.drawLine(int(nose_x), int(nose_y), int(nose_x), int(nose_y + 2))

        # Moving Paws based on state walking animation ticks
        paw_offset_y = 0.0
        if self.current_state == "walking" or self.current_state == "chasing_cursor":
            paw_offset_y = math.sin(self.frame_index * 0.5) * (height * 0.08)

        painter.setPen(QPen(body_color.darker(150), 1.2))
        painter.setBrush(QBrush(body_color))
        paw_w = cw * 0.18
        paw_h = ch * 0.2
        
        # Left Paw
        painter.drawEllipse(QRectF(pad + cw * 0.2, pad * 1.5 + ch * 0.65 + paw_offset_y, paw_w, paw_h))
        # Right Paw
        painter.drawEllipse(QRectF(pad + cw * 0.62, pad * 1.5 + ch * 0.65 - paw_offset_y, paw_w, paw_h))
        
        # Draw Speech Bubble overlay if active
        if self.current_bubble_text:
            painter.setRenderHint(QPainter.RenderHint.Antialiasing, True)
            
            # Setup bubble text font
            font = QFont("Segoe UI", 9)
            font.setBold(True)
            painter.setFont(font)
            
            # Calculate bubble sizes
            text = self.current_bubble_text
            metrics = painter.fontMetrics()
            rect = metrics.boundingRect(text)
            
            bw = rect.width() + 16
            bh = rect.height() + 10
            
            bx = (width - bw) / 2
            by = pad * 0.1 # Draw near the top of the widget
            
            # Draw speech pill body
            painter.setPen(QPen(QColor(249, 115, 22), 1))
            painter.setBrush(QBrush(QColor(255, 255, 255)))
            painter.drawRoundedRect(QRectF(bx, by, bw, bh), 6.0, 6.0)
            
            # Draw bubble small triangle tail
            tail_poly = [
                QPoint(int(width / 2 - 4), int(by + bh)),
                QPoint(int(width / 2 + 4), int(by + bh)),
                QPoint(int(width / 2), int(by + bh + 4))
            ]
            painter.drawPolygon(tail_poly)
            
            # Draw bubble text inside
            painter.setPen(QPen(QColor(30, 30, 30), 1))
            painter.drawText(QRectF(bx, by, bw, bh), Qt.AlignmentFlag.AlignCenter, text)

        painter.end()
