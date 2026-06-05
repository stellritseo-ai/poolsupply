import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { H as Header, F as Footer } from "./Footer-ByV1nwUH.mjs";
import { u as useCart } from "./router-DePSa50g.mjs";
import { m as motion } from "../_libs/framer-motion.mjs";
import { A as ArrowRight, d as Truck, g as Award, h as Tag, H as Headphones, i as Check, j as ArrowUpRight, E as Eye, k as Star, S as ShoppingBag, f as ShieldCheck, l as Calculator, m as Sparkles, n as MapPin, o as Phone, b as Mail, p as Send } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const heroVideo = "/assets/herovideo-oEuDdByT.mp4";
const features = [
  { icon: Truck, label: "Fast Shipping" },
  { icon: Award, label: "Top Manufacturers" },
  { icon: Tag, label: "Wholesale Pricing" },
  { icon: Headphones, label: "Expert Support" }
];
const stats = [
  { value: "20+", label: "Years Experience" },
  { value: "5,000+", label: "Products" },
  { value: "50+", label: "Top Brands" },
  { value: "USA", label: "Nationwide Shipping" }
];
function Hero() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative min-h-screen flex items-end pt-28 pb-16 overflow-hidden isolate", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 -z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "video",
        {
          autoPlay: true,
          loop: true,
          muted: true,
          playsInline: true,
          className: "w-full h-full object-cover scale-105 animate-float",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("source", { src: heroVideo, type: "video/mp4" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/40" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-b from-[oklch(0.50_0.14_232/0.55)] via-[oklch(0.50_0.14_232/0.25)] to-background" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-[oklch(0.18_0.02_256/0.45)] to-transparent" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute top-1/3 right-10 size-40 rounded-full border border-white/30 animate-ripple" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute top-1/2 right-32 size-60 rounded-full border border-white/20 animate-ripple [animation-delay:1s]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto max-w-7xl px-6 w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          initial: { opacity: 0, y: 30 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, ease: "easeOut" },
          className: "max-w-5xl",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mt-[100px] md:mt-[150px] inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-white text-xs font-medium tracking-wide uppercase", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-1.5 rounded-full bg-[oklch(0.82_0.10_215)]" }),
              " Trusted by 5,000+ pool professionals"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-6 text-white font-extrabold tracking-tight text-[40px] md:text-[55px] leading-[1.05]", children: [
              "Premium Pool Equipment.",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "block mt-2 bg-gradient-to-r from-white via-[oklch(0.92_0.06_215)] to-[oklch(0.82_0.10_215)] bg-clip-text text-transparent", children: "Wholesale Pricing." })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6 text-lg sm:text-xl text-white/85 leading-relaxed", children: [
              "Trusted supplier of pumps, heaters, filters, cleaners, automation systems and pool accessories ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("br", { className: "hidden sm:block" }),
              " from the industry's leading brands — built for professionals and homeowners alike."
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-9 flex flex-wrap gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "#categories", className: "group inline-flex items-center gap-2 px-6 py-3 text-sm rounded-full bg-white text-[oklch(0.50_0.14_232)] font-semibold shadow-[var(--shadow-float)] hover:shadow-[0_40px_80px_-30px_oklch(0.50_0.14_232/0.55)] transition-all hover:-translate-y-0.5", children: [
                "Shop Equipment",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-4 group-hover:translate-x-1 transition" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#brands", className: "inline-flex items-center gap-2 px-6 py-3 text-sm rounded-full glass text-white font-semibold hover:bg-white/20 transition", children: "View Brands" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-10 flex flex-wrap gap-x-6 gap-y-3", children: features.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center gap-2 text-white/90 text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "grid place-items-center size-6 rounded-full bg-white/15 backdrop-blur", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "size-3.5" }) }),
              f.label
            ] }, f.label)) })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          initial: { opacity: 0, y: 40 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay: 0.3 },
          className: "mt-16 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4",
          children: stats.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl p-5 text-white bg-black/40 backdrop-blur-md border border-white/10 shadow-[var(--shadow-float)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-3xl lg:text-4xl font-extrabold tracking-tight", children: s.value }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs uppercase tracking-widest text-white/75 mt-1", children: s.label })
          ] }, s.label))
        }
      )
    ] })
  ] });
}
const pump = "/assets/cat-pump-BSGdPlp9.jpg";
const heater = "/assets/cat-heater-D5H8APcV.jpg";
const light = "/assets/cat-light-uMI-XswG.jpg";
const filter = "/assets/cat-filter-C54fjY5W.jpg";
const cleaner = "/assets/cat-cleaner-Bx17-8sx.jpg";
const automation = "/assets/cat-automation-DIEydYnU.jpg";
const cats = [
  { name: "Pool Pumps", count: "120+ products", img: pump },
  { name: "Pool Heaters", count: "85+ products", img: heater },
  { name: "Pool Lights", count: "60+ products", img: light },
  { name: "Pool Filters", count: "95+ products", img: filter },
  { name: "Pool Cleaners", count: "70+ products", img: cleaner },
  { name: "Automation Systems", count: "40+ products", img: automation }
];
function Categories() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "categories", className: "py-[60px] bg-surface", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between flex-wrap gap-6 mb-14", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-semibold", children: "Shop by Category" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "mt-3 text-3xl md:text-[35px] font-extrabold tracking-tight", children: [
          "Everything your pool needs, ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient", children: "expertly curated." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "#", className: "hidden md:inline-flex group items-center gap-2 px-6 py-3 text-sm rounded-full bg-white text-[oklch(0.50_0.14_232)] font-semibold shadow-[var(--shadow-soft)] hover:shadow-[0_20px_40px_-15px_oklch(0.50_0.14_232/0.3)] transition-all hover:-translate-y-0.5 border border-border/50", children: [
        "View all categories ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", children: cats.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.a,
      {
        href: "#",
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.6, delay: i * 0.05 },
        className: "group relative overflow-hidden rounded-[2rem] bg-white border border-border/80 p-5 hover:shadow-[0_30px_60px_-15px_oklch(0.50_0.14_232/0.12)] hover:border-primary/30 transition-all duration-500 hover:-translate-y-1.5 flex flex-col justify-between",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-[4/3] w-full mb-5 grid place-items-center overflow-hidden rounded-[1.5rem] bg-gradient-to-b from-surface to-muted/40 border border-border/40", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: c.img,
                alt: c.name,
                loading: "lazy",
                width: 800,
                height: 600,
                className: "w-[82%] h-[82%] object-contain mix-blend-multiply group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-700 ease-out"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute top-4 left-4 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-white/90 backdrop-blur border border-white/50 rounded-full shadow-sm", children: c.count })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mt-1 px-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300", children: c.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground group-hover:text-primary transition-all duration-300 mt-1", children: [
                "Explore Equipment ",
                /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-10 rounded-full bg-muted group-hover:bg-primary group-hover:text-white text-foreground/80 grid place-items-center transition-all duration-300 shadow-sm active:scale-90 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "size-4" }) })
          ] })
        ]
      },
      c.name
    )) })
  ] }) });
}
const pentair = "/assets/pentair-CKLMIqI9.png";
const hayward = "/assets/hayward-DaC5LrCM.jpg";
const jandy = "/assets/jandy_logo-B2WtsN8z.png";
const waterway = "/assets/w1-BarRoClJ.png";
const raypak = "/assets/logo_dark-Bg6Puw9f.png";
const brandVideo = "/assets/pools-CbIgI9EZ.mp4";
const brands = [
  { name: "Pentair", logo: pentair },
  { name: "Hayward", logo: hayward },
  { name: "Jandy", logo: jandy },
  { name: "Raypak", logo: raypak },
  { name: "Waterway", logo: waterway }
];
function Brands() {
  const duplicatedBrands = [...brands, ...brands, ...brands, ...brands];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "brands", className: "relative py-20 lg:py-24 overflow-hidden isolate", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 -z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "video",
        {
          autoPlay: true,
          loop: true,
          muted: true,
          playsInline: true,
          className: "w-full h-full object-cover scale-105",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("source", { src: brandVideo, type: "video/mp4" })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-white/75 backdrop-blur-[2px] transition-all" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 mx-auto max-w-7xl px-6 mb-12 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-[0.25em] text-primary font-semibold font-sans", children: "Featured Brands" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-3 text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground", children: "Built with the world's most trusted manufacturers." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full overflow-hidden py-4 z-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white/75 to-transparent z-10 pointer-events-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white/75 to-transparent z-10 pointer-events-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex w-max", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.div,
        {
          className: "flex gap-6 px-3 will-change-transform",
          animate: { x: [0, "-50%"] },
          transition: {
            ease: "linear",
            duration: 22,
            repeat: Infinity
          },
          children: duplicatedBrands.map((b, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "flex items-center justify-center w-48 h-24 rounded-2xl glass hover:bg-white/95 hover:shadow-[var(--shadow-soft)] hover:border-primary/30 transition-all duration-300 group shrink-0",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: b.logo,
                  alt: `${b.name} logo`,
                  className: "max-h-12 max-w-[70%] object-contain opacity-65 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 filter grayscale group-hover:grayscale-0"
                }
              )
            },
            `${b.name}-${i}`
          ))
        }
      ) })
    ] })
  ] });
}
const products = [
  { id: "p-intelliflo", name: "Variable-Speed IntelliFlo Pump", brand: "Pentair", price: 1289, rating: 4.9, img: pump },
  { id: "p-raypak-400k", name: "Digital Pool Heater Pro 400K", brand: "Raypak", price: 2499, rating: 4.8, img: heater },
  { id: "p-colorlogic", name: "ColorLogic LED Pool Light", brand: "Hayward", price: 349, rating: 4.9, img: light },
  { id: "p-cx3", name: "Robotic Pool Cleaner CX-3", brand: "Jandy", price: 899, rating: 4.7, img: cleaner }
];
function BestSellers() {
  const { add } = useCart();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "py-[60px] bg-surface", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-end justify-between flex-wrap gap-6 mb-14", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-semibold", children: "Best Sellers" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-3 -mb-[30px] text-3xl md:text-[40px] font-extrabold tracking-tight", children: "Pro Favorites This Season." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5", children: products.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.article,
      {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-60px" },
        transition: { duration: 0.5, delay: i * 0.08 },
        className: "group bg-white rounded-3xl p-5 border border-border hover:shadow-[var(--shadow-float)] hover:-translate-y-1 transition-all",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative aspect-square rounded-2xl bg-gradient-to-b from-[oklch(0.97_0.01_240)] to-[oklch(0.92_0.04_220)] overflow-hidden grid place-items-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: p.img, alt: p.name, loading: "lazy", width: 400, height: 400, className: "size-full object-contain p-6 group-hover:scale-110 transition-transform duration-700 mix-blend-multiply" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { "aria-label": "Quick view", className: "absolute top-3 right-3 size-10 grid place-items-center rounded-full bg-white/80 backdrop-blur opacity-0 group-hover:opacity-100 transition shadow-[var(--shadow-soft)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "size-4" }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground font-semibold", children: p.brand }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-xs font-semibold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "size-3.5 fill-[oklch(0.82_0.15_85)] text-[oklch(0.82_0.15_85)]" }),
              p.rating
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-1.5 font-semibold text-foreground leading-snug min-h-[3rem]", children: p.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "-mt-[10px] flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-2xl font-extrabold tracking-tight", children: [
              "$",
              p.price.toLocaleString()
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => add({ id: p.id, name: p.name, brand: p.brand, price: p.price, img: p.img }),
                className: "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-foreground text-background text-xs font-semibold hover:bg-[oklch(0.50_0.14_232)] transition",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "size-3.5" }),
                  " Add"
                ]
              }
            )
          ] })
        ]
      },
      p.id
    )) })
  ] }) });
}
const items$1 = [
  { icon: Tag, title: "Wholesale Pricing", desc: "Direct access to industry-leading equipment with margins built for professionals." },
  { icon: Headphones, title: "Expert Support", desc: "Knowledgeable pool equipment specialists ready to size and spec your build." },
  { icon: Truck, title: "Fast Shipping", desc: "Quick nationwide delivery on stocked products with reliable tracking." },
  { icon: ShieldCheck, title: "Trusted Brands", desc: "Only genuine, warrantied products from the world's top manufacturers." }
];
function WhyUs() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "why", className: "py-[60px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mb-14", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-semibold", children: "Why Us" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-3 text-3xl md:text-[35px] font-extrabold tracking-tight", children: "A wholesale supplier you can build a business on." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5", children: items$1.map((it, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-60px" },
        transition: { duration: 0.5, delay: i * 0.08 },
        className: "group p-7 rounded-3xl bg-white border border-border hover:border-[oklch(0.82_0.10_215)] hover:shadow-[var(--shadow-soft)] transition-all",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-grid place-items-center size-12 rounded-2xl bg-gradient-ocean text-white shadow-[var(--shadow-soft)] group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(it.icon, { className: "size-5" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-5 font-bold text-lg tracking-tight", children: it.title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground leading-relaxed", children: it.desc })
        ]
      },
      it.title
    )) })
  ] }) });
}
function Finder() {
  const [gallons, setGallons] = reactExports.useState(2e4);
  const [climate, setClimate] = reactExports.useState("moderate");
  const rec = reactExports.useMemo(() => {
    const hp = gallons < 15e3 ? "1.0 HP Variable-Speed" : gallons < 3e4 ? "1.5 HP Variable-Speed" : "2.0 HP Variable-Speed";
    const btu = climate === "cold" ? "400K BTU Gas Heater" : climate === "moderate" ? "300K BTU Heat Pump" : "200K BTU Heat Pump";
    const filterSize = gallons < 2e4 ? "100 sq ft Cartridge" : gallons < 35e3 ? "150 sq ft Cartridge" : "200 sq ft Cartridge";
    return { hp, btu, filterSize };
  }, [gallons, climate]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "finder", className: "py-[60px] bg-surface", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-7xl px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 30 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true },
      transition: { duration: 0.6 },
      className: "relative overflow-hidden rounded-[2rem] bg-white border border-border p-8 lg:p-14 shadow-[var(--shadow-soft)]",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-32 -right-32 size-96 rounded-full bg-gradient-ocean opacity-20 blur-3xl" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative grid lg:grid-cols-2 gap-12 items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-semibold", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Calculator, { className: "size-4" }),
              " Product Finder"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-3 text-3xl md:text-[40px] leading-tight md:leading-[45px] font-extrabold tracking-tight", children: "Find the right equipment for your pool." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-muted-foreground leading-relaxed", children: "Tell us about your pool. We'll generate equipment recommendations sized for performance and efficiency." }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 space-y-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center justify-between text-sm font-medium mb-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Pool Volume" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[oklch(0.50_0.14_232)] font-bold", children: [
                    gallons.toLocaleString(),
                    " gal"
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    type: "range",
                    min: 5e3,
                    max: 5e4,
                    step: 1e3,
                    value: gallons,
                    onChange: (e) => setGallons(Number(e.target.value)),
                    className: "w-full accent-[oklch(0.50_0.14_232)]"
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium mb-3", children: "Climate" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 gap-2", children: ["warm", "moderate", "cold"].map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: () => setClimate(c),
                    className: `py-3 rounded-xl text-sm font-semibold capitalize transition-all duration-200 active:scale-[0.97] ${climate === c ? "bg-gradient-ocean text-white shadow-[var(--shadow-soft)] animate-shimmer" : "bg-muted hover:bg-muted/85 text-foreground/70 hover:text-foreground"}`,
                    children: c
                  },
                  c
                )) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-3xl p-7 space-y-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm font-semibold text-[oklch(0.50_0.14_232)]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "size-4" }),
              " Recommended for you"
            ] }),
            [
              { label: "Pool Pump", value: rec.hp },
              { label: "Heater", value: rec.btu },
              { label: "Filter", value: rec.filterSize }
            ].map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4 rounded-xl bg-white border border-border", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground", children: r.label }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-foreground", children: r.value })
            ] }, r.label)),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "w-full py-4 rounded-xl bg-gradient-ocean text-white font-semibold shadow-[var(--shadow-soft)] hover:opacity-95 transition", children: "See Matching Products" })
          ] }) })
        ] })
      ]
    }
  ) }) });
}
const items = [
  { name: "Marcus Reilly", role: "Owner, BlueWave Pools", quote: "Pool Supply Wholesalers has been our go-to wholesaler for five years. The pricing, expertise, and shipping speed are unmatched in the industry." },
  { name: "Sarah Chen", role: "Sunset Pool Service", quote: "Their automation specialists helped us spec out 40 installs last season. The support alone is worth switching suppliers." },
  { name: "David Alvarez", role: "Crystal Clear Pools", quote: "Genuine OEM parts every time, fast delivery, and a real human on the phone. They've become a critical partner." }
];
function Testimonials() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "testimonials", className: "py-[60px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-4xl mb-14", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-semibold", children: "Loved by Professionals" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-3 text-3xl md:text-[40px] font-extrabold tracking-tight", children: "Trusted by 5,000+ pool pros nationwide." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-3 gap-5", children: items.map((t, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.figure,
      {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-60px" },
        transition: { duration: 0.5, delay: i * 0.1 },
        className: "p-7 rounded-3xl bg-surface border border-border hover:border-[oklch(0.82_0.10_215)] hover:shadow-[var(--shadow-soft)] hover:-translate-y-1 transition-all duration-300",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-0.5 mb-4", children: Array.from({ length: 5 }).map((_, k) => /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "size-4 fill-[oklch(0.82_0.15_85)] text-[oklch(0.82_0.15_85)]" }, k)) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("blockquote", { className: "text-foreground/90 leading-relaxed", children: [
            '"',
            t.quote,
            '"'
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("figcaption", { className: "mt-6 flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "size-11 rounded-full bg-gradient-ocean text-white grid place-items-center font-bold", children: t.name.split(" ").map((n) => n[0]).join("") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold text-sm", children: t.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: t.role })
            ] })
          ] })
        ]
      },
      t.name
    )) })
  ] }) });
}
function CTA() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "cta", className: "px-6 py-[60px]", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 30 },
      whileInView: { opacity: 1, y: 0 },
      viewport: { once: true },
      transition: { duration: 0.7 },
      className: "relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-gradient-ocean p-12 lg:p-20 text-white",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-20 -left-20 size-80 rounded-full border border-white/20 animate-ripple" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -bottom-32 -right-20 size-96 rounded-full border border-white/10 animate-ripple [animation-delay:1.5s]" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-4xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl md:text-[45px] font-extrabold tracking-tight leading-[1]", children: "Ready to upgrade your pool equipment?" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 text-lg text-white/85 max-w-xl", children: "Get wholesale pricing on every major brand. Talk to a specialist or browse 5,000+ products today." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-9 flex flex-wrap gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "#categories", className: "inline-flex items-center gap-2 px-7 py-4 rounded-full bg-white text-[oklch(0.50_0.14_232)] font-semibold shadow-[var(--shadow-float)] hover:-translate-y-0.5 transition", children: [
              "Shop Products ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "size-4" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#", className: "inline-flex items-center gap-2 px-7 py-4 rounded-full border border-white/40 text-white font-semibold hover:bg-white/10 transition", children: "Contact Sales" })
          ] })
        ] })
      ]
    }
  ) });
}
function ContactUs() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { id: "contact", className: "py-[60px] bg-surface relative overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-ocean opacity-5 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center max-w-2xl mx-auto mb-16", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-semibold", children: "Contact Us" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-3 text-3xl md:text-[40px] font-extrabold tracking-tight", children: "Let's build something great." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-muted-foreground text-lg leading-relaxed", children: "Have a question about an order, need technical support, or want to inquire about volume pricing? Our team is ready to help." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-5 gap-10 lg:gap-12 items-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, x: -30 },
            whileInView: { opacity: 1, x: 0 },
            viewport: { once: true, margin: "-60px" },
            transition: { duration: 0.6 },
            className: "lg:col-span-2 flex flex-col gap-6",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-6 px-8 rounded-3xl bg-white border border-border shadow-[var(--shadow-soft)] group hover:border-[oklch(0.50_0.14_232/0.3)] transition-colors flex gap-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-12 shrink-0 rounded-2xl bg-surface grid place-items-center text-[oklch(0.50_0.14_232)] group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "size-5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-foreground mb-2", children: "Headquarters" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground leading-relaxed", children: [
                    "412 Ezell Pike Nashville, TN 37217",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
                    "United States"
                  ] })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-6 px-8 rounded-3xl bg-white border border-border shadow-[var(--shadow-soft)] group hover:border-[oklch(0.50_0.14_232/0.3)] transition-colors flex gap-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-12 shrink-0 rounded-2xl bg-surface grid place-items-center text-[oklch(0.50_0.14_232)] group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "size-5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-foreground mb-2", children: "Call Us" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-1", children: "Mon-Fri, 8am to 6pm EST" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "tel:2398772927", className: "text-[oklch(0.50_0.14_232)] font-semibold hover:underline", children: "(239) 877-2927" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "py-6 px-8 rounded-3xl bg-white border border-border shadow-[var(--shadow-soft)] group hover:border-[oklch(0.50_0.14_232/0.3)] transition-colors flex gap-5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-12 shrink-0 rounded-2xl bg-surface grid place-items-center text-[oklch(0.50_0.14_232)] group-hover:scale-110 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "size-5" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-bold text-foreground mb-2", children: "Email" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-1", children: "We'll respond within 24 hours." }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "mailto:jetspeedsocial@gmail.com", className: "text-[oklch(0.50_0.14_232)] font-semibold hover:underline break-all", children: "jetspeedsocial@gmail.com" })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative w-full h-[250px] sm:h-[300px] rounded-3xl overflow-hidden border border-border shadow-[var(--shadow-soft)] bg-white group hover:border-[oklch(0.50_0.14_232/0.3)] transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                "iframe",
                {
                  src: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3224.520448259695!2d-86.69468902381284!3d36.08055617246101!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88646e0fa8014881%3A0xc3c5f590cc32ef8a!2s412%20Ezell%20Pike%2C%20Nashville%2C%20TN%2037217!5e0!3m2!1sen!2sus!4v1717616110992!5m2!1sen!2sus",
                  className: "absolute inset-0 w-full h-full border-0 grayscale-[0.8] contrast-[1.05]",
                  allowFullScreen: false,
                  loading: "lazy",
                  referrerPolicy: "no-referrer-when-downgrade"
                }
              ) })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 30 },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once: true, margin: "-60px" },
            transition: { duration: 0.6, delay: 0.2 },
            className: "lg:col-span-3 bg-white rounded-[2.5rem] p-8 sm:p-12 border border-border shadow-[var(--shadow-float)]",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-2xl font-extrabold tracking-tight mb-8", children: "Send us a message" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "grid gap-6", onSubmit: (e) => e.preventDefault(), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid sm:grid-cols-2 gap-6", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "firstName", className: "text-sm font-semibold text-foreground/90", children: "First Name" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", id: "firstName", className: "w-full bg-surface rounded-xl px-4 py-3.5 border border-border focus:outline-none focus:ring-2 focus:ring-[oklch(0.50_0.14_232)] focus:border-transparent transition-all", placeholder: "John" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "lastName", className: "text-sm font-semibold text-foreground/90", children: "Last Name" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", id: "lastName", className: "w-full bg-surface rounded-xl px-4 py-3.5 border border-border focus:outline-none focus:ring-2 focus:ring-[oklch(0.50_0.14_232)] focus:border-transparent transition-all", placeholder: "Doe" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "email", className: "text-sm font-semibold text-foreground/90", children: "Email Address" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "email", id: "email", className: "w-full bg-surface rounded-xl px-4 py-3.5 border border-border focus:outline-none focus:ring-2 focus:ring-[oklch(0.50_0.14_232)] focus:border-transparent transition-all", placeholder: "john@example.com" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "subject", className: "text-sm font-semibold text-foreground/90", children: "Subject" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { id: "subject", className: "w-full bg-surface rounded-xl px-4 py-3.5 border border-border focus:outline-none focus:ring-2 focus:ring-[oklch(0.50_0.14_232)] focus:border-transparent transition-all appearance-none cursor-pointer", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "General Inquiry" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Order Support" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Wholesale Pricing" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Technical Assistance" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "message", className: "text-sm font-semibold text-foreground/90", children: "Message" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { id: "message", rows: 5, className: "w-full bg-surface rounded-xl px-4 py-3.5 border border-border focus:outline-none focus:ring-2 focus:ring-[oklch(0.50_0.14_232)] focus:border-transparent transition-all resize-none", placeholder: "How can we help you?" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", className: "mt-2 inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gradient-ocean text-white font-bold text-lg hover:shadow-[0_20px_40px_-15px_oklch(0.50_0.14_232/0.5)] transition-all hover:-translate-y-0.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "size-5" }),
                  " Send Message"
                ] })
              ] })
            ]
          }
        )
      ] })
    ] })
  ] });
}
function Index() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-background text-foreground overflow-x-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Header, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Hero, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Categories, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Brands, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(BestSellers, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(WhyUs, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Finder, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Testimonials, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(ContactUs, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(CTA, {})
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Footer, {})
  ] });
}
export {
  Index as component
};
