import { createFileRoute, Link } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import {
  ShieldCheck,
  Lock,
  Database,
  Share2,
  UserCheck,
  Cookie,
  Bell,
  Mail,
  Phone,
  Clock,
  MapPin,
  ChevronRight,
  Printer,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  KeyRound,
} from "lucide-react";

export const Route = createFileRoute("/privacy-policy")({
  head: () => {
    const pageUrl = "https://poolsupplywholesalers.com/privacy-policy";
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://poolsupplywholesalers.com" },
        { "@type": "ListItem", "position": 2, "name": "Privacy Policy", "item": pageUrl },
      ],
    };

    const webpageLd = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: "Privacy Policy — Pool Supply Wholesalers",
      url: pageUrl,
      description: "Learn how Pool Supply Wholesalers collects, uses, and safeguards your personal data, order records, and contractor account information.",
    };

    return {
      meta: [
        { title: "Privacy Policy — Pool Supply Wholesalers | Data Protection" },
        {
          name: "description",
          content:
            "This privacy policy describes how we collect, use, and protect your personal information when you use our website and services. Learn about our strict data privacy standards.",
        },
        {
          name: "keywords",
          content: "privacy policy, data protection, pool supply wholesalers privacy, customer personal data, SSL encryption",
        },
        { property: "og:title", content: "Privacy Policy — Pool Supply Wholesalers" },
        {
          property: "og:description",
          content: "This privacy policy describes how we collect, use, and protect your personal information when you use our website and services.",
        },
        { property: "og:url", content: pageUrl },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "Privacy Policy — Pool Supply Wholesalers" },
        {
          name: "twitter:description",
          content: "This privacy policy describes how we collect, use, and protect your personal information when you use our website and services.",
        },
      ],
      links: [{ rel: "canonical", href: pageUrl }],
      scripts: [
        { type: "application/ld+json", children: JSON.stringify(breadcrumbLd) },
        { type: "application/ld+json", children: JSON.stringify(webpageLd) },
      ],
    };
  },
  component: PrivacyPolicyPage,
});

