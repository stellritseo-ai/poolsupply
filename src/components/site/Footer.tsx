import { Waves, Mail, Phone, MapPin } from "lucide-react";

const cols = [
  { title: "Products", links: ["Pool Pumps", "Heaters", "Filters", "Lights", "Cleaners", "Automation"] },
  { title: "Brands", links: ["Pentair", "Hayward", "Jandy", "Raypak", "Zodiac", "Waterway"] },
  { title: "Support", links: ["Contact", "Shipping", "Returns", "Warranty", "Pro Account"] },
  { title: "Company", links: ["About", "Careers", "Press", "Blog", "Trade Program"] },
];

export function Footer() {
  return (
    <footer className="bg-[oklch(0.16_0.02_256)] text-white/80">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2">
              <span className="grid place-items-center size-10 rounded-xl bg-gradient-ocean text-white">
                <Waves className="size-5" />
              </span>
              <span className="text-white font-extrabold text-xl">AquaPro</span>
            </div>
            <p className="mt-5 text-sm leading-relaxed max-w-sm">
              Premium pool equipment and supplies at wholesale pricing — trusted by 5,000+ professionals across the United States since 2003.
            </p>
            <form className="mt-6 flex gap-2">
              <input
                type="email"
                placeholder="Email for product updates"
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[oklch(0.82_0.10_215)]"
              />
              <button className="px-5 py-3 rounded-xl bg-gradient-ocean text-white text-sm font-semibold">
                Subscribe
              </button>
            </form>
            <div className="mt-6 space-y-2 text-sm">
              <p className="flex items-center gap-2"><Phone className="size-4 text-[oklch(0.82_0.10_215)]" /> (615) 477-0407</p>
              <p className="flex items-center gap-2"><Mail className="size-4 text-[oklch(0.82_0.10_215)]" /> sales@aquapro.com</p>
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
          <p>© {new Date().getFullYear()} AquaPro Wholesale. All Rights Reserved.</p>
          <p>Hours: Mon–Fri 8am–6pm CST · Sat 9am–2pm CST</p>
        </div>
      </div>
    </footer>
  );
}
