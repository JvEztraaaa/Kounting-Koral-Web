import { useState, useEffect } from 'react';
import {
  Plus,
  LayoutGrid,
  List,
  Table,
  Filter,
  Download,
  Calendar,
} from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';
import { useShifts, ShiftModal, ShiftList, ShiftTable } from '../features/shifts';
import { KPIGrid } from '../features/insights';
import { EmptyState, ErrorState } from '../components/common';
import { Button, Input, Badge } from '../components/ui';
import { calculateSummaryTotals, cn } from '../lib/utils.js';

function DashboardPage() {
  const { data: shifts = [], isLoading, error, refetch } = useShifts();
  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid', 'table'
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    workplace: '',
  });

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

  // Filter shifts
  const filteredShifts = shifts.filter((shift) => {
    // Date filters
    if (filters.dateFrom) {
      const shiftDate = typeof shift.shift_date === 'string' 
        ? shift.shift_date 
        : format(shift.shift_date, 'yyyy-MM-dd');
      if (shiftDate < filters.dateFrom) return false;
    }
    if (filters.dateTo) {
      const shiftDate = typeof shift.shift_date === 'string' 
        ? shift.shift_date 
        : format(shift.shift_date, 'yyyy-MM-dd');
      if (shiftDate > filters.dateTo) return false;
    }

    // Workplace filter
    if (filters.workplace) {
      if (!shift.workplace_name.toLowerCase().includes(filters.workplace.toLowerCase())) {
        return false;
      }
    }

    return true;
  });

  const totals = calculateSummaryTotals(filteredShifts);

  // Get unique workplaces for filter dropdown
  const uniqueWorkplaces = [...new Set(shifts.map((s) => s.workplace_name))];

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

    const rows = filteredShifts.map((shift) => [
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

  const clearFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      workplace: '',
    });
  };

  const hasActiveFilters =
    filters.dateFrom ||
    filters.dateTo ||
    filters.workplace;

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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          Kounting Koral <span className="text-3xl sm:text-4xl">🐚</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
          Proud of you always, Ica!
        </p>
      </div>

      {/* KPI Cards */}
      <KPIGrid totals={totals} isLoading={isLoading} />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-1 gap-2 w-full sm:w-auto">
          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-[var(--color-primary-dark)] text-white rounded-full">
                !
              </span>
            )}
          </Button>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'list'
                  ? 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] dark:bg-[var(--color-primary)]/25 dark:text-[var(--color-primary-light)] shadow-sm'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'grid'
                  ? 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] dark:bg-[var(--color-primary)]/25 dark:text-[var(--color-primary-light)] shadow-sm'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'p-2 rounded-md transition-colors',
                viewMode === 'table'
                  ? 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] dark:bg-[var(--color-primary)]/25 dark:text-[var(--color-primary-light)] shadow-sm'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
              aria-label="Table view"
            >
              <Table className="h-4 w-4" />
            </button>
          </div>

          <Button variant="outline" onClick={exportToCSV} disabled={filteredShifts.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Shift
            <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.5 text-xs bg-[var(--color-primary-dark)] text-white rounded">
              N
            </kbd>
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Workplace
              </label>
              <select
                value={filters.workplace}
                onChange={(e) => setFilters({ ...filters, workplace: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="">All workplaces</option>
                {uniqueWorkplaces.map((workplace) => (
                  <option key={workplace} value={workplace}>
                    {workplace}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      {!isLoading && shifts.length === 0 ? (
        <EmptyState
          title="No shifts yet"
          description="Start tracking your work shifts and earnings. Add your first shift to get started!"
          actionLabel="Add your first shift"
          onAction={() => setShowAddModal(true)}
        />
      ) : filteredShifts.length === 0 && hasActiveFilters ? (
        <EmptyState
          title="No matching shifts"
          description="No shifts match your current filters. Try adjusting your search criteria."
          actionLabel="Clear filters"
          onAction={clearFilters}
        />
      ) : viewMode === 'table' ? (
        <ShiftTable
          shifts={filteredShifts}
          isLoading={isLoading}
          onEditShift={handleEditShift}
        />
      ) : (
        <ShiftList
          shifts={filteredShifts}
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
        className="lg:hidden fixed bottom-20 right-6 z-40 w-14 h-14 rounded-full bg-[var(--color-primary)] text-slate-900 shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        aria-label="Add shift"
      >
        <Plus className="h-6 w-6" />
      </button>
    </div>
  );
}

export default DashboardPage;
