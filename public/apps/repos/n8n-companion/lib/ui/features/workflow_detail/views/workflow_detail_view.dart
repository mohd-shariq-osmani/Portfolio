import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants.dart';
import '../view_models/workflow_detail_view_model.dart';
import '../../../../data/models/workflow.dart';
import '../../../../data/models/execution.dart';

class WorkflowDetailView extends StatefulWidget {
  const WorkflowDetailView({super.key});

  @override
  State<WorkflowDetailView> createState() => _WorkflowDetailViewState();
}

class _WorkflowDetailViewState extends State<WorkflowDetailView> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<WorkflowDetailViewModel>().loadDetails();
    });
  }

  // Map n8n node type name to a suitable Flutter icon
  IconData _getNodeIcon(String type) {
    final lowerType = type.toLowerCase();
    if (lowerType.contains('webhook')) return Icons.swap_horiz;
    if (lowerType.contains('cron') || lowerType.contains('schedule') || lowerType.contains('interval')) return Icons.schedule;
    if (lowerType.contains('postgres') || lowerType.contains('mysql') || lowerType.contains('mongo') || lowerType.contains('db')) return Icons.storage;
    if (lowerType.contains('email') || lowerType.contains('gmail')) return Icons.email;
    if (lowerType.contains('slack') || lowerType.contains('telegram') || lowerType.contains('discord')) return Icons.chat_bubble_outline;
    if (lowerType.contains('http') || lowerType.contains('request')) return Icons.http;
    if (lowerType.contains('code') || lowerType.contains('javascript') || lowerType.contains('python')) return Icons.code;
    if (lowerType.contains('set') || lowerType.contains('merge') || lowerType.contains('filter')) return Icons.transform;
    return Icons.settings_input_component;
  }

  void _triggerExecution(BuildContext context, WorkflowDetailViewModel viewModel) async {
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    scaffoldMessenger.showSnackBar(
      const SnackBar(
        content: Row(
          children: [
            SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation<Color>(Colors.white)),
            ),
            SizedBox(width: N8nSpacing.md),
            Text('Triggering workflow execution...'),
          ],
        ),
        backgroundColor: N8nColors.bgCard,
        duration: Duration(seconds: 1),
      ),
    );

    final success = await viewModel.triggerRun();
    if (success) {
      scaffoldMessenger.showSnackBar(
        const SnackBar(
          content: Text('Workflow executed successfully!'),
          backgroundColor: N8nColors.success,
        ),
      );
    }
  }

  void _showExecutionDetails(BuildContext context, Execution execution) {
    showModalBottomSheet(
      context: context,
      backgroundColor: N8nColors.bgCard,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(N8nSpacing.lg),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Run #${execution.id.substring(0, Math.min(8, execution.id.length))}',
                      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: N8nColors.textPrimary),
                    ),
                    _buildStatusBadge(execution.status),
                  ],
                ),
                const SizedBox(height: N8nSpacing.md),
                const Divider(),
                const SizedBox(height: N8nSpacing.md),
                _buildDetailRow('Started At', execution.startedAt.toLocal().toString()),
                const SizedBox(height: N8nSpacing.sm),
                if (execution.stoppedAt != null)
                  _buildDetailRow('Stopped At', execution.stoppedAt!.toLocal().toString()),
                const SizedBox(height: N8nSpacing.sm),
                _buildDetailRow('Duration', execution.durationText),
                
                if (execution.errorMessage != null) ...[
                  const SizedBox(height: N8nSpacing.md),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(N8nSpacing.md),
                    decoration: BoxDecoration(
                      color: N8nColors.errorGlow,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: N8nColors.error.withOpacity(0.3)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Error Details:',
                          style: TextStyle(color: N8nColors.error, fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          execution.errorMessage!,
                          style: const TextStyle(color: N8nColors.textPrimary, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: N8nSpacing.lg),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: N8nColors.textPrimary,
                      side: const BorderSide(color: N8nColors.border),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                    ),
                    child: const Text('Close'),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: N8nColors.textSecondary, fontSize: 13)),
        Text(value, style: const TextStyle(color: N8nColors.textPrimary, fontSize: 13, fontWeight: FontWeight.w500)),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final viewModel = context.watch<WorkflowDetailViewModel>();
    final workflow = viewModel.workflow;

    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: Text(
            workflow?.name ?? 'Loading...',
            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
          ),
          actions: [
            if (workflow != null)
              Padding(
                padding: const EdgeInsets.only(right: 8.0),
                child: Row(
                  children: [
                    const Text('Active', style: TextStyle(fontSize: 12, color: N8nColors.textSecondary)),
                    const SizedBox(width: 4),
                    Transform.scale(
                      scale: 0.7,
                      child: Switch(
                        value: workflow.active,
                        activeColor: N8nColors.success,
                        onChanged: viewModel.toggleActive,
                      ),
                    ),
                  ],
                ),
              )
          ],
          bottom: const TabBar(
            indicatorColor: N8nColors.pink,
            labelColor: N8nColors.pink,
            unselectedLabelColor: N8nColors.textSecondary,
            tabs: [
              Tab(text: 'Nodes'),
              Tab(text: 'History'),
            ],
          ),
        ),
        body: viewModel.isLoading && workflow == null
            ? const Center(child: CircularProgressIndicator(color: N8nColors.pink))
            : Column(
                children: [
                  // Error Banner
                  if (viewModel.errorMessage != null)
                    Container(
                      margin: const EdgeInsets.all(N8nSpacing.md),
                      padding: const EdgeInsets.all(N8nSpacing.md),
                      decoration: BoxDecoration(
                        color: N8nColors.errorGlow,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: N8nColors.error.withOpacity(0.3)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.error_outline, color: N8nColors.error),
                          const SizedBox(width: N8nSpacing.sm),
                          Expanded(
                            child: Text(
                              viewModel.errorMessage!,
                              style: const TextStyle(color: N8nColors.textPrimary, fontSize: 13),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.close, size: 16, color: N8nColors.textSecondary),
                            onPressed: viewModel.clearError,
                            constraints: const BoxConstraints(),
                            padding: EdgeInsets.zero,
                          )
                        ],
                      ),
                    ),

                  Expanded(
                    child: TabBarView(
                      children: [
                        // Tab 1: Nodes list
                        _buildNodesTab(workflow),

                        // Tab 2: Execution history logs
                        _buildHistoryTab(viewModel.executions),
                      ],
                    ),
                  ),
                ],
              ),
        floatingActionButton: (workflow != null)
            ? FloatingActionButton.extended(
                onPressed: viewModel.isTriggering ? null : () => _triggerExecution(context, viewModel),
                backgroundColor: N8nColors.pink,
                icon: viewModel.isTriggering
                    ? const SizedBox(
                        width: 18,
                        height: 18,
                        child: CircularProgressIndicator(strokeWidth: 2, valueColor: AlwaysStoppedAnimation<Color>(Colors.white)),
                      )
                    : const Icon(Icons.play_arrow, color: Colors.white),
                label: Text(
                  viewModel.isTriggering ? 'Executing...' : 'Run Workflow',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                ),
              )
            : null,
      ),
    );
  }

  Widget _buildNodesTab(Workflow? workflow) {
    if (workflow == null || workflow.nodes.isEmpty) {
      return Center(
        child: Text(
          workflow == null ? 'Workflow details not loaded.' : 'No nodes found in this workflow.',
          style: const TextStyle(color: N8nColors.textSecondary),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(N8nSpacing.md),
      itemCount: workflow.nodes.length,
      itemBuilder: (context, index) {
        final node = workflow.nodes[index];
        final isTrigger = node.type.toLowerCase().contains('trigger') ||
            node.type.toLowerCase().contains('webhook') ||
            node.type.toLowerCase().contains('cron');

        return IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Left connection timeline graphics
              Column(
                children: [
                  Container(
                    width: 14,
                    height: 14,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isTrigger ? N8nColors.pink : N8nColors.bgCard,
                      border: Border.all(
                        color: isTrigger ? N8nColors.pink : N8nColors.border,
                        width: 2,
                      ),
                    ),
                  ),
                  if (index < workflow.nodes.length - 1)
                    Expanded(
                      child: Container(
                        width: 2,
                        color: N8nColors.border,
                      ),
                    ),
                ],
              ),
              const SizedBox(width: N8nSpacing.md),
              
              // Node detail card
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(bottom: N8nSpacing.md),
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(N8nSpacing.md),
                      child: Row(
                        children: [
                          CircleAvatar(
                            backgroundColor: isTrigger ? N8nColors.pinkGlow : N8nColors.bgDark,
                            radius: 18,
                            child: Icon(
                              _getNodeIcon(node.type),
                              color: isTrigger ? N8nColors.pink : N8nColors.textSecondary,
                              size: 18,
                            ),
                          ),
                          const SizedBox(width: N8nSpacing.md),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  node.name,
                                  style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                    color: N8nColors.textPrimary,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  node.iconName,
                                  style: const TextStyle(fontSize: 11, color: N8nColors.textMuted),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildHistoryTab(List<Execution> executions) {
    if (executions.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.history, size: 48, color: N8nColors.textMuted),
            SizedBox(height: N8nSpacing.sm),
            Text(
              'No execution history logs available',
              style: TextStyle(color: N8nColors.textSecondary),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(N8nSpacing.md),
      itemCount: executions.length,
      itemBuilder: (context, index) {
        final execution = executions[index];
        return Card(
          margin: const EdgeInsets.only(bottom: N8nSpacing.md),
          child: InkWell(
            borderRadius: BorderRadius.circular(12),
            onTap: () => _showExecutionDetails(context, execution),
            child: Padding(
              padding: const EdgeInsets.all(N8nSpacing.md),
              child: Row(
                children: [
                  _buildStatusDot(execution.status),
                  const SizedBox(width: N8nSpacing.md),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Execution #${execution.id.substring(0, Math.min(8, execution.id.length))}',
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: N8nColors.textPrimary),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Ran at: ${execution.startedAt.toLocal().toString().split('.')[0]}',
                          style: const TextStyle(fontSize: 12, color: N8nColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      _buildStatusBadge(execution.status),
                      const SizedBox(height: 4),
                      Text(
                        execution.durationText,
                        style: const TextStyle(fontSize: 11, color: N8nColors.textMuted),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildStatusDot(String status) {
    Color dotColor = N8nColors.textMuted;
    if (status == 'success') dotColor = N8nColors.success;
    if (status == 'failed') dotColor = N8nColors.error;
    if (status == 'running') dotColor = N8nColors.running;
    if (status == 'waiting') dotColor = N8nColors.warning;

    return Container(
      width: 8,
      height: 8,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: dotColor,
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color color = N8nColors.textMuted;
    Color bg = N8nColors.bgDark;
    if (status == 'success') {
      color = N8nColors.success;
      bg = N8nColors.successGlow;
    } else if (status == 'failed') {
      color = N8nColors.error;
      bg = N8nColors.errorGlow;
    } else if (status == 'running') {
      color = N8nColors.running;
      bg = N8nColors.runningGlow;
    } else if (status == 'waiting') {
      color = N8nColors.warning;
      bg = N8nColors.warningGlow;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withOpacity(0.3), width: 0.5),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(
          fontSize: 10,
          color: color,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}

// Simple Math.min implementation in Dart
class Math {
  static int min(int a, int b) => a < b ? a : b;
}
