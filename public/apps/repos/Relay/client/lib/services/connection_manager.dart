import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:web_socket_channel/io.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'secure_storage.dart';

enum DeviceConnectionState {
  disconnected,
  connecting,
  pairingRequired,
  authenticating,
  connected
}

class ConnectionManager extends ChangeNotifier {
  final SecureStorage _secureStorage = SecureStorage();
  
  DeviceConnectionState _state = DeviceConnectionState.disconnected;
  DeviceConnectionState get state => _state;
  
  String? _connectedHostAddress;
  String? get connectedHostAddress => _connectedHostAddress;
  
  String? _connectedHostName;
  String? get connectedHostName => _connectedHostName;
  
  WebSocketChannel? _channel;
  StreamSubscription? _subscription;
  
  Timer? _heartbeatTimer;
  Timer? _reconnectTimer;
  
  String? _lastAttemptedIp;
  int? _lastAttemptedPort;
  bool _isAutoReconnecting = false;
  bool _isClosing = false;
  
  // Completers for handshake
  Completer<Map<String, dynamic>>? _pairingCompleter;
  Completer<bool>? _authCompleter;
  Completer<List<Map<String, dynamic>>>? _appsCompleter;

  // Clipboard state
  bool _clipboardAutoSync = true;
  bool get clipboardAutoSync => _clipboardAutoSync;
  
  set clipboardAutoSync(bool val) {
    _clipboardAutoSync = val;
    notifyListeners();
  }

  void _setState(DeviceConnectionState state) {
    _state = state;
    notifyListeners();
  }

  Future<void> connect(String ip, int port, {String? hostname}) async {
    _lastAttemptedIp = ip;
    _lastAttemptedPort = port;
    _connectedHostName = hostname;
    _isAutoReconnecting = false;
    _reconnectTimer?.cancel();
    _setState(DeviceConnectionState.connecting);
    await _establishConnection();
  }

  Future<void> _establishConnection() async {
    if (_isClosing) return;
    final wsUrl = 'ws://$_lastAttemptedIp:$_lastAttemptedPort';
    print('Connecting to $wsUrl...');
    
    // Clear old channel without triggering onDone callbacks
    _cancelChannelListeners();
    
    try {
      // Connect to WebSocket with connect timeout
      _channel = IOWebSocketChannel.connect(
        Uri.parse(wsUrl),
        connectTimeout: const Duration(seconds: 5),
      );
      
      _subscription = _channel!.stream.listen(
        (data) => _onMessageReceived(data),
        onDone: _onConnectionClosed,
        onError: _onConnectionError,
        cancelOnError: false,
      );
      
      // Check if we have a token (try hostname first, then IP key)
      String? token;
      if (_connectedHostName != null) {
        token = await _secureStorage.getToken(_connectedHostName!);
      }
      if (token == null) {
        token = await _secureStorage.getToken('$_lastAttemptedIp:$_lastAttemptedPort');
      }

      if (token != null) {
        _setState(DeviceConnectionState.authenticating);
        final success = await _sendAuthRequest(token);
        if (success) {
          _connectedHostAddress = '$_lastAttemptedIp:$_lastAttemptedPort';
          _setState(DeviceConnectionState.connected);
          _isAutoReconnecting = false;
          
          if (_connectedHostName != null) {
            await _secureStorage.saveToken(_connectedHostName!, token);
            await _secureStorage.saveHostMetadata(_connectedHostAddress!, _connectedHostName!);
            await _secureStorage.saveLastConnectedHost(_connectedHostAddress!, _connectedHostName!);
          } else {
            await _secureStorage.saveLastConnectedHost(_connectedHostAddress!, 'Unknown Host');
          }
          _startHeartbeat();
        } else {
          // Token rejected, delete it and show pairing screen
          print('Stored token rejected by host. Clearing token...');
          if (_connectedHostName != null) {
            await _secureStorage.removeToken(_connectedHostName!);
          }
          await _secureStorage.removeToken('$_lastAttemptedIp:$_lastAttemptedPort');
          
          _isAutoReconnecting = false;
          _reconnectTimer?.cancel();
          _setState(DeviceConnectionState.pairingRequired);
        }
      } else {
        _isAutoReconnecting = false;
        _reconnectTimer?.cancel();
        _setState(DeviceConnectionState.pairingRequired);
      }
    } catch (e) {
      print('Connection establishment failed: $e');
      _onConnectionError(e);
    }
  }

