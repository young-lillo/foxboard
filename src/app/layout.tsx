import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Foxboard",
  description: "Internal campaign monitoring dashboard"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
