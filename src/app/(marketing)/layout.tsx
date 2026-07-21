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
          <AnnouncementBar />
          <Navbar categoryGroups={categoryGroups} />
          <main>{children}</main>
          <Footer />
          <CartDrawer />
          <EnquiryModal />
          <Toast />
        </WishlistProvider>
      </UIProvider>
    </CartProvider>
  );
}