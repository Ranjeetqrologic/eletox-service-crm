"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import { subServicesFor } from "@/lib/subServices";
import Logo from "@/components/Logo";
import toast from "react-hot-toast";
import {
  ChevronLeftIcon, ChevronRightIcon,
  PhoneIcon, EnvelopeIcon, MapPinIcon, ClockIcon, Bars3Icon, XMarkIcon,
  HomeModernIcon, BuildingOffice2Icon, ArrowRightIcon, CheckIcon, ArrowUpIcon,
  ShieldCheckIcon, BoltIcon, CurrencyRupeeIcon, WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

const WhatsAppIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden="true">
    <path d="M16 3C9.4 3 4 8.3 4 14.9c0 2.4.7 4.7 2 6.7L4 29l7.6-2c1.4.7 2.9 1 4.4 1 6.6 0 12-5.3 12-11.9S22.6 3 16 3zm0 21.8c-1.4 0-2.8-.4-4-1.1l-.3-.2-4.5 1.2 1.2-4.3-.2-.3a9.7 9.7 0 0 1-1.6-5.3C6.6 9.6 10.8 5.4 16 5.4s9.4 4.2 9.4 9.5-4.2 9.9-9.4 9.9zm5.2-7.2c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.8-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.1c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5 2.5 1 3 .8 3.6.7.5-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.2-.6-.4z" />
  </svg>
);

const A = "/eletox-assets";

const DEFAULT_PHONE = "+91 9571071342";
const DEFAULT_EMAIL = "eletox07@gmail.com";
const DEFAULT_ADDRESS = "Tilak Vihar, Gokulpura, near Gs Swimming Pool, Jhotwara, Jaipur, Rajasthan 302012";

const defaultServices = [
  { title: "AC Repair & Service", image: `${A}/icon-ac.png`, shortDesc: "Split, window & cassette AC repair, gas filling and full service." },
  { title: "AC Pipe Line", image: `${A}/icon-pipe.jpg`, shortDesc: "Copper pipe line, drain pipe and wiring fitting with sleeves." },
  { title: "Washing Machine Repair", image: `${A}/icon-washing.jpg`, shortDesc: "Top load, front load & semi automatic washing machine repair." },
  { title: "Microwave Repair", image: `${A}/icon-microwave.jpg`, shortDesc: "Solo, grill & convection microwave oven repair at home." },
  { title: "Geyser Repair & Service", image: `${A}/icon-geyser.png`, shortDesc: "Electric & gas geyser repair, installation and servicing." },
  { title: "Water Purifier Repair & Service", image: `${A}/icon-purifier.png`, shortDesc: "RO / UV purifier repair, filter change and AMC." },
  { title: "Water Dispenser Repair & Services", image: `${A}/icon-dispenser.jpg`, shortDesc: "Hot & cold water dispenser repair and maintenance." },
  { title: "Water Cooler Repair & Services", image: `${A}/icon-cooler.jpg`, shortDesc: "Commercial & domestic water cooler repair and gas charging." },
  { title: "Electrician", image: `${A}/icon-electrician.png`, shortDesc: "Certified electrician for wiring, fittings and electrical faults." },
];

const heroSlides = [
  { image: `${A}/hero-1.jpg`, title: "Quality AC & Appliance Repair Service in Jaipur", subtitle: "Certified technicians, genuine parts and same-day doorstep service — just one call away." },
  { image: `${A}/hero-2.jpg`, title: "Trusted Repair Experts, Right At Your Doorstep", subtitle: "AC, washing machine, geyser, RO and electrical repairs with transparent pricing." },
];

const facts = [
  { value: "15", l1: "Member", l2: "Professional", icon: `${A}/icon-fact-1.png` },
  { value: "1000+", l1: "Project", l2: "Completed", icon: `${A}/icon-fact-2.png` },
  { value: "02", l1: "Total", l2: "Branches", icon: `${A}/icon-fact-3.png` },
  { value: "5000+", l1: "Client", l2: "Satisfaction", icon: `${A}/icon-fact-4.png` },
];

