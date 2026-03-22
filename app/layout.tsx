import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "License Key Admin",
  description: "Simple web license manager for Python desktop scripts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
