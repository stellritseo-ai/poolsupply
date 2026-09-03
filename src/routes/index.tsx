import { lazy, Suspense, useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";

// These heavy components are only loaded client-side (skipped during SSR)
// This keeps initial HTML small and fast-loading
const Categories = lazy(() =>
  import("@/components/site/Categories").then((m) => ({ default: m.Categories }))
);
const Brands = lazy(() =>
  import("@/components/site/Brands").then((m) => ({ default: m.Brands }))
);
const BestSellers = lazy(() =>
  import("@/components/site/BestSellers").then((m) => ({ default: m.BestSellers }))
);
const WhyUs = lazy(() =>
  import("@/components/site/WhyUs").then((m) => ({ default: m.WhyUs }))
);
const Finder = lazy(() =>
  import("@/components/site/Finder").then((m) => ({ default: m.Finder }))
);
const Testimonials = lazy(() =>
  import("@/components/site/Testimonials").then((m) => ({ default: m.Testimonials }))
);
const ContactUs = lazy(() =>
  import("@/components/site/ContactUs").then((m) => ({ default: m.ContactUs }))
);
const CTA = lazy(() =>
  import("@/components/site/CTA").then((m) => ({ default: m.CTA }))
);
const Footer = lazy(() =>
  import("@/components/site/Footer").then((m) => ({ default: m.Footer }))
);

// Lightweight skeleton placeholder while section loads
function SectionSkeleton({ height = "300px", className = "" }: { height?: string; className?: string }) {
  return (
    <div
      className={`w-full bg-gradient-to-r from-slate-50 via-white to-slate-50 ${className}`}
      style={{ minHeight: height }}
      aria-hidden="true"
    />
  );
}

// ClientOnly wrapper — renders nothing on SSR, then lazy-loads on client
function ClientOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}

