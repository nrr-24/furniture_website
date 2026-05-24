import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './globals.css';
import { Cormorant_Garamond } from 'next/font/google';
import Navbar from '../components/layout/Navbar';
import { LanguageProvider } from '../data/LanguageContext';
import { AuthProvider } from '../data/AuthContext';
import { CartProvider } from '../data/CartContext';
import { WishlistProvider } from '../data/WishlistContext';
import { FurnitureProvider } from '../data/FurnitureContext';
import { supabase } from '../lib/supabase';
import { mapDbRowToItem, mapDbRowToCategory } from '../data/furnitureData';

// Serif headline face for the 2026 cream/espresso redesign. Loaded via next/font
// so it self-hosts and exposes a CSS variable consumed by --font-serif in globals.css.
const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-cormorant',
});

export const metadata = {
  title: 'SmartWood | Luxury Furniture',
  description: 'Luxury furniture storefront frontend',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
};

async function getInitialData() {
  try {
    const [prodRes, catRes] = await Promise.all([
      supabase.from('products').select('*').order('sort_order', { ascending: true }),
      supabase.from('categories').select('*').order('sort_order', { ascending: true })
    ]);

    return {
      products: (prodRes.data || []).map(mapDbRowToItem),
      categories: (catRes.data || []).map(mapDbRowToCategory)
    };
  } catch (error) {
    console.error('Server-side fetch failed:', error);
    return { products: [], categories: [] };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { products, categories } = await getInitialData();

  return (
    <html lang="en" className={serif.variable}>
      <body>
        <AuthProvider>
          <FurnitureProvider initialItems={products} initialCategories={categories}>
            <CartProvider>
              <WishlistProvider>
                <LanguageProvider>
                  <div className="monolithic-island">
                    <Navbar />
                    {children}
                  </div>
                </LanguageProvider>
              </WishlistProvider>
            </CartProvider>
          </FurnitureProvider>
        </AuthProvider>
      </body>
    </html>
  );
}