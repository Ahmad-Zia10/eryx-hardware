import { CartProvider } from '@/context/CartContext';
import { UIProvider } from '@/context/UIContext';
import { WishlistProvider } from '@/context/WishlistContext';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import EnquiryModal from '@/components/layout/EnquiryModal';
import Toast from '@/components/layout/Toast';
import { getCategoriesByProductLine } from '@/lib/db/categories';

// Layout is async so we can fetch the category groups once per request
// and hand them to Navbar as a serialisable prop — keeps Navbar a
// pure client component while the mega-menu content stays DB-driven.
export default async function MarketingLayout({ children } :  {
  children: React.ReactNode;
}) {
  const categoryGroups = await getCategoriesByProductLine();
  return (
    <CartProvider>
      <UIProvider>
        <WishlistProvider>
          {/* `.modernist` scopes the redesign token overrides (globals.css)
              to the storefront only — the admin tree never sits inside it,
              so it keeps the legacy theme. `font-sans` re-applies Archivo
              here because the body-level utility resolved against :root. */}
          <div className="modernist bg-surface text-ink font-sans">
            <AnnouncementBar />
            <Navbar categoryGroups={categoryGroups} />
            <main>{children}</main>
            <Footer />
            <CartDrawer />
            <EnquiryModal />
            <Toast />
          </div>
        </WishlistProvider>
      </UIProvider>
    </CartProvider>
  );
}