export default function AnnouncementBar() {
  // NOTE: keep py-2 + text-sm — the Navbar's sticky offset (top-9.25)
  // is tuned to this bar's rendered height.
  return (
    <div className="sticky top-0 z-50 w-full bg-brand-dark text-sm text-center py-2 px-4 tracking-[0.08em]">
      <span className="text-brand-cream/75">
        Premium Kitchen &amp; Wardrobe Hardware · Pan India Delivery
      </span>
    </div>
  );
}
