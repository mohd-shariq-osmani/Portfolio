import asyncio
import json
import os
import sys

TOKEN_FILE = "test_token.json"

def load_token():
    if os.path.exists(TOKEN_FILE):
        try:
            with open(TOKEN_FILE, "r") as f:
                data = json.load(f)
                return data.get("token")
        except Exception:
            return None
    return None

def save_token(token):
    try:
        with open(TOKEN_FILE, "w") as f:
            json.dump({"token": token}, f)
    except Exception as e:
        print(f"Failed to save token: {e}")

async def run_client():
    server_ip = input("Enter server IP [default: localhost]: ").strip() or "localhost"
    server_port = input("Enter server port [default: 5389]: ").strip() or "5389"
    uri = f"ws://{server_ip}:{server_port}"

    import websockets

    print(f"Connecting to {uri}...")
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected!")
            
            # Auth flow
            token = load_token()
            auth_success = False
            
            if token:
                choice = input(f"Found saved token. Authenticate with it? (y/n) [default: y]: ").strip().lower() or "y"
                if choice == "y":
                    # Send auth_request
                    auth_msg = {
                        "type": "auth_request",
                        "token": token,
                        "device_name": "CLI Test Client"
                    }
                    await websocket.send(json.dumps(auth_msg))
                    response_str = await websocket.recv()
                    response = json.loads(response_str)
                    print(f"Server response: {response}")
                    if response.get("status") == "success":
                        auth_success = True
                        print("Authentication successful!")
                    else:
                        print("Authentication failed.")
                        # Clear token
                        if os.path.exists(TOKEN_FILE):
                            os.remove(TOKEN_FILE)
            
            if not auth_success:
                print("Starting pairing flow...")
                pin = input("Enter pairing PIN from server: ").strip()
                pair_msg = {
                    "type": "pair_request",
                    "pin": pin,
                    "device_name": "CLI Test Client"
                }
                await websocket.send(json.dumps(pair_msg))
                response_str = await websocket.recv()
                response = json.loads(response_str)
                print(f"Server response: {response}")
                if response.get("status") == "success":
                    token = response.get("token")
                    save_token(token)
                    auth_success = True
                    print(f"Pairing successful! Token saved: {token}")
                else:
                    print(f"Pairing failed: {response.get('reason')}")
                    return

            # Keep listening to incoming server messages in a background task
            async def receive_messages():
                try:
                    while True:
                        msg = await websocket.recv()
                        print(f"\n[Received from server]: {msg}")
                except Exception as e:
                    print(f"\nReceiver stopped: {e}")

            recv_task = asyncio.create_task(receive_messages())

            # Command menu
            while True:
                await asyncio.sleep(0.1)  # brief sleep to align output print lines
                print("\nCommands:")
                print("1. Mouse Move (dx, dy)")
                print("2. Mouse Click (left/right/middle)")
                print("3. Mouse Scroll (dy)")
                print("4. Keyboard Type Text")
                print("5. Key Press (e.g. key_name + modifiers)")
                print("6. Clipboard Get")
                print("7. Clipboard Set (text)")
                print("8. Power Command (shutdown/restart/sleep)")
                print("9. Volume Command (up/down/mute)")
                print("10. Send Ping")
                print("0. Exit")
                
                try:
                    choice = await asyncio.get_event_loop().run_in_executor(None, input, "Enter choice: ")
                    choice = choice.strip()
                except KeyboardInterrupt:
                    break

                if choice == "0":
                    break
                elif choice == "1":
                    dx = float(input("Enter dx: ") or 0)
                    dy = float(input("Enter dy: ") or 0)
                    await websocket.send(json.dumps({"type": "mouse_move", "dx": dx, "dy": dy}))
                elif choice == "2":
                    btn = input("Enter button (left/right/middle) [default: left]: ").strip() or "left"
                    click = input("Enter type (single/double/down/up) [default: single]: ").strip() or "single"
                    await websocket.send(json.dumps({"type": "mouse_click", "button": btn, "click_type": click}))
                elif choice == "3":
                    dy = float(input("Enter vertical scroll amount (positive to scroll up, negative down): ") or 0)
                    await websocket.send(json.dumps({"type": "mouse_scroll", "dx": 0.0, "dy": dy}))
                elif choice == "4":
                    text = input("Enter text to type: ")
                    await websocket.send(json.dumps({"type": "keyboard_text", "text": text}))
                elif choice == "5":
                    key = input("Enter key (e.g. a, enter, space, backspace): ").strip()
                    mods = input("Enter modifiers separated by space (ctrl, shift, alt, cmd) [optional]: ").strip().split()
                    await websocket.send(json.dumps({"type": "key_press", "key": key, "modifiers": mods if mods else []}))
                elif choice == "6":
                    await websocket.send(json.dumps({"type": "clipboard_get"}))
                elif choice == "7":
                    text = input("Enter text to set: ")
                    await websocket.send(json.dumps({"type": "clipboard_set", "content": text}))
                elif choice == "8":
                    action = input("Enter power action (shutdown/restart/sleep): ").strip()
                    conf = input("Confirm? (y/n): ").strip().lower() == "y"
                    await websocket.send(json.dumps({"type": "power", "action": action, "confirmed": conf}))
                elif choice == "9":
                    action = input("Enter volume action (up/down/mute): ").strip()
                    await websocket.send(json.dumps({"type": "volume", "action": action}))
                elif choice == "10":
                    await websocket.send(json.dumps({"type": "ping"}))
                else:
                    print("Invalid choice.")

            recv_task.cancel()
    except Exception as e:
        print(f"Connection error: {e}")

if __name__ == "__main__":
    try:
        asyncio.run(run_client())
    except KeyboardInterrupt:
        print("\nClient stopped.")
