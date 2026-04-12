import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './globals.css';
import Navbar from '../components/layout/Navbar';
import { LanguageProvider } from '../data/LanguageContext';
import { AuthProvider } from '../data/AuthContext';
import { CartProvider } from '../data/CartContext';
import { FurnitureProvider } from '../data/FurnitureContext';
import { supabase } from '../lib/supabase';
import { mapDbRowToItem } from '../data/furnitureData';

export const metadata = {
  title: 'SmartWood | Luxury Furniture',
  description: 'Luxury furniture storefront frontend',
};

async function getInitialProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Server-side fetch error:', error.message);
      return [];
    }

    return (data || []).map(mapDbRowToItem);
  } catch (error) {
    console.error('Server-side fetch failed:', error);
    return [];
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialProducts = await getInitialProducts();

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <FurnitureProvider initialItems={initialProducts}>
            <CartProvider>
              <LanguageProvider>
                <div className="monolithic-island">
                  <Navbar />
                  {children}
                </div>
              </LanguageProvider>
            </CartProvider>
          </FurnitureProvider>
        </AuthProvider>
      </body>
    </html>
  );
}