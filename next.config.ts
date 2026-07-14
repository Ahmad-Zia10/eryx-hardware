import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Contact page action cards still use Unsplash URLs as stopgaps
    // until brand-approved photography lands. Hero slides and the
    // /kitchen background are self-hosted under /public/products/hero/.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    // Next.js 16 restricts `quality` on <Image> to values listed here
    // (default is [75] only). HeroSlider uses 80 for the lifestyle
    // shots — allow both.
    qualities: [75, 80],
  },
};

export default nextConfig;
