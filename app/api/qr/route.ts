import { NextResponse } from "next/server";
import QRCode from "qrcode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeFilename(label: string) {
  const base = (label || "qr")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-\s_]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60);
  return base || "qr";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const text = (searchParams.get("text") ?? "").toString();
  const label = (searchParams.get("label") ?? "qr").toString();
  const download = (searchParams.get("download") ?? "") === "1";
  const size = Number(searchParams.get("size") ?? "960");

  if (!text || text.trim().length === 0) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const clamped = Math.max(256, Math.min(Number.isFinite(size) ? size : 960, 2048));

  try {
    const buf = await QRCode.toBuffer(text, {
      type: "png",
      width: clamped,
      margin: 2,
      errorCorrectionLevel: "M",
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    const headers: Record<string, string> = {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    };

    if (download) {
      headers["Content-Disposition"] = `attachment; filename="${safeFilename(label)}.png"`;
    }

    return new NextResponse(buf, { status: 200, headers });
  } catch {
    return NextResponse.json({ error: "Failed to generate QR" }, { status: 500 });
  }
}
