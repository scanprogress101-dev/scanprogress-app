
# ScanProgress App

## Overview
This app connects InBody 570 scan data to the ScanProgress platform.  
Currently, data can be imported via CSV. Long-term, scans will stream in automatically via webhook from the device.

## Key Features
- Next.js (Pages Router) frontend + API routes
- Supabase as the database
- Scheduled cron job (`/api/cron`) runs daily at 10:00 UTC
- CSV import available only for testing (stores will never upload manually in production)

## Important Files
- `/pages/api/cron.js` → scheduled daily job
- `/pages/api/inbody.js` (coming soon) → webhook endpoint for instant scan delivery
- `/lib/supabaseClient.js` → database connection
- `/docs/.env.example` → environment variable template
- `/docs/vercel.json` → defines Vercel cron job

## Database Tables
- `public.inbody_570_stage` (staging for raw data)
- `public.inbody_570` (final, cleaned scan data)

## Deployment
- Hosted on Vercel: [app.scanprogress.com](https://app.scanprogress.com)
- Cron job configured via `vercel.json`
- Environment variables set in Vercel dashboard (not committed here)

## Next Steps
- Build `/api/inbody` POST route to receive real-time scan data.
- Replace CSV import with live webhook once device integration is ready.
