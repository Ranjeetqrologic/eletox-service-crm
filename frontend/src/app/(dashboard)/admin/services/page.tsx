"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import toast from "react-hot-toast";
import { CONTENT, GENERIC } from "@/lib/serviceContent";
import { packagesFor } from "@/lib/packages";

type Pkg = { name: string; price: string; gst?: string; desc?: string; img?: string };
type Faq = { q: string; a: string };

const emptyForm = () => ({
  title: "", slug: "", shortDesc: "", description: "", image: "", price: "", order: 0, isActive: true, visitCharge: "",
  heroImage: "", intro: "", includes: "", problems: "", brands: "", faqs: [] as Faq[], packages: [] as Pkg[],
});

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [form, setForm] = useState<any>(emptyForm());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState("");
  const [uploadingPkg, setUploadingPkg] = useState<number | null>(null);
  const filteredServices = services.filter((s) => (!search || [s.title, s.slug, s.shortDesc].some((x: string) => x?.toLowerCase().includes(search.toLowerCase()))) && (!filterActive || (filterActive === "active" ? s.isActive : !s.isActive)));

  const fetchServices = () => api.get("/services").then((res) => setServices(res.data.data || []));
  useEffect(() => { fetchServices(); }, []);

  const uploadImage = async (file: File) => {
    const data = new FormData();
    data.append("image", file);
    const res = await api.post("/services/upload-image", data, { headers: { "Content-Type": "multipart/form-data" } });
    return res.data.url as string;
  };

  const startEdit = (s: any) => {
    const fb = CONTENT[s.slug] ?? GENERIC;
    const c = s.content || {};
    const pk: Pkg[] = s.packages?.length ? s.packages : packagesFor(s.slug);
    setForm({
      title: s.title, slug: s.slug, shortDesc: s.shortDesc || "", description: s.description || "", image: s.image || "",
      price: s.price ?? "", order: s.order ?? 0, isActive: s.isActive !== false, visitCharge: s.visitCharge ?? "",
      heroImage: c.image || "",
      intro: c.intro || fb.intro,
      includes: (c.includes?.length ? c.includes : fb.includes).join("\n"),
      problems: (c.problems?.length ? c.problems : fb.problems).join("\n"),
      brands: c.brands ?? fb.brands ?? "",
      faqs: (c.faqs?.length ? c.faqs : fb.faqs).map((f: Faq) => ({ ...f })),
      packages: pk.map((p) => ({ ...p })),
    });
    setEditing(s._id);
    setImageFile(null);
    setHeroFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => { setForm(emptyForm()); setImageFile(null); setHeroFile(null); setEditing(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let heroImage = form.heroImage;
      if (heroFile) heroImage = await uploadImage(heroFile);
      const lines = (t: string) => t.split("\n").map((x) => x.trim()).filter(Boolean);
      const content = {
        image: heroImage || "",
        intro: form.intro,
        includes: lines(form.includes),
        problems: lines(form.problems),
        brands: form.brands,
        faqs: form.faqs.filter((f: Faq) => f.q.trim()),
      };
      const data = new FormData();
      data.append("title", form.title);
      data.append("slug", form.slug);
      data.append("shortDesc", form.shortDesc);
      data.append("description", form.description || form.shortDesc);
      data.append("order", String(form.order ?? 0));
      data.append("isActive", String(form.isActive));
      data.append("visitCharge", form.visitCharge === "" ? "" : String(form.visitCharge));
      if (form.price) data.append("price", String(form.price));
      data.append("content", JSON.stringify(content));
      data.append("packages", JSON.stringify(form.packages.filter((p: Pkg) => p.name.trim())));
      if (imageFile) data.append("image", imageFile);

      if (editing) {
        await api.put(`/services/${editing}`, data, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Service page updated");
      } else {
        await api.post("/services", data, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Service created");
      }
      resetForm();
      fetchServices();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id: string) => {
    if (!confirm("Delete this service page?")) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success("Deleted");
      fetchServices();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const setPkg = (i: number, patch: Partial<Pkg>) => setForm({ ...form, packages: form.packages.map((p: Pkg, j: number) => (j === i ? { ...p, ...patch } : p)) });
  const setFaq = (i: number, patch: Partial<Faq>) => setForm({ ...form, faqs: form.faqs.map((f: Faq, j: number) => (j === i ? { ...f, ...patch } : f)) });
  const move = (arr: any[], i: number, d: number) => { const a = [...arr]; const j = i + d; if (j < 0 || j >= a.length) return a; [a[i], a[j]] = [a[j], a[i]]; return a; };

  const onPkgImage = async (i: number, file: File | null) => {
    if (!file) return;
    setUploadingPkg(i);
    try { setPkg(i, { img: await uploadImage(file) }); toast.success("Package image uploaded"); }
    catch (err: any) { toast.error(err.response?.data?.message || "Upload failed"); }
    finally { setUploadingPkg(null); }
  };

  const inp = "border p-2 rounded w-full";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold">Website Services / Pages</h1>
        <div className="flex flex-wrap gap-2">
          <input className="border p-2 rounded min-w-[200px]" placeholder="Search service..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="border p-2 rounded" value={filterActive} onChange={(e) => setFilterActive(e.target.value)}>
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {!showForm && <button onClick={() => { setForm(emptyForm()); setEditing(null); setShowForm(true); }} className="bg-primary-600 text-white px-4 py-2 rounded">+ New Service Page</button>}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">{editing ? `Edit: ${form.title}` : "New Service Page"}</h2>
            {editing && <a href={`/service/?slug=${form.slug}`} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">View page ↗</a>}
          </div>

          <section className="space-y-3">
            <h3 className="font-semibold text-gray-700 border-b pb-1">1. Basic (card on homepage + page title)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="text-sm">Title*<input className={inp} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
              <label className="text-sm">URL Slug*<input className={inp} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} required /></label>
              <label className="text-sm">Order<input className={inp} type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></label>
              <label className="text-sm">Status<select className={inp} value={String(form.isActive)} onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}><option value="true">Active (shown on website)</option><option value="false">Inactive (hidden)</option></select></label>
              <label className="text-sm">Visit Charge (₹) <span className="text-gray-400">(blank = 349)</span><input className={inp} type="number" value={form.visitCharge} onChange={(e) => setForm({ ...form, visitCharge: e.target.value })} /></label>
              <label className="text-sm">Icon / Card Image<input type="file" accept="image/*" className={inp} onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                {(imageFile || form.image) && <img src={imageFile ? URL.createObjectURL(imageFile) : getImageUrl(form.image)} alt="" className="w-14 h-14 object-contain rounded border mt-1 bg-gray-50" />}
              </label>
            </div>
            <label className="text-sm block">Short Description* (under title)<input className={inp} value={form.shortDesc} onChange={(e) => setForm({ ...form, shortDesc: e.target.value })} required /></label>
          </section>

          <section className="space-y-3">
            <h3 className="font-semibold text-gray-700 border-b pb-1">2. About this service</h3>
            <label className="text-sm block">Big Banner Image (about section)<input type="file" accept="image/*" className={inp} onChange={(e) => setHeroFile(e.target.files?.[0] || null)} />
              <img src={heroFile ? URL.createObjectURL(heroFile) : form.heroImage ? getImageUrl(form.heroImage) : (CONTENT[form.slug] ?? GENERIC).image} alt="" className="w-full max-w-md h-32 object-cover rounded border mt-1" />
            </label>
            <label className="text-sm block">Intro Paragraph<textarea className={inp} rows={4} value={form.intro} onChange={(e) => setForm({ ...form, intro: e.target.value })} /></label>
            <label className="text-sm block">Extra Description (optional)<textarea className={inp} rows={3} value={form.description === form.shortDesc ? "" : form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
            <label className="text-sm block">Brands we service<input className={inp} value={form.brands} onChange={(e) => setForm({ ...form, brands: e.target.value })} /></label>
            <div className="grid md:grid-cols-2 gap-4">
              <label className="text-sm block">What&apos;s included <span className="text-gray-400">(one per line)</span><textarea className={inp} rows={7} value={form.includes} onChange={(e) => setForm({ ...form, includes: e.target.value })} /></label>
              <label className="text-sm block">Common problems we fix <span className="text-gray-400">(one per line)</span><textarea className={inp} rows={7} value={form.problems} onChange={(e) => setForm({ ...form, problems: e.target.value })} /></label>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex justify-between items-center border-b pb-1">
              <h3 className="font-semibold text-gray-700">3. Rates &amp; Packages ({form.packages.length})</h3>
              <button type="button" onClick={() => setForm({ ...form, packages: [...form.packages, { name: "", price: "", gst: "18% GST", desc: "", img: "" }] })} className="text-sm bg-green-600 text-white px-3 py-1 rounded">+ Add Package</button>
            </div>
            {form.packages.length === 0 && <p className="text-sm text-gray-500">No packages — price list section will be hidden on the page.</p>}
            <div className="space-y-3">
              {form.packages.map((p: Pkg, i: number) => (
                <div key={i} className="border rounded-lg p-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-start bg-gray-50">
                  <div className="md:col-span-2">
                    <div className="w-20 h-20 rounded border bg-white flex items-center justify-center overflow-hidden">
                      {p.img ? <img src={getImageUrl(p.img)} alt="" className="w-full h-full object-cover" /> : <span className="text-xs text-gray-400">No image</span>}
                    </div>
                    <input type="file" accept="image/*" className="text-xs mt-1 w-20" onChange={(e) => onPkgImage(i, e.target.files?.[0] || null)} />
                    {uploadingPkg === i && <p className="text-xs text-blue-600">Uploading...</p>}
                  </div>
                  <div className="md:col-span-10 grid grid-cols-1 md:grid-cols-6 gap-2">
                    <input className={`${inp} md:col-span-3`} placeholder="Package name*" value={p.name} onChange={(e) => setPkg(i, { name: e.target.value })} />
                    <input className={`${inp} md:col-span-1`} placeholder="Price (499 / On Visit)" value={p.price} onChange={(e) => setPkg(i, { price: e.target.value })} />
                    <input className={`${inp} md:col-span-1`} placeholder="GST note" value={p.gst || ""} onChange={(e) => setPkg(i, { gst: e.target.value })} />
                    <div className="md:col-span-1 flex gap-1 justify-end">
                      <button type="button" onClick={() => setForm({ ...form, packages: move(form.packages, i, -1) })} className="px-2 border rounded bg-white" title="Move up">↑</button>
                      <button type="button" onClick={() => setForm({ ...form, packages: move(form.packages, i, 1) })} className="px-2 border rounded bg-white" title="Move down">↓</button>
                      <button type="button" onClick={() => setForm({ ...form, packages: form.packages.filter((_: Pkg, j: number) => j !== i) })} className="px-2 border rounded bg-white text-red-600" title="Remove">✕</button>
                    </div>
                    <textarea className={`${inp} md:col-span-6`} rows={2} placeholder="Description (optional)" value={p.desc || ""} onChange={(e) => setPkg(i, { desc: e.target.value })} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex justify-between items-center border-b pb-1">
              <h3 className="font-semibold text-gray-700">4. FAQs ({form.faqs.length})</h3>
              <button type="button" onClick={() => setForm({ ...form, faqs: [...form.faqs, { q: "", a: "" }] })} className="text-sm bg-green-600 text-white px-3 py-1 rounded">+ Add FAQ</button>
            </div>
            <div className="space-y-2">
              {form.faqs.map((f: Faq, i: number) => (
                <div key={i} className="border rounded-lg p-3 bg-gray-50 space-y-2">
                  <div className="flex gap-2">
                    <input className={inp} placeholder="Question" value={f.q} onChange={(e) => setFaq(i, { q: e.target.value })} />
                    <button type="button" onClick={() => setForm({ ...form, faqs: form.faqs.filter((_: Faq, j: number) => j !== i) })} className="px-2 border rounded bg-white text-red-600">✕</button>
                  </div>
                  <textarea className={inp} rows={2} placeholder="Answer" value={f.a} onChange={(e) => setFaq(i, { a: e.target.value })} />
                </div>
              ))}
            </div>
          </section>

          <div className="flex gap-2 sticky bottom-0 bg-white py-3 border-t">
            <button className="bg-primary-600 text-white px-5 py-2 rounded" disabled={loading}>{loading ? "Saving..." : editing ? "Save Page" : "Create Service Page"}</button>
            <button type="button" onClick={resetForm} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {filteredServices.map((s) => (
          <div key={s._id} className="bg-white p-4 rounded-xl shadow flex justify-between items-start gap-3">
            <div className="flex gap-3 min-w-0">
              {s.image && <img src={getImageUrl(s.image)} alt={s.title} className="w-14 h-14 object-contain rounded bg-gray-50 border shrink-0" />}
              <div className="min-w-0">
                <h3 className="font-bold">{s.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{s.shortDesc}</p>
                <p className="text-xs text-gray-400 mt-1">/service/?slug={s.slug} · {(s.packages?.length ? s.packages : packagesFor(s.slug)).length} packages · {s.isActive ? "Active" : "Inactive"}{s.content ? " · Custom content" : ""}</p>
              </div>
            </div>
            <div className="flex flex-col gap-1 shrink-0 text-sm">
              <button onClick={() => startEdit(s)} className="text-blue-600">Edit Page</button>
              <a href={`/service/?slug=${s.slug}`} target="_blank" rel="noreferrer" className="text-gray-600">View</a>
              <button onClick={() => deleteService(s._id)} className="text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
