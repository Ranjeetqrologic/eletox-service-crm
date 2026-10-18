"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import toast from "react-hot-toast";
import { mergeSite, SITE_DEFAULTS, type SiteContent } from "@/lib/siteDefaults";

const inp = "border p-2 rounded w-full text-sm";

export default function WebsitePage() {
  const [site, setSite] = useState<SiteContent>(SITE_DEFAULTS);
  const [company, setCompany] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("about");

  useEffect(() => {
    api.get("/settings/company").then((res) => { setCompany(res.data.data || {}); setSite(mergeSite(res.data.data?.siteContent)); });
  }, []);

  const set = (patch: Partial<SiteContent>) => setSite({ ...site, ...patch });
  const setItem = <K extends keyof SiteContent>(key: K, i: number, patch: any) =>
    set({ [key]: (site[key] as any[]).map((x, j) => (j === i ? { ...x, ...patch } : x)) } as any);
  const addItem = <K extends keyof SiteContent>(key: K, item: any) => set({ [key]: [...(site[key] as any[]), item] } as any);
  const removeItem = <K extends keyof SiteContent>(key: K, i: number) => set({ [key]: (site[key] as any[]).filter((_, j) => j !== i) } as any);
  const moveItem = <K extends keyof SiteContent>(key: K, i: number, d: number) => {
    const a = [...(site[key] as any[])]; const j = i + d; if (j < 0 || j >= a.length) return; [a[i], a[j]] = [a[j], a[i]]; set({ [key]: a } as any);
  };

  const upload = async (file: File) => {
    const data = new FormData();
    data.append("image", file);
    const res = await api.post("/settings/upload-image", data, { headers: { "Content-Type": "multipart/form-data" } });
    return res.data.url as string;
  };

  const ImageField = ({ label, value, onChange, h = "h-28" }: { label: string; value: string; onChange: (u: string) => void; h?: string }) => {
    const [busy, setBusy] = useState(false);
    return (
      <div className="text-sm">
        <div className="font-medium mb-1">{label}</div>
        {value && <img src={getImageUrl(value) || value} alt="" className={`${h} w-full max-w-xs object-cover rounded border bg-gray-50 mb-1`} />}
        <input type="file" accept="image/*" className="text-xs" onChange={async (e) => {
          const f = e.target.files?.[0]; if (!f) return; setBusy(true);
          try { onChange(await upload(f)); toast.success("Image uploaded — click Save"); } catch (err: any) { toast.error(err.response?.data?.message || "Upload failed"); } finally { setBusy(false); }
        }} />
        {busy && <span className="text-xs text-blue-600 ml-2">Uploading...</span>}
      </div>
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      const data = new FormData();
      data.append("name", company.name || "Eletox AC Services");
      data.append("siteContent", JSON.stringify(site));
      const res = await api.put("/settings/company", data, { headers: { "Content-Type": "multipart/form-data" } });
      setCompany(res.data.data || company);
      toast.success("Website content saved — live now");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSaving(false);
    }
  };

  const resetSection = (keys: (keyof SiteContent)[]) => {
    if (!confirm("Reset this section to default content?")) return;
    const patch: any = {}; keys.forEach((k) => (patch[k] = SITE_DEFAULTS[k])); set(patch);
  };

  const tabs = [
    { id: "about", label: "About Us" },
    { id: "services", label: "Services Box" },
    { id: "facts", label: "Facts / Numbers" },
    { id: "team", label: "Team" },
    { id: "why", label: "Why Choose Us" },
    { id: "blog", label: "Blog" },
    { id: "contact", label: "Contact / Form" },
    { id: "footer", label: "CTA & Footer" },
  ];

  const T = ({ label, k, rows }: { label: string; k: keyof SiteContent; rows?: number }) => (
    <label className="block text-sm">{label}
      {rows ? <textarea className={inp} rows={rows} value={site[k] as string} onChange={(e) => set({ [k]: e.target.value } as any)} />
        : <input className={inp} value={site[k] as string} onChange={(e) => set({ [k]: e.target.value } as any)} />}
    </label>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Website Content</h1>
          <p className="text-sm text-gray-500">Homepage sections — text aur images yahan se badlein. Hero slider: Banners · Photos: Gallery · Service pages: Services · Contact/phone/logo: Settings.</p>
        </div>
        <div className="flex gap-2">
          <a href="/" target="_blank" rel="noreferrer" className="bg-gray-200 px-4 py-2 rounded text-sm">View Website ↗</a>
          <button onClick={save} disabled={saving} className="bg-primary-600 text-white px-5 py-2 rounded">{saving ? "Saving..." : "Save & Publish"}</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 text-sm rounded-t ${tab === t.id ? "bg-white border border-b-white font-semibold -mb-px" : "text-gray-600 hover:bg-gray-100"}`}>{t.label}</button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        {tab === "about" && (<>
          <div className="flex justify-between"><h2 className="font-semibold">About Us (#about)</h2><button onClick={() => resetSection(["aboutSub","aboutTitle","aboutText","aboutImage1","aboutImage2","aboutYears","aboutYearsText","aboutBadgeTitle","aboutBadgeSub","aboutFeatures"])} className="text-xs text-gray-500 hover:underline">Reset to default</button></div>
          <div className="grid md:grid-cols-2 gap-4">
            <T label="Small heading" k="aboutSub" />
            <T label="Main heading" k="aboutTitle" />
          </div>
          <T label="About paragraph" k="aboutText" rows={5} />
          <div className="grid md:grid-cols-2 gap-4">
            <ImageField label="Big image (left)" value={site.aboutImage1} onChange={(u) => set({ aboutImage1: u })} h="h-40" />
            <ImageField label="Small image (right)" value={site.aboutImage2} onChange={(u) => set({ aboutImage2: u })} />
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <T label="Years box (e.g. 10+)" k="aboutYears" />
            <T label="Years box text" k="aboutYearsText" />
            <T label="Badge title" k="aboutBadgeTitle" />
            <T label="Badge sub text" k="aboutBadgeSub" />
          </div>
          <div className="flex justify-between items-center"><h3 className="font-medium text-sm">Feature points ({site.aboutFeatures.length})</h3><button onClick={() => addItem("aboutFeatures", { t: "", d: "" })} className="text-sm bg-green-600 text-white px-3 py-1 rounded">+ Add</button></div>
          {site.aboutFeatures.map((f, i) => (
            <div key={i} className="grid md:grid-cols-[1fr_2fr_auto] gap-2 items-start bg-gray-50 p-2 rounded">
              <input className={inp} placeholder="Title" value={f.t} onChange={(e) => setItem("aboutFeatures", i, { t: e.target.value })} />
              <input className={inp} placeholder="Description" value={f.d} onChange={(e) => setItem("aboutFeatures", i, { d: e.target.value })} />
              <button onClick={() => removeItem("aboutFeatures", i)} className="text-red-600 px-2">✕</button>
            </div>
          ))}
        </>)}

        {tab === "services" && (<>
          <div className="flex justify-between"><h2 className="font-semibold">Services section (#services) — heading & right side box</h2><button onClick={() => resetSection(["servicesSub","servicesTitle","servicesBoxImage","servicesBoxBadge","servicesBoxSub","servicesBoxTitle","servicesBoxPoints"])} className="text-xs text-gray-500 hover:underline">Reset to default</button></div>
          <p className="text-xs text-gray-500">Service cards (icons, names) Admin → Services se manage hote hain.</p>
          <div className="grid md:grid-cols-2 gap-4"><T label="Small heading" k="servicesSub" /><T label="Main heading" k="servicesTitle" /></div>
          <ImageField label="Box background image" value={site.servicesBoxImage} onChange={(u) => set({ servicesBoxImage: u })} h="h-40" />
          <div className="grid md:grid-cols-3 gap-4"><T label="Badge (top-left)" k="servicesBoxBadge" /><T label="Box small heading" k="servicesBoxSub" /><T label="Box title" k="servicesBoxTitle" /></div>
          <label className="block text-sm">Points (one per line)<textarea className={inp} rows={4} value={site.servicesBoxPoints.join("\n")} onChange={(e) => set({ servicesBoxPoints: e.target.value.split("\n") })} /></label>
        </>)}

        {tab === "facts" && (<>
          <div className="flex justify-between"><h2 className="font-semibold">Facts / Numbers strip</h2><button onClick={() => resetSection(["facts"])} className="text-xs text-gray-500 hover:underline">Reset to default</button></div>
          <div className="flex justify-end"><button onClick={() => addItem("facts", { value: "", l1: "", l2: "", icon: SITE_DEFAULTS.facts[0].icon })} className="text-sm bg-green-600 text-white px-3 py-1 rounded">+ Add</button></div>
          {site.facts.map((f, i) => (
            <div key={i} className="grid md:grid-cols-[auto_1fr_1fr_1fr_auto] gap-3 items-center bg-gray-50 p-3 rounded">
              <ImageField label="Icon" value={f.icon} onChange={(u) => setItem("facts", i, { icon: u })} h="h-14" />
              <label className="text-sm">Number<input className={inp} value={f.value} onChange={(e) => setItem("facts", i, { value: e.target.value })} /></label>
              <label className="text-sm">Line 1<input className={inp} value={f.l1} onChange={(e) => setItem("facts", i, { l1: e.target.value })} /></label>
              <label className="text-sm">Line 2<input className={inp} value={f.l2} onChange={(e) => setItem("facts", i, { l2: e.target.value })} /></label>
              <button onClick={() => removeItem("facts", i)} className="text-red-600 px-2">✕</button>
            </div>
          ))}
        </>)}

        {tab === "team" && (<>
          <div className="flex justify-between"><h2 className="font-semibold">Team (#team)</h2><button onClick={() => resetSection(["teamSub","teamTitle","team"])} className="text-xs text-gray-500 hover:underline">Reset to default</button></div>
          <div className="grid md:grid-cols-2 gap-4"><T label="Small heading" k="teamSub" /><T label="Main heading" k="teamTitle" /></div>
          <div className="flex justify-end"><button onClick={() => addItem("team", { name: "", role: "", image: "" })} className="text-sm bg-green-600 text-white px-3 py-1 rounded">+ Add Member</button></div>
          <div className="grid md:grid-cols-2 gap-4">
            {site.team.map((m, i) => (
              <div key={i} className="bg-gray-50 p-3 rounded space-y-2">
                <ImageField label="Photo" value={m.image} onChange={(u) => setItem("team", i, { image: u })} h="h-40" />
                <input className={inp} placeholder="Name" value={m.name} onChange={(e) => setItem("team", i, { name: e.target.value })} />
                <input className={inp} placeholder="Role / designation" value={m.role} onChange={(e) => setItem("team", i, { role: e.target.value })} />
                <div className="flex gap-2 text-sm"><button onClick={() => moveItem("team", i, -1)} className="border px-2 rounded bg-white">↑</button><button onClick={() => moveItem("team", i, 1)} className="border px-2 rounded bg-white">↓</button><button onClick={() => removeItem("team", i)} className="text-red-600 px-2">Remove</button></div>
              </div>
            ))}
          </div>
        </>)}

        {tab === "why" && (<>
          <div className="flex justify-between"><h2 className="font-semibold">Why Choose Us</h2><button onClick={() => resetSection(["whySub","whyTitle","whyText","whyImage","whyBadgeTitle","whyBadgeSub","whyChoose"])} className="text-xs text-gray-500 hover:underline">Reset to default</button></div>
          <div className="grid md:grid-cols-2 gap-4"><T label="Small heading" k="whySub" /><T label="Main heading" k="whyTitle" /></div>
          <T label="Intro text" k="whyText" rows={3} />
          <ImageField label="Side image" value={site.whyImage} onChange={(u) => set({ whyImage: u })} h="h-40" />
          <div className="grid md:grid-cols-2 gap-4"><T label="Badge title" k="whyBadgeTitle" /><T label="Badge sub text" k="whyBadgeSub" /></div>
          <div className="flex justify-between items-center"><h3 className="font-medium text-sm">Boxes ({site.whyChoose.length})</h3><button onClick={() => addItem("whyChoose", { title: "", desc: "" })} className="text-sm bg-green-600 text-white px-3 py-1 rounded">+ Add</button></div>
          {site.whyChoose.map((w, i) => (
            <div key={i} className="grid md:grid-cols-[1fr_2fr_auto] gap-2 items-start bg-gray-50 p-2 rounded">
              <input className={inp} placeholder="Title" value={w.title} onChange={(e) => setItem("whyChoose", i, { title: e.target.value })} />
              <textarea className={inp} rows={2} placeholder="Description" value={w.desc} onChange={(e) => setItem("whyChoose", i, { desc: e.target.value })} />
              <button onClick={() => removeItem("whyChoose", i)} className="text-red-600 px-2">✕</button>
            </div>
          ))}
        </>)}

        {tab === "blog" && (<>
          <div className="flex justify-between"><h2 className="font-semibold">Blog (#blog)</h2><button onClick={() => resetSection(["blogSub","blogTitle","blogs","showBlog"])} className="text-xs text-gray-500 hover:underline">Reset to default</button></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={site.showBlog !== false} onChange={(e) => set({ showBlog: e.target.checked })} /> Show Blog section on website</label>
          <div className="grid md:grid-cols-2 gap-4"><T label="Small heading" k="blogSub" /><T label="Main heading" k="blogTitle" /></div>
          <div className="flex justify-end"><button onClick={() => addItem("blogs", { image: "", cat: "", title: "", link: "" })} className="text-sm bg-green-600 text-white px-3 py-1 rounded">+ Add Post</button></div>
          <div className="grid md:grid-cols-3 gap-4">
            {site.blogs.map((b, i) => (
              <div key={i} className="bg-gray-50 p-3 rounded space-y-2">
                <ImageField label="Image" value={b.image} onChange={(u) => setItem("blogs", i, { image: u })} h="h-32" />
                <input className={inp} placeholder="Category" value={b.cat} onChange={(e) => setItem("blogs", i, { cat: e.target.value })} />
                <input className={inp} placeholder="Title" value={b.title} onChange={(e) => setItem("blogs", i, { title: e.target.value })} />
                <input className={inp} placeholder="Read More link (optional URL)" value={b.link || ""} onChange={(e) => setItem("blogs", i, { link: e.target.value })} />
                <div className="flex gap-2 text-sm"><button onClick={() => moveItem("blogs", i, -1)} className="border px-2 rounded bg-white">↑</button><button onClick={() => moveItem("blogs", i, 1)} className="border px-2 rounded bg-white">↓</button><button onClick={() => removeItem("blogs", i)} className="text-red-600 px-2">Remove</button></div>
              </div>
            ))}
          </div>
        </>)}

        {tab === "contact" && (<>
          <div className="flex justify-between"><h2 className="font-semibold">Contact / Free Estimate (#estimate)</h2><button onClick={() => resetSection(["estimateSub","estimateTitle","estimateText","estimateImage","estimateImageTitle","estimateImageSub","estimateBadge","formTitle","formText","workingHours"])} className="text-xs text-gray-500 hover:underline">Reset to default</button></div>
          <p className="text-xs text-gray-500">Phone, email, address, WhatsApp — Admin → Settings se.</p>
          <div className="grid md:grid-cols-2 gap-4"><T label="Small heading" k="estimateSub" /><T label="Main heading" k="estimateTitle" /></div>
          <T label="Text" k="estimateText" rows={3} />
          <ImageField label="Image" value={site.estimateImage} onChange={(u) => set({ estimateImage: u })} h="h-40" />
          <div className="grid md:grid-cols-3 gap-4"><T label="Image title" k="estimateImageTitle" /><T label="Image sub text" k="estimateImageSub" /><T label="Badge" k="estimateBadge" /></div>
          <div className="grid md:grid-cols-3 gap-4"><T label="Form title" k="formTitle" /><T label="Form text" k="formText" /><T label="Working hours" k="workingHours" /></div>
        </>)}

        {tab === "footer" && (<>
          <div className="flex justify-between"><h2 className="font-semibold">Orange CTA strip & Footer</h2><button onClick={() => resetSection(["ctaTitle","footerText"])} className="text-xs text-gray-500 hover:underline">Reset to default</button></div>
          <T label="CTA heading (orange strip above footer)" k="ctaTitle" />
          <T label="Footer about text (after company name)" k="footerText" rows={3} />
          <p className="text-xs text-gray-500">Social links, logo, address, phone — Admin → Settings se.</p>
        </>)}
      </div>

      <div className="flex justify-end"><button onClick={save} disabled={saving} className="bg-primary-600 text-white px-5 py-2 rounded">{saving ? "Saving..." : "Save & Publish"}</button></div>
    </div>
  );
}
