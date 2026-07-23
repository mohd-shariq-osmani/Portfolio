import 'package:flutter/material.dart';
import '../services/connection_manager.dart';
import '../services/discovery_service.dart';

class PairingScreen extends StatefulWidget {
  final ConnectionManager connectionManager;

  const PairingScreen({super.key, required this.connectionManager});

  @override
  State<PairingScreen> createState() => _PairingScreenState();
}

class _PairingScreenState extends State<PairingScreen> {
  final DiscoveryService _discoveryService = DiscoveryService();
  final TextEditingController _ipController = TextEditingController();
  final TextEditingController _portController = TextEditingController(text: '5389');
  
  List<DiscoveredHost> _discoveredHosts = [];
  bool _isSearching = false;
  
  // PIN Controller
  final List<TextEditingController> _pinControllers = List.generate(6, (_) => TextEditingController());
  final List<FocusNode> _pinFocusNodes = List.generate(6, (_) => FocusNode());

  bool _isPinDialogShowing = false;
  BuildContext? _dialogContext;

  @override
  void initState() {
    super.initState();
    _startDiscovery();
    widget.connectionManager.addListener(_connectionStateListener);
    
    // Auto-trigger if already in pairingRequired state on enter
    if (widget.connectionManager.state == DeviceConnectionState.pairingRequired) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _showPinDialog(context);
      });
    }
  }

  @override
  void dispose() {
    widget.connectionManager.removeListener(_connectionStateListener);
    if (_isPinDialogShowing && _dialogContext != null) {
      try {
        Navigator.of(_dialogContext!).pop();
      } catch (e) {
        print("Error popping PIN dialog on dispose: $e");
      }
    }
    _ipController.dispose();
    _portController.dispose();
    for (var controller in _pinControllers) {
      controller.dispose();
    }
    for (var node in _pinFocusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  void _connectionStateListener() {
    final state = widget.connectionManager.state;
    if (state == DeviceConnectionState.pairingRequired) {
      _showPinDialog(context);
    } else if (state == DeviceConnectionState.connected || state == DeviceConnectionState.disconnected) {
      if (_isPinDialogShowing && _dialogContext != null) {
        Navigator.of(_dialogContext!).pop();
      }
    }
  }

  Future<void> _startDiscovery() async {
    if (_isSearching) return;
    setState(() {
      _isSearching = true;
      _discoveredHosts.clear();
    });

    try {
      final hosts = await _discoveryService.discoverHosts();
      setState(() {
        _discoveredHosts = hosts;
      });
    } catch (e) {
      print('MDNS discovery failed: $e');
    } finally {
      setState(() {
        _isSearching = false;
      });
    }
  }

  void _manualConnect() {
    final ip = _ipController.text.trim();
    final portStr = _portController.text.trim();
    if (ip.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid IP address.')),
      );
      return;
    }

    final port = int.tryParse(portStr) ?? 5389;
    widget.connectionManager.connect(ip, port);
  }

  void _showPinDialog(BuildContext context) {
    if (_isPinDialogShowing) return;
    _isPinDialogShowing = true;

    for (var controller in _pinControllers) {
      controller.clear();
    }

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (dialogCtx) {
        _dialogContext = dialogCtx;
        return StatefulBuilder(
          builder: (dialogCtx, setDialogState) {
            return AlertDialog(
              backgroundColor: const Color(0xFD1E293B), // Sleek glass-like dark
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: const Text(
                'Enter Pairing PIN',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Enter the 6-digit PIN displayed on your PC server tray icon.',
                    style: TextStyle(color: Colors.grey, fontSize: 13),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: List.generate(6, (index) {
                      return SizedBox(
                        width: 42,
                        child: TextField(
                          controller: _pinControllers[index],
                          focusNode: _pinFocusNodes[index],
                          keyboardType: TextInputType.number,
                          textAlign: TextAlign.center,
                          textAlignVertical: TextAlignVertical.center,
                          style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
                          maxLength: 1,
                          decoration: InputDecoration(
                            counterText: '',
                            contentPadding: EdgeInsets.zero,
                            enabledBorder: OutlineInputBorder(
                              borderSide: const BorderSide(color: Colors.grey),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderSide: const BorderSide(color: Colors.blueAccent, width: 2),
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          onChanged: (value) {
                            if (value.isNotEmpty) {
                              if (index < 5) {
                                _pinFocusNodes[index + 1].requestFocus();
                              } else {
                                _pinFocusNodes[index].unfocus();
                              }
                            } else {
                              if (index > 0) {
                                _pinFocusNodes[index - 1].requestFocus();
                              }
                            }
                          },
                        ),
                      );
                    }),
                  ),
                ],
              ),
              actionsAlignment: MainAxisAlignment.spaceBetween,
              actions: [
                TextButton(
                  onPressed: () {
                    widget.connectionManager.disconnect();
                  },
                  child: const Text('Cancel', style: TextStyle(color: Colors.redAccent)),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blueAccent,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: () async {
                    final pin = _pinControllers.map((c) => c.text).join();
                    if (pin.length < 6) {
                      ScaffoldMessenger.of(dialogCtx).showSnackBar(
                        const SnackBar(content: Text('Please enter all 6 digits.')),
                      );
                      return;
                    }
                    
                    final result = await widget.connectionManager.pair(pin);
                    if (result['status'] != 'success') {
                      ScaffoldMessenger.of(dialogCtx).showSnackBar(
                        SnackBar(content: Text(result['reason'] ?? 'Pairing failed.')),
                      );
                    }
                  },
                  child: const Text('Pair', style: TextStyle(color: Colors.white)),
                ),
              ],
            );
          },
        );
      },
    ).then((_) {
      _isPinDialogShowing = false;
      _dialogContext = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final connectionState = widget.connectionManager.state;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A), // Dark slate
      body: SafeArea(
        child: SingleChildScrollView(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 16),
                Center(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.blueAccent.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.blueAccent.withOpacity(0.3)),
                        ),
                        child: const Icon(Icons.cell_tower, color: Colors.blueAccent, size: 28),
                      ),
                      const SizedBox(width: 12),
                      const Text(
                        'Relay',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 32,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.0,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                const Center(
                  child: Text(
                    'Connect to PC',
                    style: TextStyle(
                      color: Colors.grey,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                const Center(
                  child: Text(
                    'Ensure phone and PC are on the same Wi-Fi network.',
                    style: TextStyle(color: Colors.grey, fontSize: 14),
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: 36),
                
                // Discovered devices card
                SizedBox(
                  height: 240,
                  child: Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFF334155)),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Discovered Hosts',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              IconButton(
                                icon: _isSearching
                                    ? const SizedBox(
                                        width: 18,
                                        height: 18,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          valueColor: AlwaysStoppedAnimation(Colors.blueAccent),
                                        ),
                                      )
                                    : const Icon(Icons.refresh, color: Colors.blueAccent),
                                onPressed: _startDiscovery,
                              ),
                            ],
                          ),
                          const Divider(color: Color(0xFF334155)),
                          Expanded(
                            child: _discoveredHosts.isEmpty
                                ? Center(
                                    child: Text(
                                      _isSearching ? 'Scanning LAN...' : 'No servers found. Pull to refresh.',
                                      style: const TextStyle(color: Colors.grey),
                                    ),
                                  )
                                : ListView.builder(
                                    itemCount: _discoveredHosts.length,
                                    itemBuilder: (context, index) {
                                      final host = _discoveredHosts[index];
                                      return Card(
                                        color: const Color(0xFF0F172A),
                                        margin: const EdgeInsets.symmetric(vertical: 6.0),
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(10),
                                          side: const BorderSide(color: Color(0xFF334155)),
                                        ),
                                        child: ListTile(
                                          leading: const Icon(Icons.computer, color: Colors.blueAccent),
                                          title: Text(
                                            host.name,
                                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                                          ),
                                          subtitle: Text(
                                            '${host.ip}:${host.port}',
                                            style: const TextStyle(color: Colors.grey),
                                          ),
                                          trailing: const Icon(Icons.chevron_right, color: Colors.grey),
                                          onTap: () {
                                            widget.connectionManager.connect(host.ip, host.port, hostname: host.name);
                                          },
                                        ),
                                      );
                                    },
                                  ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                
                // Paired Devices Card
                FutureBuilder<Map<String, String>>(
                  future: widget.connectionManager.getPairedHostsWithNames(),
                  builder: (context, snapshot) {
                    if (!snapshot.hasData || snapshot.data!.isEmpty) {
                      return const SizedBox.shrink();
                    }
                    
                    final savedHosts = snapshot.data!;
                    return Container(
                      margin: const EdgeInsets.only(bottom: 20.0),
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFF334155)),
                      ),
                      padding: const EdgeInsets.all(16.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Paired Devices',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const Divider(color: Color(0xFF334155)),
                          ListView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: savedHosts.length,
                            itemBuilder: (context, index) {
                              final address = savedHosts.keys.elementAt(index);
                              final name = savedHosts[address]!;
                              return Card(
                                color: const Color(0xFF0F172A),
                                margin: const EdgeInsets.symmetric(vertical: 4.0),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  side: const BorderSide(color: Color(0xFF334155)),
                                ),
                                child: ListTile(
                                  leading: const Icon(Icons.computer, color: Colors.greenAccent),
                                  title: Text(
                                    name,
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                                  ),
                                  subtitle: Text(
                                    address,
                                    style: const TextStyle(color: Colors.grey, fontSize: 12),
                                  ),
                                  trailing: IconButton(
                                    icon: const Icon(Icons.delete_outline, color: Colors.redAccent),
                                    onPressed: () async {
                                      await widget.connectionManager.forgetHost(address);
                                      await widget.connectionManager.forgetHost(name);
                                      setState(() {}); // Refresh list
                                    },
                                  ),
                                  onTap: () {
                                    final parts = address.split(':');
                                    if (parts.length == 2) {
                                      final ip = parts[0];
                                      final port = int.tryParse(parts[1]) ?? 5389;
                                      widget.connectionManager.connect(ip, port, hostname: name);
                                    }
                                  },
                                ),
                              );
                            },
                          ),
                        ],
                      ),
                    );
                  },
                ),
                
                // Manual configuration input card
                Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFF334155)),
                  ),
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const Text(
                      'Manual Connection',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          flex: 3,
                          child: TextField(
                            controller: _ipController,
                            style: const TextStyle(color: Colors.white),
                            keyboardType: TextInputType.text,
                            decoration: InputDecoration(
                              hintText: '192.168.1.100',
                              hintStyle: const TextStyle(color: Colors.grey),
                              labelText: 'IP Address',
                              labelStyle: const TextStyle(color: Colors.grey),
                              filled: true,
                              fillColor: const Color(0xFF0F172A),
                              enabledBorder: OutlineInputBorder(
                                borderSide: const BorderSide(color: Color(0xFF334155)),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderSide: const BorderSide(color: Colors.blueAccent),
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          flex: 1,
                          child: TextField(
                            controller: _portController,
                            style: const TextStyle(color: Colors.white),
                            keyboardType: TextInputType.number,
                            decoration: InputDecoration(
                              hintText: '5389',
                              hintStyle: const TextStyle(color: Colors.grey),
                              labelText: 'Port',
                              labelStyle: const TextStyle(color: Colors.grey),
                              filled: true,
                              fillColor: const Color(0xFF0F172A),
                              enabledBorder: OutlineInputBorder(
                                borderSide: const BorderSide(color: Color(0xFF334155)),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderSide: const BorderSide(color: Colors.blueAccent),
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blueAccent,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      onPressed: connectionState == DeviceConnectionState.connecting ? null : _manualConnect,
                      child: connectionState == DeviceConnectionState.connecting
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2.5,
                                valueColor: AlwaysStoppedAnimation(Colors.white),
                              ),
                            )
                          : const Text(
                              'Connect',
                              style: TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    ),
  );
  }
}
