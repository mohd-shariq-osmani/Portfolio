import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants.dart';
import '../view_models/login_view_model.dart';
import '../../dashboard/views/dashboard_view.dart';
import '../../dashboard/view_models/dashboard_view_model.dart';
import '../../../../data/repositories/n8n_repository.dart';

class LoginView extends StatefulWidget {
  const LoginView({super.key});

  @override
  State<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends State<LoginView> with SingleTickerProviderStateMixin {
  final _urlController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  final _urlFocusNode = FocusNode();
  final _emailFocusNode = FocusNode();
  final _passwordFocusNode = FocusNode();

  bool _obscurePassword = true;

  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    // Default helpful hint
    _urlController.text = 'http://';

    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    _fadeAnimation = CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeOut,
    );

    _fadeController.forward();

    // Listen to focus changes to update UI glows
    _urlFocusNode.addListener(() => setState(() {}));
    _emailFocusNode.addListener(() => setState(() {}));
    _passwordFocusNode.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _urlController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _urlFocusNode.dispose();
    _emailFocusNode.dispose();
    _passwordFocusNode.dispose();
    _fadeController.dispose();
    super.dispose();
  }

  void _submit(LoginViewModel viewModel) async {
    // Clear keyboard focus
    FocusScope.of(context).unfocus();

    final success = await viewModel.login(
      _urlController.text,
      _emailController.text,
      _passwordController.text,
    );

    if (success && mounted) {
      // Login successful, navigate to Dashboard
      final repo = Provider.of<N8nRepository>(context, listen: false);
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (context) => ChangeNotifierProvider(
            create: (context) => DashboardViewModel(repository: repo),
            child: const DashboardView(),
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final viewModel = Provider.of<LoginViewModel>(context);

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: N8nSpacing.lg),
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const SizedBox(height: N8nSpacing.xl),
                  // Glowing Logo
                  Center(
                    child: Hero(
                      tag: 'n8n_logo',
                      child: Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: N8nColors.bgCard,
                          boxShadow: [
                            BoxShadow(
                              color: N8nColors.pink.withOpacity(0.2),
                              blurRadius: 20,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: CustomPaint(
                          painter: N8nLogoPainter(),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: N8nSpacing.lg),
                  // Title
                  const Text(
                    'n8n companion',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontFamily: 'Outfit',
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: N8nColors.textPrimary,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: N8nSpacing.xs),
                  const Text(
                    'Monitor and manage your workflows on the go',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 14,
                      color: N8nColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: N8nSpacing.xl),

                  // Error Box
                  if (viewModel.errorMessage != null) ...[
                    Container(
                      padding: const EdgeInsets.all(N8nSpacing.md),
                      decoration: BoxDecoration(
                        color: N8nColors.errorGlow,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: N8nColors.error.withOpacity(0.5)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.error_outline, color: N8nColors.error),
                          const SizedBox(width: N8nSpacing.sm),
                          Expanded(
                            child: Text(
                              viewModel.errorMessage!,
                              style: const TextStyle(
                                color: N8nColors.textPrimary,
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.close, size: 16, color: N8nColors.textSecondary),
                            onPressed: viewModel.clearError,
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(),
                          )
                        ],
                      ),
                    ),
                    const SizedBox(height: N8nSpacing.md),
                  ],

                  // Form Fields
                  _buildInputField(
                    controller: _urlController,
                    focusNode: _urlFocusNode,
                    label: 'n8n URL',
                    hint: 'e.g. https://my-n8n.com',
                    icon: Icons.link,
                    keyboardType: TextInputType.url,
                    onChanged: (_) => viewModel.clearError(),
                  ),
                  const SizedBox(height: N8nSpacing.md),
                  _buildInputField(
                    controller: _emailController,
                    focusNode: _emailFocusNode,
                    label: 'Email Address',
                    hint: 'owner@domain.com',
                    icon: Icons.email_outlined,
                    keyboardType: TextInputType.emailAddress,
                    onChanged: (_) => viewModel.clearError(),
                  ),
                  const SizedBox(height: N8nSpacing.md),
                  _buildInputField(
                    controller: _passwordController,
                    focusNode: _passwordFocusNode,
                    label: 'Password',
                    hint: '••••••••',
                    icon: Icons.lock_outline,
                    obscureText: _obscurePassword,
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                        color: N8nColors.textSecondary,
                      ),
                      onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                    ),
                    onChanged: (_) => viewModel.clearError(),
                  ),
                  const SizedBox(height: N8nSpacing.lg),

                  // Login Button
                  ElevatedButton(
                    onPressed: viewModel.isLoading ? null : () => _submit(viewModel),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: N8nColors.pink,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    child: viewModel.isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                            ),
                          )
                        : const Text(
                            'Sign In',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                  ),
                  const SizedBox(height: N8nSpacing.xl),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildInputField({
    required TextEditingController controller,
    required FocusNode focusNode,
    required String label,
    required String hint,
    required IconData icon,
    bool obscureText = false,
    Widget? suffixIcon,
    TextInputType? keyboardType,
    void Function(String)? onChanged,
  }) {
    final isFocused = focusNode.hasFocus;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        boxShadow: isFocused
            ? [
                BoxShadow(
                  color: N8nColors.pink.withOpacity(0.08),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                  spreadRadius: 1,
                ),
              ]
            : [],
      ),
      child: TextField(
        controller: controller,
        focusNode: focusNode,
        obscureText: obscureText,
        keyboardType: keyboardType,
        onChanged: onChanged,
        style: const TextStyle(color: N8nColors.textPrimary, fontSize: 15),
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          prefixIcon: Icon(icon, color: isFocused ? N8nColors.pink : N8nColors.textSecondary),
          suffixIcon: suffixIcon,
          filled: true,
          fillColor: N8nColors.bgCard,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: N8nColors.border),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: N8nColors.border),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: const BorderSide(color: N8nColors.pink, width: 1.5),
          ),
        ),
      ),
    );
  }
}

// Custom Painter to draw the n8n vector logo
class N8nLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = N8nColors.pink
      ..style = PaintingStyle.fill;

    final linePaint = Paint()
      ..color = Colors.white
      ..strokeWidth = 3
      ..style = PaintingStyle.stroke;

    final double cx = size.width / 2;
    final double cy = size.height / 2;

    // Draw lines connecting the nodes
    // Line 1: Center node to Top-Right
    canvas.drawLine(Offset(cx, cy), Offset(cx + 18, cy - 18), linePaint);
    // Line 2: Center node to Bottom-Left
    canvas.drawLine(Offset(cx, cy), Offset(cx - 18, cy + 18), linePaint);

    // Draw main circular node dots
    // Center node
    canvas.drawCircle(Offset(cx, cy), 9, paint);
    paint.color = N8nColors.textSecondary;
    canvas.drawCircle(Offset(cx, cy), 4, paint);

    // Top-Right Node
    paint.color = N8nColors.pink;
    canvas.drawCircle(Offset(cx + 18, cy - 18), 7, paint);
    paint.color = N8nColors.textPrimary;
    canvas.drawCircle(Offset(cx + 18, cy - 18), 3, paint);

    // Bottom-Left Node
    paint.color = N8nColors.pink;
    canvas.drawCircle(Offset(cx - 18, cy + 18), 7, paint);
    paint.color = N8nColors.textPrimary;
    canvas.drawCircle(Offset(cx - 18, cy + 18), 3, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
