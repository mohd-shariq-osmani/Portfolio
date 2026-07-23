import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../models/user_session.dart';
import '../models/workflow.dart';
import '../models/execution.dart';

class N8nApiException implements Exception {
  final String message;
  final int? statusCode;

  N8nApiException(this.message, {this.statusCode});

  @override
  String toString() => 'N8nApiException: $message (Status: $statusCode)';
}

class N8nApiService {
  // Helper to format the instance URL
  String formatUrl(String input) {
    var url = input.trim();
    while (url.endsWith('/')) {
      url = url.substring(0, url.length - 1);
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.contains('.n8n.cloud') || 
          url.contains('.com') || 
          url.contains('.net') || 
          url.contains('.io')) {
        url = 'https://$url';
      } else {
        url = 'http://$url';
      }
    }
    return url;
  }

  // Attempt login with email and password
  Future<UserSession> login(String rawUrl, String email, String password) async {
    final formattedUrl = formatUrl(rawUrl);
    final loginEndpoint = Uri.parse('$formattedUrl/rest/login');

    try {
      final response = await http.post(
        loginEndpoint,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': email,
          'emailOrLdapLoginId': email,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        // Parse set-cookie header to retrieve n8n-auth cookie
        final setCookie = response.headers['set-cookie'];
        if (setCookie == null) {
          throw N8nApiException('Login succeeded, but no session cookie was returned by the server.');
        }

        final regExp = RegExp(r'n8n-auth=([^;]+)');
        final match = regExp.firstMatch(setCookie);
        final cookieValue = match?.group(1);

        if (cookieValue == null || cookieValue.isEmpty) {
          throw N8nApiException('Could not parse the authentication cookie from the server response.');
        }

        return UserSession(
          url: formattedUrl,
          email: email,
          cookie: cookieValue,
        );
      } else if (response.statusCode == 401 || response.statusCode == 403) {
        throw N8nApiException('Invalid email or password.', statusCode: response.statusCode);
      } else {
        throw N8nApiException(
          'Login failed with server error: ${response.reasonPhrase}',
          statusCode: response.statusCode,
        );
      }
    } on SocketException {
      throw N8nApiException('Unable to connect to the server. Please verify the URL and your network connection.');
    } catch (e) {
      if (e is N8nApiException) rethrow;
      throw N8nApiException('An unexpected error occurred: ${e.toString()}');
    }
  }

  // Helper to extract a list of elements from various response body formats in n8n
  List<dynamic> _extractList(dynamic decoded) {
    if (decoded == null) return [];
    if (decoded is List) return decoded;
    if (decoded is Map) {
      if (decoded['results'] is List) {
        return decoded['results'] as List;
      }
      if (decoded['data'] != null) {
        final dataVal = decoded['data'];
        if (dataVal is List) {
          return dataVal;
        }
        if (dataVal is Map) {
          if (dataVal['results'] is List) {
            return dataVal['results'] as List;
          }
          if (dataVal['data'] is List) {
            return dataVal['data'] as List;
          }
        }
      }
      // Fallback search
      for (final value in decoded.values) {
        if (value is List) return value;
        if (value is Map) {
          if (value['results'] is List) return value['results'] as List;
          if (value['data'] is List) return value['data'] as List;
        }
      }
    }
    return [];
  }

  // Fetch workflows list
  Future<List<Workflow>> fetchWorkflows(UserSession session) async {
    final endpoint = Uri.parse('${session.url}/rest/workflows');

    try {
      final response = await http.get(endpoint, headers: session.headers);

      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        final list = _extractList(decoded);
        return list.map((item) => Workflow.fromJson(item as Map<String, dynamic>)).toList();
      } else {
        throw N8nApiException(
          'Failed to retrieve workflows: ${response.reasonPhrase}',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is N8nApiException) rethrow;
      throw N8nApiException('Error fetching workflows: ${e.toString()}');
    }
  }

  // Fetch a single workflow by ID (contains full nodes data)
  Future<Workflow> fetchWorkflow(UserSession session, String id) async {
    final endpoint = Uri.parse('${session.url}/rest/workflows/$id');

    try {
      final response = await http.get(endpoint, headers: session.headers);

      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        Map<String, dynamic> workflowMap;
        if (decoded is Map && decoded['data'] is Map) {
          workflowMap = Map<String, dynamic>.from(decoded['data'] as Map);
        } else if (decoded is Map) {
          workflowMap = Map<String, dynamic>.from(decoded);
        } else {
          throw N8nApiException('Unexpected response format for workflow details.');
        }
        return Workflow.fromJson(workflowMap);
      } else {
        throw N8nApiException(
          'Failed to retrieve workflow details: ${response.reasonPhrase}',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is N8nApiException) rethrow;
      throw N8nApiException('Error fetching workflow details: ${e.toString()}');
    }
  }

  // Fetch execution logs
  Future<List<Execution>> fetchExecutions(UserSession session, {int limit = 50}) async {
    final endpoint = Uri.parse('${session.url}/rest/executions?limit=$limit');

    try {
      final response = await http.get(endpoint, headers: session.headers);

      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        final list = _extractList(decoded);
        return list.map((item) => Execution.fromJson(item as Map<String, dynamic>)).toList();
      } else {
        throw N8nApiException(
          'Failed to retrieve executions: ${response.reasonPhrase}',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is N8nApiException) rethrow;
      throw N8nApiException('Error fetching execution history: ${e.toString()}');
    }
  }

  // Toggle active status (requires PATCH /rest/workflows/:id with {"active": bool})
  Future<void> toggleWorkflowActive(UserSession session, String id, bool active) async {
    final endpoint = Uri.parse('${session.url}/rest/workflows/$id');

    try {
      final response = await http.patch(
        endpoint,
        headers: session.headers,
        body: jsonEncode({'active': active}),
      );

      if (response.statusCode != 200) {
        throw N8nApiException(
          'Failed to toggle workflow status: ${response.reasonPhrase}',
          statusCode: response.statusCode,
        );
      }
    } catch (e) {
      if (e is N8nApiException) rethrow;
      throw N8nApiException('Error updating workflow status: ${e.toString()}');
    }
  }

  // Manually run a workflow by fetching details and posting to /rest/workflows/run
  Future<void> runWorkflow(UserSession session, String id) async {
    // 1. Fetch the complete saved workflow definition (includes nodes, connections, settings)
    final getEndpoint = Uri.parse('${session.url}/rest/workflows/$id');
    
    try {
      final getResponse = await http.get(getEndpoint, headers: session.headers);

      if (getResponse.statusCode != 200) {
        throw N8nApiException(
          'Failed to retrieve workflow details before running: ${getResponse.reasonPhrase}',
          statusCode: getResponse.statusCode,
        );
      }

      final decoded = jsonDecode(getResponse.body);
      Map<String, dynamic> workflowData;
      if (decoded is Map && decoded['data'] is Map) {
        workflowData = Map<String, dynamic>.from(decoded['data'] as Map);
      } else if (decoded is Map) {
        workflowData = Map<String, dynamic>.from(decoded);
      } else {
        throw N8nApiException('Unexpected response format for workflow details.');
      }

      // 2. Post workflowData to `/rest/workflows/run` to trigger manual test execution
      final runEndpoint = Uri.parse('${session.url}/rest/workflows/run');
      final runResponse = await http.post(
        runEndpoint,
        headers: session.headers,
        body: jsonEncode({
          'workflowData': workflowData,
        }),
      );

      if (runResponse.statusCode != 200 && runResponse.statusCode != 201) {
        throw N8nApiException(
          'Failed to trigger workflow: ${runResponse.reasonPhrase}',
          statusCode: runResponse.statusCode,
        );
      }
    } catch (e) {
      if (e is N8nApiException) rethrow;
      throw N8nApiException('Error triggering workflow run: ${e.toString()}');
    }
  }
}
