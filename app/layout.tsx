import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "Ethan Benyayer — Cybersécurité & Pentest",
  description:
    "Portfolio d'Ethan Benyayer, étudiant en cybersécurité à l'École 2600 et pentester. Root-Me, projets offensifs, write-ups. À la recherche d'une alternance.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${grotesk.variable} ${jetbrains.variable}`}>
        {/* decorative background */}
        {/* Static decorative background — soft glows drawn with radial-gradients
            (no filter: blur), so nothing expensive composites while scrolling. */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="bg-grid absolute inset-0" />
          <div
            className="absolute -top-64 left-1/2 h-[900px] w-[1200px] -translate-x-1/2"
            style={{ background: "radial-gradient(closest-side, rgba(16,185,129,0.16), transparent)" }}
          />
          <div
            className="absolute top-[35%] -right-64 h-[760px] w-[760px]"
            style={{ background: "radial-gradient(closest-side, rgba(34,211,238,0.10), transparent)" }}
          />
        </div>

        <Navbar />
        <main className="relative z-10 min-h-screen pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
