import type { Metadata } from "next";
import "./globals.css";

const APP_URL = "https://qr-studio-plum.vercel.app/";
const BASE_APP_ID = "6944770bd77c069a945be06e"; // from Base Build modal

export const metadata: Metadata = {
  title: "QR Studio",
  description: "Turn any text or link into a clean QR code.",
  other: {
    "base:app_id": BASE_APP_ID,

    // Required for Base app embed rendering on the homeUrl page
    "fc:miniapp": JSON.stringify({
      version: "next",
      imageUrl: `${APP_URL}/hero.png`,
      button: { title: "Open", action: { type: "launch_frame", url: APP_URL } },
    }),

    // Compatibility for Farcaster clients that still read fc:frame
    "fc:frame": JSON.stringify({
      version: "next",
      imageUrl: `${APP_URL}/hero.png`,
      button: { title: "Open", action: { type: "launch_frame", url: APP_URL } },
    }),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