  Future<bool> _sendAuthRequest(String token) async {
    _authCompleter = Completer<bool>();
    
    final authMsg = {
      'type': 'auth_request',
      'token': token,
      'device_name': 'Android Remote Client'
    };
    
    try {
      _channel!.sink.add(json.encode(authMsg));
      // Wait for auth response with a timeout
      return await _authCompleter!.future.timeout(const Duration(seconds: 4));
    } catch (e) {
      print('Auth request timed out/failed: $e');
      return false;
    }
  }

  Future<Map<String, dynamic>> pair(String pin) async {
    if (_state == DeviceConnectionState.disconnected) {
      _setState(DeviceConnectionState.connecting);
      await _establishConnection();
    }

    if (_state != DeviceConnectionState.pairingRequired && _state != DeviceConnectionState.connecting) {
      return {'status': 'failed', 'reason': 'Not in pairing mode (state: $_state)'};
    }
    
    _pairingCompleter = Completer<Map<String, dynamic>>();
    
    final pairMsg = {
      'type': 'pair_request',
      'pin': pin,
      'device_name': 'Android Remote Client'
    };
    
    try {
      _channel!.sink.add(json.encode(pairMsg));
      final response = await _pairingCompleter!.future.timeout(const Duration(seconds: 4));
      
      if (response['status'] == 'success') {
        final token = response['token'] as String;
        final hostName = response['host_name'] as String?;
        final hostKey = '$_lastAttemptedIp:$_lastAttemptedPort';
        if (hostName != null) {
          _connectedHostName = hostName;
          await _secureStorage.saveToken(hostName, token);
          await _secureStorage.saveHostMetadata(hostKey, hostName);
        } else {
          await _secureStorage.saveHostMetadata(hostKey, 'Paired PC');
        }
        
        await _secureStorage.saveToken(hostKey, token);
        
        _connectedHostAddress = hostKey;
        _setState(DeviceConnectionState.connected);
        
        if (_connectedHostName != null) {
          await _secureStorage.saveLastConnectedHost(_connectedHostAddress!, _connectedHostName!);
        } else {
          await _secureStorage.saveLastConnectedHost(_connectedHostAddress!, 'Unknown Host');
        }
        _startHeartbeat();
      }
      return response;
    } catch (e) {
      print('Pairing error: $e');
      return {'status': 'failed', 'reason': 'Timeout or error during pairing'};
    }
  }

  Future<List<Map<String, dynamic>>> getApps() async {
    if (_state != DeviceConnectionState.connected) return [];
    _appsCompleter = Completer<List<Map<String, dynamic>>>();
    sendCommand('get_apps', {});
    try {
      return await _appsCompleter!.future.timeout(const Duration(seconds: 15));
    } catch (e) {
      print('Failed to retrieve apps list: $e');
      return [];
    }
  }

  void _onMessageReceived(dynamic messageStr) {
    try {
      final data = json.decode(messageStr as String) as Map<String, dynamic>;
      final type = data['type'] as String?;
      
      if (type == 'pong') {
        // Heartbeat response, ignore
        return;
      }
      
      if (type == 'auth_response') {
        if (_authCompleter != null && !_authCompleter!.isCompleted) {
          final success = data['status'] == 'success';
          final hostName = data['host_name'] as String?;
          if (success && hostName != null) {
            _connectedHostName = hostName;
          }
          _authCompleter!.complete(success);
        }
      } else if (type == 'pair_response') {
        if (_pairingCompleter != null && !_pairingCompleter!.isCompleted) {
          _pairingCompleter!.complete(data);
        }
      } else if (type == 'apps_list') {
        if (_appsCompleter != null && !_appsCompleter!.isCompleted) {
          final appsRaw = data['apps'] as List<dynamic>? ?? [];
          final apps = appsRaw.map((a) => Map<String, dynamic>.from(a as Map)).toList();
          _appsCompleter!.complete(apps);
        }
      } else if (type == 'clipboard_push' || (type == 'clipboard_set' && _state == DeviceConnectionState.connected)) {
        final content = data['content'] as String?;
        if (content != null && _clipboardAutoSync) {
          // Copy content directly to device clipboard
          Clipboard.setData(ClipboardData(text: content));
          print('Local Android clipboard synced with host.');
        }
      }
    } catch (e) {
      print('Error parsing incoming message: $e');
    }
  }

