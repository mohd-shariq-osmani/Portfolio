import 'package:flutter/material.dart';
import '../services/connection_manager.dart';

class KeyboardScreen extends StatefulWidget {
  final ConnectionManager connectionManager;

  const KeyboardScreen({super.key, required this.connectionManager});

  @override
  State<KeyboardScreen> createState() => _KeyboardScreenState();
}

class _KeyboardScreenState extends State<KeyboardScreen> {
  final TextEditingController _textController = TextEditingController(text: ' ');
  final FocusNode _focusNode = FocusNode();

  // Modifiers toggle states
  bool _ctrlActive = false;
  bool _shiftActive = false;
  bool _altActive = false;
  bool _cmdActive = false;

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(() {
      setState(() {}); // Redraw to update focus highlight
    });
  }

  @override
  void dispose() {
    _textController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _sendKeyPress(String key) {
    final modifiers = <String>[];
    if (_ctrlActive) modifiers.add('ctrl');
    if (_shiftActive) modifiers.add('shift');
    if (_altActive) modifiers.add('alt');
    if (_cmdActive) modifiers.add('cmd');

    widget.connectionManager.sendCommand('key_press', {
      'key': key,
      'modifiers': modifiers,
    });

    // Reset temporary modifiers after sending
    setState(() {
      _ctrlActive = false;
      _shiftActive = false;
      _altActive = false;
      _cmdActive = false;
    });
  }

  Widget _buildModifierButton(String label, bool isActive, VoidCallback onTap) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4.0),
        child: Material(
          color: isActive ? Colors.blueAccent : const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(8),
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(8),
            child: Container(
              height: 44,
              alignment: Alignment.center,
              child: Text(
                label,
                style: TextStyle(
                  color: isActive ? Colors.white : Colors.grey[400],
                  fontWeight: FontWeight.bold,
                  fontSize: 13,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildKeyButton(String label, String keyName, {IconData? icon}) {
    return Expanded(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4.0, vertical: 3.0),
        child: Material(
          color: const Color(0xFF1E293B),
          borderRadius: BorderRadius.circular(8),
          child: InkWell(
            onTap: () => _sendKeyPress(keyName),
            borderRadius: BorderRadius.circular(8),
            child: Container(
              height: 44,
              alignment: Alignment.center,
              child: icon != null
                  ? Icon(icon, color: Colors.white, size: 18)
                  : Text(
                      label,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isFocused = _focusNode.hasFocus;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      // Let scaffold resize when keyboard appears
      resizeToAvoidBottomInset: true,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Focusable input container
              GestureDetector(
                onTap: () {
                  if (isFocused) {
                    _focusNode.unfocus();
                  } else {
                    _focusNode.requestFocus();
                  }
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  height: 90,
                  decoration: BoxDecoration(
                    color: isFocused ? const Color(0xFF1E293B) : const Color(0xFF0F172A),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isFocused ? Colors.blueAccent : const Color(0xFF334155),
                      width: 1.5,
                    ),
                  ),
                  child: Stack(
                    children: [
                      // Off-screen/hidden TextField to catch keyboard inputs
                      Opacity(
                        opacity: 0,
                        child: TextField(
                          controller: _textController,
                          focusNode: _focusNode,
                          autocorrect: false,
                          enableSuggestions: false,
                          keyboardType: TextInputType.text,
                          onChanged: (text) {
                            if (text.isEmpty) {
                              // Backspace
                              _sendKeyPress('backspace');
                              _textController.text = ' ';
                              _textController.selection = const TextSelection.collapsed(offset: 1);
                            } else if (text.length > 1) {
                              final typed = text.substring(1);
                              if (typed == '\n') {
                                _sendKeyPress('enter');
                              } else {
                                widget.connectionManager.sendCommand('keyboard_text', {
                                  'text': typed,
                                });
                              }
                              _textController.text = ' ';
                              _textController.selection = const TextSelection.collapsed(offset: 1);
                            }
                          },
                          onSubmitted: (val) {
                            _sendKeyPress('enter');
                            _textController.text = ' ';
                            _textController.selection = const TextSelection.collapsed(offset: 1);
                            _focusNode.requestFocus(); // Re-focus to keep soft keyboard open
                          },
                        ),
                      ),
                      Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.keyboard_alt_outlined,
                              color: isFocused ? Colors.blueAccent : Colors.grey[600],
                              size: 32,
                            ),
                            const SizedBox(height: 6),
                            Text(
                              isFocused ? 'Keyboard Active — Type Here' : 'Tap to Open Keyboard',
                              style: TextStyle(
                                color: isFocused ? Colors.white : Colors.grey[500],
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Modifiers Header
              const Text('Modifiers', style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              
              // Modifier toggles row
              Row(
                children: [
                  _buildModifierButton('CTRL', _ctrlActive, () {
                    setState(() => _ctrlActive = !_ctrlActive);
                  }),
                  _buildModifierButton('SHIFT', _shiftActive, () {
                    setState(() => _shiftActive = !_shiftActive);
                  }),
                  _buildModifierButton('ALT', _altActive, () {
                    setState(() => _altActive = !_altActive);
                  }),
                  _buildModifierButton('CMD/WIN', _cmdActive, () {
                    setState(() => _cmdActive = !_cmdActive);
                  }),
                ],
              ),
              const SizedBox(height: 16),

              // Special keys grid
              const Text('System Keys', style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              Row(
                children: [
                  _buildKeyButton('ESC', 'escape'),
                  _buildKeyButton('TAB', 'tab'),
                  _buildKeyButton('⌫', 'backspace', icon: Icons.backspace_outlined),
                  _buildKeyButton('↵', 'enter', icon: Icons.keyboard_return),
                ],
              ),
              const SizedBox(height: 16),

              // Navigation arrow keys
              const Text('Navigation', style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              Expanded(
                child: Center(
                  child: LayoutBuilder(
                    builder: (context, constraints) {
                      final size = constraints.maxHeight.clamp(100.0, 180.0);
                      return Container(
                        width: size,
                        height: size,
                        decoration: BoxDecoration(
                          color: const Color(0xFF1E293B),
                          borderRadius: BorderRadius.circular(size / 2),
                          border: Border.all(color: const Color(0xFF334155)),
                        ),
                        child: Stack(
                          children: [
                            // Up
                            Positioned(
                              top: 4,
                              left: 0, right: 0,
                              child: Center(
                                child: IconButton(
                                  icon: const Icon(Icons.arrow_upward, color: Colors.white, size: 22),
                                  onPressed: () => _sendKeyPress('arrow_up'),
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(minWidth: 44, minHeight: 44),
                                ),
                              ),
                            ),
                            // Down
                            Positioned(
                              bottom: 4,
                              left: 0, right: 0,
                              child: Center(
                                child: IconButton(
                                  icon: const Icon(Icons.arrow_downward, color: Colors.white, size: 22),
                                  onPressed: () => _sendKeyPress('arrow_down'),
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(minWidth: 44, minHeight: 44),
                                ),
                              ),
                            ),
                            // Left
                            Positioned(
                              left: 4,
                              top: 0, bottom: 0,
                              child: Center(
                                child: IconButton(
                                  icon: const Icon(Icons.arrow_back, color: Colors.white, size: 22),
                                  onPressed: () => _sendKeyPress('arrow_left'),
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(minWidth: 44, minHeight: 44),
                                ),
                              ),
                            ),
                            // Right
                            Positioned(
                              right: 4,
                              top: 0, bottom: 0,
                              child: Center(
                                child: IconButton(
                                  icon: const Icon(Icons.arrow_forward, color: Colors.white, size: 22),
                                  onPressed: () => _sendKeyPress('arrow_right'),
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(minWidth: 44, minHeight: 44),
                                ),
                              ),
                            ),
                            // Center icon
                            const Positioned.fill(
                              child: Center(
                                child: Icon(Icons.gamepad_outlined, color: Color(0xFF475569), size: 22),
                              ),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
      ),
    );
  }
}
