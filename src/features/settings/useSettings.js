import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth';

const getSettingsKey = (userId) => ['settings', userId || 'anonymous'];
const getPresetsKey = (userId) => ['work-presets', userId || 'anonymous'];

export function useSettings() {
  const { user } = useAuth();
  const settingsKey = getSettingsKey(user?.id);

  return useQuery({
    queryKey: settingsKey,
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is ok for new users
        throw error;
      }

      return data;
    },
    enabled: !!user,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const settingsKey = getSettingsKey(user?.id);

  return useMutation({
    mutationFn: async (settingsData) => {
      if (!user) throw new Error('Not authenticated');

      // Check if settings exist
      const { data: existing } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Update existing settings
        const { data, error } = await supabase
          .from('user_settings')
          .update({ ...settingsData, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new settings
        const { data, error } = await supabase
          .from('user_settings')
          .insert([{ ...settingsData, user_id: user.id }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKey });
    },
  });
}

export function useWorkPresets() {
  const { user } = useAuth();
  const presetsKey = getPresetsKey(user?.id);

  return useQuery({
    queryKey: presetsKey,
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('work_presets')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useAddPreset() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const presetsKey = getPresetsKey(user?.id);

  return useMutation({
    mutationFn: async (name) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('work_presets')
        .insert([{ user_id: user.id, name: name.trim() }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation
          throw new Error('This preset already exists');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: presetsKey });
    },
  });
}

export function useRemovePreset() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const presetsKey = getPresetsKey(user?.id);

  return useMutation({
    mutationFn: async (id) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('work_presets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: presetsKey });
    },
  });
}

export function useClearAllData() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const settingsKey = getSettingsKey(user?.id);
  const presetsKey = getPresetsKey(user?.id);
  const shiftsKey = ['shifts', user?.id || 'anonymous'];
  const notesKey = ['notes', user?.id || 'anonymous'];

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      // Delete all work logs
      const { error: logsError } = await supabase
        .from('work_logs')
        .delete()
        .eq('user_id', user.id);

      if (logsError) throw logsError;

      // Delete all presets
      const { error: presetsError } = await supabase
        .from('work_presets')
        .delete()
        .eq('user_id', user.id);

      if (presetsError) throw presetsError;

      // Delete all notes
      const { error: notesError } = await supabase
        .from('user_notes')
        .delete()
        .eq('user_id', user.id);

      if (notesError && notesError.code !== '42P01') throw notesError;

      // Reset settings to defaults
      const { error: settingsError } = await supabase
        .from('user_settings')
        .update({
          app_title: 'Kounting Koral',
          default_hourly_rate_cad: 15,
          default_conversion_rate_php: 43,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (settingsError) throw settingsError;

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKey });
      queryClient.invalidateQueries({ queryKey: presetsKey });
      queryClient.invalidateQueries({ queryKey: shiftsKey });
      queryClient.invalidateQueries({ queryKey: notesKey });
    },
  });
}

export default {
  useSettings,
  useUpdateSettings,
  useWorkPresets,
  useAddPreset,
  useRemovePreset,
  useClearAllData,
};
