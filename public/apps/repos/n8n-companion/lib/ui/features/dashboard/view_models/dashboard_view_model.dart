import 'package:flutter/material.dart';
import '../../../../data/models/workflow.dart';
import '../../../../data/models/execution.dart';
import '../../../../data/repositories/n8n_repository.dart';

class DashboardViewModel extends ChangeNotifier {
  final N8nRepository _repository;

  List<Workflow> _allWorkflows = [];
  List<Workflow> _filteredWorkflows = [];
  List<Workflow> get workflows => _filteredWorkflows;

  List<Execution> _executions = [];
  List<Execution> get executions => _executions;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  String _searchQuery = '';
  String _statusFilter = 'all'; // 'all', 'active', 'inactive'
  String get statusFilter => _statusFilter;

  // Summary Stats
  int get totalWorkflowsCount => _allWorkflows.length;
  int get activeWorkflowsCount => _allWorkflows.where((w) => w.active).length;
  
  double get successRate {
    if (_executions.isEmpty) return 0.0;
    final completed = _executions.where((e) => e.status == 'success' || e.status == 'failed').toList();
    if (completed.isEmpty) return 0.0;
    final successful = completed.where((e) => e.status == 'success').length;
    return (successful / completed.length) * 100;
  }

  DashboardViewModel({required N8nRepository repository}) : _repository = repository;

  Future<void> loadData() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // Load workflows and executions in parallel
      final results = await Future.wait([
        _repository.getWorkflows(),
        _repository.getExecutions(limit: 25),
      ]);

      _allWorkflows = results[0] as List<Workflow>;
      _executions = results[1] as List<Execution>;
      _applyFilterAndSearch();
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '').replaceAll('N8nApiException: ', '');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Handle local searching
  void setSearchQuery(String query) {
    _searchQuery = query;
    _applyFilterAndSearch();
  }

  // Handle active status filtering
  void setStatusFilter(String filter) {
    _statusFilter = filter;
    _applyFilterAndSearch();
  }

  void _applyFilterAndSearch() {
    _filteredWorkflows = _allWorkflows.where((w) {
      // 1. Apply status filter
      if (_statusFilter == 'active' && !w.active) return false;
      if (_statusFilter == 'inactive' && w.active) return false;

      // 2. Apply search query
      if (_searchQuery.trim().isNotEmpty) {
        final query = _searchQuery.toLowerCase();
        final nameMatch = w.name.toLowerCase().contains(query);
        final idMatch = w.id.toLowerCase().contains(query);
        final nodeMatch = w.nodes.any((node) => node.name.toLowerCase().contains(query) || node.type.toLowerCase().contains(query));
        return nameMatch || idMatch || nodeMatch;
      }

      return true;
    }).toList();
    notifyListeners();
  }

  // Toggle active/inactive with optimistic UI updates
  Future<void> toggleWorkflow(String id, bool active) async {
    final index = _allWorkflows.indexWhere((w) => w.id == id);
    if (index == -1) return;

    final originalWorkflow = _allWorkflows[index];
    
    // Optimistic update
    _allWorkflows[index] = originalWorkflow.copyWith(active: active);
    _applyFilterAndSearch();

    try {
      await _repository.toggleWorkflow(id, active);
    } catch (e) {
      // Revert if API call fails
      _allWorkflows[index] = originalWorkflow;
      _applyFilterAndSearch();
      _errorMessage = 'Failed to toggle status: ${e.toString().replaceAll('N8nApiException: ', '')}';
      notifyListeners();
    }
  }

  void clearError() {
    if (_errorMessage != null) {
      _errorMessage = null;
      notifyListeners();
    }
  }
}
