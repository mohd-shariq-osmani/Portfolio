import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants.dart';
import '../../auth/views/login_view.dart';
import '../../auth/view_models/login_view_model.dart';
import '../../../../data/repositories/n8n_repository.dart';

class SettingsView extends StatelessWidget {
  const SettingsView({super.key});

  void _logout(BuildContext context) async {
    final repo = context.read<N8nRepository>();
    
    // Show a confirmation dialog
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: N8nColors.bgCard,
          title: const Text('Sign Out', style: TextStyle(color: N8nColors.textPrimary)),
          content: const Text('Are you sure you want to sign out of this n8n instance?', style: TextStyle(color: N8nColors.textSecondary)),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel', style: TextStyle(color: N8nColors.textSecondary)),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Sign Out', style: TextStyle(color: N8nColors.pink)),
            ),
          ],
        );
      },
    );

    if (confirm == true && context.mounted) {
      await repo.clearSession();
      if (context.mounted) {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(
            builder: (context) => ChangeNotifierProvider(
              create: (context) => LoginViewModel(repository: repo),
              child: const LoginView(),
            ),
          ),
          (route) => false,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final repo = context.watch<N8nRepository>();
    final session = repo.currentSession;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Settings',
          style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold, fontSize: 20),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(N8nSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Instance Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(N8nSpacing.lg),
                child: Column(
                  children: [
                    Container(
                      width: 50,
                      height: 50,
                      decoration: const BoxDecoration(
                        shape: BoxShape.circle,
                        color: N8nColors.pinkGlow,
                      ),
                      child: const Icon(
                        Icons.dns,
                        color: N8nColors.pink,
                        size: 26,
                      ),
                    ),
                    const SizedBox(height: N8nSpacing.md),
                    const Text(
                      'Connected Instance',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: N8nColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: N8nSpacing.sm),
                    Text(
                      session?.url ?? 'Unknown Server',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 14,
                        color: N8nColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: N8nSpacing.lg),

            // Account info list
            const Text(
              'ACCOUNT DETAILS',
              style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.bold,
                color: N8nColors.textMuted,
                letterSpacing: 1.0,
              ),
            ),
            const SizedBox(height: N8nSpacing.sm),
            Card(
              child: Column(
                children: [
                  _buildListTile(
                    icon: Icons.person_outline,
                    title: 'Logged in as',
                    subtitle: session?.email ?? 'Unknown User',
                  ),
                  const Divider(),
                  _buildListTile(
                    icon: Icons.security_outlined,
                    title: 'Auth Mechanism',
                    subtitle: 'Session Cookie (Internal API)',
                  ),
                ],
              ),
            ),
            const SizedBox(height: N8nSpacing.xl),

            // Sign out button
            ElevatedButton(
              onPressed: () => _logout(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: N8nColors.errorGlow,
                foregroundColor: N8nColors.error,
                elevation: 0,
                side: BorderSide(color: N8nColors.error.withOpacity(0.5)),
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
              ),
              child: const Text(
                'Sign Out',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: N8nSpacing.md),
            const Center(
              child: Text(
                'n8n companion app v1.0.0',
                style: TextStyle(color: N8nColors.textMuted, fontSize: 11),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildListTile({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: N8nSpacing.md, vertical: 12),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: N8nColors.bgDark,
            radius: 18,
            child: Icon(icon, color: N8nColors.textSecondary, size: 18),
          ),
          const SizedBox(width: N8nSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontSize: 13, color: N8nColors.textSecondary),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: N8nColors.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
