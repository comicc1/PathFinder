import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PathFinder. - Optimize Your Career",
  description: "AI-powered resume analysis to help you find your path.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <div className="app-container">
          <Sidebar />
          <div className="main-wrapper">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
