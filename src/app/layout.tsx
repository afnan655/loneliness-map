import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Intelligence Explorer | Loneliness Map",
  description: "An interactive loneliness knowledge graph for research, evidence, and intervention discovery.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
