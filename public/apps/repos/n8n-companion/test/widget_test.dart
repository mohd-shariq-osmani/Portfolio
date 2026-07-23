import 'package:flutter_test/flutter_test.dart';
import 'package:n8n_companion/data/models/user_session.dart';
import 'package:n8n_companion/data/models/workflow.dart';
import 'package:n8n_companion/data/models/execution.dart';

void main() {
  group('n8n Companion Model Tests', () {
    test('UserSession formats headers correctly', () {
      final session = UserSession(
        url: 'http://localhost:5678',
        email: 'test@n8n.io',
        cookie: 'abc123session',
      );

      expect(session.url, 'http://localhost:5678');
      expect(session.email, 'test@n8n.io');
      expect(session.cookie, 'abc123session');
      
      final headers = session.headers;
      expect(headers['Cookie'], 'n8n-auth=abc123session');
      expect(headers['Content-Type'], 'application/json');
    });

    test('Workflow parses from JSON correctly', () {
      final json = {
        'id': '1',
        'name': 'Test Workflow',
        'active': true,
        'updatedAt': '2026-07-18T08:32:13Z',
        'nodes': [
          {
            'id': 'node-1',
            'name': 'Webhook Trigger',
            'type': 'n8n-nodes-base.webhook',
            'parameters': {'path': 'test'},
            'position': [250, 300]
          }
        ]
      };

      final workflow = Workflow.fromJson(json);

      expect(workflow.id, '1');
      expect(workflow.name, 'Test Workflow');
      expect(workflow.active, isTrue);
      expect(workflow.nodes.length, 1);
      
      final node = workflow.nodes.first;
      expect(node.id, 'node-1');
      expect(node.name, 'Webhook Trigger');
      expect(node.type, 'n8n-nodes-base.webhook');
      expect(node.iconName, 'webhook');
      expect(node.positionX, 250.0);
      expect(node.positionY, 300.0);
    });

    test('Execution parses from JSON correctly', () {
      final json = {
        'id': '99',
        'workflowId': '1',
        'workflowName': 'Test Workflow',
        'status': 'success',
        'startedAt': '2026-07-18T08:30:00Z',
        'stoppedAt': '2026-07-18T08:31:15Z',
        'data': {
          'resultData': {
            'error': null
          }
        }
      };

      final execution = Execution.fromJson(json);

      expect(execution.id, '99');
      expect(execution.workflowId, '1');
      expect(execution.workflowName, 'Test Workflow');
      expect(execution.status, 'success');
      expect(execution.durationText, '1m 15s');
    });

    test('Execution formats running state correctly', () {
      final execution = Execution(
        id: '100',
        workflowId: '1',
        workflowName: 'Test Workflow',
        status: 'running',
        startedAt: DateTime.now(),
        rawData: {},
      );

      expect(execution.stoppedAt, isNull);
      expect(execution.durationText, 'Running...');
    });
  });
}
