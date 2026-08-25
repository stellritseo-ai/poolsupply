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
      { name: "description", content: "Shop 8,000+ pool supplies from Hayward, Pentair & Jandy at wholesale prices. Commercial & residential pool pumps, heaters, filters, cleaners & lights with fast shipping." },
      { name: "keywords", content: "pool supplies, pool equipment, wholesale pool supplies, commercial pool equipment, buy pool pumps wholesale, pentair intelliflo, hayward gas heaters, jandy equipment, variable speed pool pumps, commercial pool filters, salt chlorine generators" },
      { property: "og:site_name", content: "Pool Supply Wholesalers" },
      { property: "og:title", content: "Pool Supplies & Equipment | Wholesale Prices | Pool Supply Wholesalers" },
      { property: "og:description", content: "Shop 8,000+ pool supplies from Hayward, Pentair & Jandy at wholesale prices. Free fast shipping on commercial pool pumps, heaters, filters, and automation." },
      { property: "og:url", content: "https://poolsupplywholesalers.com/" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://poolsupplywholesalers.com/about-hero.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Pool Supplies & Equipment | Wholesale Prices | Pool Supply Wholesalers" },
      { name: "twitter:description", content: "Shop 8,000+ pool supplies from Hayward, Pentair & Jandy at wholesale prices. Fast shipping from US distribution hubs." },
      { name: "twitter:image", content: "https://poolsupplywholesalers.com/about-hero.png" },
    ],
    links: [{ rel: "canonical", href: "https://poolsupplywholesalers.com/" }],
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
