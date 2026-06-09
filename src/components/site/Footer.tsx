import { Waves, Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";
import { useState } from "react";
import { toast } from "sonner";
import { subscribeEmail } from "@/lib/api/subscribers.functions";

const cols = [
  { title: "Products", links: ["Pool Pumps", "Heaters", "Filters", "Lights", "Cleaners", "Automation"] },
  { title: "Brands", links: ["Pentair", "Hayward", "Jandy", "Raypak", "Zodiac", "Waterway"] },
  { title: "Support", links: ["Contact", "Shipping", "Returns", "Warranty", "Pro Account"] },
  { title: "Company", links: ["About", "Careers", "Press", "Blog", "Trade Program"] },
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
        toast.success("Successfully subscribed to product updates!");
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
    <footer className="bg-[oklch(0.16_0.02_256)] text-white/80">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-4">
            <div className="flex items-center">
              <img
                src={logo}
                alt="Pool Supply Wholesalers Logo"
                className="h-20 w-auto object-contain brightness-0 invert"
              />
            </div>
            <p className="mt-5 text-sm leading-relaxed max-w-sm">
              Premium pool equipment and supplies at wholesale pricing — trusted by 5,000+ professionals across the United States since 2003.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
              <input
                type="email"
                required
                disabled={isSubmitting}
                placeholder="Email for product updates"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-pool focus:ring-2 focus:ring-cyan-pool/20 transition-all duration-200 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-3 rounded-xl bg-gradient-ocean hover:opacity-90 hover:shadow-[0_0_15px_rgba(0,180,216,0.3)] text-white text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
            <div className="mt-6 space-y-2 text-sm">
              <p className="flex items-center gap-2"><Phone className="size-4 text-[oklch(0.82_0.10_215)]" /> (615) 477-0407</p>
              <p className="flex items-center gap-2"><Mail className="size-4 text-[oklch(0.82_0.10_215)]" /> sales@poolsupplywholesalers.com</p>
              <p className="flex items-center gap-2"><MapPin className="size-4 text-[oklch(0.82_0.10_215)]" /> 410 Scott Pike, Nashville, TN</p>
            </div>
          </div>

          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {cols.map((c) => (
              <div key={c.title}>
                <h4 className="text-white font-semibold text-sm tracking-wide uppercase mb-4">{c.title}</h4>
                <ul className="space-y-2.5 text-sm">
                  {c.links.map((l) => (
                    <li key={l}><a href="#" className="hover:text-white transition">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-white/55">
          <p>© {new Date().getFullYear()} Pool Supply Wholesalers. All Rights Reserved.</p>
          <p>Design By Lambton Labs</p>
        </div>
      </div>
    </footer>
  );
}
