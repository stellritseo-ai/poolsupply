import { useEffect, useState } from "react";
import {
  Search, User, ShoppingBag, Menu, X, Loader2, ChevronDown, ChevronRight,
  Cpu, Wind, Pipette, Sparkles, Filter, Flame, Lightbulb, Zap, Waves, Box,
  Package, Wrench, Layers, Droplets, Scale, ShieldAlert, FlaskConical,
  LayoutGrid, Brush, Shield, ShieldCheck, Info, Award, Star, PhoneCall,
  Phone, ArrowRight, LogOut, BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "@tanstack/react-router";
import { useCart } from "./cart-context";
import { useAuth } from "./auth-context";
import { AuthModal } from "./AuthModal";
import logo from "@/assets/logo.png";
import { searchProductsDb } from "@/lib/api/products.functions";
import { Product, getProductImage } from "@/lib/products";

const NAV = [
  { label: "Shop All", to: "/shop/all" },
  {
    label: "Pool & Spa",
    to: "/shop/pool-spa",
    items: [
      { label: "Automation", to: "/shop/automation", icon: Cpu },
      { label: "Blowers", to: "/shop/blowers", icon: Wind },
      { label: "Chlorine Feeders", to: "/shop/chlorine-feeders", icon: Pipette },
      { label: "Cleaners", to: "/shop/cleaners", icon: Sparkles },
      { label: "Filters", to: "/shop/filters", icon: Filter },
      { label: "Heaters", to: "/shop/heaters", icon: Flame },
      { label: "Lights", to: "/shop/lights", icon: Lightbulb },
      { label: "Pumps", to: "/shop/pumps", icon: Zap },
      { label: "Salt Systems", to: "/shop/salt-systems", icon: Waves },
      { label: "Skid Systems", to: "/shop/skid-systems", icon: Box },
    ],
  },
  {
    label: "Parts & Hardware",
    to: "/shop/parts-hardware",
    items: [
      { label: "Bulk", to: "/shop/bulk", icon: Package },
      { label: "Motors", to: "/shop/motors", icon: Cpu },
      { label: "Plumbing", to: "/shop/plumbing", icon: Wrench },
      { label: "Pool Kits", to: "/shop/pool-kits", icon: Layers },
    ],
  },
  {
    label: "Chemicals",
    to: "/shop/chemicals",
    items: [
      { label: "Algaecides", to: "/shop/algaecides", icon: Droplets },
      { label: "Balancers", to: "/shop/balancers", icon: Scale },
      { label: "Cal-Hypo", to: "/shop/cal-hypo", icon: ShieldAlert },
      { label: "Dichlor", to: "/shop/dichlor", icon: FlaskConical },
    ],
  },
  {
    label: "Maintenance & Cleaning",
    to: "/shop/maintenance-cleaning",
    items: [
      { label: "Deck Products", to: "/shop/deck-products", icon: LayoutGrid },
      { label: "Maintenance", to: "/shop/maintenance", icon: Brush },
      { label: "Plaster", to: "/shop/plaster", icon: Shield },
    ],
  },
  {
    label: "Safety & Accessibility",
    to: "/shop/safety-accessibility",
    items: [
      { label: "Ladders & Rails", to: "/shop/ladders-and-rails", icon: ShieldCheck },
    ],
  },
];

const MORE_MENU = [
  { label: "About Us", to: "/about", icon: Info },
  { label: "Blog", to: "/blog", icon: BookOpen },
  { label: "Product Finder", to: "/finder", icon: Sparkles },
  { label: "Why Us", to: "/why-us", icon: Award },
  { label: "Reviews", to: "/reviews", icon: Star },
  { label: "Contact", to: "/contact", icon: PhoneCall },
];

export function Header({ alwaysDark }: { alwaysDark?: boolean } = {}) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Pool & Spa");

  const cart = useCart();
  const { user, logout, openAuthModal } = useAuth();
  const isDarkText = alwaysDark || scrolled || mobileMenuOpen || searchOpen || userMenuOpen;

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.trim();
    setSearchOpen(false);
    setMobileMenuOpen(false);
    setSearchQuery("");
    navigate({ to: "/shop/$category", params: { category: "all" }, search: { q: query } });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchProductsDb({ data: { query: searchQuery } });
        if (res.success && res.products) {
          setSearchResults(res.products);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error("Search API error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!searchOpen) {
      setSearchQuery("");
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-colors duration-200 py-2.5 sm:py-3.5 ${isDarkText ? "glass" : "bg-transparent"
          }`}
      >
        <div className="mx-auto max-w-[1536px] px-4 sm:px-8 xl:px-12 flex items-center justify-between gap-3 xl:gap-8">
          {/* Logo */}
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center shrink-0 group">
            <img
              src={logo}
              alt="Pool Supply Wholesalers Logo"
              className={`h-10 sm:h-12 xl:h-16 w-auto object-contain group-hover:scale-[1.02] transition-transform duration-200 ${isDarkText ? "" : "brightness-0 invert"
                }`}
            />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-3 lg:gap-4 xl:gap-5 text-[15px] font-semibold tracking-tight ml-auto mr-0">
            {NAV.map((n) => (
              n.items ? (
                <div key={n.label} className="relative group shrink-0">
                  <Link
                    to={n.to}
                    className={`transition-colors duration-300 relative py-2 flex items-center gap-1.5 whitespace-nowrap ${isDarkText ? "text-foreground/85 hover:text-foreground" : "text-white/85 hover:text-white"
                      }`}
                  >
                    {n.label}
                    <ChevronDown className="size-3.5 opacity-70 group-hover:rotate-180 transition-transform duration-300" />
                  </Link>
                  <div className={`absolute left-0 top-full mt-2.5 rounded-[1.25rem] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 ease-out origin-top-left scale-95 group-hover:scale-100 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.18),0_10px_20px_-5px_rgba(0,0,0,0.06)] border border-border/50 before:absolute before:-top-3 before:left-0 before:w-full before:h-4 ${n.items.length > 6 ? "w-[460px] p-3.5 grid grid-cols-2 gap-1.5" : "w-60 p-2.5 grid gap-1"
                    }`}>
                    {n.items.map(sub => {
                      const Icon = sub.icon;
                      return (
                        <Link
                          key={sub.label}
                          to={sub.to}
                          className="group/sub flex items-center justify-between px-3 py-2 text-[13.5px] font-semibold text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-150 truncate"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 truncate">
                            {Icon && <Icon className="size-4 text-primary/75 group-hover/sub:text-primary group-hover/sub:scale-110 transition-all shrink-0" />}
                            <span className="truncate">{sub.label}</span>
                          </div>
                          <ChevronRight className="size-3.5 opacity-0 -translate-x-1.5 group-hover/sub:opacity-100 group-hover/sub:translate-x-0 transition-all text-primary shrink-0 ml-1" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <Link
                  key={n.label}
                  to={n.to}
                  className={`transition-colors duration-300 relative whitespace-nowrap shrink-0 after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-gradient-ocean hover:after:w-full after:transition-all ${isDarkText ? "text-foreground/85 hover:text-foreground" : "text-white/85 hover:text-white"
                    }`}
                >
                  {n.label}
                </Link>
              )
            ))}
          </nav>

          {/* Right Icons Row */}
          <div className={`flex items-center gap-1 sm:gap-1.5 transition-colors duration-300 ${isDarkText ? "text-foreground" : "text-white"}`}>
            {/* Search Trigger */}
            <button
              aria-label="Search"
              onClick={() => { setSearchOpen(!searchOpen); setUserMenuOpen(false); setMoreMenuOpen(false); setMobileMenuOpen(false); }}
              className={`size-9 sm:size-10 grid place-items-center rounded-full transition cursor-pointer ${isDarkText ? "hover:bg-muted" : "hover:bg-white/10"
                }`}
            >
              {searchOpen ? <X className="size-[18px]" /> : <Search className="size-[18px]" />}
            </button>

            {/* Account / User Menu */}
            <div className="relative">
              <button
                aria-label="Account"
                onClick={() => { setUserMenuOpen(!userMenuOpen); setSearchOpen(false); setMoreMenuOpen(false); setMobileMenuOpen(false); }}
                className={`size-9 sm:size-10 grid place-items-center rounded-full transition cursor-pointer overflow-hidden ${isDarkText ? "hover:bg-muted" : "hover:bg-white/10"
                  }`}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="size-7 sm:size-8 rounded-full object-cover ring-1 ring-cyan-500/40"
                  />
                ) : (
                  <User className="size-[18px]" />
                )}
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-48 rounded-2xl glass p-2 shadow-lg z-50"
                  >
                    {!user ? (
                      <>
                        <button onClick={() => { setUserMenuOpen(false); openAuthModal("login"); }} className="w-full text-left px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-white/50 rounded-lg transition-colors font-medium cursor-pointer">Sign In</button>
                        <button onClick={() => { setUserMenuOpen(false); openAuthModal("register"); }} className="w-full text-left px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-white/50 rounded-lg transition-colors font-medium cursor-pointer">Create Account</button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40 mb-1">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="size-6 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="size-6 rounded-full bg-cyan-500/10 text-cyan-600 grid place-items-center shrink-0">
                              <User className="size-3.5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-foreground truncate">
                              {user.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              {user.email || user.phone}
                            </div>
                          </div>
                        </div>
                        <Link to="/account" onClick={() => setUserMenuOpen(false)} className="block px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-white/50 rounded-lg transition-colors font-medium">My Account & Orders</Link>
                        <div className="h-px bg-border my-1 mx-2" />
                        <button onClick={() => { setUserMenuOpen(false); logout(); }} className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors font-medium cursor-pointer">Sign Out</button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart Icon */}
            <button
              aria-label="Cart"
              onClick={cart.open}
              className={`relative size-9 sm:size-10 grid place-items-center rounded-full transition cursor-pointer ${isDarkText ? "hover:bg-muted" : "hover:bg-white/10"
                }`}
            >
              <ShoppingBag className="size-[18px]" />
              {cart.count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-ocean text-white text-[10px] font-bold grid place-items-center">
                  {cart.count}
                </span>
              )}
            </button>

            {/* Desktop More Options Menu */}
            <div className="relative hidden lg:block">
              <button
                aria-label="More Options"
                onClick={() => { setMoreMenuOpen(!moreMenuOpen); setSearchOpen(false); setUserMenuOpen(false); }}
                className={`group relative size-10 grid place-items-center rounded-full transition-all duration-300 backdrop-blur-md shadow-sm border cursor-pointer ${moreMenuOpen
                  ? "bg-primary text-white border-primary shadow-md scale-105"
                  : isDarkText
                    ? "bg-white/80 hover:bg-white text-foreground border-border/60 hover:border-primary/40 hover:shadow-md hover:scale-105"
                    : "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40 hover:scale-105"
                  }`}
              >
                {moreMenuOpen ? (
                  <X className="size-4 transition-transform duration-300 rotate-0 group-hover:rotate-90" />
                ) : (
                  <Menu className="size-4 transition-transform duration-300 group-hover:scale-110" />
                )}
              </button>

              <AnimatePresence>
                {moreMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-3 w-64 rounded-[1.25rem] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.2),0_10px_20px_-5px_rgba(0,0,0,0.08)] border border-border/60 z-50 grid gap-1"
                  >
                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/40 mb-1">
                      <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-widest">Navigation & Info</span>
                      <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                    </div>
                    {MORE_MENU.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.label}
                          to={item.to}
                          onClick={() => setMoreMenuOpen(false)}
                          className="flex items-center justify-between px-3.5 py-2.5 text-[13.5px] font-semibold text-foreground/85 hover:text-primary hover:bg-primary/5 rounded-xl transition-all duration-150 group/item"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="size-8 rounded-lg bg-muted/60 group-hover/item:bg-primary/10 grid place-items-center transition-colors shrink-0">
                              <Icon className="size-4 text-primary/80 group-hover/item:text-primary transition-colors" />
                            </div>
                            <span className="truncate">{item.label}</span>
                          </div>
                          <ChevronRight className="size-3.5 opacity-0 -translate-x-1.5 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all text-primary shrink-0 ml-1" />
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Hamburger Button (< lg) */}
            <button
              aria-label="Open Mobile Menu"
              onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setSearchOpen(false); setUserMenuOpen(false); setMoreMenuOpen(false); }}
              className={`lg:hidden size-9 sm:size-10 grid place-items-center rounded-full transition-all duration-300 border cursor-pointer ${mobileMenuOpen
                ? "bg-slate-900 text-white border-slate-800"
                : isDarkText
                  ? "bg-white/80 text-foreground border-border/60 hover:bg-white"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                }`}
            >
              {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Dropdown Live Search Box */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute top-full left-0 w-full glass border-t border-border/50 overflow-hidden shadow-[var(--shadow-float)]"
            >
              <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-col gap-3">
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 bg-white/70 border border-border/60 rounded-2xl px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <Search className="size-5 text-[oklch(0.50_0.14_232)] shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Product Name, SKU, Brand..."
                    className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/60 text-sm sm:text-base"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-xs font-bold text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted transition cursor-pointer"
                    >
                      Clear
                    </button>
                  ) : (
                    <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground/60 bg-muted/60 px-2 py-1 rounded">
                      Press Enter
                    </span>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-[oklch(0.50_0.14_232)] text-white text-xs font-bold hover:opacity-90 transition shadow-sm cursor-pointer"
                  >
                    Search
                  </button>
                </form>

                {/* Popular Tags when search is empty */}
                {!searchQuery && (
                  <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                    <span className="font-extrabold text-muted-foreground uppercase text-[10px] tracking-wider">Popular Searches:</span>
                    {["Pentair", "Hayward", "Pool Pumps", "Heaters", "Filters", "Automation"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSearchQuery(tag)}
                        className="px-2.5 py-1 rounded-full bg-white/80 border border-border/80 text-foreground/80 hover:bg-[oklch(0.50_0.14_232)] hover:text-white transition text-[11px] font-bold cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}

                {/* Dynamic search results list */}
                {(isSearching || searchResults.length > 0 || searchQuery.trim() !== "") && (
                  <div className="border-t border-border/40 pt-3 max-h-[380px] overflow-y-auto space-y-2 pb-2 scrollbar-thin">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-10 gap-2.5 text-muted-foreground text-sm font-semibold">
                        <Loader2 className="size-5 animate-spin text-[oklch(0.50_0.14_232)]" />
                        Searching catalog...
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between px-2 pb-2">
                          <span className="text-xs font-bold text-muted-foreground">
                            Found <strong className="text-foreground">{searchResults.length}</strong> matching item{searchResults.length !== 1 ? "s" : ""}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleSearchSubmit()}
                            className="text-xs font-bold text-[oklch(0.50_0.14_232)] hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            View all results <ChevronRight className="size-3.5" />
                          </button>
                        </div>
                        <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
                          {searchResults.map((product) => (
                            <Link
                              key={product.id}
                              to="/products/$productId"
                              params={{ productId: product.id }}
                              onClick={() => {
                                setSearchOpen(false);
                                setSearchQuery("");
                              }}
                              className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/60 border border-transparent hover:border-border/40 transition-all group"
                            >
                              <div className="size-12 rounded-xl bg-white border border-border/50 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                                <img
                                  src={getProductImage(product.img)}
                                  alt={product.name}
                                  className="size-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                                  onError={(e) => {
                                    if (!e.currentTarget.src.includes("commingsoon")) e.currentTarget.src = "/assets/commingsoon.png";
                                  }}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                  <span className="text-[9px] uppercase font-black text-[oklch(0.50_0.14_232)] tracking-widest">{product.brand}</span>
                                  {product.sku && (
                                    <span className="text-[9px] font-mono font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                      SKU: {product.sku}
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors capitalize">{product.name}</h4>
                              </div>
                              <div className="text-right shrink-0">
                                <div className="text-sm font-black text-[oklch(0.50_0.14_232)]">${product.price.toLocaleString()}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-10 text-muted-foreground text-sm space-y-2">
                        <p className="font-bold text-foreground">No products found matching "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* FULLY RESPONSIVE MOBILE NAVIGATION DRAWER (< lg) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
            />

            {/* Mobile Navigation Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[85%] max-w-sm bg-slate-900 text-white border-l border-slate-800 shadow-2xl flex flex-col lg:hidden overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
                <div className="flex items-center gap-2">
                  <img src={logo} alt="Logo" className="h-9 w-auto brightness-0 invert" />
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="size-9 rounded-full bg-slate-800 text-slate-300 hover:text-white grid place-items-center transition cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Scrollable Navigation Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin">
                {/* Search Bar in Mobile Menu */}
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search equipment, SKU..."
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  <Search className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                </form>

                {/* Main Product Categories Accordion */}
                <div className="space-y-2">
                  <span className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 px-1 mb-2">
                    Product Categories
                  </span>

                  {NAV.map((item) => {
                    const isExpanded = expandedCategory === item.label;
                    return (
                      <div key={item.label} className="rounded-2xl bg-slate-800/60 border border-slate-800 overflow-hidden">
                        {item.items ? (
                          <>
                            <button
                              onClick={() => setExpandedCategory(isExpanded ? null : item.label)}
                              className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-slate-200 hover:text-white transition cursor-pointer"
                            >
                              <span>{item.label}</span>
                              <ChevronDown className={`size-4 text-slate-400 transition-transform duration-200 ${isExpanded ? "rotate-180 text-cyan-400" : ""}`} />
                            </button>

                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="border-t border-slate-800/80 bg-slate-900/60 p-2 grid grid-cols-2 gap-1.5"
                                >
                                  {item.items.map((sub) => {
                                    const Icon = sub.icon;
                                    return (
                                      <Link
                                        key={sub.label}
                                        to={sub.to}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-800 text-[11px] font-semibold text-slate-300 hover:text-cyan-400 transition"
                                      >
                                        {Icon && <Icon className="size-3.5 text-cyan-400 shrink-0" />}
                                        <span className="truncate">{sub.label}</span>
                                      </Link>
                                    );
                                  })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        ) : (
                          <Link
                            to={item.to}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block p-3.5 text-xs font-bold text-slate-200 hover:text-cyan-400 transition"
                          >
                            {item.label}
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Additional Quick Pages */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 px-1 mb-2">
                    Quick Navigation
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    {MORE_MENU.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.label}
                          to={item.to}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white transition"
                        >
                          <Icon className="size-4 text-cyan-400 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Phone & Support Footer in Mobile Drawer */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/60 to-slate-900 border border-cyan-800/50 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 block">Wholesale Hotline</span>
                  <a href="tel:6154770407" className="flex items-center gap-2 text-sm font-black text-white hover:text-cyan-300 transition">
                    <Phone className="size-4 text-cyan-400" /> (615) 477-0407
                  </a>
                </div>
              </div>

              {/* Drawer Footer (Auth & Account) */}
              <div className="p-4 border-t border-slate-800 bg-slate-950/90 space-y-2">
                {!user ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setMobileMenuOpen(false); openAuthModal("login"); }}
                      className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition text-center cursor-pointer"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => { setMobileMenuOpen(false); openAuthModal("register"); }}
                      className="py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs transition text-center cursor-pointer shadow-md"
                    >
                      Register
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">Hi, {user.name}</div>
                      <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
                    </div>
                    <button
                      onClick={() => { setMobileMenuOpen(false); logout(); }}
                      className="p-2 rounded-xl bg-slate-800 text-rose-400 hover:bg-rose-950/50 transition cursor-pointer shrink-0"
                      title="Sign Out"
                    >
                      <LogOut className="size-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
      <AuthModal />
    </>
  );
}
