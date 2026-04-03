import { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, subDays, parseISO, eachDayOfInterval } from 'date-fns';
import { formatCurrency } from '../../lib/calculations';
import { useTheme } from '../auth/ThemeContext';

const BASE_COLORS = ['#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#f97316'];

function EarningsTrendChart({ shifts, days = 30 }) {
  const { darkMode, themeColors } = useTheme();

  const chartTheme = {
    axis: darkMode ? '#9CA3AF' : '#6B7280',
    grid: darkMode ? '#374151' : '#E5E7EB',
    tooltipBg: darkMode ? '#111827' : '#FFFFFF',
    tooltipBorder: darkMode ? '#374151' : '#E5E7EB',
    tooltipText: darkMode ? '#E5E7EB' : '#374151',
    line: themeColors.primaryDark,
    activeDot: themeColors.primary,
  };

  const data = useMemo(() => {
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

    return dateRange.map((date) => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayShifts = (shifts || []).filter((s) => {
        const shiftDate = typeof s.shift_date === 'string' ? s.shift_date : format(s.shift_date, 'yyyy-MM-dd');
        return shiftDate === dateStr;
      });

      const totalCAD = dayShifts.reduce((sum, s) => sum + (s.earnings_cad || 0), 0);

      return {
        date: format(date, 'MMM d'),
        earnings: totalCAD,
      };
    });
  }, [shifts, days]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Earnings Trend (Last {days} Days)
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: chartTheme.axis }}
              tickLine={false}
              axisLine={{ stroke: chartTheme.grid }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: chartTheme.axis }}
              tickLine={false}
              tickFormatter={(value) => `$${value}`}
              axisLine={{ stroke: chartTheme.grid }}
            />
            <Tooltip
              formatter={(value) => [formatCurrency(value, 'CAD'), 'Earnings']}
              labelStyle={{ color: chartTheme.tooltipText }}
              contentStyle={{
                backgroundColor: chartTheme.tooltipBg,
                border: `1px solid ${chartTheme.tooltipBorder}`,
                borderRadius: '8px',
                color: chartTheme.tooltipText,
              }}
            />
            <Line
              type="monotone"
              dataKey="earnings"
              stroke={chartTheme.line}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: chartTheme.activeDot }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function WorkplaceBreakdownChart({ shifts }) {
  const { darkMode, themeColors } = useTheme();

  const pieColors = [themeColors.primary, themeColors.primaryDark, ...BASE_COLORS];
  const tooltipStyles = {
    backgroundColor: darkMode ? '#111827' : '#FFFFFF',
    border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
    borderRadius: '8px',
    color: darkMode ? '#E5E7EB' : '#374151',
  };

  const data = useMemo(() => {
    const byWorkplace = (shifts || []).reduce((acc, shift) => {
      const name = shift.workplace_name;
      if (!acc[name]) {
        acc[name] = { name, earnings: 0, hours: 0, shifts: 0 };
      }
      acc[name].earnings += shift.earnings_cad || 0;
      acc[name].hours += shift.adjusted_hours || 0;
      acc[name].shifts += 1;
      return acc;
    }, {});

    return Object.values(byWorkplace).sort((a, b) => b.earnings - a.earnings);
  }, [shifts]);

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Earnings by Workplace
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Earnings by Workplace
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="earnings"
              nameKey="name"
              label={({ name, percent }) =>
                percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
              }
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [formatCurrency(value, 'CAD'), 'Earnings']}
              contentStyle={tooltipStyles}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.slice(0, 6).map((item, index) => (
          <div key={item.name} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: pieColors[index % pieColors.length] }}
            />
            <span className="text-gray-600 dark:text-gray-300 truncate">
              {item.name}
            </span>
            <span className="text-gray-900 dark:text-gray-100 font-medium ml-auto">
              {formatCurrency(item.earnings, 'CAD')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthlyComparisonChart({ shifts }) {
  const { darkMode, themeColors } = useTheme();

  const chartTheme = {
    axis: darkMode ? '#9CA3AF' : '#6B7280',
    grid: darkMode ? '#374151' : '#E5E7EB',
    tooltipBg: darkMode ? '#111827' : '#FFFFFF',
    tooltipBorder: darkMode ? '#374151' : '#E5E7EB',
    tooltipText: darkMode ? '#E5E7EB' : '#374151',
    bar: themeColors.primary,
  };

  const data = useMemo(() => {
    const byMonth = (shifts || []).reduce((acc, shift) => {
      const date = typeof shift.shift_date === 'string'
        ? parseISO(shift.shift_date)
        : shift.shift_date;
      const monthKey = format(date, 'yyyy-MM');
      const monthLabel = format(date, 'MMM yyyy');

      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthLabel, earnings: 0, hours: 0 };
      }
      acc[monthKey].earnings += shift.earnings_cad || 0;
      acc[monthKey].hours += shift.adjusted_hours || 0;
      return acc;
    }, {});

    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([, data]) => data);
  }, [shifts]);

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Monthly Comparison
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Monthly Comparison
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: chartTheme.axis }}
              tickLine={false}
              axisLine={{ stroke: chartTheme.grid }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: chartTheme.axis }}
              tickLine={false}
              tickFormatter={(value) => `$${value}`}
              axisLine={{ stroke: chartTheme.grid }}
            />
            <Tooltip
              formatter={(value, name) => [
                name === 'earnings' ? formatCurrency(value, 'CAD') : `${value.toFixed(1)} hrs`,
                name === 'earnings' ? 'Earnings' : 'Hours',
              ]}
              contentStyle={{
                backgroundColor: chartTheme.tooltipBg,
                border: `1px solid ${chartTheme.tooltipBorder}`,
                borderRadius: '8px',
                color: chartTheme.tooltipText,
              }}
            />
            <Legend />
            <Bar dataKey="earnings" name="Earnings (CAD)" fill={chartTheme.bar} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export { EarningsTrendChart, WorkplaceBreakdownChart, MonthlyComparisonChart };
