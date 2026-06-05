import { motion } from "framer-motion";
import { Tag, Headphones, Truck, ShieldCheck } from "lucide-react";

const items = [
  { icon: Tag, title: "Wholesale Pricing", desc: "Direct access to industry-leading equipment with margins built for professionals." },
  { icon: Headphones, title: "Expert Support", desc: "Knowledgeable pool equipment specialists ready to size and spec your build." },
  { icon: Truck, title: "Fast Shipping", desc: "Quick nationwide delivery on stocked products with reliable tracking." },
  { icon: ShieldCheck, title: "Trusted Brands", desc: "Only genuine, warrantied products from the world's top manufacturers." },
];

export function WhyUs() {
  return (
    <section id="why" className="py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl mb-14">
          <span className="text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-semibold">Why AquaPro</span>
          <h2 className="mt-3 text-4xl lg:text-5xl font-extrabold tracking-tight">
            A wholesale supplier you can build a business on.
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group p-7 rounded-3xl bg-white border border-border hover:border-[oklch(0.82_0.10_215)] hover:shadow-[var(--shadow-soft)] transition-all"
            >
              <span className="inline-grid place-items-center size-12 rounded-2xl bg-gradient-ocean text-white shadow-[var(--shadow-soft)] group-hover:scale-110 transition-transform">
                <it.icon className="size-5" />
              </span>
              <h3 className="mt-5 font-bold text-lg tracking-tight">{it.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{it.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
