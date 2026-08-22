# Cedexx Supabase Setup

## Step 1: Create the table
1. Go to https://supabase.com/dashboard/project/fjeubuopladzxxswomko
2. Click **SQL Editor** (left sidebar)
3. Click **New query**
4. Paste the contents of `supabase-setup.sql`
5. Click **Run**

## Step 2: Update Vercel Environment Variables
Add these 2 variables in your Vercel project settings:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | `https://fjeubuopladzxxswomko.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqZXVidW9wbGFkenh4c3dvbWtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY5MTM2NDAsImV4cCI6MjEwMjQ4OTY0MH0.QVp74zTbgUj4Me6T059TnxOKT0w7gCwp5D7gX_7li44` |

## Step 3: Redeploy
After adding env vars, redeploy your Vercel project.

## What changes
- Member registrations → saved permanently in Supabase (not /tmp)
- Admin dashboard → reads from Supabase
- If Supabase fails → falls back to /tmp file (won't lose data)
