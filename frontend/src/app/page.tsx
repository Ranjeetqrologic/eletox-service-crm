"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import Logo from "@/components/Logo";
import toast from "react-hot-toast";

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
  { image: `${A}/hero-1.jpg`, title: "Elehome Provide Quality Repair Service", subtitle: "On your fingertips you have been cooling switch" },
  { image: `${A}/hero-2.jpg`, title: "Elehome Provide Quality Repair Service", subtitle: "On your fingertips you have been cooling switch" },
];

const facts = [
  { value: "15", l1: "Member", l2: "Professional", icon: `${A}/icon-fact-1.png` },
  { value: "1000+", l1: "Project", l2: "Completed", icon: `${A}/icon-fact-2.png` },
  { value: "02", l1: "Total", l2: "Branches", icon: `${A}/icon-fact-3.png` },
  { value: "5000+", l1: "Client", l2: "Satisfaction", icon: `${A}/icon-fact-4.png` },
];

const team = [
  { name: "Demica Master", role: "Technician", image: `${A}/team-1.jpg` },
  { name: "Margie Burman", role: "Senior Technician", image: `${A}/team-2.jpg` },
  { name: "Gorrien Hyrick", role: "Founder Of Pixa", image: `${A}/team-3.jpg` },
  { name: "Jonson Pierce", role: "Support Engineer", image: `${A}/team-4.jpg` },
];

