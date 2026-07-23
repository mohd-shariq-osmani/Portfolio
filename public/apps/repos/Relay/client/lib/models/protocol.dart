import 'dart:convert';

class Message {
  final String type;
  final Map<String, dynamic> payload;

  Message({required this.type, required this.payload});

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      type: json['type'] as String,
      payload: json,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      ...payload,
    };
  }

  String toJsonString() => json.encode(toJson());
}
