# Next.js Google + Apple Auth Demo

A beginner-friendly authentication demo built with **Next.js** and **Auth.js**.

This project implements:

- `Continue with Google` using real OAuth via Auth.js
- `Continue with Apple` as a mock flow (for UI/UX and flow testing)
- Same-window redirect flow (no popup)
- Post-login redirect to `/dashboard`
- Session-aware dashboard and sign-out

<img width="1419" height="735" alt="image" src="https://github.com/user-attachments/assets/d43ab487-5887-4359-802c-48564c10ea2c" />

## Why this project

This demo was built to provide a simple, practical reference for social sign-up with a clean user flow:

1. Landing page with auth buttons
2. Google OAuth redirect sign-in
3. Redirect back to app
4. User session on dashboard
5. Sign out and return to landing

It is designed for beginner learning and assignment/demo use.

## Stack

- Next.js (App Router)
- React
- Auth.js (NextAuth) for authentication
- Google OAuth 2.0 client credentials
- Optional deployment: Vercel

## Features

- Mobile-friendly auth UI
- Google sign-up/sign-in with OAuth callback
- Apple mock sign-up flow for demonstration
- Dashboard route showing authenticated user info
- Sign-out support
- Environment-based configuration

## Routes

- `/` → landing page with Google and Apple buttons
- `/dashboard` → authenticated page (or Apple mock session page)
- `/api/auth/[...nextauth]` → Auth.js auth routes

  # Social Signup Demo

Simple Next.js page with:
- Continue with Google (real Auth.js OAuth redirect flow)
- Continue with Apple (mock mode for demo)

## Run locally

1. Install dependencies:
   - `npm install`
2. Copy env template:
   - `Copy-Item .env.example .env.local`
3. Fill values in `.env.local`:
   - `NEXTAUTH_URL=http://localhost:3000`
   - `NEXTAUTH_SECRET=...`
   - `GOOGLE_CLIENT_ID=...`
   - `GOOGLE_CLIENT_SECRET=...`
   - `NEXT_PUBLIC_APPLE_MOCK_ENABLED=true`
4. Start dev server:
   - `npm run dev`

## Notes

- This app uses redirect-based auth for Google via Auth.js (`signIn("google")`).
- No popup window is used in Google flow.
- Results are logged in browser console for the Apple mock flow.
- Apple mock mode is enabled by default with:
  - `NEXT_PUBLIC_APPLE_MOCK_ENABLED=true`


## Environment Variables

Create `.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_long_random_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_APPLE_MOCK_ENABLED=true





