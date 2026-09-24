export interface DistributionHub {
  slug: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  stateFull: string;
  region: string;
  address: string;
  zip: string;
  phone: string;
  email: string;
  lat: number;
  lng: number;
  badge: string;
  headline: string;
  description: string;
  coverageStates: string[];
  transitTimes: string;
  willCallHours: string;
  willCallNote: string;
  specializedEquipment: { title: string; desc: string; link: string }[];
  regionalRegulations: { title: string; desc: string };
  metaTitle: string;
  metaDescription: string;
  faq: { q: string; a: string }[];
}

export const DISTRIBUTION_HUBS: DistributionHub[] = [
  {
    slug: "nashville-tn",
    name: "Nashville Central Logistics Depot & Corporate Distribution Hub",
    shortName: "Nashville Central Hub (HQ)",
    city: "Nashville",
    state: "TN",
    stateFull: "Tennessee",
    region: "Corporate HQ & Southeast / Midwest Central Depot",
    address: "412 Ezell Pike",
    zip: "37217",
    phone: "(802) 265-0320",
    email: "nashville@poolsupplywholesalers.com",
    lat: 36.123286,
    lng: -86.691764,
    badge: "Central Logistics HQ",
    headline: "Central Wholesale Pool Equipment Distribution Hub for Tennessee, the Southeast, and the Midwest",
    description:
      "Pool Supply Wholesalers' primary headquarters and central distribution terminal. Located minutes from Nashville International Airport and the I-40/I-24/I-65 freight corridors, our Nashville depot coordinates high-volume wholesale commercial inventory, palletized freight staging, same-day regional dispatch, and trade contractor will-call fulfillment.",
    coverageStates: [
      "Tennessee",
      "Kentucky",
      "Alabama",
      "Georgia",
      "North Carolina",
      "South Carolina",
      "Virginia",
      "Ohio",
      "Indiana",
      "Illinois",
    ],
    transitTimes:
      "Same-day freight dispatch for orders placed before 2:00 PM CST. Next-day ground delivery to Nashville, Memphis, Knoxville, Chattanooga, Louisville, Atlanta, Birmingham, and Huntsville. 2-day delivery throughout the Midwest and Mid-Atlantic.",
    willCallHours: "Monday – Friday: 7:00 AM – 5:00 PM CST (Dock #3)",
    willCallNote:
      "Available for verified pool builders, service companies, and commercial trade accounts. Please call (802) 265-0320 30 minutes prior to arrival for staged pallet loading.",
    specializedEquipment: [
      {
        title: "Commercial High-Capacity Variable Speed Pumps",
        desc: "Staged inventory of Pentair IntelliFloXF, Hayward TriStar VS 950, and commercial booster pumps for quick replacement.",
        link: "/shop/pumps",
      },
      {
        title: "Commercial Gas & Propane Heaters",
        desc: "Heavy-duty ASME certified Raypak AVIA and Pentair MasterTemp units with pre-inspected heat exchangers.",
        link: "/shop/heaters",
      },
      {
        title: "Commercial Cartridge & DE Filter Tanks",
        desc: "Clean & Clear Plus, Quad DE, and Hayward SwimClear tanks with complete internal manifold assemblies.",
        link: "/shop/filters",
      },
      {
        title: "Commercial Automation & Power Centers",
        desc: "Pentair IntelliCenter, IntelliTouch, and Hayward OmniLogic commercial power centers ready for immediate wiring.",
        link: "/shop/automation",
      },
    ],
    regionalRegulations: {
      title: "Southeast & Midwest Aquatic Guidelines",
      desc: "All staged pumps meet DOE Dedicated Purpose Pool Pump (DPPP) energy conservation standards. Heavy commercial gas heaters are factory-inspected for ASME code compliance for public hotels, community pools, and fitness clubs.",
    },
    metaTitle: "Wholesale Pool Supplies Nashville TN — Regional Distribution Hub | PSW",
    metaDescription:
      "Wholesale pool equipment distributor in Nashville, TN. Same-day commercial freight and contractor will-call for Pentair, Hayward, Jandy, and Raypak pumps, heaters, and filters.",
    faq: [
      {
        q: "Can pool contractors pick up equipment directly from the Nashville warehouse?",
        a: "Yes. Verified commercial accounts and licensed pool contractors can arrange will-call pickup at our 412 Ezell Pike depot Monday through Friday from 7:00 AM to 5:00 PM CST. We recommend calling (802) 265-0320 in advance so our warehouse team can pre-stage your pallet.",
      },
      {
        q: "What is the freight transit time from Nashville to surrounding states?",
        a: "Orders placed by 2:00 PM CST ship same day. Shipments to Tennessee, Kentucky, Georgia, Alabama, and southern Indiana arrive next business day via ground freight. Surrounding Midwest and Mid-Atlantic states arrive in 2 business days.",
      },
      {
        q: "Are commercial accounts exempt from sales tax at the Nashville hub?",
        a: "Yes. Licensed pool builders, service companies, and commercial aquatic facilities with a valid Tennessee Certificate of Resale or multi-state tax exemption certificate can purchase tax-free wholesale equipment.",
      },
      {
        q: "Do you deliver palletized commercial heaters and filter tanks with liftgates?",
        a: "Yes. All heavy freight shipments (such as 400,000 BTU heaters and large commercial filter tanks) can be scheduled with dedicated liftgate delivery directly to your shop or job site.",
      },
    ],
  },
  {
    slug: "dallas-tx",
    name: "Dallas South Central Regional Distribution Center",
    shortName: "Dallas Regional Depot",
    city: "Dallas",
    state: "TX",
    stateFull: "Texas",
    region: "South Central & Texas Freight Hub",
    address: "Dallas Logistics Corridor",
    zip: "75247",
    phone: "(802) 265-0320",
    email: "dallas@poolsupplywholesalers.com",
    lat: 32.7767,
    lng: -96.797,
    badge: "South Central Distribution Center",
    headline: "High-Volume Commercial Pool Equipment Depot for Texas and the Southwest",
    description:
      "Strategically situated in the North Texas logistics hub, our Dallas regional facility serves pool builders, commercial aquatic centers, and service professionals across Texas and the Southwest. Specializing in rapid freeze-protection gas heater shipments and peak-season commercial pump inventory.",
    coverageStates: ["Texas", "Oklahoma", "Louisiana", "Arkansas", "New Mexico", "Kansas"],
    transitTimes:
      "Same-day dispatch before 2:00 PM CST. 1-day delivery to DFW Metroplex, Austin, Houston, San Antonio, and Oklahoma City. 2-day regional delivery to New Mexico, Arkansas, and Louisiana.",
    willCallHours: "Monday – Friday: 7:30 AM – 5:00 PM CST",
    willCallNote:
      "Express loading dock pickup for trade contractors with prepaid wholesale orders. Flatbed and trailer loading assistance provided.",
    specializedEquipment: [
      {
        title: "Commercial Gas Heaters & ASME Heat Exchangers",
        desc: "Raypak 406A, MasterTemp 400HD, and high-wind outdoor commercial gas heater units engineered for extreme temperature swings.",
        link: "/shop/heaters",
      },
      {
        title: "Variable Speed Commercial Circulation Pumps",
        desc: "Pentair IntelliFlo3 VSF, Hayward TriStar VS, and high-head commercial pump stock.",
        link: "/shop/pumps",
      },
      {
        title: "Commercial Salt Chlorine Generators",
        desc: "High-capacity saltwater cells and controllers designed for intense Southwest UV and high bather loads.",
        link: "/shop/salt-systems",
      },
      {
        title: "Heavy-Duty Replacement Impellers & Motors",
        desc: "Total dynamic head (TDH) optimized commercial replacement motors and mechanical seal kits.",
        link: "/shop/motors",
      },
    ],
    regionalRegulations: {
      title: "Texas Commercial Aquatic Standards",
      desc: "All commercial pool pumps and filtration systems comply with Texas Administrative Code Title 25 (TAC §265) public swimming pool requirements and DOE pump efficiency standards.",
    },
    metaTitle: "Wholesale Pool Supplies Dallas TX — South Central Regional Hub | PSW",
    metaDescription:
      "Commercial pool equipment distributor in Dallas, TX. Fast 1-day shipping across Texas for Pentair, Hayward, Jandy, and Raypak pumps, heaters, and filtration.",
    faq: [
      {
        q: "How fast is delivery to Houston, Austin, and San Antonio from Dallas?",
        a: "Orders placed before 2:00 PM CST ship same day and consistently arrive next business day via regional freight to Houston, Austin, San Antonio, and Fort Worth.",
      },
      {
        q: "Does the Dallas hub maintain inventory for winter freeze protection emergencies?",
        a: "Yes. Our Dallas facility maintains emergency inventory of replacement commercial pump wet ends, motor assemblies, and freeze-resistant gas heater manifolds ready for expedited winter dispatch.",
      },
      {
        q: "Can contractors use a Texas Sales and Use Tax Resale Certificate?",
        a: "Yes. Texas pool builders and service companies submitting a signed Texas Form 01-339 (Sales and Use Tax Resale Certificate) are set up for tax-exempt wholesale trade accounts immediately.",
      },
    ],
  },
  {
    slug: "orlando-fl",
    name: "Orlando Southeast Regional Distribution Depot",
    shortName: "Orlando Regional Depot",
    city: "Orlando",
    state: "FL",
    stateFull: "Florida",
    region: "Florida & Coastal Southeast Depot",
    address: "Central Florida Freight Park",
    zip: "32809",
    phone: "(802) 265-0320",
    email: "orlando@poolsupplywholesalers.com",
    lat: 28.5383,
    lng: -81.3792,
    badge: "Southeast Coastal Depot",
    headline: "Year-Round Commercial Pool Supplies & Heat Pump Hub for Florida and the Gulf Coast",
    description:
      "Engineered to meet Florida's intense year-round commercial pool, resort, and community aquatic demands, our Orlando distribution center maintains massive inventory reserves of titanium heat pumps, commercial salt chlorinators, and DOE-compliant variable-speed circulation pumps with 24-hour turnaround across Florida.",
    coverageStates: ["Florida", "Georgia", "Alabama", "South Carolina", "Mississippi"],
    transitTimes:
      "Same-day dispatch before 2:00 PM EST. 1-day delivery to Orlando, Tampa, Jacksonville, Miami, Fort Lauderdale, and West Palm Beach. 2-day delivery across the Georgia and Alabama Gulf Coast.",
    willCallHours: "Monday – Friday: 7:30 AM – 5:00 PM EST",
    willCallNote:
      "Contractor loading bay with drive-up access for rapid equipment transfer and pallet loading.",
    specializedEquipment: [
      {
        title: "Commercial Swimming Pool Heat Pumps",
        desc: "Titanium heat exchanger commercial heat pumps from Hayward HeatPro and Pentair UltraTemp designed for coastal salt environments.",
        link: "/shop/heaters",
      },
      {
        title: "High-Capacity Salt Chlorination Systems",
        desc: "Pentair IntelliChlor IC60, Hayward AquaRite 900, and commercial electrolytic cells for resort pools.",
        link: "/shop/salt-systems",
      },
      {
        title: "Corrosion-Resistant Valves & Manifolds",
        desc: "Jandy NeverLube valves, CPVC commercial manifolds, and UV-resistant plumbing components.",
        link: "/shop/plumbing",
      },
      {
        title: "Commercial LED Lighting Systems",
        desc: "Pentair MicroBrite, IntelliBrite, and Hayward ColorLogic 12V underwater commercial lighting.",
        link: "/shop/lights",
      },
    ],
    regionalRegulations: {
      title: "Florida Building Code & Commercial Health Standards",
      desc: "Products meet Florida Building Code (Chapter 454 Swimming Pools and Bathing Facilities) and Florida Department of Health Rule 64E-9 standards for commercial public pools.",
    },
    metaTitle: "Wholesale Pool Supplies Orlando FL — Southeast Regional Hub | PSW",
    metaDescription:
      "Wholesale pool equipment distributor in Orlando, FL. 1-day delivery across Florida for commercial heat pumps, salt chlorinators, pumps, and filters.",
    faq: [
      {
        q: "What is transit time to South Florida (Miami, Fort Lauderdale, Palm Beach)?",
        a: "Orders placed by 2:00 PM EST ship same day from Orlando and arrive next business day via ground freight across Miami-Dade, Broward, and Palm Beach counties.",
      },
      {
        q: "Do you stock titanium heat pumps year-round in Orlando?",
        a: "Yes. Due to continuous year-round swimming in Florida, our Orlando depot maintains an active staging supply of Hayward HeatPro and Pentair UltraTemp commercial heat pumps in all BTU configurations.",
      },
      {
        q: "Can Florida contractors submit a Florida Annual Resale Certificate (DR-13)?",
        a: "Yes. Submitting your current Florida DR-13 certificate grants immediate tax-exempt status on all wholesale orders billed and delivered within Florida.",
      },
    ],
  },
  {
    slug: "los-angeles-ca",
    name: "Los Angeles West Coast Distribution Hub",
    shortName: "Los Angeles Regional Hub",
    city: "Los Angeles",
    state: "CA",
    stateFull: "California",
    region: "West Coast & Pacific Regional Depot",
    address: "Inland Empire Logistics Center",
    zip: "90058",
    phone: "(802) 265-0320",
    email: "la@poolsupplywholesalers.com",
    lat: 34.0522,
    lng: -118.2437,
    badge: "West Coast Logistics Hub",
    headline: "Title 20 Compliant Wholesale Pool Equipment Distribution for California and the West",
    description:
      "Our West Coast distribution center specializes in California Title 20 and Title 24 energy-efficient commercial equipment, compliant Low-NOx gas heating units, and ultra-high efficiency variable-speed pumping systems, servicing municipal, hotel, HOA, and residential contractors across California and neighboring states.",
    coverageStates: ["California", "Nevada", "Arizona", "Utah", "Oregon", "Washington"],
    transitTimes:
      "Same-day dispatch before 2:00 PM PST. 1-day delivery throughout Southern California, Central Valley, and Las Vegas. 2-day delivery to Phoenix, San Francisco Bay Area, Salt Lake City, and Seattle.",
    willCallHours: "Monday – Friday: 7:00 AM – 4:30 PM PST",
    willCallNote:
      "Commercial contractor loading dock with high-capacity forklift staging for palletized orders.",
    specializedEquipment: [
      {
        title: "California Title 20 / CEC Compliant VS Pumps",
        desc: "Certified variable speed pool pumps meeting California Appliance Efficiency Regulations (Title 20) and Title 24 guidelines.",
        link: "/shop/pumps",
      },
      {
        title: "Ultra Low-NOx Commercial Gas Heaters",
        desc: "SCAQMD Rule 1146.2 certified Low-NOx pool heaters from Raypak and Pentair approved for Southern California air districts.",
        link: "/shop/heaters",
      },
      {
        title: "Quad Cartridge & Water-Saving Filters",
        desc: "High-capacity cartridge filter tanks that eliminate backwashing waste, compliant with municipal water conservation rules.",
        link: "/shop/filters",
      },
      {
        title: "Smart Commercial Automation & Energy Monitors",
        desc: "Intelligent control systems with scheduled off-peak electrical utility pump programming.",
        link: "/shop/automation",
      },
    ],
    regionalRegulations: {
      title: "California CEC Title 20 & SCAQMD Low-NOx Codes",
      desc: "All gas heaters stocked in our Los Angeles hub are certified Low-NOx compliant with South Coast Air Quality Management District (SCAQMD) and San Joaquin Valley air standards. All pumps are CEC Title 20 certified.",
    },
    metaTitle: "Wholesale Pool Supplies Los Angeles CA — West Coast Hub | PSW",
    metaDescription:
      "Wholesale pool equipment distributor in Los Angeles, CA. Title 20 variable speed pumps, Low-NOx heaters, and filters with 1-day shipping across California.",
    faq: [
      {
        q: "Are all gas heaters stocked at the Los Angeles depot compliant with California Low-NOx laws?",
        a: "Yes. Every gas pool heater stocked at our Los Angeles depot is certified Ultra Low-NOx and fully compliant with SCAQMD Rule 1146.2 and California Air Resources Board (CARB) regulations.",
      },
      {
        q: "What is the freight transit time to Southern California job sites?",
        a: "Orders placed before 2:00 PM PST arrive next business day across Los Angeles, Orange County, San Diego, the Inland Empire, and Ventura County.",
      },
      {
        q: "Can California pool contractors provide a CDTFA Resale Certificate?",
        a: "Yes. Submit your California Department of Tax and Fee Administration (CDTFA-230) resale certificate to activate tax-exempt wholesale pricing for resale to your clients.",
      },
    ],
  },
];

export function getHubBySlug(slug: string): DistributionHub | undefined {
  return DISTRIBUTION_HUBS.find((h) => h.slug === slug);
}
