import type { Metadata } from "next";
import localFont from "next/font/local";
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
//
// Fonts are SELF-HOSTED (next/font/local) from ./fonts — the woff2
// files ship in the repo, so the production build never fetches from
// fonts.gstatic.com. This keeps builds working in sandboxed CI/hosts
// (e.g. Railway) that restrict outbound network during the build.
// Latin subset only; same weights and `display: swap` as before.

const archivo = localFont({
  src: [
    { path: "./fonts/archivo-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/archivo-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/archivo-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/archivo-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/archivo-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-archivo",
  display: "swap",
});

const inter = localFont({
  src: [
    { path: "./fonts/inter-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/inter-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/inter-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/inter-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = localFont({
  src: [
    { path: "./fonts/fraunces-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/fraunces-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/fraunces-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/fraunces-700.woff2", weight: "700", style: "normal" },
  ],
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