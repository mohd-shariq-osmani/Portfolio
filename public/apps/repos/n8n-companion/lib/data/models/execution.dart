class Execution {
  final String id;
  final String workflowId;
  final String workflowName;
  final String status; // success, failed, running, waiting, new
  final DateTime startedAt;
  final DateTime? stoppedAt;
  final String? errorMessage;
  final Map<String, dynamic> rawData;

  Execution({
    required this.id,
    required this.workflowId,
    required this.workflowName,
    required this.status,
    required this.startedAt,
    this.stoppedAt,
    this.errorMessage,
    required this.rawData,
  });

  factory Execution.fromJson(Map<String, dynamic> json) {
    // Parse times
    DateTime started = DateTime.now();
    if (json['startedAt'] != null) {
      started = DateTime.tryParse(json['startedAt'].toString()) ?? DateTime.now();
    }
    DateTime? stopped;
    if (json['stoppedAt'] != null) {
      stopped = DateTime.tryParse(json['stoppedAt'].toString());
    }

    // Try to extract error message
    String? err;
    if (json['data'] != null && json['data']['resultData'] != null) {
      var resultData = json['data']['resultData'];
      if (resultData['error'] != null) {
        err = resultData['error']['message'] as String?;
      }
    }

    // Extract workflow details if available
    String wfName = 'Unknown Workflow';
    String wfId = '';
    if (json['workflowId'] != null) {
      wfId = json['workflowId'].toString();
    }
    if (json['workflowName'] != null) {
      wfName = json['workflowName'] as String;
    } else if (json['workflow'] != null && json['workflow']['name'] != null) {
      wfName = json['workflow']['name'] as String;
    }

    return Execution(
      id: (json['id'] ?? '').toString(),
      workflowId: wfId,
      workflowName: wfName,
      status: json['status'] as String? ?? 'unknown',
      startedAt: started,
      stoppedAt: stopped,
      errorMessage: err,
      rawData: json,
    );
  }

  // Get dynamic duration text
  String get durationText {
    if (stoppedAt == null) {
      return 'Running...';
    }
    final difference = stoppedAt!.difference(startedAt);
    if (difference.inSeconds < 1) {
      return '${difference.inMilliseconds}ms';
    }
    if (difference.inMinutes < 1) {
      return '${difference.inSeconds}s';
    }
    return '${difference.inMinutes}m ${difference.inSeconds % 60}s';
  }
}
