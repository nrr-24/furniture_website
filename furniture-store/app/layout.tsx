import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './globals.css';
import Navbar from '../components/layout/Navbar';
import { LanguageProvider } from '../data/LanguageContext';
import { AuthProvider } from '../data/AuthContext';
import { CartProvider } from '../data/CartContext';
import { FurnitureProvider } from '../data/FurnitureContext';
import { supabase } from '../lib/supabase';
import { mapDbRowToItem, mapDbRowToCategory } from '../data/furnitureData';

export const metadata = {
  title: 'SmartWood | Luxury Furniture',
  description: 'Luxury furniture storefront frontend',
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
    <html lang="en">
      <body>
        <AuthProvider>
          <FurnitureProvider initialItems={products} initialCategories={categories}>
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