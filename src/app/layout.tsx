import type { Metadata } from "next";
import {
  Fraunces,
  Inter,
  Libre_Baskerville,
  Marcellus,
  Prata,
} from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

// ─── Brand fonts (per the Modular India brand kit) ─────────────────
// Mapping:
//   --font-display  → Prata            (hero-scale display headlines)
//   --font-heading  → Marcellus        (section H2 / H3)
//   --font-serif    → Libre Baskerville (long-form serif body — About, blog)
//   --font-accent   → Fraunces          (pull quotes, stat numbers, editorial accents)
//   --font-sans     → Inter             (default body + UI)

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const prata = Prata({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
  display: "swap",
});

const marcellus = Marcellus({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-heading",
  display: "swap",
});

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-accent",
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
    <html
      lang="en"
      className={`${libreBaskerville.variable} ${inter.variable} ${prata.variable} ${marcellus.variable} ${fraunces.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
      </head>
      <body className="min-h-screen bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F5F5F5] font-sans transition-colors duration-200">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}