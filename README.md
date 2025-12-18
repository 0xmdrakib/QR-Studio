# QR Studio (Rebuild UI)

Paste a wallet content → get a clean QR card you can share.

## Run
```bash
npm install
npm run dev
```

## Base Build patch (only 2 files)
1) `app/layout.tsx` → set `APP_URL` and `BASE_APP_ID`
2) `public/.well-known/farcaster.json` → paste `accountAssociation.header/payload/signature` and replace domain URLs

## Notes
- Uses `qrcode.react` for QR rendering
- Uses `@farcaster/miniapp-sdk` for Share + Add to Apps