const team = [
  { name: "AC Service Experts", role: "Split • Window • Cassette", image: `${A}/team-1.jpg` },
  { name: "Senior Technicians", role: "10+ Years Experience", image: `${A}/team-2.jpg` },
  { name: "Appliance Specialists", role: "Washing Machine • Geyser • RO", image: `${A}/team-3.jpg` },
  { name: "Support Team", role: "24x7 Customer Care", image: `${A}/team-4.jpg` },
];

const whyChoose = [
  { icon: WrenchScrewdriverIcon, title: "Expert Technicians", desc: "Certified and experienced technicians who diagnose the problem right the first time and repair it with genuine parts." },
  { icon: BoltIcon, title: "Same-Day Service", desc: "Book in the morning, get it fixed by evening. Fast doorstep visits across Jaipur, 24x7 support." },
  { icon: CurrencyRupeeIcon, title: "Transparent Pricing", desc: "Upfront estimates with no hidden charges. Pay only for what is repaired." },
  { icon: ShieldCheckIcon, title: "Service Warranty", desc: "Every repair is backed by a service warranty — that is why 5000+ clients in Jaipur trust Eletox." },
];

const blogs = [
  { image: `${A}/blog-1.jpg`, cat: "AC Care", title: "How often should you service your AC in Jaipur summers?" },
  { image: `${A}/blog-2.jpg`, cat: "Appliances", title: "5 signs your washing machine needs a technician" },
  { image: `${A}/blog-3.jpg`, cat: "Water Purifier", title: "When to change RO filters for safe drinking water" },
];

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About Us", href: "#about" },
  { label: "Service", href: "#services" },
  { label: "Team", href: "#team" },
  { label: "Blog", href: "#blog" },
  { label: "Contact Us", href: "#contact" },
];

const SectionTitle = ({ sub, title, light = false, center = false }: { sub: string; title: string; light?: boolean; center?: boolean }) => (
  <div className={center ? "text-center" : ""}>
    <span className={`inline-flex items-center gap-2 font-heading font-semibold uppercase tracking-wide text-sm ${light ? "text-white" : "text-brand-orange"}`}>
      <img src={`${A}/icon-subtitle.png`} alt="" className="w-5 h-5" />
      {sub}
    </span>
    <h2 className={`font-heading font-bold text-3xl md:text-[44px] leading-tight mt-3 ${light ? "text-white" : "text-brand-dark"}`}>{title}</h2>
  </div>
);

