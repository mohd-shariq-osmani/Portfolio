class Workflow {
  final String id;
  final String name;
  final bool active;
  final DateTime updatedAt;
  final List<WorkflowNode> nodes;

  Workflow({
    required this.id,
    required this.name,
    required this.active,
    required this.updatedAt,
    required this.nodes,
  });

  factory Workflow.fromJson(Map<String, dynamic> json) {
    var nodesList = json['nodes'] as List? ?? [];
    List<WorkflowNode> parsedNodes = nodesList.map((n) {
      return WorkflowNode.fromJson(n as Map<String, dynamic>);
    }).toList();

    return Workflow(
      id: (json['id'] ?? '').toString(),
      name: json['name'] as String? ?? 'Untitled Workflow',
      active: json['active'] as bool? ?? false,
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'].toString()) ?? DateTime.now()
          : DateTime.now(),
      nodes: parsedNodes,
    );
  }

  // Create a copy of workflow with modified fields
  Workflow copyWith({
    String? id,
    String? name,
    bool? active,
    DateTime? updatedAt,
    List<WorkflowNode>? nodes,
  }) {
    return Workflow(
      id: id ?? this.id,
      name: name ?? this.name,
      active: active ?? this.active,
      updatedAt: updatedAt ?? this.updatedAt,
      nodes: nodes ?? this.nodes,
    );
  }
}

class WorkflowNode {
  final String id;
  final String name;
  final String type;
  final Map<String, dynamic> parameters;
  final double positionX;
  final double positionY;

  WorkflowNode({
    required this.id,
    required this.name,
    required this.type,
    required this.parameters,
    required this.positionX,
    required this.positionY,
  });

  factory WorkflowNode.fromJson(Map<String, dynamic> json) {
    List<dynamic> position = json['position'] as List? ?? [0.0, 0.0];
    double posX = 0.0;
    double posY = 0.0;
    if (position.length >= 2) {
      posX = (position[0] as num).toDouble();
      posY = (position[1] as num).toDouble();
    }

    return WorkflowNode(
      id: json['id'] as String? ?? '',
      name: json['name'] as String? ?? 'Unnamed Node',
      type: json['type'] as String? ?? 'n8n-nodes-base.unknown',
      parameters: json['parameters'] as Map<String, dynamic>? ?? {},
      positionX: posX,
      positionY: posY,
    );
  }

  // Helper to extract a friendly icon name from the node type
  String get iconName {
    // E.g. "n8n-nodes-base.webhook" -> "webhook"
    final parts = type.split('.');
    if (parts.length > 1) {
      return parts.last;
    }
    return type;
  }
}
