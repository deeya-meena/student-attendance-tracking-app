# Student Attendance Tracking App

A full-stack web application for tracking student attendance, built with Next.js, Drizzle ORM, and Neon PostgreSQL, with authentication provided by Kinde.

## Features

- 🔐 **Authentication** — Secure login via Kinde (supports Google OAuth, email/password, etc.)
- 📊 **Dashboard** — At-a-glance statistics: total students, present/absent counts, attendance rate, grade breakdown, and a 7-day attendance trend
- 👩‍🎓 **Student Management** — Add, edit, search, filter, and delete students with grade and contact info
- ✅ **Attendance Marking** — Select date + grade, toggle each student present/absent, bulk mark all, and save
- 📱 **Responsive Design** — Works on desktop and mobile

## Tech Stack

| Layer        | Technology                          |
|-------------|--------------------------------------|
| Framework    | Next.js 16 (App Router)             |
| Styling      | Tailwind CSS v4                     |
| UI Components| shadcn/ui (base-nova style)         |
| Auth         | Kinde (`@kinde-oss/kinde-auth-nextjs`) |
| ORM          | Drizzle ORM                         |
| Database     | Neon PostgreSQL                     |

## Prerequisites

- Node.js 18+
- A [Kinde](https://kinde.com) account (free tier works)
- A [Neon](https://neon.tech) PostgreSQL database (free tier works)

## Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Kinde Auth
KINDE_CLIENT_ID=your_kinde_client_id
KINDE_CLIENT_SECRET=your_kinde_client_secret
KINDE_ISSUER_URL=https://your-app.kinde.com
KINDE_SITE_URL=http://localhost:3000
KINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:3000
KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:3000/dashboard

# Neon PostgreSQL
DATABASE_URL=postgresql://...          # pooled connection string
DATABASE_URL_UNPOOLED=postgresql://... # direct connection string (used by Drizzle Kit)
```

### Getting Kinde credentials
1. Sign up at [kinde.com](https://kinde.com) and create an application
2. Set the **Allowed callback URLs** to: `http://localhost:3000/api/auth/kinde_callback`
3. Set the **Allowed logout redirect URLs** to: `http://localhost:3000`
4. Copy Client ID, Client Secret, and Issuer URL from the application settings

### Getting Neon DATABASE_URL
1. Sign up at [neon.tech](https://neon.tech) and create a project
2. Go to your project dashboard → **Connection Details**
3. Copy the **Pooled connection string** as `DATABASE_URL`
4. Copy the **Direct connection string** as `DATABASE_URL_UNPOOLED`

## Setup & Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables (see above)
cp .env.local.example .env.local
# Edit .env.local with your credentials

# 3. Push the database schema to Neon
npm run db:push

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You'll be redirected to Kinde login automatically.

## Database Schema

```
grades       — grade labels (5th, 6th, 7th, etc.)
students     — student records (name, grade, contact, address)
attendance   — attendance records (student_id, date, present, grade)
```

### Resetting / Re-pushing the schema

```bash
# Push schema changes (non-destructive — adds new tables/columns)
npm run db:push

# Open Drizzle Studio to inspect data
npm run db:studio
```

> ⚠️ **Never run `DROP TABLE` or reset production data** — `db:push` is safe and non-destructive.

## Project Structure

```
app/
  page.js                    # Redirects to /dashboard
  layout.js                  # Root layout with ThemeProvider
  globals.css                # Tailwind + design tokens
  ThemeProvider.js           # next-themes wrapper
  api/
    auth/[kindeAuth]/        # Kinde auth handler
    students/                # GET (list), POST (create)
    students/[id]/           # PUT (update), DELETE (delete)
    attendance/              # GET (filter by date/grade), POST (upsert)
    dashboard/               # GET (statistics)
  dashboard/
    layout.js                # Sidebar + Header layout
    page.js                  # Dashboard statistics page
    students/page.js         # Student management page
    attendance/page.js       # Attendance marking page
    _components/
      SideNav.jsx            # Navigation sidebar
      Header.jsx             # Top header bar
components/
  ui/
    button.jsx               # Button component (base-ui/react)
    dialog.jsx               # Dialog/modal component
    input.jsx                # Input component
lib/
  utils.js                   # cn() utility (clsx + tailwind-merge)
utils/
  schema.js                  # Drizzle ORM schema
  postgres.js                # Drizzle DB client
middleware.js                # Kinde auth protection for /dashboard
drizzle.config.js            # Drizzle Kit configuration
```

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at http://localhost:3000 |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:push` | Push schema changes to the database |
| `npm run db:studio` | Open Drizzle Studio (visual DB explorer) |

## Known Limitations / Future Improvements

- **Mobile sidebar** — The sidebar is hidden on mobile screens. A hamburger menu could be added for a full mobile experience.
- **Attendance reports** — Per-student attendance percentage reports could be added as a future feature.
- **Settings page** — The Settings menu item in the sidebar links to `/dashboard/settings` which is not yet implemented.

## License

MIT
