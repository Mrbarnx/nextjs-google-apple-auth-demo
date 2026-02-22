# Social Signup Demo

Simple Next.js page with:
- Continue with Google (real Firebase redirect auth)
- Continue with Apple (mock by default, real Firebase redirect if mock disabled)

## Run locally

1. Install dependencies:
   - `npm install`
2. Copy env template:
   - `Copy-Item .env.example .env.local`
3. Fill Firebase values in `.env.local`.
4. Start dev server:
   - `npm run dev`

## Notes

- This app uses redirect-based auth only (`signInWithRedirect`), so no popup window is used.
- Results are logged in browser console after redirect.
- Apple mock mode is enabled by default with:
  - `NEXT_PUBLIC_APPLE_MOCK_ENABLED=true`
- To use real Apple OAuth (requires Apple Developer setup), set:
  - `NEXT_PUBLIC_APPLE_MOCK_ENABLED=false`
