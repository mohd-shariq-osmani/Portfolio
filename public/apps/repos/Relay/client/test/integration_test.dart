import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:android/services/connection_manager.dart';
import 'package:flutter/services.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  Process? serverProcess;
  
  setUpAll(() async {
    // Mock the MethodChannel for flutter_secure_storage
    const channel = MethodChannel('plugins.it_nomads.com/flutter_secure_storage');
    TestDefaultBinaryMessengerBinding.instance.defaultBinaryMessenger
        .setMockMethodCallHandler(channel, (MethodCall methodCall) async {
      if (methodCall.method == 'read') {
        return null; // Return null to simulate no stored token
      }
      return null;
    });

    // Start Python server in the background
    print('Starting Python server...');
    serverProcess = await Process.start(
      '../server/venv/bin/python',
      ['-u', 'server.py', '--headless'],
      workingDirectory: '../server',
    );
  });

  tearDownAll(() {
    print('Stopping Python server...');
    serverProcess?.kill();
  });

  test('End-to-End Handshake and Command Test', () async {
    // 1. Read Python server stderr to extract generated Pairing PIN in background listener
    String? pin;
    serverProcess!.stderr
        .transform(utf8.decoder)
        .transform(const LineSplitter())
        .listen((line) {
      print('Server Log: $line');
      if (line.contains('Current Pairing PIN:')) {
        pin = line.split(':').last.trim();
      }
    });

    // Wait up to 5 seconds for the PIN to be generated and printed
    for (int i = 0; i < 50; i++) {
      if (pin != null) break;
      await Future.delayed(const Duration(milliseconds: 100));
    }

    expect(pin, isNotNull);
    expect(pin!.length, equals(6));
    print('Parsed Pairing PIN: $pin');

    // 2. Instantiate ConnectionManager and connect
    final manager = ConnectionManager();
    print('Connecting client to ws://localhost:5389...');
    await manager.connect('localhost', 5389);
    
    // Wait briefly for connection status update
    await Future.delayed(const Duration(milliseconds: 500));
    expect(manager.state, equals(DeviceConnectionState.pairingRequired));

    // 3. Perform pairing handshake
    print('Sending pairing request with PIN $pin...');
    final pairResponse = await manager.pair(pin!);
    print('Pair Response: $pairResponse');
    expect(pairResponse['status'], equals('success'));
    expect(pairResponse['token'], isNotNull);
    print('Pairing successful! Token received: ${pairResponse['token']}');
    
    expect(manager.state, equals(DeviceConnectionState.connected));

    // 4. Send Mouse Move command
    print('Sending mouse move command...');
    manager.sendCommand('mouse_move', {'dx': 5.0, 'dy': 5.0});
    await Future.delayed(const Duration(milliseconds: 200));

    // 5. Send Keyboard text command
    print('Sending keyboard text command...');
    manager.sendCommand('keyboard_text', {'text': 'Hello from Flutter Integration Test!'});
    await Future.delayed(const Duration(milliseconds: 200));

    // 6. Test Disconnect
    print('Disconnecting client...');
    manager.disconnect();
    expect(manager.state, equals(DeviceConnectionState.disconnected));
  });
}
