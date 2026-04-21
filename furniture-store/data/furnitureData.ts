

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  sortOrder: number;
}

export interface FurnitureItem {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  image: string;
  price: number;
  categoryId: string;
  sortOrder: number;
  originalPrice?: number | null;
  salePrice?: number | null;
  colors?: string[];
  types?: string[];
  gallery?: string[];
}

/** Maps a Supabase DB row to the app-level FurnitureItem */
export function mapDbRowToItem(row: any): FurnitureItem {
  return {
    id: row.id,
    name: row.name || '',
    nameAr: row.name_ar || '',
    description: row.description || '',
    descriptionAr: row.description_ar || '',
    image: row.image_url || '',
    price: Number(row.price) || 0,
    categoryId: row.category_id || '',
    sortOrder: row.sort_order || 0,
    originalPrice: row.original_price != null ? Number(row.original_price) : null,
    salePrice: row.sale_price != null ? Number(row.sale_price) : null,
    colors: Array.isArray(row.colors) ? row.colors : [],
    types: Array.isArray(row.types) ? row.types : [],
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
  };
}

/** Maps a FurnitureItem to a Supabase DB row (for insert/update) */
export function mapItemToDbRow(item: Omit<FurnitureItem, 'id'>) {
  return {
    name: item.name,
    name_ar: item.nameAr,
    description: item.description,
    description_ar: item.descriptionAr,
    price: item.price,
    image_url: item.image,
    category_id: item.categoryId,
    sort_order: item.sortOrder,
    original_price: item.originalPrice ?? null,
    sale_price: item.salePrice ?? null,
    colors: item.colors || [],
    types: item.types || [],
    gallery: item.gallery || [],
  };
}

/** Maps a DB category row to app-level Category */
export function mapDbRowToCategory(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    nameAr: row.name_ar,
    sortOrder: row.sort_order,
  };
}

export const DEFAULT_ITEMS: FurnitureItem[] = [
  {
    id: '1',
    name: 'Serene Sectional',
    nameAr: 'كنبة سيرينا',
    description: 'Comfort-driven silhouettes with strong presence.',
    descriptionAr: 'تصاميم مريحة مع حضور بصري قوي.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
    price: 1200,
    categoryId: 'sofas',
    sortOrder: 0
  },
  {
    id: '2',
    name: 'Velvet Dream',
    nameAr: 'حلم المخمل',
    description: 'Quiet luxury for restful spaces and comfort.',
    descriptionAr: 'فخامة هادئة لمساحات مريحة وراحة فائقة.',
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
    price: 850,
    categoryId: 'bedrooms',
    sortOrder: 0
  },
  {
    id: '3',
    name: 'Heritage Table',
    nameAr: 'طاولة التراث',
    description: 'Tables and chairs for memorable gatherings.',
    descriptionAr: 'طاولات وكراسي مصممة للقاءات لا تُنسى.',
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80',
    price: 1500,
    categoryId: 'dining',
    sortOrder: 0
  },
  {
    id: '4',
    name: 'Minimalist Chair',
    nameAr: 'كرسي عصري',
    description: 'Selection of details that complete the room.',
    descriptionAr: 'مجموعة من التفاصيل التي تكمل الغرفة.',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
    price: 300,
    categoryId: 'accents',
    sortOrder: 0
  },
  {
    id: '5',
    name: 'Cloud Nine Sofa',
    nameAr: 'أريكة السحابة',
    description: 'Deep seating plush sofa with high resilience foam.',
    descriptionAr: 'أريكة بمقاعد عميقة وإسفنج عالي المرونة.',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    price: 1850,
    categoryId: 'sofas',
    sortOrder: 1
  },
  {
    id: '6',
    name: 'Midnight Leather Sofa',
    nameAr: 'أريكة جلدية',
    description: 'Premium Italian dark leather classic design.',
    descriptionAr: 'تصميم كلاسيكي من الجلد الإيطالي الفاخر.',
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=900&q=80',
    price: 3200,
    categoryId: 'sofas',
    sortOrder: 2
  },
  {
    id: '7',
    name: 'Zen Platform Bed',
    nameAr: 'سرير منصة زين',
    description: 'Low profile wooden platform bed frame.',
    descriptionAr: 'إطار سرير خشبي بتصميم منخفض وبسيط.',
    image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=900&q=80',
    price: 2100,
    categoryId: 'bedrooms',
    sortOrder: 1
  },
  {
    id: '8',
    name: 'Haven Canopy Bed',
    nameAr: 'سرير بمظلة هافن',
    description: 'Elegant canopy structure with sheer draping options.',
    descriptionAr: 'هيكل مظلة أنيق مع خيارات للستائر الشفافة.',
    image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=900&q=80',
    price: 3500,
    categoryId: 'bedrooms',
    sortOrder: 2
  },
  {
    id: '9',
    name: 'Marble Core Dining Table',
    nameAr: 'طاولة طعام رخامية',
    description: 'Solid marble tabletop with brass finished legs.',
    descriptionAr: 'سطح طاولة من الرخام الصلب مع أرجل بلمسة نحاسية.',
    image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=900&q=80',
    price: 4500,
    categoryId: 'dining',
    sortOrder: 1
  },
  {
    id: '10',
    name: 'Oak Extension Table',
    nameAr: 'طاولة بلوط قابلة للتوسعة',
    description: 'Versatile dining table that seats up to 12.',
    descriptionAr: 'طاولة طعام متعددة الاستخدامات تتسع حتى ١٢ شخصاً.',
    image: 'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&w=900&q=80',
    price: 2800,
    categoryId: 'dining',
    sortOrder: 2
  },
  {
    id: '11',
    name: 'Art Deco Floor Lamp',
    nameAr: 'مصباح أرضي آرت ديكو',
    description: 'Geometric brass floor lamp to illuminate dark corners.',
    descriptionAr: 'مصباح أرضي نحاسي هندسي لإضاءة الزوايا المظلمة.',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
    price: 450,
    categoryId: 'accents',
    sortOrder: 1
  },
  {
    id: '12',
    name: 'Abstract Wool Rug',
    nameAr: 'سجادة صوف تجريدية',
    description: 'Hand-tufted wool rug featuring modern art motifs.',
    descriptionAr: 'سجادة صوف معنقدة يدوياً تتميز بزخارف الفن الحديث.',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80',
    price: 600,
    categoryId: 'accents',
    sortOrder: 2
  }
];
