-- =============================================
-- Kounting Koral - Notes + App Title Migration
-- Run this for existing databases already using 001_schema.sql
-- =============================================

-- Add app title setting for each user
ALTER TABLE public.user_settings
ADD COLUMN IF NOT EXISTS app_title text NOT NULL DEFAULT 'Kounting Koral';

-- Notes table for text/list/image notes
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

CREATE INDEX IF NOT EXISTS idx_user_notes_user_updated
  ON public.user_notes(user_id, updated_at DESC);

ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_notes'
      AND policyname = 'Users can view own notes'
  ) THEN
    CREATE POLICY "Users can view own notes"
      ON public.user_notes FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_notes'
      AND policyname = 'Users can insert own notes'
  ) THEN
    CREATE POLICY "Users can insert own notes"
      ON public.user_notes FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_notes'
      AND policyname = 'Users can update own notes'
  ) THEN
    CREATE POLICY "Users can update own notes"
      ON public.user_notes FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_notes'
      AND policyname = 'Users can delete own notes'
  ) THEN
    CREATE POLICY "Users can delete own notes"
      ON public.user_notes FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END
$$;

DROP TRIGGER IF EXISTS set_user_notes_updated_at ON public.user_notes;
CREATE TRIGGER set_user_notes_updated_at
  BEFORE UPDATE ON public.user_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

GRANT ALL ON public.user_notes TO authenticated;
