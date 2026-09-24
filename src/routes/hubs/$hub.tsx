import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { getHubBySlug, DISTRIBUTION_HUBS } from "@/lib/hubs-content";
import {
  MapPin,
  Truck,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  ChevronRight,
  Building2,
  Package,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";

export const Route = createFileRoute("/hubs/$hub")({
  loader: ({ params }) => {
    const hub = getHubBySlug(params.hub);
    if (!hub) throw notFound();
    return { hub };
  },
  head: ({ loaderData }) => {
    const hub = loaderData?.hub;
    if (!hub) return {};

    const pageUrl = `https://poolsupplywholesalers.com/hubs/${hub.slug}`;

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
          item: "https://poolsupplywholesalers.com/hubs",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: `${hub.city}, ${hub.state} Depot`,
          item: pageUrl,
        },
      ],
    };

    const warehouseLd = {
      "@context": "https://schema.org",
      "@type": ["WholesaleStore", "LocalBusiness", "Warehouse"],
      name: `Pool Supply Wholesalers — ${hub.name}`,
      url: pageUrl,
      telephone: "+1-802-265-0320",
      email: hub.email,
      image: "https://poolsupplywholesalers.com/about-hero.png",
      priceRange: "$$",
      description: hub.description,
      address: {
        "@type": "PostalAddress",
        streetAddress: hub.address,
        addressLocality: hub.city,
        addressRegion: hub.state,
        postalCode: hub.zip,
        addressCountry: "US",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: hub.lat,
        longitude: hub.lng,
      },
      areaServed: hub.coverageStates.map((st) => ({
        "@type": "AdministrativeArea",
        name: st,
      })),
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "07:00",
          closes: "17:00",
        },
      ],
      parentOrganization: {
        "@type": "Organization",
        name: "Pool Supply Wholesalers",
        url: "https://poolsupplywholesalers.com",
        logo: "https://poolsupplywholesalers.com/logo.png",
      },
    };

    const faqLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: hub.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    };

    return {
      meta: [
        { title: hub.metaTitle },
        { name: "description", content: hub.metaDescription },
        {
          name: "keywords",
          content: `wholesale pool supplies ${hub.city} ${hub.state}, pool equipment distributor ${hub.city}, commercial pool pumps ${hub.state}, pool heater warehouse ${hub.city}, contractor pool supply depot ${hub.stateFull}`,
        },
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
        { property: "og:title", content: hub.metaTitle },
        { property: "og:description", content: hub.metaDescription },
        { property: "og:type", content: "website" },
        { property: "og:url", content: pageUrl },
        { property: "og:site_name", content: "Pool Supply Wholesalers" },
        { property: "og:image", content: "https://poolsupplywholesalers.com/about-hero.png" },
        { property: "og:image:type", content: "image/png" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: hub.metaTitle },
        { property: "og:locale", content: "en_US" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@poolsupplywholesalers" },
        { name: "twitter:creator", content: "@poolsupplywholesalers" },
        { name: "twitter:title", content: hub.metaTitle },
        { name: "twitter:description", content: hub.metaDescription },
        { name: "twitter:image", content: "https://poolsupplywholesalers.com/about-hero.png" },
      ],
      links: [{ rel: "canonical", href: pageUrl }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(breadcrumbLd) },
        { type: "application/ld+json", children: JSON.stringify(warehouseLd) },
        { type: "application/ld+json", children: JSON.stringify(faqLd) },
      ],
    };
  },
  component: HubDetailPage,
});

