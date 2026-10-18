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
import { CONTENT, GENERIC, type Content } from "@/lib/serviceContent";
import SocialLinks from "@/components/SocialLinks";

const A = "/eletox-assets";
const DEFAULT_PHONE = "+91 9571071342";
const DEFAULT_EMAIL = "eletox07@gmail.com";
const DEFAULT_ADDRESS = "Tilak Vihar, Gokulpura, near Gs Swimming Pool, Jhotwara, Jaipur, Rajasthan 302012";
const phoneHref = `tel:${DEFAULT_PHONE.replace(/[^+\d]/g, "")}`;
const waHref = `https://wa.me/${DEFAULT_PHONE.replace(/[^\d]/g, "")}`;

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

  const fallback = CONTENT[slug] ?? GENERIC;
  const sc = service.content || {};
  const c: Content = {
    image: sc.image || fallback.image,
    intro: sc.intro || fallback.intro,
    includes: sc.includes?.length ? sc.includes : fallback.includes,
    problems: sc.problems?.length ? sc.problems : fallback.problems,
    brands: sc.brands ?? fallback.brands,
    faqs: sc.faqs?.length ? sc.faqs : fallback.faqs,
  };
  const packages: any[] = ((service.packages?.length ? service.packages : packagesFor(slug)) as any[]).map((p: any) => ({ ...p, img: p.img ? getImageUrl(p.img) : p.img }));
  const visitCharge = service.visitCharge || VISIT_CHARGE;
  const bookHref = (pkg?: string) =>
    `/?service=${encodeURIComponent(service.title)}${pkg ? `&sub=${encodeURIComponent(pkg)}` : ""}#estimate`;
  const isIcon = !!service.image && /icon-/.test(service.image);
  const heroImg = sc.image ? getImageUrl(sc.image) : service.image && !isIcon ? getImageUrl(service.image) : c.image;

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
                  <p className="text-sm text-gray-500">Transparent pricing · 18% GST extra · Visit charge ₹{visitCharge} on every service · Spare parts charged separately</p>
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
              <p className="font-heading font-bold text-5xl mb-1">₹{visitCharge}</p>
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
