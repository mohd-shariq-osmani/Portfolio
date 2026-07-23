import os
import json
import secrets
import uuid
from platformdirs import user_config_dir

class PairingManager:
    def __init__(self):
        self.config_dir = user_config_dir("RelayRemote", "Relay")
        os.makedirs(self.config_dir, exist_ok=True)
        self.db_path = os.path.join(self.config_dir, "paired_devices.json")
        self.tokens = {}  # token -> device_name
        self.pin = self._generate_random_pin()
        self.load_paired_devices()

    def _generate_random_pin(self) -> str:
        # Generates a random 6-digit PIN
        return "".join(str(secrets.randbelow(10)) for _ in range(6))

    def regenerate_pin(self):
        self.pin = self._generate_random_pin()
        return self.pin

    def load_paired_devices(self):
        if os.path.exists(self.db_path):
            try:
                with open(self.db_path, "r") as f:
                    self.tokens = json.load(f)
            except Exception as e:
                print(f"Error loading paired devices: {e}")
                self.tokens = {}
        else:
            self.tokens = {}

    def save_paired_devices(self):
        try:
            with open(self.db_path, "w") as f:
                json.dump(self.tokens, f, indent=4)
        except Exception as e:
            print(f"Error saving paired devices: {e}")

    def verify_pin(self, pin: str, device_name: str) -> str | None:
        if pin == self.pin:
            token = str(uuid.uuid4())
            self.tokens[token] = device_name
            self.save_paired_devices()
            return token
        return None

    def verify_token(self, token: str) -> bool:
        return token in self.tokens

    def clear_paired_devices(self):
        self.tokens = {}
        self.save_paired_devices()
