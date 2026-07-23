import 'package:flutter/material.dart';
import '../../../../data/models/execution.dart';
import '../../../../data/repositories/n8n_repository.dart';

class ExecutionHistoryViewModel extends ChangeNotifier {
  final N8nRepository _repository;

  List<Execution> _allExecutions = [];
  List<Execution> _filteredExecutions = [];
  List<Execution> get executions => _filteredExecutions;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  String _searchQuery = '';
  String _statusFilter = 'all'; // 'all', 'success', 'failed', 'running'
  String get statusFilter => _statusFilter;

  ExecutionHistoryViewModel({required N8nRepository repository}) : _repository = repository;

  Future<void> loadExecutions() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _allExecutions = await _repository.getExecutions(limit: 50);
      _applyFilterAndSearch();
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '').replaceAll('N8nApiException: ', '');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    _applyFilterAndSearch();
  }

  void setStatusFilter(String filter) {
    _statusFilter = filter;
    _applyFilterAndSearch();
  }

  void _applyFilterAndSearch() {
    _filteredExecutions = _allExecutions.where((e) {
      // 1. Status Filter
      if (_statusFilter == 'success' && e.status != 'success') return false;
      if (_statusFilter == 'failed' && e.status != 'failed') return false;
      if (_statusFilter == 'running' && e.status != 'running') return false;

      // 2. Search query (matches workflow name or execution ID)
      if (_searchQuery.trim().isNotEmpty) {
        final query = _searchQuery.toLowerCase();
        final nameMatch = e.workflowName.toLowerCase().contains(query);
        final idMatch = e.id.toLowerCase().contains(query);
        return nameMatch || idMatch;
      }

      return true;
    }).toList();
    notifyListeners();
  }

  void clearError() {
    if (_errorMessage != null) {
      _errorMessage = null;
      notifyListeners();
    }
  }
}
