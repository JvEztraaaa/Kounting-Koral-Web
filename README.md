# Kounting Koral Web

A production-ready web application for tracking work shifts and calculating earnings in CAD and PHP.

## 🐚 Features

- **Authentication**: Email/password sign up, login, and password reset
- **Shift Management**: Full CRUD for work shifts with date, time, break, and rate tracking
- **Earnings Calculation**: Automatic calculation of hours and earnings in CAD and PHP
- **Insights Dashboard**: Weekly/monthly summaries with charts and analytics
- **Multiple Views**: List, grid, and table views for shift data
- **Filters & Search**: Filter by date range, workplace, and pay amount
- **CSV Export**: Export shift data for external analysis
- **Dark Mode**: Full dark mode support
- **Keyboard Shortcuts**: Press `N` to add new shift, `/` to search

## 🛠 Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth + PostgreSQL)
- **State Management**: TanStack React Query
- **Forms**: React Hook Form + Zod validation
- **Date Handling**: date-fns
- **Charts**: Recharts
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd kounting-koral-web
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration:
   - Copy contents of `supabase/001_schema.sql`
   - Paste and run in SQL Editor
3. Get your project credentials:
   - Go to Project Settings > API
   - Copy the Project URL and anon/public key

### 3. Configure Environment

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/          # Reusable UI components (Button, Card, Modal, etc.)
│   ├── layout/      # Layout components (AppLayout)
│   └── common/      # Shared components (EmptyState, Skeleton, etc.)
├── features/
│   ├── auth/        # Authentication context and hooks
│   ├── shifts/      # Shift CRUD, cards, list, table components
│   ├── insights/    # KPI cards, summary cards, charts
│   └── settings/    # Settings and presets hooks
├── lib/
│   ├── supabase.js  # Supabase client
│   ├── calculations.js # Earnings calculation utilities
│   ├── validation.js # Zod schemas
│   └── utils.js     # Date formatting, helpers
├── pages/           # Route pages
└── App.jsx          # Main app with routing
```

## 🗃 Database Schema

### Tables

- **user_settings**: Default rates and preferences per user
- **work_presets**: Saved workplace names for quick selection
- **work_logs**: All shift entries with computed earnings

### Row Level Security

All tables have RLS enabled. Users can only access their own data.

## 🔑 Key Features Explained

### Shift Calculation Logic

```javascript
// Original hours from time range (handles overnight shifts)
originalHours = (endTime - startTime) / (1000 * 60 * 60)
if (originalHours < 0) originalHours += 24

// Break deduction
breakHours = breakMinutes / 60
adjustedHours = max(0, originalHours - breakHours)

// Earnings
earningsCAD = adjustedHours * hourlyRateCAD
earningsPHP = earningsCAD * conversionRatePHP
```

### Validation Rules

- Workplace name is required
- Hourly rate must be > 0
- Conversion rate must be > 0
- Break minutes >= 0
- Adjusted hours must be > 0 (break can't exceed shift duration)

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy!

### Manual Build

```bash
npm run build
# Output is in dist/ folder
```

## 🧪 Testing

```bash
# Run linter
npm run lint

# Run tests (when added)
npm test
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

Built with ❤️ using React and Supabase
