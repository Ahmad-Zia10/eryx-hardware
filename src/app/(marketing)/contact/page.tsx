import { Mail, MapPin, Phone } from "lucide-react";
import { SITE_CONFIG } from "@/constants";
import ContactForm from "./ContactForm";

export default function ContactPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-3xl md:text-4xl text-[#0A0A0A] dark:text-[#F5F5F5]">Contact Us</h1>
        <p className="text-sm text-[#555555] dark:text-[#9A9A9A] mt-3 max-w-2xl">
          Questions about products, orders, dealership, or partnerships? Send us a note and the right team will respond.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-8">
        <aside className="space-y-4">
          <div className="border border-[#D4D4D4] dark:border-[#2A2A2A] rounded-sm p-5">
            <Phone className="text-[#D4A017] mb-3" size={22} />
            <p className="font-semibold">Phone</p>
            <a href="tel:+917011184853" className="text-sm text-[#555555] dark:text-[#9A9A9A] hover:text-[#D4A017]">{SITE_CONFIG.phone}</a>
          </div>
          <div className="border border-[#D4D4D4] dark:border-[#2A2A2A] rounded-sm p-5">
            <Mail className="text-[#D4A017] mb-3" size={22} />
            <p className="font-semibold">Email</p>
            <a href={`mailto:${SITE_CONFIG.email}`} className="text-sm text-[#555555] dark:text-[#9A9A9A] hover:text-[#D4A017]">{SITE_CONFIG.email}</a>
          </div>
          <div className="border border-[#D4D4D4] dark:border-[#2A2A2A] rounded-sm p-5">
            <MapPin className="text-[#D4A017] mb-3" size={22} />
            <p className="font-semibold">Availability</p>
            <p className="text-sm text-[#555555] dark:text-[#9A9A9A]">Monday to Saturday, 9:30 AM to 6 PM</p>
          </div>
        </aside>
        <ContactForm />
      </div>
    </main>
  );
}
