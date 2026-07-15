"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import Logo from "@/components/Logo";
import toast from "react-hot-toast";

const stats = [
  { value: "15+", label: "Professional Members", sub: "Experts", icon: "/eletox-assets/icon-fact-1.png" },
  { value: "1000+", label: "Projects Completed", sub: "Done", icon: "/eletox-assets/icon-fact-2.png" },
  { value: "02", label: "Service Branches", sub: "Total", icon: "/eletox-assets/icon-fact-3.png" },
  { value: "5000+", label: "Happy Clients", sub: "Satisfaction", icon: "/eletox-assets/icon-fact-4.png" },
];

const whyChoose = [
  { title: "Expert Repairman", desc: "Certified technicians with years of hands-on experience." },
  { title: "Satisfied Services", desc: "Quality service backed by customer satisfaction guarantee." },
  { title: "Same Day Visit", desc: "We reach your doorstep on the same day of booking." },
  { title: "Transparent Pricing", desc: "No hidden charges. Fair and upfront repair costs." },
];

export default function Home() {
  const [services, setServices] = useState<any[]>([]);
  const [company, setCompany] = useState<any>({});
  const [banners, setBanners] = useState<any[]>([]);
  const [gallery, setGallery] = useState<any[]>([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const [form, setForm] = useState({
    customerName: "", mobile: "", email: "", address: "", city: "", pin: "",
    service: "", acType: "", preferredDate: "", preferredTime: "", problem: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/services/public").then((res) => setServices(res.data.data || [])).catch(() => setServices([]));
    api.get("/settings/company").then((res) => setCompany(res.data.data || {})).catch(() => setCompany({}));
    api.get("/banners/public").then((res) => setBanners(res.data.data || [])).catch(() => setBanners([]));
    api.get("/gallery/public").then((res) => setGallery(res.data.data || [])).catch(() => setGallery([]));
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => setActiveBanner((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/leads/public-inquiry", form);
      toast.success(data.message || "Inquiry submitted successfully");
      setForm({ customerName: "", mobile: "", email: "", address: "", city: "", pin: "", service: "", acType: "", preferredDate: "", preferredTime: "", problem: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  const phone = company.phone || "+91-99999-99999";

  return (
    <main className="min-h-screen bg-white text-gray-800">
      {/* Top bar */}
      <div className="bg-primary-900 text-white text-sm py-2">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-1">
          <p className="opacity-90">Fast & Reliable Repair Services at Your Doorstep</p>
          <div className="flex gap-4 opacity-90">
            <a href={`tel:${phone}`} className="hover:text-accent-400">{phone}</a>
            <span className="hidden md:inline">|</span>
            <a href={`mailto:${company.email || "info@eletox.com"}`} className="hover:text-accent-400">{company.email || "info@eletox.com"}</a>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Logo logoUrl={company.logo} />
          <div className="flex items-center gap-3">
            <Link href="/login" className="md:hidden text-primary-700 font-medium text-sm border border-primary-700 px-3 py-1 rounded">Login</Link>
            <nav className="hidden md:flex gap-6 text-sm font-medium items-center">
              <a href="#services" className="hover:text-primary-600">Services</a>
              <a href="#about" className="hover:text-primary-600">About</a>
              <a href="#gallery" className="hover:text-primary-600">Gallery</a>
              <a href="#book" className="hover:text-primary-600">Free Estimate</a>
              <a href="#contact" className="hover:text-primary-600">Contact</a>
              <Link href="/login" className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">Login</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero / Slider */}
      <section className="relative bg-primary-900 text-white overflow-hidden min-h-[500px] md:min-h-[600px] flex items-center">
        <div className="absolute inset-0 bg-cover bg-center opacity-40 transition-all duration-700" style={{ backgroundImage: `url('${getImageUrl(banners[activeBanner]?.image) || "/eletox-assets/hero-1.jpg"}')` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/95 to-primary-900/60" />
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28 relative grid md:grid-cols-2 gap-12 items-center w-full">
          <div>
            <h3 className="text-accent-400 font-semibold mb-2">{banners[activeBanner]?.title || "Residential Repair Service"}</h3>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">{banners[activeBanner]?.subtitle || "On your fingertips you have been cooling switch"}</h1>
            <p className="text-lg md:text-xl mb-8 opacity-90 max-w-lg">Expert AC & home appliance repair services. Book now and get a verified technician at your doorstep.</p>
            <div className="flex flex-wrap gap-4">
              <a href={banners[activeBanner]?.buttonLink || "#book"} className="bg-accent-500 text-white px-8 py-3 rounded font-semibold hover:bg-accent-600 transition shadow-lg">{banners[activeBanner]?.buttonText || "Get Free Estimate"}</a>
              <a href={`tel:${phone}`} className="border-2 border-white text-white px-8 py-3 rounded font-semibold hover:bg-white/10 transition">Call Now</a>
            </div>
            {banners.length > 1 && (
              <div className="flex gap-2 mt-8">
                {banners.map((_, i) => (
                  <button key={i} onClick={() => setActiveBanner(i)} className={`w-3 h-3 rounded-full ${i === activeBanner ? "bg-accent-400" : "bg-white/40"}`} />
                ))}
              </div>
            )}
          </div>
          <div className="relative hidden md:block">
            <img src="/eletox-assets/hero-2.jpg" alt="Eletox AC Service" className="rounded-2xl shadow-2xl border-4 border-white/10" />
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h3 className="text-accent-500 font-semibold mb-2">What We Offer</h3>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Popular Repair Services</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.length ? services.map((s) => (
              <Link key={s._id} href={`/service/?slug=${s.slug}`} className="bg-white rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition shadow-sm group border-b-4 border-primary-600">
                <div className="w-16 h-16 mb-4 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  {s.image ? <img src={getImageUrl(s.image)} alt={s.title} className="w-full h-full object-cover" /> : <span className="text-3xl">❄</span>}
                </div>
                <h4 className="text-lg font-bold mb-2 group-hover:text-primary-600">{s.title}</h4>
                <p className="text-sm text-gray-600">{s.shortDesc}</p>
              </Link>
            )) : (
              ["AC Repair & Service", "AC Installation", "AC Gas Filling", "AC Maintenance", "Washing Machine Repair", "Microwave Repair", "Geyser Repair", "Water Purifier Repair"].map((t) => (
                <div key={t} className="bg-white rounded-xl p-6 shadow-sm border-b-4 border-primary-600">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-600 to-accent-500 text-white rounded-lg flex items-center justify-center mb-4 text-2xl">❄</div>
                  <h4 className="text-lg font-bold mb-2">{t}</h4>
                  <p className="text-sm text-gray-600">Professional repair service at your doorstep.</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center">
              <img src={getImageUrl(s.icon)} alt={s.label} className="w-14 h-14 mb-3 object-contain" />
              <div className="text-4xl md:text-5xl font-bold text-accent-400">{s.value}</div>
              <div className="text-sm opacity-80 mt-1">{s.label}</div>
              <div className="text-xs opacity-60">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <img src="/eletox-assets/about-1.jpg" alt="About Eletox" className="rounded-2xl shadow-lg w-full" />
            <img src="/eletox-assets/about-2.jpg" alt="Eletox Technician" className="absolute -bottom-6 -right-6 w-1/2 rounded-xl border-4 border-white shadow-lg hidden md:block" />
          </div>
          <div>
            <h3 className="text-accent-500 font-semibold mb-2">About Us</h3>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Empower lifes forever better living</h2>
            <p className="text-gray-600 mb-6">{company.name || "Eletox AC Services"} offers top-quality repair services for AC and home appliances. We believe in fast, reliable and transparent service for every customer.</p>
            <a href="#book" className="bg-primary-600 text-white px-6 py-3 rounded font-semibold hover:bg-primary-700 transition">Book a Service</a>
          </div>
        </div>
      </section>

      {/* Gallery */}
      {gallery.length > 0 && (
        <section id="gallery" className="py-20 max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h3 className="text-accent-500 font-semibold mb-2">Our Work</h3>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Service Gallery</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {gallery.map((g) => (
              <div key={g._id} className="rounded-xl overflow-hidden shadow-md group">
                <img src={getImageUrl(g.image)} alt={g.title} className="w-full h-56 object-cover group-hover:scale-105 transition duration-500" />
                {g.title && <div className="p-3 bg-white text-center font-medium text-sm">{g.title}</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Why Choose */}
      <section className="relative py-24 bg-cover bg-center" style={{ backgroundImage: "url('/eletox-assets/choose-bg.jpg')" }}>
        <div className="absolute inset-0 bg-primary-900/85" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-14">
            <h3 className="text-accent-400 font-semibold mb-2">Why Choose Us</h3>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Let&apos;s started with Eletox</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChoose.map((w) => (
              <div key={w.title} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4 text-xl">✓</div>
                <h4 className="font-bold text-lg mb-2">{w.title}</h4>
                <p className="text-sm text-gray-600">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Book / Free Estimate */}
      <section id="book" className="py-20 max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h3 className="text-accent-500 font-semibold mb-2">Appointment</h3>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Free Estimate</h2>
            <p className="text-gray-600 mb-8">Fill the form and our team will contact you shortly to confirm the appointment.</p>
            <div className="bg-primary-50 border-l-4 border-primary-600 p-6 rounded-r-lg mb-6">
              <p className="font-semibold text-primary-800">Why Eletox?</p>
              <ul className="mt-2 text-sm text-primary-700 space-y-1">
                <li>✓ Verified technicians</li>
                <li>✓ Transparent pricing</li>
                <li>✓ Same-day service available</li>
                <li>✓ Warranty on repairs</li>
              </ul>
            </div>
            <img src="/eletox-assets/contact.png" alt="Contact" className="w-48 h-auto object-contain" />
          </div>
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input name="customerName" value={form.customerName} onChange={handleChange} placeholder="Full Name" className="border p-3 rounded-lg w-full outline-none focus:border-primary-600" required />
              <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="Mobile Number" className="border p-3 rounded-lg w-full outline-none focus:border-primary-600" required />
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="border p-3 rounded-lg w-full outline-none focus:border-primary-600" />
              <input name="city" value={form.city} onChange={handleChange} placeholder="City" className="border p-3 rounded-lg w-full outline-none focus:border-primary-600" required />
              <input name="pin" value={form.pin} onChange={handleChange} placeholder="Pin Code" className="border p-3 rounded-lg w-full outline-none focus:border-primary-600" />
              <select name="service" value={form.service} onChange={handleChange} className="border p-3 rounded-lg w-full outline-none focus:border-primary-600" required>
                <option value="">Choose Service</option>
                {services.map((s) => <option key={s._id} value={s.title}>{s.title}</option>)}
              </select>
              <input type="date" name="preferredDate" value={form.preferredDate} onChange={handleChange} className="border p-3 rounded-lg w-full outline-none focus:border-primary-600" />
              <input type="time" name="preferredTime" value={form.preferredTime} onChange={handleChange} className="border p-3 rounded-lg w-full outline-none focus:border-primary-600" />
            </div>
            <textarea name="address" value={form.address} onChange={handleChange} placeholder="Full Address" className="border p-3 rounded-lg w-full outline-none focus:border-primary-600" required />
            <textarea name="problem" value={form.problem} onChange={handleChange} placeholder="Problem Description" className="border p-3 rounded-lg w-full outline-none focus:border-primary-600" />
            <button type="submit" disabled={loading} className="bg-primary-600 text-white px-6 py-3 rounded-lg w-full font-semibold hover:bg-primary-700 disabled:opacity-50 transition">
              {loading ? "Submitting..." : "Submit Inquiry"}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-gray-300 pt-16 pb-6">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <Logo className="mb-4" showText={false} height={70} logoUrl={company.logo} />
            <p className="text-sm opacity-80">{company.tagline || "Fast, reliable AC & appliance repair services at your doorstep."}</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">About Us</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#about" className="hover:text-accent-400">Our Story</a></li>
              <li><a href="#services" className="hover:text-accent-400">Services</a></li>
              <li><a href="#book" className="hover:text-accent-400">Book Now</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#services" className="hover:text-accent-400">AC Repair</a></li>
              <li><a href="#services" className="hover:text-accent-400">AC Installation</a></li>
              <li><a href="#services" className="hover:text-accent-400">Appliance Repair</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Contact Info</h4>
            <ul className="space-y-2 text-sm">
              <li>Phone: {phone}</li>
              <li>WhatsApp: {company.whatsapp || phone}</li>
              <li>Email: {company.email || "info@eletox.com"}</li>
              <li>{company.address || "123 Main Road, New Delhi"}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 text-center text-sm opacity-70">
          <p>&copy; 2026 {company.name || "Eletox AC Services"}. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
