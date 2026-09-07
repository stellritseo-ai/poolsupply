/**
 * Dynamic Shipping Calculator — Idea 2: Base Rate × Distance Fraction
 * Pool Supply Wholesalers · Warehouse: 412 Ezell Pike, Nashville, TN 37217
 *
 * Base Rates (at 50+ miles in Tennessee):
 *   Small Items  (< $100)    → $50.00 base rate
 *   Medium Items ($100–$500) → $150.00 base rate
 *   Large Items  (> $500)    → $400.00 base rate
 *
 * Distance Formula (Straight-line from warehouse via Haversine / OpenStreetMap):
 *   - Inside Tennessee:  shipping = base_rate × min(miles / 50, 1.0)
 *   - Outside Tennessee: shipping = base_rate × 2.0 (double the 50+ mi rate)
 *
 * Examples (Small Item, $50 base):
 *   3 mi   → $50 × (3 / 50)   = $3.00
 *   10 mi  → $50 × (10 / 50)  = $10.00
 *   25 mi  → $50 × (25 / 50)  = $25.00
 *   50+ mi → $50 × 1.0        = $50.00 (capped at base rate)
 *   Outside TN → $50 × 2.0    = $100.00
 *
 * Geocoding: OpenStreetMap Nominatim (cached per session, free, no API key).
 *   - computeShipping()      → synchronous fallback using static TN ZIP table
 *   - computeShippingAsync() → queries Nominatim for exact lat/lon & distance
 */

import type { CartItem } from "@/components/site/cart-context";

// ---------------------------------------------------------------------------
// Warehouse coordinates — 412 Ezell Pike, Nashville, TN 37217
// ---------------------------------------------------------------------------
export const WAREHOUSE_ADDRESS = "412 Ezell Pike, Nashville, TN 37217";
export const WAREHOUSE_LAT = 36.0965;
export const WAREHOUSE_LNG = -86.6671;
export const BASE_DISTANCE_MILES = 50; // Distance at which full base rate is reached

// ---------------------------------------------------------------------------
// Base rates per product class
// ---------------------------------------------------------------------------

export const SHIPPING_BASE_RATES = {
  small: 50,    // < $100
  medium: 150,  // $100–$500
  large: 400,   // > $500
} as const;

export type ShippingClass = keyof typeof SHIPPING_BASE_RATES;

/**
 * Semantic and physical product classifier.
 * Evaluates real-world weight mentions (e.g. 80 lb plaster, 50 lb tabs),
 * heavy equipment types (pumps, heaters, pool kits, liners, ladders),
 * and small replacement parts/fittings.
 */
