import { useState, useEffect } from 'react';
import {
  Plus,
  LayoutGrid,
  List,
  Table,
  Download,
} from 'lucide-react';
import { format } from 'date-fns';
import { useShifts, ShiftModal, ShiftList, ShiftTable } from '../features/shifts';
import { KPIGrid } from '../features/insights';
import { EmptyState, ErrorState } from '../components/common';
import { Button } from '../components/ui';
import { calculateSummaryTotals, cn } from '../lib/utils.js';

function DashboardPage() {
  const { data: shifts = [], isLoading, error, refetch } = useShifts();
  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid', 'table'
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingShift, setEditingShift] = useState(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // N to add new shift
      if (e.key === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const activeElement = document.activeElement;
        if (
          activeElement.tagName !== 'INPUT' &&
          activeElement.tagName !== 'TEXTAREA'
        ) {
          e.preventDefault();
          setShowAddModal(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const totals = calculateSummaryTotals(shifts);

  const handleEditShift = (shift) => {
    setEditingShift(shift);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingShift(null);
  };

  const exportToCSV = () => {
    const headers = [
      'Date',
      'Workplace',
      'Start Time',
      'End Time',
      'Break (min)',
      'Hours',
      'Rate (CAD)',
      'Earnings (CAD)',
      'Earnings (PHP)',
      'Notes',
    ];

    const rows = shifts.map((shift) => [
      shift.shift_date,
      shift.workplace_name,
      format(new Date(shift.start_time), 'HH:mm'),
      format(new Date(shift.end_time), 'HH:mm'),
      shift.break_minutes,
      shift.adjusted_hours,
      shift.hourly_rate_cad,
      shift.earnings_cad,
      shift.earnings_php,
      shift.notes || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shifts-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <ErrorState
        title="Failed to load shifts"
        description={error.message}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-7">
      {/* Header */}
      <div className="page-shell px-5 py-5 sm:px-6 sm:py-6">
        <h1 className="page-header-title text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          Shift Overview <span className="text-3xl sm:text-4xl">🐚</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1.5 max-w-2xl">
          A clean snapshot of your schedule, earnings, and activity with fewer distractions.
        </p>
      </div>

      {/* KPI Cards */}
      <KPIGrid totals={totals} isLoading={isLoading} />

      {/* Toolbar */}
      <div className="page-shell px-4 py-3 sm:px-5 sm:py-4 space-y-3">
        <div className="rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 p-1.5">
          {/* View Mode Toggle */}
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'h-10 rounded-xl transition-all border text-sm flex items-center justify-center',
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-[var(--color-primary-dark)] border-[var(--color-primary)]/50 shadow-sm dark:text-[var(--color-primary-light)]'
                  : 'border-transparent text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700/60'
              )}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'h-10 rounded-xl transition-all border text-sm flex items-center justify-center',
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-[var(--color-primary-dark)] border-[var(--color-primary)]/50 shadow-sm dark:text-[var(--color-primary-light)]'
                  : 'border-transparent text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700/60'
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'h-10 rounded-xl transition-all border text-sm flex items-center justify-center',
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-[var(--color-primary-dark)] border-[var(--color-primary)]/50 shadow-sm dark:text-[var(--color-primary-light)]'
                  : 'border-transparent text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700/60'
              )}
              aria-label="Table view"
            >
              <Table className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Button variant="outline" onClick={exportToCSV} disabled={shifts.length === 0} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button onClick={() => setShowAddModal(true)} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Shift
          </Button>
        </div>
      </div>

      {/* Content */}
      {!isLoading && shifts.length === 0 ? (
        <EmptyState
          title="No shifts yet"
          description="Start tracking your work shifts and earnings. Add your first shift to get started!"
          actionLabel="Add your first shift"
          onAction={() => setShowAddModal(true)}
        />
      ) : viewMode === 'table' ? (
        <ShiftTable
          shifts={shifts}
          isLoading={isLoading}
          onEditShift={handleEditShift}
        />
      ) : (
        <ShiftList
          shifts={shifts}
          isLoading={isLoading}
          viewMode={viewMode}
          onEditShift={handleEditShift}
        />
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <ShiftModal
          isOpen={showAddModal}
          onClose={handleCloseModal}
          shift={editingShift}
        />
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="lg:hidden fixed bottom-20 right-6 z-40 w-14 h-14 rounded-2xl bg-[var(--color-primary)] text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        aria-label="Add shift"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}

export default DashboardPage;
