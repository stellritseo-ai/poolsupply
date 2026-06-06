import pump from "@/assets/cat-pump.jpg";
import heater from "@/assets/cat-heater.jpg";
import light from "@/assets/cat-light.jpg";
import filter from "@/assets/cat-filter.jpg";
import cleaner from "@/assets/cat-cleaner.jpg";
import automation from "@/assets/cat-automation.jpg";

export type Review = {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  content: string;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  price: number;
  msrp: number; // For retail comparison
  rating: number;
  img: string;
  sku: string;
  category: string;
  stock: number;
  description: string;
  specs: Record<string, string>;
  reviews: Review[];
};

export const products: Product[] = [
  {
    id: "p-intelliflo",
    name: "Variable-Speed IntelliFlo Pump",
    brand: "Pentair",
    price: 1289,
    msrp: 1599,
    rating: 4.9,
    img: pump,
    sku: "PEN-VSP-101",
    category: "Pool Pumps",
    stock: 18,
    description: "The IntelliFlo Variable Speed Pump has been the choice of pool professionals for over a decade. Featuring energy-saving technology, quiet operation, and built-in diagnostics, it provides superior water circulation and filtration efficiency. Its advanced motor can save up to 90% in energy costs compared to traditional single-speed pumps.",
    specs: {
      "Horsepower": "3.0 HP",
      "Voltage": "230V",
      "Flow Rate": "Up to 140 GPM",
      "Port Size": "2\" x 2\" NPT",
      "Speed Range": "450 - 3450 RPM",
      "Warranty": "3 Years Professional Warranty"
    },
    reviews: [
      {
        id: "r1",
        author: "Marcus T., Pool Builder",
        rating: 5,
        date: "2026-05-14",
        title: "Industry Standard for a Reason",
        content: "I've installed dozens of these Pentair pumps. They are incredibly reliable, quiet as a whisper, and the clients love the energy savings. Worth every penny."
      },
      {
        id: "r2",
        author: "Sarah J., Homeowner",
        rating: 5,
        date: "2026-04-20",
        title: "Electric bill dropped immediately",
        content: "Replaced an old single speed pump with this IntelliFlo. My electric bill dropped by almost $70 a month! Extremely quiet too."
      }
    ]
  },
  {
    id: "p-raypak-400k",
    name: "Digital Pool Heater Pro 400K",
    brand: "Raypak",
    price: 2499,
    msrp: 2999,
    rating: 4.8,
    img: heater,
    sku: "RAY-DPH-400",
    category: "Pool Heaters",
    stock: 7,
    description: "The Raypak Digital 400K BTU Pool Heater is designed for premium performance, boasting a rust-resistant cabinet, copper fin tubes, and a smart microprocessor-based thermostat control. Perfect for heating large residential pools quickly, extending your swim season, and maintaining perfect temperatures even in chilly climates.",
    specs: {
      "Capacity (BTU)": "400,000 BTU",
      "Fuel Type": "Natural Gas / Propane",
      "Ignition": "Electronic Digital Ignition",
      "Thermal Efficiency": "82%",
      "Gas Connection": "3/4\" NPT",
      "Warranty": "2 Years Manufacturer Warranty"
    },
    reviews: [
      {
        id: "r3",
        author: "Dave K., AquaTech Services",
        rating: 5,
        date: "2026-05-22",
        title: "Superb heating capacity",
        content: "This heater is a beast. Warms up a 25,000 gallon pool in no time. The electronic controls are solid and user friendly."
      },
      {
        id: "r4",
        author: "Elena R.",
        rating: 4,
        date: "2026-05-02",
        title: "Works great, runs a bit loud",
        content: "Heats the pool beautifully, but there's a noticeable hum when running. Still, it works fast and lets us swim in late October."
      }
    ]
  },
  {
    id: "p-colorlogic",
    name: "ColorLogic LED Pool Light",
    brand: "Hayward",
    price: 349,
    msrp: 449,
    rating: 4.9,
    img: light,
    sku: "HAY-LED-500",
    category: "Pool Lights",
    stock: 42,
    description: "Light up your pool with Hayward's ColorLogic LED Pool Lights. Providing vibrant color shows and energy-efficient illumination, these low-profile lights install easily and run on low-voltage safety standards. Cycle through 10 solid colors and 7 custom color-changing shows to set the perfect mood.",
    specs: {
      "Bulb Type": "High-Efficiency LED",
      "Color Options": "10 Solid Colors & 7 Dynamic Shows",
      "Voltage": "12V AC",
      "Cord Length": "50 Feet",
      "Wattage": "45W",
      "Warranty": "1 Year Parts Warranty"
    },
    reviews: [
      {
        id: "r5",
        author: "Pete M., Lighting Installer",
        rating: 5,
        date: "2026-06-01",
        title: "Vibrant and easy to seal",
        content: "Hayward did a great job with the design. It seals perfectly in the niche, and the colors are much brighter than older generations."
      }
    ]
  },
  {
    id: "p-cx3",
    name: "Robotic Pool Cleaner CX-3",
    brand: "Jandy",
    price: 899,
    msrp: 1099,
    rating: 4.7,
    img: cleaner,
    sku: "JAN-RPC-CX3",
    category: "Pool Cleaners",
    stock: 14,
    description: "The Jandy CX-3 Robotic Pool Cleaner takes the hassle out of pool maintenance. Equipped with dual traction control, active scrubbing brushes, and an extra-large filter canister, it cleans floors, walls, and scrub lines with ease. Smart navigation scans your pool layout to avoid obstacles and optimize routing.",
    specs: {
      "Cleaner Type": "Robotic Wall-Climbing Cleaner",
      "Cable Length": "60 Feet (Tangle-Free Swivel)",
      "Cleaning Cycle": "2.5 Hours",
      "Pool Surfaces": "All Surfaces (Vinyl, Gunite, Fiberglass)",
      "Filter Type": "Fine Mesh Cartridge Canister",
      "Warranty": "2 Years Limited Warranty"
    },
    reviews: [
      {
        id: "r6",
        author: "Brian G.",
        rating: 4,
        date: "2026-05-18",
        title: "Excellent scrub performance",
        content: "Climbs walls like a champ. Scrubbing brushes actually remove the waterline dirt line. Deducted one star because the canister fills up quickly if there are lots of leaves."
      }
    ]
  },
  {
    id: "p-supermax",
    name: "SuperMax VS Variable Speed Pump",
    brand: "Pentair",
    price: 949,
    msrp: 1199,
    rating: 4.8,
    img: pump,
    sku: "PEN-VS-202",
    category: "Pool Pumps",
    stock: 23,
    description: "The Pentair SuperMax VS Variable Speed Pump brings the efficiency of variable speed technology to standard pool setups. Ideal for everyday residential pools, it features a simple-to-program digital controller, robust construction, and ultra-quiet motor. It is the perfect upgrade to save energy without paying premium pump costs.",
    specs: {
      "Horsepower": "1.5 HP",
      "Voltage": "115V / 230V Auto-Sensing",
      "Flow Rate": "Up to 95 GPM",
      "Port Size": "1.5\" x 1.5\" NPT",
      "Speed Range": "600 - 3450 RPM",
      "Warranty": "2 Years Professional Warranty"
    },
    reviews: [
      {
        id: "r7",
        author: "Alex C.",
        rating: 5,
        date: "2026-04-11",
        title: "Perfect replacement pump",
        content: "Swapped my old single-speed 1.5HP pump. Perfect fit, didn't have to adjust plumbing too much. It runs extremely quiet."
      }
    ]
  },
  {
    id: "p-h400fd",
    name: "Universal H-Series 400K BTU Heater",
    brand: "Hayward",
    price: 2299,
    msrp: 2799,
    rating: 4.6,
    img: heater,
    sku: "HAY-H400-GAS",
    category: "Pool Heaters",
    stock: 9,
    description: "Hayward's Universal H-Series heaters combine state-of-the-art heating technology with reliable durability. Engineered with a Cupro-Nickel heat exchanger, it stands up to chemical imbalances and high velocity flows. It offers low NOx emissions, making it an eco-friendly choice for heating your pool and spa.",
    specs: {
      "Capacity (BTU)": "400,000 BTU",
      "Fuel Type": "Natural Gas",
      "Ignition": "Silicon Nitride Hot Surface Ignition",
      "Heat Exchanger": "Cupro-Nickel (Corrosion Resistant)",
      "Emissions": "Low NOx Certified",
      "Warranty": "3 Years Parts & Labor Warranty"
    },
    reviews: [
      {
        id: "r8",
        author: "Gregory S.",
        rating: 5,
        date: "2026-03-30",
        title: "Heats fast, durable build",
        content: "I've had this heater for a year now. The salt water hasn't corroded it at all thanks to the cupro-nickel design. Heats my spa in 10 minutes."
      }
    ]
  },
  {
    id: "p-intellibrite",
    name: "IntelliBrite 5G Color LED Light",
    brand: "Pentair",
    price: 419,
    msrp: 529,
    rating: 4.9,
    img: light,
    sku: "PEN-IB-5G",
    category: "Pool Lights",
    stock: 31,
    description: "The IntelliBrite 5G Color LED Light uses a combination of mixed LEDs to create a spectacular range of colors. With custom reflectors and a unique lens shape, it offers superior light distribution and brightness while utilizing less power than traditional lights.",
    specs: {
      "Bulb Type": "Color LED",
      "Voltage": "120V",
      "Cord Length": "100 Feet",
      "Wattage": "30W",
      "Color Options": "5 Fixed Colors, 7 Shows",
      "Warranty": "1 Year Warranty"
    },
    reviews: [
      {
        id: "r9",
        author: "Nate D.",
        rating: 5,
        date: "2026-05-05",
        title: "Pentair quality shines",
        content: "Syncs perfectly with my Pentair automation system. The green and blue tones are incredibly vibrant in our white plaster pool."
      }
    ]
  },
  {
    id: "p-cv340",
    name: "CV Series Cartridge Filter 340 sq ft",
    brand: "Jandy",
    price: 1149,
    msrp: 1399,
    rating: 4.8,
    img: filter,
    sku: "JAN-CV-340",
    category: "Pool Filters",
    stock: 12,
    description: "Jandy CV Cartridge Filters deliver heavy-duty performance in a compact footprint. Designed for high-flow filtration, the four-cartridge system traps fine dirt down to 10-15 microns. Its easy-to-grip handles and quick-release clamp make cleaning and replacing cartridges a breeze.",
    specs: {
      "Filter Area": "340 Sq. Ft.",
      "Flow Rate": "127 GPM Max",
      "Capacity": "Up to 60,000 Gallons",
      "Filter Elements": "4 Cartridges",
      "Height / Width": "41\" / 25\"",
      "Warranty": "2 Years Professional Warranty"
    },
    reviews: [
      {
        id: "r10",
        author: "Frank W., Pool Tech",
        rating: 5,
        date: "2026-06-03",
        title: "Crystal clear water",
        content: "Hands down the best cartridge filter on the market. Plumbing is clean, pressure gauge is accurate, and the water clarity is unmatched."
      }
    ]
  },
  {
    id: "p-clean-clear",
    name: "Clean & Clear Plus Cartridge Filter",
    brand: "Pentair",
    price: 899,
    msrp: 1099,
    rating: 4.7,
    img: filter,
    sku: "PEN-CC-320",
    category: "Pool Filters",
    stock: 16,
    description: "The Clean & Clear Plus Cartridge Filter features a chemical-resistant tank with four cartridges that filter water to microscopic levels. The high-capacity design ensures longer filter cycles and fewer cleanings, saving water and chemicals over time.",
    specs: {
      "Filter Area": "320 Sq. Ft.",
      "Flow Rate": "120 GPM",
      "Tank Material": "Fiberglass Reinforced Polypropylene",
      "Cartridges": "4 Cartridges",
      "Pressure Relief": "Manual High-Flow Valve",
      "Warranty": "1 Year Warranty"
    },
    reviews: [
      {
        id: "r11",
        author: "Tiffany O.",
        rating: 4,
        date: "2026-04-28",
        title: "Excellent filtration, heavy to clean",
        content: "Water is absolutely spotless! The cartridges are large and hold a lot of debris. Cleaning all four cartridges takes about an hour, but you only have to do it twice a season."
      }
    ]
  },
  {
    id: "p-polaris-alpha",
    name: "Polaris Alpha iQ Robotic Cleaner",
    brand: "Polaris",
    price: 1199,
    msrp: 1499,
    rating: 4.9,
    img: cleaner,
    sku: "POL-ALPHA-IQ",
    category: "Pool Cleaners",
    stock: 8,
    description: "The Polaris Alpha iQ delivers customized cleaning using smart sensor technology. Featuring vortex vacuum power, standard 4WD mobility, and smartphone control via Wi-Fi, it scrubs floors, walls, and waterline automatically, letting you monitor status anywhere, anytime.",
    specs: {
      "Cleaner Type": "Smart Wi-Fi Robotic Cleaner",
      "Cable Length": "60 Feet",
      "App Control": "iAquaLink App Integration",
      "Drive Type": "4-Wheel Drive Traction",
      "Scrubbing": "Active Front Scrubbing Brush",
      "Warranty": "3 Years Limited Warranty"
    },
    reviews: [
      {
        id: "r12",
        author: "Ray V.",
        rating: 5,
        date: "2026-05-19",
        title: "Unbelievable cleaning power",
        content: "Love the Wi-Fi connectivity. I can start it from my phone while at work and come home to a clean pool. The canister lift system pushes out water so it's light when pulling it out."
      }
    ]
  },
  {
    id: "p-intellicenter",
    name: "IntelliCenter Pool Control System",
    brand: "Pentair",
    price: 1849,
    msrp: 2249,
    rating: 4.8,
    img: automation,
    sku: "PEN-IC-AUTO",
    category: "Automation Systems",
    stock: 5,
    description: "The IntelliCenter Pool Control System is the latest, most advanced automation system from Pentair. It allows you to control pool/spa functions, lighting, pumps, chemistry, and heaters via a colorful touchscreen interface or globally via smartphone, tablet, or web browser.",
    specs: {
      "Control Type": "Smart Touchscreen & Cloud Connection",
      "Relays": "4 High-Voltage Relays (Expandable)",
      "Mobile App": "IntelliCenter2 App (iOS / Android)",
      "Voltage": "120V / 240V Input",
      "Enclosure": "IP65 Weatherproof Steel Cabinet",
      "Warranty": "3 Years Warranty with Professional Install"
    },
    reviews: [
      {
        id: "r13",
        author: "Leo P., Pool Automation Specialist",
        rating: 5,
        date: "2026-06-02",
        title: "Next-gen control system",
        content: "The IntelliCenter is a massive step up from EasyTouch. The touchscreen is responsive, and setting up schedules and groups is incredibly simple. Clients love the app."
      }
    ]
  },
  {
    id: "p-aquafink",
    name: "AquaLink RS OneTouch Automation",
    brand: "Jandy",
    price: 1399,
    msrp: 1699,
    rating: 4.7,
    img: automation,
    sku: "JAN-AL-RS4",
    category: "Automation Systems",
    stock: 11,
    description: "Control your pool and spa with the Jandy AquaLink RS system. Offering smart, programmable schedules and simple interfaces, it enables seamless automation of pumps, filters, heaters, chemical dispensers, and landscape lighting, optimizing energy efficiency and operation.",
    specs: {
      "Control Type": "OneTouch Programmable Panel",
      "Relays": "4 Standard Relays",
      "App Control": "iAquaLink Compatible (Needs Antenna)",
      "Schedules": "Up to 99 Custom Programs",
      "Temp Control": "Dual Temp (Pool & Spa)",
      "Warranty": "2 Years Limited Warranty"
    },
    reviews: [
      {
        id: "r14",
        author: "Timothy H.",
        rating: 4,
        date: "2026-04-15",
        title: "Solid, dependable automation",
        content: "AquaLink is very dependable. Setup requires some basic technical knowledge, but once configured, it runs without a hitch year-round."
      }
    ]
  },
  {
    id: "p-ultratemp",
    name: "UltraTemp High Performance Heat Pump",
    brand: "Pentair",
    price: 3299,
    msrp: 3999,
    rating: 4.9,
    img: heater,
    sku: "PEN-UT-120HC",
    category: "Electric Heat Pumps",
    stock: 6,
    description: "The Pentair UltraTemp Heat Pump provides maximum energy efficiency and reliability. Featuring an advanced titanium heat exchanger, it uses environmental heat to warm your pool water for a fraction of the cost of gas heaters. Fully compatible with automated control systems and featuring an intuitive digital control board.",
    specs: {
      "Capacity": "120,000 BTU",
      "Voltage": "230V, 60Hz, 1-Phase",
      "Heat Exchanger": "Titanium (Corrosion-Free)",
      "COP (Efficiency)": "5.8",
      "Noise Level": "56 dB (Ultra Quiet)",
      "Warranty": "2 Years Parts & Labor Warranty"
    },
    reviews: [
      {
        id: "r15",
        author: "Sarah W.",
        rating: 5,
        date: "2026-05-12",
        title: "Remarkably efficient",
        content: "We live in Florida and run this heat pump year round. It keeps our pool at a perfect 84 degrees, and our electric bill is barely affected. The titanium construction gives peace of mind."
      }
    ]
  }
];

export function getProductsList(): Product[] {
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem("aquapro_db_products");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Failed to parse products database from localStorage", e);
      }
    }
  }
  return products;
}

export function getProductById(id: string): Product | undefined {
  return getProductsList().find((p) => p.id === id);
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return getProductsList()
    .filter((p) => p.id !== product.id && (p.category === product.category || p.brand === product.brand))
    .slice(0, limit);
}
