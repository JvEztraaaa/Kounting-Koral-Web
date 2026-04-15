import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth';

const getShiftsKey = (userId) => ['shifts', userId || 'anonymous'];

export function useShifts() {
  const { user } = useAuth();
  const shiftsKey = getShiftsKey(user?.id);

  return useQuery({
    queryKey: shiftsKey,
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('work_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('shift_date', { ascending: false })
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useShift(id) {
  const { user } = useAuth();
  const shiftsKey = getShiftsKey(user?.id);

  return useQuery({
    queryKey: [...shiftsKey, id],
    queryFn: async () => {
      if (!user || !id) return null;

      const { data, error } = await supabase
        .from('work_logs')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateShift() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const shiftsKey = getShiftsKey(user?.id);

  return useMutation({
    mutationFn: async (shiftData) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('work_logs')
        .insert([{ ...shiftData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftsKey });
    },
  });
}

export function useUpdateShift() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const shiftsKey = getShiftsKey(user?.id);

  return useMutation({
    mutationFn: async ({ id, ...shiftData }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('work_logs')
        .update({ ...shiftData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: shiftsKey });
      queryClient.invalidateQueries({ queryKey: [...shiftsKey, data.id] });
    },
  });
}

export function useDeleteShift() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const shiftsKey = getShiftsKey(user?.id);

  return useMutation({
    mutationFn: async (id) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('work_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shiftsKey });
    },
  });
}

export default {
  useShifts,
  useShift,
  useCreateShift,
  useUpdateShift,
  useDeleteShift,
};
