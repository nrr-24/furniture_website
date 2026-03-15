

export interface FurnitureItem {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  image: string;
  price: number;
  category: 'sofas' | 'bedrooms' | 'dining' | 'accents';
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
    category: 'sofas'
  },
  {
    id: '2',
    name: 'Velvet Dream',
    nameAr: 'حلم المخمل',
    description: 'Quiet luxury for restful spaces and comfort.',
    descriptionAr: 'فخامة هادئة لمساحات مريحة وراحة فائقة.',
    image: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80',
    price: 850,
    category: 'bedrooms'
  },
  {
    id: '3',
    name: 'Heritage Table',
    nameAr: 'طاولة التراث',
    description: 'Tables and chairs for memorable gatherings.',
    descriptionAr: 'طاولات وكراسي مصممة للقاءات لا تُنسى.',
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80',
    price: 1500,
    category: 'dining'
  },
  {
    id: '4',
    name: 'Minimalist Chair',
    nameAr: 'كرسي عصري',
    description: 'Selection of details that complete the room.',
    descriptionAr: 'مجموعة من التفاصيل التي تكمل الغرفة.',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
    price: 300,
    category: 'accents'
  },
  {
    id: '5',
    name: 'Cloud Nine Sofa',
    nameAr: 'أريكة السحابة',
    description: 'Deep seating plush sofa with high resilience foam.',
    descriptionAr: 'أريكة بمقاعد عميقة وإسفنج عالي المرونة.',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    price: 1850,
    category: 'sofas'
  },
  {
    id: '6',
    name: 'Midnight Leather Sofa',
    nameAr: 'أريكة جلدية',
    description: 'Premium Italian dark leather classic design.',
    descriptionAr: 'تصميم كلاسيكي من الجلد الإيطالي الفاخر.',
    image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=900&q=80',
    price: 3200,
    category: 'sofas'
  },
  {
    id: '7',
    name: 'Zen Platform Bed',
    nameAr: 'سرير منصة زين',
    description: 'Low profile wooden platform bed frame.',
    descriptionAr: 'إطار سرير خشبي بتصميم منخفض وبسيط.',
    image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=900&q=80',
    price: 2100,
    category: 'bedrooms'
  },
  {
    id: '8',
    name: 'Haven Canopy Bed',
    nameAr: 'سرير بمظلة هافن',
    description: 'Elegant canopy structure with sheer draping options.',
    descriptionAr: 'هيكل مظلة أنيق مع خيارات للستائر الشفافة.',
    image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=900&q=80',
    price: 3500,
    category: 'bedrooms'
  },
  {
    id: '9',
    name: 'Marble Core Dining Table',
    nameAr: 'طاولة طعام رخامية',
    description: 'Solid marble tabletop with brass finished legs.',
    descriptionAr: 'سطح طاولة من الرخام الصلب مع أرجل بلمسة نحاسية.',
    image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=900&q=80',
    price: 4500,
    category: 'dining'
  },
  {
    id: '10',
    name: 'Oak Extension Table',
    nameAr: 'طاولة بلوط قابلة للتوسعة',
    description: 'Versatile dining table that seats up to 12.',
    descriptionAr: 'طاولة طعام متعددة الاستخدامات تتسع حتى ١٢ شخصاً.',
    image: 'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&w=900&q=80',
    price: 2800,
    category: 'dining'
  },
  {
    id: '11',
    name: 'Art Deco Floor Lamp',
    nameAr: 'مصباح أرضي آرت ديكو',
    description: 'Geometric brass floor lamp to illuminate dark corners.',
    descriptionAr: 'مصباح أرضي نحاسي هندسي لإضاءة الزوايا المظلمة.',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
    price: 450,
    category: 'accents'
  },
  {
    id: '12',
    name: 'Abstract Wool Rug',
    nameAr: 'سجادة صوف تجريدية',
    description: 'Hand-tufted wool rug featuring modern art motifs.',
    descriptionAr: 'سجادة صوف معنقدة يدوياً تتميز بزخارف الفن الحديث.',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=80',
    price: 600,
    category: 'accents'
  }
];
