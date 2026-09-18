export interface GuideContent {
  slug: string;
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  date: string;
  dateModified: string;
  author: string;
  category: string;
  image: string;
  content: { type: "h2" | "h3" | "p" | "list"; text?: string; items?: string[] }[];
}

export const BUYING_GUIDES: GuideContent[] = [
  {
    slug: "pool-pump-buying-guide",
    title: "How to Choose the Right Pool Pump",
    description:
      "A complete guide to sizing and selecting the right variable speed or single speed pool pump for your commercial or residential pool.",
    metaTitle: "Pool Pump Buying Guide: Sizing & Variable Speed vs Single Speed",
    metaDescription:
      "Learn how to choose the right pool pump. Our comprehensive guide covers variable speed vs single speed, turnover rates, and sizing for residential and commercial pools.",
    keywords: [
      "pool pump buying guide",
      "variable speed pool pump",
      "how to size a pool pump",
      "single speed pool pump",
      "commercial pool pump sizing",
    ],
    date: "2026-09-01",
    dateModified: "2026-09-15",
    author: "Pool Supply Wholesalers Expert Team",
    category: "Pumps",
    image: "https://poolsupplywholesalers.com/about-hero.png",
    content: [
      {
        type: "p",
        text: "The pool pump is the heart of your swimming pool's circulation system. Choosing the right one is critical for maintaining clean water and minimizing energy costs. With recent changes to Department of Energy (DOE) regulations, navigating your options is more important than ever.",
      },
      { type: "h2", text: "Variable Speed vs. Single Speed Pumps" },
      {
        type: "p",
        text: "Single speed pumps run at a constant, high speed (usually 3,450 RPM). They are inexpensive to purchase but expensive to operate because they consume the maximum amount of energy whenever they are on. Variable speed pumps (VSPs) allow you to adjust the motor speed. Running a pump at lower speeds drastically reduces energy consumption—often saving up to 80% on electricity bills.",
      },
      {
        type: "p",
        text: "In 2021, the DOE mandated that most new pool pumps for filtration must be variable speed to meet strict minimum efficiency standards. If you are replacing a primary filtration pump for a residential pool, a VSP is almost certainly required by law.",
      },
      { type: "h2", text: "How to Size Your Pool Pump" },
      {
        type: "p",
        text: "Proper sizing depends on your pool's volume and the required 'turnover rate' (the time it takes to circulate all the water in the pool). A common goal is to turn over the water in 6 to 8 hours.",
      },
      {
        type: "list",
        items: [
          "Calculate Pool Volume: Length x Width x Average Depth x 7.5 (for rectangular pools) = Gallons.",
          "Determine Required GPM (Gallons Per Minute): Divide total gallons by the desired turnover time (in hours), then divide by 60.",
          "Check Flow Rate: Select a pump that can provide that GPM at your system's 'Feet of Head' (resistance from pipes, filter, and heater).",
        ],
      },
      { type: "h2", text: "Commercial vs. Residential" },
      {
        type: "p",
        text: "Commercial pumps are built with heavy-duty components designed for 24/7 operation and often feature three-phase motors. Ensure you select a commercial-grade pump if you manage a public or semi-public facility, as residential pumps will quickly burn out under commercial loads.",
      },
    ],
  },
  {
    slug: "pool-heater-buying-guide",
    title: "Pool Heater Sizing & Buying Guide",
    description:
      "Determine the exact BTU requirements for your pool and compare gas heaters, propane heaters, and electric heat pumps.",
    metaTitle: "Pool Heater Buying Guide & BTU Sizing Calculator",
    metaDescription:
      "Not sure what size pool heater you need? Read our complete buying guide comparing natural gas, propane, and electric heat pumps, complete with a BTU sizing formula.",
    keywords: [
      "pool heater buying guide",
      "pool heater sizing",
      "gas vs heat pump",
      "how many BTUs for pool heater",
    ],
    date: "2026-08-20",
    dateModified: "2026-09-10",
    author: "Pool Supply Wholesalers Expert Team",
    category: "Heaters",
    image: "https://poolsupplywholesalers.com/about-hero.png",
    content: [
      {
        type: "p",
        text: "A pool heater extends your swimming season and increases the overall enjoyment of your pool investment. However, choosing the wrong type or an undersized heater can lead to high energy bills and lukewarm water. This guide breaks down the three main types of heaters and how to size them.",
      },
      { type: "h2", text: "Types of Pool Heaters" },
      { type: "h3", text: "1. Natural Gas & Propane Heaters" },
      {
        type: "p",
        text: "Gas heaters use combustion to quickly heat the water. They are the fastest heating option and work regardless of the outside air temperature. This makes them ideal for quickly heating a spa or for pools in colder climates. Natural gas requires a dedicated gas line, while propane requires a storage tank.",
      },
      { type: "h3", text: "2. Electric Heat Pumps" },
      {
        type: "p",
        text: "Heat pumps don't generate heat directly; instead, they capture ambient heat from the air and transfer it to the water. They are incredibly energy-efficient (costing much less to operate than gas heaters) but are slower to heat the water and lose efficiency when air temperatures drop below 50°F.",
      },
      { type: "h2", text: "How to Size a Pool Heater (BTUs)" },
      {
        type: "p",
        text: "Pool heaters are rated in BTUs (British Thermal Units). While the exact requirement depends on factors like wind exposure and whether you use a solar cover, a standard rule of thumb for gas heaters is:",
      },
      {
        type: "list",
        items: [
          "100,000 BTUs for every 10,000 gallons of water.",
          "Example: A 20,000-gallon pool should ideally use a 200,000 to 250,000 BTU heater.",
          "If you want to heat a connected spa quickly (e.g., in 30 minutes), you will likely need a 400,000 BTU heater regardless of pool size.",
        ],
      },
    ],
  },
  {
    slug: "pool-filter-buying-guide",
    title: "Understanding Pool Filters: Cartridge, Sand, or D.E.",
    description:
      "Compare the pros, cons, and maintenance requirements of Cartridge, Sand, and D.E. pool filters.",
    metaTitle: "Pool Filter Buying Guide: Cartridge vs Sand vs DE",
    metaDescription:
      "Which pool filter is best for your commercial or residential pool? Compare Cartridge, Sand, and D.E. filters based on micron filtration, maintenance, and cost.",
    keywords: [
      "pool filter buying guide",
      "cartridge vs sand filter",
      "DE pool filter",
      "best commercial pool filter",
      "micron rating pool filter",
    ],
    date: "2026-08-15",
    dateModified: "2026-09-05",
    author: "Pool Supply Wholesalers Expert Team",
    category: "Filters",
    image: "https://poolsupplywholesalers.com/about-hero.png",
    content: [
      {
        type: "p",
        text: "Your pump circulates the water, but the filter is what actually keeps it clean. There are three main types of pool filters: Sand, Cartridge, and D.E. (Diatomaceous Earth). The right choice depends on your local water restrictions, maintenance preferences, and how clean you want your water to be.",
      },
      { type: "h2", text: "Filtration Quality (Micron Rating)" },
      {
        type: "p",
        text: "Filter performance is measured by the smallest particle size it can capture, measured in microns (a grain of salt is about 100 microns). A lower micron rating means finer filtration.",
      },
      {
        type: "list",
        items: [
          "Sand Filters: 20 to 40 microns.",
          "Cartridge Filters: 10 to 20 microns.",
          "D.E. Filters: 2 to 5 microns (the clearest water).",
        ],
      },
      { type: "h2", text: "Comparing the Three Types" },
      { type: "h3", text: "1. Sand Filters" },
      {
        type: "p",
        text: "Pros: Very easy to maintain, lowest initial cost, sand lasts 5-7 years. Cons: Least effective filtration, requires backwashing (which wastes water and chemicals).",
      },
      { type: "h3", text: "2. Cartridge Filters" },
      {
        type: "p",
        text: "Pros: Excellent filtration, no backwashing required (saves water), very low flow resistance (pairs perfectly with variable speed pumps). Cons: Cartridges must be manually removed and hosed off every 3-6 months, replacement cartridges can be expensive.",
      },
      { type: "h3", text: "3. D.E. (Diatomaceous Earth) Filters" },
      {
        type: "p",
        text: "Pros: Unmatched water clarity, traps the finest particles. Cons: Most expensive, requires backwashing, requires adding D.E. powder after every backwash, most labor-intensive to clean.",
      },
    ],
  },
  {
    slug: "pool-automation-buying-guide",
    title: "The Ultimate Guide to Pool Automation Systems",
    description:
      "Learn how smart pool controllers work and how they can save you time, energy, and money.",
    metaTitle: "Pool Automation Buying Guide: Smart Pool Controllers",
    metaDescription:
      "Upgrade to a smart pool. Read our automation buying guide covering Pentair IntelliCenter, Hayward OmniLogic, and Jandy AquaLink systems.",
    keywords: [
      "pool automation buying guide",
      "smart pool controller",
      "Pentair IntelliCenter",
      "Hayward OmniLogic",
      "Jandy AquaLink",
    ],
    date: "2026-07-30",
    dateModified: "2026-08-10",
    author: "Pool Supply Wholesalers Expert Team",
    category: "Automation",
    image: "https://poolsupplywholesalers.com/about-hero.png",
    content: [
      {
        type: "p",
        text: "Pool automation systems take the hassle out of pool maintenance by allowing you to control all your equipment from a central hub, a wireless remote, or your smartphone. Whether you're building a new pool or retrofitting an existing one, automation offers convenience and significant energy savings.",
      },
      { type: "h2", text: "What Does a Pool Automation System Control?" },
      {
        type: "list",
        items: [
          "Pumps: Schedule run times and adjust speeds on variable speed pumps.",
          "Heaters: Set exact temperatures for the pool and spa, and ensure the heater only runs when the pump is operating.",
          "Valves: Automatically turn valve actuators to switch water flow between the pool and the spa.",
          "Lighting: Change colors, set light shows, and schedule on/off times for LED pool lights.",
          "Sanitation: Monitor salt chlorine generators and adjust output percentages.",
          "Water Features: Turn on waterfalls, deck jets, or bubblers with the push of a button.",
        ],
      },
      { type: "h2", text: "Leading Automation Platforms" },
      {
        type: "p",
        text: "While you can mix and match equipment, it is highly recommended to stick with one brand for your core equipment (Pump, Heater, Automation) to ensure seamless communication. The leading systems are:",
      },
      {
        type: "list",
        items: [
          "Pentair IntelliCenter: The newest and most robust system from Pentair, offering over-the-air updates and exceptional integration with IntelliFlo pumps.",
          "Hayward OmniLogic: Known for its highly intuitive touchscreen interface and flexible expansion capabilities.",
          "Jandy AquaLink: A reliable, contractor-favorite system with excellent iAquaLink app control.",
        ],
      },
    ],
  },
  {
    slug: "salt-chlorine-generator-buying-guide",
    title: "Buying a Salt Water Pool System",
    description:
      "Everything you need to know about salt chlorine generators, sizing salt cells, and maintenance.",
    metaTitle: "Salt Chlorine Generator Buying Guide & Sizing",
    metaDescription:
      "Thinking about a salt water pool? Our buying guide explains how salt chlorine generators work, how to size a salt cell, and what maintenance is required.",
    keywords: [
      "salt chlorine generator buying guide",
      "salt water pool system",
      "how to size a salt cell",
      "Pentair IntelliChlor",
      "Hayward AquaRite",
    ],
    date: "2026-07-15",
    dateModified: "2026-08-01",
    author: "Pool Supply Wholesalers Expert Team",
    category: "Salt Systems",
    image: "https://poolsupplywholesalers.com/about-hero.png",
    content: [
      {
        type: "p",
        text: "Salt water pools are incredibly popular because they provide silky soft water, eliminate the strong chemical odor of traditional chlorine, and save you from constantly buying, transporting, and storing heavy buckets of liquid or tablet chlorine. But how do you choose the right one?",
      },
      { type: "h2", text: "How Salt Systems Work" },
      {
        type: "p",
        text: "A salt water pool is not a chlorine-free pool. Instead of adding chlorine manually, you add salt to the pool water. As this mildly salty water passes through the salt cell (installed on your equipment pad), an electrical charge causes a process called electrolysis, converting the salt into pure chlorine. Once the chlorine does its job sanitizing the pool, it reverts back into salt, and the cycle continues.",
      },
      { type: "h2", text: "How to Size a Salt Cell" },
      {
        type: "p",
        text: "The most common mistake pool owners make is undersizing their salt cell. Manufacturers rate cells based on the maximum pool size they can handle when running 24/7 at 100% output.",
      },
      {
        type: "list",
        items: [
          "The Rule of Thumb: Always buy a salt cell rated for at least 1.5 to 2 times the actual volume of your pool.",
          "Example: If you have a 15,000-gallon pool, you should purchase a salt system rated for a 30,000 or 40,000-gallon pool (like a Pentair IC40 or Hayward T-CELL-9).",
          "Why? Sizing up means the cell doesn't have to work as hard or run as long to generate the necessary chlorine. This significantly extends the lifespan of the cell and saves electricity.",
        ],
      },
      { type: "h2", text: "Maintenance" },
      {
        type: "p",
        text: "Salt cells require periodic cleaning to remove calcium scale buildup. This involves soaking the cell in a mild acid solution every 3-6 months. A well-maintained salt cell typically lasts 3 to 7 years before needing replacement.",
      },
    ],
  },
  {
    slug: "commercial-pool-equipment-guide",
    title: "Commercial Pool Equipment: Sizing and Standards",
    description:
      "A guide for facility managers on selecting NSF-certified pumps, filters, and heaters for commercial pools.",
    metaTitle: "Commercial Pool Equipment Buying Guide & NSF Standards",
    metaDescription:
      "Equipping a commercial pool facility? Learn about NSF certifications, heavy-duty pumps, and massive filtration systems required for public pools.",
    keywords: [
      "commercial pool equipment guide",
      "NSF certified pool equipment",
      "commercial pool pump",
      "commercial pool filter sizing",
    ],
    date: "2026-06-20",
    dateModified: "2026-07-05",
    author: "Pool Supply Wholesalers Expert Team",
    category: "Commercial",
    image: "https://poolsupplywholesalers.com/about-hero.png",
    content: [
      {
        type: "p",
        text: "Commercial pools—such as those at hotels, apartments, fitness centers, and municipal parks—endure dramatically higher bather loads and stricter health department regulations than residential pools. Residential equipment will fail rapidly under these conditions. This guide covers the basics of outfitting a commercial facility.",
      },
      { type: "h2", text: "The Importance of NSF Certification" },
      {
        type: "p",
        text: "The National Sanitation Foundation (NSF) sets the standards for public health and safety. Most local health departments require that all equipment installed on a public or semi-public pool be NSF-certified (typically NSF/ANSI Standard 50). Always verify the NSF rating before purchasing commercial equipment.",
      },
      { type: "h2", text: "Commercial Pumps" },
      {
        type: "p",
        text: "Commercial pumps are built with heavy-duty cast iron or reinforced thermoplastic housings, larger strainer baskets, and robust motors (often 3-phase). They must provide high flow rates to achieve the strict turnover times required by law (often 6 hours or less for pools, and 30 minutes for spas). Popular commercial lines include Pentair's EQ Series and Hayward's HCP series.",
      },
      { type: "h2", text: "Commercial Filtration" },
      {
        type: "p",
        text: "Because of high bather loads, commercial filters must have massive surface areas. High-rate sand filters are very common in commercial settings due to their durability and ease of backwashing via large multi-port valves. For indoor facilities where air quality is a concern, advanced commercial D.E. or multi-cartridge filters are often used to capture chloramines and organic matter more effectively.",
      },
    ],
  },
];

export function getGuideBySlug(slug: string): GuideContent | undefined {
  return BUYING_GUIDES.find((g) => g.slug === slug);
}