export default function Home() {
  const [services, setServices] = useState<any[]>([]);
  const [company, setCompany] = useState<any>({});
  const [banners, setBanners] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({
    customerName: "", mobile: "", email: "", address: "", city: "Jaipur", pin: "",
    service: "", subService: "", acType: "", preferredDate: "", preferredTime: "", problem: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/services/public").then((res) => setServices(res.data.data || [])).catch(() => setServices([]));
    api.get("/settings/company").then((res) => setCompany(res.data.data || {})).catch(() => setCompany({}));
    api.get("/banners/public").then((res) => setBanners(res.data.data || [])).catch(() => setBanners([]));
    api.get("/gallery/public").then((res) => setGallery(res.data.data || [])).catch(() => setGallery([]));
    const q = new URLSearchParams(window.location.search);
    const svc = q.get("service");
    if (svc) {
      setForm((f) => ({ ...f, service: svc, subService: q.get("sub") || "" }));
      setTimeout(() => document.getElementById("estimate")?.scrollIntoView({ behavior: "smooth" }), 300);
    }
  }, []);

  const slides = banners.length
    ? banners.map((b) => ({ image: getImageUrl(b.image) || heroSlides[0].image, title: b.title || heroSlides[0].title, subtitle: b.subtitle || heroSlides[0].subtitle, link: b.buttonLink, button: b.buttonText }))
    : heroSlides.map((s) => ({ ...s, link: undefined, button: undefined }));

  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => setActiveBanner((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.target.name === "service") {
      setForm({ ...form, service: e.target.value, subService: "" });
      return;
    }
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const subOptions = subServicesFor(form.service);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/leads/public-inquiry", form);
      toast.success(data.message || "Inquiry submitted successfully");
      setForm({ customerName: "", mobile: "", email: "", address: "", city: "Jaipur", pin: "", service: "", subService: "", acType: "", preferredDate: "", preferredTime: "", problem: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  const phone = company.phone || DEFAULT_PHONE;
  const phoneHref = `tel:${phone.replace(/[^+\d]/g, "")}`;
  const whatsapp = (company.whatsapp || phone).replace(/\D/g, "");
  const email = company.email || DEFAULT_EMAIL;
  const address = company.address || DEFAULT_ADDRESS;
  const serviceList = services.length ? services : defaultServices;
  const slide = slides[activeBanner % slides.length];

  return (
    <main id="home" className="min-h-screen bg-white text-gray-700">
      {/* Top bar */}
      <div className="hidden md:block text-sm">
        <div className="max-w-[1320px] mx-auto px-4 flex">
          <div className="bg-brand-orange text-white font-heading font-semibold px-6 py-2.5 relative pr-10 tracking-wide">
            {company.name || "Elehome Solutions PVT. LTD."}
            <span className="absolute right-0 top-0 h-full w-6 bg-white" style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }} />
          </div>
          <div className="flex-1 bg-brand-light text-brand-dark flex justify-end items-center gap-8 px-6 py-2.5">
            <span className="flex items-center gap-2"><ClockIcon className="w-4 h-4 text-brand-orange" />24x7 Services</span>
            <span className="flex items-center gap-2"><MapPinIcon className="w-4 h-4 text-brand-orange" />Jaipur, Rajasthan</span>
            <a href={phoneHref} className="flex items-center gap-2 hover:text-brand-orange"><PhoneIcon className="w-4 h-4 text-brand-orange" />{phone}</a>
            <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-brand-orange"><EnvelopeIcon className="w-4 h-4 text-brand-orange" />{email}</a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white sticky top-0 z-50 shadow-[0_2px_20px_rgba(0,0,0,0.06)]">
        <div className="max-w-[1320px] mx-auto px-4 py-3 flex justify-between items-center">
          <Logo logoUrl={company.logo} height={62} />
          <nav className="hidden lg:flex items-center gap-8 font-heading font-semibold text-[15px] uppercase text-brand-dark">
            {navLinks.map((n) => <a key={n.label} href={n.href} className="hover:text-brand-orange transition">{n.label}</a>)}
          </nav>
          <div className="flex items-center gap-3">
            <a href={phoneHref} className="hidden md:inline-flex items-center gap-2 bg-brand-orange text-white font-heading font-semibold px-6 py-3 rounded-sm hover:bg-brand-navy transition">
              <PhoneIcon className="w-5 h-5" /> Call Now
            </a>
            <Link href="/staff-login/" className="hidden md:inline-flex border border-brand-navy text-brand-navy font-heading font-semibold px-4 py-3 rounded-sm hover:bg-brand-navy hover:text-white transition">Login</Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden text-brand-navy p-2" aria-label="Menu">
              {menuOpen ? <XMarkIcon className="w-7 h-7" /> : <Bars3Icon className="w-7 h-7" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="lg:hidden border-t bg-white px-4 py-4 flex flex-col gap-3 font-heading font-semibold uppercase text-brand-dark">
            {navLinks.map((n) => <a key={n.label} href={n.href} onClick={() => setMenuOpen(false)}>{n.label}</a>)}
            <a href={phoneHref} className="text-brand-orange">Call Now: {phone}</a>
            <Link href="/staff-login/">Login</Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative min-h-[440px] md:min-h-[640px] flex items-center overflow-hidden">
        {slides.map((s, i) => (
          <div key={i} className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${i === activeBanner % slides.length ? "opacity-100" : "opacity-0"}`} style={{ backgroundImage: `url('${s.image}')` }} />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-black/10 md:from-black/60 md:via-black/30 md:to-transparent" />
        <div className="max-w-[1320px] mx-auto px-4 relative w-full py-14 md:py-20 pb-24 md:pb-28">
          <div className="max-w-2xl text-white">
            <span className="inline-flex items-center gap-2 font-heading font-semibold uppercase text-brand-orange tracking-wide">
              <img src={`${A}/icon-subtitle.png`} alt="" className="w-5 h-5" /> Residential &amp; Commercial
            </span>
            <h1 className="font-heading font-bold text-3xl sm:text-4xl md:text-[60px] leading-[1.1] mt-3 mb-4 drop-shadow">{slide.title}</h1>
            <p className="text-base md:text-xl mb-6 md:mb-8 text-white/90 drop-shadow">{slide.subtitle}</p>
            <div className="flex flex-wrap gap-3 md:gap-4">
              <a href={slide.link || "#estimate"} className="bg-brand-navy text-white font-heading font-semibold px-6 md:px-8 py-3 md:py-4 rounded-sm hover:bg-brand-orange transition">{slide.button || "Appointment Now"}</a>
              <a href={phoneHref} className="inline-flex items-center gap-2 bg-brand-orange text-white font-heading font-semibold px-6 md:px-8 py-3 md:py-4 rounded-sm hover:bg-brand-navy transition"><PhoneIcon className="w-5 h-5" /> Call Now</a>
            </div>
          </div>
        </div>
        {slides.length > 1 && (
          <>
            <button type="button" onClick={() => setActiveBanner((i) => (i - 1 + slides.length) % slides.length)} aria-label="Previous slide" className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-brand-orange text-white items-center justify-center backdrop-blur transition">
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            <button type="button" onClick={() => setActiveBanner((i) => (i + 1) % slides.length)} aria-label="Next slide" className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/15 hover:bg-brand-orange text-white items-center justify-center backdrop-blur transition">
              <ChevronRightIcon className="w-6 h-6" />
            </button>
            <div className="absolute bottom-20 md:bottom-24 left-4 md:left-1/2 md:-translate-x-1/2 flex gap-2">
              {slides.map((_, i) => (
                <button key={i} onClick={() => setActiveBanner(i)} className={`h-2.5 rounded-full transition-all ${i === activeBanner % slides.length ? "bg-brand-orange w-7" : "bg-white/60 w-2.5"}`} aria-label={`Slide ${i + 1}`} />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Residential / Commercial tabs */}
      <section className="relative z-10 -mt-14 md:-mt-[60px] mb-10 md:mb-16">
        <div className="max-w-[1320px] mx-auto px-4">
          <div className="grid md:grid-cols-2 shadow-xl">
            {(["residential", "commercial"] as const).map((t) => (
              <a key={t} href="#services" className={`group flex items-center justify-between gap-4 px-6 md:px-12 py-6 md:py-10 text-white ${t === "residential" ? "bg-brand-orange" : "bg-brand-navy"}`}>
                <div className="flex items-center gap-4">
                  {t === "residential" ? <HomeModernIcon className="w-10 h-10 md:w-14 md:h-14 shrink-0 opacity-80" /> : <BuildingOffice2Icon className="w-10 h-10 md:w-14 md:h-14 shrink-0 opacity-80" />}
                  <h3 className="font-heading font-semibold text-xl md:text-[30px] leading-tight max-w-[280px]">{t === "residential" ? "Residential Repair Service" : "Commercial Repair Service"}</h3>
                </div>
                <span className="w-11 h-11 md:w-16 md:h-16 shrink-0 rounded-full border border-white/40 flex items-center justify-center group-hover:bg-white group-hover:text-brand-dark transition"><ArrowRightIcon className="w-6 h-6" /></span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-12 md:py-20 bg-brand-light">
        <div className="max-w-[1320px] mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <SectionTitle sub="Featured Services" title="Popular repair services" />
            <a href="#estimate" className="self-start md:self-auto inline-flex items-center gap-2 bg-brand-orange text-white font-heading font-semibold px-7 py-3.5 rounded-sm hover:bg-brand-navy transition">Book a Service <ArrowRightIcon className="w-4 h-4" /></a>
          </div>
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="grid grid-cols-3 gap-x-4 gap-y-8 max-w-[540px] mx-auto lg:mx-0">
              {serviceList.map((s: any, i: number) => {
                const inner = (
                  <>
                    <div className="w-full aspect-square bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center p-5 group-hover:shadow-lg group-hover:-translate-y-1 transition">
                      {s.image ? <img src={getImageUrl(s.image)} alt={s.title} className="w-full h-full object-contain" /> : <span className="text-3xl">❄</span>}
                    </div>
                    <p className="mt-3 text-center text-[13px] leading-tight text-gray-700 group-hover:text-brand-orange transition">{s.title}</p>
                  </>
                );
                const cls = "group block";
                return s._id ? <Link key={s._id} href={`/service/?slug=${s.slug}`} className={cls}>{inner}</Link> : <a key={i} href="#estimate" className={cls}>{inner}</a>;
              })}
            </div>
            <img src={`${A}/icon-service.jpg`} alt="AC repair service" className="w-full h-[420px] lg:h-[510px] object-cover rounded-sm hidden md:block" />
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-12 md:py-24">
        <div className="max-w-[1320px] mx-auto px-4 grid lg:grid-cols-2 gap-14 items-center">
          <div className="relative pb-12 pr-6 md:pb-16 md:pr-10">
            <img src={`${A}/about-1.jpg`} alt="About Elehome" className="w-full h-[300px] md:h-[420px] object-cover" />
            <img src={`${A}/about-2.jpg`} alt="Technician" className="absolute bottom-0 right-0 w-[55%] h-44 md:h-64 object-cover border-4 md:border-8 border-white shadow-xl" />
            <div className="absolute left-6 bottom-6 bg-brand-orange text-white font-heading px-6 py-4 shadow-xl">
              <div className="text-3xl font-bold leading-none">1000+</div>
              <div className="text-sm font-semibold">Project Done</div>
            </div>
          </div>
          <div>
            <SectionTitle sub="About company" title="We are most popular repair company" />
            <p className="mt-6 text-gray-600">
              {company.tagline || "Elehome Solutions PVT. LTD. (Eletox) is Jaipur's trusted AC and home appliance repair company. With 10+ years of experience, 15 professional members and 2 branches, we provide fast, honest and affordable repair for homes and businesses across Jaipur."}
            </p>
            <p className="mt-4 font-heading font-semibold text-brand-dark text-lg flex items-center gap-3">
              <span className="w-10 h-10 shrink-0 rounded-full bg-brand-orange/15 text-brand-orange flex items-center justify-center"><CheckIcon className="w-5 h-5" /></span>
              Fast, honest and affordable repairs — every single time
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <a href="#estimate" className="bg-brand-orange text-white font-heading font-semibold px-8 py-4 rounded-sm hover:bg-brand-navy transition">Get Free Estimate</a>
              <a href={phoneHref} className="flex items-center gap-3 font-heading">
                <img src={`${A}/icon-cta.png`} alt="" className="w-10 h-10 object-contain" />
                <span><span className="block text-xs text-gray-500">Call Us Anytime</span><span className="font-bold text-brand-dark">{phone}</span></span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Facts */}
      <section className="bg-brand-navy py-10 md:py-16 text-white">
        <div className="max-w-[1320px] mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-8">
          {facts.map((f) => (
            <div key={f.l2} className="flex items-center gap-3 md:gap-5 min-w-0">
              <img src={f.icon} alt="" className="w-11 h-11 md:w-16 md:h-16 object-contain shrink-0" />
              <div className="min-w-0">
                <div className="font-heading font-bold text-2xl md:text-5xl leading-none">{f.value}</div>
                <div className="font-heading text-white/85 text-sm mt-1 leading-tight">{f.l1}<br />{f.l2}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery (optional, admin-managed) */}
      {gallery.length > 0 && (
        <section id="gallery" className="py-20 max-w-[1320px] mx-auto px-4">
          <SectionTitle sub="Our Work" title="Service gallery" center />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            {gallery.map((g) => (
              <div key={g._id} className="overflow-hidden shadow-md group">
                <img src={getImageUrl(g.image)} alt={g.title} className="w-full h-56 object-cover group-hover:scale-105 transition duration-500" />
                {g.title && <div className="p-3 bg-white text-center font-medium text-sm">{g.title}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Free estimate */}
      <section id="estimate" className="py-12 md:py-24 bg-white">
        <div className="max-w-[1320px] mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <img src={`${A}/contact.png`} alt="Technician" className="w-full max-w-lg mx-auto" />
            <div className="absolute top-6 left-0 bg-brand-navy text-white font-heading px-6 py-4 shadow-xl flex items-center gap-4">
              <div className="text-5xl font-bold leading-none">10</div>
              <div className="text-sm font-semibold leading-tight">10+Year<br />Working Experience</div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="bg-brand-orange p-8 md:p-12 text-white">
            <h2 className="font-heading font-bold text-4xl mb-8">Free Estimate</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <input name="customerName" value={form.customerName} onChange={handleChange} placeholder="Full Name" className="bg-white text-gray-800 p-4 w-full outline-none" required />
              <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="Phone Number" className="bg-white text-gray-800 p-4 w-full outline-none" required />
              <select name="service" value={form.service} onChange={handleChange} className="bg-white text-gray-800 p-4 w-full outline-none md:col-span-2" required>
                <option value="">Choose Service</option>
                {serviceList.map((s: any) => <option key={s._id || s.title} value={s.title}>{s.title}</option>)}
                {!services.length && ["Refrigerator Repair", "AC Installation"].map((t) => <option key={t} value={t}>{t}</option>)}
                <option value="Other">Other</option>
              </select>
              {subOptions.length > 0 && (
                <select name="subService" value={form.subService} onChange={handleChange} className="bg-white text-gray-800 p-4 w-full outline-none md:col-span-2" required>
                  <option value="">Choose Category</option>
                  {subOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                  <option value="Other">Other</option>
                </select>
              )}
            </div>
            <textarea name="address" value={form.address} onChange={handleChange} placeholder="Address" className="bg-white text-gray-800 p-4 w-full outline-none mt-4" rows={2} required />
            <textarea name="problem" value={form.problem} onChange={handleChange} placeholder="Note" className="bg-white text-gray-800 p-4 w-full outline-none mt-4" rows={3} />
            <button type="submit" disabled={loading} className="mt-6 bg-brand-navy text-white font-heading font-semibold px-10 py-4 rounded-sm hover:bg-brand-dark disabled:opacity-60 transition">
              {loading ? "Submitting..." : "Appointment Now"}
            </button>
          </form>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="bg-brand-navy py-24">
        <div className="max-w-[1320px] mx-auto px-4">
          <SectionTitle sub="Technician Team" title="Our dedicated & expert team member" light center />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
            {team.map((m) => (
              <div key={m.name} className="bg-white group overflow-hidden">
                <div className="overflow-hidden">
                  <img src={m.image} alt={m.name} className="w-full h-72 object-cover group-hover:scale-105 transition duration-500" />
                </div>
                <div className="p-5 text-center">
                  <span className="text-brand-orange font-heading font-semibold text-sm uppercase">{m.role}</span>
                  <h4 className="font-heading font-bold text-xl text-brand-dark">{m.name}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white">
        <div className="max-w-[1320px] mx-auto px-4 grid lg:grid-cols-2 gap-14 items-center">
          <div className="relative">
            <img src={`${A}/choose-bg.jpg`} alt="Eletox technician at work" className="w-full h-[420px] lg:h-[560px] object-cover rounded-2xl shadow-2xl" />
            <div className="absolute -bottom-6 left-6 md:left-10 bg-brand-navy text-white rounded-xl px-7 py-5 shadow-xl flex items-center gap-4">
              <ShieldCheckIcon className="w-12 h-12 text-brand-orange" />
              <div>
                <div className="font-heading font-bold text-2xl leading-none">100% Genuine</div>
                <div className="text-sm text-white/80 mt-1">Spare parts &amp; service warranty</div>
              </div>
            </div>
          </div>
          <div>
            <SectionTitle sub="Why Choose Us" title="Reliable repairs for better living" />
            <p className="mt-6 text-gray-600 text-lg">Eletox combines skilled technicians, genuine parts and honest pricing so every repair lasts longer and every customer stays cool.</p>
            <div className="mt-10 grid sm:grid-cols-2 gap-5">
              {whyChoose.map((w) => (
                <div key={w.title} className="group bg-brand-light border border-gray-100 rounded-xl p-6 hover:bg-brand-navy hover:border-brand-navy transition-colors duration-300">
                  <div className="w-14 h-14 rounded-xl bg-brand-orange text-white flex items-center justify-center mb-5 shadow-md"><w.icon className="w-7 h-7" /></div>
                  <h4 className="font-heading font-bold text-xl text-brand-dark group-hover:text-white mb-2 transition-colors">{w.title}</h4>
                  <p className="text-gray-600 group-hover:text-white/80 text-sm leading-relaxed transition-colors">{w.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <a href="#estimate" className="bg-brand-orange text-white font-heading font-semibold px-8 py-4 rounded-sm hover:bg-brand-navy transition">Book a Technician</a>
              <a href={phoneHref} className="inline-flex items-center gap-3 font-heading font-bold text-brand-dark hover:text-brand-orange transition"><PhoneIcon className="w-6 h-6 text-brand-orange" /> {phone}</a>
            </div>
          </div>
        </div>
      </section>

      {/* Blog */}
      <section id="blog" className="py-24 bg-brand-light">
        <div className="max-w-[1320px] mx-auto px-4">
          <SectionTitle sub="Recent Blogs" title="Every single update story from our journal" center />
          <div className="grid md:grid-cols-3 gap-8 mt-14">
            {blogs.map((b) => (
              <article key={b.title} className="bg-white group overflow-hidden shadow-sm hover:shadow-xl transition">
                <div className="overflow-hidden">
                  <img src={b.image} alt={b.title} className="w-full h-60 object-cover group-hover:scale-105 transition duration-500" />
                </div>
                <div className="p-7">
                  <div className="flex gap-4 text-sm text-gray-500 mb-3"><span className="text-brand-orange font-semibold">Eletox</span><span>{b.cat}</span></div>
                  <h4 className="font-heading font-bold text-xl text-brand-dark mb-4 group-hover:text-brand-orange transition">{b.title}</h4>
                  <a href="#estimate" className="inline-flex items-center gap-1 font-heading font-semibold text-brand-navy text-sm hover:text-brand-orange transition">Read More <ArrowRightIcon className="w-4 h-4" /></a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-orange">
        <div className="max-w-[1320px] mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-white">
          <h3 className="font-heading font-bold text-3xl md:text-4xl">Need a repair today? Let&apos;s get started.</h3>
          <a href={phoneHref} className="inline-flex items-center gap-2 bg-white text-brand-navy font-heading font-bold px-8 py-4 rounded-sm hover:bg-brand-navy hover:text-white transition"><PhoneIcon className="w-5 h-5" /> {phone}</a>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-brand-dark text-gray-300 pt-16 pb-6">
        <div className="max-w-[1320px] mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] gap-10 lg:gap-14 mb-14">
          <div>
            <div className="inline-block bg-white rounded-lg px-3 py-2 mb-5"><Logo logoUrl={company.logo} height={44} /></div>
            <p className="text-sm text-gray-400 leading-relaxed">{company.name || "Elehome Solutions PVT. LTD."} — Jaipur&apos;s trusted AC, appliance and electrical repair company. 24x7 support, same-day doorstep visit and transparent pricing.</p>
            <div className="mt-6 flex gap-3">
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="w-10 h-10 rounded-full bg-[#25d366] text-white flex items-center justify-center hover:opacity-90"><WhatsAppIcon className="w-5 h-5" /></a>
              <a href={phoneHref} aria-label="Call" className="w-10 h-10 rounded-full bg-brand-orange text-white flex items-center justify-center hover:opacity-90"><PhoneIcon className="w-5 h-5" /></a>
              <a href={`mailto:${email}`} aria-label="Email" className="w-10 h-10 rounded-full bg-[#4170b7] text-white flex items-center justify-center hover:opacity-90"><EnvelopeIcon className="w-5 h-5" /></a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-heading font-bold text-lg mb-5 relative pb-3 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-10 after:h-0.5 after:bg-brand-orange">Our Services</h4>
            <ul className="space-y-2.5 text-sm">
              {serviceList.slice(0, 7).map((s: any) => (
                <li key={s._id || s.title} className="flex items-center gap-2">
                  <ArrowRightIcon className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                  {s._id ? <Link href={`/service/?slug=${s.slug}`} className="hover:text-brand-orange transition">{s.title}</Link> : <a href="#estimate" className="hover:text-brand-orange transition">{s.title}</a>}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-heading font-bold text-lg mb-5 relative pb-3 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-10 after:h-0.5 after:bg-brand-orange">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              {navLinks.map((n) => (
                <li key={n.label} className="flex items-center gap-2"><ArrowRightIcon className="w-3.5 h-3.5 text-brand-orange shrink-0" /><a href={n.href} className="hover:text-brand-orange transition">{n.label}</a></li>
              ))}
              <li className="flex items-center gap-2"><ArrowRightIcon className="w-3.5 h-3.5 text-brand-orange shrink-0" /><a href="#estimate" className="hover:text-brand-orange transition">Free Estimate</a></li>
              <li className="flex items-center gap-2"><ArrowRightIcon className="w-3.5 h-3.5 text-brand-orange shrink-0" /><Link href="/staff-login/" className="hover:text-brand-orange transition">Staff Login</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-heading font-bold text-lg mb-5 relative pb-3 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-10 after:h-0.5 after:bg-brand-orange">Contact Us</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3"><span className="w-9 h-9 shrink-0 rounded-md bg-white/5 flex items-center justify-center"><MapPinIcon className="w-5 h-5 text-brand-orange" /></span><span className="leading-relaxed">{address}</span></li>
              <li className="flex gap-3 items-center"><span className="w-9 h-9 shrink-0 rounded-md bg-white/5 flex items-center justify-center"><PhoneIcon className="w-5 h-5 text-brand-orange" /></span><a href={phoneHref} className="text-white font-semibold hover:text-brand-orange">{phone}</a></li>
              <li className="flex gap-3 items-center"><span className="w-9 h-9 shrink-0 rounded-md bg-white/5 flex items-center justify-center"><EnvelopeIcon className="w-5 h-5 text-brand-orange" /></span><a href={`mailto:${email}`} className="text-white hover:text-brand-orange break-all">{email}</a></li>
              <li className="flex gap-3 items-center"><span className="w-9 h-9 shrink-0 rounded-md bg-white/5 flex items-center justify-center"><ClockIcon className="w-5 h-5 text-brand-orange" /></span><span>Open 24x7 — All days</span></li>
            </ul>
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 bg-[#25d366] text-white font-heading font-semibold px-5 py-3 rounded-sm hover:opacity-90 transition"><WhatsAppIcon className="w-5 h-5" /> Chat on WhatsApp</a>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-[1320px] mx-auto px-4 pt-6 text-sm text-gray-400 flex flex-col md:flex-row justify-between items-center gap-3 text-center md:text-left">
            <p>&copy; {new Date().getFullYear()} {company.name || "Elehome Solutions PVT. LTD."} — All Rights Reserved.</p>
            <p>Designed by <span className="text-white font-semibold">QROLOGIC SOFTECH AND RESEARCH PRIVATE LIMITED</span></p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25d366] text-white flex items-center justify-center shadow-xl hover:scale-110 transition"><WhatsAppIcon className="w-8 h-8" /></a>
      <a href={phoneHref} aria-label="Call now" className="md:hidden fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-brand-orange text-white flex items-center justify-center shadow-xl"><PhoneIcon className="w-7 h-7" /></a>
      <a href="#home" aria-label="Back to top" className="hidden md:flex fixed bottom-24 right-6 z-50 w-11 h-11 rounded-full bg-brand-navy text-white items-center justify-center shadow-lg hover:bg-brand-orange transition"><ArrowUpIcon className="w-5 h-5" /></a>
    </main>
  );
}
