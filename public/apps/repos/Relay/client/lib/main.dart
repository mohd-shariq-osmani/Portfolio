import 'package:flutter/material.dart';
import 'services/connection_manager.dart';
import 'services/secure_storage.dart';
import 'screens/pairing_screen.dart';
import 'screens/trackpad_screen.dart';
import 'screens/keyboard_screen.dart';
import 'screens/clipboard_screen.dart';
import 'screens/power_screen.dart';
import 'screens/launch_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const RelayApp());
}

class RelayApp extends StatelessWidget {
  const RelayApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Relay Remote',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F172A), // Rich Slate dark
        primaryColor: Colors.blueAccent,
        sliderTheme: const SliderThemeData(
          showValueIndicator: ShowValueIndicator.always,
        ),
      ),
      home: const MainScaffold(),
    );
  }
}

class MainScaffold extends StatefulWidget {
  const MainScaffold({super.key});

  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> {
  final ConnectionManager _connectionManager = ConnectionManager();
  int _currentTabIndex = 0;

  @override
  void initState() {
    super.initState();
    _autoConnectLastHost();
  }

  Future<void> _autoConnectLastHost() async {
    final secureStorage = SecureStorage();
    final lastHost = await secureStorage.getLastConnectedHost();
    if (lastHost != null) {
      final address = lastHost['address']!;
      final name = lastHost['name']!;
      final parts = address.split(':');
      if (parts.length == 2) {
        final ip = parts[0];
        final port = int.tryParse(parts[1]) ?? 5389;
        print('Auto-connecting to last host: $name ($ip:$port)...');
        _connectionManager.connect(ip, port, hostname: name);
      }
    }
  }

  @override
  void dispose() {
    _connectionManager.dispose();
    super.dispose();
  }

  Widget _getSelectedScreen() {
    switch (_currentTabIndex) {
      case 0:
        return TrackpadScreen(connectionManager: _connectionManager);
      case 1:
        return KeyboardScreen(connectionManager: _connectionManager);
      case 2:
        return LaunchScreen(connectionManager: _connectionManager);
      case 3:
        return ClipboardScreen(connectionManager: _connectionManager);
      case 4:
        return PowerScreen(connectionManager: _connectionManager);
      default:
        return TrackpadScreen(connectionManager: _connectionManager);
    }
  }

  Widget _buildStatusHeader(String hostInfo, DeviceConnectionState state) {
    Color ledColor = Colors.grey;
    List<BoxShadow> ledGlow = [];
    String stateText = 'Disconnected';

    if (state == DeviceConnectionState.connected) {
      ledColor = const Color(0xFF10B981); // Emerald green
      ledGlow = [
        BoxShadow(
          color: ledColor.withOpacity(0.5),
          blurRadius: 10,
          spreadRadius: 2,
        )
      ];
      stateText = 'Connected';
    } else if (state == DeviceConnectionState.connecting || state == DeviceConnectionState.authenticating) {
      ledColor = Colors.orangeAccent;
      ledGlow = [
        BoxShadow(
          color: ledColor.withOpacity(0.4),
          blurRadius: 8,
          spreadRadius: 1,
        )
      ];
      stateText = 'Connecting';
    } else if (state == DeviceConnectionState.pairingRequired) {
      ledColor = Colors.blueAccent;
      stateText = 'Pairing Required';
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
      decoration: const BoxDecoration(
        color: Color(0xFF1E293B),
        border: Border(bottom: BorderSide(color: Color(0xFF334155))),
      ),
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            // Status LED
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                color: ledColor,
                shape: BoxShape.circle,
                boxShadow: ledGlow,
              ),
            ),
            const SizedBox(width: 12),
            
            // Connection Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(
                    children: [
                      const Text(
                        'Relay',
                        style: TextStyle(
                          color: Colors.blueAccent,
                          fontWeight: FontWeight.w900,
                          fontSize: 13,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Container(
                        width: 3,
                        height: 3,
                        decoration: const BoxDecoration(
                          color: Colors.grey,
                          shape: BoxShape.circle,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          state == DeviceConnectionState.connected ? hostInfo : stateText,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 13,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                  if (state == DeviceConnectionState.connected)
                    const Text(
                      'Ready to control',
                      style: TextStyle(color: Colors.grey, fontSize: 11),
                    ),
                ],
              ),
            ),
            
            // Action button (Disconnect/Reset)
            if (state != DeviceConnectionState.disconnected)
              IconButton(
                icon: const Icon(Icons.power_settings_new_outlined, color: Colors.redAccent, size: 20),
                onPressed: () {
                  _connectionManager.disconnect();
                },
                tooltip: 'Disconnect',
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: _connectionManager,
      builder: (context, _) {
        final state = _connectionManager.state;
        // Strip mDNS .local suffix for display
        String rawHost = _connectionManager.connectedHostName ?? _connectionManager.connectedHostAddress ?? 'Relay Server';
        final hostAddress = rawHost.replaceAll(RegExp(r'\.local\.?$', caseSensitive: false), '');

        // Only show Pairing Screen when truly disconnected or pairing needed
        // Keep showing main scaffold during authenticating to avoid flicker
        if (state == DeviceConnectionState.disconnected ||
            state == DeviceConnectionState.pairingRequired) {
          return PairingScreen(connectionManager: _connectionManager);
        }

        return Scaffold(
          body: Column(
            children: [
              // Top Status Header
              _buildStatusHeader(hostAddress, state),
              
              // Selected Feature Screen
              Expanded(
                child: _getSelectedScreen(),
              ),
            ],
          ),
          
          // Bottom Navigation Bar
          bottomNavigationBar: Container(
            decoration: const BoxDecoration(
              border: Border(top: BorderSide(color: Color(0xFF334155), width: 1)),
            ),
            child: BottomNavigationBar(
              currentIndex: _currentTabIndex,
              onTap: (index) {
                setState(() {
                  _currentTabIndex = index;
                });
              },
              backgroundColor: const Color(0xFF1E293B),
              selectedItemColor: Colors.blueAccent,
              unselectedItemColor: Colors.grey,
              type: BottomNavigationBarType.fixed,
              showSelectedLabels: true,
              showUnselectedLabels: true,
              selectedLabelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
              unselectedLabelStyle: const TextStyle(fontSize: 11),
              items: const [
                BottomNavigationBarItem(
                  icon: Icon(Icons.touch_app),
                  label: 'Trackpad',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.keyboard),
                  label: 'Keyboard',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.rocket_launch),
                  label: 'Launch',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.assignment),
                  label: 'Clipboard',
                ),
                BottomNavigationBarItem(
                  icon: Icon(Icons.power_settings_new),
                  label: 'Power',
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
