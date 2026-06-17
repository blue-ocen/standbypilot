# Deployment Guide

## Option A: Local use

Open `index.html` in a browser. This is the fastest way to test the product.

## Option B: Static hosting

Upload this folder to a static host:

- Netlify
- Vercel
- Cloudflare Pages
- GitHub Pages

Because v1 uses localStorage, every user's trips stay in that user's browser.

## Option C: Private prototype

For a private alpha, put the static site behind a real access layer:

- Cloudflare Access
- Netlify password protection
- Vercel Authentication
- basic auth on a private server

Do not rely on a client-side passcode for production privacy.

## Option D: Production rebuild

Recommended stack:

- Next.js frontend
- Supabase Auth
- Supabase Postgres
- Row Level Security
- Vercel hosting
- OpenAI API for narrative Battle Card generation
- Flight schedule/status provider later
- Paid fare search provider later

## Production database tables

See `supabase_schema.sql` for a starter schema.
