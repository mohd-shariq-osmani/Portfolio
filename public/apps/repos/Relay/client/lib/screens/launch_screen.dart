import 'dart:convert';
import 'package:flutter/material.dart';
import '../services/connection_manager.dart';
import '../services/secure_storage.dart';

class LaunchScreen extends StatefulWidget {
  final ConnectionManager connectionManager;

  const LaunchScreen({super.key, required this.connectionManager});

  @override
  State<LaunchScreen> createState() => _LaunchScreenState();
}

class _LaunchScreenState extends State<LaunchScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final SecureStorage _secureStorage = SecureStorage();

  // Apps state
  List<Map<String, dynamic>> _allApps = [];
  List<Map<String, dynamic>> _filteredApps = [];
  Set<String> _favoriteApps = {};
  bool _isLoadingApps = false;
  final TextEditingController _appSearchController = TextEditingController();

  // Websites state
  final TextEditingController _urlController = TextEditingController();
  final TextEditingController _webNameController = TextEditingController();
  String _selectedBrowser = 'default';
  List<Map<String, String>> _favoriteWebsites = [];

  final List<Map<String, String>> _browserOptions = [
    {'id': 'default', 'name': 'Default Browser'},
    {'id': 'chrome', 'name': 'Google Chrome'},
    {'id': 'firefox', 'name': 'Firefox'},
    {'id': 'safari', 'name': 'Safari / Edge'},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadApps();
    _loadFavorites();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _appSearchController.dispose();
    _urlController.dispose();
    _webNameController.dispose();
    super.dispose();
  }

  // Load applications from the server
  Future<void> _loadApps() async {
    setState(() {
      _isLoadingApps = true;
    });
    try {
      final apps = await widget.connectionManager.getApps();
      setState(() {
        _allApps = apps;
        _filterApps(_appSearchController.text);
      });
    } catch (e) {
      print('Error loading apps: $e');
    } finally {
      setState(() {
        _isLoadingApps = false;
      });
    }
  }

  // Filter application list by query
  void _filterApps(String query) {
    setState(() {
      if (query.isEmpty) {
        _filteredApps = List.from(_allApps);
      } else {
        _filteredApps = _allApps
            .where((app) =>
                (app['name'] as String).toLowerCase().contains(query.toLowerCase()))
            .toList();
      }
    });
  }

  // Load favorite apps and websites from secure storage
  Future<void> _loadFavorites() async {
    try {
      // Load apps
      final appsData = await _secureStorage.getToken('fav_apps');
      if (appsData != null) {
        final decoded = json.decode(appsData) as List<dynamic>;
        setState(() {
          _favoriteApps = decoded.map((e) => e.toString()).toSet();
        });
      }

      // Load websites
      final websData = await _secureStorage.getToken('fav_webs');
      if (websData != null) {
        final decoded = json.decode(websData) as List<dynamic>;
        setState(() {
          _favoriteWebsites = decoded
              .map((e) => Map<String, String>.from(e as Map))
              .toList();
        });
      } else {
        // Pre-fill some default standard shortcuts
        _favoriteWebsites = [
          {'name': 'Google', 'url': 'https://www.google.com', 'browser': 'default'},
          {'name': 'YouTube', 'url': 'https://www.youtube.com', 'browser': 'default'},
          {'name': 'GitHub', 'url': 'https://github.com', 'browser': 'default'},
        ];
        _saveFavoriteWebsites();
      }
    } catch (e) {
      print('Error loading favorites: $e');
    }
  }

  Future<void> _saveFavoriteApps() async {
    await _secureStorage.saveToken('fav_apps', json.encode(_favoriteApps.toList()));
  }

  Future<void> _saveFavoriteWebsites() async {
    await _secureStorage.saveToken('fav_webs', json.encode(_favoriteWebsites));
  }

  void _toggleFavoriteApp(String name) {
    setState(() {
      if (_favoriteApps.contains(name)) {
        _favoriteApps.remove(name);
      } else {
        _favoriteApps.add(name);
      }
    });
    _saveFavoriteApps();
  }

  void _launchApp(String path) {
    widget.connectionManager.sendCommand('launch_app', {'path': path});
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Launch command sent to host...'),
        duration: Duration(seconds: 1),
      ),
    );
  }

  void _openUrl(String url, String browser) {
    if (url.isEmpty) return;
    String formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      formattedUrl = 'https://$url';
    }
    widget.connectionManager.sendCommand('open_url', {
      'url': formattedUrl,
      'browser': browser,
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Open URL command sent to host...'),
        duration: Duration(seconds: 1),
      ),
    );
  }

  void _addWebShortcut() {
    final name = _webNameController.text.trim();
    final url = _urlController.text.trim();
    if (name.isEmpty || url.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter both name and URL.')),
      );
      return;
    }

    setState(() {
      _favoriteWebsites.add({
        'name': name,
        'url': url,
        'browser': _selectedBrowser,
      });
      _webNameController.clear();
      _urlController.clear();
    });
    _saveFavoriteWebsites();
  }

  void _deleteWebShortcut(int index) {
    setState(() {
      _favoriteWebsites.removeAt(index);
    });
    _saveFavoriteWebsites();
  }

  Widget _buildAppIcon(String? base64Icon) {
    if (base64Icon == null || base64Icon.isEmpty) {
      return const Icon(Icons.rocket_launch, color: Colors.blueAccent);
    }
    try {
      return ClipRRect(
        borderRadius: BorderRadius.circular(4),
        child: Image.memory(
          base64Decode(base64Icon),
          width: 24,
          height: 24,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) => const Icon(Icons.rocket_launch, color: Colors.blueAccent),
        ),
      );
    } catch (e) {
      return const Icon(Icons.rocket_launch, color: Colors.blueAccent);
    }
  }

  Widget _buildAppsTab() {
    final favList = _filteredApps.where((app) => _favoriteApps.contains(app['name'])).toList();
    final otherList = _filteredApps.where((app) => !_favoriteApps.contains(app['name'])).toList();

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          // Search box
          TextField(
            controller: _appSearchController,
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              hintText: 'Search applications...',
              hintStyle: const TextStyle(color: Colors.grey),
              prefixIcon: const Icon(Icons.search, color: Colors.grey),
              suffixIcon: IconButton(
                icon: const Icon(Icons.refresh, color: Colors.blueAccent),
                onPressed: _loadApps,
              ),
              filled: true,
              fillColor: const Color(0xFF1E293B),
              enabledBorder: OutlineInputBorder(
                borderSide: const BorderSide(color: Color(0xFF334155)),
                borderRadius: BorderRadius.circular(12),
              ),
              focusedBorder: OutlineInputBorder(
                borderSide: const BorderSide(color: Colors.blueAccent),
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            onChanged: _filterApps,
          ),
          const SizedBox(height: 16),

          if (_isLoadingApps)
            const Expanded(
              child: Center(
                child: CircularProgressIndicator(color: Colors.blueAccent),
              ),
            )
          else if (_allApps.isEmpty)
            const Expanded(
              child: Center(
                child: Text('No applications discovered on server.', style: TextStyle(color: Colors.grey)),
              ),
            )
          else
            Expanded(
              child: ListView(
                children: [
                  // Favorites Section
                  if (favList.isNotEmpty) ...[
                    const Text(
                      'Favorite Apps',
                      style: TextStyle(color: Colors.grey, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 10,
                        mainAxisSpacing: 10,
                        childAspectRatio: 2.2,
                      ),
                      itemCount: favList.length,
                      itemBuilder: (context, index) {
                        final app = favList[index];
                        final name = app['name'] as String;
                        final path = app['path'] as String;
                        return InkWell(
                          onTap: () => _launchApp(path),
                          borderRadius: BorderRadius.circular(12),
                          child: Container(
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E293B),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.blueAccent.withOpacity(0.5), width: 1.5),
                            ),
                            padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
                            child: Row(
                              children: [
                                _buildAppIcon(app['icon'] as String?),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    name,
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                IconButton(
                                  icon: const Icon(Icons.star, color: Colors.amber, size: 18),
                                  padding: EdgeInsets.zero,
                                  constraints: const BoxConstraints(),
                                  onPressed: () => _toggleFavoriteApp(name),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 20),
                  ],

                  // All Applications List
                  if (otherList.isNotEmpty) ...[
                    const Text(
                      'All Applications',
                      style: TextStyle(color: Colors.grey, fontSize: 13, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: otherList.length,
                      itemBuilder: (context, index) {
                        final app = otherList[index];
                        final name = app['name'] as String;
                        final path = app['path'] as String;
                        return Card(
                          color: const Color(0xFF1E293B),
                          margin: const EdgeInsets.symmetric(vertical: 4),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10),
                            side: const BorderSide(color: Color(0xFF334155)),
                          ),
                          child: ListTile(
                            leading: _buildAppIcon(app['icon'] as String?),
                            title: Text(name, style: const TextStyle(color: Colors.white)),
                            subtitle: Text(
                              path,
                              style: const TextStyle(color: Colors.grey, fontSize: 10),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            trailing: IconButton(
                              icon: const Icon(Icons.star_border, color: Colors.grey),
                              onPressed: () => _toggleFavoriteApp(name),
                            ),
                            onTap: () => _launchApp(path),
                          ),
                        );
                      },
                    ),
                  ],
                ],
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildWebsitesTab() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: ListView(
        children: [
          // URL Opener Form
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
                  'Open Website on PC',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                ),
                const SizedBox(height: 16),
                
                // URL input
                TextField(
                  controller: _urlController,
                  style: const TextStyle(color: Colors.white),
                  keyboardType: TextInputType.url,
                  decoration: InputDecoration(
                    hintText: 'google.com or https://...',
                    hintStyle: const TextStyle(color: Colors.grey),
                    labelText: 'Website URL',
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
                const SizedBox(height: 12),
                
                // Browser Dropdown
                DropdownButtonFormField<String>(
                  value: _selectedBrowser,
                  dropdownColor: const Color(0xFF1E293B),
                  style: const TextStyle(color: Colors.white),
                  decoration: InputDecoration(
                    labelText: 'Target Browser',
                    labelStyle: const TextStyle(color: Colors.grey),
                    filled: true,
                    fillColor: const Color(0xFF0F172A),
                    enabledBorder: OutlineInputBorder(
                      borderSide: const BorderSide(color: Color(0xFF334155)),
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  items: _browserOptions.map((opt) {
                    return DropdownMenuItem<String>(
                      value: opt['id'],
                      child: Text(opt['name']!),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) {
                      setState(() {
                        _selectedBrowser = val;
                      });
                    }
                  },
                ),
                const SizedBox(height: 16),
                
                // Actions Row
                Row(
                  children: [
                    Expanded(
                      flex: 2,
                      child: ElevatedButton.icon(
                        icon: const Icon(Icons.open_in_browser, color: Colors.white),
                        label: const Text('Open URL', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blueAccent,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        onPressed: () => _openUrl(_urlController.text.trim(), _selectedBrowser),
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      flex: 1,
                      child: OutlinedButton(
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Colors.blueAccent),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        onPressed: () {
                          // Prompt for nickname to save to favorites
                          showDialog(
                            context: context,
                            builder: (context) {
                              return AlertDialog(
                                backgroundColor: const Color(0xFF1E293B),
                                title: const Text('Save Website Shortcut', style: TextStyle(color: Colors.white)),
                                content: TextField(
                                  controller: _webNameController,
                                  style: const TextStyle(color: Colors.white),
                                  decoration: const InputDecoration(
                                    labelText: 'Shortcut Name (e.g. Google)',
                                    labelStyle: TextStyle(color: Colors.grey),
                                  ),
                                ),
                                actions: [
                                  TextButton(
                                    onPressed: () => Navigator.pop(context),
                                    child: const Text('Cancel'),
                                  ),
                                  TextButton(
                                    onPressed: () {
                                      _addWebShortcut();
                                      Navigator.pop(context);
                                    },
                                    child: const Text('Save', style: TextStyle(color: Colors.blueAccent)),
                                  ),
                                ],
                              );
                            },
                          );
                        },
                        child: const Text('Save Fav', style: TextStyle(color: Colors.blueAccent, fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Favorite websites shortcuts list
          const Text(
            'Favorite Websites',
            style: TextStyle(color: Colors.grey, fontSize: 13, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 2.2,
            ),
            itemCount: _favoriteWebsites.length,
            itemBuilder: (context, index) {
              final item = _favoriteWebsites[index];
              final name = item['name']!;
              final url = item['url']!;
              final browser = item['browser'] ?? 'default';
              return InkWell(
                onTap: () => _openUrl(url, browser),
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF334155)),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
                  child: Row(
                    children: [
                      const Icon(Icons.language, color: Colors.greenAccent),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              name,
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              url.replaceFirst('https://', '').replaceFirst('http://', '').replaceFirst('www.', ''),
                              style: const TextStyle(color: Colors.grey, fontSize: 10),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close, color: Colors.redAccent, size: 16),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        onPressed: () => _deleteWebShortcut(index),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(kToolbarHeight),
        child: Container(
          color: const Color(0xFF1E293B),
          child: TabBar(
            controller: _tabController,
            indicatorColor: Colors.blueAccent,
            labelColor: Colors.blueAccent,
            unselectedLabelColor: Colors.grey,
            labelStyle: const TextStyle(fontWeight: FontWeight.bold),
            tabs: const [
              Tab(icon: Icon(Icons.rocket_launch), text: 'Applications'),
              Tab(icon: Icon(Icons.language), text: 'Websites'),
            ],
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildAppsTab(),
          _buildWebsitesTab(),
        ],
      ),
    );
  }
}
