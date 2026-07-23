import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants.dart';
import '../view_models/execution_history_view_model.dart';
import '../../../../data/models/execution.dart';

class ExecutionHistoryView extends StatefulWidget {
  const ExecutionHistoryView({super.key});

  @override
  State<ExecutionHistoryView> createState() => _ExecutionHistoryViewState();
}

class _ExecutionHistoryViewState extends State<ExecutionHistoryView> {
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ExecutionHistoryViewModel>().loadExecutions();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
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
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          execution.workflowName,
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: N8nColors.textPrimary),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: N8nSpacing.md),
                      _buildStatusBadge(execution.status),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Execution ID: ${execution.id}',
                    style: const TextStyle(fontSize: 12, color: N8nColors.textMuted),
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
                            'Error Message:',
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
    final viewModel = context.watch<ExecutionHistoryViewModel>();

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Execution Log',
          style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold, fontSize: 20),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: N8nColors.textSecondary),
            onPressed: viewModel.loadExecutions,
          ),
        ],
      ),
      body: RefreshIndicator(
        color: N8nColors.pink,
        backgroundColor: N8nColors.bgCard,
        onRefresh: viewModel.loadExecutions,
        child: viewModel.isLoading && viewModel.executions.isEmpty
            ? const Center(child: CircularProgressIndicator(color: N8nColors.pink))
            : Column(
                children: [
                  // Error Box
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

                  // Search and Filters
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: N8nSpacing.md, vertical: N8nSpacing.sm),
                    child: Column(
                      children: [
                        TextField(
                          controller: _searchController,
                          onChanged: viewModel.setSearchQuery,
                          style: const TextStyle(fontSize: 14),
                          decoration: InputDecoration(
                            hintText: 'Search by workflow name or ID...',
                            prefixIcon: const Icon(Icons.search, size: 20, color: N8nColors.textSecondary),
                            suffixIcon: _searchController.text.isNotEmpty
                                ? IconButton(
                                    icon: const Icon(Icons.clear, size: 16),
                                    onPressed: () {
                                      _searchController.clear();
                                      viewModel.setSearchQuery('');
                                    },
                                  )
                                : null,
                            fillColor: N8nColors.bgCard,
                            contentPadding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                        ),
                        const SizedBox(height: N8nSpacing.sm),
                        SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children: [
                              _buildFilterChip(viewModel, 'all', 'All'),
                              const SizedBox(width: N8nSpacing.sm),
                              _buildFilterChip(viewModel, 'success', 'Success'),
                              const SizedBox(width: N8nSpacing.sm),
                              _buildFilterChip(viewModel, 'failed', 'Failed'),
                              const SizedBox(width: N8nSpacing.sm),
                              _buildFilterChip(viewModel, 'running', 'Running'),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Executions list
                  Expanded(
                    child: viewModel.executions.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.history_outlined, size: 48, color: N8nColors.textMuted),
                                const SizedBox(height: N8nSpacing.sm),
                                Text(
                                  _searchController.text.isNotEmpty
                                      ? 'No matching logs found'
                                      : 'No execution history available',
                                  style: const TextStyle(color: N8nColors.textSecondary),
                                ),
                              ],
                            ),
                          )
                        : ListView.builder(
                            padding: const EdgeInsets.all(N8nSpacing.md),
                            itemCount: viewModel.executions.length,
                            itemBuilder: (context, index) {
                              final execution = viewModel.executions[index];
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
                                                execution.workflowName,
                                                style: const TextStyle(
                                                  fontSize: 14,
                                                  fontWeight: FontWeight.w600,
                                                  color: N8nColors.textPrimary,
                                                ),
                                                maxLines: 1,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                              const SizedBox(height: 4),
                                              Text(
                                                'ID: ${execution.id.substring(0, Math.min(8, execution.id.length))}  •  ${execution.startedAt.toLocal().toString().split('.')[0]}',
                                                style: const TextStyle(fontSize: 11, color: N8nColors.textSecondary),
                                              ),
                                            ],
                                          ),
                                        ),
                                        const SizedBox(width: 8),
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
                          ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildFilterChip(ExecutionHistoryViewModel viewModel, String value, String label) {
    final isSelected = viewModel.statusFilter == value;

    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (_) => viewModel.setStatusFilter(value),
      backgroundColor: N8nColors.bgDark,
      selectedColor: N8nColors.pink.withOpacity(0.15),
      labelStyle: TextStyle(
        fontSize: 12,
        color: isSelected ? N8nColors.pink : N8nColors.textSecondary,
        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: BorderSide(
          color: isSelected ? N8nColors.pink.withOpacity(0.5) : N8nColors.border,
        ),
      ),
      showCheckmark: false,
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

class Math {
  static int min(int a, int b) => a < b ? a : b;
}
