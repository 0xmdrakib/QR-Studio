import type { Metadata } from "next";
import "./globals.css";
import ClientReady from "./ClientReady";

const RAW_APP_URL =
  (process.env.NEXT_PUBLIC_APP_URL || "https://qr-studio-plum.vercel.app").trim();
const APP_URL = RAW_APP_URL.replace(/\/$/, "");
const BASE_APP_ID =
  (process.env.NEXT_PUBLIC_BASE_APP_ID || "6944770bd77c069a945be06e").trim();

const MINIAPP_EMBED = {
  version: "1",
  imageUrl: `${APP_URL}/embed.png`,
  button: {
    title: "Open QR Studio",
    action: {
      type: "launch_miniapp",
      name: "QR Studio",
      url: APP_URL,
      splashImageUrl: `${APP_URL}/splash.png`,
      splashBackgroundColor: "#0b0f1a"
    }
  }
};

// Backward compatibility for clients still reading fc:frame
const FRAME_EMBED = {
  ...MINIAPP_EMBED,
  button: {
    ...MINIAPP_EMBED.button,
    action: {
      ...MINIAPP_EMBED.button.action,
      type: "launch_frame"
    }
  }
};

export const metadata: Metadata = {
  title: "QR Studio",
  description: "Generate clean QR codes for any text or URL.",
  other: {
    "base:app_id": BASE_APP_ID,
    "fc:miniapp": JSON.stringify(MINIAPP_EMBED),
    "fc:frame": JSON.stringify(FRAME_EMBED)
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientReady />
        {children}
      </body>
    </html>
  );
}
