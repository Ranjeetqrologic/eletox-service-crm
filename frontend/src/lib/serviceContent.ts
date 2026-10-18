// Default (fallback) content for service detail pages; admin-saved content in DB overrides this.
export type ServicePackage = { name: string; price: string; gst?: string; desc?: string; img?: string };
export type FAQ = { q: string; a: string };
export type Content = {
  image: string;
  intro: string;
  includes: string[];
  problems: string[];
  brands?: string;
  faqs: { q: string; a: string }[];
};

export const CONTENT: Record<string, Content> = {
  "ac-repair-service": {
    image: `/eletox-assets/service-ac-repair-service.jpg`,
    intro:
      "Eletox provides complete air conditioner repair and servicing in Jaipur for split, window and cassette ACs of every brand. Our certified technicians reach your doorstep, diagnose the fault with proper tools, and fix it the first time using genuine spare parts — so your home or office stays cool through the Rajasthan summer.",
    includes: [
      "Complete AC inspection and fault diagnosis",
      "Filter, coil and drain-tray deep cleaning (jet / foam wash)",
      "Gas pressure check, leak detection and gas top-up / full charge",
      "Compressor, PCB, capacitor, fan motor and thermostat repair",
      "Split / window AC installation, uninstallation and relocation",
      "Annual Maintenance Contract (AMC) for homes, shops and offices",
    ],
    problems: [
      "AC not cooling or cooling very slowly",
      "Water leaking from indoor unit",
      "Unusual noise, vibration or bad smell",
      "AC turns off automatically / tripping",
      "Remote or display not working",
      "Ice formation on pipes or coil",
    ],
    brands: "Daikin, Voltas, LG, Samsung, Blue Star, Hitachi, Carrier, Lloyd, Whirlpool, O General, Panasonic and more.",
    faqs: [
      { q: "How often should I service my AC?", a: "We recommend a full service twice a year — before summer and after monsoon — to maintain cooling and lower electricity bills." },
      { q: "Do you provide gas refilling at home?", a: "Yes. We check for leaks first, repair them, and then refill gas (R22 / R32 / R410A) at your location with proper pressure testing." },
      { q: "Is there any warranty on the repair?", a: "Yes, every repair and replaced spare part comes with a service warranty. Details are shared on the bill." },
    ],
  },
  "ac-pipe-line": {
    image: `/eletox-assets/service-ac-pipe-line.jpg`,
    intro:
      "Proper copper pipe line work is the foundation of an efficient, leak-free air conditioner. Eletox installs and repairs AC copper piping, drain lines and electrical wiring with insulation sleeves and neat concealed or open routing for homes, flats, offices and showrooms across Jaipur.",
    includes: [
      "Copper pipe line (¼\", ⅜\", ½\", ⅝\") supply and fitting",
      "Insulation sleeves, PVC casing and clamps for a clean finish",
      "Drain pipe and condensate line fitting with proper slope",
      "Brazing / welding of joints and nitrogen pressure testing",
      "Wiring between indoor and outdoor units",
      "Pipe line for new construction, renovation and multi-unit projects",
    ],
    problems: [
      "Gas leakage from old or damaged pipe joints",
      "Water dripping due to blocked / wrong-slope drain pipe",
      "Ugly exposed piping — need concealed line",
      "Extra length required when relocating the outdoor unit",
      "Pipe insulation torn, causing sweating and energy loss",
    ],
    faqs: [
      { q: "Do you do concealed pipe line for under-construction homes?", a: "Yes. We plan and lay concealed copper and drain lines at the construction stage so the AC installation later is neat and quick." },
      { q: "Is the copper pipe genuine?", a: "We use branded, refrigeration-grade copper with proper insulation and give a fitting warranty." },
    ],
  },
  "washing-machine-repair": {
    image: `/eletox-assets/service-washing-machine-repair.jpg`,
    intro:
      "From a machine that won't spin to one that leaks or won't drain, Eletox repairs all top-load, front-load and semi-automatic washing machines at your home in Jaipur. We carry commonly needed spare parts so most repairs are completed in a single visit.",
    includes: [
      "Complete fault diagnosis and repair at home",
      "Motor, drum, belt, bearing and gearbox repair",
      "PCB / control board, timer and sensor replacement",
      "Inlet valve, drain pump and door-lock repair",
      "Drum and tub deep cleaning and descaling",
      "Installation, demo and relocation of washing machines",
    ],
    problems: [
      "Machine not starting or stopping mid-cycle",
      "Not spinning, draining or filling water",
      "Water leakage from bottom or door",
      "Loud noise or heavy vibration while spinning",
      "Error codes on display",
      "Clothes not cleaning properly / bad smell",
    ],
    brands: "LG, Samsung, IFB, Whirlpool, Bosch, Haier, Godrej, Panasonic, Voltas Beko and more.",
    faqs: [
      { q: "Do you repair front-load machines?", a: "Yes, our technicians are trained for top-load, front-load, semi-automatic and fully automatic machines of all brands." },
      { q: "Will the technician bring spare parts?", a: "Common parts are carried along. If a specific part is needed, we source a genuine one and complete the repair quickly." },
    ],
  },
  "microwave-repair": {
    image: `/eletox-assets/service-microwave-repair.jpg`,
    intro:
      "Eletox offers fast doorstep repair for solo, grill and convection microwave ovens. Whether your microwave isn't heating, is sparking, or its touch panel has stopped responding, our technicians fix it safely with genuine parts and test it thoroughly before handing it back.",
    includes: [
      "Magnetron, high-voltage diode and capacitor replacement",
      "Touch panel / keypad and display repair",
      "Turntable motor, door switch and hinge repair",
      "Heating element and fan repair for grill / convection models",
      "Interior cleaning and safety (radiation leakage) check",
    ],
    problems: [
      "Microwave not heating food",
      "Sparking or burning smell inside",
      "Buttons / touch panel not working",
      "Turntable not rotating",
      "Door not closing or machine not starting",
      "Excessive noise while running",
    ],
    brands: "LG, Samsung, IFB, Whirlpool, Bajaj, Morphy Richards, Panasonic, Godrej and more.",
    faqs: [
      { q: "Is it safe to repair a microwave at home?", a: "Yes. Our technicians follow proper discharge and safety procedures and check for radiation leakage after every repair." },
      { q: "Is repair cheaper than buying a new microwave?", a: "In most cases yes — common faults like magnetron, diode or touch panel are far cheaper to repair than replacement." },
    ],
  },
  "geyser-repair-service": {
    image: `/eletox-assets/service-geyser-repair-service.jpg`,
    intro:
      "Hot water problems in winter? Eletox repairs and services storage, instant and gas geysers of all brands at your home in Jaipur — from heating element and thermostat replacement to descaling and safe installation.",
    includes: [
      "Heating element and thermostat replacement",
      "Tank descaling and cleaning for hard-water areas",
      "Safety valve, pressure valve and inlet/outlet repair",
      "Electrical wiring, MCB and earthing check",
      "Geyser installation, uninstallation and relocation",
      "Gas geyser burner and ignition repair",
    ],
    problems: [
      "Water not heating or heating slowly",
      "Water leaking from tank or pipes",
      "Geyser tripping MCB / electric shock",
      "Indicator light not turning on",
      "Low hot water pressure",
      "Noise or smell from geyser",
    ],
    brands: "Bajaj, Racold, AO Smith, Havells, Crompton, V-Guard, Venus, Usha and more.",
    faqs: [
      { q: "Why is my geyser giving less hot water than before?", a: "Usually scale build-up on the element or inside the tank. Our descaling service restores heating and extends geyser life." },
      { q: "Do you install new geysers?", a: "Yes — including wall drilling, pipe connections, electrical point and safety testing." },
    ],
  },
  "water-purifier-repair": {
    image: `/eletox-assets/service-water-purifier-repair.jpg`,
    intro:
      "Clean drinking water needs a healthy purifier. Eletox services and repairs RO, UV and UF water purifiers at home — filter and membrane replacement, TDS adjustment, leakage repair and complete sanitisation — for all major brands in Jaipur.",
    includes: [
      "Sediment, carbon and RO membrane filter replacement",
      "UV lamp, SMPS / adaptor and pump repair",
      "TDS check and adjustment for healthy mineral level",
      "Leakage, low-flow and auto-cut (float) repair",
      "Complete tank cleaning and sanitisation",
      "New purifier installation and AMC plans",
    ],
    problems: [
      "Slow or no water flow",
      "Bad taste or smell in water",
      "Water leaking from unit",
      "Purifier not switching on / UV not glowing",
      "Continuous waste-water drain",
      "Filter change indicator blinking",
    ],
    brands: "Kent, Aquaguard (Eureka Forbes), Livpure, Pureit, Blue Star, AO Smith, Havells, Tata Swach and more.",
    faqs: [
      { q: "How often should RO filters be changed?", a: "Pre-filters every 6–12 months and the RO membrane every 2–3 years depending on your water quality. We check TDS and advise accordingly." },
      { q: "Do you use original filters?", a: "Yes, we use genuine / compatible high-quality filters and membranes with warranty." },
    ],
  },
  "water-dispenser-repair": {
    image: `/eletox-assets/service-water-dispenser-repair.jpg`,
    intro:
      "Eletox repairs hot & cold water dispensers for homes, offices, clinics and shops. Our technicians fix cooling, heating, leakage and electrical faults on bottle-top and bottom-load dispensers of all brands, right at your location.",
    includes: [
      "Compressor and cooling system repair, gas charging",
      "Heating tank / element and thermostat replacement",
      "Tap, float valve and leakage repair",
      "Electrical, wiring and indicator repair",
      "Internal tank cleaning and sanitisation",
      "Installation and AMC for offices",
    ],
    problems: [
      "Water not cold or not hot",
      "Water leaking from dispenser",
      "Dispenser not switching on",
      "Tap dripping or stuck",
      "Bad taste or smell in water",
    ],
    brands: "Voltas, Blue Star, Usha, Atlantis, Kent, Bajaj and more.",
    faqs: [
      { q: "Do you service dispensers at offices?", a: "Yes. We offer on-site repair and annual maintenance contracts for offices, schools and clinics." },
    ],
  },
  "water-cooler-repair": {
    image: `/eletox-assets/service-water-cooler-repair.jpg`,
    intro:
      "For schools, offices, hospitals, temples and factories, Eletox provides repair and maintenance of commercial and domestic water coolers — cooling problems, gas charging, compressor repair and tank leakage — with quick turnaround across Jaipur.",
    includes: [
      "Compressor, condenser and fan motor repair",
      "Gas leak detection and gas charging",
      "Thermostat, relay and capacitor replacement",
      "Tank leakage, tap and float valve repair",
      "Descaling, tank cleaning and sanitisation",
      "Installation, relocation and AMC",
    ],
    problems: [
      "Water not cooling or cooling slowly",
      "Compressor not starting / tripping",
      "Water leaking from tank or pipes",
      "Excess noise or vibration",
      "Electric shock or wiring issue",
    ],
    brands: "Voltas, Blue Star, Usha, Sidwal, Kelvinator and local brands.",
    faqs: [
      { q: "Do you handle large-capacity coolers?", a: "Yes, from 20 L domestic coolers to 150 L+ commercial units for institutions and factories." },
    ],
  },
  electrician: {
    image: `/eletox-assets/service-electrician.jpg`,
    intro:
      "Need a reliable electrician in Jaipur? Eletox's certified electricians handle everything from a single switch or fan repair to complete house wiring, MCB / DB panel work and appliance points — safely, neatly and at transparent rates.",
    includes: [
      "Switch, socket, fan, light and fixture installation & repair",
      "MCB, RCCB, distribution board and earthing work",
      "Short-circuit, tripping and fault finding",
      "Complete / partial house and shop wiring",
      "AC, geyser and appliance power points",
      "Inverter, stabiliser and meter connection work",
    ],
    problems: [
      "Frequent MCB tripping or fuse blowing",
      "Sparking switches / burning smell",
      "Fan or light not working",
      "Low voltage or fluctuation in some rooms",
      "Electric shock from appliances",
      "New point or wiring needed for renovation",
    ],
    faqs: [
      { q: "Are your electricians certified?", a: "Yes. All Eletox electricians are trained, ID-verified and follow safety standards for residential and commercial work." },
      { q: "Do you provide emergency service?", a: "Yes — call us for urgent faults like sparking, tripping or power failure; we provide same-day and emergency visits." },
    ],
  },
};

export const GENERIC: Content = {
  image: `/eletox-assets/choose-bg.jpg`,
  intro:
    "Eletox provides professional doorstep repair and maintenance in Jaipur with certified technicians, genuine spare parts and transparent pricing. Book online or call us and get your appliance working like new.",
  includes: [
    "Complete inspection and fault diagnosis",
    "Repair with genuine spare parts",
    "Cleaning, servicing and safety check",
    "Installation, uninstallation and relocation",
    "Annual Maintenance Contract (AMC)",
  ],
  problems: [
    "Appliance not working or working slowly",
    "Unusual noise, smell or leakage",
    "Electrical / tripping issues",
    "Regular servicing and maintenance",
  ],
  faqs: [
    { q: "How soon can a technician come?", a: "Same-day visits are available across Jaipur. Book before noon and we usually reach the same day." },
    { q: "Is there a warranty on repairs?", a: "Yes, every repair and replaced part comes with a service warranty mentioned on your bill." },
  ],
};

