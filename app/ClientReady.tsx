'use client';

import { useEffect } from 'react';
import sdk from '@farcaster/frame-sdk';

export default function ClientReady() {
  useEffect(() => {
    // Helps Farcaster/Warpcast webviews treat the app as ready
    sdk.actions.ready().catch(() => {});
  }, []);
  return null;
}
