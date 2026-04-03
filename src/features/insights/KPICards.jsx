import { formatCurrency } from '../../lib/calculations';
import { KPICardSkeleton } from '../../components/common';

function KPICard({ type, value, label, isLoading }) {
  if (isLoading) {
    return <KPICardSkeleton />;
  }

  const formatValue = () => {
    switch (type) {
      case 'shifts':
        return value;
      case 'cad':
        return formatCurrency(value, 'CAD');
      default:
        return value;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-4 py-3.5 shadow-sm">
      <div className="h-1.5 w-10 rounded-full bg-[var(--color-primary-light)] mb-2" />
      <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </p>
      <p className="text-2xl sm:text-[1.75rem] leading-tight font-bold text-gray-900 dark:text-gray-100">
        {formatValue()}
      </p>
    </div>
  );
}

function KPIGrid({ totals, isLoading }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <KPICard
        type="shifts"
        value={totals?.shiftCount || 0}
        label="Shifts"
        isLoading={isLoading}
      />
      <KPICard
        type="cad"
        value={totals?.totalCAD || 0}
        label="Total CAD"
        isLoading={isLoading}
      />
    </div>
  );
}

export { KPICard, KPIGrid };
export default KPIGrid;
