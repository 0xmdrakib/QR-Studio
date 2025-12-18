"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { sdk } from "@farcaster/miniapp-sdk";

function isProbablyUrl(v: string) {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function QRStudioClient() {
  const sp = useSearchParams();

  const [label, setLabel] = useState("My QR");
  const [content, setContent] = useState("");
  const [size, setSize] = useState(280);

  const [err, setErr] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  // Prefill from URL: ?text=...&label=...
  useEffect(() => {
    const t = (sp.get("text") ?? "").trim();
    const l = (sp.get("label") ?? "").trim();
    if (l) setLabel(l);
    if (t) setContent(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  const trimmed = content.trim();
  const canMake = trimmed.length > 0;

  const tooLong = trimmed.length > 550; // dense QR risk
  const lenPill = useMemo(() => {
    if (!canMake) return { cls: "pill", text: "0 chars" };
    if (tooLong) return { cls: "pill warn", text: `${trimmed.length} chars (dense)` };
    if (trimmed.length > 250) return { cls: "pill", text: `${trimmed.length} chars` };
    return { cls: "pill ok", text: `${trimmed.length} chars` };
  }, [canMake, trimmed.length, tooLong]);

  function shareUrl() {
    const u = new URL(window.location.origin);
    if (trimmed) u.searchParams.set("text", trimmed);
    if (label.trim()) u.searchParams.set("label", label.trim());
    return u.toString();
  }

  async function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1200);
  }

  async function pasteFromClipboard() {
    setErr(null);
    try {
      const t = (await navigator.clipboard.readText()).trim();
      if (!t) return;
      setContent(t);
    } catch {
      setErr("Clipboard permission blocked. Paste manually.");
    }
  }

  function clearAll() {
    setErr(null);
    setContent("");
  }

  async function copyQrImage() {
    setErr(null);
    if (!canvasRef.current) return;
    try {
      const canvas = canvasRef.current;
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );

      if (!blob) throw new Error("Could not create image blob.");

      // Clipboard image API
      // @ts-ignore
      if (!navigator.clipboard?.write) throw new Error("Image clipboard not supported here.");
      // @ts-ignore
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);

      await showToast("QR copied ✅");
    } catch (e: any) {
      setErr(e?.message ?? "Copy failed. Try download.");
    }
  }

  function downloadQr() {
    setErr(null);
    if (!canvasRef.current) return;
    try {
      const canvas = canvasRef.current;
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(label.trim() || "qr").replace(/\s+/g, "-").toLowerCase()}.png`;
      a.click();
    } catch {
      setErr("Download failed.");
    }
  }

  async function share() {
    setErr(null);
    if (!canMake) return;

    const embed =
      isProbablyUrl(trimmed) ? trimmed : shareUrl();

    const text =
      `QR Studio\n` +
      `${label.trim() ? label.trim() + "\n" : ""}` +
      `${trimmed.length > 120 ? trimmed.slice(0, 120) + "…" : trimmed}`;

    await sdk.actions.composeCast({
      text,
      embeds: [embed],
    });
  }

  async function addToApps() {
    await sdk.actions.addMiniApp();
  }

  const previewText = useMemo(() => {
    if (!trimmed) return "Type anything to generate a QR.";
    if (trimmed.length <= 180) return trimmed;
    return trimmed.slice(0, 180) + "…";
  }, [trimmed]);

  return (
    <div className="wrap">
      <div className="card">
        <div className="grid2">
          {/* Left */}
          <div className="card" style={{ padding: 16 }}>
            <div className="top">
              <div>
                <h1 className="title">QR Studio</h1>
                <p className="sub">
                  Turn <span className="mono">any text / link</span> into a clean QR.
                  <br />
                  Works for meetups, links, tips, notes — anything.
                </p>
              </div>
              <div className={lenPill.cls}>{lenPill.text}</div>
            </div>

            <div className="hr" />

            <div className="field" style={{ marginTop: 0 }}>
              <div className="label">
                <span>Label</span>
                <span className="kbd">optional</span>
              </div>
              <input
                className="input"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="My QR"
              />
            </div>

            <div className="field">
              <div className="label">
                <span>Content</span>
                <span className="kbd">anything</span>
              </div>
              <textarea
                className="textarea mono"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={"Paste a URL, wallet address, message, contact…\n\nExample:\nhttps://base.org"}
              />
              <div className="mini" style={{ marginTop: 8 }}>
                Tip: share a prefilled editor via <span className="mono">?text=...</span>
              </div>
            </div>

            <div className="row">
              <button className="btn ghost" onClick={pasteFromClipboard}>
                Paste
              </button>
              <button className="btn ghost" onClick={clearAll}>
                Clear
              </button>

              <div style={{ flex: 1 }} />

              <div className="pill" title="QR size">
                Size
                <span className="mono">{size}px</span>
              </div>
              <input
                aria-label="QR size"
                type="range"
                min={220}
                max={360}
                value={size}
                onChange={(e) => setSize(clamp(Number(e.target.value), 220, 360))}
                style={{ width: 140 }}
              />
            </div>

            <div className="row">
              <button className="btn primary full" onClick={copyQrImage} disabled={!canMake}>
                Copy QR (PNG)
              </button>
              <button className="btn full" onClick={downloadQr} disabled={!canMake}>
                Download QR (PNG)
              </button>
            </div>

            <div className="row">
              <button className="btn full" onClick={addToApps}>
                Add to my apps
              </button>
              <button className="btn" onClick={share} disabled={!canMake}>
                Share
              </button>
            </div>

            {err && <div className="err">{err}</div>}
            {toast && <div className="hint">{toast}</div>}

            {tooLong && (
              <div className="hint">
                This is pretty long — scanners may struggle. Shorten the text or use a link.
              </div>
            )}
          </div>

          {/* Right */}
          <div className="card" style={{ padding: 16 }}>
            <div className="top">
              <div>
                <h2 className="title" style={{ fontSize: 16 }}>Preview</h2>
                <p className="sub">This is what a scanner will decode.</p>
              </div>
              <div className="pill">
                {canMake ? (isProbablyUrl(trimmed) ? "URL" : "TEXT") : "QR"}
              </div>
            </div>

            <div className="hr" />

            <div className="panel" style={{ padding: 16 }}>
              <div className="row" style={{ justifyContent: "space-between", marginTop: 0 }}>
                <div>
                  <div className="title" style={{ fontSize: 14 }}>{label.trim() || "Untitled"}</div>
                  <div className="sub" style={{ marginTop: 4 }}>Scan to get the content.</div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 8px" }}>
                {canMake ? (
                  <QRCodeCanvas
                    // forwardRef gives us the canvas node
                    ref={(node) => { canvasRef.current = node; }}
                    value={trimmed}
                    size={size}
                    includeMargin
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                ) : (
                  <div className="hint" style={{ padding: 18 }}>
                    Nothing to encode yet.
                  </div>
                )}
              </div>

              <div className="kv">
                <div className="k">Content</div>
                <div className="v mono">{previewText}</div>
              </div>
            </div>

            <div className="hint">No server storage. Everything stays on your device unless you share.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
