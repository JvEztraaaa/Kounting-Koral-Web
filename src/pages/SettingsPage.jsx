import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X, Trash2, DollarSign, RefreshCw, Briefcase, Palette, Moon, Sun, LogOut } from 'lucide-react';
import { settingsSchema } from '../lib/validation.js';
import { useTheme, themeColors } from '../features/auth/ThemeContext';
import { useAuth } from '../features/auth';
import {
  useSettings,
  useUpdateSettings,
  useWorkPresets,
  useAddPreset,
  useRemovePreset,
  useClearAllData,
} from '../features/settings';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  ConfirmDialog,
} from '../components/ui';
import { Skeleton } from '../components/common';

function SettingsPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data: settings, isLoading: settingsLoading } = useSettings();
  const { data: presets = [], isLoading: presetsLoading } = useWorkPresets();
  const { darkMode, setDarkModeEnabled, themeColor, changeThemeColor } = useTheme();
  const updateSettings = useUpdateSettings();
  const addPreset = useAddPreset();
  const removePreset = useRemovePreset();
  const clearAllData = useClearAllData();

  const [newPresetName, setNewPresetName] = useState('');
  const [presetError, setPresetError] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      defaultHourlyRateCAD: settings?.default_hourly_rate_cad || 15,
      defaultConversionRatePHP: settings?.default_conversion_rate_php || 43,
    },
    values: settings
      ? {
          defaultHourlyRateCAD: settings.default_hourly_rate_cad,
          defaultConversionRatePHP: settings.default_conversion_rate_php,
        }
      : undefined,
  });

  const onSubmitSettings = async (data) => {
    try {
      await updateSettings.mutateAsync({
        default_hourly_rate_cad: data.defaultHourlyRateCAD,
        default_conversion_rate_php: data.defaultConversionRatePHP,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleAddPreset = async (e) => {
    e.preventDefault();
    const name = newPresetName.trim();
    if (!name) {
      setPresetError('Preset name is required');
      return;
    }

    try {
      setPresetError('');
      await addPreset.mutateAsync(name);
      setNewPresetName('');
    } catch (error) {
      setPresetError(error.message || 'Failed to add preset');
    }
  };

  const handleRemovePreset = async (id) => {
    try {
      await removePreset.mutateAsync(id);
    } catch (error) {
      console.error('Failed to remove preset:', error);
    }
  };

  const handleClearAllData = async () => {
    try {
      await clearAllData.mutateAsync();
    } catch (error) {
      console.error('Failed to clear data:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  if (settingsLoading || presetsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6 max-w-3xl">
      {/* Header */}
      <div className="page-shell px-5 py-5 sm:px-6 sm:py-6">
        <h1 className="page-header-title text-3xl font-bold text-slate-900 dark:text-slate-100">
          Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1.5">
          Set your defaults and quick work presets
        </p>
        <div className="mt-4">
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Default Rates */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-[var(--color-primary)]" />
            <CardTitle>Appearance</CardTitle>
          </div>
          <CardDescription>
            Pick your mode and choose a pastel accent palette.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mode</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDarkModeEnabled(false)}
                className={`px-4 py-3 rounded-xl border-2 transition-colors flex items-center justify-center gap-2 ${
                  !darkMode
                    ? 'border-[var(--color-primary)] bg-white dark:bg-gray-900 text-[var(--color-primary-dark)]'
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Sun className="h-4 w-4" />
                Light
              </button>
              <button
                type="button"
                onClick={() => setDarkModeEnabled(true)}
                className={`px-4 py-3 rounded-xl border-2 transition-colors flex items-center justify-center gap-2 ${
                  darkMode
                    ? 'border-[var(--color-primary)] bg-white dark:bg-gray-900 text-[var(--color-primary-dark)]'
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Moon className="h-4 w-4" />
                Dark
              </button>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme Color</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {Object.entries(themeColors).map(([colorKey, color]) => {
                const isSelected = themeColor === colorKey;
                return (
                  <button
                    key={colorKey}
                    type="button"
                    onClick={() => changeThemeColor(colorKey)}
                    className={`p-3 rounded-xl border-2 text-left transition-colors ${
                      isSelected
                        ? 'border-[var(--color-primary)] bg-white dark:bg-gray-900 shadow-sm'
                        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{color.name}</span>
                      {isSelected && <span className="text-xs text-[var(--color-primary-dark)]">Selected</span>}
                    </div>
                    <div className="h-3 rounded-full" style={{ backgroundColor: color.primary }} />
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Default Rates */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[var(--color-primary)]" />
            <CardTitle>Default Hourly Rate (CAD)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmitSettings)} className="space-y-4">
            <Input
              type="number"
              min="0"
              step="0.01"
              error={errors.defaultHourlyRateCAD?.message}
              {...register('defaultHourlyRateCAD')}
            />
          </form>
        </CardContent>
      </Card>

      {/* Conversion Rate */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-[var(--color-primary)]" />
            <CardTitle>CAD to PHP Conversion</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Input
            type="number"
            min="0"
            step="0.01"
            error={errors.defaultConversionRatePHP?.message}
            {...register('defaultConversionRatePHP')}
          />
        </CardContent>
      </Card>

      {/* Work Presets */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-[var(--color-primary)]" />
            <CardTitle>Work Presets</CardTitle>
          </div>
          <CardDescription>
            Presets are saved immediately and will show in the New Shift modal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Preset */}
          <form onSubmit={handleAddPreset} className="flex gap-2">
            <input
              type="text"
              value={newPresetName}
              onChange={(e) => setNewPresetName(e.target.value)}
              placeholder="e.g. Coral Cafe"
              className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
            />
            <button
              type="submit"
              className="w-12 h-12 rounded-xl bg-[var(--color-primary)] text-slate-900 flex items-center justify-center shadow-sm hover:bg-[var(--color-primary-dark)] transition-all"
            >
              <Plus className="h-6 w-6" />
            </button>
          </form>

          {presetError && (
            <p className="text-sm text-red-500 dark:text-red-400">{presetError}</p>
          )}

          {/* Current Presets */}
          {presets.length > 0 && (
            <div className="space-y-2">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center justify-between px-4 py-3 bg-[var(--color-primary-light)] dark:bg-[var(--color-primary)]/15 rounded-xl"
                >
                  <span className="text-gray-900 dark:text-gray-100">{preset.name}</span>
                  <button
                    onClick={() => handleRemovePreset(preset.id)}
                    className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                    aria-label={`Remove ${preset.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <button
        onClick={handleSubmit(onSubmitSettings)}
        disabled={isSubmitting || !isDirty}
        className="w-full py-4 rounded-xl bg-[var(--color-primary)] text-slate-900 font-semibold text-lg shadow-sm hover:bg-[var(--color-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isSubmitting ? 'Saving...' : 'Save All Settings'}
      </button>

      {saveSuccess && (
        <div className="text-center text-sm text-green-600 dark:text-green-400">
          ✓ Settings saved successfully
        </div>
      )}

      {/* Danger Zone */}
      <Card className="border-2 border-red-200 dark:border-red-900 bg-red-50/30 dark:bg-red-900/10">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full py-3 px-4 rounded-xl border-2 border-red-300 dark:border-red-800 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 font-medium flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="h-5 w-5" />
            Clear All Data
          </button>
        </CardContent>
      </Card>

      {/* Clear Data Confirmation */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearAllData}
        title="Clear All Data"
        description="This will permanently delete all your shifts, work presets, and reset your settings to defaults. This action cannot be undone."
        confirmText="Clear All Data"
        loading={clearAllData.isPending}
      />
    </div>
  );
}

export default SettingsPage;
