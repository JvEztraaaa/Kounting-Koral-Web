import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../auth';

const getNotesKey = (userId) => ['notes', userId || 'anonymous'];

export function useNotes() {
  const { user } = useAuth();
  const notesKey = getNotesKey(user?.id);

  return useQuery({
    queryKey: notesKey,
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const notesKey = getNotesKey(user?.id);

  return useMutation({
    mutationFn: async (noteData) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_notes')
        .insert([{ ...noteData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesKey });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const notesKey = getNotesKey(user?.id);

  return useMutation({
    mutationFn: async ({ id, ...noteData }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_notes')
        .update({ ...noteData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesKey });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const notesKey = getNotesKey(user?.id);

  return useMutation({
    mutationFn: async (id) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notesKey });
    },
  });
}

export default {
  useNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
};
