import DealerEnquiryForm from "./DealerEnquiryForm";

export default function DealerEnquiryPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl">Become a Dealer</h1>
        <p className="text-sm text-[#555555] dark:text-[#9A9A9A] mt-3 max-w-2xl">
          Tell us about your business and location. This is an enquiry intake only; approved dealer accounts can be added later without changing this flow.
        </p>
      </div>
      <DealerEnquiryForm />
    </main>
  );
}
