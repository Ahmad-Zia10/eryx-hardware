import type { Metadata } from "next";
import { Archivo, Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

// ─── Brand fonts ───────────────────────────────────────────────────
// Marketing (Modernist reskin) runs on ARCHIVO for every type role —
// display headlines, headings, and body/UI alike. The four serif
// tokens (--font-display/heading/serif/accent) and --font-sans are
// remapped to Archivo inside the `.modernist` scope in globals.css, so
// existing font-* utilities recolor with no component edits.
//
// Fraunces + Inter are retained ONLY for the Admin area, which keeps
// its legacy theme (the :root token defaults point at them). Loading
// all three is a deliberate, admin-scoped cost — marketing visitors
// still only render Archivo glyphs that actually paint.
//   Archivo  → all marketing type (--font-archivo)
//   Inter    → admin body + UI  (--font-inter)
//   Fraunces → admin serif roles (--font-fraunces)

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-archivo",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fraunces",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eryx Hardware — Premium Kitchen & Wardrobe Hardware",
  description:
    "German-engineered kitchen and wardrobe hardware for the modern Indian home. Built to last. Designed to inspire.",
};

const noFlashThemeScript = `
  (function () {
    try {
      var stored = localStorage.getItem('eryx-theme');
      if (stored === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${archivo.variable} ${inter.variable} ${fraunces.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
      </head>
      <body className="min-h-screen bg-surface text-ink font-sans transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}