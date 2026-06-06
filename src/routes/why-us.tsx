import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ShieldCheck, Truck, Percent, Wrench, ChevronDown, Check } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/why-us")({
  head: () => ({
    meta: [
      { title: "Why Us — Pool Supply Wholesalers" },
      { name: "description", content: "Learn why over 5,000 pool service professionals and builders trust us for wholesale pool equipment, fast shipping, and technical support." }
    ],
  }),
  component: WhyUsPage,
});

const FAQS = [
  {
    q: "Who is eligible for wholesale dealer pricing?",
    a: "Our pricing is tailored for pool builders, service professionals, technicians, general contractors, and commercial facility operators. You can register for an account using your business tax ID or trade association credentials."
  },
  {
    q: "How fast do orders ship?",
    a: "Orders placed before 2 PM EST ship the same day from our nearest regional fulfillment warehouse. Average transit time is 1-3 business days. Freight shipments (heaters and large filter tanks) take 3-5 days."
  },
  {
    q: "Are these products covered by factory warranties?",
    a: "Yes! Because we are an authorized distributor for Pentair, Hayward, Jandy, and Raypak, every item we sell comes with the full manufacturer's warranty. Professional installation is generally required by manufacturers to maintain full coverage."
  },
  {
    q: "What is your return policy?",
    a: "We offer a 30-day return window for unused, uninstalled equipment in its original packaging. Please contact our support team to request an RMA number before shipping items back."
  }
];

function WhyUsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header alwaysDark />

      <main className="flex-1 pt-28 pb-20">
        {/* Why Us Hero */}
        <section className="bg-gradient-to-b from-surface to-background border-b border-border/50 py-16 mb-12">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <span className="text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-semibold">The Professional Choice</span>
            <h1 className="mt-3 text-4xl md:text-5xl font-black tracking-tight leading-none">Why Pool Professionals Trust Us</h1>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto leading-relaxed text-sm sm:text-base">
              We streamline wholesale equipment procurement for over 5,000 pool builders and service techs nationwide. Direct factory relationships, localized inventory, and certified tech support.
            </p>
          </div>
        </section>

        {/* Stats Dashboard */}
        <section className="mx-auto max-w-7xl px-6 mb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { val: "5,000+", label: "Active Pool Pros" },
              { val: "24 Hrs", label: "Avg. Fulfillment" },
              { val: "$15M+", label: "Client Energy Savings" },
              { val: "100%", label: "Genuine Parts" }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-surface rounded-3xl p-6 border border-border/60 text-center shadow-sm"
              >
                <div className="text-3xl sm:text-4xl font-black text-[oklch(0.50_0.14_232)] tracking-tight">{stat.val}</div>
                <div className="text-xs font-bold text-muted-foreground/80 mt-1.5 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Core Value Pillars */}
        <section className="mx-auto max-w-7xl px-6 mb-24 space-y-16">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight">Our Wholesale Commitments</h2>
            <p className="text-xs font-semibold text-muted-foreground mt-2 uppercase tracking-widest">Built to support your daily operations</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: "100% Authorized Distributor",
                desc: "We buy directly from the manufacturers. No liquidations, no gray-market serial numbers. You receive genuine hardware with fully backing manufacturer warranties and professional support channels."
              },
              {
                icon: Percent,
                title: "Wholesale-Only Pricing Structures",
                desc: "Save up to 40% off standard MSRP retail rates. Our pricing is restricted to industry professionals, ensuring you preserve your margins when reselling equipment to homeowners."
              },
              {
                icon: Truck,
                title: "Lightning-Fast Logistics",
                desc: "Operated out of 4 major distribution hubs across the country (TN, CA, TX, FL). We ship fast and offer free standard shipping on orders over $500 to keep your jobs on schedule."
              },
              {
                icon: Wrench,
                title: "Certified Technical Advisors",
                desc: "Confused about flow hydraulics or heaters sizing? Our in-house technical support team consists of former certified pool technicians ready to audit your equipment designs before purchase."
              }
            ].map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="bg-white rounded-3xl p-8 border border-border hover:shadow-[var(--shadow-soft)] transition flex gap-5"
                >
                  <div className="size-12 rounded-2xl bg-gradient-ocean text-white grid place-items-center shrink-0 shadow-md">
                    <Icon className="size-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-lg tracking-tight text-foreground">{pillar.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xs font-semibold text-muted-foreground mt-1.5 uppercase tracking-widest">Everything you need to know about dealer accounts</p>
          </div>

          <div className="border border-border/80 rounded-[2rem] overflow-hidden bg-white divide-y divide-border/60">
            {FAQS.map((faq, i) => (
              <div key={i} className="overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left font-bold text-sm text-foreground hover:bg-surface/40 transition"
                >
                  {faq.q}
                  <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-300 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
