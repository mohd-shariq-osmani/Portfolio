import 'dart:io';
import 'package:multicast_dns/multicast_dns.dart';
import '../services/secure_storage.dart';

class DiscoveredHost {
  final String name;
  final String ip;
  final int port;

  DiscoveredHost({required this.name, required this.ip, required this.port});

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is DiscoveredHost &&
          runtimeType == other.runtimeType &&
          ip == other.ip &&
          port == other.port;

  @override
  int get hashCode => ip.hashCode ^ port.hashCode;
}

class DiscoveryService {
  Future<List<DiscoveredHost>> discoverHosts({Duration timeout = const Duration(seconds: 4)}) async {
    final List<DiscoveredHost> mdnsResults = [];
    final List<DiscoveredHost> scanResults = [];

    final secureStorage = SecureStorage();
    final metadata = await secureStorage.getHostsMetadata();

    // Run both mDNS lookup and Subnet port scanning in parallel
    await Future.wait([
      _discoverMdns(timeout).then((res) => mdnsResults.addAll(res)),
      _scanSubnetPorts(metadata).then((res) => scanResults.addAll(res)),
    ]);

    // Merge results, prioritizing mDNS results for friendly hostname values
    final Map<String, DiscoveredHost> merged = {};
    for (final host in scanResults) {
      merged[host.ip] = host;
    }
    for (final host in mdnsResults) {
      merged[host.ip] = host; // Overwrite with mDNS version if found
    }

    return merged.values.toList();
  }

  Future<List<DiscoveredHost>> _discoverMdns(Duration timeout) async {
    final client = MDnsClient();
    try {
      await client.start();
    } catch (e) {
      print('Failed to start MDnsClient: $e');
      return [];
    }

    final List<DiscoveredHost> hosts = [];
    const String serviceType = '_relay-remote._tcp.local';

    try {
      await for (final PtrResourceRecord ptr in client.lookup<PtrResourceRecord>(
        ResourceRecordQuery.serverPointer(serviceType),
        timeout: timeout,
      )) {
        final String domainName = ptr.domainName;
        int port = 5389;
        String? ip;
        String? targetHost;

        // Resolve SRV (Port and Target Hostname)
        try {
          await for (final SrvResourceRecord srv in client.lookup<SrvResourceRecord>(
            ResourceRecordQuery.service(domainName),
            timeout: const Duration(seconds: 1),
          )) {
            port = srv.port;
            targetHost = srv.target;
            break;
          }
        } catch (_) {}

        final hostToQuery = targetHost ?? domainName;
        try {
          await for (final IPAddressResourceRecord ip4 in client.lookup<IPAddressResourceRecord>(
            ResourceRecordQuery.addressIPv4(hostToQuery),
            timeout: const Duration(seconds: 1),
          )) {
            ip = ip4.address.address;
            break;
          }
        } catch (_) {}

        if (ip != null) {
          final cleanName = domainName.split('.').first;
          hosts.add(DiscoveredHost(
            name: cleanName.replaceAll('_', ' '),
            ip: ip,
            port: port,
          ));
        }
      }
    } catch (e) {
      print('mDNS lookup error: $e');
    } finally {
      client.stop();
    }
    return hosts;
  }

  Future<List<DiscoveredHost>> _scanSubnetPorts(Map<String, String> metadata) async {
    try {
      final List<String> subnets = [];
      for (var interface in await NetworkInterface.list()) {
        for (var addr in interface.addresses) {
          if (addr.type == InternetAddressType.IPv4 && !addr.isLoopback) {
            final parts = addr.address.split('.');
            if (parts.length == 4) {
              subnets.add('${parts[0]}.${parts[1]}.${parts[2]}');
            }
          }
        }
      }

      if (subnets.isEmpty) return [];

      final List<Future<DiscoveredHost?>> tasks = [];
      for (final subnet in subnets) {
        for (int i = 1; i < 255; i++) {
          tasks.add(_checkIp('$subnet.$i', metadata));
        }
      }

      final results = await Future.wait(tasks);
      return results.whereType<DiscoveredHost>().toList();
    } catch (e) {
      print('Subnet scan error: $e');
      return [];
    }
  }

  Future<DiscoveredHost?> _checkIp(String ip, Map<String, String> metadata) async {
    try {
      final socket = await Socket.connect(ip, 5389, timeout: const Duration(milliseconds: 700));
      socket.destroy();
      
      final hostKey = '$ip:5389';
      String displayName = metadata[hostKey] ?? 'Relay Server';
      
      if (displayName == 'Relay Server') {
        try {
          final resolved = await InternetAddress(ip).reverse();
          if (resolved.host != ip) {
            displayName = resolved.host.split('.').first;
          }
        } catch (_) {}
      }

      if (displayName == 'Relay Server') {
        displayName = 'Relay Server ($ip)';
      }
      
      return DiscoveredHost(
        name: displayName,
        ip: ip,
        port: 5389,
      );
    } catch (_) {
      return null;
    }
  }
}
