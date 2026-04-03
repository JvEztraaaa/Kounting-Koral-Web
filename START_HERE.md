# 🚀 Ready to Launch!

## Your Kounting Koral web app is complete and ready to use!

### Quick Start (3 steps):

#### 1️⃣ Set up Supabase

**Option A: Use existing Supabase project**
- Get your credentials from: https://supabase.com/dashboard
- Go to your project → Settings → API
- Copy the URL and anon key

**Option B: Create new Supabase project**
- Go to https://supabase.com
- Click "New project"
- Choose a name, database password, and region
- Wait for the project to finish setting up (~2 minutes)
- Go to Settings → API and copy your credentials

#### 2️⃣ Create `.env` file

Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

Edit `.env` and add your credentials:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 3️⃣ Set up the database

1. Open Supabase dashboard → SQL Editor
2. Create a new query
3. Copy everything from `supabase/001_schema.sql`
4. Paste and click **RUN**
5. You should see "Success. No rows returned"

### 🎉 Start the App

**Windows users:**
```bash
start-dev.bat
```

**Or manually:**
```bash
npm run dev
```

The app will open at: **http://localhost:5173**

---

## 📱 First Time Setup

1. Click **Sign Up** and create your account
2. Go to **Settings** and set your default hourly rate
3. Add common workplace names as presets
4. Click **Add Shift** (or press `N`) to log your first shift!

---

## 🎯 Features Overview

### Keyboard Shortcuts
- **N** - New shift (works anywhere)
- **/** - Focus search bar
- **Esc** - Close modals/dialogs

### Views
- **List** - Full details with breakdown
- **Grid** - Compact cards view
- **Table** - Dense spreadsheet-style

### Filters
- Date range picker
- Workplace dropdown
- Min/max pay range
- Full-text search

### Export
- Click "Export CSV" to download your shifts
- Great for tax time or expense reporting!

---

## 🐛 Troubleshooting

### "Cannot connect to Supabase"
- Check your `.env` file exists and has correct values
- Restart the dev server after changing `.env`
- Verify your Supabase project is active

### "Database error" / "relation does not exist"
- Run the SQL migration (`supabase/001_schema.sql`)
- Make sure you ran it in the correct Supabase project

### Page is blank or shows errors
- Open browser DevTools (F12) and check Console
- Make sure all dependencies installed: `npm install`
- Try clearing cache: Delete `node_modules/.vite` folder

### Calculation seems wrong
- Break time cannot exceed shift duration
- Overnight shifts are supported (end < start)
- All values rounded to 2 decimals

---

## 🚀 Deploy to Production (Vercel)

1. Push your code to GitHub (create `.gitignore` first!)
2. Go to https://vercel.com
3. Click "Import Project"
4. Select your repository
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Deploy!

Your app will be live at: `https://your-project.vercel.app`

---

## 📚 Documentation

- **QUICKSTART.md** - Detailed setup guide
- **README.md** - Full technical documentation  
- **IMPLEMENTATION_SUMMARY.md** - What was built
- **supabase/001_schema.sql** - Database schema
- **supabase/002_seed.sql** - Sample data (optional)

---

## 💡 Tips

- **Dark mode** - Toggle in the sidebar
- **Monthly view** - Expand/collapse months in shift list
- **Insights** - Check the Insights tab for trends
- **Presets** - Save time by adding workplace presets
- **Notes** - Add notes to track special circumstances

---

## ✅ What's Next?

Your app is production-ready! Optional improvements:

- Add sample data with `002_seed.sql`
- Customize colors in `tailwind.config.js`
- Add more chart types
- Set up automated tests
- Enable email verification in Supabase

---

**Need help?** Check the full README.md for technical details.

**Enjoy tracking your shifts!** 🐚💰