function HubDetailPage() {
  const { hub } = Route.useLoaderData();
  const siblingHubs = DISTRIBUTION_HUBS.filter((h) => h.slug !== hub.slug);

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="flex-1 pb-24">
        {/* Breadcrumb Navigation */}
        <div className="bg-slate-900 border-b border-slate-800 py-3">
          <div className="container mx-auto px-4 max-w-6xl">
            <nav className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <Link to="/" className="hover:text-cyan-400 transition-colors">
                Home
              </Link>
              <ChevronRight className="size-3" />
              <Link to="/hubs" className="hover:text-cyan-400 transition-colors">
                Distribution Hubs
              </Link>
              <ChevronRight className="size-3" />
              <span className="text-white font-semibold">
                {hub.city}, {hub.state}
              </span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-slate-900 py-16 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400 via-blue-700 to-slate-950"></div>
          <div className="container relative mx-auto px-4 max-w-6xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/60 px-3.5 py-1 text-xs font-semibold text-cyan-400 mb-4">
                  <Building2 className="size-3.5" />
                  <span>{hub.badge}</span>
                </div>

                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
                  {hub.name}
                </h1>

                <p className="text-base md:text-lg text-slate-300 leading-relaxed hub-intro">
                  {hub.headline}
                </p>

                {/* Quick Action Buttons */}
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href={`tel:${hub.phone.replace(/[^0-9]/g, "")}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-sm transition-all shadow-lg shadow-cyan-500/25 active:scale-95"
                  >
                    <Phone className="size-4" />
                    <span>Call Dispatch: {hub.phone}</span>
                  </a>

                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-colors"
                  >
                    <span>Request Jobsite Freight Quote</span>
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>

              {/* Quick Logistics Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 lg:max-w-sm w-full backdrop-blur-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block mb-3">
                  Depot Fast Facts
                </span>
                <div className="space-y-3.5 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="size-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white">Facility: </span>
                      <span>{hub.address}, {hub.city}, {hub.state} {hub.zip}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Truck className="size-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white">Freight Dispatch: </span>
                      <span>Same-Day (Cutoff 2:00 PM {hub.state === "FL" ? "EST" : hub.state === "CA" ? "PST" : "CST"})</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Clock className="size-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white">Will-Call: </span>
                      <span>{hub.willCallHours}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="size-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white">Trade Support: </span>
                      <span>Tax-Exempt Wholesale Resale Setup</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content & Logistics Breakdown */}
        <section className="container mx-auto px-4 max-w-6xl mt-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Main Hub Content */}
            <div className="lg:col-span-2 space-y-10">
              {/* Detailed Facility Profile */}
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  About Our {hub.city} Logistics Depot
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {hub.description}
                </p>

                <div className="bg-cyan-50/60 rounded-xl p-5 border border-cyan-100 mb-6">
                  <h3 className="text-sm font-bold text-cyan-950 mb-2 flex items-center gap-2">
                    <Truck className="size-4 text-cyan-700" />
                    <span>Regional Transit Times & Freight Coverage</span>
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed hub-transit-summary">
                    {hub.transitTimes}
                  </p>
                </div>

                {/* Covered States Grid */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                    Primary Regional Delivery Service Area:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {hub.coverageStates.map((st) => (
                      <span
                        key={st}
                        className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors"
                      >
                        <CheckCircle2 className="size-3 text-cyan-600" />
                        {st}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Will-Call & Loading Protocol */}
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="size-5 text-cyan-600" />
                  <h2 className="text-xl font-bold text-slate-900">
                    Contractor Will-Call & Pickup Bay
                  </h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {hub.willCallNote}
                </p>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 space-y-2">
                  <p>
                    <strong>Receiving Hours:</strong> {hub.willCallHours}
                  </p>
                  <p>
                    <strong>Vehicle Clearance:</strong> High-cube docks compatible with box trucks, flatbeds, and commercial contractor trailers. Forklift operators assist with heavy pallet placement.
                  </p>
                </div>
              </div>

              {/* Regional Code Compliance */}
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="size-5 text-emerald-600" />
                  <h2 className="text-xl font-bold text-slate-900">
                    {hub.regionalRegulations.title}
                  </h2>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {hub.regionalRegulations.desc}
                </p>
              </div>

              {/* Staged Equipment Categories */}
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Primary Staged Equipment in {hub.city}
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {hub.specializedEquipment.map((eq) => (
                    <Link
                      key={eq.title}
                      to={eq.link as any}
                      className="group p-4 rounded-xl border border-slate-200 hover:border-cyan-400 hover:bg-cyan-50/20 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-cyan-600 transition-colors mb-1.5 flex items-center justify-between">
                          <span>{eq.title}</span>
                          <ChevronRight className="size-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed">{eq.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Regional FAQ */}
              <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  {hub.city} Contractor & Logistics FAQs
                </h2>
                <div className="space-y-4">
                  {hub.faq.map((item) => (
                    <div key={item.q} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                      <h3 className="font-bold text-sm text-slate-900 mb-1.5">{item.q}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Commercial Desk Sidebar & Sibling Hubs */}
            <div className="space-y-6">
              {/* Commercial Trade Desk Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 border border-slate-700 shadow-lg">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-2">
                  Direct Trade Desk
                </span>
                <h3 className="text-lg font-black text-white mb-2">
                  {hub.city} Commercial Dispatch
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  Need volume pallet pricing, emergency equipment hold, or custom delivery staging? Contact our regional coordinator.
                </p>

                <div className="space-y-3 mb-6">
                  <a
                    href={`tel:${hub.phone.replace(/[^0-9]/g, "")}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors text-xs font-semibold"
                  >
                    <Phone className="size-4 text-cyan-400 shrink-0" />
                    <span>{hub.phone}</span>
                  </a>

                  <a
                    href={`mailto:${hub.email}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors text-xs font-semibold"
                  >
                    <Mail className="size-4 text-cyan-400 shrink-0" />
                    <span>{hub.email}</span>
                  </a>
                </div>

                <Link
                  to="/contact"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  <span>Submit Commercial RFQ</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>

              {/* Sibling Hubs Navigation */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs">
                  Other Regional Distribution Hubs
                </h3>
                <div className="space-y-3">
                  {siblingHubs.map((sibling) => (
                    <Link
                      key={sibling.slug}
                      to="/hubs/$hub"
                      params={{ hub: sibling.slug }}
                      className="group block p-3 rounded-xl border border-slate-100 hover:border-cyan-300 hover:bg-cyan-50/30 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 group-hover:text-cyan-600 transition-colors">
                          {sibling.city}, {sibling.state}
                        </span>
                        <ChevronRight className="size-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        {sibling.region}
                      </span>
                    </Link>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <Link
                    to="/hubs"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 hover:text-cyan-700"
                  >
                    <ArrowLeft className="size-3" />
                    <span>View All 4 Logistics Hubs</span>
                  </Link>
                </div>
              </div>

              {/* Technical Resources Callouts */}
              <div className="bg-slate-100/80 rounded-2xl p-5 border border-slate-200/80 text-xs space-y-3">
                <span className="font-bold uppercase tracking-wider text-slate-500 block">
                  Contractor Resources:
                </span>
                <Link
                  to="/guides"
                  className="block font-semibold text-slate-700 hover:text-cyan-600 transition-colors"
                >
                  • Pool Equipment Sizing & Buying Guides
                </Link>
                <Link
                  to="/comparisons"
                  className="block font-semibold text-slate-700 hover:text-cyan-600 transition-colors"
                >
                  • Head-to-Head Brand Comparisons
                </Link>
                <Link
                  to="/why-us"
                  className="block font-semibold text-slate-700 hover:text-cyan-600 transition-colors"
                >
                  • Why Commercial Contractors Choose PSW
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
