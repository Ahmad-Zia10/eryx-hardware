import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Prata } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

// Prata — used exclusively for hero/display headlines per brand kit.
// Applied via the font-display utility class; does NOT replace body text.
const prata = Prata({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
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
    <html lang="en" className={`${cormorant.variable} ${inter.variable} ${prata.variable}`}>
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