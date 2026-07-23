import sys
import logging
import subprocess

logger = logging.getLogger("InputController")

# Try to import Quartz for direct CGEvent usage on macOS (most reliable)
_quartz_available = False
if sys.platform == "darwin":
    try:
        import Quartz
        _quartz_available = True
        logger.info("Quartz CGEvent API available — using native macOS input.")
    except ImportError:
        logger.warning("Quartz not available, falling back to pynput.")

# Fall back to pynput
try:
    from pynput.mouse import Controller as MouseController, Button
    from pynput.keyboard import Controller as KeyboardController, Key
    _pynput_available = True
except ImportError:
    _pynput_available = False
    logger.warning("pynput not available either.")


# macOS virtual key code table
_MAC_KEYCODES = {
    "a": 0, "s": 1, "d": 2, "f": 3, "h": 4, "g": 5, "z": 6, "x": 7,
    "c": 8, "v": 9, "b": 11, "q": 12, "w": 13, "e": 14, "r": 15,
    "y": 16, "t": 17, "1": 18, "2": 19, "3": 20, "4": 21, "6": 22,
    "5": 23, "=": 24, "9": 25, "7": 26, "-": 27, "8": 28, "0": 29,
    "]": 30, "o": 31, "u": 32, "[": 33, "i": 34, "p": 35, "l": 37,
    "j": 38, "'": 39, "k": 40, ";": 41, "\\": 42, ",": 43, "/": 44,
    "n": 45, "m": 46, ".": 47,
    "enter": 36, "tab": 48, "space": 49, "backspace": 51, "escape": 53,
    "arrow_left": 123, "arrow_right": 124, "arrow_down": 125, "arrow_up": 126,
    "delete": 117, "home": 115, "end": 119, "page_up": 116, "page_down": 121,
    "f1": 122, "f2": 120, "f3": 99, "f4": 118, "f5": 96, "f6": 97,
    "f7": 98, "f8": 100, "f9": 101, "f10": 109, "f11": 103, "f12": 111,
}

_MAC_MOD_FLAGS = {
    "cmd": 0x100000,    # kCGEventFlagMaskCommand
    "ctrl": 0x040000,   # kCGEventFlagMaskControl
    "alt": 0x080000,    # kCGEventFlagMaskAlternate
    "shift": 0x020000,  # kCGEventFlagMaskShift
}


