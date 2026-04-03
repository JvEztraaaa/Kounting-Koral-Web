import { useShifts } from '../features/shifts';
import {
  EarningsTrendChart,
  WorkplaceBreakdownChart,
  MonthlyComparisonChart,
} from '../features/insights';
import { ErrorState } from '../components/common';

function StatsPage() {
  const { data: shifts = [], error, refetch } = useShifts();

  if (error) {
    return (
      <ErrorState
        title="Failed to load stats"
        description={error.message}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
          Stats
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
          Trends, workplace breakdown, and monthly performance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <EarningsTrendChart shifts={shifts} days={30} />
        <WorkplaceBreakdownChart shifts={shifts} />
      </div>

      <MonthlyComparisonChart shifts={shifts} />
    </div>
  );
}

export default StatsPage;