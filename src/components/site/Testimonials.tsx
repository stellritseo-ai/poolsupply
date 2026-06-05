import { motion } from "framer-motion";
import { Star } from "lucide-react";

const items = [
  { name: "Marcus Reilly", role: "Owner, BlueWave Pools", quote: "Pool Supply Wholesalers has been our go-to wholesaler for five years. The pricing, expertise, and shipping speed are unmatched in the industry." },
  { name: "Sarah Chen", role: "Sunset Pool Service", quote: "Their automation specialists helped us spec out 40 installs last season. The support alone is worth switching suppliers." },
  { name: "David Alvarez", role: "Crystal Clear Pools", quote: "Genuine OEM parts every time, fast delivery, and a real human on the phone. They've become a critical partner." },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-[60px]">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-4xl mb-14">
          <span className="text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-semibold">Loved by Professionals</span>
          <h2 className="mt-3 text-3xl md:text-[40px] font-extrabold tracking-tight">
            Trusted by 5,000+ pool pros nationwide.
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {items.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-7 rounded-3xl bg-surface border border-border hover:border-[oklch(0.82_0.10_215)] hover:shadow-[var(--shadow-soft)] hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="size-4 fill-[oklch(0.82_0.15_85)] text-[oklch(0.82_0.15_85)]" />
                ))}
              </div>
              <blockquote className="text-foreground/90 leading-relaxed">"{t.quote}"</blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="size-11 rounded-full bg-gradient-ocean text-white grid place-items-center font-bold">
                  {t.name.split(" ").map(n => n[0]).join("")}
                </span>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
