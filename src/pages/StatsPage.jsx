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
      <div className="page-shell px-5 py-5 sm:px-6 sm:py-6">
        <h1 className="page-header-title text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">
          Stats
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1.5">
          Trends, workplace breakdown, and monthly performance
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5">
        <EarningsTrendChart shifts={shifts} days={30} />
        <WorkplaceBreakdownChart shifts={shifts} />
      </div>

      <MonthlyComparisonChart shifts={shifts} />
    </div>
  );
}

export default StatsPage;