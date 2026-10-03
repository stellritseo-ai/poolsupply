import { lazy, Suspense } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";

// Below-the-fold sections are code-split but still server-rendered (streamed via
// Suspense) so crawlers receive their headings, links and copy in the HTML.
const Categories = lazy(() =>
  import("@/components/site/Categories").then((m) => ({ default: m.Categories })),
);
const Brands = lazy(() => import("@/components/site/Brands").then((m) => ({ default: m.Brands })));
const BestSellers = lazy(() =>
  import("@/components/site/BestSellers").then((m) => ({ default: m.BestSellers })),
);
const WhyUs = lazy(() => import("@/components/site/WhyUs").then((m) => ({ default: m.WhyUs })));
const Finder = lazy(() => import("@/components/site/Finder").then((m) => ({ default: m.Finder })));
const Testimonials = lazy(() =>
  import("@/components/site/Testimonials").then((m) => ({ default: m.Testimonials })),
);
const ContactUs = lazy(() =>
  import("@/components/site/ContactUs").then((m) => ({ default: m.ContactUs })),
);
const CTA = lazy(() => import("@/components/site/CTA").then((m) => ({ default: m.CTA })));
const Footer = lazy(() => import("@/components/site/Footer").then((m) => ({ default: m.Footer })));

// Lightweight skeleton placeholder while section loads
function SectionSkeleton({
  height = "300px",
  className = "",
}: {
  height?: string;
  className?: string;
}) {
  return (
    <div
      className={`w-full bg-gradient-to-r from-slate-50 via-white to-slate-50 ${className}`}
      style={{ minHeight: height }}
      aria-hidden="true"
    />
  );
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Wholesale Pool Supplies USA | Commercial Pool Equipment Direct" },
      {
        name: "description",
        content:
          "Buy commercial & residential pool supplies wholesale online across the USA. 8,000+ pumps, heaters, filters & salt systems from Pentair, Hayward & Jandy with fast nationwide shipping.",
      },
      {
        name: "keywords",
        content:
          "wholesale pool supplies USA, buy pool supplies online United States, commercial pool equipment wholesale, discount pool supplies USA, pool pumps wholesale, pool heaters wholesale USA, pentair distributor USA, hayward pool equipment wholesale, trade pricing pool supplies, pool supply distributor USA",
      },
      {
        name: "robots",
        content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { property: "og:site_name", content: "Pool Supply Wholesalers" },
      {
        property: "og:title",
        content: "Wholesale Pool Supplies USA | Commercial Pool Equipment Direct",
      },
      {
        property: "og:description",
        content:
          "Buy commercial & residential pool supplies wholesale online across the USA. 8,000+ pumps, heaters, filters & salt systems with fast nationwide shipping.",
      },
      { property: "og:url", content: "https://poolsupplywholesalers.com/" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://poolsupplywholesalers.com/about-hero.png" },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "Wholesale Pool Supplies USA | Commercial Pool Equipment Direct",
      },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@poolsupplywholesalers" },
      { name: "twitter:creator", content: "@poolsupplywholesalers" },
      {
        name: "twitter:title",
        content: "Wholesale Pool Supplies USA | Commercial Pool Equipment Direct",
      },
      {
        name: "twitter:description",
        content:
          "Buy commercial & residential pool supplies wholesale online across the USA. Fast nationwide shipping from US distribution hubs.",
      },
      { name: "twitter:image", content: "https://poolsupplywholesalers.com/about-hero.png" },
    ],
    links: [{ rel: "canonical", href: "https://poolsupplywholesalers.com/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Pool Equipment Categories",
          description:
            "Wholesale to retail pool equipment categories available at Pool Supply Wholesalers",
          url: "https://poolsupplywholesalers.com",
          numberOfItems: 6,
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Variable Speed Pool Pumps",
              url: "https://poolsupplywholesalers.com/shop/pumps",
              description:
                "Pentair IntelliFloXF, Hayward TriStar VS, Jandy FloPro VS at wholesale pricing",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Gas & Propane Pool Heaters",
              url: "https://poolsupplywholesalers.com/shop/heaters",
              description:
                "Pentair MasterTemp, Hayward H-Series, Jandy JXi and Raypak heaters at wholesale",
            },
            {
              "@type": "ListItem",
              position: 3,
              name: "Pool Cartridge & Sand Filters",
              url: "https://poolsupplywholesalers.com/shop/filters",
              description: "Pentair Clean & Clear Plus, Hayward C-Series, and Jandy DEV DE filters",
            },
            {
              "@type": "ListItem",
              position: 4,
              name: "Salt Chlorine Generators",
              url: "https://poolsupplywholesalers.com/shop/automation",
              description:
                "Pentair IntelliChlor, Hayward AquaRite, and Jandy AquaPure salt systems",
            },
            {
              "@type": "ListItem",
              position: 5,
              name: "Pool Automation Systems",
              url: "https://poolsupplywholesalers.com/shop/automation",
              description:
                "Pentair EasyTouch & IntelliConnect, Hayward OmniLogic, Jandy AquaLink automation",
            },
            {
              "@type": "ListItem",
              position: 6,
              name: "LED Pool Lights & Robotic Cleaners",
              url: "https://poolsupplywholesalers.com/shop/lights",
              description:
                "Pentair IntelliBrite, Hayward ColorLogic, Dolphin robotic cleaners wholesale",
            },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "How to Buy Pool Equipment at Wholesale Prices",
          description:
            "A guide to purchasing commercial and residential pool equipment at wholesale to retail pricing from Pool Supply Wholesalers",
          totalTime: "PT10M",
          supply: [
            { "@type": "HowToSupply", name: "Pool pump specifications" },
            { "@type": "HowToSupply", name: "Pool volume in gallons" },
          ],
          step: [
            {
              "@type": "HowToStep",
              position: 1,
              name: "Use the Equipment Sizing Wizard",
              text: "Enter your pool dimensions and current equipment to get personalized equipment recommendations.",
              url: "https://poolsupplywholesalers.com/finder",
            },
            {
              "@type": "HowToStep",
              position: 2,
              name: "Browse by Equipment Category",
              text: "Shop pumps, heaters, filters, automation, and more from Pentair, Hayward, Jandy, and Raypak.",
              url: "https://poolsupplywholesalers.com/shop/all",
            },
            {
              "@type": "HowToStep",
              position: 3,
              name: "Add to Cart & Checkout",
              text: "All prices are already at wholesale to retail pricing. No account required for checkout.",
              url: "https://poolsupplywholesalers.com/shop/all",
            },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Pool Supply Wholesalers",
          image: "https://poolsupplywholesalers.com/about-hero.png",
          url: "https://poolsupplywholesalers.com",
          telephone: "+1-802-265-0320",
          email: "sales@poolsupplywholesalers.com",
          priceRange: "$$",
          address: {
            "@type": "PostalAddress",
            streetAddress: "412 Ezell Pike",
            addressLocality: "Nashville",
            addressRegion: "TN",
            postalCode: "37217",
            addressCountry: "US",
          },
          geo: { "@type": "GeoCoordinates", latitude: 36.0965, longitude: -86.6671 },
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
              opens: "08:00",
              closes: "17:00",
            },
          ],
          sameAs: [
            "https://www.facebook.com/poolsupplywholesalers",
            "https://www.instagram.com/poolsupplywholesalers",
            "https://www.linkedin.com/company/pool-supply-wholesalers",
            "https://www.youtube.com/@poolsupplywholesalers",
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What pool equipment brands does Pool Supply Wholesalers carry?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Pool Supply Wholesalers is an authorized wholesale to retail distributor for Pentair, Hayward, Jandy, Raypak, Zodiac, and Waterway. We carry pumps, heaters, filters, automation systems, salt chlorinators, LED lights, and robotic cleaners from all major brands at wholesale to retail pricing.",
              },
            },
            {
              "@type": "Question",
              name: "How do I get wholesale pool equipment pricing?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Pool Supply Wholesalers offers wholesale to retail pricing to everyone — contractors, service professionals, and homeowners. No membership required. Simply shop our catalog at poolsupplywholesalers.com and all products display our direct wholesale to retail pricing, typically 20-40% below standard retail MSRP.",
              },
            },
            {
              "@type": "Question",
              name: "Does Pool Supply Wholesalers ship nationwide?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Pool Supply Wholesalers ships to all 50 US states with same-day shipping available from distribution hubs in Nashville TN, Los Angeles CA, Dallas TX, and Orlando FL. Most orders ship within 1 business day with 2-5 day delivery nationwide.",
              },
            },
            {
              "@type": "Question",
              name: "What is the difference between a variable speed pool pump and a single speed pump?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Variable speed pool pumps (VSPs) use a permanent magnet motor that can run at any speed between 600-3,450 RPM, saving 70-90% on electricity versus fixed-speed pumps. Single speed pumps run at a fixed 3,450 RPM at full power always. As of 2021, the US DOE mandates variable speed for most pool pump replacements. Pool Supply Wholesalers carries Pentair IntelliFlo, Hayward TriStar VS, and Jandy FloPro VS at wholesale pricing.",
              },
            },
            {
              "@type": "Question",
              name: "Are Pentair and Hayward pool equipment prices negotiable for commercial accounts?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Pool Supply Wholesalers offers special commercial account pricing for contractors, pool builders, property managers, and aquatic facilities ordering in volume. Contact our team at sales@poolsupplywholesalers.com or call +1-802-265-0320 to set up a commercial wholesale account with dedicated pricing and priority fulfillment.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: Index,
} as any);

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Header />
      <main>
        <Hero />

        {/* Below-the-fold sections: code-split, but server-rendered for SEO */}
        <Suspense fallback={<SectionSkeleton height="480px" />}>
          <Categories />
        </Suspense>
        <Suspense fallback={<SectionSkeleton height="200px" />}>
          <Brands />
        </Suspense>
        <Suspense fallback={<SectionSkeleton height="480px" />}>
          <BestSellers />
        </Suspense>
        <Suspense fallback={<SectionSkeleton height="380px" />}>
          <WhyUs />
        </Suspense>
        <Suspense fallback={<SectionSkeleton height="600px" />}>
          <Finder />
        </Suspense>
        <Suspense fallback={<SectionSkeleton height="380px" />}>
          <Testimonials />
        </Suspense>
        <Suspense fallback={<SectionSkeleton height="380px" />}>
          <ContactUs />
        </Suspense>
        <Suspense fallback={<SectionSkeleton height="200px" />}>
          <CTA />
        </Suspense>
      </main>

      <Suspense fallback={<SectionSkeleton height="280px" />}>
        <Footer />
      </Suspense>
    </div>
  );
}
