import { CartProvider } from '@/context/CartContext';
import { UIProvider } from '@/context/UIContext';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import EnquiryModal from '@/components/layout/EnquiryModal';
import Toast from '@/components/layout/Toast';

export default function MarketingLayout({ children } :  {
  children: React.ReactNode;
}) {
  return (
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
  );
}