from abc import ABC, abstractmethod

class PlatformOps(ABC):
    @abstractmethod
    def shutdown(self) -> bool:
        """Triggers OS-specific shutdown."""
        pass

    @abstractmethod
    def restart(self) -> bool:
        """Triggers OS-specific restart."""
        pass

    @abstractmethod
    def sleep(self) -> bool:
        """Triggers OS-specific sleep."""
        pass

    @abstractmethod
    def adjust_volume(self, action: str) -> bool:
        """Adjusts the system volume (action: 'up', 'down', 'mute')."""
        pass

    @abstractmethod
    def get_installed_apps(self) -> list[dict]:
        """Scans and returns a list of installed applications."""
        pass

    @abstractmethod
    def launch_app(self, path: str) -> bool:
        """Launches the application at the given path."""
        pass

    @abstractmethod
    def open_url(self, url: str, browser: str) -> bool:
        """Opens the URL in the specified browser ('default', 'chrome', 'firefox', 'safari', 'edge')."""
        pass
