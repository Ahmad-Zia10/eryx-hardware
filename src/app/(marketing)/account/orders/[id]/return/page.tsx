import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Mail,
  Phone,
  RotateCcw,
} from "lucide-react";
import { createClient, supabaseAdmin } from "@/lib/supabase/server";
import { SITE_CONFIG } from "@/constants";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Short, human-quotable order reference — matches the format shown in
// the account order list (AccountTabs.tsx uses `order.id.split('-')[0]`).
function shortOrderRef(id: string): string {
  return id.split("-")[0].toUpperCase();
}

// Digits-only phone for the tel: link. SITE_CONFIG.phone is stored
// human-formatted (with spaces); tel: needs bare digits + country code.
function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `tel:+91${digits}`;
}

export default async function ReturnOrderPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already redirects unauthenticated users away from
  // /account/**, but re-checking here matches the defense-in-depth
  // pattern used elsewhere in the account surface.
  if (!user) {
    redirect(`/login?next=/account/orders/${id}/return`);
  }

  // Ownership check by filtering on customer_id — a UUID guesser
  // hitting someone else's order id lands on the "not found" branch,
  // not on a return page they shouldn't see.
  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("id, status, created_at, total, customer_id")
    .eq("id", id)
    .eq("customer_id", user.id)
    .maybeSingle();

  // Order missing or not owned by this user.
  if (!order) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-gold-deep mb-8"
        >
          <ArrowLeft size={14} /> Back to account
        </Link>
        <div className="border border-line rounded-card p-8 text-center">
          <h1 className="font-serif text-2xl text-ink">
            Order not found
          </h1>
          <p className="text-sm text-ink-muted mt-3">
            We couldn&apos;t find that order under your account.
          </p>
        </div>
      </main>
    );
  }

  // Order exists but isn't delivered → button-gating bypass. Show a
  // friendly ineligible state instead of the return-instructions layout.
  if (order.status !== "delivered") {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-gold-deep mb-8"
        >
          <ArrowLeft size={14} /> Back to account
        </Link>
        <div className="border border-line rounded-card p-8">
          <span className="text-xs tracking-[0.3em] uppercase text-gold-deep">
            Return Order
          </span>
          <h1 className="font-serif text-2xl md:text-3xl text-ink mt-3">
            This order isn&apos;t eligible for return
          </h1>
          <p className="text-sm text-ink-muted mt-4 leading-relaxed">
            Returns can only be started once your order has been delivered.
            Order <span className="font-mono">{shortOrderRef(order.id)}</span>{" "}
            is currently{" "}
            <span className="font-medium text-ink">
              {order.status}
            </span>
            . If you need help with this order, use the &ldquo;Need Help?&rdquo;
            option under it in your account.
          </p>
          <Link
            href="/account"
            className="inline-block mt-6 border border-gold text-gold-deep hover:bg-gold hover:text-on-gold px-5 py-2 text-sm font-semibold transition duration-200 ease-in-out rounded-control"
          >
            Back to your orders
          </Link>
        </div>
      </main>
    );
  }

  // Happy path — delivered order.
  const reference = shortOrderRef(order.id);

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <Link
        href="/account"
        className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-gold-deep mb-8"
      >
        <ArrowLeft size={14} /> Back to your orders
      </Link>

      <div className="flex items-start gap-4">
        <div className="w-11 h-11 flex items-center justify-center rounded-control bg-surface-sunken shrink-0">
          <RotateCcw className="text-gold-deep" size={22} />
        </div>
        <div>
          <span className="text-xs tracking-[0.3em] uppercase text-gold-deep">
            Return Order
          </span>
          <h1 className="font-serif text-2xl md:text-3xl text-ink mt-2">
            How to return this order
          </h1>
        </div>
      </div>

      <p className="text-sm md:text-base text-ink-muted mt-6 leading-relaxed max-w-2xl">
        Returns are handled by our customer support team. Call or email us
        with your order reference below to start the process.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        <a
          href={telHref(SITE_CONFIG.phone)}
          className="group flex flex-col gap-4 bg-surface-raised border border-line hover:border-gold hover:shadow-lg dark:hover:shadow-[0_12px_40px_rgba(212,160,23,0.15)] hover:-translate-y-0.5 transition duration-200 ease-in-out rounded-card p-6"
        >
          <div className="w-11 h-11 flex items-center justify-center rounded-control bg-surface-sunken group-hover:bg-gold/10 transition-colors">
            <Phone className="text-gold-deep" size={22} />
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase text-ink-faint">
              Call us
            </p>
            <p className="text-lg font-semibold text-ink mt-1">
              {SITE_CONFIG.phone}
            </p>
          </div>
        </a>

        <a
          href={`mailto:${SITE_CONFIG.email}?subject=Return%20for%20order%20${reference}`}
          className="group flex flex-col gap-4 bg-surface-raised border border-line hover:border-gold hover:shadow-lg dark:hover:shadow-[0_12px_40px_rgba(212,160,23,0.15)] hover:-translate-y-0.5 transition duration-200 ease-in-out rounded-card p-6"
        >
          <div className="w-11 h-11 flex items-center justify-center rounded-control bg-surface-sunken group-hover:bg-gold/10 transition-colors">
            <Mail className="text-gold-deep" size={22} />
          </div>
          <div>
            <p className="text-[10px] tracking-widest uppercase text-ink-faint">
              Email us
            </p>
            <p className="text-lg font-semibold text-ink mt-1 break-all">
              {SITE_CONFIG.email}
            </p>
          </div>
        </a>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 border border-line rounded-card p-4 bg-surface-sunken">
          <Clock className="text-gold-deep shrink-0" size={18} />
          <div>
            <p className="text-[10px] tracking-widest uppercase text-ink-faint">
              Support hours
            </p>
            <p className="text-sm text-ink font-medium">
              Mon–Sat, 9:30 AM – 6 PM
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 border border-line rounded-card p-4 bg-surface-sunken">
          <RotateCcw className="text-gold-deep shrink-0" size={18} />
          <div>
            <p className="text-[10px] tracking-widest uppercase text-ink-faint">
              Order reference
            </p>
            <p className="text-sm text-ink font-mono font-medium">
              {reference}
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-ink-muted mt-8 max-w-2xl leading-relaxed">
        Our team will confirm the return, arrange pickup where available, and
        process the refund once the item is received.
      </p>
    </main>
  );
}
