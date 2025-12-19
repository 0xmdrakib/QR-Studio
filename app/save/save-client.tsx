"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { sdk } from "@farcaster/miniapp-sdk";

export default function SaveClient({ id, label }: { id: string; label: string }) {
  const router = useRouter();
  const [src, setSrc] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);
  const cleanLabel = useMemo(
    () => (label || "QR").replace(/\s+/g, " ").trim() || "QR",
    [label]
  );

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  useEffect(() => {
    if (!id) {
      setErr("Missing image id.");
      return;
    }
    try {
      const v = sessionStorage.getItem(id);
      if (!v) {
        setErr("Image not found. Go back and generate again.");
        return;
      }
      setSrc(v);
    } catch {
      setErr("Storage blocked in this environment.");
    }
  }, [id]);

  async function shareImage() {
    setErr(null);
    if (!src) return;
    try {
      const blob = await (await fetch(src)).blob();
      const file = new File([blob], `${cleanLabel}.png`, { type: "image/png" });

      // @ts-ignore
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        // @ts-ignore
        await navigator.share({ files: [file], title: cleanLabel });
        return;
      }

      // Fallback: open the image (some clients let you save from there)
      await sdk.actions.openUrl(src);
    } catch (e: any) {
      setErr(e?.message ?? "Share failed.");
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-md px-5 py-8">
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-[0_10px_40px_rgba(15,23,42,0.10)] backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-lg font-semibold text-slate-900">Save QR</div>
              <div className="mt-1 text-sm text-slate-600">
                In the Base app, downloads/clipboard can be limited. Use <b>Share</b> or long‑press the image.
              </div>
            </div>
            <button
              className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50"
              onClick={() => router.back()}
            >
              Back
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            {err ? (
              <div className="text-sm text-rose-600">{err}</div>
            ) : src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={src}
                alt="QR"
                className="mx-auto block h-auto w-full max-w-[320px] rounded-xl border border-slate-200 bg-white p-2"
              />
            ) : (
              <div className="text-sm text-slate-500">Loading…</div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={shareImage}
              className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-sm hover:opacity-95"
              disabled={!src || !!err}
            >
              Share image
            </button>
            <button
              onClick={() => router.push("/")}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              New QR
            </button>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            Tip: long‑press the QR image to save it to Photos or copy it (client‑dependent).
          </div>
        </div>
      </div>
    </div>
  );
}
