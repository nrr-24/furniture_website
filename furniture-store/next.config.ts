import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    // Serve images directly instead of through Vercel's Image Optimization.
    // The Hobby plan's optimization quota is limited; once exhausted the
    // optimizer returns HTTP 402 and every <Image> breaks site-wide. Serving
    // the originals (which are already reasonably sized) avoids that entirely.
    unoptimized: true,
    // Admins can paste arbitrary image URLs for projects/products, so allow
    // any https host. The Supabase storage bucket is covered by this too.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  compress: true,
};

export default nextConfig;
