import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/authContext';
import { CartProvider } from '@/lib/cartContext';
import CartDrawer from '@/components/cart/CartDrawer';
import CheckoutModal from '@/components/cart/CheckoutModal';
import SmoothScrollProvider from '@/components/motion/SmoothScrollProvider';

export const metadata: Metadata = {
  title: 'WhereIsIt? — 3D Printed Objects & Custom Strava Studio',
  description:
    'Transforms personal data, achievements, and everyday routines into meaningful physical products. Personal data. Physical products. Meaningful experiences.',
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-[#F8F6F1] text-[#14191F] antialiased selection:bg-[#5C7489] selection:text-white">
        <AuthProvider>
          <CartProvider>
            <SmoothScrollProvider>
              {children}
              <CartDrawer />
              <CheckoutModal />
            </SmoothScrollProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
