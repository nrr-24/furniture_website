'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRtl: boolean;
  t: (key: string) => string;
}

const translations = {
  en: {
    home: 'Home',
    collections: 'Collections',
    craftsmanship: 'Craftsmanship',
    shopCollections: 'Shop Collections',
    premiumCollections: 'Premium Furniture Collections',
    craftedLiving: 'Crafted for Refined Living',
    heroDesc: 'Where timeless design meets exceptional craftsmanship. Discover furniture that transforms your space into a sanctuary of comfort and elegance.',
    exploreCollections: 'Explore Collections',
    ourCraft: 'Our Craft',
    theCollection: 'The Collection',
    designedEveryRoom: 'Designed for Every Room',
    collectionDesc: 'Explore our curated selection of pieces designed to bring harmony and luxury to your home.',
    sofas: 'Sofas',
    sofasDesc: 'Comfort-driven silhouettes with strong presence.',
    bedrooms: 'Bedrooms',
    bedroomsDesc: 'Quiet luxury for restful spaces and comfort.',
    dining: 'Dining',
    diningDesc: 'Tables and chairs for memorable gatherings.',
    accents: 'Accents',
    accentsDesc: 'Selection of details that complete the room.',
    aboutTitle: 'A Legacy of Quality',
    aboutDesc: 'Our focus is on pieces that feel polished, durable, and visually calm. Every item is a testament to our commitment to material, form, and the art of living well.',
    discoverOurStory: 'Discover Our Story',
    switchLang: 'العربية'
  },
  ar: {
    home: 'الرئيسية',
    collections: 'المجموعات',
    craftsmanship: 'الحرفية',
    shopCollections: 'تسوق المجموعات',
    premiumCollections: 'مجموعات أثاث فاخرة',
    craftedLiving: 'صُمم لحياة راقية',
    heroDesc: 'حيث يلتقي التصميم الخالد مع الحرفية الاستثنائية. اكتشف الأثاث الذي يحول مساحتك إلى ملاذ من الراحة والأناقة.',
    exploreCollections: 'استكشف المجموعات',
    ourCraft: 'حرفتنا',
    theCollection: 'المجموعة',
    designedEveryRoom: 'مصمم لكل غرفة',
    collectionDesc: 'استكشف منطقتنا المختارة من القطع المصممة لجلب التناغم والفخامة إلى منزلك.',
    sofas: 'كنب',
    sofasDesc: 'تصاميم مريحة مع حضور بصري قوي.',
    bedrooms: 'غرف نوم',
    bedroomsDesc: 'فخامة هادئة لمساحات مريحة وراحة فائقة.',
    dining: 'طاولات طعام',
    diningDesc: 'طاولات وكراسي مصممة للقاءات لا تُنسى.',
    accents: 'قطع ديكور',
    accentsDesc: 'مجموعة من التفاصيل التي تكمل الغرفة.',
    aboutTitle: 'إرث من الجودة',
    aboutDesc: 'تركيزنا ينصب على القطع التي تبدو صقيلة ومتينة وهادئة بصرياً. كل قطعة هي شهادة على التزامنا بالمواد والشكل وفن الحياة الطيبة.',
    discoverOurStory: 'اكتشف قصتنا',
    switchLang: 'English'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string) => {
    return (translations[language] as any)[key] || key;
  };

  const isRtl = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRtl, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
