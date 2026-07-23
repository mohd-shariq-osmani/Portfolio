import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/constants.dart';
import '../view_models/dashboard_view_model.dart';
import '../../workflow_detail/views/workflow_detail_view.dart';
import '../../workflow_detail/view_models/workflow_detail_view_model.dart';
import '../../../../data/repositories/n8n_repository.dart';

class DashboardView extends StatefulWidget {
  const DashboardView({super.key});

  @override
  State<DashboardView> createState() => _DashboardViewState();
}

class _DashboardViewState extends State<DashboardView> {
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Fetch data when dashboard is created
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DashboardViewModel>().loadData();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  String _formatRelativeTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);
    if (difference.inDays > 365) return '${(difference.inDays / 365).floor()}y ago';
    if (difference.inDays > 30) return '${(difference.inDays / 30).floor()}mo ago';
    if (difference.inDays > 0) return '${difference.inDays}d ago';
    if (difference.inHours > 0) return '${difference.inHours}h ago';
    if (difference.inMinutes > 0) return '${difference.inMinutes}m ago';
    return 'Just now';
  }

  @override
  Widget build(BuildContext context) {
    final viewModel = context.watch<DashboardViewModel>();

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Hero(
              tag: 'n8n_logo',
              child: Container(
                width: 28,
                height: 28,
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: N8nColors.pink,
                ),
                child: const Icon(Icons.hub, size: 16, color: Colors.white),
              ),
            ),
            const SizedBox(width: N8nSpacing.sm),
            const Text(
              'Workflows',
              style: TextStyle(fontFamily: 'Outfit', fontWeight: FontWeight.bold, fontSize: 20),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: N8nColors.textSecondary),
            onPressed: viewModel.loadData,
          ),
        ],
      ),
      body: RefreshIndicator(
        color: N8nColors.pink,
        backgroundColor: N8nColors.bgCard,
        onRefresh: viewModel.loadData,
        child: viewModel.isLoading && viewModel.workflows.isEmpty
            ? const Center(
                child: CircularProgressIndicator(color: N8nColors.pink),
              )
            : CustomScrollView(
                slivers: [
                  // Error Header
                  if (viewModel.errorMessage != null)
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.all(N8nSpacing.md),
                        child: Container(
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
                      ),
                    ),

                  // Stats Panel
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(N8nSpacing.md),
                      child: GridView.count(
                        shrinkWrap: true,
                        crossAxisCount: 3,
                        crossAxisSpacing: N8nSpacing.md,
                        mainAxisSpacing: N8nSpacing.md,
                        childAspectRatio: 1.1,
                        physics: const NeverScrollableScrollPhysics(),
                        children: [
                          _buildStatCard(
                            label: 'Total',
                            value: '${viewModel.totalWorkflowsCount}',
                            icon: Icons.list_alt,
                            color: N8nColors.textPrimary,
                          ),
                          _buildStatCard(
                            label: 'Active',
                            value: '${viewModel.activeWorkflowsCount}',
                            icon: Icons.check_circle_outline,
                            color: N8nColors.success,
                          ),
                          _buildStatCard(
                            label: 'Success Rate',
                            value: '${viewModel.successRate.toStringAsFixed(0)}%',
                            icon: Icons.speed,
                            color: N8nColors.running,
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Search Bar & Filter Controls
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: N8nSpacing.md),
                      child: Column(
                        children: [
                          TextField(
                            controller: _searchController,
                            onChanged: viewModel.setSearchQuery,
                            style: const TextStyle(fontSize: 14),
                            decoration: InputDecoration(
                              hintText: 'Search workflows or nodes...',
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
                          Row(
                            children: [
                              _buildFilterChip(viewModel, 'all', 'All'),
                              const SizedBox(width: N8nSpacing.sm),
                              _buildFilterChip(viewModel, 'active', 'Active'),
                              const SizedBox(width: N8nSpacing.sm),
                              _buildFilterChip(viewModel, 'inactive', 'Inactive'),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Workflows List
                  SliverPadding(
                    padding: const EdgeInsets.all(N8nSpacing.md),
                    sliver: viewModel.workflows.isEmpty
                        ? SliverToBoxAdapter(
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 40),
                              child: Column(
                                children: [
                                  Icon(Icons.hub_outlined, size: 48, color: N8nColors.textMuted),
                                  const SizedBox(height: N8nSpacing.sm),
                                  Text(
                                    _searchController.text.isNotEmpty
                                        ? 'No matching workflows found'
                                        : 'No workflows available',
                                    style: const TextStyle(color: N8nColors.textSecondary),
                                  ),
                                ],
                              ),
                            ),
                          )
                        : SliverList(
                            delegate: SliverChildBuilderDelegate(
                              (context, index) {
                                final workflow = viewModel.workflows[index];
                                return Padding(
                                  padding: const EdgeInsets.only(bottom: N8nSpacing.md),
                                  child: _buildWorkflowCard(context, workflow, viewModel),
                                );
                              },
                              childCount: viewModel.workflows.length,
                            ),
                          ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildStatCard({
    required String label,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(N8nSpacing.sm),
      decoration: BoxDecoration(
        color: N8nColors.bgCard,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: N8nColors.border),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Icon(icon, color: color.withOpacity(0.8), size: 20),
          const SizedBox(height: N8nSpacing.xs),
          Text(
            value,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(fontSize: 11, color: N8nColors.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(DashboardViewModel viewModel, String value, String label) {
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

  Widget _buildWorkflowCard(BuildContext context, dynamic workflow, DashboardViewModel viewModel) {
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {
          final repo = context.read<N8nRepository>();
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (context) => ChangeNotifierProvider(
                create: (context) => WorkflowDetailViewModel(
                  repository: repo,
                  workflowId: workflow.id,
                ),
                child: const WorkflowDetailView(),
              ),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(N8nSpacing.md),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Workflow Status Indicator Dot
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: workflow.active ? N8nColors.success : N8nColors.textMuted,
                  boxShadow: workflow.active
                      ? [
                          BoxShadow(
                            color: N8nColors.success.withOpacity(0.5),
                            blurRadius: 6,
                            spreadRadius: 1,
                          ),
                        ]
                      : [],
                ),
              ),
              const SizedBox(width: N8nSpacing.md),

              // Title and Nodes description
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      workflow.name,
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                        color: N8nColors.textPrimary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(Icons.grain, size: 14, color: N8nColors.textMuted),
                        const SizedBox(width: 4),
                        Text(
                          '${workflow.nodes.length} nodes',
                          style: const TextStyle(fontSize: 12, color: N8nColors.textSecondary),
                        ),
                        const SizedBox(width: N8nSpacing.sm),
                        const Text('•', style: TextStyle(color: N8nColors.textMuted)),
                        const SizedBox(width: N8nSpacing.sm),
                        Text(
                          _formatRelativeTime(workflow.updatedAt),
                          style: const TextStyle(fontSize: 12, color: N8nColors.textSecondary),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              // Active status toggle switch
              Transform.scale(
                scale: 0.8,
                child: Switch(
                  value: workflow.active,
                  activeColor: N8nColors.success,
                  activeTrackColor: N8nColors.successGlow,
                  inactiveThumbColor: N8nColors.textMuted,
                  inactiveTrackColor: N8nColors.bgDark,
                  onChanged: (val) {
                    viewModel.toggleWorkflow(workflow.id, val);
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
