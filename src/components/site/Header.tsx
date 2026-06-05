import { useEffect, useState } from "react";
import { Search, User, ShoppingBag, Menu, X, Waves } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { useCart } from "./cart-context";


const NAV = [
  { label: "Shop", href: "#categories" },
  { label: "Equipment", href: "#categories" },
  { label: "Pumps", href: "#categories" },
  { label: "Heaters", href: "#categories" },
  { label: "Lights", href: "#categories" },
  { label: "Brands", href: "#brands" },
  { label: "About", href: "#why" },
  { label: "Contact", href: "#cta" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "glass py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between gap-6">
        <a href="#" className="flex items-center gap-2 group">
          <span className="grid place-items-center size-10 rounded-xl bg-gradient-ocean text-white shadow-[var(--shadow-soft)] group-hover:scale-105 transition">
            <Waves className="size-5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-extrabold tracking-tight text-foreground text-lg">AquaPro</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Wholesale</span>
          </span>
        </a>

        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
          {NAV.map((n) => (
            <a key={n.label} href={n.href} className="text-foreground/75 hover:text-foreground transition-colors relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-gradient-ocean hover:after:w-full after:transition-all">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <button aria-label="Search" className="size-10 grid place-items-center rounded-full hover:bg-muted transition">
            <Search className="size-[18px]" />
          </button>
          <button aria-label="Account" className="size-10 grid place-items-center rounded-full hover:bg-muted transition">
            <User className="size-[18px]" />
          </button>
          <button aria-label="Cart" className="relative size-10 grid place-items-center rounded-full hover:bg-muted transition">
            <ShoppingBag className="size-[18px]" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-gradient-ocean" />
          </button>
          <button aria-label="Menu" onClick={() => setOpen(!open)} className="lg:hidden size-10 grid place-items-center rounded-full hover:bg-muted transition">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden glass mx-6 mt-3 rounded-2xl"
          >
            <div className="p-5 grid gap-3">
              {NAV.map((n) => (
                <a key={n.label} href={n.href} onClick={() => setOpen(false)} className="text-foreground/80 hover:text-foreground py-1">
                  {n.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
