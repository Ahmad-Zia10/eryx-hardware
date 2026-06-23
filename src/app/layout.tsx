import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { CartProvider } from "@/context/CartContext";
import { UIProvider } from "@/context/UIContext";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";
import EnquiryModal from "@/components/layout/EnquiryModal";
import Toast from "@/components/layout/Toast";

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

export const metadata: Metadata = {
  title: "Eryx Hardware — Premium Kitchen & Wardrobe Hardware",
  description:
    "German-engineered kitchen and wardrobe hardware for the modern Indian home. Built to last. Designed to inspire.",
};

// Runs synchronously before React hydrates, directly setting the
// `dark`/`light` class on <html> based on the stored preference.
// This is what actually eliminates the flash-of-wrong-theme — the
// ThemeProvider's own useEffect (see ThemeContext.tsx) runs after
// hydration, which is too late to prevent an initial flash on its own.
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
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
      </head>
      <body className="min-h-screen bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F5F5F5] font-sans transition-colors duration-200">
        {/* Provider order matches the original AppContent exactly:
            Theme > Cart > UI. None of the three depend on each other,
            so this order isn't functionally required, but kept
            consistent with the source rather than reordered arbitrarily. */}
        <ThemeProvider>
          <CartProvider>
            <UIProvider>
              <AnnouncementBar />
              <Navbar />
              <main>{children}</main>
              <Footer />
              <CartDrawer />
              <EnquiryModal />
              <Toast />
            </UIProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}