const SECTIONS = [
  {
    id: "information-we-collect",
    num: "01",
    title: "Information We Collect",
    icon: Database,
    badge: "Direct Collection",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          We collect information that you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This may include your name, email address, mailing address, phone number, and payment information.
        </p>
        <div className="grid sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <UserCheck className="size-3.5 text-cyan-600" /> Account & Contact Info
            </span>
            <p className="text-xs text-slate-500 leading-relaxed">
              Full name, contractor license details, primary email, contact phone, and company affiliation.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Lock className="size-3.5 text-cyan-600" /> Billing & Logistics Data
            </span>
            <p className="text-xs text-slate-500 leading-relaxed">
              Job-site delivery address, billing credentials processed via tokenized Stripe SSL, and invoice records.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "how-we-use-your-information",
    num: "02",
    title: "How We Use Your Information",
    icon: Sparkles,
    badge: "Operational Purpose",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          We use the information we collect to:
        </p>
        <ul className="space-y-2.5">
          {[
            "Process and fulfill your orders",
            "Send you order confirmations and updates",
            "Respond to your comments and questions",
            "Improve our website and services",
            "Send you marketing communications (with your consent)",
          ].map((item, idx) => (
            <li
              key={idx}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700"
            >
              <div className="size-5 rounded-full bg-cyan-100 border border-cyan-300 flex items-center justify-center shrink-0">
                <CheckCircle2 className="size-3.5 text-cyan-700" />
              </div>
              <span className="font-medium">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: "information-sharing",
    num: "03",
    title: "Information Sharing",
    icon: Share2,
    badge: "Strict Privacy",
    content: (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-50 via-sky-50 to-blue-50 border border-cyan-200 text-xs sm:text-sm text-cyan-950 font-bold flex items-center gap-3">
          <ShieldCheck className="size-5 text-cyan-600 shrink-0" />
          <span>We do not sell, trade, or rent your personal information to third parties.</span>
        </div>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          We may share your information with service providers who assist us in operating our website and conducting our business, as long as those parties agree to keep this information confidential.
        </p>
        <p className="text-xs text-slate-500 leading-relaxed">
          These trusted partners include authorized freight carriers (for freight tracking and delivery), verified payment gateways (such as Stripe for encrypted tokenized processing), and transactional email providers for order tracking notifications.
        </p>
      </div>
    ),
  },
  {
    id: "data-security",
    num: "04",
    title: "Data Security",
    icon: Lock,
    badge: "Enterprise Protection",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
        </p>
        <div className="grid sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <div className="size-7 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-600 mx-auto flex items-center justify-center">
              <Lock className="size-3.5" />
            </div>
            <div className="text-xs font-bold text-slate-900">256-Bit SSL</div>
            <div className="text-[11px] text-slate-500">End-to-end transport encryption</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <div className="size-7 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-600 mx-auto flex items-center justify-center">
              <ShieldCheck className="size-3.5" />
            </div>
            <div className="text-xs font-bold text-slate-900">PCI-DSS Compliant</div>
            <div className="text-[11px] text-slate-500">Certified payment gateway safety</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <div className="size-7 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-600 mx-auto flex items-center justify-center">
              <KeyRound className="size-3.5" />
            </div>
            <div className="text-xs font-bold text-slate-900">Restricted Access</div>
            <div className="text-[11px] text-slate-500">Role-based internal authorization</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "your-rights",
    num: "05",
    title: "Your Rights",
    icon: UserCheck,
    badge: "User Control",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          You have the right to access, update, or delete your personal information at any time. You may also opt out of receiving marketing communications from us.
        </p>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            <p className="font-bold text-slate-900">Need to update your contractor file or unsubscribe?</p>
            <p className="text-slate-500 mt-0.5">Contact our support desk or manage your preferences directly.</p>
          </div>
          <Link
            to="/contact"
            className="px-4 py-2 rounded-xl bg-cyan-50 border border-cyan-200 hover:border-cyan-400 text-cyan-700 hover:text-cyan-800 font-bold text-xs transition-all shrink-0 self-start sm:self-center"
          >
            Submit Data Request
          </Link>
        </div>
      </div>
    ),
  },
  {
    id: "cookies",
    num: "06",
    title: "Cookies",
    icon: Cookie,
    badge: "Browsing Experience",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          We use cookies to enhance your experience on our website. You can choose to disable cookies through your browser settings, though this may affect the functionality of the site.
        </p>
        <p className="text-xs text-slate-500 leading-relaxed">
          Cookies allow our platform to remember your cart items, remember your wholesale quote drafts, and ensure fast, secure page loads across sessions.
        </p>
      </div>
    ),
  },
  {
    id: "changes-to-this-policy",
    num: "07",
    title: "Changes to This Policy",
    icon: Bell,
    badge: "Continuous Transparency",
    content: (
      <div className="space-y-4">
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
        </p>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-cyan-600 shrink-0" />
            <span>Last reviewed: September 2026. Prior versions archived upon request.</span>
          </div>
          <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 border border-cyan-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline">
            Active
          </span>
        </div>
      </div>
    ),
  },
  {
    id: "contact-us",
    num: "08",
    title: "Contact Us",
    icon: Mail,
    badge: "Direct Inquiries",
    content: (
      <div className="space-y-5">
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          If you have any questions about this Privacy Policy, please contact us.
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
              <div className="text-xs text-slate-500 font-medium">Privacy Officer Email</div>
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
              <div className="text-xs text-slate-500 font-medium">Wholesale Customer Desk</div>
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
              <div className="text-xs text-slate-500 font-medium">Mailing Address</div>
              <div className="text-sm font-bold text-slate-900">410 Scott Pike, Nashville, TN 37207</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-600">
              <Clock className="size-4" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Response SLA</div>
              <div className="text-sm font-bold text-slate-900">Guaranteed within 1-2 business days</div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

function PrivacyPolicyPage() {
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
              <span className="text-slate-800 font-bold">Privacy Policy</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider text-cyan-700 bg-cyan-100/70 border border-cyan-300 shadow-xs">
                  <ShieldCheck className="size-3.5 text-cyan-600" />
                  <span>Customer Data Protection</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  Privacy{" "}
                  <span className="bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 bg-clip-text text-transparent">
                    Policy
                  </span>
                </h1>

                <p className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed font-medium">
                  This privacy policy describes how we collect, use, and protect your personal information when you use our website and services.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-2 transition-all shadow-xs active:scale-95 cursor-pointer"
                  title="Print this policy"
                >
                  <Printer className="size-3.5 text-slate-500" />
                  <span>Print Policy</span>
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
                <span>Zero Data Resale</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="size-3.5 text-cyan-600" />
                <span>256-Bit SSL Encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="size-3.5 text-cyan-600" />
                <span>Full Rights to Access/Delete</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-3.5 text-cyan-600" />
                <span>PCI-DSS Compliant Gateways</span>
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
                    <ShieldCheck className="size-4 text-cyan-600" />
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
                      <p className="font-bold text-slate-900">Your Privacy Matters</p>
                      <p className="leading-relaxed">
                        Have questions about your order data or want to request information deletion?
                      </p>
                      <Link
                        to="/contact"
                        className="inline-flex items-center gap-1.5 text-cyan-700 hover:text-cyan-600 font-bold transition-colors pt-1"
                      >
                        <span>Message Data Officer</span>
                        <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Policy Content List */}
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

                {/* Additional Trust Banner */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-50 via-sky-50 to-blue-50 border border-cyan-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="text-sm font-bold text-slate-900">Dedicated Wholesale Account Privacy</h3>
                    <p className="text-xs text-slate-600">
                      We treat all trade quotes, commercial project specs, and tax-exempt contractor files with strict confidentiality.
                    </p>
                  </div>
                  <Link
                    to="/contact"
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-xs transition-all shadow-sm shadow-cyan-600/20 active:scale-95 shrink-0"
                  >
                    Contact Support
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
