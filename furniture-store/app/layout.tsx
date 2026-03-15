import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './globals.css';
import Navbar from '../components/layout/Navbar';
import { LanguageProvider } from '../data/LanguageContext';
import { AuthProvider } from '../data/AuthContext';
import { CartProvider } from '../data/CartContext';
import { FurnitureProvider } from '../data/FurnitureContext';

export const metadata = {
  title: 'SmartWood | Luxury Furniture',
  description: 'Luxury furniture storefront frontend',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <FurnitureProvider>
            <CartProvider>
              <LanguageProvider>
                <Navbar />
                <main>{children}</main>
              </LanguageProvider>
            </CartProvider>
          </FurnitureProvider>
        </AuthProvider>
      </body>
    </html>
  );
}