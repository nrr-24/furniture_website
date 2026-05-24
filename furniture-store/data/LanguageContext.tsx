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
    // === Legacy keys (kept; used by /about, /shop, older Navbar refs) ===
    home: 'Home',
    collections: 'Collections',
    craftsmanship: 'About Us',
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
    switchLang: 'العربية',
    currency: 'K.D',

    // === 2026 redesign keys ===
    // Brand / shared
    smartwood: 'SmartWood',
    smartwoodFactory: 'SmartWood Factory',
    allRightsReserved: 'All rights reserved.',
    kwd: 'KWD',

    // Common CTAs (reused across hero, sections, banners)
    discoverCraftsmanship: 'Discover Craftsmanship',
    learnMore: 'Learn More',
    learnOurStory: 'Learn Our Story',
    addToCart: 'ADD TO CART',
    getQuote: 'GET QUOTE',
    wishlistCta: 'WISHLIST',
    checkout: 'Checkout',

    // Homepage section titles
    heroLine1: 'Built to last.',
    heroLine2: 'Made to inspire.',
    heroBody: 'SmartWood factory has been a leader in the kuwaiti high-end furniture for more than 26 years.',
    ourPromise: 'OUR PROMISE',
    excellenceTitle: 'Excellence in Every Detail',
    livingTitle: 'Designed for Living. Crafted for Life.',
    proudlyKuwaitiL1: 'Proudly Kuwaiti.',
    proudlyKuwaitiL2: 'Globally Inspired.',
    qualityTitle: 'German Quality. Timeless Strength.',
    collectionTitle: 'SmartWood Collection',
    compareTitle: 'Compare Our Models',
    quote: "We don't just build furniture, we craft legacy.",
    yearsOf: 'YEARS OF',
    excellence: 'EXCELLENCE',
    est1998: 'EST. 1998',

    // Footer
    stayInspired: 'Stay Inspired',
    newsletterSub: 'Subscribe to get the latest designs and updates from SmartWood.',
    enterEmail: 'Enter your email',
    thanksSubscribing: 'Thanks for subscribing!',
    showroom: 'Showroom',
    contact: 'Contact',
    faq: 'FAQ',
    corporate: 'Corporate',
  },
  ar: {
    // === Legacy keys ===
    home: 'الرئيسية',
    collections: 'المجموعات',
    craftsmanship: 'من نحن',
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
    switchLang: 'English',
    currency: 'د.ك',

    // === 2026 redesign keys ===
    smartwood: 'سمارت وود',
    smartwoodFactory: 'مصنع سمارت وود',
    allRightsReserved: 'جميع الحقوق محفوظة.',
    kwd: 'د.ك',

    discoverCraftsmanship: 'اكتشف الحرفية',
    learnMore: 'اقرأ المزيد',
    learnOurStory: 'اكتشف قصتنا',
    addToCart: 'أضف إلى العربة',
    getQuote: 'طلب عرض سعر',
    wishlistCta: 'المفضلة',
    checkout: 'إتمام الطلب',

    heroLine1: 'صُنع ليدوم.',
    heroLine2: 'خُلق ليلهم.',
    heroBody: 'مصنع سمارت وود هو رائد في الكويت في صناعة الأثاث الفاخر منذ أكثر من 26 سنة.',
    ourPromise: 'وعدنا',
    excellenceTitle: 'تميّز في كل تفصيل',
    livingTitle: 'مصمم للحياة. مصنوع للأبد.',
    proudlyKuwaitiL1: 'كويتيون بفخر.',
    proudlyKuwaitiL2: 'ملهَمون عالمياً.',
    qualityTitle: 'جودة ألمانية. متانة خالدة.',
    collectionTitle: 'مجموعة سمارت وود',
    compareTitle: 'قارن بين موديلاتنا',
    quote: 'نحن لا نصنع أثاثاً فقط، نحن نصنع إرثاً.',
    yearsOf: 'سنوات من',
    excellence: 'التميّز',
    est1998: 'تأسس 1998',

    stayInspired: 'ابقَ ملهَماً',
    newsletterSub: 'اشترك ليصلك أحدث التصاميم والمستجدات من سمارت وود.',
    enterEmail: 'بريدك الإلكتروني',
    thanksSubscribing: 'شكراً لاشتراكك!',
    showroom: 'صالة العرض',
    contact: 'تواصل',
    faq: 'الأسئلة الشائعة',
    corporate: 'الشركة',
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
