import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState, useRef, useMemo } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { useCart, formatUSD } from "@/components/site/cart-context";
import { ProductCard } from "@/components/site/ProductCard";
import {
  getProductById,
  getRelatedProducts,
  syncLocalProducts,
  getProductImage,
  Review,
  Product,
} from "@/lib/products";
import { addReviewDb, getProductByIdDb, getProductsDb } from "@/lib/api/products.functions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Star,
  ShoppingBag,
  Plus,
  Minus,
  ChevronRight,
  ShieldCheck,
  Truck,
  Wrench,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  BookOpen,
  Scale,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";

function getProductContextLinks(product: Product | null | undefined) {
  if (!product) return null;

  const rawCat = (product.category || "").toLowerCase();
  let catSlug = rawCat
    .replace(/\s+&\s+/g, "-and-")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  if (catSlug === "pumps") catSlug = "pool-pumps";
  if (catSlug === "heaters") catSlug = "pool-heaters";
  if (catSlug === "filters") catSlug = "pool-filters";
  if (catSlug === "cleaners") catSlug = "pool-cleaners";
  if (catSlug === "lights") catSlug = "pool-lights";
  if (catSlug === "automation") catSlug = "automation-systems";

  const brandSlug = (product.brand || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");

  const brandCatUrl = brandSlug && catSlug ? `/brands/${brandSlug}/${catSlug}` : null;
  const brandUrl = brandSlug ? `/brands/${brandSlug}` : null;

  const cards: Array<{
    type: "guide" | "comparison" | "article";
    tag: string;
    title: string;
    desc: string;
    url: string;
  }> = [];

  if (catSlug.includes("pump")) {
    cards.push({
      type: "guide",
      tag: "Sizing Guide",
      title: "Commercial & Residential Pool Pump Sizing Guide",
      desc: "Calculate required turnover rates, Gallons Per Minute (GPM), and variable speed energy savings.",
      url: "/guides/pool-pump-buying-guide",
    });
    cards.push({
      type: "comparison",
      tag: "Head-to-Head",
      title: "Pentair vs. Hayward Pool Pumps Comparison",
      desc: "Detailed comparison of flow hydraulics, decibel sound ratings, and DOE efficiency ratings.",
      url: "/comparisons/pentair-vs-hayward-pool-pumps",
    });
    cards.push({
      type: "article",
      tag: "DOE Compliance",
      title: "Variable Speed Pump Regulations & Contractor ROI",
      desc: "Federal efficiency mandates and operating cost comparison for commercial pool systems.",
      url: "/blog/how-to-choose-variable-speed-pool-pump-commercial",
    });
  } else if (catSlug.includes("heat")) {
    cards.push({
      type: "guide",
      tag: "Sizing Guide",
      title: "Pool Heater BTU Sizing & Temperature Calculator",
      desc: "Calculate required BTU output based on surface area, climate zone, and wind exposure.",
      url: "/guides/pool-heater-buying-guide",
    });
    cards.push({
      type: "comparison",
      tag: "Efficiency Comparison",
      title: "Gas Heaters vs. Electric Heat Pumps",
      desc: "Operating cost breakdown, cold weather performance, and high-COP heat pump metrics.",
      url: "/comparisons/gas-vs-electric-pool-heaters",
    });
    cards.push({
      type: "article",
      tag: "Brand Comparison",
      title: "Pentair vs. Hayward vs. Jandy Pool Heaters",
      desc: "Cupro-nickel vs titanium heat exchangers and commercial installation requirements.",
      url: "/blog/pentair-vs-hayward-vs-jandy-pool-heater-comparison-2026",
    });
  } else if (catSlug.includes("filter")) {
    cards.push({
      type: "guide",
      tag: "Selection Guide",
      title: "Cartridge, Sand & D.E. Pool Filter Buying Guide",
      desc: "Micron filtration ratings, backwash water conservation, and clean PSI pressure ranges.",
      url: "/guides/pool-filter-buying-guide",
    });
    cards.push({
      type: "comparison",
      tag: "Filtration Comparison",
      title: "Cartridge vs. Sand Pool Filters Comparison",
      desc: "Comprehensive evaluation of filtration clarity, maintenance labor, and replacement costs.",
      url: "/comparisons/cartridge-vs-sand-pool-filters",
    });
    cards.push({
      type: "article",
      tag: "Maintenance Guide",
      title: "Contractor Filter Maintenance & Cleaning",
      desc: "Commercial filtration protocols, chemical degreasing, and element replacement schedules.",
      url: "/blog/cartridge-filter-vs-sand-filter-pool-contractor-guide",
    });
  } else if (catSlug.includes("automation")) {
    cards.push({
      type: "guide",
      tag: "Setup Guide",
      title: "Smart Pool Automation Systems Guide",
      desc: "IntelliCenter, OmniLogic, and AquaLink remote smartphone control setup.",
      url: "/guides/pool-automation-buying-guide",
    });
    cards.push({
      type: "article",
      tag: "System Architecture",
      title: "Pool Automation Systems Explained",
      desc: "Automated valve actuators, salt chlorinator integration, and schedule timers.",
      url: "/blog/pool-automation-systems-explained-2026",
    });
    cards.push({
      type: "guide",
      tag: "Commercial Pad",
      title: "Commercial Pool Equipment Checklist",
      desc: "Standard build requirements for commercial aquatic facilities and municipal code.",
      url: "/blog/commercial-pool-equipment-checklist-complete-build-supply-list",
    });
  } else if (catSlug.includes("salt") || catSlug.includes("chlorin")) {
    cards.push({
      type: "guide",
      tag: "Sizing Guide",
      title: "Salt Chlorine Generator Sizing Guide",
      desc: "Electrolysis sizing, cell longevity, and maintaining optimal 3,200 ppm salinity.",
      url: "/guides/salt-chlorine-generator-buying-guide",
    });
    cards.push({
      type: "article",
      tag: "Sanitization Guide",
      title: "How to Size a Commercial Pool Salt Chlorinator",
      desc: "Pounds of pure chlorine production per 24 hours based on pool volume and bather load.",
      url: "/blog/how-to-size-pool-salt-chlorinator",
    });
    cards.push({
      type: "guide",
      tag: "Commercial Guide",
      title: "Commercial Pool Equipment Master Guide",
      desc: "Commercial sanitization protocols, automation, and hydraulic pad layout.",
      url: "/guides/commercial-pool-equipment-guide",
    });
  } else if (catSlug.includes("cleaner")) {
    cards.push({
      type: "article",
      tag: "Buyer's Guide",
      title: "Top Commercial & Residential Robotic Cleaners",
      desc: "Independent filtration, wall climbing capabilities, and dual-scrubbing brushes.",
      url: "/blog/best-robotic-pool-cleaners-2026-commercial-residential",
    });
    cards.push({
      type: "guide",
      tag: "Sizing Guide",
      title: "Complete Commercial Pool Equipment Guide",
      desc: "Selecting the right automatic cleaning system for commercial and residential pools.",
      url: "/guides/commercial-pool-equipment-guide",
    });
    cards.push({
      type: "article",
      tag: "Trade Pricing",
      title: "Wholesale vs. Retail Pool Equipment Pricing",
      desc: "Maximizing trade discounts and direct warehouse freight on commercial equipment.",
      url: "/blog/wholesale-vs-retail-pool-equipment-pricing-how-to-save",
    });
  } else {
    cards.push({
      type: "guide",
      tag: "Commercial Guide",
      title: "Complete Commercial Pool Equipment Guide",
      desc: "Comprehensive guidelines on sizing, hydraulic efficiency, and commercial code compliance.",
      url: "/guides/commercial-pool-equipment-guide",
    });
    cards.push({
      type: "article",
      tag: "Energy Report",
      title: "Pool Equipment Energy Savings Report",
      desc: "DOE compliance, hydraulic flow rates, and operating cost reductions.",
      url: "/blog/pool-equipment-energy-savings-report-2026",
    });
    cards.push({
      type: "article",
      tag: "Trade Pricing",
      title: "Wholesale vs. Retail Pool Equipment Pricing",
      desc: "How pool contractors and service companies access direct wholesale trade terms.",
      url: "/blog/wholesale-vs-retail-pool-equipment-pricing-how-to-save",
    });
  }

  return { brandCatUrl, brandUrl, cards };
}

export const Route = createFileRoute("/products/$productId")({
  loader: async ({ params }) => {
    try {
      const res = await getProductByIdDb({ data: { id: params.productId } });
      if (res.success && res.product) {
        return { product: res.product as Product };
      }
    } catch (e) {
      console.error("Route loader error fetching product:", e);
    }
    const fallback = getProductById(params.productId);
    return { product: fallback || null };
  },
  head: ({ loaderData, params }) => {
    const product = loaderData?.product || getProductById(params.productId);

    // Build a rich, natural SEO title: Brand + Name + SKU (truncated if needed)
    const buildTitle = () => {
      if (!product?.name) return "Pool Equipment Product Details — Pool Supply Wholesalers";
      const brand = product.brand ? `${product.brand} ` : "";
      const sku = product.sku ? ` | ${product.sku}` : "";
      const base = `${brand}${product.name}${sku}`;
      // Trim to 65 chars max for title tag
      return base.length > 65 ? `${base.slice(0, 62)}...` : base;
    };
    const title = buildTitle();

    // Build meta description: prefer details > description snippet, never use "Introducing the..." filler
    const buildDescription = () => {
      if (!product)
        return "Commercial pool equipment at direct wholesale trade pricing from Pool Supply Wholesalers.";
      const priceStr = product.price ? formatUSD(product.price) : "";
      // Use 'details' field (manufacturer spec line) when available and not a copy of name
      const detailText =
        product.details && product.details !== product.name ? product.details : null;
      // Check if description is the auto-generated "Introducing the..." filler
      const isFillerDesc = product.description?.startsWith("Introducing the");
      const descSource =
        detailText ||
        (!isFillerDesc ? product.description : null) ||
        `${product.brand || ""} ${product.category || "pool"} equipment`;
      const snippet = descSource.slice(0, 130).trim();
      return `Shop ${product.name}${priceStr ? ` for ${priceStr}` : ""}. ${snippet}. Fast shipping from Pool Supply Wholesalers.`;
    };
    const description = buildDescription();

    const imageUrl = product?.img
      ? getProductImage(product.img)
      : "https://poolsupplywholesalers.com/about-hero.png";
    const productUrl = `https://poolsupplywholesalers.com/products/${params.productId}`;

    // Canonical category slug for breadcrumbs
    const catSlug = product?.category
      ? product.category
          .toLowerCase()
          .replace(/\s+&\s+/g, "-and-")
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
      : "all";
    const catName = product?.category || "Pool Equipment";

    // Only include real user-generated reviews (filter out templated auto-generated ones)
    const allReviews = product?.reviews || [];
    const TEMPLATED_AUTHORS = new Set([
      "Verified Buyer",
      "Certified Pool Technician",
      "Verified Customer",
      "Pool Pro",
    ]);
    const realReviews = allReviews.filter((r: Review) => {
      const isTemplatedAuthor = TEMPLATED_AUTHORS.has(r.author || "");
      const isTemplatedContent =
        (r.content || "").includes("Exactly what I needed") ||
        (r.content || "").includes("Stars. Outstanding product") ||
        (r.content || "").startsWith("5/5 Stars") ||
        (r.content || "").startsWith("4/5 Stars");
      return !isTemplatedAuthor && !isTemplatedContent;
    });

    // Only emit AggregateRating if there are real, verified customer reviews
    // Only emit AggregateRating if there are real, verified customer reviews
    const avgRating =
      realReviews.length > 0
        ? (realReviews.reduce((acc, r) => acc + (r.rating || 5), 0) / realReviews.length).toFixed(1)
        : undefined;

    const jsonLd = product
      ? [
          {
            "@context": "https://schema.org/",
            "@type": "Product",
            name: product.name || "Pool Equipment",
            image: [imageUrl],
            description: descText,
            ...(product.sku ? { sku: product.sku, mpn: product.sku } : {}),
            productID: product.id,
            category: product.category || "Pool Equipment",
            brand: {
              "@type": "Brand",
              name: product.brand || "Pool Supply Wholesalers",
            },
            manufacturer: {
              "@type": "Organization",
              name: product.brand || "Pool Supply Wholesalers",
              url: `https://poolsupplywholesalers.com/brands/${(product.brand || "").toLowerCase().replace(/[^a-z0-9-]/g, "-")}`,
            },
            offers: {
              "@type": "Offer",
              url: productUrl,
              priceCurrency: "USD",
              validFrom: "2024-01-01",
              price: product.price || 0,
              priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                .toISOString()
                .split("T")[0],
              itemCondition: "https://schema.org/NewCondition",
              availability:
                (product.stock ?? 0) > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
              seller: {
                "@type": "Organization",
                name: "Pool Supply Wholesalers",
                url: "https://poolsupplywholesalers.com",
              },
              shippingDetails: {
                "@type": "OfferShippingDetails",
                shippingRate: {
                  "@type": "MonetaryAmount",
                  value: "0",
                  currency: "USD",
                },
                deliveryTime: {
                  "@type": "ShippingDeliveryTime",
                  handlingTime: {
                    "@type": "QuantitativeValue",
                    minValue: 0,
                    maxValue: 1,
                    unitCode: "DAY",
                  },
                  transitTime: {
                    "@type": "QuantitativeValue",
                    minValue: 1,
                    maxValue: 5,
                    unitCode: "DAY",
                  },
                },
                shippingDestination: {
                  "@type": "DefinedRegion",
                  addressCountry: "US",
                },
              },
              hasMerchantReturnPolicy: {
                "@type": "MerchantReturnPolicy",
                applicableCountry: "US",
                returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
                merchantReturnDays: 30,
                returnMethod: "https://schema.org/ReturnByMail",
                returnFees: "https://schema.org/FreeReturn",
              },
            },
            ...(avgRating && realReviews.length > 0
              ? {
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: avgRating,
                    bestRating: "5",
                    worstRating: "1",
                    reviewCount: realReviews.length,
                  },
                  review: realReviews.slice(0, 5).map((r: Review) => ({
                    "@type": "Review",
                    reviewRating: {
                      "@type": "Rating",
                      ratingValue: r.rating || 5,
                      bestRating: "5",
                      worstRating: "1",
                    },
                    author: {
                      "@type": "Person",
                      name: r.author || "Verified Customer",
                    },
                    name: r.title || "",
                    reviewBody: r.content || "",
                    datePublished: r.date || new Date().toISOString().split("T")[0],
                  })),
                }
              : {}),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://poolsupplywholesalers.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: product.category || "Pool Equipment",
                item: `https://poolsupplywholesalers.com/shop/${product.category?.toLowerCase().replace(/ /g, "-") || "all"}`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: product.name || "Product",
                item: productUrl,
              },
            ],
          },
        ]
      : null;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        {
          name: "keywords",
          content: `${product?.name || "pool equipment"}, ${product?.brand || "pool brand"} wholesale USA, buy ${product?.category || "pool supply"} USA, commercial pool equipment United States, wholesale pool supplies USA, fast nationwide shipping`,
        },
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: imageUrl },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: title },
        { property: "og:url", content: productUrl },
        { property: "og:type", content: "product" },
        { property: "og:site_name", content: "Pool Supply Wholesalers" },
        { property: "og:locale", content: "en_US" },
        { property: "product:price:amount", content: String(product?.price || 0) },
        { property: "product:price:currency", content: "USD" },
        {
          property: "product:availability",
          content: (product?.stock ?? 0) > 0 ? "in stock" : "out of stock",
        },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@poolsupplywholesalers" },
        { name: "twitter:creator", content: "@poolsupplywholesalers" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: imageUrl },
      ],
      links: [{ rel: "canonical", href: productUrl }],
      scripts: jsonLd
        ? jsonLd.map((ld) => ({
            type: "application/ld+json",
            children: JSON.stringify(ld),
          }))
        : [],
    };
  },
  component: ProductDetailPage,
});

