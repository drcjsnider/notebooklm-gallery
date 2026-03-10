import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "NotebookLM Gallery",
  description:
    "A community-curated collection of shared NotebookLM notebooks, audio overviews, and structured research insights.",
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
