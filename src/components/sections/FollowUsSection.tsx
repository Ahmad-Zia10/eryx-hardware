import { SITE_CONFIG } from "@/constants";
import {
  InstagramMonoIcon,
  FacebookMonoIcon,
  YoutubeMonoIcon,
  LinkedinMonoIcon,
  PinterestMonoIcon,
} from "@/components/ui/SocialIcons";

// ─────────────────────────────────────────────────────────────────────
// Follow-us — animated "gradient menu".
//
// A centred row of squared social tiles on the Modernist warm-white
// ground. At rest each tile is a flat bordered square with a mono glyph;
// on hover it expands into that platform's brand gradient, the glyph
// scales out, the platform name scales in, and a soft blurred glow blooms
// beneath. Pure CSS interaction — no client JS, no new dependencies (the
// mono glyphs already live in SocialIcons.tsx).
//
// SHARED: used on both the home page and the Contact hub, so this single
// component keeps the two surfaces in sync. Order + gradients are defined
// here; handles/urls come from SITE_CONFIG.socialLinks.
// ─────────────────────────────────────────────────────────────────────

const ICONS = {
  instagram: InstagramMonoIcon,
  facebook: FacebookMonoIcon,
  youtube: YoutubeMonoIcon,
  linkedin: LinkedinMonoIcon,
  pinterest: PinterestMonoIcon,
} as const;

type Platform = keyof typeof ICONS;

// Per-platform brand gradients. Recognisably each brand, pulled a touch
// warm so the row reads as one palette rather than pure neon.
const GRADIENTS: Record<Platform, { from: string; to: string; label: string }> = {
  instagram: { from: "#f9557b", to: "#ee9b3a", label: "Instagram" },
  facebook: { from: "#3b5bdb", to: "#5a8cff", label: "Facebook" },
  youtube: { from: "#e0342b", to: "#ff6a4d", label: "YouTube" },
  linkedin: { from: "#0a66c2", to: "#3aa0e6", label: "LinkedIn" },
  pinterest: { from: "#c4472a", to: "#e86a4a", label: "Pinterest" },
};

// Canonical display order.
const ORDER: Platform[] = [
  "instagram",
  "facebook",
  "youtube",
  "linkedin",
  "pinterest",
];

export default function FollowUsSection() {
  const links = SITE_CONFIG.socialLinks;

  return (
    <section className="bg-surface-sunken border-y-2 border-line-strong py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-3.5">
            <span className="w-8 h-[2px] bg-gold" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-ink-faint font-extrabold">
              Follow us
            </span>
            <span className="w-8 h-[2px] bg-gold" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.02em] text-ink mt-4">
            Join the community.
          </h2>
          <p className="text-sm text-ink-muted mt-3 max-w-md leading-relaxed">
            New launches, events and exhibition updates. Hover to follow.
          </p>
        </div>

        <ul className="flex flex-wrap justify-center gap-4 mt-11">
          {ORDER.map((platform) => {
            const Icon = ICONS[platform];
            const meta = GRADIENTS[platform];
            const link = links[platform];
            if (!Icon || !link) return null;
            return (
              <li
                key={platform}
                style={
                  {
                    ["--from" as string]: meta.from,
                    ["--to" as string]: meta.to,
                  } as React.CSSProperties
                }
                className="group relative h-[60px] w-[60px] hover:w-[186px] bg-surface-raised border border-line shadow-[0_8px_20px_-6px_rgba(32,30,29,0.18)] hover:shadow-none flex items-center justify-center transition-all duration-500 ease-out"
              >
                {/* Gradient fill on hover */}
                <span className="absolute inset-0 bg-[linear-gradient(45deg,var(--from),var(--to))] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                {/* Blurred glow */}
                <span className="absolute top-[10px] inset-x-0 h-full bg-[linear-gradient(45deg,var(--from),var(--to))] blur-[15px] opacity-0 -z-10 transition-opacity duration-500 group-hover:opacity-50" />
                {/* Glyph (scales out) */}
                <span className="relative z-10 text-ink/55 transition-transform duration-500 group-hover:scale-0">
                  <Icon size={24} />
                </span>
                {/* Label (scales in) */}
                <span className="absolute z-10 text-white font-bold uppercase tracking-[0.08em] text-sm scale-0 transition-transform duration-500 delay-150 group-hover:scale-100">
                  {meta.label}
                </span>
                {/* Full-tile link */}
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Eryx on ${meta.label} — ${link.handle}`}
                  title={link.handle}
                  className="absolute inset-0 z-20"
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
