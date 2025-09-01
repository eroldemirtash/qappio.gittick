# Qappio Admin Panel

Modern admin panel for Qappio platform built with Next.js 15, TypeScript, and Tailwind CSS.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your Supabase credentials:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

4. Run development server:
```bash
npm run dev
```

The admin panel will be available at http://localhost:3010

## Features

- **Dashboard**: Real-time statistics from Supabase
- **Brand Management**: Create, list, and toggle brand status
- **Modern UI**: Dark sidebar with gradient, soft shadows, rounded corners
- **Responsive Design**: Works on desktop and tablet
- **TypeScript**: Full type safety
- **Tailwind CSS**: Modern styling with custom brand colors

## API Endpoints

- `GET /api/stats` - Dashboard statistics
- `GET /api/brands` - List all brands
- `POST /api/brands` - Create new brand
- `PATCH /api/brands/[id]` - Update brand status
- `PATCH /api/brands/[id]/profile` - Update brand profile
- `POST /api/storage/brand-assets` - Upload brand assets

## Database Schema

The admin panel expects these Supabase tables:
- `brands` - Brand information
- `brand_profiles` - Brand profile details
- `missions` - Mission data
- `profiles` - User profiles
- `mission_participations` - User participations

## Deployment

Deploy to Vercel with the following settings:
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Environment Variables**: Copy from `.env.local`
