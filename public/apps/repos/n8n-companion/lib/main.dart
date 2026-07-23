import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'ui/core/theme.dart';
import 'ui/core/constants.dart';
import 'ui/features/auth/views/login_view.dart';
import 'ui/features/auth/view_models/login_view_model.dart';
import 'ui/features/navigation/views/main_navigation_view.dart';
import 'data/services/n8n_api_service.dart';
import 'data/repositories/n8n_repository.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  
  final apiService = N8nApiService();
  final repository = N8nRepository(apiService: apiService);

  runApp(
    MultiProvider(
      providers: [
        Provider<N8nApiService>.value(value: apiService),
        Provider<N8nRepository>.value(value: repository),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'n8n Companion',
      debugShowCheckedModeBanner: false,
      theme: N8nTheme.darkTheme,
      home: const SplashScreen(),
    );
  }
}

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..repeat(reverse: true);
    
    _pulseAnimation = Tween<double>(begin: 0.85, end: 1.05).animate(
      CurvedAnimation(
        parent: _pulseController,
        curve: Curves.easeInOut,
      ),
    );

    _checkSession();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  void _checkSession() async {
    // Add brief artificial delay for visual effect of splash screen
    await Future.delayed(const Duration(milliseconds: 1500));
    
    if (!mounted) return;
    
    final repo = context.read<N8nRepository>();
    final session = await repo.loadSession();

    if (!mounted) return;

    if (session != null) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (context) => const MainNavigationView(),
        ),
      );
    } else {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(
          builder: (context) => ChangeNotifierProvider(
            create: (context) => LoginViewModel(repository: repo),
            child: const LoginView(),
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: N8nColors.bgDark,
      body: Center(
        child: ScaleTransition(
          scale: _pulseAnimation,
          child: Hero(
            tag: 'n8n_logo',
            child: Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: N8nColors.bgCard,
                boxShadow: [
                  BoxShadow(
                    color: N8nColors.pink.withOpacity(0.3),
                    blurRadius: 30,
                    spreadRadius: 3,
                  ),
                ],
              ),
              child: CustomPaint(
                painter: N8nLogoPainter(),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
