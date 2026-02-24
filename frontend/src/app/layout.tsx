import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "InvestSave Terminal",
  description: "Real-time AI Financial Intelligence",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#030712] text-white overflow-hidden antialiased">
        {children}
      </body>
    </html>
  );
}