import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { DISTRIBUTION_HUBS } from "@/lib/hubs-content";
import {
  MapPin,
  Truck,
  Clock,
  Phone,
  ShieldCheck,
  ChevronRight,
  Building2,
  Package,
  Layers,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/hubs/")({
  head: () => {
    const pageUrl = "https://poolsupplywholesalers.com/hubs";

    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://poolsupplywholesalers.com",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Regional Distribution Hubs",
          item: pageUrl,
        },
      ],
    };

    const hubListLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Pool Supply Wholesalers Regional Logistics Depots",
      description:
        "Regional commercial pool equipment distribution centers providing same-day freight dispatch and contractor will-call in Nashville, Dallas, Orlando, and Los Angeles.",
      url: pageUrl,
      numberOfItems: DISTRIBUTION_HUBS.length,
      itemListElement: DISTRIBUTION_HUBS.map((h, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: h.name,
        url: `https://poolsupplywholesalers.com/hubs/${h.slug}`,
      })),
    };

    const faqLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Where are Pool Supply Wholesalers distribution hubs located?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Pool Supply Wholesalers operates 4 regional distribution hubs across the United States: Nashville, TN (Corporate HQ & Central Logistics Depot), Dallas, TX (South Central Regional Center), Orlando, FL (Southeast Coastal Depot), and Los Angeles, CA (West Coast Distribution Hub).",
          },
        },
        {
          "@type": "Question",
          name: "What is the freight transit time to job sites?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Orders placed before 2:00 PM local hub time ship same day. With 4 strategically located depots, 98% of the continental United States receives ground delivery within 1 to 2 business days. Heavy commercial freight items ship on palletized trucks with optional liftgate service.",
          },
        },
        {
          "@type": "Question",
          name: "Can licensed pool contractors pick up equipment via will-call?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Trade accounts and licensed contractors can stage will-call pickups at any of our 4 distribution hubs. Contact our wholesale desk at (802) 265-0320 prior to arrival to confirm inventory and staged dock loading.",
          },
        },
      ],
    };

    return {
      meta: [
        {
          title:
            "Regional Distribution Hubs & Logistics Depots | Pool Supply Wholesalers",
        },
        {
          name: "description",
          content:
            "Find our commercial pool equipment distribution hubs in Nashville TN, Dallas TX, Orlando FL, and Los Angeles CA. Same-day freight dispatch and contractor will-call.",
        },
        {
          name: "keywords",
          content:
            "wholesale pool supplies distribution, commercial pool equipment warehouse, pool distributor Nashville TN, pool supplier Dallas TX, wholesale pool pumps Orlando, pool equipment distributor Los Angeles",
        },
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
        { property: "og:title", content: "Regional Wholesale Distribution Hubs & Depots" },
        {
          property: "og:description",
          content:
            "Strategic commercial pool equipment depots in Nashville, Dallas, Orlando, and Los Angeles. Fast 1-2 day nationwide jobsite freight.",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: pageUrl },
        { property: "og:site_name", content: "Pool Supply Wholesalers" },
        { property: "og:image", content: "https://poolsupplywholesalers.com/about-hero.png" },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: "Pool Supply Wholesalers Regional Distribution Hubs" },
        { property: "og:locale", content: "en_US" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@poolsupplywholesalers" },
        { name: "twitter:creator", content: "@poolsupplywholesalers" },
        { name: "twitter:title", content: "Regional Wholesale Distribution Hubs & Depots" },
        {
          name: "twitter:description",
          content:
            "Strategic commercial pool equipment depots in Nashville, Dallas, Orlando, and Los Angeles. Fast 1-2 day nationwide jobsite freight.",
        },
        { name: "twitter:image", content: "https://poolsupplywholesalers.com/about-hero.png" },
      ],
      links: [{ rel: "canonical", href: pageUrl }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(breadcrumbLd) },
        { type: "application/ld+json", children: JSON.stringify(hubListLd) },
        { type: "application/ld+json", children: JSON.stringify(faqLd) },
      ],
    };
  },
  component: HubsIndexPage,
});

function HubsIndexPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="flex-1 pb-24">
        {/* Hero Section */}
        <section className="bg-slate-900 pt-32 pb-20 text-white relative overflow-hidden border-b border-slate-800">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400 via-blue-600 to-slate-950"></div>
          <div className="container relative mx-auto px-4 text-center max-w-5xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/50 px-4 py-1.5 text-xs font-semibold text-cyan-400 mb-6">
              <Building2 className="size-3.5" />
              <span>4 Strategic Logistics Facilities Nationwide</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
              Regional Commercial Distribution Hubs
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Serving pool builders, commercial aquatic facilities, and service technicians
              nationwide. Orders placed before 2:00 PM ship same day from our nearest regional depot,
              reaching 98% of continental U.S. job sites in 1–2 business days.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-slate-300">
              <div className="flex items-center gap-2">
                <Truck className="size-4 text-cyan-400" />
                <span>Same-Day LTL Freight Dispatch</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="size-4 text-cyan-400" />
                <span>Contractor Will-Call Bays</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-cyan-400" />
                <span>100% Authorized OEM Inventory</span>
              </div>
            </div>
          </div>
        </section>

        {/* Hubs Cards Grid */}
        <section className="container mx-auto px-4 max-w-7xl -mt-8 relative z-10">
          <div className="grid gap-8 md:grid-cols-2">
            {DISTRIBUTION_HUBS.map((hub) => (
              <div
                key={hub.slug}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div className="p-6 md:p-8">
                  {/* Header Badge & City */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700 mb-2 border border-cyan-200/60">
                        <Building2 className="size-3 text-cyan-600" />
                        {hub.badge}
                      </span>
                      <h2 className="text-2xl font-black text-slate-900">
                        {hub.city}, {hub.state}
                      </h2>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                        {hub.region}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
                        <Clock className="size-3" />
                        1–2 Day Delivery
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    {hub.description}
                  </p>

                  {/* Key Logistics Specs */}
                  <div className="space-y-3 pt-4 border-t border-slate-100 text-xs text-slate-700">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="size-4 text-cyan-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900">Depot Address: </span>
                        <span>{hub.address}, {hub.city}, {hub.state} {hub.zip}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Clock className="size-4 text-cyan-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900">Will-Call Hours: </span>
                        <span>{hub.willCallHours}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <Truck className="size-4 text-cyan-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900">Freight Coverage: </span>
                        <span>{hub.coverageStates.join(", ")}</span>
                      </div>
                    </div>
                  </div>

                  {/* Specialized Staged Equipment Pills */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Staged Regional Equipment:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {hub.specializedEquipment.map((eq) => (
                        <span
                          key={eq.title}
                          className="inline-block bg-slate-100 text-slate-700 text-[11px] px-2.5 py-1 rounded-md font-medium"
                        >
                          {eq.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                    <Phone className="size-3.5 text-cyan-600" />
                    <span>{hub.phone}</span>
                  </div>

                  <Link
                    to="/hubs/$hub"
                    params={{ hub: hub.slug }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 hover:text-cyan-700 transition-colors group"
                  >
                    <span>View Depot Details</span>
                    <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Wholesale Transit Network Advantages */}
        <section className="container mx-auto px-4 max-w-6xl mt-20">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-700">
            <div className="max-w-3xl">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-2">
                Contractor Logistics Network
              </span>
              <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                How Our Multi-Hub Network Saves You Time and Money
              </h3>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8">
                Commercial pool construction and maintenance projects run on tight deadlines.
                Operating four regional warehouses allows us to stage thousands of tons of high-demand
                commercial pumps, heaters, and filtration tanks close to your jobs.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <Truck className="size-8 text-cyan-400 mb-3" />
                <h4 className="font-bold text-base text-white mb-2">Same-Day Dispatch</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Orders placed before 2:00 PM local hub time are loaded onto freight carriers same day.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <Building2 className="size-8 text-cyan-400 mb-3" />
                <h4 className="font-bold text-base text-white mb-2">Contractor Will-Call</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Emergency replacement needs? Verified accounts can pick up staged equipment directly at our loading docks.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <Package className="size-8 text-cyan-400 mb-3" />
                <h4 className="font-bold text-base text-white mb-2">Palletized Freight</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Heavy commercial items like gas heaters and filter tanks ship wrapped on wood pallets with available liftgate trucks.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <ShieldCheck className="size-8 text-cyan-400 mb-3" />
                <h4 className="font-bold text-base text-white mb-2">Tax-Exempt Trade Accounts</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Submit your state resale certificate to purchase commercial supplies without sales tax.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Commercial Logistics FAQ */}
        <section className="container mx-auto px-4 max-w-4xl mt-20">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Distribution & Contractor Logistics FAQs
            </h3>
            <p className="text-sm text-slate-500 mt-2">
              Common questions about our shipping schedules, will-call bays, and freight terms.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h4 className="text-base font-bold text-slate-900 mb-2">
                Can I pick up equipment today from the Nashville, Dallas, Orlando, or LA warehouse?
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Yes. If an item is in stock at your local regional hub, verified trade accounts can arrange same-day dock pickup. Call our wholesale desk at (802) 265-0320 to confirm inventory allocation and schedule your loading window.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h4 className="text-base font-bold text-slate-900 mb-2">
                How is heavy equipment like 400k BTU gas heaters delivered to commercial sites?
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Commercial gas heaters, commercial pumps, and large filter tanks are strapped to custom pallets and dispatched via specialized LTL freight carriers. When requested at checkout, delivery trucks include hydraulic liftgates to lower equipment smoothly to ground level.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <h4 className="text-base font-bold text-slate-900 mb-2">
                How do I set up a state tax-exempt resale certificate for my trade account?
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Send a copy of your state resale certificate (e.g. TN Blanket Certificate of Resale, Texas Form 01-339, Florida DR-13, or California CDTFA-230) to sales@poolsupplywholesalers.com. Our accounts desk activates your tax-free account within 1 business hour.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
