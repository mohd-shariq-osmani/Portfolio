import asyncio
import logging
import pyperclip

logger = logging.getLogger("ClipboardSync")

class ClipboardSyncManager:
    def __init__(self, server):
        self.server = server
        self.last_clipboard = ""
        self.monitor_task = None

    async def get_clipboard(self) -> str:
        try:
            return await asyncio.to_thread(pyperclip.paste)
        except Exception as e:
            logger.error(f"Error reading clipboard: {e}")
            return ""

    async def set_clipboard(self, content: str):
        try:
            self.last_clipboard = content
            await asyncio.to_thread(pyperclip.copy, content)
            logger.info("Host clipboard updated by client.")
        except Exception as e:
            logger.error(f"Error writing clipboard: {e}")

    def start_monitoring(self):
        if not self.monitor_task:
            self.monitor_task = asyncio.create_task(self._monitor_loop())
            logger.info("Clipboard monitor started.")

    def stop_monitoring(self):
        if self.monitor_task:
            self.monitor_task.cancel()
            self.monitor_task = None
            logger.info("Clipboard monitor stopped.")

    async def _monitor_loop(self):
        # Initialize last clipboard content on start
        try:
            self.last_clipboard = await self.get_clipboard()
        except Exception:
            self.last_clipboard = ""

        while True:
            try:
                await asyncio.sleep(1.0)
                current_clipboard = await self.get_clipboard()
                if current_clipboard != self.last_clipboard:
                    self.last_clipboard = current_clipboard
                    logger.info("Local clipboard changed. Pushing to clients...")
                    await self.server.broadcast_clipboard(current_clipboard)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in clipboard monitoring loop: {e}")