export const Route = createFileRoute("/")(({
  head: () => ({
    meta: [
      { title: "Pool Supplies & Equipment | Wholesale Prices | Pool Supply Wholesalers" },
      { name: "description", content: "Shop 8,000+ pool supplies from Hayward, Pentair & Jandy at wholesale to retail prices. Commercial & residential pool pumps, heaters, filters, cleaners & lights with same-day shipping from Nashville TN, LA, Dallas TX, and Orlando FL." },
      { name: "keywords", content: "pool supplies wholesale, pool equipment wholesale prices, buy pool equipment online, wholesale to retail pool supplies, commercial pool pumps Pentair, Hayward variable speed pumps, Jandy pool heaters wholesale, Raypak pool heaters, cartridge pool filters, salt chlorine generators wholesale, pool automation systems, LED pool lights, robotic pool cleaners, pool supply distributor USA, pool equipment Nashville TN, pool supplies Los Angeles, wholesale pool Dallas TX, pool equipment Orlando FL" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { property: "og:site_name", content: "Pool Supply Wholesalers" },
      { property: "og:title", content: "Pool Supplies & Equipment | Wholesale Prices | Pool Supply Wholesalers" },
      { property: "og:description", content: "Shop 8,000+ pool supplies from Hayward, Pentair & Jandy at wholesale prices. Free fast shipping on commercial pool pumps, heaters, filters, and automation." },
      { property: "og:url", content: "https://poolsupplywholesalers.com/" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://poolsupplywholesalers.com/about-hero.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Pool Supplies & Equipment | Wholesale Prices | Pool Supply Wholesalers" },
      { name: "twitter:description", content: "Shop 8,000+ pool supplies from Hayward, Pentair & Jandy at wholesale prices. Fast shipping from US distribution hubs." },
      { name: "twitter:image", content: "https://poolsupplywholesalers.com/about-hero.png" },
    ],
    links: [{ rel: "canonical", href: "https://poolsupplywholesalers.com/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Pool Equipment Categories",
          "description": "Wholesale to retail pool equipment categories available at Pool Supply Wholesalers",
          "url": "https://poolsupplywholesalers.com",
          "numberOfItems": 6,
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Variable Speed Pool Pumps", "url": "https://poolsupplywholesalers.com/shop/pumps", "description": "Pentair IntelliFloXF, Hayward TriStar VS, Jandy FloPro VS at wholesale pricing" },
            { "@type": "ListItem", "position": 2, "name": "Gas & Propane Pool Heaters", "url": "https://poolsupplywholesalers.com/shop/heaters", "description": "Pentair MasterTemp, Hayward H-Series, Jandy JXi and Raypak heaters at wholesale" },
            { "@type": "ListItem", "position": 3, "name": "Pool Cartridge & Sand Filters", "url": "https://poolsupplywholesalers.com/shop/filters", "description": "Pentair Clean & Clear Plus, Hayward C-Series, and Jandy DEV DE filters" },
            { "@type": "ListItem", "position": 4, "name": "Salt Chlorine Generators", "url": "https://poolsupplywholesalers.com/shop/automation", "description": "Pentair IntelliChlor, Hayward AquaRite, and Jandy AquaPure salt systems" },
            { "@type": "ListItem", "position": 5, "name": "Pool Automation Systems", "url": "https://poolsupplywholesalers.com/shop/automation", "description": "Pentair EasyTouch & IntelliConnect, Hayward OmniLogic, Jandy AquaLink automation" },
            { "@type": "ListItem", "position": 6, "name": "LED Pool Lights & Robotic Cleaners", "url": "https://poolsupplywholesalers.com/shop/lights", "description": "Pentair IntelliBrite, Hayward ColorLogic, Dolphin robotic cleaners wholesale" }
          ]
        })
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          "name": "How to Buy Pool Equipment at Wholesale Prices",
          "description": "A guide to purchasing commercial and residential pool equipment at wholesale to retail pricing from Pool Supply Wholesalers",
          "totalTime": "PT10M",
          "supply": [
            { "@type": "HowToSupply", "name": "Pool pump specifications" },
            { "@type": "HowToSupply", "name": "Pool volume in gallons" }
          ],
          "step": [
            { "@type": "HowToStep", "position": 1, "name": "Use the Equipment Sizing Wizard", "text": "Enter your pool dimensions and current equipment to get personalized equipment recommendations.", "url": "https://poolsupplywholesalers.com/finder" },
            { "@type": "HowToStep", "position": 2, "name": "Browse by Equipment Category", "text": "Shop pumps, heaters, filters, automation, and more from Pentair, Hayward, Jandy, and Raypak.", "url": "https://poolsupplywholesalers.com/shop/all" },
            { "@type": "HowToStep", "position": 3, "name": "Add to Cart & Checkout", "text": "All prices are already at wholesale to retail pricing. No account required for checkout.", "url": "https://poolsupplywholesalers.com/shop/all" }
          ]
        })
      }
    ]
  }),
  component: Index,
} as any));

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Critical path: Header + Hero always SSR'd for fast LCP */}
      <Header />
      <main>
        <Hero />

        {/* All below-the-fold sections: client-only to avoid SSR HTML bloat */}
        <ClientOnly fallback={<SectionSkeleton height="480px" />}>
          <Suspense fallback={<SectionSkeleton height="480px" />}>
            <Categories />
          </Suspense>
        </ClientOnly>

        <ClientOnly fallback={<SectionSkeleton height="200px" />}>
          <Suspense fallback={<SectionSkeleton height="200px" />}>
            <Brands />
          </Suspense>
        </ClientOnly>

        <ClientOnly fallback={<SectionSkeleton height="480px" />}>
          <Suspense fallback={<SectionSkeleton height="480px" />}>
            <BestSellers />
          </Suspense>
        </ClientOnly>

        <ClientOnly fallback={<SectionSkeleton height="380px" />}>
          <Suspense fallback={<SectionSkeleton height="380px" />}>
            <WhyUs />
          </Suspense>
        </ClientOnly>

        <ClientOnly fallback={<SectionSkeleton height="600px" />}>
          <Suspense fallback={<SectionSkeleton height="600px" />}>
            <Finder />
          </Suspense>
        </ClientOnly>

        <ClientOnly fallback={<SectionSkeleton height="380px" />}>
          <Suspense fallback={<SectionSkeleton height="380px" />}>
            <Testimonials />
          </Suspense>
        </ClientOnly>

        <ClientOnly fallback={<SectionSkeleton height="380px" />}>
          <Suspense fallback={<SectionSkeleton height="380px" />}>
            <ContactUs />
          </Suspense>
        </ClientOnly>

        <ClientOnly fallback={<SectionSkeleton height="200px" />}>
          <Suspense fallback={<SectionSkeleton height="200px" />}>
            <CTA />
          </Suspense>
        </ClientOnly>
      </main>

      <ClientOnly fallback={<SectionSkeleton height="280px" />}>
        <Suspense fallback={<SectionSkeleton height="280px" />}>
          <Footer />
        </Suspense>
      </ClientOnly>
    </div>
  );
}
