import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import {
  Scale,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Ban,
  RefreshCw,
  Mail,
  Phone,
  Clock,
  MapPin,
  ChevronRight,
  Printer,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/terms-and-conditions")({
  head: () => {
    const pageUrl = "https://poolsupplywholesalers.com/terms-and-conditions";
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://poolsupplywholesalers.com" },
        { "@type": "ListItem", "position": 2, "name": "Terms and Conditions", "item": pageUrl },
      ],
    };

    const webpageLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Terms and Conditions — Pool Supply Wholesalers",
      url: pageUrl,
      description: "Review the terms and conditions for using Pool Supply Wholesalers' website, commercial wholesale services, and equipment distribution.",
    };

    return {
      meta: [
        { title: "Terms and Conditions — Pool Supply Wholesalers | Legal Agreement" },
        {
          name: "description",
          content:
            "Please read these terms and conditions carefully before using our website and services. Governs website access, use license, disclaimers, and commercial wholesale terms.",
        },
        {
          name: "keywords",
          content: "terms and conditions, pool supply terms of service, wholesale pool equipment terms, user agreement",
        },
        { property: "og:title", content: "Terms and Conditions — Pool Supply Wholesalers" },
        {
          property: "og:description",
          content: "Please read these terms and conditions carefully before using our website and services.",
        },
        { property: "og:url", content: pageUrl },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Terms and Conditions — Pool Supply Wholesalers" },
        {
          name: "twitter:description",
          content: "Please read these terms and conditions carefully before using our website and services.",
        },
      ],
      links: [{ rel: "canonical", href: pageUrl }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(breadcrumbLd) },
        { type: "application/ld+json", children: JSON.stringify(webpageLd) },
      ],
    };
  },
  component: TermsAndConditionsPage,
});

