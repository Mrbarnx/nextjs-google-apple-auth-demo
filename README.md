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
