class UserSession {
  final String url;
  final String email;
  final String cookie;

  UserSession({
    required this.url,
    required this.email,
    required this.cookie,
  });

  Map<String, dynamic> toJson() {
    return {
      'url': url,
      'email': email,
      'cookie': cookie,
    };
  }

  factory UserSession.fromJson(Map<String, dynamic> json) {
    return UserSession(
      url: json['url'] as String,
      email: json['email'] as String,
      cookie: json['cookie'] as String,
    );
  }

  // Helper to format cookies correctly for HTTP requests
  Map<String, String> get headers {
    return {
      'Cookie': 'n8n-auth=$cookie',
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }
}
