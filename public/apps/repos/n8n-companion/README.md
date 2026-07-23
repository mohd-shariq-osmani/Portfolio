# n8n Companion

A lightweight, high-performance Flutter companion app for monitoring and managing your n8n workflows on the go. Designed with n8n's visual style and dark mode aesthetics, it connects directly to your self-hosted or cloud n8n instance via cookie-based session authentication.

## Features

- **Real-Time Dashboard**: Quick stats on active/inactive workflows and execution success rates.
- **Workflow Management**: Search and toggle active states of workflows instantly.
- **Detailed Timeline View**: Inspect nodes and configuration structure of individual workflows.
- **Execution Logs**: Scroll through execution history, monitor run times, and trigger manual workflow test runs directly from your phone.
- **Secure Storage**: Credentials and session cookies are cached locally using secure platform preferences.

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- [Flutter SDK](https://docs.flutter.dev/get-started/install) (v3.12.0 or higher)
- Dart SDK
- For Android: Android Studio & Android SDK
- For iOS: macOS, Xcode & CocoaPods

### Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mohd-shariq-osmani/n8n-companion.git
   cd n8n-companion
   ```

2. **Install dependencies:**
   ```bash
   flutter pub get
   ```

3. **Run the app in development mode:**
   ```bash
   # Detect connected devices (simulators or physical hardware)
   flutter devices
   
   # Launch on a specific device
   flutter run
   ```

---

## Platform Build & Deployment

### Android (APK Release)

To generate a standalone APK that you can install directly on your device:

1. **Compile the release build:**
   ```bash
   flutter build apk --release
   ```
   *The compiled APK will be located at:* `build/app/outputs/flutter-apk/app-release.apk`

2. **Install on physical device via USB (using ADB):**
   ```bash
   adb install build/app/outputs/flutter-apk/app-release.apk
   ```
   *(Alternatively, copy the `app-release.apk` file directly to your phone via USB or Google Drive and install it manually).*

---

### iOS (ipa Build)

Because iOS deployment requires provisioning profiles and code signing, follow these steps to build and install on your iPhone:

#### Option A: Running directly from Xcode (Recommended for Testing)

1. Open the iOS project in Xcode:
   ```bash
   open ios/Runner.xcworkspace
   ```
2. Under **Runner (Project Settings) > Signing & Capabilities**:
   - Enable **Automatically manage signing**.
   - Select your personal Apple Developer account under **Team**.
   - Change the **Bundle Identifier** slightly if needed to avoid conflicts.
3. Connect your physical iPhone via USB, select it from Xcode's device dropdown, and click the **Play** button (or press `Cmd + R`) to compile and run.

#### Option B: Building an Ad-Hoc `.ipa`

1. Build the archive package:
   ```bash
   flutter build ipa --export-method=ad-hoc
   ```
2. Distribute the generated `.ipa` file using Apple Configurator, TestFlight, or custom OTA deployment.

---

## Code Structure

- `/lib/data/models/`: Core data structures (`UserSession`, `Workflow`, `Execution`).
- `/lib/data/services/`: API communication client implementing cookie auth and n8n internal `/rest/` payloads.
- `/lib/data/repositories/`: Local storage coordination and data caching.
- `/lib/ui/core/`: Slate dark theme definitions, brand palettes, and styles.
- `/lib/ui/features/`: Feature screens (Dashboard, Login, Workflow Details, Execution History).

---

## App Icon & Brand Customization

To regenerate launcher icons after replacing the source asset (`assets/icon/app_icon.jpg`):
```bash
flutter pub run flutter_launcher_icons
```