const SECTIONS = [
  {
    id: "acceptance-of-terms",
    num: "01",
    title: "Acceptance of Terms",
    icon: CheckCircle2,
    badge: "Binding Agreement",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
        </p>
        <div className="p-4 rounded-xl bg-cyan-50/80 border border-cyan-200 text-xs sm:text-sm text-cyan-950 leading-relaxed flex items-start gap-3">
          <ShieldCheck className="size-5 text-cyan-600 shrink-0 mt-0.5" />
          <span>
            If you do not agree to abide by the above and these terms, please do not use this site or any services provided through it. Continued access signifies your formal acceptance of all current conditions.
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "use-license",
    num: "02",
    title: "Use License",
    icon: FileText,
    badge: "Limited Rights",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          Permission is granted to temporarily download one copy of the materials on this website for personal, non-commercial transitory viewing only.
        </p>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Under this license you may not:</p>
          <ul className="grid sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-600">
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-cyan-600 shrink-0" />
              <span>Modify or copy the proprietary materials</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-cyan-600 shrink-0" />
              <span>Use materials for commercial resale without authorization</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-cyan-600 shrink-0" />
              <span>Attempt to decompile or reverse engineer software</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-cyan-600 shrink-0" />
              <span>Remove any copyright or proprietary notations</span>
            </li>
          </ul>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          This license shall automatically terminate if you violate any of these restrictions and may be terminated by Pool Supply Wholesalers at any time.
        </p>
      </div>
    ),
  },
  {
    id: "disclaimer",
    num: "03",
    title: "Disclaimer",
    icon: AlertTriangle,
    badge: "As-Is Provision",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          The materials on this website are provided on an “as is” basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
        </p>
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs sm:text-sm text-amber-950 leading-relaxed flex items-start gap-3">
          <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <span>
            All pool equipment specifications, hydraulic calculations, and manufacturer warranty terms are backed directly by OEM brand manufacturers (Pentair, Hayward, Jandy, Raypak, etc.) in accordance with their respective factory coverage policies.
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "limitations",
    num: "04",
    title: "Limitations",
    icon: Ban,
    badge: "Liability Scope",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          In no event shall we or our suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on this website.
        </p>
        <p className="text-xs text-slate-500 leading-relaxed">
          Even if Pool Supply Wholesalers or an authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
        </p>
      </div>
    ),
  },
  {
    id: "revisions",
    num: "05",
    title: "Revisions",
    icon: RefreshCw,
    badge: "Ongoing Updates",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          We may revise these terms of service at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
        </p>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-cyan-600" />
            <span>Regularly audited for regulatory and commercial trade compliance</span>
          </div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest hidden sm:inline">Version 2026.1</span>
        </div>
      </div>
    ),
  },
  {
    id: "contact-information",
    num: "06",
    title: "Contact Information",
    icon: Mail,
    badge: "Direct Support",
    content: (
      <div className="space-y-5">
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          If you have any questions about these Terms and Conditions, please contact us.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 pt-2">
          <a
            href="mailto:sales@poolsupplywholesalers.com"
            className="p-4 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-cyan-500/50 hover:shadow-md transition-all group flex items-start gap-3"
          >
            <div className="p-2.5 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-600 group-hover:scale-105 transition-transform">
              <Mail className="size-4" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Email Legal Inquiries</div>
              <div className="text-sm font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
                sales@poolsupplywholesalers.com
              </div>
            </div>
          </a>

          <a
            href="tel:+16154770407"
            className="p-4 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 hover:border-cyan-500/50 hover:shadow-md transition-all group flex items-start gap-3"
          >
            <div className="p-2.5 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-600 group-hover:scale-105 transition-transform">
              <Phone className="size-4" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Wholesale Customer Support</div>
              <div className="text-sm font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">
                +1 (615) 477-0407
              </div>
            </div>
          </a>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-600">
              <MapPin className="size-4" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">National Headquarters</div>
              <div className="text-sm font-bold text-slate-900">410 Scott Pike, Nashville, TN 37207</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-600">
              <Clock className="size-4" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Operating Hours</div>
              <div className="text-sm font-bold text-slate-900">Mon – Fri: 6:00 AM – 6:00 PM CST</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

function TermsAndConditionsPage() {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Header with alwaysDark for light theme header styling */}
      <Header alwaysDark />

      <main className="flex-1 relative">
        {/* Hero Section with generous top padding to prevent fixed header overlap */}
        <section className="relative pt-28 pb-12 sm:pt-36 sm:pb-16 lg:pt-40 lg:pb-20 bg-gradient-to-b from-cyan-50/60 via-white to-slate-50 border-b border-slate-200/80 overflow-hidden">
          {/* Subtle Ambient Water Light Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[380px] bg-gradient-to-b from-cyan-500/10 via-blue-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
              <Link to="/" className="hover:text-cyan-600 transition-colors">
                Home
              </Link>
              <ChevronRight className="size-3 text-slate-400" />
              <span className="text-slate-800 font-bold">Terms and Conditions</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider text-cyan-700 bg-cyan-100/70 border border-cyan-300 shadow-xs">
                  <Scale className="size-3.5 text-cyan-600" />
                  <span>Legal & Commercial Agreement</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  Terms and{" "}
                  <span className="bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 bg-clip-text text-transparent">
                    Conditions
                  </span>
                </h1>

                <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed font-medium">
                  Please read these terms and conditions carefully before using our website and services.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer"
                  title="Print this agreement"
                >
                  <Printer className="size-3.5 text-slate-500" />
                  <span>Print Terms</span>
                </button>
                <Link
                  to="/contact"
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-xs font-bold text-white flex items-center gap-2 transition-all shadow-md shadow-cyan-600/20 active:scale-95"
                >
                  <span>Contact Desk</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>

            {/* Quick Metadata Strip */}
            <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-cyan-600" />
                <span>Effective Date: 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-cyan-600" />
                <span>Authorized OEM Standards</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="size-3.5 text-cyan-600" />
                <span>Commercial Trade Protection</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="size-3.5 text-cyan-600" />
                <span>US Governing Law</span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Layout with Sticky Sidebar */}
        <section className="py-12 sm:py-16 bg-slate-50/70">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-10 items-start">
              {/* Sticky Sidebar Navigation (Desktop) */}
              <aside className="hidden lg:block lg:col-span-4">
                <div className="sticky top-28 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                    <Scale className="size-4 text-cyan-600" />
                    <span>Table of Contents</span>
                  </div>
                  <nav className="space-y-1">
                    {SECTIONS.map((s) => (
                      <a
                        key={s.id}
                        href={`#${s.id}`}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-cyan-700 hover:bg-cyan-50/60 transition-all group"
                      >
                        <span className="flex items-center gap-2.5 truncate">
                          <span className="text-[11px] font-mono font-bold text-cyan-600">{s.num}.</span>
                          <span className="truncate">{s.title}</span>
                        </span>
                        <ChevronRight className="size-3 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </a>
                    ))}
                  </nav>

                  <div className="pt-4 border-t border-slate-200">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                      <p className="font-bold text-slate-900">Need Clarification?</p>
                      <p className="leading-relaxed">
                        Our contractor support desk is available to assist pool pros with commercial terms and trade policies.
                      </p>
                      <Link
                        to="/contact"
                        className="inline-flex items-center gap-1.5 text-cyan-700 hover:text-cyan-600 font-bold transition-colors pt-1"
                      >
                        <span>Open support request</span>
                        <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Terms Content List */}
              <div className="lg:col-span-8 space-y-6">
                {SECTIONS.map((section) => (
                  <section
                    id={section.id}
                    key={section.id}
                    className="scroll-mt-28 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-slate-300 transition-all group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center font-black text-sm group-hover:border-cyan-400 transition-colors shrink-0">
                          {section.num}
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                          {section.title}
                        </h2>
                      </div>
                      <span className="self-start sm:self-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-slate-600 bg-slate-100 border border-slate-200">
                        {section.badge}
                      </span>
                    </div>

                    {section.content}
                  </section>
                ))}

                {/* Additional Commercial Scope Banner */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-50 via-sky-50 to-blue-50 border border-cyan-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="text-sm font-bold text-slate-900">Have a specific commercial inquiry?</h3>
                    <p className="text-xs text-slate-600">
                      Reach out to our B2B commercial accounts department for custom contracting & trade credit terms.
                    </p>
                  </div>
                  <Link
                    to="/contact"
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs transition-all shadow-sm shadow-cyan-600/20 active:scale-95 shrink-0"
                  >
                    Contact Wholesale Team
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
