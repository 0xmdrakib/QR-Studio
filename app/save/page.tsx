import { Suspense } from "react";
import SaveClient from "./save-client";

export const dynamic = "force-dynamic";

export default function Page({
  searchParams,
}: {
  searchParams: { id?: string; label?: string };
}) {
  const id = searchParams.id ?? "";
  const label = searchParams.label ?? "QR";
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <SaveClient id={id} label={label} />
    </Suspense>
  );
}
