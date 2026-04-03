-- =============================================
-- Kounting Koral - Sample Seed Data
-- Run this AFTER the schema migration
-- Replace 'YOUR_USER_ID' with an actual user UUID
-- =============================================

-- To get your user ID, run this query after signing up:
-- SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Example: Insert sample user settings
-- INSERT INTO public.user_settings (user_id, default_hourly_rate_cad, default_conversion_rate_php)
-- VALUES ('YOUR_USER_ID', 18.50, 42.75);

-- Example: Insert sample work presets
-- INSERT INTO public.work_presets (user_id, name) VALUES
--   ('YOUR_USER_ID', 'Coffee Shop'),
--   ('YOUR_USER_ID', 'Restaurant'),
--   ('YOUR_USER_ID', 'Retail Store'),
--   ('YOUR_USER_ID', 'Office');

-- Example: Insert sample work logs
-- INSERT INTO public.work_logs (
--   user_id,
--   workplace_name,
--   shift_date,
--   start_time,
--   end_time,
--   break_minutes,
--   hourly_rate_cad,
--   conversion_rate_php,
--   original_hours,
--   break_hours,
--   adjusted_hours,
--   earnings_cad,
--   earnings_php,
--   notes
-- ) VALUES
-- (
--   'YOUR_USER_ID',
--   'Coffee Shop',
--   '2026-04-01',
--   '2026-04-01 09:00:00+00',
--   '2026-04-01 17:00:00+00',
--   30,
--   18.50,
--   42.75,
--   8.00,
--   0.50,
--   7.50,
--   138.75,
--   5931.56,
--   'Regular Tuesday shift'
-- ),
-- (
--   'YOUR_USER_ID',
--   'Restaurant',
--   '2026-04-02',
--   '2026-04-02 16:00:00+00',
--   '2026-04-02 23:00:00+00',
--   0,
--   20.00,
--   42.75,
--   7.00,
--   0.00,
--   7.00,
--   140.00,
--   5985.00,
--   'Evening shift, busy night'
-- ),
-- (
--   'YOUR_USER_ID',
--   'Coffee Shop',
--   '2026-04-03',
--   '2026-04-03 06:00:00+00',
--   '2026-04-03 14:00:00+00',
--   45,
--   18.50,
--   42.75,
--   8.00,
--   0.75,
--   7.25,
--   134.13,
--   5734.06,
--   'Opening shift'
-- );

-- =============================================
-- Seed Script Template (Node.js version)
-- =============================================
-- You can also run this programmatically with the Supabase client:

/*
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for seeding
);

async function seedDatabase(userId) {
  // Insert settings
  await supabase.from('user_settings').insert({
    user_id: userId,
    default_hourly_rate_cad: 18.50,
    default_conversion_rate_php: 42.75,
  });

  // Insert presets
  await supabase.from('work_presets').insert([
    { user_id: userId, name: 'Coffee Shop' },
    { user_id: userId, name: 'Restaurant' },
    { user_id: userId, name: 'Retail Store' },
  ]);

  // Insert sample shifts
  const shifts = [
    {
      user_id: userId,
      workplace_name: 'Coffee Shop',
      shift_date: '2026-04-01',
      start_time: '2026-04-01T09:00:00Z',
      end_time: '2026-04-01T17:00:00Z',
      break_minutes: 30,
      hourly_rate_cad: 18.50,
      conversion_rate_php: 42.75,
      original_hours: 8.00,
      break_hours: 0.50,
      adjusted_hours: 7.50,
      earnings_cad: 138.75,
      earnings_php: 5931.56,
      notes: 'Regular shift',
    },
    // Add more shifts...
  ];

  await supabase.from('work_logs').insert(shifts);
  
  console.log('Database seeded successfully!');
}

// Run with: node seed.js <user_id>
const userId = process.argv[2];
if (userId) {
  seedDatabase(userId);
} else {
  console.log('Please provide a user ID: node seed.js <user_id>');
}
*/