  void sendCommand(String type, Map<String, dynamic> payload) {
    if (_state != DeviceConnectionState.connected || _channel == null) {
      return;
    }
    
    final command = {
      'type': type,
      ...payload
    };
    
    try {
      _channel!.sink.add(json.encode(command));
    } catch (e) {
      print('Failed to send command $type: $e');
    }
  }

  void _startHeartbeat() {
    _heartbeatTimer?.cancel();
    _heartbeatTimer = Timer.periodic(const Duration(seconds: 5), (timer) {
      if (_state == DeviceConnectionState.connected && _channel != null) {
        try {
          _channel!.sink.add(json.encode({'type': 'ping'}));
        } catch (e) {
          print('Ping failed, triggering reconnect: $e');
          _onConnectionError(e);
        }
      }
    });
  }

  void _onConnectionClosed() {
    if (_isClosing) return;
    print('WebSocket connection closed.');
    _handleDisconnectState();
  }

  void _onConnectionError(dynamic error) {
    if (_isClosing) return;
    print('WebSocket error: $error');
    _handleDisconnectState();
  }

  void _handleDisconnectState() {
    _cancelChannelListeners();
    _heartbeatTimer?.cancel();
    _heartbeatTimer = null;
    _connectedHostAddress = null;
    _setState(DeviceConnectionState.disconnected);
    
    // Auto-reconnect only if we have target info and NOT in pairing mode
    if (_lastAttemptedIp != null && _lastAttemptedPort != null && !_isAutoReconnecting) {
      _startAutoReconnect();
    }
  }

  void _startAutoReconnect() {
    _isAutoReconnecting = true;
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer.periodic(const Duration(seconds: 4), (timer) async {
      if (_state == DeviceConnectionState.disconnected && _isAutoReconnecting) {
        print('Attempting auto-reconnect...');
        await _establishConnection();
      } else {
        timer.cancel();
        _isAutoReconnecting = false;
      }
    });
  }

  void disconnect() {
    _isClosing = true;
    _isAutoReconnecting = false;
    _reconnectTimer?.cancel();
    _heartbeatTimer?.cancel();
    _subscription?.cancel();
    try { _channel?.sink.close(); } catch (_) {}
    _channel = null;
    _subscription = null;
    _heartbeatTimer = null;
    _connectedHostAddress = null;
    _connectedHostName = null;
    _isClosing = false;
    _setState(DeviceConnectionState.disconnected);
  }

  // Cancel listeners without closing the sink (avoids triggering onDone during reconnects)
  void _cancelChannelListeners() {
    _subscription?.cancel();
    _subscription = null;
  }

  void _cleanupConnection() {
    _isClosing = true;
    _heartbeatTimer?.cancel();
    _subscription?.cancel();
    try { _channel?.sink.close(); } catch (_) {}
    _channel = null;
    _subscription = null;
    _heartbeatTimer = null;
    _connectedHostAddress = null;
    _connectedHostName = null;
    _isClosing = false;
  }

  Future<List<String>> getPairedHosts() async {
    final tokens = await _secureStorage.getAllTokens();
    return tokens.keys.toList();
  }

  Future<Map<String, String>> getPairedHostsWithNames() async {
    final tokens = await _secureStorage.getAllTokens();
    final metadata = await _secureStorage.getHostsMetadata();
    
    final result = <String, String>{};
    for (final key in tokens.keys) {
      if (key.contains(':')) {
        final name = metadata[key] ?? 'Paired PC';
        result[key] = name;
      }
    }
    return result;
  }

  Future<void> forgetHost(String hostId) async {
    await _secureStorage.removeToken(hostId);
    await _secureStorage.removeHostMetadata(hostId);
    if (_connectedHostName == hostId || _connectedHostAddress == hostId) {
      disconnect();
    }
    notifyListeners();
  }

  @override
  void dispose() {
    disconnect();
    super.dispose();
  }
}
