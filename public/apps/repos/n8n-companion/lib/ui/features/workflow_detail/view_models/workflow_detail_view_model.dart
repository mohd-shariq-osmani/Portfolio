import 'package:flutter/material.dart';
import '../../../../data/models/workflow.dart';
import '../../../../data/models/execution.dart';
import '../../../../data/repositories/n8n_repository.dart';

class WorkflowDetailViewModel extends ChangeNotifier {
  final N8nRepository _repository;
  final String workflowId;

  Workflow? _workflow;
  Workflow? get workflow => _workflow;

  List<Execution> _executions = [];
  List<Execution> get executions => _executions;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  bool _isTriggering = false;
  bool get isTriggering => _isTriggering;

  String? _errorMessage;
  String? get errorMessage => _errorMessage;

  WorkflowDetailViewModel({
    required N8nRepository repository,
    required this.workflowId,
  }) : _repository = repository;

  Future<void> loadDetails() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      // Fetch single workflow with full nodes data
      _workflow = await _repository.getWorkflow(workflowId);

      // Fetch executions and filter for this workflow
      final allExecutions = await _repository.getExecutions(limit: 50);
      _executions = allExecutions.where((e) => e.workflowId == workflowId).toList();
    } catch (e) {
      _errorMessage = e.toString().replaceAll('Exception: ', '').replaceAll('N8nApiException: ', '');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> toggleActive(bool active) async {
    if (_workflow == null) return;
    
    // Save original status
    final original = _workflow!;
    _workflow = _workflow!.copyWith(active: active);
    notifyListeners();

    try {
      await _repository.toggleWorkflow(workflowId, active);
    } catch (e) {
      // Revert on error
      _workflow = original;
      _errorMessage = 'Failed to toggle status: ${e.toString().replaceAll('N8nApiException: ', '')}';
      notifyListeners();
    }
  }

  // Trigger manual execution
  Future<bool> triggerRun() async {
    if (_workflow == null) return false;

    _isTriggering = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await _repository.runWorkflow(workflowId);
      _isTriggering = false;
      notifyListeners();
      // Reload details to show the new execution log
      await loadDetails();
      return true;
    } catch (e) {
      _isTriggering = false;
      _errorMessage = 'Failed to trigger run: ${e.toString().replaceAll('N8nApiException: ', '')}';
      notifyListeners();
      return false;
    }
  }

  void clearError() {
    if (_errorMessage != null) {
      _errorMessage = null;
      notifyListeners();
    }
  }
}
