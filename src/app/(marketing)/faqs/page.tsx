import FAQSearch from './FAQSearch';

export default function FAQsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-3xl text-[#0A0A0A] dark:text-[#F5F5F5]">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-[#555555] dark:text-[#9A9A9A] mt-2">
          Find answers to common questions about our products, orders, and support.
        </p>
      </div>
      <FAQSearch />
    </div>
  );
}
