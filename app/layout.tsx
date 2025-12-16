import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Annual Rolling Forecast",
  description: "Editable rolling forecast with multiple accounts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
