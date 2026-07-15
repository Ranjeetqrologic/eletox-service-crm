"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import Logo from "@/components/Logo";

function ServiceContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }
    api.get(`/services/public/${slug}`)
      .then((res) => setService(res.data.data))
      .catch(() => setService(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (!slug) return <div className="p-10 text-center">Please select a service. <Link href="/" className="text-primary-600 underline">Go home</Link></div>;
  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!service) return <div className="p-10 text-center">Service not found. <Link href="/" className="text-primary-600 underline">Go home</Link></div>;

  return (
    <>
      <section className="py-16 max-w-4xl mx-auto px-4">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-accent-500 text-white rounded-full flex items-center justify-center mb-6 text-4xl mx-auto">❄</div>
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">{service.title}</h1>
        <p className="text-center text-gray-600 text-lg mb-8">{service.shortDesc}</p>
        {service.price ? <p className="text-center text-2xl font-bold text-primary-600 mb-8">Starting at ₹{service.price}</p> : null}
        <div className="bg-gray-50 p-8 rounded-2xl border text-gray-700 leading-relaxed whitespace-pre-line">
          {service.description}
        </div>
        <div className="text-center mt-10">
          <Link href="/#book" className="bg-primary-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-700 transition">Book This Service</Link>
        </div>
      </section>
    </>
  );
}

export default function ServicePage() {
  return (
    <main className="min-h-screen bg-white text-gray-800">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/"><Logo /></Link>
          <Link href="/" className="text-primary-600 font-medium">← Back Home</Link>
        </div>
      </header>

      <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
        <ServiceContent />
      </Suspense>

      <footer className="bg-gray-950 text-gray-400 py-6 text-center text-sm">
        <p>&copy; 2026 Eletox AC Services. All rights reserved.</p>
      </footer>
    </main>
  );
}
