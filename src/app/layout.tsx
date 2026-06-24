import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PathFinder",
  description: "A dark, focused workspace for resumes and career analysis.",
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
