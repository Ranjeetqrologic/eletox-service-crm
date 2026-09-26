"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, PhoneIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import Logo from "@/components/Logo";

const DEFAULT_PHONE = "+91 9571071342";

function ServiceContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const [service, setService] = useState<any>(null);
  const [others, setOthers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/services/public").then((res) => setOthers(res.data.data || [])).catch(() => setOthers([]));
  }, []);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    setLoading(true);
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

  return (
    <>
      <section className="bg-brand-navy text-white py-14">
        <div className="max-w-[1320px] mx-auto px-4">
          <p className="text-sm text-white/70 mb-3"><Link href="/" className="hover:text-white">Home</Link> / <Link href="/#services" className="hover:text-white">Services</Link> / <span className="text-white">{service.title}</span></p>
          <h1 className="font-heading font-bold text-4xl md:text-5xl">{service.title}</h1>
          {service.shortDesc && <p className="mt-4 text-lg text-white/85 max-w-3xl">{service.shortDesc}</p>}
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-[1320px] mx-auto px-4 grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="bg-brand-light rounded-xl p-8 flex items-center justify-center mb-8">
              {service.image ? <img src={getImageUrl(service.image)} alt={service.title} className="max-h-72 object-contain" /> : null}
            </div>
            <div className="text-gray-700 leading-relaxed whitespace-pre-line text-[17px]">{service.description || service.shortDesc}</div>
            <ul className="mt-8 grid sm:grid-cols-2 gap-3 text-sm text-gray-700">
              {["Certified & experienced technicians", "Genuine spare parts", "Same-day doorstep service", "Transparent pricing, no hidden charges"].map((t) => (
                <li key={t} className="flex items-start gap-2"><CheckCircleIcon className="w-5 h-5 text-brand-orange shrink-0" />{t}</li>
              ))}
            </ul>
          </div>
          <aside className="space-y-6">
            <div className="bg-brand-orange text-white p-7 rounded-xl shadow-lg">
              {service.price ? <p className="text-sm uppercase tracking-wide text-white/80">Starting at</p> : null}
              {service.price ? <p className="font-heading font-bold text-4xl mb-4">₹{service.price}</p> : <p className="font-heading font-bold text-2xl mb-4">Book this service</p>}
              <Link href="/#estimate" className="block text-center bg-brand-navy hover:bg-brand-dark transition text-white font-heading font-semibold py-3.5 rounded-sm">Appointment Now</Link>
              <a href={`tel:${DEFAULT_PHONE.replace(/[^+\d]/g, "")}`} className="mt-3 flex items-center justify-center gap-2 bg-white text-brand-navy font-heading font-semibold py-3.5 rounded-sm hover:bg-brand-light transition"><PhoneIcon className="w-5 h-5" /> {DEFAULT_PHONE}</a>
            </div>
            {others.length > 1 && (
              <div className="border rounded-xl p-6">
                <h3 className="font-heading font-bold text-lg text-brand-dark mb-4">Other Services</h3>
                <ul className="space-y-2 text-sm">
                  {others.filter((o) => o.slug !== slug).slice(0, 8).map((o) => (
                    <li key={o._id}><Link href={`/service/?slug=${o.slug}`} className="text-gray-700 hover:text-brand-orange transition">{o.title}</Link></li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>
    </>
  );
}

export default function ServicePage() {
  return (
    <main className="min-h-screen bg-white text-gray-800">
      <header className="bg-white shadow-[0_2px_20px_rgba(0,0,0,0.06)] sticky top-0 z-50">
        <div className="max-w-[1320px] mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/"><Logo height={62} /></Link>
          <Link href="/" className="inline-flex items-center gap-2 font-heading font-semibold text-brand-navy hover:text-brand-orange transition"><ArrowLeftIcon className="w-5 h-5" /> Back Home</Link>
        </div>
      </header>

      <Suspense fallback={<div className="py-24 text-center text-gray-500">Loading...</div>}>
        <ServiceContent />
      </Suspense>

      <footer className="bg-brand-dark text-gray-400 py-6 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} ELEHOME SOLUTIONS PVT LTD - All Rights Reserved. Designed by QROLOGIC SOFTECH AND RESEARCH PRIVATE LIMITED</p>
      </footer>
    </main>
  );
}
