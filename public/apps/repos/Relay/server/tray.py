import logging
import pyperclip
from PIL import Image, ImageDraw
import pystray
from pystray import MenuItem as item

logger = logging.getLogger("TrayIcon")

class TrayIconManager:
    def __init__(self, pairing_manager, exit_callback, clear_paired_callback):
        self.pairing_manager = pairing_manager
        self.exit_callback = exit_callback
        self.clear_paired_callback = clear_paired_callback
        self.connected_count = 0
        self.icon = None

    def _create_icon_image(self) -> Image.Image:
        # Create a simple 64x64 remote control icon representation
        width, height = 64, 64
        image = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        dc = ImageDraw.Draw(image)
        
        # Color based on connection state: green if connected, blue if disconnected
        color = "#10B981" if self.connected_count > 0 else "#3B82F6"
        
        # Draw remote shape
        dc.rounded_rectangle([12, 4, 52, 60], radius=8, fill=color, outline="#F3F4F6", width=2)
        # Draw small screen
        dc.rectangle([18, 10, 46, 26], fill="#1F2937")
        # Draw small buttons
        dc.ellipse([22, 34, 30, 42], fill="#EF4444") # Red power button
        dc.ellipse([34, 34, 42, 42], fill="#FBBF24")
        dc.ellipse([22, 46, 30, 54], fill="#F3F4F6")
        dc.ellipse([34, 46, 42, 54], fill="#F3F4F6")
        
        return image

    def _copy_pin(self):
        pin = self.pairing_manager.pin
        try:
            pyperclip.copy(pin)
            logger.info(f"Pairing PIN {pin} copied to clipboard.")
        except Exception as e:
            logger.error(f"Failed to copy PIN to clipboard: {e}")

    def _clear_pairings(self):
        try:
            self.clear_paired_callback()
            logger.info("Cleared all paired devices.")
        except Exception as e:
            logger.error(f"Failed to clear paired devices: {e}")

    def _create_menu(self) -> pystray.Menu:
        status_text = f"Status: Connected ({self.connected_count} device(s))" if self.connected_count > 0 else "Status: Disconnected"
        pin_text = f"Pairing PIN: {self.pairing_manager.pin} (Copy)"
        
        return pystray.Menu(
            item(status_text, lambda: None, enabled=False),
            pystray.Menu.SEPARATOR,
            item(pin_text, lambda icon, item: self._copy_pin()),
            item("Clear Paired Devices", lambda icon, item: self._clear_pairings()),
            pystray.Menu.SEPARATOR,
            item("Exit", lambda icon, item: self.exit_callback())
        )

    def set_connections_count(self, count: int):
        self.connected_count = count
        if self.icon:
            self.icon.icon = self._create_icon_image()
            self.icon.menu = self._create_menu()

    def run(self):
        logger.info("Initializing system tray icon...")
        self.icon = pystray.Icon(
            "RelayRemote",
            icon=self._create_icon_image(),
            title="Relay Remote Input Controller",
            menu=self._create_menu()
        )
        self.icon.run()

    def stop(self):
        if self.icon:
            self.icon.stop()
            self.icon = None