function ProductDetailPage() {
  const { productId } = useParams({ from: "/products/$productId" });
  const loaderData = Route.useLoaderData();
  const queryClient = useQueryClient();

  // Query product directly by ID from database
  const { data: dbProduct, isLoading: isQueryLoading } = useQuery({
    queryKey: ["product-detail", productId],
    queryFn: async () => {
      const res = await getProductByIdDb({ data: { id: productId } });
      if (res.success && res.product) {
        return res.product as Product;
      }
      return getProductById(productId) || null;
    },
    initialData: loaderData?.product || undefined,
    staleTime: 30 * 1000,
  });

  const product = dbProduct || loaderData?.product || getProductById(productId);
  const isLoading = isQueryLoading && !product;
  const contextLinks = useMemo(() => getProductContextLinks(product), [product]);

  // Category related products query
  const { data: categoryProducts } = useQuery({
    queryKey: ["shop-products-related", product?.category],
    queryFn: async () => {
      if (!product?.category) return [];
      const res = await getProductsDb({ data: { category: product.category, limit: 16 } });
      return res.success && res.products ? (res.products as Product[]) : [];
    },
    enabled: !!product?.category,
    staleTime: 10 * 60 * 1000,
  });

  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "specs">("description");
  const reviewsEndRef = useRef<HTMLDivElement>(null);

  // Custom reviews logic with localStorage persistence
  const [reviews, setReviews] = useState<Review[]>([]);
  const [writeOpen, setWriteOpen] = useState(false);
  const [newAuthor, setNewAuthor] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!product) return;

    // Scroll to top of the page when product/productId changes
    window.scrollTo({ top: 0, behavior: "instant" });

    const key = `aquapro_reviews_${product.id}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setReviews(parsed);
          setQty(1); // Reset quantity on product change
          setSuccessMsg("");
          setWriteOpen(false);
          return;
        }
      } catch (e) {
        console.error("Failed to parse product reviews", e);
      }
    }
    setReviews(product.reviews || []);
    setQty(1); // Reset quantity on product change
    setSuccessMsg("");
    setWriteOpen(false);
  }, [productId, product?.id]);

  const effectivePrice = product
    ? product.salePrice && product.salePrice > 0
      ? product.salePrice
      : product.price
    : 0;
  const savings =
    product && product.msrp && product.msrp > effectivePrice ? product.msrp - effectivePrice : 0;
  const savingsPercent =
    product && product.msrp && product.msrp > effectivePrice
      ? Math.round((savings / product.msrp) * 100)
      : 0;
  const related = product
    ? getRelatedProducts(
        product,
        4,
        categoryProducts && categoryProducts.length > 0 ? categoryProducts : undefined,
      )
    : [];

  // Calculate average rating
  const avgRating =
    reviews.length > 0
      ? +(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : product?.rating || 5;

  const handleAddReview = async (e: React.FormEvent) => {
    if (!product) return;
    e.preventDefault();
    if (!newAuthor.trim() || !newTitle.trim() || !newContent.trim()) return;

    const review: Review = {
      id: `r-user-${Date.now()}`,
      author: newAuthor,
      rating: newRating,
      date: new Date().toISOString().split("T")[0],
      title: newTitle,
      content: newContent,
    };

    const updated = [review, ...reviews];
    setReviews(updated);
    localStorage.setItem(`aquapro_reviews_${product.id}`, JSON.stringify(updated));

    // Also update the global product list in localStorage for immediate sync (optional, but good for local cache)
    const storedProducts = localStorage.getItem("aquapro_db_products");
    if (storedProducts) {
      try {
        const parsedProducts = JSON.parse(storedProducts);
        if (Array.isArray(parsedProducts)) {
          const updatedProducts = parsedProducts.map((p) => {
            if (p.id === product.id) {
              return {
                ...p,
                reviews: [review, ...(p.reviews || [])],
              };
            }
            return p;
          });
          syncLocalProducts(updatedProducts);
        }
      } catch (err) {
        console.error("Failed to sync new review to global product database", err);
      }
    }

    try {
      await addReviewDb({ data: { productId: product.id, review } });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-detail", product.id] });
      queryClient.invalidateQueries({ queryKey: ["shop-products-related"] });
    } catch (err) {
      console.error("Failed to sync new review to DB:", err);
    }

    // Clear form
    setNewAuthor("");
    setNewRating(5);
    setNewTitle("");
    setNewContent("");
    setWriteOpen(false);
    setSuccessMsg("Review submitted successfully! Thank you for your feedback.");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const scrollToReviews = () => {
    setWriteOpen(true);
    setTimeout(() => {
      reviewsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Stock status styling helper
  const getStockBadge = () => {
    if (!product) return null;
    if (product.stock > 15) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          In Stock ({product.stock} available)
        </span>
      );
    } else if (product.stock > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-amber-50 border border-amber-100 text-amber-700">
          <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
          Low Stock (Only {product.stock} left)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-rose-50 border border-rose-100 text-rose-700">
          <span className="size-2 rounded-full bg-rose-500" />
          Out of Stock
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <Header alwaysDark />

      <main className="flex-1 pt-24 sm:pt-28 pb-16 sm:pb-20">
        {isLoading && !product ? (
          <div className="grid place-items-center px-6 py-28">
            <div className="flex flex-col items-center gap-3">
              <div className="size-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
              <p className="text-sm font-semibold text-slate-500">Loading product details...</p>
            </div>
          </div>
        ) : !product ? (
          <div className="grid place-items-center px-6 py-28">
            <div className="text-center max-w-md">
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                Product Not Found
              </h1>
              <p className="mt-3 text-muted-foreground">
                The product you are looking for does not exist or has been removed.
              </p>
              <Link
                to="/shop/$category"
                params={{ category: "all" }}
                search={{ q: "" }}
                className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900 text-white font-semibold shadow-lg hover:bg-slate-800 transition"
              >
                <ArrowLeft className="size-4" /> Return to Shop
              </Link>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 mt-4 sm:mt-8 mb-6 sm:mb-8 overflow-x-auto whitespace-nowrap scrollbar-none">
              <Link to="/" className="hover:text-foreground transition">
                Home
              </Link>
              <span className="text-muted-foreground/45 font-normal">&gt;</span>
              <span className="text-muted-foreground/50">Shop</span>
              <span className="text-muted-foreground/45 font-normal">&gt;</span>
              <span className="text-muted-foreground/50">{product.category}</span>
              <span className="text-muted-foreground/45 font-normal">&gt;</span>
              <span className="text-foreground font-bold truncate max-w-[150px] sm:max-w-none capitalize">
                {product.name}
              </span>
            </nav>

            <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
              {/* Left Column: Image Gallery */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="relative aspect-square rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-b from-[oklch(0.97_0.01_240)] to-[oklch(0.92_0.04_220)] border border-border/70 overflow-hidden flex items-center justify-center p-4 sm:p-10 shadow-[var(--shadow-soft)]">
                  <img
                    src={getProductImage(product.img)}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="max-h-[90%] max-w-[90%] object-contain hover:scale-105 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      if (!e.currentTarget.src.endsWith("/assets/commingsoon.png")) {
                        e.currentTarget.src = "/assets/commingsoon.png";
                      }
                    }}
                  />

                  {/* Floating stock pill */}
                  <div className="absolute top-3.5 left-3.5 sm:top-5 sm:left-5">
                    {getStockBadge()}
                  </div>
                </div>

                {/* Wholesaler Badges */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="flex flex-col items-center text-center p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-surface border border-border/40">
                    <Truck className="size-4 sm:size-5 text-[oklch(0.50_0.14_232)] mb-1 sm:mb-1.5" />
                    <span className="text-xs sm:text-xs font-extrabold uppercase tracking-wider text-foreground">
                      Fast Shipping
                    </span>
                    <span className="text-[8px] sm:text-xs text-muted-foreground mt-0.5">
                      Distance Calculated
                    </span>
                  </div>
                  <div className="flex flex-col items-center text-center p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-surface border border-border/40">
                    <ShieldCheck className="size-4 sm:size-5 text-[oklch(0.50_0.14_232)] mb-1 sm:mb-1.5" />
                    <span className="text-xs sm:text-xs font-extrabold uppercase tracking-wider text-foreground">
                      Genuine Brand
                    </span>
                    <span className="text-[8px] sm:text-xs text-muted-foreground mt-0.5">
                      100% Authorized
                    </span>
                  </div>
                  <div className="flex flex-col items-center text-center p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-surface border border-border/40">
                    <Wrench className="size-4 sm:size-5 text-[oklch(0.50_0.14_232)] mb-1 sm:mb-1.5" />
                    <span className="text-xs sm:text-xs font-extrabold uppercase tracking-wider text-foreground">
                      Warranty
                    </span>
                    <span className="text-[8px] sm:text-xs text-muted-foreground mt-0.5">
                      {product.specs?.["Warranty"] || "Full Warranty"}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-5 sm:space-y-6"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs uppercase tracking-[0.2em] text-[oklch(0.50_0.14_232)] font-bold">
                      {product.brand}
                    </span>
                  </div>
                  <h1 className="mt-1.5 text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-snug capitalize">
                    {product.name}
                  </h1>

                  {/* Rating & Reviews anchor */}
                  <button
                    onClick={scrollToReviews}
                    className="mt-2.5 flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition group"
                  >
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3.5 ${i < Math.round(avgRating) ? "fill-[oklch(0.82_0.15_85)] text-[oklch(0.82_0.15_85)]" : "text-border"}`}
                        />
                      ))}
                    </div>
                    <span className="group-hover:underline">
                      ({reviews.length} customer reviews)
                    </span>
                  </button>
                </div>

                {/* Pricing card */}
                {(() => {
                  const effectivePrice =
                    product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
                  return (
                    <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-surface border border-border/50 space-y-3.5 sm:space-y-4">
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <div className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                          Sale Price
                        </div>
                        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[oklch(0.50_0.14_232)]">
                          {formatUSD(effectivePrice)}
                        </div>
                        {product.msrp && product.msrp > effectivePrice && (
                          <div className="text-xs text-muted-foreground line-through font-medium">
                            MSRP: {formatUSD(product.msrp)}
                          </div>
                        )}
                      </div>

                      <div className="h-px bg-border/40" />

                      <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                        <div>
                          <span className="text-muted-foreground uppercase tracking-wider text-xs">
                            SKU
                          </span>
                          <p className="text-foreground mt-0.5 font-mono">{product.sku}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground uppercase tracking-wider text-xs">
                            Category
                          </span>
                          <p className="text-foreground mt-0.5">{product.category}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Purchase interactions */}
                <div className="space-y-4">
                  {product.stock > 0 ? (
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      {/* Qty Selector */}
                      <div className="flex items-center justify-between sm:justify-start bg-muted/70 rounded-full p-1 border border-border/55">
                        <button
                          type="button"
                          onClick={() => setQty(Math.max(1, qty - 1))}
                          className="size-10 grid place-items-center hover:bg-white hover:shadow-sm rounded-full text-foreground/80 hover:text-foreground transition-all active:scale-90"
                        >
                          <Minus className="size-4" />
                        </button>
                        <span className="w-12 text-center text-sm font-bold text-foreground tabular-nums select-none">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(Math.min(product.stock, qty + 1))}
                          className="size-10 grid place-items-center hover:bg-white hover:shadow-sm rounded-full text-foreground/80 hover:text-foreground transition-all active:scale-90"
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>

                      {/* Add Button */}
                      {(() => {
                        const effectivePrice =
                          product.salePrice && product.salePrice > 0
                            ? product.salePrice
                            : product.price;
                        return (
                          <button
                            onClick={() => add({ ...product, price: effectivePrice }, qty)}
                            className="flex-1 py-3.5 px-6 rounded-full bg-gradient-ocean text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 hover:shadow-[var(--shadow-float)] transition-all duration-300 hover:-translate-y-0.5 active:scale-98"
                          >
                            <ShoppingBag className="size-4" />
                            Add to Cart · {formatUSD(effectivePrice * qty)}
                          </button>
                        );
                      })()}
                    </div>
                  ) : (
                    <button
                      disabled
                      className="w-full py-3.5 px-6 rounded-full bg-muted text-muted-foreground font-semibold text-xs sm:text-sm flex items-center justify-center gap-2"
                    >
                      Out of Stock
                    </button>
                  )}

                  <p className="text-xs text-emerald-700 font-semibold text-center">
                    🚚 Free Nationwide Shipping included. Same day dispatch for orders before 2 PM.
                  </p>
                </div>

                {/* Product Tabs */}
                <div className="border-b border-border/80 flex gap-6 text-sm font-bold">
                  <button
                    onClick={() => setActiveTab("description")}
                    className={`pb-3 relative ${activeTab === "description" ? "text-primary" : "text-muted-foreground hover:text-foreground"} transition-colors`}
                  >
                    Description
                    {activeTab === "description" && (
                      <motion.span
                        layoutId="tab-underline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                      />
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("specs")}
                    className={`pb-3 relative ${activeTab === "specs" ? "text-primary" : "text-muted-foreground hover:text-foreground"} transition-colors`}
                  >
                    Specifications
                    {activeTab === "specs" && (
                      <motion.span
                        layoutId="tab-underline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                      />
                    )}
                  </button>
                </div>

                <div className="pt-2 text-sm leading-relaxed text-muted-foreground min-h-[140px]">
                  {activeTab === "description" ? (
                    <p className="whitespace-pre-line text-xs sm:text-sm">{product.description}</p>
                  ) : (
                    <div className="grid gap-2 border border-border/50 rounded-2xl overflow-hidden bg-surface">
                      {Object.entries(product.specs || {}).map(([key, value]) => (
                        <div
                          key={key}
                          className="grid grid-cols-1 sm:grid-cols-[160px_1fr] border-b border-border/30 last:border-b-0 p-3 hover:bg-white transition-colors gap-1 sm:gap-0"
                        >
                          <span className="font-bold text-foreground/80 text-xs">{key}</span>
                          <span className="text-muted-foreground text-xs">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SEO Keywords & Search Topics */}
                {product.seoKeywords && (
                  <div className="sr-only" aria-label="SEO Keywords and Search Topics">
                    <h2>SEO Keywords & Search Topics</h2>
                    <p>{product.seoKeywords}</p>
                    <div>
                      {product.seoKeywords.split(",").map((tag, idx) => (
                        <span key={idx}>#{tag.trim()} </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Reviews Section */}
            <section
              ref={reviewsEndRef}
              className="mt-14 sm:mt-20 pt-8 sm:pt-12 border-t border-border"
            >
              <div className="grid lg:grid-cols-[260px_1fr] gap-8 lg:gap-10">
                {/* Ratings Summary */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    Customer Reviews
                  </h2>

                  <div className="mt-3 sm:mt-4 flex items-center gap-3">
                    <div className="text-4xl sm:text-5xl font-black text-foreground">
                      {avgRating}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`size-3.5 ${i < Math.round(avgRating) ? "fill-[oklch(0.82_0.15_85)] text-[oklch(0.82_0.15_85)]" : "text-border"}`}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground font-semibold">
                        {reviews.length} Reviews
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setWriteOpen(!writeOpen)}
                    className="mt-5 sm:mt-6 w-full py-2.5 rounded-full border border-border hover:border-foreground/20 hover:bg-surface font-semibold text-xs text-foreground transition-all active:scale-97"
                  >
                    Write a Review
                  </button>
                </div>

                {/* Review List & Form */}
                <div className="space-y-5 sm:space-y-6">
                  {successMsg && (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-xs sm:text-sm font-semibold">
                      {successMsg}
                    </div>
                  )}

                  {/* Review Form */}
                  {writeOpen && (
                    <motion.form
                      initial={{ opacity: 0, y: -15 }}
                      animate={{ opacity: 1, y: 0 }}
                      onSubmit={handleAddReview}
                      className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-surface border border-border/80 space-y-4 overflow-hidden"
                    >
                      <h3 className="font-bold text-sm sm:text-base text-foreground">
                        Write a Customer Review
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <label className="block">
                          <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                            Your Name
                          </span>
                          <input
                            type="text"
                            required
                            value={newAuthor}
                            onChange={(e) => setNewAuthor(e.target.value)}
                            placeholder="e.g. John D."
                            className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-primary transition"
                          />
                        </label>

                        <div>
                          <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                            Rating
                          </span>
                          <div className="flex items-center gap-1.5 h-10">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setNewRating(star)}
                                className="size-7 grid place-items-center hover:scale-110 transition"
                              >
                                <Star
                                  className={`size-5 sm:size-6 ${star <= newRating ? "fill-[oklch(0.82_0.15_85)] text-[oklch(0.82_0.15_85)]" : "text-border"}`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <label className="block">
                        <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                          Review Title
                        </span>
                        <input
                          type="text"
                          required
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="Summarize your experience"
                          className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-primary transition"
                        />
                      </label>

                      <label className="block">
                        <span className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                          Review details
                        </span>
                        <textarea
                          required
                          rows={4}
                          value={newContent}
                          onChange={(e) => setNewContent(e.target.value)}
                          placeholder="What did you like or dislike? How does it perform?"
                          className="w-full p-3 rounded-xl border border-border bg-white text-xs focus:outline-none focus:border-primary transition resize-none"
                        />
                      </label>

                      <div className="flex gap-3 justify-end">
                        <button
                          type="button"
                          onClick={() => setWriteOpen(false)}
                          className="px-4 py-2 rounded-full hover:bg-muted font-semibold text-xs text-muted-foreground transition"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-full bg-foreground text-background font-semibold text-xs hover:bg-[oklch(0.50_0.14_232)] hover:text-white transition"
                        >
                          Submit Review
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {/* Review Items */}
                  {reviews.length > 0 ? (
                    <div className="divide-y divide-border/50 space-y-4 sm:space-y-5">
                      {reviews.map((rev) => (
                        <div key={rev.id} className="pt-4 sm:pt-5 first:pt-0 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`size-3 ${i < rev.rating ? "fill-[oklch(0.82_0.15_85)] text-[oklch(0.82_0.15_85)]" : "text-border"}`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs font-bold text-foreground">
                                {rev.author}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">{rev.date}</span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-foreground">
                            {rev.title}
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {rev.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-10 bg-surface rounded-2xl sm:rounded-3xl border border-dashed border-border p-5 sm:p-6">
                      <MessageSquare className="size-8 text-muted-foreground/45 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-muted-foreground">No reviews yet</p>
                      <p className="text-xs text-muted-foreground/75 mt-1">
                        Be the first to review this product!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Technical Sizing Guides & Brand Resources (SEO Silo & Reverse Flow) */}
            {contextLinks && contextLinks.cards.length > 0 && (
              <section className="mt-14 sm:mt-20 pt-8 sm:pt-12 border-t border-border">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                  <div>
                    <span className="text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-semibold flex items-center gap-1.5">
                      <BookOpen className="size-3.5" /> Technical Resources & Silo
                    </span>
                    <h2 className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight">
                      Sizing Guides & Authorized {product?.brand || "Brand"} Resources
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
                      Review contractor sizing formulas, manufacturer comparisons, and complete {product?.brand || ""} catalogs for this {product?.category?.toLowerCase() || "equipment"}.
                    </p>
                  </div>

                  {/* Hub Links Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    {contextLinks.brandCatUrl && (
                      <Link
                        to={contextLinks.brandCatUrl}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 text-xs font-bold text-cyan-800 hover:bg-cyan-100 transition shadow-2xs"
                      >
                        All {product?.brand} {product?.category}
                        <ArrowRight className="size-3" />
                      </Link>
                    )}
                    {contextLinks.brandUrl && (
                      <Link
                        to={contextLinks.brandUrl}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition shadow-2xs"
                      >
                        {product?.brand} Hub
                        <ArrowRight className="size-3" />
                      </Link>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contextLinks.cards.map((card, idx) => (
                    <Link
                      key={idx}
                      to={card.url}
                      className="group p-5 rounded-2xl bg-surface border border-border hover:border-cyan-400 hover:shadow-xs transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-700 uppercase tracking-wider mb-2">
                          {card.type === "guide" && <BookOpen className="size-3.5" />}
                          {card.type === "comparison" && <Scale className="size-3.5" />}
                          {card.type === "article" && <Sparkles className="size-3.5" />}
                          {card.tag}
                        </div>
                        <h3 className="font-bold text-sm text-foreground group-hover:text-cyan-600 transition leading-snug">
                          {card.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                          {card.desc}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-border/60 flex items-center text-xs font-bold text-cyan-600 group-hover:translate-x-0.5 transition-transform gap-1">
                        Read Technical Guide <ArrowRight className="size-3" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Related Products */}
            {related.length > 0 && (
              <section className="mt-16 sm:mt-24 pt-8 sm:pt-12 border-t border-border">
                <span className="text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-semibold">
                  Recommendations
                </span>
                <h2 className="mt-2 text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
                  Related Products
                </h2>

                <div className="mt-6 sm:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
                  {related.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
