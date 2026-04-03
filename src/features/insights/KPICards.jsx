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
    <div className="page-shell px-4 py-4 sm:px-5 sm:py-5">
      <div className="h-1.5 w-12 rounded-full bg-[var(--color-primary)]/60 mb-2.5" />
      <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-2xl sm:text-[1.9rem] leading-tight font-extrabold text-slate-900 dark:text-slate-100">
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
