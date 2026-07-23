import asyncio
import json
import logging
import sys
import socket
import inspect
import threading
from pairing import PairingManager
from input_controller import InputController
from clipboard_sync import ClipboardSyncManager
from discovery import DiscoveryService
from tray import TrayIconManager

# Determine platform operations
if sys.platform == "win32":
    from platform_ops.windows import WindowsOps as PlatformOps
elif sys.platform == "darwin":
    from platform_ops.mac import MacOps as PlatformOps
else:
    class PlatformOps:
        def shutdown(self): logger.info("Dummy shutdown (unsupported OS)")
        def restart(self): logger.info("Dummy restart (unsupported OS)")
        def sleep(self): logger.info("Dummy sleep (unsupported OS)")
        def adjust_volume(self, action): logger.info(f"Dummy volume adjust {action} (unsupported OS)")

# Setup logging
import os
log_file = os.path.expanduser("~/relay_remote.log")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stderr),
        logging.FileHandler(log_file, mode="a", encoding="utf-8")
    ]
)
logger = logging.getLogger("RelayServer")

class RelayServer:
    def __init__(self, host="0.0.0.0", port=5389):
        self.host = host
        self.port = port
        self.pairing_manager = PairingManager()
        self.input_controller = InputController()
        self.clipboard_manager = ClipboardSyncManager(self)
        self.platform_ops = PlatformOps()
        self.discovery_service = DiscoveryService(self.port)
        self.tray_manager = None
        
        self.active_connections = set()
        self.authenticated_connections = set()
        self.handlers = {}
        
        self.loop = None
        self.server = None
        
        # Register default handlers
        self.register_handler("ping", self._handle_ping)
        self.register_handler("mouse_move", self._handle_mouse_move)
        self.register_handler("mouse_click", self._handle_mouse_click)
        self.register_handler("mouse_scroll", self._handle_mouse_scroll)
        self.register_handler("keyboard_text", self._handle_keyboard_text)
        self.register_handler("key_press", self._handle_key_press)
        self.register_handler("clipboard_get", self._handle_clipboard_get)
        self.register_handler("clipboard_set", self._handle_clipboard_set)
        self.register_handler("power", self._handle_power)
        self.register_handler("volume", self._handle_volume)
        self.register_handler("get_apps", self._handle_get_apps)
        self.register_handler("launch_app", self._handle_launch_app)
        self.register_handler("open_url", self._handle_open_url)

    def register_handler(self, msg_type, handler):
        self.handlers[msg_type] = handler

    async def _handle_ping(self, websocket, data):
        await websocket.send(json.dumps({"type": "pong"}))

    async def _handle_mouse_move(self, websocket, data):
        self.input_controller.handle_mouse_move(data.get("dx", 0), data.get("dy", 0))

    async def _handle_mouse_click(self, websocket, data):
        self.input_controller.handle_mouse_click(data.get("button", "left"), data.get("click_type", "single"))

    async def _handle_mouse_scroll(self, websocket, data):
        self.input_controller.handle_mouse_scroll(data.get("dx", 0), data.get("dy", 0))

    async def _handle_keyboard_text(self, websocket, data):
        self.input_controller.handle_keyboard_text(data.get("text", ""))

    async def _handle_key_press(self, websocket, data):
        self.input_controller.handle_key_press(data.get("key", ""), data.get("modifiers", []))

    async def _handle_clipboard_get(self, websocket, data):
        content = await self.clipboard_manager.get_clipboard()
        await websocket.send(json.dumps({"type": "clipboard_set", "content": content}))

    async def _handle_clipboard_set(self, websocket, data):
        content = data.get("content", "")
        await self.clipboard_manager.set_clipboard(content)

    async def _handle_power(self, websocket, data):
        action = data.get("action")
        confirmed = data.get("confirmed", False)
        if confirmed:
            logger.info(f"Power action requested: {action}")
            # Run in executor to prevent blocking
            if action == "shutdown":
                await asyncio.to_thread(self.platform_ops.shutdown)
            elif action == "restart":
                await asyncio.to_thread(self.platform_ops.restart)
            elif action == "sleep":
                await asyncio.to_thread(self.platform_ops.sleep)
            else:
                logger.warning(f"Unknown power action: {action}")
        else:
            logger.warning(f"Power action '{action}' requested but confirmed flag is false.")

    async def _handle_volume(self, websocket, data):
        action = data.get("action")
        logger.info(f"Volume action requested: {action}")
        await asyncio.to_thread(self.platform_ops.adjust_volume, action)

    async def _handle_get_apps(self, websocket, data):
        apps = await asyncio.to_thread(self.platform_ops.get_installed_apps)
        await websocket.send(json.dumps({
            "type": "apps_list",
            "apps": apps
        }))

    async def _handle_launch_app(self, websocket, data):
        path = data.get("path")
        success = await asyncio.to_thread(self.platform_ops.launch_app, path)
        await websocket.send(json.dumps({
            "type": "launch_app_response",
            "status": "success" if success else "failed"
        }))

    async def _handle_open_url(self, websocket, data):
        url = data.get("url")
        browser = data.get("browser", "default")
        success = await asyncio.to_thread(self.platform_ops.open_url, url, browser)
        await websocket.send(json.dumps({
            "type": "open_url_response",
            "status": "success" if success else "failed"
        }))

    async def broadcast_clipboard(self, content: str):
        if not self.authenticated_connections:
            return
        msg = json.dumps({"type": "clipboard_push", "content": content})
        logger.info(f"Broadcasting clipboard to {len(self.authenticated_connections)} client(s)")
        await asyncio.gather(
            *(ws.send(msg) for ws in self.authenticated_connections),
            return_exceptions=True
        )

    def _update_tray_connections(self):
        if self.tray_manager:
            self.tray_manager.set_connections_count(len(self.authenticated_connections))

    async def handler_loop(self, websocket, path=None):
        logger.info(f"New connection from {websocket.remote_address}")
        self.active_connections.add(websocket)
        authenticated = False
        device_name = "Unknown"

        try:
            # Step 1: Handshake within timeout
            try:
                msg_str = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                msg = json.loads(msg_str)
                msg_type = msg.get("type")
                
                if msg_type == "pair_request":
                    pin = msg.get("pin")
                    device_name = msg.get("device_name", "Unknown")
                    token = self.pairing_manager.verify_pin(pin, device_name)
                    if token:
                        logger.info(f"Successful pairing for device: {device_name}")
                        await websocket.send(json.dumps({
                            "type": "pair_response",
                            "status": "success",
                            "token": token,
                            "host_name": socket.gethostname()
                        }))
                        authenticated = True
                        self.authenticated_connections.add(websocket)
                        self._update_tray_connections()
                    else:
                        logger.warning(f"Failed pairing attempt from {websocket.remote_address} with PIN: {pin}")
                        await websocket.send(json.dumps({
                            "type": "pair_response",
                            "status": "failed",
                            "reason": "Invalid PIN"
                        }))
                        await websocket.close()
                        return
                elif msg_type == "auth_request":
                    token = msg.get("token")
                    device_name = msg.get("device_name", "Unknown")
                    if self.pairing_manager.verify_token(token):
                        logger.info(f"Successful authentication for device: {device_name}")
                        await websocket.send(json.dumps({
                            "type": "auth_response",
                            "status": "success",
                            "host_name": socket.gethostname()
                        }))
                        authenticated = True
                        self.authenticated_connections.add(websocket)
                        self._update_tray_connections()
                    else:
                        logger.warning(f"Failed authentication attempt from {websocket.remote_address}")
                        await websocket.send(json.dumps({
                            "type": "auth_response",
                            "status": "failed",
                            "reason": "Unauthorized"
                        }))
                        await websocket.close()
                        return
                else:
                    logger.warning(f"Unexpected initial message type: {msg_type}")
                    await websocket.close()
                    return
            except asyncio.TimeoutError:
                logger.warning(f"Handshake timeout for {websocket.remote_address}")
                await websocket.close()
                return
            except Exception as e:
                logger.error(f"Error during handshake: {e}")
                await websocket.close()
                return

            # Step 2: Authenticated message loop
            while authenticated:
                try:
                    msg_str = await websocket.recv()
                    if not msg_str:
                        break
                    msg = json.loads(msg_str)
                    msg_type = msg.get("type")
                    if not msg_type:
                        continue
                    
                    handler = self.handlers.get(msg_type)
                    if handler:
                        if inspect.iscoroutinefunction(handler):
                            await handler(websocket, msg)
                        else:
                            handler(websocket, msg)
                    else:
                        logger.warning(f"No handler registered for message type: {msg_type}")
                except json.JSONDecodeError:
                    logger.warning("Received invalid JSON")
                except Exception as e:
                    logger.error(f"Error processing message: {e}")
                    break
                
        except Exception as e:
            logger.error(f"Error in connection loop: {e}")
        finally:
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)
            self.authenticated_connections.discard(websocket)
            self._update_tray_connections()
            logger.info(f"Connection closed for {device_name} ({websocket.remote_address})")

    async def _start_discovery(self):
        await asyncio.to_thread(self.discovery_service.start)

    async def async_start(self):
        import websockets
        logger.info(f"Starting WebSocket server on ws://{self.host}:{self.port}")
        logger.info(f"Current Pairing PIN: {self.pairing_manager.pin}")
        
        self.clipboard_manager.start_monitoring()
        self.server = await websockets.serve(self.handler_loop, self.host, self.port)
        
        # Start discovery service asynchronously to avoid blocking the event loop
        asyncio.create_task(self._start_discovery())


    def run_async_loop(self):
        self.loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self.loop)
        
        try:
            self.loop.run_until_complete(self.async_start())
            self.loop.run_forever()
        except Exception as e:
            logger.error(f"Exception in async event loop: {e}")
        finally:
            logger.info("Async loop execution finished.")
            self.loop.close()

    def shutdown_server(self):
        logger.info("Initiating server shutdown...")
        # 1. Stop discovery service
        self.discovery_service.stop()
        
        # 2. Stop clipboard monitoring
        self.clipboard_manager.stop_monitoring()
        
        # 3. Close websocket server
        if self.server:
            self.server.close()
            
        # 4. Stop async loop
        if self.loop:
            self.loop.call_soon_threadsafe(self.loop.stop)
            
        # 5. Stop tray icon
        if self.tray_manager:
            self.tray_manager.stop()

