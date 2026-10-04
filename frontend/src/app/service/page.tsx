"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon, PhoneIcon, CheckCircleIcon, ArrowRightIcon, ClockIcon,
  ShieldCheckIcon, CurrencyRupeeIcon, WrenchScrewdriverIcon, MapPinIcon, EnvelopeIcon,
} from "@heroicons/react/24/outline";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import Logo from "@/components/Logo";
import { packagesFor } from "@/lib/packages";
import SocialLinks from "@/components/SocialLinks";

const A = "/eletox-assets";
const DEFAULT_PHONE = "+91 9571071342";
const DEFAULT_EMAIL = "eletox07@gmail.com";
const DEFAULT_ADDRESS = "Tilak Vihar, Gokulpura, near Gs Swimming Pool, Jhotwara, Jaipur, Rajasthan 302012";
const phoneHref = `tel:${DEFAULT_PHONE.replace(/[^+\d]/g, "")}`;
const waHref = `https://wa.me/${DEFAULT_PHONE.replace(/[^\d]/g, "")}`;

type Content = {
  image: string;
  intro: string;
  includes: string[];
  problems: string[];
  brands?: string;
  faqs: { q: string; a: string }[];
};

const CONTENT: Record<string, Content> = {
  "ac-repair-service": {
    image: `${A}/service-ac-repair-service.jpg`,
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
    image: `${A}/service-ac-pipe-line.jpg`,
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
    image: `${A}/service-washing-machine-repair.jpg`,
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
    image: `${A}/service-microwave-repair.jpg`,
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
    image: `${A}/service-geyser-repair-service.jpg`,
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
    image: `${A}/service-water-purifier-repair.jpg`,
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
    image: `${A}/service-water-dispenser-repair.jpg`,
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
    image: `${A}/service-water-cooler-repair.jpg`,
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
    image: `${A}/service-electrician.jpg`,
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

const GENERIC: Content = {
  image: `${A}/choose-bg.jpg`,
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

const steps = [
  { n: "01", t: "Book", d: "Call, WhatsApp or fill the form — choose a convenient time." },
  { n: "02", t: "Inspect", d: "Technician visits, diagnoses the fault and shares a clear estimate." },
  { n: "03", t: "Repair", d: "Approved work is done with genuine parts, right at your place." },
  { n: "04", t: "Warranty", d: "You get a bill with service warranty and after-service support." },
];

const promises = [
  { icon: WrenchScrewdriverIcon, t: "Certified Technicians" },
  { icon: ClockIcon, t: "Same-Day Service" },
  { icon: CurrencyRupeeIcon, t: "Transparent Pricing" },
  { icon: ShieldCheckIcon, t: "Service Warranty" },
];

const VISIT_CHARGE = 349;

const priceParts = (price: string) => {
  const m = price.match(/^(\d+)(.*)$/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  const mrp = Math.round((n * 1.3) / 10) * 10 - 1;
  return { n, mrp, suffix: m[2] };
};

function ServiceContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const [service, setService] = useState<any>(null);
  const [others, setOthers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    api.get("/services/public").then((res) => setOthers(res.data.data || [])).catch(() => setOthers([]));
  }, []);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setOpenFaq(0);
    api.get(`/services/public/${slug}`)
      .then((res) => setService(res.data.data))
      .catch(() => setService(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const empty = (msg: string) => (
    <div className="py-24 text-center text-gray-600">
      {msg} <Link href="/" className="text-brand-orange font-semibold underline">Go home</Link>
    </div>
  );
  if (!slug) return empty("Please select a service.");
  if (loading) return <div className="py-24 text-center text-gray-500">Loading...</div>;
  if (!service) return empty("Service not found.");

  const c = CONTENT[slug] ?? GENERIC;
  const packages = packagesFor(slug);
  const bookHref = (pkg?: string) =>
    `/?service=${encodeURIComponent(service.title)}${pkg ? `&sub=${encodeURIComponent(pkg)}` : ""}#estimate`;
  const isIcon = !!service.image && /icon-/.test(service.image);
  const heroImg = service.image && !isIcon ? getImageUrl(service.image) : c.image;

  return (
    <>
      {/* Hero */}
      <section className="relative bg-brand-navy text-white overflow-hidden">
        <div className="relative max-w-[1320px] mx-auto px-4 py-4 md:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-6">
          <div className="min-w-0">
            <p className="text-xs text-white/70 mb-1.5 flex items-center gap-2">
              <Link href="/" className="hover:text-white">Home</Link> <span>/</span>
              <a href="#packages" className="hover:text-white">Services</a> <span>/</span>
              <span className="text-white">{service.title}</span>
            </p>
            <div className="flex items-center gap-3">
              {isIcon && (
                <div className="flex w-10 h-10 md:w-12 md:h-12 bg-white rounded-lg items-center justify-center shrink-0 shadow">
                  <img src={getImageUrl(service.image)} alt="" className="w-7 h-7 md:w-8 md:h-8 object-contain" />
                </div>
              )}
              <div className="min-w-0">
                <h1 className="font-heading font-bold text-xl md:text-3xl leading-tight">{service.title}</h1>
                <p className="text-xs md:text-sm text-white/80 truncate">
                  {service.shortDesc || `Professional ${service.title.toLowerCase()} at your doorstep in Jaipur.`}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link href={bookHref()} className="bg-brand-orange hover:bg-white hover:text-brand-navy transition text-white font-heading font-semibold px-4 py-2 rounded-sm text-sm">
              Book Now
            </Link>
            {packages.length > 0 && (
              <a href="#packages" className="inline-flex items-center gap-2 bg-white text-brand-navy hover:bg-brand-orange hover:text-white transition font-heading font-semibold px-4 py-2 rounded-sm text-sm">
                View Rates
              </a>
            )}
            <a href={phoneHref} className="inline-flex items-center gap-2 border border-white/50 hover:bg-white hover:text-brand-navy transition text-white font-heading font-semibold px-4 py-2 rounded-sm text-sm">
              <PhoneIcon className="w-4 h-4" /> {DEFAULT_PHONE}
            </a>
          </div>
        </div>
      </section>

      {/* Promise strip */}
      <section className="bg-brand-orange text-white">
        <div className="max-w-[1320px] mx-auto px-4 py-3 md:py-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {promises.map((p) => (
            <div key={p.t} className="flex items-center gap-3 justify-center">
              <p.icon className="w-6 h-6 shrink-0" />
              <span className="font-heading font-semibold text-sm md:text-base">{p.t}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="max-w-[1320px] mx-auto px-4 grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-12">
            {packages.length > 0 && (
              <div id="packages" className="scroll-mt-24">
                <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
                  <div>
                    <p className="text-brand-orange font-heading font-semibold uppercase tracking-wider text-sm">Rates & Packages</p>
                    <h2 className="font-heading font-bold text-2xl md:text-3xl text-brand-dark mt-1">{service.title} — Price List</h2>
                  </div>
                  <p className="text-sm text-gray-500">Transparent pricing · 18% GST extra · Visit charge ₹{VISIT_CHARGE} on every service · Spare parts charged separately</p>
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  {packages.map((p) => (
                    <div key={p.name} className="bg-white border border-gray-100 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 transition overflow-hidden flex flex-col">
                      <div className="flex gap-3 p-3 md:p-4 flex-1">
                        {p.img && (
                          <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-lg overflow-hidden bg-brand-light">
                            <img src={p.img} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-heading font-bold text-base text-brand-dark leading-snug">{p.name}</h3>
                            <div className="text-right shrink-0">
                              {(() => {
                                const pp = priceParts(p.price);
                                return pp ? (
                                  <>
                                    <p className="text-xs text-gray-400 leading-none"><span className="line-through">₹{pp.mrp}</span> <span className="text-green-600 font-semibold">30% OFF</span></p>
                                    <p className="font-heading font-bold text-xl text-brand-orange leading-none mt-1">₹{pp.n}{pp.suffix}</p>
                                  </>
                                ) : (
                                  <p className="font-heading font-bold text-xl text-brand-orange leading-none">{p.price}</p>
                                );
                              })()}
                              {p.gst && <p className="text-[11px] text-gray-500 mt-0.5">+ {p.gst}</p>}
                            </div>
                          </div>
                          <p className={`mt-1.5 text-[13px] text-gray-600 leading-snug ${expanded[p.name] ? "" : "line-clamp-1"}`}>
                            {p.desc || `Doorstep ${p.name.toLowerCase()} by trained Eletox technician. Final quote shared before work starts.`}
                          </p>
                          <button type="button" onClick={() => setExpanded((e) => ({ ...e, [p.name]: !e[p.name] }))} className="mt-1 text-xs font-semibold text-brand-navy hover:text-brand-orange">
                            {expanded[p.name] ? "Read less" : "Read more"}
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 border-t border-gray-100">
                        <a href={phoneHref} className="flex items-center justify-center gap-2 py-2.5 text-sm font-heading font-semibold text-brand-navy hover:bg-brand-light transition border-r border-gray-100">
                          <PhoneIcon className="w-4 h-4" /> Call Now
                        </a>
                        <Link href={bookHref(p.name)} className="flex items-center justify-center gap-2 py-2.5 text-sm font-heading font-semibold bg-brand-orange text-white hover:bg-brand-navy transition">
                          Book Now <ArrowRightIcon className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <img src={heroImg} alt={service.title} className="w-full h-[220px] md:h-[360px] object-cover rounded-2xl shadow-xl" />
              <h2 className="font-heading font-bold text-2xl md:text-3xl text-brand-dark mt-8 mb-4">About this service</h2>
              <p className="text-gray-700 leading-relaxed text-[17px]">{c.intro}</p>
              {service.description && service.description !== service.shortDesc && (
                <p className="text-gray-700 leading-relaxed text-[17px] mt-4 whitespace-pre-line">{service.description}</p>
              )}
              {c.brands && (
                <p className="mt-5 text-sm text-gray-600 bg-brand-light border-l-4 border-brand-orange px-4 py-3 rounded-r-lg">
                  <span className="font-semibold text-brand-dark">Brands we service:</span> {c.brands}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-brand-light rounded-2xl p-7">
                <h3 className="font-heading font-bold text-2xl text-brand-dark mb-5">What's included</h3>
                <ul className="space-y-3">
                  {c.includes.map((t) => (
                    <li key={t} className="flex items-start gap-3 text-gray-700">
                      <CheckCircleIcon className="w-6 h-6 text-brand-orange shrink-0" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-brand-navy text-white rounded-2xl p-7">
                <h3 className="font-heading font-bold text-2xl mb-5">Common problems we fix</h3>
                <ul className="space-y-3">
                  {c.problems.map((t) => (
                    <li key={t} className="flex items-start gap-3 text-white/90">
                      <WrenchScrewdriverIcon className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-heading font-bold text-3xl text-brand-dark mb-8">How it works</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {steps.map((s) => (
                  <div key={s.n} className="border border-gray-100 rounded-xl p-6 hover:shadow-lg transition bg-white">
                    <div className="font-heading font-bold text-4xl text-brand-orange/30">{s.n}</div>
                    <div className="font-heading font-bold text-lg text-brand-dark mt-2">{s.t}</div>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{s.d}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-heading font-bold text-3xl text-brand-dark mb-6">Frequently asked questions</h3>
              <div className="divide-y border rounded-2xl overflow-hidden">
                {c.faqs.map((f, i) => (
                  <div key={f.q}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                      className="w-full flex justify-between items-center text-left px-6 py-5 font-heading font-semibold text-brand-dark hover:bg-brand-light transition"
                    >
                      {f.q}
                      <span className={`text-brand-orange text-2xl leading-none transition-transform ${openFaq === i ? "rotate-45" : ""}`}>+</span>
                    </button>
                    {openFaq === i && <p className="px-6 pb-5 text-gray-600 leading-relaxed">{f.a}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 self-start">
            <div className="bg-brand-orange text-white p-7 rounded-2xl shadow-lg">
              <p className="text-sm uppercase tracking-wide text-white/80">Visit &amp; inspection charge</p>
              <p className="font-heading font-bold text-5xl mb-1">₹{VISIT_CHARGE}</p>
              <p className="text-sm text-white/80 mb-5">Applies on every service · adjusted in final bill</p>
              <Link href={bookHref()} className="block text-center bg-brand-navy hover:bg-brand-dark transition text-white font-heading font-semibold py-3.5 rounded-sm">
                Book Appointment
              </Link>
              <a href={phoneHref} className="mt-3 flex items-center justify-center gap-2 bg-white text-brand-navy font-heading font-semibold py-3.5 rounded-sm hover:bg-brand-light transition">
                <PhoneIcon className="w-5 h-5" /> {DEFAULT_PHONE}
              </a>
              <a href={waHref} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-center gap-2 bg-[#25D366] text-white font-heading font-semibold py-3.5 rounded-sm hover:brightness-110 transition">
                Chat on WhatsApp
              </a>
              <div className="mt-5 pt-5 border-t border-white/30 text-sm text-white/90 space-y-2">
                <p className="flex items-center gap-2"><ClockIcon className="w-4 h-4" /> Open 24×7 — All days</p>
                <p className="flex items-center gap-2"><MapPinIcon className="w-4 h-4" /> Service across Jaipur</p>
              </div>
            </div>

            {others.length > 1 && (
              <div className="border border-gray-100 rounded-2xl p-6 shadow-sm">
                <h3 className="font-heading font-bold text-xl text-brand-dark mb-4">Our Services</h3>
                <ul className="divide-y">
                  {others.map((o) => (
                    <li key={o._id}>
                      <Link
                        href={`/service/?slug=${o.slug}`}
                        className={`flex items-center justify-between py-3 text-sm transition ${o.slug === slug ? "text-brand-orange font-semibold" : "text-gray-700 hover:text-brand-orange"}`}
                      >
                        {o.title} <ArrowRightIcon className="w-4 h-4" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-brand-light rounded-2xl p-6">
              <h3 className="font-heading font-bold text-xl text-brand-dark mb-3">Need help choosing?</h3>
              <p className="text-sm text-gray-600 mb-4">Tell us the problem — our team will guide you and send the right technician.</p>
              <a href={`mailto:${DEFAULT_EMAIL}`} className="flex items-center gap-2 text-sm text-brand-navy font-semibold hover:text-brand-orange">
                <EnvelopeIcon className="w-4 h-4" /> {DEFAULT_EMAIL}
              </a>
            </div>
          </aside>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-navy text-white">
        <div className="max-w-[1320px] mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h3 className="font-heading font-bold text-2xl md:text-4xl">Need {service.title} today?</h3>
            <p className="text-white/80 mt-2">Same-day doorstep service across Jaipur. Genuine parts, warranty included.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href={bookHref()} className="bg-brand-orange hover:bg-white hover:text-brand-navy transition text-white font-heading font-semibold px-8 py-4 rounded-sm">Get Free Estimate</Link>
            <a href={phoneHref} className="inline-flex items-center gap-2 bg-white text-brand-navy hover:bg-brand-orange hover:text-white transition font-heading font-semibold px-8 py-4 rounded-sm"><PhoneIcon className="w-5 h-5" /> Call Now</a>
          </div>
        </div>
      </section>
    </>
  );
}

export default function ServicePage() {
  const [company, setCompany] = useState<any>({});
  useEffect(() => {
    api.get("/settings/company").then((res) => setCompany(res.data.data || {})).catch(() => setCompany({}));
  }, []);
  return (
    <main className="min-h-screen bg-white text-gray-800">
      <header className="bg-white shadow-[0_2px_20px_rgba(0,0,0,0.06)] sticky top-0 z-50">
        <div className="max-w-[1320px] mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/"><Logo height={62} /></Link>
          <div className="flex items-center gap-6">
            <a href={phoneHref} className="hidden md:inline-flex items-center gap-2 font-heading font-bold text-brand-dark hover:text-brand-orange transition">
              <PhoneIcon className="w-5 h-5 text-brand-orange" /> {DEFAULT_PHONE}
            </a>
            <Link href="/" className="inline-flex items-center gap-2 font-heading font-semibold text-brand-navy hover:text-brand-orange transition"><ArrowLeftIcon className="w-5 h-5" /> Back Home</Link>
          </div>
        </div>
      </header>

      <Suspense fallback={<div className="py-24 text-center text-gray-500">Loading...</div>}>
        <ServiceContent />
      </Suspense>

      <footer className="bg-brand-dark text-gray-300">
        <div className="max-w-[1320px] mx-auto px-4 py-10 grid md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="bg-white rounded-lg p-3 inline-block mb-4"><Logo height={44} /></div>
            <p className="text-gray-400 leading-relaxed">Eletox AC Services — Jaipur's trusted AC, appliance and electrical repair company. 24×7 support, same-day doorstep visit and transparent pricing.</p>
            <SocialLinks links={company.socialLinks} className="mt-4" />
          </div>
          <div className="flex items-start gap-3"><MapPinIcon className="w-5 h-5 text-brand-orange shrink-0 mt-0.5" /><span>{DEFAULT_ADDRESS}</span></div>
          <div className="space-y-3">
            <a href={phoneHref} className="flex items-center gap-3 hover:text-white"><PhoneIcon className="w-5 h-5 text-brand-orange" /> {DEFAULT_PHONE}</a>
            <a href={`mailto:${DEFAULT_EMAIL}`} className="flex items-center gap-3 hover:text-white"><EnvelopeIcon className="w-5 h-5 text-brand-orange" /> {DEFAULT_EMAIL}</a>
            <p className="flex items-center gap-3"><ClockIcon className="w-5 h-5 text-brand-orange" /> Open 24×7 — All days</p>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-[1320px] mx-auto px-4 py-5 text-sm text-gray-400 flex flex-col md:flex-row justify-between items-center gap-3 text-center md:text-left">
            <p>&copy; {new Date().getFullYear()} Eletox AC Services — All Rights Reserved.</p>
            <p>Designed by <a href="https://qrologic.com" target="_blank" rel="noopener noreferrer" className="text-white font-semibold hover:text-brand-orange transition">QROLOGIC SOFTECH AND RESEARCH PRIVATE LIMITED</a></p>
          </div>
        </div>
      </footer>
    </main>
  );
}
