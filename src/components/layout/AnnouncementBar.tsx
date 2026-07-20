export default function AnnouncementBar() {
  // No flag emoji: Windows renders 🇩🇪 as the letters "DE", which read
  // as a typo. The gold lead-in carries the emphasis instead.
  // NOTE: keep py-2 + text-sm — the Navbar's sticky offset (top-9.25)
  // is tuned to this bar's rendered height.
  return (
    <div className="sticky top-0 z-50 w-full bg-brand-dark text-sm text-center py-2 px-4 tracking-wide">
      <span className="text-gold font-medium">German Technology</span>
      <span className="text-white/70">
        {" "}
        · Premium Kitchen &amp; Wardrobe Hardware · Pan India Delivery
      </span>
    </div>
  );
}
