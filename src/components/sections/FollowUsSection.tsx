import { SITE_CONFIG } from "@/constants";
import {
  InstagramIcon,
  FacebookIcon,
  YoutubeIcon,
  LinkedinIcon,
  PinterestIcon,
} from "@/components/ui/SocialIcons";

const ICONS = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  youtube: YoutubeIcon,
  linkedin: LinkedinIcon,
  pinterest: PinterestIcon,
} as const;

type Platform = keyof typeof ICONS;

/**
 * Brand-consistent social strip. Colored brand glyphs on white pill tiles;
 * the tile lifts and the border turns gold on hover, keeping the platform
 * colors while integrating into Eryx's palette. Used on both the home page
 * and the Contact hub — extracted so the two surfaces stay in sync.
 */
export default function FollowUsSection() {
  const entries = Object.entries(SITE_CONFIG.socialLinks) as [
    Platform,
    { handle: string; url: string }
  ][];

  return (
    <section className="bg-[#F7F5F2] dark:bg-[#141414] border-t border-[#E8E4DD] dark:border-[#2A2A2A] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-serif text-2xl text-[#1A1A1A] dark:text-[#F5F5F5]">
            Follow Us
          </h2>
          <p className="text-sm text-[#6B6B6B] dark:text-[#9A9A9A] mt-2">
            Stay updated on new product launches, upcoming events and exhibition updates
          </p>
        </div>

        <ul className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {entries.map(([platform, { handle, url }]) => {
            const Icon = ICONS[platform];
            if (!Icon) return null;
            return (
              <li key={platform}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Eryx on ${platform} — ${handle}`}
                  title={handle}
                  className="group flex items-center gap-3 pl-2 pr-4 py-2 rounded-full bg-white dark:bg-[#1A1A1A] border border-[#E8E4DD] dark:border-[#2A2A2A] hover:border-[#D4A017] hover:-translate-y-0.5 hover:shadow-md transition duration-200 ease-in-out"
                >
                  <span className="w-9 h-9 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <Icon size={28} />
                  </span>
                  <span className="text-xs text-[#1A1A1A] dark:text-[#F5F5F5] group-hover:text-[#D4A017] transition-colors">
                    {handle}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
