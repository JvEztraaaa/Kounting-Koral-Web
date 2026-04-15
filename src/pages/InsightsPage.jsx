import { useState } from 'react';
import { useShifts } from '../features/shifts';
import {
  WeeklySummary,
  MonthlySummary,
  YearlySummary,
} from '../features/insights';
import { ErrorState } from '../components/common';

function InsightsPage() {
  const { data: shifts = [], isLoading, error, refetch } = useShifts();
  const [expandedCard, setExpandedCard] = useState(null);

  const toggleCard = (key) => {
    setExpandedCard((prev) => (prev === key ? null : key));
  };

  if (error) {
    return (
      <ErrorState
        title="Failed to load insights"
        description={error.message}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="page-shell px-5 py-5 sm:px-6 sm:py-6">
        <h1 className="page-header-title text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
          Insights
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1.5">
          Tap a card to see its included shifts
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 items-start">
        <WeeklySummary
          shifts={shifts}
          isLoading={isLoading}
          isExpanded={expandedCard === 'week'}
          onToggle={() => toggleCard('week')}
        />
        <MonthlySummary
          shifts={shifts}
          isLoading={isLoading}
          isExpanded={expandedCard === 'month'}
          onToggle={() => toggleCard('month')}
        />
        <YearlySummary
          shifts={shifts}
          isLoading={isLoading}
          isExpanded={expandedCard === 'year'}
          onToggle={() => toggleCard('year')}
        />
      </div>

    </div>
  );
}

export default InsightsPage;
