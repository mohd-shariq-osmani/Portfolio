import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SecureStorage {
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Future<void> saveToken(String hostId, String token) async {
    await _storage.write(key: 'token_$hostId', value: token);
  }

  Future<String?> getToken(String hostId) async {
    return await _storage.read(key: 'token_$hostId');
  }

  Future<void> removeToken(String hostId) async {
    await _storage.delete(key: 'token_$hostId');
  }

  Future<Map<String, String>> getAllTokens() async {
    final all = await _storage.readAll();
    final tokens = <String, String>{};
    all.forEach((key, value) {
      if (key.startsWith('token_')) {
        final hostId = key.substring(6); // Remove 'token_'
        tokens[hostId] = value;
      }
    });
    return tokens;
  }

  Future<void> saveLastConnectedHost(String hostAddress, String hostName) async {
    await _storage.write(key: 'last_host_address', value: hostAddress);
    await _storage.write(key: 'last_host_name', value: hostName);
  }

  Future<Map<String, String>?> getLastConnectedHost() async {
    final address = await _storage.read(key: 'last_host_address');
    final name = await _storage.read(key: 'last_host_name');
    if (address != null && name != null) {
      return {'address': address, 'name': name};
    }
    return null;
  }

  Future<void> saveHostMetadata(String address, String name) async {
    final metadata = await getHostsMetadata();
    metadata[address] = name;
    await _storage.write(key: 'paired_metadata', value: json.encode(metadata));
  }

  Future<Map<String, String>> getHostsMetadata() async {
    final jsonStr = await _storage.read(key: 'paired_metadata');
    if (jsonStr == null) return {};
    try {
      final map = json.decode(jsonStr) as Map<String, dynamic>;
      return map.map((key, value) => MapEntry(key, value.toString()));
    } catch (_) {
      return {};
    }
  }

  Future<void> removeHostMetadata(String address) async {
    final metadata = await getHostsMetadata();
    metadata.remove(address);
    await _storage.write(key: 'paired_metadata', value: json.encode(metadata));
  }

  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}