class InputController:
    def __init__(self):
        self.scroll_accum_x = 0.0
        self.scroll_accum_y = 0.0

        if not _quartz_available and _pynput_available:
            self.mouse = MouseController()
            self.keyboard = KeyboardController()
            self.key_map = {
                "backspace": Key.backspace, "enter": Key.enter, "space": Key.space,
                "escape": Key.esc, "tab": Key.tab,
                "arrow_up": Key.up, "arrow_down": Key.down,
                "arrow_left": Key.left, "arrow_right": Key.right,
                "ctrl": Key.ctrl, "shift": Key.shift, "alt": Key.alt,
                "cmd": Key.cmd, "win": Key.cmd,
            }
            self.button_map = {
                "left": Button.left, "right": Button.right, "middle": Button.middle
            }
        else:
            self.mouse = None
            self.keyboard = None
            self.key_map = {}
            self.button_map = {}

    # ─── Mouse Move ──────────────────────────────────────────────────────────

    def handle_mouse_move(self, dx: float, dy: float):
        try:
            if _quartz_available:
                # Get current mouse position
                loc = Quartz.CGEventGetLocation(Quartz.CGEventCreate(None))
                new_x = loc.x + dx
                new_y = loc.y + dy
                event = Quartz.CGEventCreateMouseEvent(
                    None, Quartz.kCGEventMouseMoved,
                    Quartz.CGPoint(new_x, new_y),
                    Quartz.kCGMouseButtonLeft
                )
                Quartz.CGEventPost(Quartz.kCGHIDEventTap, event)
            elif _pynput_available:
                self.mouse.move(dx, dy)
        except Exception as e:
            logger.error(f"Error in mouse move: {e}")

    # ─── Mouse Click ─────────────────────────────────────────────────────────

    def handle_mouse_click(self, button_name: str, click_type: str):
        try:
            if _quartz_available:
                loc = Quartz.CGEventGetLocation(Quartz.CGEventCreate(None))
                pt = Quartz.CGPoint(loc.x, loc.y)

                if button_name == "right":
                    down_type = Quartz.kCGEventRightMouseDown
                    up_type = Quartz.kCGEventRightMouseUp
                    btn = Quartz.kCGMouseButtonRight
                else:
                    down_type = Quartz.kCGEventLeftMouseDown
                    up_type = Quartz.kCGEventLeftMouseUp
                    btn = Quartz.kCGMouseButtonLeft

                clicks = 2 if click_type == "double" else 1
                for _ in range(clicks):
                    down = Quartz.CGEventCreateMouseEvent(None, down_type, pt, btn)
                    up = Quartz.CGEventCreateMouseEvent(None, up_type, pt, btn)
                    Quartz.CGEventPost(Quartz.kCGHIDEventTap, down)
                    Quartz.CGEventPost(Quartz.kCGHIDEventTap, up)
            elif _pynput_available:
                button = self.button_map.get(button_name.lower(), Button.left)
                count = 2 if click_type == "double" else 1
                self.mouse.click(button, count)
        except Exception as e:
            logger.error(f"Error in mouse click: {e}")

    # ─── Mouse Scroll ─────────────────────────────────────────────────────────

    def handle_mouse_scroll(self, dx: float, dy: float):
        try:
            if _quartz_available:
                self.scroll_accum_x += dx
                self.scroll_accum_y += dy
                step_x = int(self.scroll_accum_x)
                step_y = int(self.scroll_accum_y)
                if step_x != 0 or step_y != 0:
                    event = Quartz.CGEventCreateScrollWheelEvent(
                        None,
                        Quartz.kCGScrollEventUnitPixel,
                        2,        # 2 axes
                        step_y,   # axis 1 = vertical
                        step_x    # axis 2 = horizontal
                    )
                    Quartz.CGEventPost(Quartz.kCGHIDEventTap, event)
                    self.scroll_accum_x -= step_x
                    self.scroll_accum_y -= step_y
            elif _pynput_available:
                self.scroll_accum_x += dx
                self.scroll_accum_y += dy
                step_x = int(self.scroll_accum_x)
                step_y = int(self.scroll_accum_y)
                if step_x != 0 or step_y != 0:
                    self.mouse.scroll(step_x, step_y)
                    self.scroll_accum_x -= step_x
                    self.scroll_accum_y -= step_y
        except Exception as e:
            logger.error(f"Error in mouse scroll: {e}")

    # ─── Keyboard Text ────────────────────────────────────────────────────────

    def handle_keyboard_text(self, text: str):
        try:
            if _quartz_available:
                for char in text:
                    # Use CGEventKeyboardSetUnicodeString for arbitrary chars
                    down = Quartz.CGEventCreateKeyboardEvent(None, 0, True)
                    up = Quartz.CGEventCreateKeyboardEvent(None, 0, False)
                    Quartz.CGEventKeyboardSetUnicodeString(down, len(char), char)
                    Quartz.CGEventKeyboardSetUnicodeString(up, len(char), char)
                    Quartz.CGEventPost(Quartz.kCGHIDEventTap, down)
                    Quartz.CGEventPost(Quartz.kCGHIDEventTap, up)
            elif _pynput_available:
                self.keyboard.type(text)
        except Exception as e:
            logger.error(f"Error in typing text: {e}")

    # ─── Key Press ────────────────────────────────────────────────────────────

    def handle_key_press(self, key_name: str, modifier_names: list):
        try:
            if _quartz_available:
                keycode = _MAC_KEYCODES.get(key_name.lower())
                if keycode is None:
                    # Try single char
                    if len(key_name) == 1:
                        keycode = _MAC_KEYCODES.get(key_name.lower())
                    if keycode is None:
                        logger.warning(f"Unknown key: {key_name}")
                        return

                # Build modifier flags
                flags = 0
                for mod in modifier_names:
                    flags |= _MAC_MOD_FLAGS.get(mod.lower(), 0)

                down = Quartz.CGEventCreateKeyboardEvent(None, keycode, True)
                up = Quartz.CGEventCreateKeyboardEvent(None, keycode, False)
                if flags:
                    Quartz.CGEventSetFlags(down, flags)
                    Quartz.CGEventSetFlags(up, flags)
                Quartz.CGEventPost(Quartz.kCGHIDEventTap, down)
                Quartz.CGEventPost(Quartz.kCGHIDEventTap, up)

            elif _pynput_available:
                key = self.key_map.get(key_name.lower())
                if not key:
                    if len(key_name) == 1:
                        key = key_name
                    else:
                        logger.warning(f"Unknown key name: {key_name}")
                        return
                mods = [self.key_map[m.lower()] for m in modifier_names if m.lower() in self.key_map]
                for mod in mods:
                    self.keyboard.press(mod)
                self.keyboard.press(key)
                self.keyboard.release(key)
                for mod in reversed(mods):
                    self.keyboard.release(mod)
        except Exception as e:
            logger.error(f"Error in key press: {e}")
