import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useProductsQuery, Product } from "@/lib/products";
import { getProductsDb } from "@/lib/api/products.functions";
import catalogProducts from "@/lib/catalog-products.json";
import { Loader2, ArrowRight, Sparkles, Bot, Waves, Flame, Lightbulb } from "lucide-react";
import { ProductCard } from "./ProductCard";

// Targeted Curated Top-Tier Equipment (Auto Cleaners #1, Pumps, Heaters, Lights)
const CURATED_FEATURED_IDS = [
  // 1. Auto Pool Cleaners (Number One!)
  "p-99996231-uswi", // Dolphin Active 30 Pool Cleaner with WiFi
  "p-falphaiqp", // Polaris ALPHA iQ Robotic w/ Caddy
  "p-rch651cuy", // Hayward AQUAVAC 650 Robotic Cleaner w/ Caddy
  "p-99996281-xp", // Maytronics Explorer E50 Robotic Pool Cleaner
  // 2. Variable-Speed & High-Head Pumps
  "p-hl32950vsp", // Hayward TRISTAR VS 950 OMNI Variable Speed Pump
  "p-shpf5-0", // Jandy Pro Series Stealth High Head Pump
  // 3. High-Efficiency Heaters & Heat Pumps
  "p-jxi400nn", // Jandy Pro Series JXI Pool Heater 400k BTU Natural Gas
  "p-hp50951t", // Hayward HEAT PUMP 95K BTU Inverter Vertical Fan
  // 4. Vibrant Pool & Spa LED Lights
  "p-sp0527sled100", // Hayward Color LED Pool Light 120V 100FT SS
  "p-cplvrgbws150", // Fluidra Jandy Pro Series Large RGBW LED Light
];

// Specific blacklist for accessories, small parts, and low-grade items
const BLACKLIST_NAMES = [
  "120sq ft starclear plus",
  "#100 vinyl adhesive",
  "#13 union assy",
  "105k lp heater",
  "adhesive",
  "glue",
  "union assy",
  "fitting",
  "governer kit",
  "limit fixed",
  "digital board",
];

type CategoryTab = "all" | "cleaners" | "pumps" | "heaters" | "lights";

