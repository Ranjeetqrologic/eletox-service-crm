"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import toast from "react-hot-toast";

const services = [
  { title: "AC Repair", desc: "Quick diagnosis and repair for all AC brands." },
  { title: "AC Installation", desc: "Safe and professional installation at your home or office." },
  { title: "AC Gas Filling", desc: "Genuine refrigerant refill with leak detection." },
  { title: "AC Maintenance", desc: "Regular servicing to keep your AC running efficiently." },
  { title: "AMC Plans", desc: "Affordable annual maintenance contracts." },
  { title: "Commercial AC", desc: "Heavy-duty solutions for shops, offices and malls." },
  { title: "Split AC Repair", desc: "Indoor and outdoor unit service for split ACs." },
  { title: "Window AC Repair", desc: "Expert window AC repair and installation." },
];

const steps = [
  { title: "Book Online", desc: "Fill the service form or call us." },
  { title: "Get Confirmed", desc: "We assign a verified technician quickly." },
  { title: "Service Done", desc: "Technician visits, repairs and gives a bill." },
];

export default function Home() {
  const [form, setForm] = useState({
    customerName: "",
    mobile: "",
    email: "",
    address: "",
    city: "",
    pin: "",
    service: "",
    acType: "",
    preferredDate: "",
    preferredTime: "",
    problem: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post("/leads/public-inquiry", form);
      toast.success(data.message || "Inquiry submitted successfully");
      setForm({
        customerName: "", mobile: "", email: "", address: "", city: "", pin: "",
        service: "", acType: "", preferredDate: "", preferredTime: "", problem: "",
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-white text-gray-800">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary-600 text-white w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xl">E</div>
            <h1 className="text-2xl font-bold text-primary-700">Eletox</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="md:hidden text-primary-600 font-medium text-sm border border-primary-600 px-3 py-1 rounded-lg">Login</Link>
            <nav className="hidden md:flex gap-6 text-sm font-medium">
              <a href="#services" className="hover:text-primary-600">Services</a>
              <a href="#how" className="hover:text-primary-600">How it Works</a>
              <a href="#book" className="hover:text-primary-600">Book Now</a>
              <a href="#contact" className="hover:text-primary-600">Contact</a>
              <Link href="/login" className="text-primary-600 hover:underline">Login</Link>
            </nav>
          </div>
        </div>
      </header>

      <section className="relative bg-gradient-to-br from-primary-700 to-primary-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="max-w-7xl mx-auto px-4 relative text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">Fast & Reliable AC Services at Your Doorstep</h2>
          <p className="text-lg md:text-2xl mb-10 max-w-2xl mx-auto opacity-90">Repair, Installation, Gas Filling & Maintenance by verified technicians.</p>
          <div className="flex justify-center gap-4">
            <a href="#book" className="bg-white text-primary-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition shadow-lg">Book Now</a>
            <a href="tel:+919999999999" className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition">Call Us</a>
          </div>
        </div>
      </section>

      <section id="services" className="py-20 max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Our Services</h3>
          <p className="text-gray-600 max-w-xl mx-auto">Comprehensive air conditioning solutions for homes and businesses.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s) => (
            <div key={s.title} className="bg-white border rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition shadow-sm">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4 text-2xl">❄</div>
              <h4 className="text-lg font-bold mb-2">{s.title}</h4>
              <p className="text-sm text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-14">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">How It Works</h3>
            <p className="text-gray-600">Get your AC fixed in 3 simple steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.title} className="text-center bg-white p-8 rounded-xl shadow-sm">
                <div className="w-14 h-14 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">{i + 1}</div>
                <h4 className="text-xl font-bold mb-2">{s.title}</h4>
                <p className="text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="book" className="py-20 max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Book a Service</h3>
            <p className="text-gray-600 mb-8">Fill in your details and our team will contact you shortly to confirm the appointment.</p>
            <div className="bg-primary-50 border-l-4 border-primary-600 p-6 rounded-r-lg">
              <p className="font-semibold text-primary-800">Why book with Eletox?</p>
              <ul className="mt-2 text-sm text-primary-700 space-y-1">
                <li>✓ Verified technicians</li>
                <li>✓ Transparent pricing</li>
                <li>✓ Same-day service available</li>
                <li>✓ Warranty on repairs</li>
              </ul>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg border space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input name="customerName" value={form.customerName} onChange={handleChange} placeholder="Full Name" className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-primary-500 outline-none" required />
              <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="Mobile Number" className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-primary-500 outline-none" required />
              <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-primary-500 outline-none" />
              <input name="city" value={form.city} onChange={handleChange} placeholder="City" className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-primary-500 outline-none" required />
              <input name="pin" value={form.pin} onChange={handleChange} placeholder="Pin Code" className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-primary-500 outline-none" />
              <select name="service" value={form.service} onChange={handleChange} className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-primary-500 outline-none" required>
                <option value="">Select Service</option>
                {services.map((s) => <option key={s.title} value={s.title}>{s.title}</option>)}
              </select>
              <select name="acType" value={form.acType} onChange={handleChange} className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="">AC Type</option>
                <option>Split</option>
                <option>Window</option>
                <option>Cassette</option>
                <option>Duct</option>
                <option>VRV</option>
              </select>
              <input type="date" name="preferredDate" value={form.preferredDate} onChange={handleChange} className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-primary-500 outline-none" />
              <input type="time" name="preferredTime" value={form.preferredTime} onChange={handleChange} className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <textarea name="address" value={form.address} onChange={handleChange} placeholder="Full Address" className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-primary-500 outline-none" required />
            <textarea name="problem" value={form.problem} onChange={handleChange} placeholder="Problem Description" className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-primary-500 outline-none" />
            <button type="submit" disabled={loading} className="bg-primary-600 text-white px-6 py-3 rounded-lg w-full font-semibold hover:bg-primary-700 disabled:opacity-50 transition">
              {loading ? "Submitting..." : "Submit Inquiry"}
            </button>
          </form>
        </div>
      </section>

      <section id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-6">Contact Us</h3>
          <p className="text-lg mb-2">Phone: +91-99999-99999</p>
          <p className="text-lg mb-2">WhatsApp: +91-99999-99999</p>
          <p className="text-lg mb-2">Email: info@eletox.com</p>
          <p className="text-lg">123 Main Road, New Delhi</p>
        </div>
      </section>

      <footer className="bg-gray-950 text-gray-400 py-6 text-center text-sm">
        <p>&copy; 2026 Eletox AC Services. All rights reserved.</p>
      </footer>
    </main>
  );
}
