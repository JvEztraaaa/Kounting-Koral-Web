import { useShifts } from '../features/shifts';
import {
  WeeklySummary,
  MonthlySummary,
  YearlySummary,
} from '../features/insights';
import { ErrorState } from '../components/common';

function InsightsPage() {
  const { data: shifts = [], isLoading, error, refetch } = useShifts();

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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Insights
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
          Tap a card to see its included shifts
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <WeeklySummary shifts={shifts} isLoading={isLoading} />
        <MonthlySummary shifts={shifts} isLoading={isLoading} />
        <YearlySummary shifts={shifts} isLoading={isLoading} />
      </div>

    </div>
  );
}

export default InsightsPage;
