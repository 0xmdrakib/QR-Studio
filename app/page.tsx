import { Suspense } from "react";
import QRStudioClient from "./qr-studio-client";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <QRStudioClient />
    </Suspense>
  );
}
