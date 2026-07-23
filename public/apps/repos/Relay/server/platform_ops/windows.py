import subprocess
import logging
from platform_ops.base import PlatformOps

logger = logging.getLogger("PlatformWindows")

class WindowsOps(PlatformOps):
    def shutdown(self) -> bool:
        logger.info("Executing Windows shutdown command...")
        try:
            subprocess.run(["shutdown", "/s", "/t", "0"], check=True)
            return True
        except subprocess.SubprocessError as e:
            logger.error(f"Failed to shutdown: {e}")
            return False

    def restart(self) -> bool:
        logger.info("Executing Windows restart command...")
        try:
            subprocess.run(["shutdown", "/r", "/t", "0"], check=True)
            return True
        except subprocess.SubprocessError as e:
            logger.error(f"Failed to restart: {e}")
            return False

    def sleep(self) -> bool:
        logger.info("Executing Windows sleep command via PowerShell...")
        try:
            cmd = "Add-Type -Assembly System.Windows.Forms; [System.Windows.Forms.Application]::SetSuspendState([System.Windows.Forms.PowerState]::Suspend, $false, $false)"
            subprocess.run(["powershell", "-Command", cmd], check=True)
            return True
        except subprocess.SubprocessError as e:
            logger.error(f"Failed to sleep: {e}")
            return False

    def adjust_volume(self, action: str) -> bool:
        try:
            import ctypes
            user32 = ctypes.windll.user32
            if action == "up":
                user32.keybd_event(0xAF, 0, 0, 0)
                user32.keybd_event(0xAF, 0, 2, 0)
            elif action == "down":
                user32.keybd_event(0xAE, 0, 0, 0)
                user32.keybd_event(0xAE, 0, 2, 0)
            elif action == "mute":
                user32.keybd_event(0xAD, 0, 0, 0)
                user32.keybd_event(0xAD, 0, 2, 0)
            else:
                logger.warning(f"Unknown volume action: {action}")
                return False
            return True
        except Exception as e:
            logger.error(f"Failed to adjust Windows volume: {e}")
            return False

    def get_installed_apps(self) -> list[dict]:
        import os
        import json
        import tempfile
        import subprocess
        import base64
        
        logger.info("Scanning Windows Start Menu applications...")
        programs_path_1 = os.path.expandvars(r"%ProgramData%\Microsoft\Windows\Start Menu\Programs")
        programs_path_2 = os.path.expandvars(r"%AppData%\Microsoft\Windows\Start Menu\Programs")
        
        shortcuts = []
        seen_names = set()
        
        for base_path in [programs_path_1, programs_path_2]:
            if not os.path.exists(base_path):
                continue
            for root, dirs, files in os.walk(base_path):
                for file in files:
                    if file.lower().endswith(".lnk"):
                        name = file[:-4]  # Remove extension (.lnk / .LNK)
                        if name.lower() in ["uninstall", "install", "help", "readme", "about", "setup"]:
                            continue
                        path = os.path.join(root, file)
                        if name not in seen_names:
                            seen_names.add(name)
                            shortcuts.append({"name": name, "path": path})
                            
        if not shortcuts:
            return []
            
        # Extract icons in batch using a single PowerShell script
        temp_dir = tempfile.gettempdir()
        input_temp = os.path.join(temp_dir, "relay_icons_input.json")
        output_temp = os.path.join(temp_dir, "relay_icons_output.json")
        
        try:
            with open(input_temp, "w", encoding="utf-8") as f:
                json.dump([s["path"] for s in shortcuts], f)
                
            ps_script = f"""
            Add-Type -AssemblyName System.Drawing
            $inputPath = "{input_temp}"
            $outputPath = "{output_temp}"
            
            if (Test-Path $inputPath) {{
                $paths = Get-Content $inputPath -Raw | ConvertFrom-Json
                $result = @{{}}
                foreach ($path in $paths) {{
                    try {{
                        if (Test-Path $path) {{
                            $icon = [System.Drawing.Icon]::ExtractAssociatedIcon($path)
                            $bitmap = $icon.ToBitmap()
                            $resized = New-Object System.Drawing.Bitmap(48, 48)
                            $g = [System.Drawing.Graphics]::FromImage($resized)
                            $g.DrawImage($bitmap, 0, 0, 48, 48)
                            
                            $ms = New-Object System.IO.MemoryStream
                            $resized.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
                            $bytes = $ms.ToArray()
                            $base64 = [Convert]::ToBase64String($bytes)
                            $result[$path] = $base64
                            
                            $ms.Dispose()
                            $resized.Dispose()
                            $bitmap.Dispose()
                            $icon.Dispose()
                            $g.Dispose()
                        }}
                    }} catch {{}}
                }}
                $result | ConvertTo-Json -Depth 2 | Out-File -FilePath $outputPath -Encoding utf8
            }}
            """
            
            # Execute PowerShell batch command
            subprocess.run([
                "powershell", "-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps_script
            ], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
            
            # Read batch output
            icons_map = {}
            if os.path.exists(output_temp):
                with open(output_temp, "r", encoding="utf-8-sig") as f:
                    content = f.read().strip()
                    if content:
                        icons_map = json.loads(content)
                        
            # Map icons back to applications list
            apps = []
            for s in shortcuts:
                icon_b64 = icons_map.get(s["path"], "")
                apps.append({
                    "name": s["name"],
                    "path": s["path"],
                    "icon": icon_b64
                })
                
            # Clean up temporary files
            for temp_file in [input_temp, output_temp]:
                if os.path.exists(temp_file):
                    try:
                        os.remove(temp_file)
                    except Exception:
                        pass
                        
            apps.sort(key=lambda x: x["name"].lower())
            return apps
            
        except Exception as e:
            logger.error(f"Failed to batch extract icons on Windows: {e}")
            # Robust fallback: return the application list without icons if the PowerShell script fails
            apps = [{"name": s["name"], "path": s["path"], "icon": ""} for s in shortcuts]
            apps.sort(key=lambda x: x["name"].lower())
            return apps

    def launch_app(self, path: str) -> bool:
        logger.info(f"Launching Windows app shortcut: {path}")
        try:
            import os
            os.startfile(path)
            return True
        except Exception as e:
            logger.error(f"Failed to launch Windows app {path}: {e}")
            return False

    def open_url(self, url: str, browser: str) -> bool:
        logger.info(f"Opening URL on Windows: {url} in browser: {browser}")
        try:
            browser_map = {
                "chrome": "chrome",
                "firefox": "firefox",
                "edge": "msedge"
            }
            app_name = browser_map.get(browser.lower())
            if app_name and browser.lower() != "default":
                subprocess.run(["cmd", "/c", "start", app_name, url], check=True, shell=True)
            else:
                import os
                os.startfile(url)
            return True
        except Exception as e:
            logger.error(f"Failed to open URL {url} in browser {browser}: {e}")
            return False
