import { ArrowRight, ShieldCheck, Award, Lock, Sparkles, CheckCircle2 } from "lucide-react";
import logo from "@/assets/logo.png";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { subscribeEmail } from "@/lib/api/subscribers.functions";

const ROUTE_MAP: Record<string, string> = {
  "About Us": "/about",
  "About Distributor": "/about",
  "Contact Us": "/contact",
  "Why Choose Us": "/why-us",
  "Pool Pumps": "/shop/pumps",
  "Commercial Pool Pumps": "/shop/pumps",
  "Heaters": "/shop/heaters",
  "Gas & Propane Heaters": "/shop/heaters",
  "Filters": "/shop/filters",
  "Cartridge & DE Filters": "/shop/filters",
  "Lights": "/shop/lights",
  "LED Pool Lights": "/shop/lights",
  "Cleaners": "/shop/cleaners",
  "Robotic Cleaners": "/shop/cleaners",
  "Automation": "/shop/automation",
  "Automation & Controls": "/shop/automation",
  "Pentair": "/brands/pentair",
  "Hayward": "/brands/hayward",
  "Jandy": "/brands/jandy",
  "Raypak": "/brands/raypak",
  "Zodiac": "/brands/zodiac",
  "Waterway": "/brands/waterway",
  "Equipment Sizing Wizard": "/finder",
  "Pool Pump Buying Guide": "/shop/pumps",
  "Filter Sizing & Care": "/shop/filters",
  "Verified Reviews": "/reviews",
  "Energy Savings Calculator": "/finder",
  "Commercial Accounts": "/contact",
  "Warranty & Support": "/contact",
};

const cols = [
  {
    title: "Equipment Categories",
    links: ["Commercial Pool Pumps", "Gas & Propane Heaters", "Cartridge & DE Filters", "LED Pool Lights", "Robotic Cleaners", "Automation & Controls"],
  },
  {
    title: "Authorized Brands",
    links: ["Pentair", "Hayward", "Jandy", "Raypak", "Zodiac", "Waterway"],
  },
  {
    title: "Pool Resources",
    links: ["Equipment Sizing Wizard", "Pool Pump Buying Guide", "Filter Sizing & Care", "Verified Reviews", "Energy Savings Calculator"],
  },
  {
    title: "Company & Support",
    links: ["About Distributor", "Why Choose Us", "Contact Us", "Commercial Accounts", "Warranty & Support"],
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

      <div className="relative z-10 mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        {/* Newsletter Banner Box */}
        <div className="mb-12 p-6 sm:p-8 lg:p-10 rounded-[2rem] bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-[#040d1a] border border-cyan-500/20 shadow-xl backdrop-blur-xl flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-950/80 border border-cyan-800/60">
              <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" /> Exclusive Trade Alerts
            </span>
            <h3 className="text-lg sm:text-xl md:text-[22px] lg:text-[25px] font-black text-white tracking-tight whitespace-normal lg:whitespace-nowrap">
              Get Wholesale Price Drop & Inventory Alerts
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
              Join 5,000+ pool contractors and service techs. Receive immediate notifications on factory rebates, volume pricing, and new SKU arrivals.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full lg:w-auto flex flex-col sm:flex-row gap-2.5 shrink-0">
            <input
              type="email"
              required
              disabled={isSubmitting}
              placeholder="Enter your contractor email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 px-4 rounded-xl bg-slate-950/80 border border-slate-700/80 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all sm:w-72 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs transition-all shadow-md hover:shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <span>{isSubmitting ? "Subscribing..." : "Join Trade List"}</span>
              <ArrowRight className="size-3.5" />
            </button>
          </form>
        </div>

        {/* Main Footer Links & Info Grid */}
        <div className="grid lg:grid-cols-12 gap-10 mb-12">
          {/* Company Brand Column */}
          <div className="lg:col-span-4 space-y-5">
            <Link to="/" className="inline-block">
              <img
                src={logo}
                alt="Pool Supply Wholesalers Logo"
                className="h-12 sm:h-14 w-auto object-contain brightness-0 invert drop-shadow-[0_0_15px_rgba(6,182,212,0.2)]"
              />
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              America's premier wholesale distributor of commercial-grade pool equipment, variable speed pumps, gas heaters, salt chlorinators, and automation systems.
            </p>
          </div>

          {/* Navigation Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {cols.map((c) => (
              <div key={c.title} className="space-y-3.5">
                <h4 className="text-white font-extrabold text-[11px] tracking-wider uppercase border-b border-slate-800 pb-2">
                  {c.title}
                </h4>
                <ul className="space-y-2 text-xs font-medium text-slate-400">
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
        <div className="py-5 my-6 border-y border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
            <ShieldCheck className="size-4 text-cyan-400 shrink-0" />
            <span>100% Authorized OEM Distributor</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
            <Award className="size-4 text-cyan-400 shrink-0" />
            <span>Factory-Certified Technician Specs</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
            <Lock className="size-4 text-cyan-400 shrink-0" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
            <Sparkles className="size-4 text-cyan-400 shrink-0" />
            <span>Same-Day Express Freight Dispatch</span>
          </div>
        </div>

        {/* Bottom Copyright & Credits */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <p>© {new Date().getFullYear()} Pool Supply Wholesalers. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/contact" className="hover:text-slate-400 transition">
              Customer Support
            </Link>
            <Link to="/about" className="hover:text-slate-400 transition">
              About Distributor
            </Link>
            <p className="text-slate-400">
              Design By{" "}
              <a
                href="https://stellrit.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 font-bold hover:underline transition-colors"
              >
                StellR IT LLC
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
