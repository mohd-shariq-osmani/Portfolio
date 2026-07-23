import subprocess
import logging
from platform_ops.base import PlatformOps

logger = logging.getLogger("PlatformMac")

class MacOps(PlatformOps):
    def shutdown(self) -> bool:
        logger.info("Executing macOS shutdown command via AppleScript...")
        try:
            subprocess.run(["osascript", "-e", 'tell app "System Events" to shut down'], check=True)
            return True
        except subprocess.SubprocessError as e:
            logger.error(f"Failed to shutdown: {e}")
            return False

    def restart(self) -> bool:
        logger.info("Executing macOS restart command via AppleScript...")
        try:
            subprocess.run(["osascript", "-e", 'tell app "System Events" to restart'], check=True)
            return True
        except subprocess.SubprocessError as e:
            logger.error(f"Failed to restart: {e}")
            return False

    def sleep(self) -> bool:
        logger.info("Executing macOS sleep command...")
        try:
            subprocess.run(["osascript", "-e", 'tell app "System Events" to sleep'], check=True)
            return True
        except subprocess.SubprocessError as e:
            logger.error(f"Failed to sleep: {e}")
            return False

    def adjust_volume(self, action: str) -> bool:
        try:
            if action == "up":
                subprocess.run([
                    "osascript", "-e",
                    "set volume output volume ((output volume of (get volume settings)) + 6)"
                ], check=True)
            elif action == "down":
                subprocess.run([
                    "osascript", "-e",
                    "set volume output volume ((output volume of (get volume settings)) - 6)"
                ], check=True)
            elif action == "mute":
                subprocess.run([
                    "osascript", "-e",
                    "set volume output muted not (output muted of (get volume settings))"
                ], check=True)
            else:
                logger.warning(f"Unknown volume action: {action}")
                return False
            return True
        except subprocess.SubprocessError as e:
            logger.error(f"Failed to adjust volume: {e}")
            return False

    def _get_app_icon_base64(self, app_path: str) -> str:
        import os
        import glob
        import subprocess
        import base64
        import tempfile
        
        resources_dir = os.path.join(app_path, "Contents", "Resources")
        if not os.path.exists(resources_dir):
            return ""
            
        # Try to find an .icns file
        icns_files = glob.glob(os.path.join(resources_dir, "*.icns"))
        if not icns_files:
            return ""
            
        # Prioritize files containing 'icon' or 'app' in the name
        icns_path = icns_files[0]
        for f in icns_files:
            base = os.path.basename(f).lower()
            if "icon" in base or "app" in base:
                icns_path = f
                break
                
        # Generate temp png
        temp_dir = tempfile.gettempdir()
        temp_png = os.path.join(temp_dir, f"relay_icon_{os.path.basename(app_path)}.png")
        
        try:
            # Use sips to convert and resize to 48x48
            subprocess.run([
                "sips", "-s", "format", "png", 
                "--resampleHeightWidth", "48", "48", 
                icns_path, "--out", temp_png
            ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
            
            if os.path.exists(temp_png):
                with open(temp_png, "rb") as f:
                    encoded = base64.b64encode(f.read()).decode("utf-8")
                try:
                    os.remove(temp_png)
                except Exception:
                    pass
                return encoded
        except Exception:
            pass
            
        return ""

    def get_installed_apps(self) -> list[dict]:
        import glob
        import os
        logger.info("Scanning macOS applications...")
        apps_paths = glob.glob("/Applications/*.app") + glob.glob("/System/Applications/*.app")
        apps = []
        seen_names = set()
        for path in apps_paths:
            name = os.path.basename(path).replace(".app", "")
            # Ignore utility or internal helper apps
            if name.startswith(".") or name.lower() in ["install", "uninstall"]:
                continue
            if name not in seen_names:
                seen_names.add(name)
                icon_b64 = self._get_app_icon_base64(path)
                apps.append({"name": name, "path": path, "icon": icon_b64})
        apps.sort(key=lambda x: x["name"].lower())
        return apps

    def launch_app(self, path: str) -> bool:
        logger.info(f"Launching macOS app: {path}")
        try:
            subprocess.run(["open", path], check=True)
            return True
        except Exception as e:
            logger.error(f"Failed to launch app {path}: {e}")
            return False

    def open_url(self, url: str, browser: str) -> bool:
        logger.info(f"Opening URL on macOS: {url} in browser: {browser}")
        try:
            # Map standard friendly browser names to macOS Application names
            browser_map = {
                "chrome": "Google Chrome",
                "firefox": "Firefox",
                "safari": "Safari",
                "edge": "Microsoft Edge"
            }
            app_name = browser_map.get(browser.lower())
            if app_name and browser.lower() != "default":
                subprocess.run(["open", "-a", app_name, url], check=True)
            else:
                subprocess.run(["open", url], check=True)
            return True
        except Exception as e:
            logger.error(f"Failed to open URL {url} in browser {browser}: {e}")
            return False
