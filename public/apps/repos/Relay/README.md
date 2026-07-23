# Relay — Mobile Remote Input Controller

Relay is a remote input control system that turns your mobile phone (Android or iOS) into a virtual trackpad, keyboard, clipboard sync notepad, and power dashboard for your desktop computer (macOS or Windows).

Communication runs completely on your local network (LAN) over low-latency WebSockets with mDNS auto-discovery and secure PIN pairing.

---

## Repository Structure

*   `/server` — Python 3.11/asyncio desktop server advertising over zeroconf.
*   `/client` — Flutter (Dart) mobile application acting as the remote client for both Android and iOS.

---

## 1. Desktop Server Setup (Windows & macOS)

### Requirements
*   Python 3.11 or later
*   For macOS: Accessibility permissions granted to the terminal or packaged app running Relay.

### Installation
1.  Navigate to the server directory:
    ```bash
    cd server
    ```
2.  Create and activate a virtual environment:
    ```bash
    python3 -m venv venv
    source venv/bin/activate       # On macOS/Linux
    venv\Scripts\activate.bat      # On Windows
    ```
3.  Install the required dependencies:
    ```bash
    pip install -r requirements.txt
    ```

### Running the Server
Run the server script:
```bash
python server.py
```
Upon launching, a system tray icon will appear in your menu bar / taskbar displaying the current status:
*   **Blue Icon**: Disconnected. Click the menu to view the pairing PIN or clear pairings.
*   **Green Icon**: Connected. Shows the count of active remotes.

> [!IMPORTANT]
> **macOS Accessibility Permissions**: On macOS, simulated input requires Accessibility access. On first run, approved the dialog or go to *System Settings -> Privacy & Security -> Accessibility* and enable access for your terminal app or packaged application.

---

## 2. Mobile App Setup (Android & iOS)

### Requirements
*   Flutter SDK (3.28 or later)
*   Android SDK (Target API 34+) for Android builds
*   Xcode (on macOS) for iOS builds

### Building and Sideloading

1.  Navigate to the client directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    flutter pub get
    ```

#### For Android:
3.  Build the debug APK:
    ```bash
    flutter build apk --debug
    ```
4.  Install on your connected Android device:
    ```bash
    adb install build/app/outputs/flutter-apk/app-debug.apk
    ```

#### For iOS:
3.  Build the iOS app:
    ```bash
    flutter build ios --no-codesign
    ```
4.  Run the app on iOS simulator or target device using Xcode or the Flutter CLI:
    ```bash
    flutter run
    ```

---

## 3. Pairing Flow

1.  Start the desktop server on your PC.
2.  Open the Relay app on your Android device. It will automatically scan the local network via mDNS and list your PC under **Discovered Hosts**.
3.  Tap your PC's name.
4.  Enter the 6-digit **Pairing PIN** displayed in the system tray menu of the PC server.
5.  Once verified, the app will store a secure token in storage, transition to **Connected** (Green LED), and you can start controlling mouse, typing text, sync clipboards, or manage volume/power.

---

## 4. Production Packaging

To compile standalone executable programs for the desktop server:
1.  Activate your virtual environment and install PyInstaller:
    ```bash
    pip install pyinstaller
    ```
2.  Package the executable:
    ```bash
    # On macOS
    pyinstaller --noconsole --name "RelayRemote" server.py
    ```
    This generates `dist/RelayRemote.app`. You can wrap this in a `.dmg` using:
    ```bash
    hdiutil create -volname "RelayRemote" -srcfolder dist/RelayRemote.app -ov -format UDZO RelayRemote.dmg
    ```
    
    ```bash
    # On Windows
    pyinstaller --noconsole --onefile --name "RelayRemote" server.py
    ```

---

## 5. Launch on Login Config (Opt-in)

### macOS
1.  Go to **System Settings > General > Login Items > Open at Login**.
2.  Click the **+** button.
3.  Navigate to and select `RelayRemote.app`.

### Windows
1.  Press `Win + R`, type `shell:startup`, and press Enter. This opens the Startup directory.
2.  Create a shortcut to the compiled `RelayRemote.exe` and paste it inside this directory.

