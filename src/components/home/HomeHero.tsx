import HeroFloema from "./HeroFloema";
import HeroWarm from "./HeroWarm";

// ─────────────────────────────────────────────────────────────────────
// The home hero — ONE component, ONE switch.
//
// The page composes just `<HomeHero />` and never needs to change. To
// swap the hero treatment, flip HERO_VARIANT below:
//   "floema" → vertical scroll-slides (default)
//   "warm"   → single warm-ambient statement
// Both implementations ship; the swap is this one line.
// ─────────────────────────────────────────────────────────────────────

const HERO_VARIANT: "floema" | "warm" = "floema";

export default function HomeHero() {
  return HERO_VARIANT === "warm" ? <HeroWarm /> : <HeroFloema />;
}
