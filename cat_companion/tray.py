from PyQt6.QtWidgets import QSystemTrayIcon, QMenu
from PyQt6.QtGui import QIcon, QAction, QPainter, QColor
from PyQt6.QtCore import QObject

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
        """Generates a procedural, eye-catching circular tray icon if PNG file is missing."""
        # Draw a beautiful small orange dot representing our desktop cat companion
        from PyQt6.QtGui import QPixmap
        pixmap = QPixmap(16, 16)
        pixmap.fill(QColor(0, 0, 0, 0)) # Translucent background
        
        painter = QPainter(pixmap)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing, True)
        painter.setPen(Qt.PenStyle.NoPen if hasattr(Qt, 'PenStyle') else Qt.NoPen)
        painter.setBrush(QColor(244, 140, 66)) # Golden orange
        painter.drawEllipse(3, 3, 10, 10)
        painter.setBrush(QColor(255, 255, 255))
        painter.drawEllipse(5, 5, 2, 2)
        painter.drawEllipse(9, 5, 2, 2)
        painter.end()
        
        icon = QIcon(pixmap)
        self.tray_icon.setIcon(icon)
        self.tray_icon.setToolTip("Desktop Cat Companion")

    def init_menu(self):
        """Assembles the system tray dropdown context menu options."""
        menu = QMenu()
        
        # Action: Show Settings
        show_settings_act = QAction("Open settings Controller", self)
        show_settings_act.triggered.connect(self._show_settings_panel)
        menu.addAction(show_settings_act)
        
        menu.addSeparator()

        # Action: Spawn Cat
        spawn_act = QAction("🐈 Spawn Companion Cat", self)
        spawn_act.triggered.connect(self.cat_manager.spawn_cat)
        menu.addAction(spawn_act)

        # Action: Remove Cat
        remove_act = QAction("🚫 Despawn Last Cat", self)
        remove_act.triggered.connect(self.cat_manager.remove_cat)
        menu.addAction(remove_act)

        menu.addSeparator()

        # Action: Hide / Show Cats toggle
        self.hide_show_act = QAction("Hide All Cats", self)
        self.hide_show_act.triggered.connect(self._toggle_visibility)
        menu.addAction(self.hide_show_act)

        menu.addSeparator()

        # Action: Exit Application
        exit_act = QAction("Exit Companion", self)
        exit_act.triggered.connect(self._exit_application)
        menu.addAction(exit_act)

        self.tray_icon.setContextMenu(menu)
        
        # Trigger settings on double-click
        self.tray_icon.activated.connect(self._on_tray_activated)

    def _show_settings_panel(self):
        self.settings_panel.show()
        self.settings_panel.raise_()
        self.settings_panel.activateWindow()

    def _on_tray_activated(self, reason):
        if reason == QSystemTrayIcon.ActivationReason.DoubleClick:
            self._show_settings_panel()

    def _toggle_visibility(self):
        # Inspect and invert visibility flag
        if self.hide_show_act.text() == "Hide All Cats":
            self.cat_manager.hide_all()
            self.hide_show_act.setText("Show All Cats")
            self.tray_icon.showMessage(
                "Cats Hidden",
                "Your desktop companion cats have been hidden. Restore them here.",
                QSystemTrayIcon.MessageIcon.Information,
                1500
            )
        else:
            self.cat_manager.show_all()
            self.hide_show_act.setText("Hide All Cats")

    def _exit_application(self):
        # Discard active cats
        self.cat_manager.clear()
        
        # Quit sys standard execution
        from PyQt6.QtWidgets import QApplication
        QApplication.quit()

# Supply missing Qt PenStyle namespace compatibility manually if needed
from PyQt6.QtCore import Qt
