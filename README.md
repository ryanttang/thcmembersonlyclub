# Minimal Events Promotion & Ticketing Site

A complete, copy-paste scaffold for a minimal events site. Admin can upload a flyer, set title/date/time/location/ticket URL, and the event appears on the home page as a chronological grid.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Ant Design v5**
- **Prisma** + SQLite (dev) / Postgres (prod)
- **Zod** for validation
- **date-fns** for date formatting
- **AWS SDK** (S3/R2) for image storage

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   ```bash
   cp env.example .env
   # Edit .env with your ADMIN_TOKEN
   ```

3. **Set up database**
   ```bash
   npx prisma migrate dev -n init
   npx prisma generate
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## Usage

- **Home page** (`/`): View all published events in chronological order
- **Admin page** (`/admin`): Upload flyers and create new events

## Admin Authentication

Set `ADMIN_TOKEN` in your `.env` file. Use this token in the admin interface to authenticate uploads and event creation.

## Image Storage

- **Development**: Images are stored locally in `/public/uploads`
- **Production**: Configure S3/R2 credentials in `.env` for cloud storage

## API Endpoints

- `POST /api/upload` - Upload flyer images (requires admin token)
- `GET /api/events` - Get all published events
- `POST /api/events` - Create new event (requires admin token)

## Database Schema

The `Event` model includes:
- Basic event details (title, description, date, time, location)
- Ticket URL for external ticketing
- Flyer image URL
- Publication status
- Automatic slug generation
- Timestamps

## Deployment

1. Update `next.config.ts` with your S3/CDN domains
2. Set production database URL in `.env`
3. Configure S3/R2 credentials for production image storage
4. Deploy to Vercel, Netlify, or your preferred platform

## Features

- ✅ Responsive event grid layout
- ✅ Drag & drop image uploads
- ✅ Admin authentication
- ✅ Form validation with Zod
- ✅ Image optimization with Next.js Image
- ✅ SQLite for development, Postgres for production
- ✅ S3/R2 integration for production
- ✅ TypeScript throughout
- ✅ Ant Design components
- ✅ Tailwind CSS styling
