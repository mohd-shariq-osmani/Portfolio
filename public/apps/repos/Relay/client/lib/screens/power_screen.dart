import 'package:flutter/material.dart';
import '../services/connection_manager.dart';

class PowerScreen extends StatefulWidget {
  final ConnectionManager connectionManager;

  const PowerScreen({super.key, required this.connectionManager});

  @override
  State<PowerScreen> createState() => _PowerScreenState();
}

class _PowerScreenState extends State<PowerScreen> {
  void _sendVolumeCommand(String action) {
    widget.connectionManager.sendCommand('volume', {'action': action});
  }

  void _sendPowerCommand(String action) {
    widget.connectionManager.sendCommand('power', {
      'action': action,
      'confirmed': true,
    });
  }

  void _confirmPowerAction(BuildContext context, String action, String title, String description, Color confirmColor) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: const Color(0xFF1E293B),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Text(
            title,
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
          ),
          content: Text(
            description,
            style: const TextStyle(color: Colors.grey),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: confirmColor,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              onPressed: () {
                _sendPowerCommand(action);
                Navigator.of(context).pop();
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Sent $action command to PC.')),
                );
              },
              child: const Text('Confirm', style: TextStyle(color: Colors.white)),
            ),
          ],
        );
      },
    );
  }

  Widget _buildActionCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Material(
      color: const Color(0xFF1E293B),
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            border: Border.all(color: color.withOpacity(0.3), width: 1.5),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon, color: color, size: 36),
              const SizedBox(height: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: const TextStyle(color: Colors.grey, fontSize: 12),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
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
                  'Power & Audio',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              const SizedBox(height: 28),

              // 2x2 Grid of Actions
              Expanded(
                child: GridView.count(
                  crossAxisCount: 2,
                  crossAxisSpacing: 16,
                  mainAxisSpacing: 16,
                  childAspectRatio: 1.1,
                  children: [
                    // Sleep: Calm (Blue)
                    _buildActionCard(
                      title: 'Sleep',
                      subtitle: 'Puts host PC to sleep mode',
                      icon: Icons.nightlight_outlined,
                      color: Colors.blueAccent,
                      onTap: () {
                        _sendPowerCommand('sleep');
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Sent Sleep command.')),
                        );
                      },
                    ),
                    
                    // Restart: Warning (Amber)
                    _buildActionCard(
                      title: 'Restart',
                      subtitle: 'Reboots host computer',
                      icon: Icons.replay,
                      color: Colors.amberAccent,
                      onTap: () {
                        _confirmPowerAction(
                          context,
                          'restart',
                          'Restart Computer?',
                          'Are you sure you want to reboot the host PC? Unsaved work will be lost.',
                          Colors.amberAccent,
                        );
                      },
                    ),
                    
                    // Shutdown: Danger (Red)
                    _buildActionCard(
                      title: 'Shutdown',
                      subtitle: 'Power down host computer',
                      icon: Icons.power_settings_new,
                      color: Colors.redAccent,
                      onTap: () {
                        _confirmPowerAction(
                          context,
                          'shutdown',
                          'Shutdown Computer?',
                          'Are you sure you want to power down the host PC? Unsaved work will be lost.',
                          Colors.redAccent,
                        );
                      },
                    ),

                    Container(
                      decoration: BoxDecoration(
                        color: const Color(0xFF1E293B),
                        border: Border.all(color: Colors.greenAccent.withOpacity(0.3), width: 1.5),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: const [
                              Icon(Icons.volume_up, color: Colors.greenAccent, size: 20),
                              SizedBox(width: 6),
                              Text('Volume Control', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                            ],
                          ),

                          const SizedBox(height: 4),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            children: [
                              // Down
                              IconButton(
                                icon: const Icon(Icons.volume_down_outlined, color: Colors.white, size: 24),
                                onPressed: () => _sendVolumeCommand('down'),
                              ),
                              // Mute
                              IconButton(
                                icon: const Icon(Icons.volume_off_outlined, color: Colors.redAccent, size: 24),
                                onPressed: () => _sendVolumeCommand('mute'),
                              ),
                              // Up
                              IconButton(
                                icon: const Icon(Icons.volume_up_outlined, color: Colors.white, size: 24),
                                onPressed: () => _sendVolumeCommand('up'),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 36),
            ],
          ),
        ),
      ),
    );
  }
}
