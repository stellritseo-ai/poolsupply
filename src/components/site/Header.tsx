import { useEffect, useState } from "react";
import { Search, User, ShoppingBag, Menu, X, Waves } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { useCart } from "./cart-context";
import logo from "@/assets/logo.png";


const NAV = [
  { 
    label: "Shop", 
    to: "/shop/pool-pumps",
    items: [
      { label: "Pool Pumps", to: "/shop/pool-pumps" },
      { label: "Pool Lights", to: "/shop/pool-lights" },
      { label: "Pool Cleaners", to: "/shop/pool-cleaners" },
      { label: "Pool Heaters", to: "/shop/pool-heaters" },
      { label: "Electric Heat Pumps", to: "/shop/electric-heat-pumps" },
    ]
  },
  { 
    label: "Shop By Brand", 
    to: "/brands/hayward",
    items: [
      { label: "Hayward", to: "/brands/hayward" },
      { label: "Pentair", to: "/brands/pentair" },
      { label: "Jandy", to: "/brands/jandy" },
    ]
  },
  { label: "Product Finder", to: "/finder" },
  { label: "Why Us", to: "/why-us" },
  { label: "Reviews", to: "/reviews" },
  { label: "Contact", to: "/contact" },
];

export function Header({ alwaysDark }: { alwaysDark?: boolean } = {}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const cart = useCart();
  const isDarkText = alwaysDark || scrolled || open || searchOpen || userMenuOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        isDarkText ? "glass py-3" : "bg-transparent py-5"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center group">
          <img
            src={logo}
            alt="Pool Supply Wholesalers Logo"
            className={`h-16 sm:h-20 w-auto object-contain transition-all duration-300 group-hover:scale-[1.02] ${
              isDarkText ? "" : "brightness-0 invert"
            }`}
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-10 text-base font-medium ml-12">
          {NAV.map((n) => (
            n.items ? (
              <div key={n.label} className="relative group">
                <Link
                  to={n.to}
                  className={`transition-colors duration-300 relative py-2 ${
                    isDarkText ? "text-foreground/75 hover:text-foreground" : "text-white/75 hover:text-white"
                  }`}
                >
                  {n.label}
                </Link>
                <div className="absolute left-0 top-full mt-2 w-56 rounded-2xl glass p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow-lg">
                  {n.items.map(sub => (
                    <Link key={sub.label} to={sub.to} className="block px-3 py-2 text-base text-foreground/80 hover:text-foreground hover:bg-white/50 rounded-lg transition-colors">
                      {sub.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={n.label}
                to={n.to}
                className={`transition-colors duration-300 relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-gradient-ocean hover:after:w-full after:transition-all ${
                  isDarkText ? "text-foreground/75 hover:text-foreground" : "text-white/75 hover:text-white"
                }`}
              >
                {n.label}
              </Link>
            )
          ))}
        </nav>

        <div className={`flex items-center gap-1.5 transition-colors duration-300 ${isDarkText ? "text-foreground" : "text-white"}`}>
          <button
            aria-label="Search"
            onClick={() => { setSearchOpen(!searchOpen); setUserMenuOpen(false); setOpen(false); }}
            className={`size-10 grid place-items-center rounded-full transition ${
              isDarkText ? "hover:bg-muted" : "hover:bg-white/10"
            }`}
          >
            {searchOpen ? <X className="size-[18px]" /> : <Search className="size-[18px]" />}
          </button>
          <div className="relative">
            <button
              aria-label="Account"
              onClick={() => { setUserMenuOpen(!userMenuOpen); setSearchOpen(false); setOpen(false); }}
              className={`size-10 grid place-items-center rounded-full transition ${
                isDarkText ? "hover:bg-muted" : "hover:bg-white/10"
              }`}
            >
              <User className="size-[18px]" />
            </button>
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-48 rounded-2xl glass p-2 shadow-lg"
                >
                  <a href="#" onClick={() => setUserMenuOpen(false)} className="block px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-white/50 rounded-lg transition-colors">Sign In</a>
                  <a href="#" onClick={() => setUserMenuOpen(false)} className="block px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-white/50 rounded-lg transition-colors">Create Account</a>
                  <div className="h-px bg-border my-1 mx-2" />
                  <a href="#" onClick={() => setUserMenuOpen(false)} className="block px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-white/50 rounded-lg transition-colors">My Orders</a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button
            aria-label="Cart"
            onClick={cart.open}
            className={`relative size-10 grid place-items-center rounded-full transition ${
              isDarkText ? "hover:bg-muted" : "hover:bg-white/10"
            }`}
          >
            <ShoppingBag className="size-[18px]" />
            {cart.count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-ocean text-white text-[10px] font-bold grid place-items-center">
                {cart.count}
              </span>
            )}
          </button>

          <button
            aria-label="Menu"
            onClick={() => setOpen(!open)}
            className={`lg:hidden size-10 grid place-items-center rounded-full transition ${
              isDarkText ? "hover:bg-muted" : "hover:bg-white/10"
            }`}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute top-full left-0 w-full glass border-t border-border/50 overflow-hidden shadow-[var(--shadow-float)]"
          >
            <div className="mx-auto max-w-7xl px-6 py-4 flex items-center gap-4">
              <Search className="size-5 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                placeholder="Search for pool pumps, heaters, brands..."
                className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/60 text-base"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <div key={n.label} className="grid gap-1">
                  <Link to={n.to} onClick={() => !n.items && setOpen(false)} className="text-foreground/80 hover:text-foreground py-1 font-semibold block">
                    {n.label}
                  </Link>
                  {n.items && (
                    <div className="pl-4 grid gap-1 border-l-2 border-border/50 ml-1 mt-1">
                      {n.items.map(sub => (
                        <Link key={sub.label} to={sub.to} onClick={() => setOpen(false)} className="text-foreground/60 hover:text-foreground py-1 text-base block">
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(false)}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-md"
          />
        )}
      </AnimatePresence>
    </>
  );
}
