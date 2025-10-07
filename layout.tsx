import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BdP Abrechnungssystem",
  description: "Automatisiertes Abrechnungssystem für den BdP Landesverband Baden-Württemberg",
  keywords: ["BdP", "Abrechnung", "Baden-Württemberg"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.Node;
}>) {
  return (
    <html lang="de">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
