import 'package:flutter/material.dart';
import '../../../../data/repositories/n8n_repository.dart';

class LoginViewModel extends ChangeNotifier {
  final N8nRepository _repository;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  LoginViewModel({required N8nRepository repository}) : _repository = repository;

  Future<bool> login(String url, String email, String password) async {
    // Validate inputs locally
    if (url.trim().isEmpty) {
      _setErrorMessage('Please enter your n8n URL.');
      return false;
    }
    if (email.trim().isEmpty) {
      _setErrorMessage('Please enter your email.');
      return false;
    }
    if (password.trim().isEmpty) {
      _setErrorMessage('Please enter your password.');
      return false;
    }

    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _repository.login(url, email, password);
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _isLoading = false;
      _setErrorMessage(e.toString().replaceAll('N8nApiException: ', ''));
      return false;
    }
  }

  void _setErrorMessage(String message) {
    _errorMessage = message;
    notifyListeners();
  }

  void clearError() {
    if (_errorMessage != null) {
      _errorMessage = null;
      notifyListeners();
    }
  }
}
