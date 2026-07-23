import 'package:flutter/material.dart';
import '../services/connection_manager.dart';

class TrackpadScreen extends StatefulWidget {
  final ConnectionManager connectionManager;

  const TrackpadScreen({super.key, required this.connectionManager});

  @override
  State<TrackpadScreen> createState() => _TrackpadScreenState();
}

class _TrackpadScreenState extends State<TrackpadScreen> {
  double sensitivity = 1.5;
  int _pointersActive = 0;
  bool _twoFingerTapTriggered = false;

  void _sendMouseMove(double dx, double dy) {
    final double speedSq = dx * dx + dy * dy;
    double factor = 1.0;
    
    // Non-linear acceleration curve
    if (speedSq > 2.0) {
      factor = 1.0 + (speedSq * 0.08);
    }
    if (factor > 4.5) factor = 4.5; // Cap max speed

    widget.connectionManager.sendCommand('mouse_move', {
      'dx': dx * sensitivity * factor,
      'dy': dy * sensitivity * factor,
    });
  }

  void _sendMouseClick(String button, String clickType) {
    widget.connectionManager.sendCommand('mouse_click', {
      'button': button,
      'click_type': clickType,
    });
  }

  void _sendMouseScroll(double dy) {
    // Send raw deltas scaled for server accumulation
    widget.connectionManager.sendCommand('mouse_scroll', {
      'dx': 0.0,
      'dy': -dy * 0.2,
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A), // Slate dark
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            children: [
              // Sensitivity Slider
              Row(
                children: [
                  const Text('Sensitivity', style: TextStyle(color: Colors.grey, fontSize: 13)),
                  Expanded(
                    child: Slider(
                      value: sensitivity,
                      min: 0.5,
                      max: 4.0,
                      divisions: 7,
                      activeColor: Colors.blueAccent,
                      inactiveColor: const Color(0xFF334155),
                      onChanged: (val) {
                        setState(() {
                          sensitivity = val;
                        });
                      },
                    ),
                  ),
                  Text(
                    sensitivity.toStringAsFixed(1),
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              
              // Trackpad Surface
              Expanded(
                child: Row(
                  children: [
                    // Main Tap/Pan Surface
                    Expanded(
                      flex: 12,
                      child: Listener(
                        onPointerDown: (event) {
                          setState(() {
                            _pointersActive++;
                            if (_pointersActive == 2) {
                              _twoFingerTapTriggered = true;
                            }
                          });
                        },
                        onPointerUp: (event) {
                          setState(() {
                            _pointersActive = _pointersActive > 0 ? _pointersActive - 1 : 0;
                            if (_pointersActive == 0) {
                              if (_twoFingerTapTriggered) {
                                _sendMouseClick('right', 'single');
                                _twoFingerTapTriggered = false;
                              }
                            }
                          });
                        },
                        onPointerCancel: (event) {
                          setState(() {
                            _pointersActive = 0;
                            _twoFingerTapTriggered = false;
                          });
                        },
                        child: GestureDetector(
                          behavior: HitTestBehavior.opaque,
                          onPanUpdate: (details) {
                            _sendMouseMove(details.delta.dx, details.delta.dy);
                          },
                          onTap: () {
                            if (_pointersActive == 0 && !_twoFingerTapTriggered) {
                              _sendMouseClick('left', 'single');
                            }
                          },
                          onDoubleTap: () {
                            if (_pointersActive == 0) {
                              _sendMouseClick('left', 'double');
                            }
                          },
                          child: Container(
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E293B),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: const Color(0xFF334155), width: 1.5),
                            ),
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(20),
                              child: CustomPaint(
                                painter: DotGridPainter(),
                                child: const Center(
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(Icons.touch_app_outlined, color: Color(0xFF475569), size: 48),
                                      SizedBox(height: 12),
                                      Text(
                                        'Trackpad',
                                        style: TextStyle(
                                          color: Color(0xFF64748B),
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                      SizedBox(height: 4),
                                      Text(
                                        '1 Finger: Move & Left Click\n2 Fingers: Right Click',
                                        style: TextStyle(color: Color(0xFF475569), fontSize: 12),
                                        textAlign: TextAlign.center,
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    
                    // Vertical Scroll Strip
                    Expanded(
                      flex: 2,
                      child: GestureDetector(
                        behavior: HitTestBehavior.opaque,
                        onVerticalDragUpdate: (details) {
                          _sendMouseScroll(details.delta.dy);
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            color: const Color(0xFF1E293B),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: const Color(0xFF334155), width: 1.5),
                          ),
                          child: const Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.unfold_more, color: Color(0xFF64748B), size: 28),
                              SizedBox(height: 12),
                              RotatedBox(
                                quarterTurns: 3,
                                child: Text(
                                  'SCROLL',
                                  style: TextStyle(
                                    color: Color(0xFF64748B),
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 2,
                                  ),
                                ),
                              ),
                            ],
                          ),
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
    );
  }
}

class DotGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFF334155).withOpacity(0.5)
      ..strokeWidth = 2.0;

    const double spacing = 24.0;
    for (double x = spacing / 2; x < size.width; x += spacing) {
      for (double y = spacing / 2; y < size.height; y += spacing) {
        canvas.drawCircle(Offset(x, y), 1.0, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