export function BestSellers() {
  // Query curated equipment specifically by ID from live DB with 30s stale time
  const { data: curatedDbProducts = [] } = useQuery({
    queryKey: ["best-sellers-curated-db"],
    queryFn: async () => {
      const res = await getProductsDb({ data: { ids: CURATED_FEATURED_IDS, limit: 20 } });
      return res.success && res.products ? (res.products as Product[]) : [];
    },
    staleTime: 30 * 1000,
  });

  const { data: dbProducts = [], isLoading } = useProductsQuery();
  const [activeTab, setActiveTab] = useState<CategoryTab>("all");

  // Merge loaded products with local catalog for instant hydration, guaranteeing increased sale prices
  const allPoolProducts = useMemo(() => {
    const list = [
      ...curatedDbProducts,
      ...(dbProducts.length > 0 ? dbProducts : (catalogProducts as any[])),
    ];
    const map = new Map<string, Product>();

    const normalizeWithSalePrice = (p: any): Product => {
      const rawPrice = Number(p.price) || 0;
      const rawSale =
        p.salePrice != null && Number(p.salePrice) > 0
          ? Number(p.salePrice)
          : p.msrp && Number(p.msrp) > rawPrice
            ? Number(p.msrp)
            : Math.round(rawPrice * 1.25 * 100) / 100;

      const higherMsrp =
        p.msrp && Number(p.msrp) > rawSale ? Number(p.msrp) : Math.round(rawSale * 1.2 * 100) / 100;

      return {
        ...p,
        wholesalePrice: rawPrice,
        price: rawSale,
        salePrice: rawSale,
        msrp: higherMsrp,
      };
    };

    // 1. Live curated DB products take first priority
    curatedDbProducts.forEach((p) => {
      if (p.id) map.set(p.id, normalizeWithSalePrice(p));
    });

    // 2. General DB products
    dbProducts.forEach((p) => {
      if (p.id && !map.has(p.id)) map.set(p.id, normalizeWithSalePrice(p));
    });

    // 3. Fallback catalog products
    (catalogProducts as any[]).forEach((p) => {
      if (p.id && !map.has(p.id)) map.set(p.id, normalizeWithSalePrice(p));
    });

    return Array.from(map.values());
  }, [curatedDbProducts, dbProducts]);

  // Cleaners filter (Auto cleaners only, genuine pool units > $300)
  const autoCleaners = useMemo(() => {
    return allPoolProducts
      .filter((p) => {
        const pCat = (p.category || "").toLowerCase();
        const pName = (p.name || "").toLowerCase();
        const hasImg = p.img && typeof p.img === "string" && !p.img.includes("commingsoon");
        if (!hasImg) return false;

        const isClean = pCat.includes("cleaner");
        const isAuto =
          /cleaner|robotic|robo|polaris|dolphin|trivac|aquavac|tigershark|sharkvac|baracuda|prowler/i.test(
            pName,
          );
        const isBlacklisted = BLACKLIST_NAMES.some((b) => pName.includes(b));
        const notSmallPart =
          !/cable|bag|tire|brush|hose|bracket|adapter|fitting|part|applicator/i.test(pName) &&
          p.price > 300;

        return isClean && isAuto && !isBlacklisted && notSmallPart;
      })
      .sort((a, b) => b.price - a.price);
  }, [allPoolProducts]);

  // Pumps filter (Complete variable-speed & commercial pumps > $400)
  const pumps = useMemo(() => {
    return allPoolProducts
      .filter((p) => {
        const pCat = (p.category || "").toLowerCase();
        const pName = (p.name || "").toLowerCase();
        const hasImg = p.img && typeof p.img === "string" && !p.img.includes("commingsoon");
        if (!hasImg) return false;

        const isPump = pCat === "pumps" || pCat.includes("pump");
        const isRealPump = /pump|epump|vs|variable|pro series|tristar/i.test(pName);
        const isBlacklisted = BLACKLIST_NAMES.some((b) => pName.includes(b));
        const notSmallPart =
          !/seal|gasket|impeller|lid|basket|fitting|union|adhesive|flange|switch/i.test(pName) &&
          p.price > 400;

        return isPump && isRealPump && !isBlacklisted && notSmallPart;
      })
      .sort((a, b) => b.price - a.price);
  }, [allPoolProducts]);

  // Heaters filter (Complete gas, electric & heat pumps > $400)
  const heaters = useMemo(() => {
    return allPoolProducts
      .filter((p) => {
        const pCat = (p.category || "").toLowerCase();
        const pName = (p.name || "").toLowerCase();
        const hasImg = p.img && typeof p.img === "string" && !p.img.includes("commingsoon");
        if (!hasImg) return false;

        const isHeater = pCat === "heaters" || pCat.includes("heater");
        const isRealHeater = /heater|heating|heat pump|lonx|jxi|dual fuel|e3t|18kw|btu/i.test(
          pName,
        );
        const isBlacklisted = BLACKLIST_NAMES.some((b) => pName.includes(b));
        const notSmallPart =
          !/board|kit|switch|sensor|wire|governer|limit|fitting|union|105k lp/i.test(pName) &&
          p.price > 400;

        return isHeater && isRealHeater && !isBlacklisted && notSmallPart;
      })
      .sort((a, b) => b.price - a.price);
  }, [allPoolProducts]);

  // Lights filter (Pool & Spa LED fixtures > $200)
  const lights = useMemo(() => {
    return allPoolProducts
      .filter((p) => {
        const pCat = (p.category || "").toLowerCase();
        const pName = (p.name || "").toLowerCase();
        const hasImg = p.img && typeof p.img === "string" && !p.img.includes("commingsoon");
        if (!hasImg) return false;

        const isLight = pCat === "lights" || pCat.includes("light");
        const isRealLight = /light|led|color|pure white|rgbw|ib as/i.test(pName);
        const isBlacklisted = BLACKLIST_NAMES.some((b) => pName.includes(b));
        const notSmallPart =
          !/cable|screw|gasket|lens|ring|adapter kit|housing|cord only/i.test(pName) &&
          p.price > 200;

        return isLight && isRealLight && !isBlacklisted && notSmallPart;
      })
      .sort((a, b) => b.price - a.price);
  }, [allPoolProducts]);

  // Curate 10 best sellers with Auto Cleaners leading as #1
  const displayedProducts = useMemo(() => {
    if (activeTab === "cleaners") return autoCleaners.slice(0, 10);
    if (activeTab === "pumps") return pumps.slice(0, 10);
    if (activeTab === "heaters") return heaters.slice(0, 10);
    if (activeTab === "lights") return lights.slice(0, 10);

    // "all": Curate target IDs with Auto Cleaners strictly at positions 1-4
    const byIdMap = new Map(allPoolProducts.map((p) => [p.id, p]));
    const featured = CURATED_FEATURED_IDS.map((id) => byIdMap.get(id)).filter((p): p is Product =>
      Boolean(p),
    );

    // Backfill strictly from the 4 requested categories if needed
    if (featured.length < 10) {
      const existingIds = new Set(featured.map((p) => p.id));
      const fillers = [
        ...autoCleaners.filter((p) => !existingIds.has(p.id)),
        ...pumps.filter((p) => !existingIds.has(p.id)),
        ...heaters.filter((p) => !existingIds.has(p.id)),
        ...lights.filter((p) => !existingIds.has(p.id)),
      ];
      featured.push(...fillers.slice(0, 10 - featured.length));
    }

    return featured.slice(0, 10);
  }, [activeTab, allPoolProducts, autoCleaners, pumps, heaters, lights]);

  if (isLoading && allPoolProducts.length === 0) {
    return (
      <section className="py-[60px] bg-surface flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </section>
    );
  }

  const tabs: { key: CategoryTab; label: string; icon: any; badge?: string }[] = [
    { key: "all", label: "All Featured", icon: Sparkles },
    { key: "cleaners", label: "Auto Cleaners", icon: Bot, badge: "#1 Top Pick" },
    { key: "pumps", label: "Pool Pumps", icon: Waves },
    { key: "heaters", label: "Heaters", icon: Flame },
    { key: "lights", label: "Pool Lights", icon: Lightbulb },
  ];

  return (
    <section className="py-[60px] bg-surface border-t border-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header Row */}
        <div className="flex items-end justify-between flex-wrap gap-4 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.25em] text-[oklch(0.50_0.14_232)] font-semibold">
                Curated Pro Equipment
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Auto Cleaners #1
              </span>
            </div>
            <h2 className="mt-2 text-2xl sm:text-3xl lg:text-[38px] font-extrabold tracking-tight">
              Best Sellers
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-xl">
              Automatic robotic pool cleaners, commercial-grade pumps, high-efficiency heaters &amp;
              LED lighting at direct trade sale prices.
            </p>
          </div>

          <Link
            to="/shop/$category"
            params={{ category: "cleaners" }}
            search={{ q: "" }}
            className="group hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:text-primary hover:border-primary/40 hover:shadow-md transition-all shadow-2xs"
          >
            Shop All Cleaners{" "}
            <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 mb-6 sm:mb-8 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm scale-102"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200/80 hover:bg-slate-50"
                }`}
              >
                <Icon className={`size-3.5 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-xs font-black uppercase px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? "bg-cyan-400 text-slate-900"
                        : "bg-cyan-50 text-cyan-700 border border-cyan-200"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 5 Cards per Row on Large Screens, 2 Rows = 10 Products */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-4.5">
          {displayedProducts.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