export function classifyProductByNameAndPrice(
  name: string,
  price: number,
  category?: string,
  details?: string
): "Small" | "Medium" | "Large" {
  const text = `${name || ""} ${category || ""} ${details || ""}`.toLowerCase();
  const lowerName = (name || "").toLowerCase();
  const lowerCat = (category || "").toLowerCase();
  const numPrice = typeof price === "number" ? price : parseFloat(String(price)) || 0;

  // 1. Weight / Volume extraction from title, description or details
  const multiLbMatch = text.match(/(\d+)\s*x\s*(\d+(?:\.\d+)?)\s*(?:lb|lbs|pound)/);
  let totalWeight = 0;
  if (multiLbMatch) {
    totalWeight = parseFloat(multiLbMatch[1]) * parseFloat(multiLbMatch[2]);
  } else {
    const singleLbMatch = text.match(/\b(\d+(?:\.\d+)?)\s*(?:lb|lbs|pound|pounds|kg)\b/);
    if (singleLbMatch) {
      const val = parseFloat(singleLbMatch[1]);
      const isKg = singleLbMatch[0].includes("kg");
      totalWeight = isKg ? val * 2.2 : val;
    }
  }

  const galMatch = text.match(/\b(\d+(?:\.\d+)?)\s*(?:gal|gallon|gallons)\b/);
  const gallons = galMatch ? parseFloat(galMatch[1]) : 0;

  // Direct weight triggers:
  // Any product >= 35 lbs or >= 5 gallons is Heavy Freight / Large (e.g. 80 lb plaster, 50 lb tabs)
  if (totalWeight >= 35 || gallons >= 5) return "Large";
  // Any product >= 10 lbs or >= 1 gallon is Medium
  if (totalWeight >= 10 || gallons >= 1) return "Medium";

  // Plaster, aggregates, sand, beads, pebbles, mortar (e.g. 80 lb bags, 50 lb bags)
  if (/\b(plaster|aggregate|glass beads|pebble|stucco|mortar|marcite)\b/.test(lowerName) || lowerCat === "plaster") {
    if (totalWeight >= 35 || /\b(80|50|40)\s*lb\b/.test(lowerName) || numPrice > 25) {
      return "Large";
    }
    return "Medium";
  }

  // Major Heavy Freight items:
  // Liners (above ground & inground liners are 50-100 lbs of heavy vinyl)
  if (/\b(liner|overlap liner|beaded liner|unibead|ez clip|ag liner|inground liner)\b/.test(lowerName) && numPrice > 100) {
    return "Large";
  }

  // Covers (safety covers, winter covers, solid covers, mesh covers)
  if (/\b(safety cover|winter cover|solid cover|mesh cover|aquacover|solar cover)\b/.test(lowerName) && numPrice > 50) {
    return "Large";
  }

  // Complete Pool Kits / Pools / Tanning Ledges
  if (/\b(pool kit|swimming pool|above ground pool|inground pool|tanning ledge|ag kit|resin ag|pool package)\b/.test(lowerName) || lowerCat === "pool kits") {
    if (numPrice > 120 || !/\b(screw|bolt|gasket|patch|tape|fitting|plug|adaptor)\b/.test(lowerName)) {
      if (numPrice > 60) return "Large";
    }
  }

  // Complete Pumps (e.g. "1 HP SUPER PUMP", "WhisperFlo", "IntelliFlo", "TriStar")
  const isCompletePump = /\b(super pump|whisperflo|intelliflo|tristar|ecostar|maxflo|challenger|supermax|champion|variable speed pump)\b/.test(lowerName) ||
    (/\b(\d+(?:\.\d+)?\s*hp)\b/.test(lowerName) && /\bpump\b/.test(lowerName) && !/\b(seal|gasket|impeller|basket|lid|diffuser|o-ring)\b/.test(lowerName));
  if (isCompletePump && numPrice > 150) {
    return "Large";
  }

  // Complete Heaters & Heat Pumps
  const isCompleteHeater = /\b(heat pump|gas heater|jxi heater|mastertemp|max-e-therm|e3t|low ambient)\b/.test(lowerName) ||
    (/\bheater\b/.test(lowerName) && /\bbtu\b/.test(lowerName) && !/\b(sensor|limit|igniter|pilot|lead wire|fuse)\b/.test(lowerName));
  if (isCompleteHeater && numPrice > 150) {
    return "Large";
  }

  // Filter Tanks (complete filter units, not cartridges)
  const isFilterTank = /\b(sand filter|de filter|triton|tagelus|clean & clear plus|system 3|swimclear)\b/.test(lowerName) &&
    !/\b(cartridge element|replacement cartridge|filter grid|o-ring|drain plug|gauge)\b/.test(lowerName);
  if (isFilterTank && numPrice > 150) {
    return "Large";
  }

  // Heavy Deck Structures (ladders, steps, slides, diving boards, 20ft rebar)
  if (/\b(diving board|jump board|slide|ladder|handrail|stair|step system|drop-in step|lifeguard chair|rebar 20|20ft rebar|20' rebar)\b/.test(lowerName) && numPrice > 50) {
    return "Large";
  }

  // Robotic Cleaners
  if (/\b(robotic cleaner|dolphin|polaris 280|polaris 380|polaris 3900|tigershark|aquabot)\b/.test(lowerName) && numPrice > 200) {
    return "Large";
  }

  // Medium equipment
  if (/\b(motor|century motor|square flange|c-face|ao smith)\b/.test(lowerName) && numPrice > 60) return "Medium";
  if (/\b(multiport valve|backwash valve|slide valve|actuator|diverter valve|2-way valve|3-way valve)\b/.test(lowerName) && numPrice > 40) return "Medium";
  if (/\b(salt cell|t-cell|chlorinator cell|turbocell|intellichlor|replace cell)\b/.test(lowerName) && numPrice > 80) return "Medium";
  if (/\b(intellibrite|colorlogic|globrite|amerlite|pool light|spa light)\b/.test(lowerName) && numPrice > 80) return "Medium";
  if (/\b(filter grid|cartridge element|replacement cartridge|filter cartridge)\b/.test(lowerName) && numPrice > 35) return "Medium";
  if (/\b(chlorinator|chemical feeder|rainbow feeder|erosion feeder)\b/.test(lowerName) && numPrice > 40) return "Medium";
  if (/\b(vacuum hose|vac hose)\b/.test(lowerName) && numPrice > 25) return "Medium";
  if (/\b(power center|load center|control board|pcb board|motherboard|sub panel)\b/.test(lowerName) && numPrice > 100) return "Medium";

  // Small parts indicators
  const isPart = /\b(o-ring|oring|gasket|seal|screws?|bolts?|nuts?|washer|spring|clip|pin|latch|thermistor|fuse|gauge|thermometer|plug|fitting|union|adapter|bushing|nipple|coupling|elbow|tee|reagent|test strip|test kit|adhesive|glue|cement|primer|silicone|lube|lubricant|knob|bracket|drain plug|impeller|diffuser|basket|weir|eyeball|orifice|igniter|pilot|lead wire)\b/.test(lowerName);
  if (isPart) return "Small";

  // Specific small switches / sensors
  if (/\b(switch|sensor)\b/.test(lowerName) && numPrice < 200) return "Small";

  // Default fallback based on price tier
  if (numPrice < 100) return "Small";
  if (numPrice <= 500) return "Medium";
  return "Large";
}

/**
 * Classify a product by explicit productSize or name/weight characteristics, falling back to price.
 */
export function getShippingClass(
  price: number,
  productSize?: string,
  name?: string
): ShippingClass {
  const size = (productSize || "").trim().toLowerCase();
  if (size.includes("small") || size === "s") return "small";
  if (size.includes("medium") || size === "m") return "medium";
  if (size.includes("large") || size === "l" || size.includes("freight") || size === "xl") {
    return "large";
  }

  if (name) {
    return classifyProductByNameAndPrice(name, price).toLowerCase() as ShippingClass;
  }

  if (price < 100) return "small";
  if (price <= 500) return "medium";
  return "large";
}

/**
 * Distance multiplier based on Idea 2:
 * - Inside TN: miles / 50 (capped at 1.0)
 * - Outside TN: 2.0 (double the full base rate)
 */
export function getDistanceMultiplier(
  miles: number,
  isOutsideTN: boolean
): number {
  if (isOutsideTN) return 2.0;
  return +Math.min(Math.max(miles, 0) / BASE_DISTANCE_MILES, 1.0).toFixed(4);
}

/**
 * Compute the shipping cost for a single item line.
 */
export function lineItemShipping(
  cls: ShippingClass,
  multiplier: number
): number {
  const baseRate = SHIPPING_BASE_RATES[cls];
  return +(baseRate * multiplier).toFixed(2);
}

// ---------------------------------------------------------------------------
// Distance & Zone Mappings
// ---------------------------------------------------------------------------

/** Map distance in miles to a regional zone (1–8 for TN, 9 for outside TN). */
export function getZoneFromDistanceMiles(miles: number): number {
  if (miles <= 5) return 1;
  if (miles <= 10) return 2;
  if (miles <= 20) return 3;
  if (miles <= 30) return 4;
  if (miles <= 50) return 5;
  if (miles <= 70) return 6;
  if (miles <= 100) return 7;
  return 8;
}

/** Representative distance in miles for static fallback zones */
export const ZONE_ESTIMATED_MILES: Record<number, number> = {
  1: 3,     // 0–5 mi (Nashville Local)
  2: 7.5,   // 5–10 mi
  3: 15,    // 10–20 mi
  4: 25,    // 20–30 mi (Regional Ground)
  5: 40,    // 30–50 mi
  6: 50,    // 50–70 mi (capped at full base rate)
  7: 50,    // 70–100 mi (capped at full base rate)
  8: 50,    // 100+ mi (TN, capped at full base rate)
  9: 100,   // Outside TN (double full base rate)
};

export const ZONE_MULTIPLIERS: Record<number, number> = {
  1: 3 / 50,     // 0.06
  2: 7.5 / 50,   // 0.15
  3: 15 / 50,    // 0.30
  4: 25 / 50,    // 0.50
  5: 40 / 50,    // 0.80
  6: 1.0,        // 1.00
  7: 1.0,        // 1.00
  8: 1.0,        // 1.00
  9: 2.0,        // 2.00 (Outside TN)
};

export const ZONE_LABELS: Record<number, string> = {
  1: "Local Nashville Area (0–5 mi)",
  2: "Metro Nashville (5–10 mi)",
  3: "Greater Nashville Area (10–20 mi)",
  4: "Regional Ground (20–30 mi)",
  5: "Extended Regional (30–50 mi)",
  6: "Statewide Freight (50–70 mi)",
  7: "Long-Haul Statewide (70–100 mi)",
  8: "Statewide Full Distance (100+ mi · TN)",
  9: "Out-of-State Commercial Freight",
};

// ---------------------------------------------------------------------------
// Geocoding — OpenStreetMap Nominatim
// ---------------------------------------------------------------------------

/** Module-level cache: ZIP string → coordinates (or null if not found) */
const _geoCache = new Map<string, { lat: number; lon: number } | null>();

/**
 * Geocode a US ZIP code via OpenStreetMap Nominatim.
 * Returns the centroid lat/lon of that ZIP area, or null on failure.
 * Results are cached for the lifetime of the page.
 */
export async function geocodeZip(
  zip: string
): Promise<{ lat: number; lon: number } | null> {
  const key = zip.trim().slice(0, 5);
  if (key.length < 5) return null;
  if (_geoCache.has(key)) return _geoCache.get(key) ?? null;

  try {
    const url =
      `https://nominatim.openstreetmap.org/search` +
      `?postalcode=${encodeURIComponent(key)}&countrycodes=us` +
      `&format=json&limit=1&addressdetails=0`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "PoolSupplyWholesalers/1.0 (poolsupply-ruby.vercel.app)",
        "Accept-Language": "en-US,en",
      },
    });

    if (!res.ok) {
      _geoCache.set(key, null);
      return null;
    }

    const data: Array<{ lat: string; lon: string }> = await res.json();
    if (!data.length) {
      _geoCache.set(key, null);
      return null;
    }

    const coords = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    _geoCache.set(key, coords);
    return coords;
  } catch {
    _geoCache.set(key, null);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Haversine distance calculation
// ---------------------------------------------------------------------------

/**
 * Straight-line distance in miles between two lat/lng points.
 */
export function haversineDistanceMiles(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ---------------------------------------------------------------------------
// Static Tennessee ZIP → Zone lookup (instant synchronous fallback)
// ---------------------------------------------------------------------------

const ZONE_1_ZIPS = new Set([
  "37211", "37217", "37220", "37221",
  "37210", "37212", "37213", "37214", "37216",
]);

const ZONE_2_ZIPS = new Set([
  "37201", "37203", "37204", "37205",
  "37206", "37207", "37208", "37209",
  "37215", "37218", "37219", "37228",
  "37115",
]);

const ZONE_3_ZIPS = new Set([
  "37013", "37027", "37072", "37076", "37080",
  "37138", "37189", "37232", "37234", "37235",
  "37236", "37238", "37240", "37241", "37242",
  "37243", "37244", "37246", "37248", "37250",
]);

const ZONE_4_ZIPS = new Set([
  "37064", "37067", "37069", "37075", "37086",
  "37087", "37090", "37122", "37129", "37130",
  "37132", "37135",
]);

const ZONE_5_ZIPS = new Set([
  "37014", "37037", "37046", "37048", "37059",
  "37066", "37073", "37118", "37146", "37153",
  "37160", "37174", "37179", "37180",
]);

const ZONE_6_ZIPS = new Set([
  "37010", "37015", "37016", "37022", "37025", "37028",
  "37032", "37033", "37040", "37041", "37042", "37043",
  "37044", "37049", "37052", "37055", "37057", "37061",
  "37062", "37074", "37082", "37083", "37101", "37110",
  "37140", "37143", "37148", "37150", "37151", "37152",
  "37165", "37167", "37171", "37172", "37175", "37178",
  "37181", "37183", "37186", "37187", "37188", "37190",
  "37191",
]);

const ZONE_7_ZIPS = new Set([
  "37011", "37020", "37311", "37312", "37315",
  "37316", "37321", "37323", "37329",
  "38401", "38402", "38451", "38452", "38461",
  "38462", "38483", "38487",
]);

const TN_ZONE_BY_3DIG_PREFIX: Record<string, number> = {
  "370": 5, "371": 6, "372": 4,
  "373": 8, "374": 8, "375": 8,
  "376": 8, "377": 8, "378": 8,
  "379": 8, "380": 8, "381": 8,
  "382": 8, "383": 8, "384": 8, "385": 8,
};

/**
 * Determine zone 1–9 from a ZIP + state using the static lookup table.
 */
export function getZoneFromZip(zip: string, state: string): number {
  const cleanZip = (zip || "").trim().slice(0, 5);
  const cleanState = (state || "").trim().toUpperCase();
  const stateTN =
    cleanState === "TN" || cleanState === "TENNESSEE" || cleanState === "TENN";

  if (!stateTN) return 9;

  if (ZONE_1_ZIPS.has(cleanZip)) return 1;
  if (ZONE_2_ZIPS.has(cleanZip)) return 2;
  if (ZONE_3_ZIPS.has(cleanZip)) return 3;
  if (ZONE_4_ZIPS.has(cleanZip)) return 4;
  if (ZONE_5_ZIPS.has(cleanZip)) return 5;
  if (ZONE_6_ZIPS.has(cleanZip)) return 6;
  if (ZONE_7_ZIPS.has(cleanZip)) return 7;

  const prefix3 = cleanZip.slice(0, 3);
  if (prefix3 && TN_ZONE_BY_3DIG_PREFIX[prefix3] !== undefined) {
    return TN_ZONE_BY_3DIG_PREFIX[prefix3];
  }

  return 8;
}

// ---------------------------------------------------------------------------
// Shared result types
// ---------------------------------------------------------------------------

export type ShippingBreakdownItem = {
  /** "small" | "medium" | "large" */
  cls: ShippingClass;
  /** Number of unique line-items in this class */
  lineCount: number;
  /** Base rate per item in this class (at 50+ miles) */
  baseRate: number;
  /** Combined base rate for this class (lineCount × baseRate) */
  baseTotal: number;
  /** Final calculated shipping amount for this class */
  finalAmount: number;
  /** Explanation label, e.g. "$50 base × (3.0 mi / 50 mi) = $3.00 each" */
  rateLabel: string;
};

export type ShippingResult = {
  /** Final calculated delivery shipping amount */
  amount: number;
  /** Zone 1–9 */
  zone: number;
  /** Human-readable zone label */
  zoneLabel: string;
  /** True when address is within 5 miles (eligible for Free Local Pickup) */
  isFreePickup: boolean;
  /** ZIP/state not yet entered — showing estimate */
  isPending: boolean;
  /** Per-class cost breakdown */
  breakdown: ShippingBreakdownItem[];
  /** Sum of all class base rates (before distance scaling) */
  baseTotal: number;
  /** Distance multiplier applied: min(miles / 50, 1.0) or 2.0 outside TN */
  multiplier: number;
  /** Straight-line distance in miles from warehouse */
  distanceMiles?: number;
  /** Whether the result came from Nominatim geocoding vs static table */
  geocoded?: boolean;
};

// ---------------------------------------------------------------------------
// Internal helper — build result from known zone and distance
// ---------------------------------------------------------------------------

function _buildResult(
  items: CartItem[],
  zone: number,
  opts: {
    isPending?: boolean;
    distanceMiles?: number;
    geocoded?: boolean;
    isOutsideTN?: boolean;
  } = {}
): ShippingResult {
  const isOutsideTN = zone === 9 || !!opts.isOutsideTN;
  const miles =
    opts.distanceMiles !== undefined
      ? opts.distanceMiles
      : ZONE_ESTIMATED_MILES[zone] ?? 25;

  const multiplier = getDistanceMultiplier(miles, isOutsideTN);
  // Eligible for Free Local Warehouse Pickup if address is within 5 miles in TN
  const isFreePickup = !isOutsideTN && miles <= 5;

  if (items.length === 0) {
    return {
      amount: 0,
      zone,
      zoneLabel: ZONE_LABELS[zone] ?? "Standard Ground",
      isFreePickup,
      isPending: opts.isPending ?? false,
      breakdown: [],
      baseTotal: 0,
      multiplier,
      distanceMiles: opts.distanceMiles ?? miles,
      geocoded: opts.geocoded,
    };
  }

  // Group items by class
  const classCounts: Record<ShippingClass, number> = {
    small: 0,
    medium: 0,
    large: 0,
  };

  for (const item of items) {
    const cls = getShippingClass(item.price, item.productSize, item.name);
    classCounts[cls] += 1;
  }

  const breakdown: ShippingBreakdownItem[] = [];
  let baseTotal = 0;
  let amountTotal = 0;

  for (const cls of ["small", "medium", "large"] as const) {
    const count = classCounts[cls];
    if (count === 0) continue;

    const baseRate = SHIPPING_BASE_RATES[cls];
    const clsBaseTotal = count * baseRate;
    const perItemCost = lineItemShipping(cls, multiplier);
    const clsFinalAmount = +(perItemCost * count).toFixed(2);

    baseTotal += clsBaseTotal;
    amountTotal += clsFinalAmount;

    let rateLabel = "";
    if (isOutsideTN) {
      rateLabel = `$${baseRate} base × 2.0 (outside TN) = $${perItemCost.toFixed(2)} each`;
    } else if (miles >= BASE_DISTANCE_MILES) {
      rateLabel = `$${baseRate} base at 50+ mi (capped) = $${perItemCost.toFixed(2)} each`;
    } else {
      rateLabel = `$${baseRate} base × (${miles.toFixed(1)} mi / 50 mi) = $${perItemCost.toFixed(2)} each`;
    }

    breakdown.push({
      cls,
      lineCount: count,
      baseRate,
      baseTotal: clsBaseTotal,
      finalAmount: clsFinalAmount,
      rateLabel,
    });
  }

  const amount = +amountTotal.toFixed(2);

  return {
    amount,
    zone,
    zoneLabel: ZONE_LABELS[zone] ?? "Standard Ground",
    isFreePickup,
    isPending: opts.isPending ?? false,
    breakdown,
    baseTotal: +baseTotal.toFixed(2),
    multiplier,
    distanceMiles: opts.distanceMiles ?? miles,
    geocoded: opts.geocoded,
  };
}

// ---------------------------------------------------------------------------
// Public API — synchronous (static ZIP table, instant)
// ---------------------------------------------------------------------------

/**
 * Synchronous shipping calculation using static TN ZIP table.
 * Used for CartDrawer and instant initial display in checkout.
 */
export function computeShipping(
  items: CartItem[],
  zip: string,
  state: string
): ShippingResult {
  const cleanZip = (zip || "").trim();
  const cleanState = (state || "").trim();
  const isPending = cleanZip.length < 5 || cleanState.length === 0;

  const zone = isPending ? 4 : getZoneFromZip(cleanZip, cleanState);
  const isOutsideTN = zone === 9;
  const miles = ZONE_ESTIMATED_MILES[zone] ?? 25;

  return _buildResult(items, zone, {
    isPending,
    distanceMiles: miles,
    geocoded: false,
    isOutsideTN,
  });
}

// ---------------------------------------------------------------------------
// Public API — async (OpenStreetMap Nominatim, exact distance)
// ---------------------------------------------------------------------------

/**
 * Async shipping calculator using OpenStreetMap Nominatim geocoding.
 * Calculates exact straight-line distance from Nashville warehouse.
 */
export async function computeShippingAsync(
  items: CartItem[],
  zip: string,
  state: string
): Promise<ShippingResult> {
  const cleanZip = (zip || "").trim().slice(0, 5);
  const cleanState = (state || "").trim().toUpperCase();
  const isPending = cleanZip.length < 5 || cleanState.length === 0;

  if (isPending) {
    return _buildResult(items, 4, {
      isPending: true,
      distanceMiles: 25,
      geocoded: false,
      isOutsideTN: false,
    });
  }

  const stateTN =
    cleanState === "TN" || cleanState === "TENNESSEE" || cleanState === "TENN";

  // Business rule: outside Tennessee → Zone 9 (2.0 multiplier)
  if (!stateTN) {
    const coords = await geocodeZip(cleanZip);
    let miles: number | undefined;
    if (coords) {
      miles = +haversineDistanceMiles(
        WAREHOUSE_LAT, WAREHOUSE_LNG,
        coords.lat, coords.lon
      ).toFixed(1);
    }
    return _buildResult(items, 9, {
      distanceMiles: miles ?? 100,
      geocoded: !!coords,
      isOutsideTN: true,
    });
  }

  // Inside Tennessee: Geocode via Nominatim
  const coords = await geocodeZip(cleanZip);

  if (coords) {
    const miles = +haversineDistanceMiles(
      WAREHOUSE_LAT, WAREHOUSE_LNG,
      coords.lat, coords.lon
    ).toFixed(1);
    const zone = getZoneFromDistanceMiles(miles);
    return _buildResult(items, zone, {
      distanceMiles: miles,
      geocoded: true,
      isOutsideTN: false,
    });
  }

  // Nominatim failed → fall back to static ZIP table
  const zone = getZoneFromZip(cleanZip, cleanState);
  const miles = ZONE_ESTIMATED_MILES[zone] ?? 25;
  return _buildResult(items, zone, {
    distanceMiles: miles,
    geocoded: false,
    isOutsideTN: false,
  });
}
