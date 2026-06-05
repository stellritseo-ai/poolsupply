import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useCart } from "./router-DePSa50g.mjs";
import { m as motion, A as AnimatePresence } from "../_libs/framer-motion.mjs";
import { X, q as Search, U as User, S as ShoppingBag, r as Menu, o as Phone, b as Mail, n as MapPin } from "../_libs/lucide-react.mjs";
const logo = "/assets/logo-DdbW9O7g.png";
const NAV = [
  {
    label: "Shop",
    href: "#categories",
    items: [
      { label: "Pool Pumps", href: "#" },
      { label: "Pool Lights", href: "#" },
      { label: "Pool Cleaners", href: "#" },
      { label: "Pool Heaters", href: "#" },
      { label: "Electric Heat Pumps", href: "#" }
    ]
  },
  {
    label: "Shop By Brand",
    href: "#brands",
    items: [
      { label: "Hayward", href: "#" },
      { label: "Pentair", href: "#" },
      { label: "Jandy", href: "#" }
    ]
  },
  { label: "Product Finder", href: "#finder" },
  { label: "Why Us", href: "#why" },
  { label: "Reviews", href: "#testimonials" },
  { label: "Contact", href: "#cta" }
];
function Header({ alwaysDark } = {}) {
  const [scrolled, setScrolled] = reactExports.useState(false);
  const [open, setOpen] = reactExports.useState(false);
  const [searchOpen, setSearchOpen] = reactExports.useState(false);
  const [userMenuOpen, setUserMenuOpen] = reactExports.useState(false);
  const cart = useCart();
  const isDarkText = alwaysDark || scrolled || open || searchOpen || userMenuOpen;
  reactExports.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.header,
      {
        initial: { y: -40, opacity: 0 },
        animate: { y: 0, opacity: 1 },
        transition: { duration: 0.6, ease: "easeOut" },
        className: `fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isDarkText ? "glass py-3" : "bg-transparent py-5"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-6 flex items-center justify-between gap-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "flex items-center group", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: logo,
                alt: "Pool Supply Wholesalers Logo",
                className: `h-16 sm:h-20 w-auto object-contain transition-all duration-300 group-hover:scale-[1.02] ${isDarkText ? "" : "brightness-0 invert"}`
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "hidden lg:flex items-center gap-10 text-base font-medium ml-12", children: NAV.map((n) => n.items ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "a",
                {
                  href: n.href,
                  className: `transition-colors duration-300 relative py-2 ${isDarkText ? "text-foreground/75 hover:text-foreground" : "text-white/75 hover:text-white"}`,
                  children: n.label
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-0 top-full mt-2 w-56 rounded-2xl glass p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 translate-y-2 group-hover:translate-y-0 shadow-lg", children: n.items.map((sub) => /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: sub.href, className: "block px-3 py-2 text-base text-foreground/80 hover:text-foreground hover:bg-white/50 rounded-lg transition-colors", children: sub.label }, sub.label)) })
            ] }, n.label) : /* @__PURE__ */ jsxRuntimeExports.jsx(
              "a",
              {
                href: n.href,
                className: `transition-colors duration-300 relative after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-gradient-ocean hover:after:w-full after:transition-all ${isDarkText ? "text-foreground/75 hover:text-foreground" : "text-white/75 hover:text-white"}`,
                children: n.label
              },
              n.label
            )) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-1.5 transition-colors duration-300 ${isDarkText ? "text-foreground" : "text-white"}`, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  "aria-label": "Search",
                  onClick: () => {
                    setSearchOpen(!searchOpen);
                    setUserMenuOpen(false);
                    setOpen(false);
                  },
                  className: `size-10 grid place-items-center rounded-full transition ${isDarkText ? "hover:bg-muted" : "hover:bg-white/10"}`,
                  children: searchOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-[18px]" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "size-[18px]" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    "aria-label": "Account",
                    onClick: () => {
                      setUserMenuOpen(!userMenuOpen);
                      setSearchOpen(false);
                      setOpen(false);
                    },
                    className: `size-10 grid place-items-center rounded-full transition ${isDarkText ? "hover:bg-muted" : "hover:bg-white/10"}`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "size-[18px]" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: userMenuOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  motion.div,
                  {
                    initial: { opacity: 0, y: 10 },
                    animate: { opacity: 1, y: 0 },
                    exit: { opacity: 0, y: 10 },
                    className: "absolute right-0 top-full mt-2 w-48 rounded-2xl glass p-2 shadow-lg",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#", onClick: () => setUserMenuOpen(false), className: "block px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-white/50 rounded-lg transition-colors", children: "Sign In" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#", onClick: () => setUserMenuOpen(false), className: "block px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-white/50 rounded-lg transition-colors", children: "Create Account" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px bg-border my-1 mx-2" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#", onClick: () => setUserMenuOpen(false), className: "block px-3 py-2 text-sm text-foreground/80 hover:text-foreground hover:bg-white/50 rounded-lg transition-colors", children: "My Orders" })
                    ]
                  }
                ) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  "aria-label": "Cart",
                  onClick: cart.open,
                  className: `relative size-10 grid place-items-center rounded-full transition ${isDarkText ? "hover:bg-muted" : "hover:bg-white/10"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingBag, { className: "size-[18px]" }),
                    cart.count > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-ocean text-white text-[10px] font-bold grid place-items-center", children: cart.count })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  "aria-label": "Menu",
                  onClick: () => setOpen(!open),
                  className: `lg:hidden size-10 grid place-items-center rounded-full transition ${isDarkText ? "hover:bg-muted" : "hover:bg-white/10"}`,
                  children: open ? /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "size-5" })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: searchOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0, height: 0 },
              animate: { opacity: 1, height: "auto" },
              exit: { opacity: 0, height: 0 },
              className: "absolute top-full left-0 w-full glass border-t border-border/50 overflow-hidden shadow-[var(--shadow-float)]",
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-6 py-4 flex items-center gap-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "size-5 text-muted-foreground" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "input",
                  {
                    autoFocus: true,
                    type: "text",
                    placeholder: "Search for pool pumps, heaters, brands...",
                    className: "flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/60 text-base"
                  }
                )
              ] })
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: open && /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0, height: 0 },
              animate: { opacity: 1, height: "auto" },
              exit: { opacity: 0, height: 0 },
              className: "lg:hidden overflow-hidden glass mx-6 mt-3 rounded-2xl",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-5 grid gap-3", children: NAV.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: n.href, onClick: () => !n.items && setOpen(false), className: "text-foreground/80 hover:text-foreground py-1 font-semibold", children: n.label }),
                n.items && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pl-4 grid gap-1 border-l-2 border-border/50 ml-1 mt-1", children: n.items.map((sub) => /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: sub.href, onClick: () => setOpen(false), className: "text-foreground/60 hover:text-foreground py-1 text-base", children: sub.label }, sub.label)) })
              ] }, n.label)) })
            }
          ) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: searchOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        onClick: () => setSearchOpen(false),
        className: "fixed inset-0 z-40 bg-black/20 backdrop-blur-md"
      }
    ) })
  ] });
}
const cols = [
  { title: "Products", links: ["Pool Pumps", "Heaters", "Filters", "Lights", "Cleaners", "Automation"] },
  { title: "Brands", links: ["Pentair", "Hayward", "Jandy", "Raypak", "Zodiac", "Waterway"] },
  { title: "Support", links: ["Contact", "Shipping", "Returns", "Warranty", "Pro Account"] },
  { title: "Company", links: ["About", "Careers", "Press", "Blog", "Trade Program"] }
];
function Footer() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "bg-[oklch(0.16_0.02_256)] text-white/80", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-6 py-20", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-12 gap-12 mb-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "lg:col-span-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: logo,
            alt: "Pool Supply Wholesalers Logo",
            className: "h-20 w-auto object-contain brightness-0 invert"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-5 text-sm leading-relaxed max-w-sm", children: "Premium pool equipment and supplies at wholesale pricing — trusted by 5,000+ professionals across the United States since 2003." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { className: "mt-6 flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "email",
              placeholder: "Email for product updates",
              className: "flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-pool focus:ring-2 focus:ring-cyan-pool/20 transition-all duration-200"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "px-5 py-3 rounded-xl bg-gradient-ocean hover:opacity-90 hover:shadow-[0_0_15px_rgba(0,180,216,0.3)] text-white text-sm font-semibold transition-all duration-200 active:scale-[0.98]", children: "Subscribe" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 space-y-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Phone, { className: "size-4 text-[oklch(0.82_0.10_215)]" }),
            " (615) 477-0407"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "size-4 text-[oklch(0.82_0.10_215)]" }),
            " sales@poolsupplywholesalers.com"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "size-4 text-[oklch(0.82_0.10_215)]" }),
            " 410 Scott Pike, Nashville, TN"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8", children: cols.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-white font-semibold text-sm tracking-wide uppercase mb-4", children: c.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-2.5 text-sm", children: c.links.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#", className: "hover:text-white transition", children: l }) }, l)) })
      ] }, c.title)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-white/55", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " Pool Supply Wholesalers. All Rights Reserved."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: "Design By StellR IT LLC" })
    ] })
  ] }) });
}
export {
  Footer as F,
  Header as H
};
