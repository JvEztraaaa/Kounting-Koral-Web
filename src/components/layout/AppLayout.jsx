import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Activity,
  Settings,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '../../features/auth';
import { useTheme } from '../../features/auth/ThemeContext';
import { cn } from '../../lib/utils';

const navigation = [
  { name: 'Home', href: '/', icon: LayoutDashboard },
  { name: 'Insights', href: '/insights', icon: BarChart3 },
  { name: 'Stats', href: '/stats', icon: Activity },
  { name: 'Settings', href: '/settings', icon: Settings },
];

function AppLayout() {
  const { user, signOut } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] dark:bg-slate-900">
      {/* Sidebar - Desktop only */}
      <aside
        className="fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200/80 dark:border-slate-700/70 hidden lg:flex backdrop-blur-xl bg-white/95 dark:bg-slate-900/95"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-slate-200/80 dark:border-slate-700/70">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] flex items-center justify-center text-lg shadow-sm">
                🐚
              </div>
              <div>
                <p className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                  Kounting Koral
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Calm shift tracking
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all',
                    isActive
                      ? 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] dark:bg-[var(--color-primary)]/20 dark:text-[var(--color-primary-light)] shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Bottom section */}
          <div className="p-4 border-t border-slate-200/80 dark:border-slate-700/70">
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? (
                <>
                  <Sun className="h-5 w-5" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon className="h-5 w-5" />
                  Dark Mode
                </>
              )}
            </button>

            {/* User info and sign out */}
            <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-700/70">
              <div className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400 truncate">
                {user?.email}
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Bottom Navigation - Mobile only */}
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200/80 dark:border-slate-700/70 backdrop-blur-xl lg:hidden">
          <div className="grid grid-cols-4 h-16">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                    isActive
                      ? 'text-[var(--color-primary)]'
                      : 'text-slate-500 dark:text-slate-400'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon 
                      className={cn(
                        'h-6 w-6', 
                        isActive ? 'text-[var(--color-primary)]' : 'text-slate-500 dark:text-slate-400'
                      )} 
                    />
                    <span className="text-xs">{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

export default AppLayout;
