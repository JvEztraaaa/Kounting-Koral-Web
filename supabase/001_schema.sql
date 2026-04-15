-- =============================================
-- Kounting Koral Database Schema
-- Run this migration in your Supabase SQL editor
-- =============================================

-- User Settings Table
-- Stores default rates and preferences for each user
CREATE TABLE IF NOT EXISTS public.user_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  app_title text NOT NULL DEFAULT 'Kounting Koral',
  default_hourly_rate_cad numeric(10,2) NOT NULL DEFAULT 15,
  default_conversion_rate_php numeric(10,2) NOT NULL DEFAULT 43,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Work Presets Table
-- Stores frequently used workplace names for quick selection
CREATE TABLE IF NOT EXISTS public.work_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  -- Prevent duplicate preset names per user (case-insensitive)
  CONSTRAINT work_presets_user_name_unique UNIQUE (user_id, name)
);

-- Work Logs Table (Shifts)
-- Main table storing all shift/work log entries
CREATE TABLE IF NOT EXISTS public.work_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workplace_name text NOT NULL,
  shift_date date NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  break_minutes numeric(6,2) NOT NULL DEFAULT 0,
  hourly_rate_cad numeric(10,2) NOT NULL,
  conversion_rate_php numeric(10,2) NOT NULL,
  -- Computed/derived values (stored for query efficiency)
  original_hours numeric(8,2) NOT NULL,
  break_hours numeric(8,2) NOT NULL,
  adjusted_hours numeric(8,2) NOT NULL,
  earnings_cad numeric(10,2) NOT NULL,
  earnings_php numeric(12,2) NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User Notes Table
-- Stores text notes, checklist notes, and image notes
CREATE TABLE IF NOT EXISTS public.user_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_type text NOT NULL CHECK (note_type IN ('text', 'list', 'image')),
  title text NOT NULL,
  body text,
  checklist_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_data text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_work_logs_user_date 
  ON public.work_logs(user_id, shift_date DESC);

CREATE INDEX IF NOT EXISTS idx_work_logs_user_workplace 
  ON public.work_logs(user_id, workplace_name);

CREATE INDEX IF NOT EXISTS idx_work_presets_user 
  ON public.work_presets(user_id);

CREATE INDEX IF NOT EXISTS idx_user_notes_user_updated
  ON public.user_notes(user_id, updated_at DESC);

-- =============================================
-- Row Level Security (RLS) Policies
-- Ensures users can only access their own data
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

-- User Settings Policies
CREATE POLICY "Users can view own settings" 
  ON public.user_settings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" 
  ON public.user_settings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" 
  ON public.user_settings FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings" 
  ON public.user_settings FOR DELETE 
  USING (auth.uid() = user_id);

-- Work Presets Policies
CREATE POLICY "Users can view own presets" 
  ON public.work_presets FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own presets" 
  ON public.work_presets FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presets" 
  ON public.work_presets FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own presets" 
  ON public.work_presets FOR DELETE 
  USING (auth.uid() = user_id);

-- Work Logs Policies
CREATE POLICY "Users can view own work logs" 
  ON public.work_logs FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own work logs" 
  ON public.work_logs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own work logs" 
  ON public.work_logs FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own work logs" 
  ON public.work_logs FOR DELETE 
  USING (auth.uid() = user_id);

-- User Notes Policies
CREATE POLICY "Users can view own notes"
  ON public.user_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON public.user_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON public.user_notes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON public.user_notes FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- Helper Functions (Optional)
-- =============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
DROP TRIGGER IF EXISTS set_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER set_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_work_logs_updated_at ON public.work_logs;
CREATE TRIGGER set_work_logs_updated_at
  BEFORE UPDATE ON public.work_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_user_notes_updated_at ON public.user_notes;
CREATE TRIGGER set_user_notes_updated_at
  BEFORE UPDATE ON public.user_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================
-- Grant Permissions
-- =============================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant table permissions to authenticated users
GRANT ALL ON public.user_settings TO authenticated;
GRANT ALL ON public.work_presets TO authenticated;
GRANT ALL ON public.work_logs TO authenticated;
GRANT ALL ON public.user_notes TO authenticated;

-- Grant sequence permissions (for auto-generated IDs)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