const whyChoose = [
  { title: "Expert Repairman", desc: "Certified and experienced technicians who diagnose the problem right the first time and repair it with genuine parts." },
  { title: "Satisfied Services", desc: "Transparent pricing, same-day visit and service warranty — that is why 5000+ clients in Jaipur trust Elehome." },
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
    service: "", acType: "", preferredDate: "", preferredTime: "", problem: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/services/public").then((res) => setServices(res.data.data || [])).catch(() => setServices([]));
    api.get("/settings/company").then((res) => setCompany(res.data.data || {})).catch(() => setCompany({}));
    api.get("/banners/public").then((res) => setBanners(res.data.data || [])).catch(() => setBanners([]));
    api.get("/gallery/public").then((res) => setGallery(res.data.data || [])).catch(() => setGallery([]));
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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/leads/public-inquiry", form);
      toast.success(data.message || "Inquiry submitted successfully");
      setForm({ customerName: "", mobile: "", email: "", address: "", city: "Jaipur", pin: "", service: "", acType: "", preferredDate: "", preferredTime: "", problem: "" });
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
            <span className="flex items-center gap-2"><span className="text-brand-orange">◔</span>24x7 Services</span>
            <span className="flex items-center gap-2"><span className="text-brand-orange">⌖</span>Jaipur</span>
            <a href={`mailto:${email}`} className="flex items-center gap-2 hover:text-brand-orange"><span className="text-brand-orange">✉</span>{email}</a>
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
              <span>☏</span> Call Now
            </a>
            <Link href="/login" className="hidden md:inline-flex border border-brand-navy text-brand-navy font-heading font-semibold px-4 py-3 rounded-sm hover:bg-brand-navy hover:text-white transition">Login</Link>
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden text-brand-navy text-3xl leading-none px-2" aria-label="Menu">☰</button>
          </div>
        </div>
        {menuOpen && (
          <div className="lg:hidden border-t bg-white px-4 py-4 flex flex-col gap-3 font-heading font-semibold uppercase text-brand-dark">
            {navLinks.map((n) => <a key={n.label} href={n.href} onClick={() => setMenuOpen(false)}>{n.label}</a>)}
            <a href={phoneHref} className="text-brand-orange">Call Now: {phone}</a>
            <Link href="/login">Login</Link>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative min-h-[520px] md:min-h-[720px] flex items-center overflow-hidden">
        {slides.map((s, i) => (
          <div key={i} className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${i === activeBanner % slides.length ? "opacity-100" : "opacity-0"}`} style={{ backgroundImage: `url('${s.image}')` }} />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/30 to-transparent" />
        <div className="max-w-[1320px] mx-auto px-4 relative w-full py-20">
          <div className="max-w-2xl text-white">
            <span className="inline-flex items-center gap-2 font-heading font-semibold uppercase text-brand-orange tracking-wide">
              <img src={`${A}/icon-subtitle.png`} alt="" className="w-5 h-5" /> Residential &amp; Commercial
            </span>
            <h1 className="font-heading font-bold text-4xl md:text-[64px] leading-[1.1] mt-4 mb-5">{slide.title}</h1>
            <p className="text-lg md:text-xl mb-8 text-white/90">{slide.subtitle}</p>
            <div className="flex flex-wrap gap-4">
              <a href={slide.link || "#estimate"} className="bg-brand-navy text-white font-heading font-semibold px-8 py-4 rounded-sm hover:bg-brand-orange transition">{slide.button || "Appointment Now"}</a>
              <a href={phoneHref} className="bg-brand-orange text-white font-heading font-semibold px-8 py-4 rounded-sm hover:bg-brand-navy transition">Call Now</a>
            </div>
          </div>
        </div>
        {slides.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setActiveBanner(i)} className={`w-3 h-3 rounded-full ${i === activeBanner % slides.length ? "bg-brand-orange" : "bg-white/50"}`} aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
        )}
      </section>

      {/* Residential / Commercial tabs */}
      <section className="relative z-10 -mt-14 md:-mt-[60px] mb-16">
        <div className="max-w-[1320px] mx-auto px-4">
          <div className="grid md:grid-cols-2 shadow-xl">
            {(["residential", "commercial"] as const).map((t) => (
              <a key={t} href="#services" className={`flex items-center justify-between gap-6 px-12 py-10 md:py-12 text-white ${t === "residential" ? "bg-brand-orange" : "bg-brand-navy"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-5xl opacity-70 leading-none">{t === "residential" ? "⌂" : "▦"}</span>
                  <h3 className="font-heading font-semibold text-2xl md:text-[32px] leading-tight max-w-[280px]">{t === "residential" ? "Residential Repair Service" : "Commercial Repair Service"}</h3>
                </div>
                <span className="w-16 h-16 shrink-0 rounded-full border border-white/40 flex items-center justify-center text-2xl">→</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-brand-light">
        <div className="max-w-[1320px] mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <SectionTitle sub="Featured Services" title="Popular repair service" />
            <a href="#estimate" className="self-start md:self-auto bg-brand-orange text-white font-heading font-semibold px-7 py-3.5 rounded-sm hover:bg-brand-navy transition">More Service</a>
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
      <section id="about" className="py-24">
        <div className="max-w-[1320px] mx-auto px-4 grid lg:grid-cols-2 gap-14 items-center">
          <div className="relative pb-16 pr-10">
            <img src={`${A}/about-1.jpg`} alt="About Elehome" className="w-full h-[420px] object-cover" />
            <img src={`${A}/about-2.jpg`} alt="Technician" className="absolute bottom-0 right-0 w-[55%] h-64 object-cover border-8 border-white shadow-xl" />
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
              <span className="w-10 h-10 rounded-full bg-brand-orange/15 text-brand-orange flex items-center justify-center">❄</span>
              Don&apos;t feel heat when there is best air conditioning seat
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <a href="#estimate" className="bg-brand-orange text-white font-heading font-semibold px-8 py-4 rounded-sm hover:bg-brand-navy transition">Read More</a>
              <a href={phoneHref} className="flex items-center gap-3 font-heading">
                <img src={`${A}/icon-cta.png`} alt="" className="w-10 h-10 object-contain" />
                <span><span className="block text-xs text-gray-500">Call Us Anytime</span><span className="font-bold text-brand-dark">{phone}</span></span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Facts */}
      <section className="bg-brand-navy py-16 text-white">
        <div className="max-w-[1320px] mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {facts.map((f) => (
            <div key={f.l2} className="flex items-center gap-5">
              <img src={f.icon} alt="" className="w-16 h-16 object-contain" />
              <div>
                <div className="font-heading font-bold text-4xl md:text-5xl leading-none">{f.value}</div>
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
      <section id="estimate" className="py-24 bg-white">
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
      <section className="relative py-24 bg-cover bg-center" style={{ backgroundImage: `url('${A}/choose-bg.jpg')` }}>
        <div className="absolute inset-0 bg-white/90 lg:bg-gradient-to-r lg:from-white lg:via-white/95 lg:to-white/40" />
        <div className="max-w-[1320px] mx-auto px-4 relative grid lg:grid-cols-2 gap-12">
          <div>
            <SectionTitle sub="Why Choose Us" title="Empower lifes forever better living" />
            <p className="mt-6 text-gray-600">Elehome combines skilled technicians, genuine parts and honest pricing so every repair lasts longer and every customer stays cool.</p>
            <div className="mt-10 space-y-8">
              {whyChoose.map((w) => (
                <div key={w.title} className="flex gap-5">
                  <div className="w-16 h-16 shrink-0 rounded-full bg-brand-orange text-white flex items-center justify-center text-2xl font-bold">✔</div>
                  <div>
                    <h4 className="font-heading font-bold text-2xl text-brand-dark mb-2">{w.title}</h4>
                    <p className="text-gray-600">{w.desc}</p>
                  </div>
                </div>
              ))}
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
                  <a href="#estimate" className="font-heading font-semibold text-brand-navy text-sm">Read More →</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-orange">
        <div className="max-w-[1320px] mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-white">
          <h3 className="font-heading font-bold text-3xl md:text-4xl">Let&apos;s started with Eletox</h3>
          <a href={phoneHref} className="bg-white text-brand-navy font-heading font-bold px-8 py-4 rounded-sm hover:bg-brand-navy hover:text-white transition">Call Now {phone}</a>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-brand-dark text-gray-300 pt-16 pb-6">
        <div className="max-w-[1320px] mx-auto px-4 grid md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div>
            <h4 className="text-white font-heading font-bold text-xl mb-5">About Us</h4>
            <p className="text-sm text-gray-400">{company.name || "Elehome Solutions PVT. LTD."} — quality AC, appliance and electrical repair service in Jaipur. 24x7 support, same-day visit and transparent pricing.</p>
            <div className="mt-5 flex gap-3">
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#25d366] text-white flex items-center justify-center font-bold">W</a>
              <a href={phoneHref} className="w-10 h-10 rounded-full bg-brand-orange text-white flex items-center justify-center">☏</a>
              <a href={`mailto:${email}`} className="w-10 h-10 rounded-full bg-[#4170b7] text-white flex items-center justify-center">✉</a>
            </div>
          </div>
          <div>
            <h4 className="text-white font-heading font-bold text-xl mb-5">Services</h4>
            <ul className="space-y-2 text-sm">
              {navLinks.map((n) => <li key={n.label}><a href={n.href} className="hover:text-brand-orange transition">{n.label}</a></li>)}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-heading font-bold text-xl mb-5">Contact Info</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2"><span className="text-brand-orange">⌖</span><span>{address}</span></li>
              <li><span className="text-gray-400">Support:</span> <a href={phoneHref} className="text-white hover:text-brand-orange">{phone}</a></li>
              <li><span className="text-gray-400">Email:</span> <a href={`mailto:${email}`} className="text-white hover:text-brand-orange">{email}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-heading font-bold text-xl mb-5">Newsletter</h4>
            <p className="text-sm text-gray-400 mb-4">Get every week update from Eletox</p>
            <form onSubmit={(e) => { e.preventDefault(); toast.success("Subscribed!"); }} className="flex">
              <input type="email" placeholder="Email address" className="flex-1 p-3 text-gray-800 outline-none" required />
              <button type="submit" className="bg-brand-orange text-white font-heading font-semibold px-4">Subscribe Now</button>
            </form>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 text-center text-sm text-gray-400 flex flex-col md:flex-row justify-between max-w-[1320px] mx-auto px-4 gap-2">
          <p>&copy; {new Date().getFullYear()} ELEHOME SOLUTIONS PVT LTD - All Rights Reserved. Designed by QROLOGIC SOFTECH AND RESEARCH PRIVATE LIMITED</p>
          <p><a href="#" className="hover:text-white">Privacy Policy</a> | <a href="#" className="hover:text-white">Terms &amp; Conditions</a> | <Link href="/login" className="hover:text-white">Admin Login</Link></p>
        </div>
      </footer>

      {/* Floating WhatsApp */}
      <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25d366] text-white flex items-center justify-center shadow-xl text-2xl font-bold hover:scale-110 transition">W</a>
    </main>
  );
}
