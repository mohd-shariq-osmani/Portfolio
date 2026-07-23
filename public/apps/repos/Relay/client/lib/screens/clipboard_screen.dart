import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../services/connection_manager.dart';

class ClipboardScreen extends StatefulWidget {
  final ConnectionManager connectionManager;

  const ClipboardScreen({super.key, required this.connectionManager});

  @override
  State<ClipboardScreen> createState() => _ClipboardScreenState();
}

class _ClipboardScreenState extends State<ClipboardScreen> {
  String _localClipboardPreview = 'Tap "Refresh Local Preview" to read';
  
  @override
  void initState() {
    super.initState();
    _readLocalClipboard();
  }

  Future<void> _readLocalClipboard() async {
    final data = await Clipboard.getData(Clipboard.kTextPlain);
    setState(() {
      _localClipboardPreview = data?.text ?? '(Clipboard is empty)';
    });
  }

  Future<void> _sendClipboardToPC() async {
    final data = await Clipboard.getData(Clipboard.kTextPlain);
    final text = data?.text;
    if (text != null && text.isNotEmpty) {
      widget.connectionManager.sendCommand('clipboard_set', {
        'content': text,
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Sent phone clipboard to PC!')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Phone clipboard is empty!')),
      );
    }
  }

  void _pullClipboardFromPC() {
    widget.connectionManager.sendCommand('clipboard_get', {});
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Requested PC clipboard...')),
    );
    // Briefly delay reading local clipboard to let the websocket response arrive
    Future.delayed(const Duration(milliseconds: 600), () {
      if (mounted) {
        _readLocalClipboard();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final autoSync = widget.connectionManager.clipboardAutoSync;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 12),
              const Center(
                child: Text(
                  'Clipboard Sync',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Automatic Sync card
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                padding: const EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Automatic Clipboard Sync',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                          ),
                          SizedBox(height: 4),
                          Text(
                            'Pushes text from PC to your phone clipboard in real time.',
                            style: TextStyle(color: Colors.grey, fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                    Switch(
                      value: autoSync,
                      activeColor: Colors.blueAccent,
                      onChanged: (val) {
                        widget.connectionManager.clipboardAutoSync = val;
                      },
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Actions Header
              const Text('Manual Actions', style: TextStyle(color: Colors.grey, fontSize: 13, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              
              // Manual Actions Row
              Row(
                children: [
                  Expanded(
                    child: Material(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(16),
                      child: InkWell(
                        onTap: _sendClipboardToPC,
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 24),
                          decoration: BoxDecoration(
                            border: Border.all(color: const Color(0xFF334155)),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Column(
                            children: const [
                              Icon(Icons.arrow_upward, color: Colors.greenAccent, size: 32),
                              SizedBox(height: 12),
                              Text('Send to PC', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                            ],
                          ),

                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Material(
                      color: const Color(0xFF1E293B),
                      borderRadius: BorderRadius.circular(16),
                      child: InkWell(
                        onTap: _pullClipboardFromPC,
                        borderRadius: BorderRadius.circular(16),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 24),
                          decoration: BoxDecoration(
                            border: Border.all(color: const Color(0xFF334155)),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: const Column(
                            children: [
                              Icon(Icons.arrow_downward, color: Colors.blueAccent, size: 32),
                              SizedBox(height: 12),
                              Text('Pull from PC', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 28),

              // Local Clipboard Preview card
              const Text('Local Clipboard Preview', style: TextStyle(color: Colors.grey, fontSize: 13, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              Expanded(
                child: Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFF334155)),
                  ),
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Icon(Icons.description_outlined, color: Colors.grey, size: 20),
                          IconButton(
                            icon: const Icon(Icons.refresh, color: Colors.blueAccent, size: 20),
                            onPressed: _readLocalClipboard,
                            tooltip: 'Refresh Preview',
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Expanded(
                        child: SingleChildScrollView(
                          child: Text(
                            _localClipboardPreview,
                            style: const TextStyle(
                              color: Color(0xFFCBD5E1),
                              fontFamily: 'monospace',
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
