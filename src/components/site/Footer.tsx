import { Mail, Phone, MapPin, ArrowRight, ShieldCheck, Award, Lock, Sparkles } from "lucide-react";
import logo from "@/assets/logo.png";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { subscribeEmail } from "@/lib/api/subscribers.functions";

const ROUTE_MAP: Record<string, string> = {
  "About": "/about",
  "Contact": "/contact",
  "Why Us": "/why-us",
  "Pool Pumps": "/shop/pumps",
  "Heaters": "/shop/heaters",
  "Filters": "/shop/filters",
  "Lights": "/shop/lights",
  "Cleaners": "/shop/cleaners",
  "Automation": "/shop/automation",
};

const cols = [
  {
    title: "Products",
    links: ["Pool Pumps", "Heaters", "Filters", "Lights", "Cleaners", "Automation"]
  },
  {
    title: "Top Brands",
    links: ["Pentair", "Hayward", "Jandy", "Raypak", "Zodiac", "Waterway"]
  },
  {
    title: "Support",
    links: ["Contact", "Shipping", "Returns", "Warranty", "Pro Account"]
  },
  {
    title: "Company",
    links: ["About", "Why Us", "Careers", "Press", "Trade Program"]
  },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await subscribeEmail({ data: { email } });
      if (res.success) {
        toast.success("Successfully subscribed to wholesale product updates!");
        setEmail("");
      } else {
        toast.error(res.error || "Failed to subscribe.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="relative bg-slate-950 text-slate-300 overflow-hidden font-sans border-t border-slate-800/80">
      {/* Top Accent Gradient Line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />

      {/* Background Soft Glow Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-16 pb-12">
        {/* Newsletter Banner Box */}
        <div className="mb-16 p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-br from-slate-900/90 via-slate-900/50 to-slate-950 border border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-2 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-800/50">
              <Sparkles className="size-3" /> Exclusive Trade Rates
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Get Wholesale Price Drop Alerts
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Join 5,000+ pool contractors and trade pros. Receive instant notifications on commercial equipment inventory and manufacturer rebates.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full lg:w-auto flex flex-col sm:flex-row gap-3 shrink-0">
            <input
              type="email"
              required
              disabled={isSubmitting}
              placeholder="Enter your business email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 px-5 rounded-2xl bg-slate-950/80 border border-slate-700/80 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all sm:w-72 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {isSubmitting ? "Subscribing..." : "Subscribe Now"}
              <ArrowRight className="size-4" />
            </button>
          </form>
        </div>

        {/* Main Footer Links & Info Grid */}
        <div className="grid lg:grid-cols-12 gap-12 mb-16">
          {/* Company Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="inline-block">
              <img
                src={logo}
                alt="Pool Supply Wholesalers Logo"
                className="h-14 sm:h-16 w-auto object-contain brightness-0 invert drop-shadow-[0_0_20px_rgba(6,182,212,0.2)]"
              />
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              America's leading wholesale distributor of commercial-grade pool equipment, variable speed pumps, gas heaters, salt chlorinators, and automation systems since 2003.
            </p>

            {/* Sleek Minimalist Contact Card */}
            <div className="rounded-2xl bg-slate-900/50 border border-slate-800/80 divide-y divide-slate-800/60 overflow-hidden shadow-md max-w-sm">
              <a
                href="tel:6154770407"
                className="flex items-center gap-3.5 px-4 py-3 hover:bg-slate-800/40 transition-colors group"
              >
                <div className="size-7.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 grid place-items-center shrink-0 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                  <Phone className="size-3.5" />
                </div>
                <span className="text-xs font-extrabold text-slate-200 group-hover:text-cyan-400 transition-colors">
                  (615) 477-0407
                </span>
              </a>

              <a
                href="mailto:sales@poolsupplywholesalers.com"
                className="flex items-center gap-3.5 px-4 py-3 hover:bg-slate-800/40 transition-colors group"
              >
                <div className="size-7.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 grid place-items-center shrink-0 group-hover:scale-110 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-all">
                  <Mail className="size-3.5" />
                </div>
                <span className="text-xs font-extrabold text-slate-200 group-hover:text-cyan-400 transition-colors truncate">
                  sales@poolsupplywholesalers.com
                </span>
              </a>

              <div className="flex items-center gap-3.5 px-4 py-3 text-slate-300">
                <div className="size-7.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 grid place-items-center shrink-0">
                  <MapPin className="size-3.5" />
                </div>
                <span className="text-xs font-extrabold text-slate-300">
                  410 Scott Pike, Nashville, TN
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {cols.map((c) => (
              <div key={c.title} className="space-y-4">
                <h4 className="text-white font-extrabold text-xs tracking-widest uppercase border-b border-slate-800 pb-2.5">
                  {c.title}
                </h4>
                <ul className="space-y-2.5 text-xs font-medium text-slate-400">
                  {c.links.map((l) => {
                    const targetRoute = ROUTE_MAP[l] || `/shop/${l.toLowerCase().replace(/ /g, "-")}`;
                    return (
                      <li key={l}>
                        <Link
                          to={targetRoute as any}
                          className="hover:text-cyan-400 hover:translate-x-1 transition-all duration-200 inline-block py-0.5"
                        >
                          {l}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Badges Strip */}
        <div className="py-6 my-8 border-y border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
            <ShieldCheck className="size-4 text-cyan-400" /> Authorized Brand Distributor
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
            <Award className="size-4 text-cyan-400" /> Certified Pool Technician Specs
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
            <Lock className="size-4 text-cyan-400" /> 256-Bit SSL Encrypted Checkout
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
            <Sparkles className="size-4 text-cyan-400" /> Same Day Fast Shipping
          </div>
        </div>

        {/* Bottom Copyright & Credits */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <p>© {new Date().getFullYear()} Pool Supply Wholesalers. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 transition cursor-pointer">Terms of Service</span>
            <p className="text-slate-400">Design By <span className="text-cyan-400 font-bold">StellR IT LLC</span></p>
          </div>
        </div>
      </div>
    </footer>
  );
}
