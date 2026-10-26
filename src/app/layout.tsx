import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/authContext';
import { CartProvider } from '@/lib/cartContext';
import CartDrawer from '@/components/cart/CartDrawer';
import CheckoutModal from '@/components/cart/CheckoutModal';

export const metadata: Metadata = {
  title: 'WhereIsIt — 3D Printed Premium Stuff & Design Studio',
  description: 'Bespoke 3D printed objects, functional furniture, architectural desk objects, and custom character keepsakes born from purpose and meticulous design.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="bg-[#F8F6F1] text-[#14191F] antialiased selection:bg-[#5C7489] selection:text-white">
        <AuthProvider>
          <CartProvider>
            {children}
            <CartDrawer />
            <CheckoutModal />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
