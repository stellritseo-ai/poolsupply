import pump from "@/assets/cat-pump.jpg";
import heater from "@/assets/cat-heater.jpg";
import light from "@/assets/cat-light.jpg";
import filter from "@/assets/cat-filter.jpg";
import cleaner from "@/assets/cat-cleaner.jpg";
import automation from "@/assets/cat-automation.jpg";
import { Product } from "./products";

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
    rating: 4.6,
    img: cleaner,
    sku: "JAN-RC-CX3",
    category: "Pool Cleaners",
    stock: 15,
    description: "Keep your pool floor, walls, and waterline immaculate with the Jandy CX-3 Robotic Pool Cleaner. It utilizes Cyclonic Vacuum Technology for continuous suction power, and its easy-clean debris canister ensures maintenance is a breeze. Suitable for all pool surfaces.",
    specs: {
      "Cleaning Cycle": "2.5 Hours",
      "Filter Capacity": "Large Debris Canister",
      "Cable Length": "60 Feet",
      "Pool Types": "In-Ground, All Surfaces",
      "Drive Type": "4-Wheel Drive",
      "Warranty": "2 Years Limited Warranty"
    },
    reviews: [
      {
        id: "r6",
        author: "Julia S.",
        rating: 5,
        date: "2026-05-30",
        title: "Never brushing again",
        content: "This little robot climbs the walls like Spiderman! It picks up everything from fine sand to huge oak leaves. Saved me hours of manual labor."
      },
      {
        id: "r7",
        author: "Mark G.",
        rating: 4,
        date: "2026-05-18",
        title: "Good suction, tangled cord",
        content: "Cleans perfectly but the cord gets twisted occasionally if you leave it in for multiple days without untangling."
      }
    ]
  },
  {
    id: "p-superpump",
    name: "Super Pump Single Speed",
    brand: "Hayward",
    price: 599,
    msrp: 699,
    rating: 4.8,
    img: pump,
    sku: "HAY-SP-2600",
    category: "Pool Pumps",
    stock: 24,
    description: "The Hayward Super Pump is the industry's workhorse. Reliable, efficient, and built to last, it features a heavy-duty motor with airflow ventilation for quieter, cooler operation. The exclusive swing-away hand knobs make strainer cover removal easy for quick basket cleaning.",
    specs: {
      "Horsepower": "1.5 HP",
      "Voltage": "115/230V",
      "Flow Rate": "Up to 80 GPM",
      "Port Size": "1.5\" NPT",
      "Speed": "Single Speed (3450 RPM)",
      "Warranty": "1 Year Manufacturer Warranty"
    },
    reviews: [
      {
        id: "r8",
        author: "Tom H., Property Manager",
        rating: 5,
        date: "2026-04-10",
        title: "Old reliable",
        content: "We use these on all our community pools. They run 24/7 without complaining and replacement parts are cheap and easy to find."
      }
    ]
  },
  {
    id: "p-cleanandclear",
    name: "Clean & Clear Plus Cartridge Filter",
    brand: "Pentair",
    price: 949,
    msrp: 1199,
    rating: 4.9,
    img: filter,
    sku: "PEN-CC-420",
    category: "Pool Filters",
    stock: 9,
    description: "The Clean & Clear Plus filter features four cartridges to provide maximum filter surface area for superior water clarity. Its fiberglass-reinforced tank is chemical resistant, and the coreless cartridges are incredibly easy to clean without the need for backwashing.",
    specs: {
      "Filter Area": "420 Sq. Ft.",
      "Flow Rate": "Up to 150 GPM",
      "Turnover (8 hr)": "72,000 Gallons",
      "Tank Material": "Fiberglass Reinforced Polypropylene",
      "Max Pressure": "50 PSI",
      "Warranty": "2 Years Limited Warranty"
    },
    reviews: [
      {
        id: "r9",
        author: "Brian C.",
        rating: 5,
        date: "2026-05-05",
        title: "Crystal clear water",
        content: "Huge upgrade from our old sand filter. The water sparkles now and cleaning the four cartridges every 6 months is much better than constantly backwashing."
      },
      {
        id: "r10",
        author: "Amanda V.",
        rating: 5,
        date: "2026-03-22",
        title: "Easy to maintain",
        content: "The clamp band is easy to remove. The cartridges are a bit heavy when soaked, but spraying them down is a simple weekend chore."
      }
    ]
  },
  {
    id: "p-mastertemp",
    name: "MasterTemp 250K Gas Heater",
    brand: "Pentair",
    price: 1899,
    msrp: 2299,
    rating: 4.7,
    img: heater,
    sku: "PEN-MT-250",
    category: "Pool Heaters",
    stock: 12,
    description: "High performance, compact design. The MasterTemp heater offers fast heat up so you can swim sooner, and an eco-friendly design that's certified for low NOx emissions. Its rust-proof tough composite exterior handles weather conditions year after year.",
    specs: {
      "Capacity (BTU)": "250,000 BTU",
      "Fuel Type": "Natural Gas",
      "Ignition": "Hot Surface Ignition",
      "Emissions": "Low NOx Certified",
      "Dimensions": "21\"W x 21\"D x 28\"H",
      "Warranty": "2 Years Limited Warranty"
    },
    reviews: [
      {
        id: "r11",
        author: "Gary L.",
        rating: 4,
        date: "2026-02-15",
        title: "Compact and powerful",
        content: "Fits perfectly on my equipment pad where space is tight. Heats our 15,000 gallon pool about a degree an hour."
      }
    ]
  },
  {
    id: "p-intellicenter",
    name: "IntelliCenter Control System",
    brand: "Pentair",
    price: 2199,
    msrp: 2599,
    rating: 4.8,
    img: automation,
    sku: "PEN-IC-8PS",
    category: "Automation Systems",
    stock: 5,
    description: "The ultimate pool and spa automation system. The IntelliCenter makes it easier than ever to control your pool features from anywhere using the mobile app or the vibrant color touchscreen interface on the control panel. Over-the-air updates ensure your system is always current.",
    specs: {
      "Control Type": "Color Touchscreen & Mobile App",
      "Relays": "8 Relays (Pool & Spa)",
      "Connectivity": "Built-in Wi-Fi & Ethernet",
      "Compatibility": "IntelliFlo, IntelliChlor, ColorSync",
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