def _request_accessibility_permission():
    """On macOS, request Accessibility permission with the system prompt."""
    if sys.platform != "darwin":
        return True
    try:
        from ApplicationServices import AXIsProcessTrustedWithOptions, kAXTrustedCheckOptionPrompt
        # AXIsProcessTrustedWithOptions with prompt=True triggers the macOS
        # "Allow in System Settings" dialog immediately if not already granted.
        options = {kAXTrustedCheckOptionPrompt: True}
        trusted = AXIsProcessTrustedWithOptions(options)
        if trusted:
            logger.info("Accessibility permission: GRANTED")
        else:
            logger.warning(
                "Accessibility permission: NOT GRANTED. "
                "Please approve in System Settings → Privacy & Security → Accessibility, "
                "then restart RelayRemote."
            )
        return trusted
    except Exception as e:
        logger.error(f"Could not check Accessibility permission: {e}")
        return False


def main():
    import os

    # Request Accessibility permissions up-front so the macOS dialog fires
    # immediately when the app launches rather than silently failing later.
    _request_accessibility_permission()

    if "--headless" in sys.argv or os.environ.get("RELAY_HEADLESS") == "1":
        server = RelayServer()
        logger.info("Running in HEADLESS mode (no system tray)")
        try:
            server.run_async_loop()
        except KeyboardInterrupt:
            logger.info("Received KeyboardInterrupt. Exiting...")
            server.shutdown_server()
        return

    server = RelayServer()

    # 1. Setup system tray manager
    server.tray_manager = TrayIconManager(
        pairing_manager=server.pairing_manager,
        exit_callback=server.shutdown_server,
        clear_paired_callback=server.pairing_manager.clear_paired_devices
    )

    # 2. Start WebSocket server in background thread
    async_thread = threading.Thread(target=server.run_async_loop, name="WebSocketThread", daemon=True)
    async_thread.start()

    # 3. Start system tray on the main thread (blocking)
    try:
        server.tray_manager.run()
    except KeyboardInterrupt:
        logger.info("Received KeyboardInterrupt. Exiting...")
        server.shutdown_server()


if __name__ == "__main__":
    main()

