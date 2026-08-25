import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { ServerCrash, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { CartProvider } from "@/components/site/cart-context";
import { AuthProvider } from "@/components/site/auth-context";
import { CartDrawer } from "@/components/site/CartDrawer";
import { getGlobalSettings } from "@/lib/api/settings.functions";
import { getProductsDb } from "@/lib/api/products.functions";
import { syncLocalProducts } from "@/lib/products";
import { Toaster } from "@/components/ui/sonner";
import { FloatingChat } from "@/components/FloatingChat";

// Suppress benign third-party browser extension message passing errors & hydration noise
if (typeof window !== "undefined") {
  // 1. Unhandled promise rejections from extensions (like Scrnli content-script-start.js)
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event?.reason;
    const msg = String(reason?.message || reason || "");
    const stack = String(reason?.stack || "");
    if (
      msg.includes("Could not establish connection") ||
      msg.includes("Receiving end does not exist") ||
      msg.includes("message port closed before a response was received") ||
      stack.includes("content-script") ||
      stack.includes("chrome-extension://") ||
      stack.includes("moz-extension://")
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  // 2. Global error events from extensions
  window.addEventListener("error", (event) => {
    const msg = String(event?.message || "");
    const filename = String(event?.filename || "");
    if (
      msg.includes("Could not establish connection") ||
      msg.includes("Receiving end does not exist") ||
      filename.includes("content-script") ||
      filename.includes("chrome-extension://") ||
      filename.includes("moz-extension://")
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  // 3. Filter React hydration mismatch caused by browser extension DOM mutations
  const originalConsoleError = console.error;
  console.error = function (...args: any[]) {
    const fullText = args.map((a) => (typeof a === "string" ? a : a?.message || "")).join(" ");
    if (
      fullText.includes("scrnli_recorder_root") ||
      fullText.includes("Could not establish connection. Receiving end does not exist") ||
      (fullText.includes("Hydration failed") && (fullText.includes("extension") || fullText.includes("scrnli"))) ||
      (fullText.includes("server rendered HTML didn't match the client") && fullText.includes("scrnli"))
    ) {
      return; // Safely ignore extension-injected DOM mismatches
    }
    originalConsoleError.apply(console, args);
  };
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Pool Supply Wholesalers — Wholesale to Retail Pool Equipment Supplier" },
      { name: "description", content: "America's top wholesale to retail distributor of commercial pool pumps, gas heaters, cartridge filters, salt chlorinators, and automation. Buy wholesale pool supplies directly at retail prices from hubs in Nashville TN, Los Angeles CA, Dallas TX, and Orlando FL." },
      { name: "keywords", content: "wholesale to retail pool supplies, wholesale to retail pool equipment, buy wholesale pool equipment at retail, wholesale pool supply distributor, retail pool supplies wholesale prices, commercial pool pumps, variable speed pool pumps, gas pool heaters, pool cartridge filters, salt chlorinators, pentair intelliflo, hayward tristar, jandy pro series, raypak pool heaters, pool automation systems, pool contractor trade pricing, pool supply Nashville TN, pool equipment distributor Los Angeles CA, wholesale pool supplies Dallas TX, commercial pool equipment Orlando FL" },
      { name: "author", content: "Pool Supply Wholesalers" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },

      { name: "theme-color", content: "#020617" },
      { property: "og:site_name", content: "Pool Supply Wholesalers" },
      { property: "og:title", content: "Pool Supply Wholesalers — Direct Wholesale to Retail Pool Equipment" },
      { property: "og:description", content: "Direct wholesale to retail access to Pentair, Hayward, Jandy & Raypak commercial pool pumps, heaters, filters & automation. Same-day shipping nationwide." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://poolsupplywholesalers.com/" },
      { property: "og:image", content: "https://poolsupplywholesalers.com/about-hero.png" },

      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Pool Supply Wholesalers — Wholesale to Retail Pool Supplies" },
      { name: "twitter:description", content: "Wholesale to retail distributor for pool builders, service pros, and homeowners. Fast shipping from TN, CA, TX, and FL hubs." },
      { name: "twitter:image", content: "https://poolsupplywholesalers.com/about-hero.png" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://js.stripe.com" },
      { rel: "dns-prefetch", href: "https://js.stripe.com" },
      { rel: "preconnect", href: "https://www.googletagmanager.com" },
      { rel: "dns-prefetch", href: "https://www.googletagmanager.com" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" },
      { rel: "canonical", href: "https://poolsupplywholesalers.com/" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Pool Supply Wholesalers",
      "alternateName": ["PSW", "Pool Supply Wholesalers Online"],
      "url": "https://poolsupplywholesalers.com",
      "description": "Pool Supply Wholesalers — wholesale pool supplies and commercial equipment online at trade pricing.",
      "publisher": {
        "@type": "Organization",
        "name": "Pool Supply Wholesalers",
        "url": "https://poolsupplywholesalers.com",
        "logo": "https://poolsupplywholesalers.com/assets/logo.png"
      },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://poolsupplywholesalers.com/shop/all?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": ["Organization", "WholesaleStore", "Store"],
      "name": "Pool Supply Wholesalers",
      "alternateName": ["Pool Supply Wholesalers LLC", "PSW Wholesale"],
      "url": "https://poolsupplywholesalers.com",
      "logo": "https://poolsupplywholesalers.com/assets/logo.png",
      "image": "https://poolsupplywholesalers.com/about-hero.png",
      "telephone": "+1-615-477-0407",
      "email": "sales@poolsupplywholesalers.com",
      "priceRange": "$$",
      "description": "America's premier wholesale to retail distributor of commercial pool equipment, variable speed pumps, gas heaters, cartridge filters, and automation systems from Pentair, Hayward, Jandy, and Raypak.",
      "founder": [
        {
          "@type": "Person",
          "name": "Jonathan Elio Rodriguez"
        },
        {
          "@type": "Person",
          "name": "David Elio Rodriguez"
        }
      ],
      "parentOrganization": {
        "@type": "Organization",
        "name": "Pools By Elio",
        "description": "Master pool construction and commercial aquatic contracting firm with 25+ years of industry leadership."
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-615-477-0407",
        "contactType": "customer service",
        "email": "sales@poolsupplywholesalers.com",
        "areaServed": "US",
        "availableLanguage": "English"
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "410 Scott Pike",
        "addressLocality": "Nashville",
        "addressRegion": "TN",
        "postalCode": "37207",
        "addressCountry": "US"
      },
      "areaServed": [
        { "@type": "State", "name": "Tennessee" },
        { "@type": "State", "name": "California" },
        { "@type": "State", "name": "Texas" },
        { "@type": "State", "name": "Florida" },
        { "@type": "Country", "name": "United States" }
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Wholesale to Retail Commercial Pool Equipment Catalog",
        "itemListElement": [
          { "@type": "OfferCatalog", "name": "Wholesale & Retail Variable Speed Pool Pumps" },
          { "@type": "OfferCatalog", "name": "Commercial & Residential Gas Pool Heaters" },
          { "@type": "OfferCatalog", "name": "Cartridge & Sand Pool Filters Wholesale to Retail" },
          { "@type": "OfferCatalog", "name": "Salt Water Chlorinators at Wholesale Pricing" },
          { "@type": "OfferCatalog", "name": "Smart Commercial & Retail Pool Automation" }
        ]
      }
    }
  ];

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var extIds = ['scrnli_recorder_root', 'loom-companion-mv3', 'grammarly-extension-root'];
                  for (var i = 0; i < extIds.length; i++) {
                    var el = document.getElementById(extIds[i]);
                    if (el && el.parentNode) {
                      el.parentNode.removeChild(el);
                    }
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const [isMaintenance, setIsMaintenance] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function checkMaintenance() {
      // Never block the admin dashboard
      if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
        return;
      }

      try {
        const res = await getGlobalSettings();
        if (isMounted) {
          if (res.success && res.settings?.maintenanceMode) {
            setIsMaintenance(true);
          } else {
            setIsMaintenance(false);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    checkMaintenance();
    return () => { isMounted = false; };
  }, []);

  if (isMaintenance && !router.state.location.pathname.startsWith("/admin")) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-6 text-center font-sans overflow-hidden bg-slate-900 selection:bg-white/20">
        {/* Background Blur Image */}
        <div
          className="absolute inset-0 z-0 opacity-50 scale-110"
          style={{
            backgroundImage: `url('https://res.cloudinary.com/dmanafb84/image/upload/v1780845960/pool-products/uinvsu9cddj77qn8nnvn.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(24px)'
          }}
        />

        {/* Glassmorphism Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-xl mx-auto rounded-[2.5rem] overflow-hidden p-10 sm:p-14 border border-white/20 shadow-2xl"
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            boxShadow: "0 30px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.3)"
          }}
        >
          <div className="absolute top-0 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6, type: "spring", stiffness: 200 }}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl relative"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.02))",
              border: "1px solid rgba(255,255,255,0.2)"
            }}
          >
            <div className="absolute inset-0 rounded-full border border-white/20 animate-[spin_5s_linear_infinite]" />
            <div className="absolute inset-2 rounded-full border border-white/10 animate-[spin_4s_linear_infinite_reverse]" />
            <ServerCrash className="w-10 h-10 sm:w-12 sm:h-12 text-white/90 drop-shadow-md" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-4xl sm:text-5xl font-black text-white mb-5 tracking-tight drop-shadow-sm"
          >
            System Upgrade
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-white/80 text-sm sm:text-base font-medium leading-relaxed mb-10 max-w-md mx-auto"
          >
            We are currently performing scheduled maintenance to serve you better. We'll be back online shortly with exciting new updates.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-black/20 border border-white/10 text-[11px] sm:text-xs font-bold text-white/90 uppercase tracking-[0.15em] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
            </span>
            Under Maintenance
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
          <CartDrawer />
          <Toaster />
          <FloatingChat />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

