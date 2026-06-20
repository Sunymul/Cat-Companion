from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QSlider, 
    QCheckBox, QComboBox, QPushButton, QGroupBox
)
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont, QIcon

class SettingsPanel(QWidget):
    settings_changed = pyqtSignal() # Emitted whenever variables are updated

    def __init__(self, settings):
        super().__init__()
        self.settings = settings
        self.init_ui()

    def init_ui(self):
        """Initializes a visually polished, dark-slate styled Settings Dashboard."""
        self.setWindowTitle("Companion settings Dashboard")
        self.setFixedSize(360, 485)
        
        # Apply structured stylesheet matching deep slate styles
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
            QGroupBox::title {
                subcontrol-origin: margin;
                left: 10px;
                padding: 0 4px;
            }
            QSlider::groove:horizontal {
                border: 1px solid #2e2e38;
                height: 4px;
                background: #1e1e24;
                border-radius: 2px;
            }
            QSlider::handle:horizontal {
                background: #f97316;
                border: 1px solid #ea580c;
                width: 14px;
                height: 14px;
                margin: -5px 0;
                border-radius: 7px;
            }
            QSlider::handle:horizontal:hover {
                background: #ff7e2e;
            }
            QComboBox {
                background-color: #1a1a22;
                border: 1px solid #2e2e38;
                border-radius: 6px;
                padding: 4px 8px;
                min-width: 6em;
                color: #f8fafc;
            }
            QComboBox::drop-down {
                border: 0px;
            }
            QCheckBox {
                spacing: 8px;
                font-size: 11px;
            }
            QCheckBox::indicator {
                width: 14px;
                height: 14px;
                background-color: #1a1a22;
                border: 1px solid #2e2e38;
                border-radius: 4px;
            }
            QCheckBox::indicator:checked {
                background-color: #f97316;
                border-color: #f97316;
            }
            QPushButton {
                background-color: #f97316;
                border: none;
                border-radius: 6px;
                color: white;
                font-weight: bold;
                padding: 8px 16px;
                font-size: 11.5px;
            }
            QPushButton:hover {
                background-color: #ea580c;
            }
            QPushButton:pressed {
                background-color: #c2410c;
            }
        """)

        layout = QVBoxLayout()
        layout.setContentsMargins(18, 10, 18, 18)

        # Header Title section
        header_label = QLabel("Desktop Cat Companion Controller")
        h_font = QFont()
        h_font.setPointSize(13)
        h_font.setBold(True)
        header_label.setFont(h_font)
        header_label.setStyleSheet("color: #f8fafc; margin-bottom: 5px;")
        layout.addWidget(header_label)

        sub_label = QLabel("Tweak dimensions, speed, and behavior presets safely.")
        sub_label.setStyleSheet("color: #64748b; font-size: 10px; margin-bottom: 5px;")
        layout.addWidget(sub_label)

        # Group 1: Appearance configs
        app_group = QGroupBox("CAT APPEARANCES")
        app_layout = QVBoxLayout()

        # Size Slider
        size_lbl_layout = QHBoxLayout()
        size_lbl_layout.addWidget(QLabel("Cat Dimension (Width x Height):"))
        self.size_val_lbl = QLabel(f"{self.settings.size}px")
        self.size_val_lbl.setStyleSheet("color: #f97316; font-weight: bold;")
        size_lbl_layout.addWidget(self.size_val_lbl, 0, Qt.AlignmentFlag.AlignRight)
        app_layout.addLayout(size_lbl_layout)

        self.size_slider = QSlider(Qt.Orientation.Horizontal)
        self.size_slider.setRange(20, 50)
        self.size_slider.setValue(self.settings.size)
        self.size_slider.valueChanged.connect(self._on_size_slider_changed)
        app_layout.addWidget(self.size_slider)

        app_layout.addSpacing(10)

        # Opacity Slider
        opacity_lbl_layout = QHBoxLayout()
        opacity_lbl_layout.addWidget(QLabel("Gaze Alpha Opacity:"))
        self.op_val_lbl = QLabel(f"{int(self.settings.opacity * 100)}%")
        self.op_val_lbl.setStyleSheet("color: #f97316; font-weight: bold;")
        opacity_lbl_layout.addWidget(self.op_val_lbl, 0, Qt.AlignmentFlag.AlignRight)
        app_layout.addLayout(opacity_lbl_layout)

        self.op_slider = QSlider(Qt.Orientation.Horizontal)
        self.op_slider.setRange(20, 100)
        self.op_slider.setValue(int(self.settings.opacity * 100))
        self.op_slider.valueChanged.connect(self._on_opacity_slider_changed)
        app_layout.addWidget(self.op_slider)

        app_layout.addSpacing(10)

        # Personality Skin Presets
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

        # Group 2: Speed / Behavior Setup
        beh_group = QGroupBox("BEHAVIOR DYNAMICS")
        beh_layout = QVBoxLayout()

        # Speed Slider
        speed_lbl_layout = QHBoxLayout()
        speed_lbl_layout.addWidget(QLabel("Animation Speed Rate:"))
        self.speed_val_lbl = QLabel(f"{self.settings.speed:.1f}x")
        self.speed_val_lbl.setStyleSheet("color: #f97316; font-weight: bold;")
        speed_lbl_layout.addWidget(self.speed_val_lbl, 0, Qt.AlignmentFlag.AlignRight)
        beh_layout.addLayout(speed_lbl_layout)

        self.speed_slider = QSlider(Qt.Orientation.Horizontal)
        self.speed_slider.setRange(5, 25) # translates to 0.5 - 2.5
        self.speed_slider.setValue(int(self.settings.speed * 10))
        self.speed_slider.valueChanged.connect(self._on_speed_slider_changed)
        beh_layout.addWidget(self.speed_slider)

        beh_group.setLayout(beh_layout)
        layout.addWidget(beh_group)

        # Group 3: System & Preferences
        sys_group = QGroupBox("SYSTEM PREFERENCES")
        sys_layout = QVBoxLayout()

        # Run at Startup Checkbox
        self.startup_check = QCheckBox("Automatically start cat with Windows boot-up")
        self.startup_check.setChecked(self.settings.run_at_startup)
        self.startup_check.stateChanged.connect(self._on_startup_changed)
        sys_layout.addWidget(self.startup_check)

        sys_group.setLayout(sys_layout)
        layout.addWidget(sys_group)

        layout.addSpacing(10)

        # Footer close action buttons
        btn_layout = QHBoxLayout()
        self.save_btn = QPushButton("Save Settings")
        self.save_btn.clicked.connect(self.close)
        btn_layout.addStretch()
        btn_layout.addWidget(self.save_btn)
        layout.addLayout(btn_layout)

        self.setLayout(layout)

    def _on_size_slider_changed(self, val):
        self.settings.size = val
        self.size_val_lbl.setText(f"{val}px")
        self._commit_and_notify()

    def _on_opacity_slider_changed(self, val):
        alpha = val / 100.0
        self.settings.opacity = alpha
        self.op_val_lbl.setText(f"{val}%")
        self._commit_and_notify()

    def _on_speed_slider_changed(self, val):
        speed_val = val / 10.0
        self.settings.speed = speed_val
        self.speed_val_lbl.setText(f"{speed_val:.1f}x")
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
        """Saves values immediately and signals active companions to reload properties."""
        self.settings.save()
        self.settings_changed.emit()
