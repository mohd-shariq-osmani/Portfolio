import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants.dart';
import '../../dashboard/views/dashboard_view.dart';
import '../../dashboard/view_models/dashboard_view_model.dart';
import '../../executions/views/execution_history_view.dart';
import '../../executions/view_models/execution_history_view_model.dart';
import '../../settings/views/settings_view.dart';
import '../../../../data/repositories/n8n_repository.dart';

class MainNavigationView extends StatefulWidget {
  const MainNavigationView({super.key});

  @override
  State<MainNavigationView> createState() => _MainNavigationViewState();
}

class _MainNavigationViewState extends State<MainNavigationView> {
  int _currentIndex = 0;
  late List<Widget> _pages;

  @override
  void initState() {
    super.initState();
    final repo = context.read<N8nRepository>();

    _pages = [
      ChangeNotifierProvider(
        create: (context) => DashboardViewModel(repository: repo),
        child: const DashboardView(),
      ),
      ChangeNotifierProvider(
        create: (context) => ExecutionHistoryViewModel(repository: repo),
        child: const ExecutionHistoryView(),
      ),
      const SettingsView(),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _pages,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(
            top: BorderSide(color: N8nColors.border, width: 1),
          ),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          backgroundColor: N8nColors.bgHeader,
          selectedItemColor: N8nColors.pink,
          unselectedItemColor: N8nColors.textSecondary,
          selectedFontSize: 11,
          unselectedFontSize: 11,
          type: BottomNavigationBarType.fixed,
          items: const [
            BottomNavigationBarItem(
              icon: Icon(Icons.hub_outlined),
              activeIcon: Icon(Icons.hub, color: N8nColors.pink),
              label: 'Workflows',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.history_outlined),
              activeIcon: Icon(Icons.history, color: N8nColors.pink),
              label: 'Executions',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.settings_outlined),
              activeIcon: Icon(Icons.settings, color: N8nColors.pink),
              label: 'Settings',
            ),
          ],
        ),
      ),
    );
  }
}
