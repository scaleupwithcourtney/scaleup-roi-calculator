import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ScaleUp ROI Calculator",
  description: "DIY vs With ScaleUp ROI projection calculator.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
