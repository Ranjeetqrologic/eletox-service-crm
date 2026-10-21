"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { subServicesFor } from "@/lib/subServices";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import toast from "react-hot-toast";
import { EyeIcon, MapPinIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const CLOSE_SERVICE_OPTIONS = ["AC Service", "Installation", "Uninstallation", "Gas Topup", "Gas Full Charge", "Copper Pipe Fitting", "Other"];
const CLOSE_EXPERIENCE_OPTIONS = ["😊 Very Happy", "🙂 Happy", "😐 Satisfied", "🙁 Not Satisfied"];
const EMPTY_CLOSE = { technicianType: "office", staff: "", outsideTechnicianName: "", workDescription: "", repairNotes: "", machineSerialNo: "", billAmount: "", receivedAmount: "", paymentMode: "", customerFeedback: "Customer satisfied with the service", rating: 5, clientExperience: "" };

const sources = ["website", "call", "whatsapp", "facebook", "instagram", "google_ads", "referral", "manual", "others"];
const priorities = ["low", "medium", "high", "urgent"];

const EMPTY_FORM = { customerName: "", mobile: "", service: "", subService: "", address: "", city: "Jaipur", problem: "", locationText: "", leadDate: "", status: "new", priority: "medium", source: "manual" };

export default function LeadsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlStatus = searchParams.get("status") || "";
  const urlView = searchParams.get("view") || "";

  const [leads, setLeads] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>(EMPTY_FORM);
  const [services, setServices] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const EMPTY_OLD = { customerName: "", mobile: "", service: "", subService: "", address: "", city: "Jaipur", note: "", leadDate: "", technicianType: "office", staff: "", outsideTechnicianName: "", workDescription: "", machineSerialNo: "", billAmount: "", receivedAmount: "", paymentMode: "cash" };
  const [oldForm, setOldForm] = useState<any>(EMPTY_OLD);
  const [oldBillPhotos, setOldBillPhotos] = useState<File[]>([]);
  const [oldWorkPhotos, setOldWorkPhotos] = useState<File[]>([]);
  const [oldSaving, setOldSaving] = useState(false);

  const submitOld = async (e: React.FormEvent) => {
    e.preventDefault();
    if (oldForm.technicianType === "office" && !oldForm.staff) return toast.error("Select office technician");
    if (oldForm.technicianType === "outside" && !oldForm.outsideTechnicianName.trim()) return toast.error("Enter outside technician name");
    setOldSaving(true);
    try {
      const data = new FormData();
      Object.keys(oldForm).forEach((k) => { if (oldForm[k] !== undefined && oldForm[k] !== "") data.append(k, String(oldForm[k])); });
      oldBillPhotos.forEach((f) => data.append("billPhotos", f));
      oldWorkPhotos.forEach((f) => data.append("workingPhotos", f));
      await api.post("/jobs/old-entry", data, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Old lead saved (Closed) — payment added to history");
      setOldForm(EMPTY_OLD); setOldBillPhotos([]); setOldWorkPhotos([]);
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setOldSaving(false);
    }
  };
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState(urlStatus);
  const [filterView, setFilterView] = useState(urlView);
  const [pasteLoading, setPasteLoading] = useState(false);

  const pasteLocation = async () => {
    const text = (locationModal?.pasteText || "").trim();
    if (!text) return toast.error("Paste the location link / coordinates first");
    setPasteLoading(true);
    try {
      const { data } = await api.post("/leads/resolve-location", { text });
      setLocationModal({ ...locationModal, lat: String(data.data.lat), lng: String(data.data.lng), locationLink: data.data.link });
      toast.success("Location set from pasted link");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not read location");
    } finally {
      setPasteLoading(false);
    }
  };

  const ageHours = (l: any) => (l.createdAt ? (Date.now() - new Date(l.createdAt).getTime()) / 36e5 : 0);
  const isOpenUnassigned = (l: any) => !l.assignedStaff && !["closed", "cancelled", "completed"].includes(l.status);
  const [filterStaff, setFilterStaff] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [jobModal, setJobModal] = useState<any>(null);
  const [jobEdit, setJobEdit] = useState<any>(null);
  const saveJobEdit = async () => {
    try {
      const payload: Record<string, any> = { ...jobEdit };
      ["paymentMode", "billAmount", "receivedAmount", "rating"].forEach((k) => { if (payload[k] === "") delete payload[k]; });
      const { data } = await api.put(`/jobs/${jobModal._id}/report`, payload);
      toast.success("Job report updated");
      setJobModal({ ...jobModal, ...data.data, lead: jobModal.lead, staff: jobModal.staff });
      setJobEdit(null);
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };
  const [photoBusy, setPhotoBusy] = useState(false);
  const addJobPhotos = async (field: string, files: FileList | null) => {
    if (!files || !files.length || !jobModal) return;
    const data = new FormData();
    Array.from(files).forEach((f) => data.append(field, f));
    setPhotoBusy(true);
    try {
      const res = await api.post(`/jobs/${jobModal._id}/photos`, data, { headers: { "Content-Type": "multipart/form-data" } });
      setJobModal({ ...jobModal, ...res.data.data, lead: jobModal.lead, staff: jobModal.staff });
      toast.success(`${files.length} photo${files.length > 1 ? "s" : ""} added`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Photo upload failed");
    } finally {
      setPhotoBusy(false);
    }
  };
  const removeJobPhoto = async (field: string, url: string) => {
    if (!jobModal || !confirm("Remove this photo?")) return;
    try {
      const res = await api.delete(`/jobs/${jobModal._id}/photos`, { data: { field, url } });
      setJobModal({ ...jobModal, ...res.data.data, lead: jobModal.lead, staff: jobModal.staff });
      toast.success("Photo removed");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };
  const startJobEdit = () => setJobEdit({
    workDescription: jobModal.workDescription || "",
    machineSerialNo: jobModal.machineSerialNo || jobModal.lead?.machineSerialNo || "",
    billAmount: jobModal.billAmount ?? "",
    receivedAmount: jobModal.receivedAmount ?? "",
    paymentMode: jobModal.paymentMode || "",
    customerFeedback: jobModal.customerFeedback || "",
    rating: jobModal.rating ?? "",
    clientExperience: jobModal.clientExperience || "",
    adminRemark: jobModal.adminRemark || "",
  });
  const [loadingJob, setLoadingJob] = useState(false);
  const [locationModal, setLocationModal] = useState<any>(null);
  const [closeModal, setCloseModal] = useState<any>(null);
  const [closeForm, setCloseForm] = useState<any>(EMPTY_CLOSE);
  const [closeServices, setCloseServices] = useState<string[]>([]);
  const [closePhotos, setClosePhotos] = useState<File[]>([]);
  const [closing, setClosing] = useState(false);

  const openClose = (l: any) => {
    setCloseModal(l);
    setCloseForm({ ...EMPTY_CLOSE, staff: l.assignedStaff?._id || l.assignedStaff || "", machineSerialNo: l.machineSerialNo || "" });
    setCloseServices([]);
    setClosePhotos([]);
  };

  const submitClose = async () => {
    if (!closeModal) return;
    if (closeForm.technicianType === "office" && !closeForm.staff) return toast.error("Select office technician");
    if (closeForm.technicianType === "outside" && !closeForm.outsideTechnicianName.trim()) return toast.error("Enter outside technician name");
    setClosing(true);
    try {
      const data = new FormData();
      Object.keys(closeForm).forEach((k) => { if (closeForm[k] !== undefined && closeForm[k] !== "") data.append(k, String(closeForm[k])); });
      data.append("servicesDone", JSON.stringify(closeServices));
      closePhotos.forEach((f) => data.append("workingPhotos", f));
      await api.post(`/jobs/admin-close/${closeModal._id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Lead closed with report");
      setCloseModal(null);
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setClosing(false);
    }
  };

  const fetchLeads = () => api.get("/leads").then((res) => setLeads(res.data.data));
  const fetchStaff = () => api.get("/staff").then((res) => setStaff(res.data.data));
  const fetchStatuses = () => api.get("/lead-status/all").then((res) => setStatuses(res.data.data));
  useEffect(() => { api.get("/services/public").then((r) => setServices(r.data.data || [])).catch(() => setServices([])); }, []);

  useEffect(() => {
    fetchLeads();
    fetchStaff();
    fetchStatuses();
  }, []);

  useEffect(() => {
    if (urlStatus) setFilterStatus(urlStatus);
  }, [urlStatus]);

  useEffect(() => {
    setFilterView(urlView);
  }, [urlView]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { locationText, leadDate, ...payload } = form as any;
      if (leadDate) {
        const d = new Date(leadDate + "T00:00:00");
        const now = new Date();
        d.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
        payload.createdAt = d.toISOString();
      }
      if (locationText?.trim()) {
        const { data } = await api.post("/leads/resolve-location", { text: locationText.trim() });
        payload.lat = data.data.lat;
        payload.lng = data.data.lng;
        payload.locationLink = data.data.link;
      }
      await api.post("/leads", payload);
      toast.success("Lead created");
      setShowForm(false);
      setForm(EMPTY_FORM);
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setCreating(false);
    }
  };

  const finalComplete = async (leadId: string) => {
    if (!confirm("Final complete this lead? It cannot be assigned to staff again.")) return;
    try {
      await api.put(`/leads/${leadId}/final-complete`);
      toast.success("Lead final completed");
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const assignLead = async (leadId: string, staffId: string) => {
    if (!staffId) return toast.error("Please select a staff name");
    try {
      await api.put(`/leads/${leadId}/assign`, { staffId });
      toast.success("Assigned");
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const viewJob = async (leadId: string) => {
    setLoadingJob(true);
    try {
      const res = await api.get(`/jobs/lead/${leadId}`);
      setJobModal(res.data.data);
    } catch (err: any) {
      const lead = leads.find((x) => x._id === leadId);
      if (err.response?.status === 404 && lead) setJobModal({ lead, leadOnly: true });
      else toast.error(err.response?.data?.message || "No job found");
    } finally {
      setLoadingJob(false);
    }
  };

  const [cancelModal, setCancelModal] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState("");

  const changeStatus = async (leadId: string, status: string, reason?: string) => {
    if (status === "cancelled" && !reason) {
      setCancelModal(leads.find((x) => x._id === leadId) || { _id: leadId });
      setCancelReason("");
      return;
    }
    try {
      await api.put(`/leads/${leadId}/status`, { status, reason });
      setCancelModal(null);
      toast.success("Status updated");
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const [geoLoading, setGeoLoading] = useState(false);
  const findAddress = async () => {
    const q = (locationModal?.address || "").trim();
    if (!q) return toast.error("Type a location first");
    setGeoLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`, { headers: { Accept: "application/json" } });
      const results = await res.json();
      if (!results?.length) return toast.error("Location not found, try a more specific address");
      setLocationModal({ ...locationModal, lat: results[0].lat, lng: results[0].lon });
      toast.success("Location found");
    } catch {
      toast.error("Could not search location");
    } finally {
      setGeoLoading(false);
    }
  };

  const updateLocation = async (leadId: string, lat: string, lng: string, address?: string, locationLink?: string) => {
    try {
      await api.put(`/leads/${leadId}`, { lat: lat ? parseFloat(lat) : undefined, lng: lng ? parseFloat(lng) : undefined, ...(address?.trim() ? { address: address.trim() } : {}), ...(locationLink?.trim() ? { locationLink: locationLink.trim() } : {}) });
      toast.success("Location updated");
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const updateLead = async (leadId: string, payload: Record<string, string>) => {
    try {
      await api.put(`/leads/${leadId}`, payload);
      toast.success("Lead updated");
      fetchLeads();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const [assignDraft, setAssignDraft] = useState<Record<string, string>>({});

  const sendReminders = async () => {
    try {
      const res = await api.post("/reminders/send-followups");
      toast.success(res.data.message || "Reminders sent");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const exportCSV = () => {
    const rows = leads.map((l) => [
      l.leadId, l.customerName, l.mobile, l.service, l.status,
      l.assignedStaff?.name || "", l.city, l.priority, l.source,
      l.followUpDate ? new Date(l.followUpDate).toLocaleDateString() : "",
    ]);
    const csv = ["Lead ID,Customer,Mobile,Service,Status,Assigned,City,Priority,Source,FollowUp"].concat(rows.map((r) => r.join(","))).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
  };

  const filteredLeads = leads.filter((l) => {
    const matchesSearch = [l.customerName, l.mobile, l.leadId].some((x) => x?.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = !filterStatus || l.status === filterStatus;
    const isAssigned = !!l.assignedStaff && !["closed", "cancelled"].includes(l.status);
    const matchesView =
      !filterView ||
      (filterView === "new" ? isOpenUnassigned(l) && ageHours(l) < 24
        : filterView === "pending" || filterView === "assigned" ? isAssigned
        : filterView === "accepted" ? isAssigned && !["new", "assigned"].includes(l.status)
        : filterView === "completed" ? l.status === "completed"
        : true);
    const matchesStaff = !filterStaff || (filterStaff === "unassigned" ? !l.assignedStaff : l.assignedStaff?._id === filterStaff);
    const created = l.createdAt ? l.createdAt.split("T")[0] : "";
    const matchesDate = (!fromDate || created >= fromDate) && (!toDate || created <= toDate);
    return matchesSearch && matchesStatus && matchesView && matchesStaff && matchesDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold">Lead Management</h1>
        <div className="flex flex-wrap gap-2">
          <input className="border p-2 rounded flex-1 min-w-[140px]" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="border p-2 rounded" value={filterView} onChange={(e) => setFilterView(e.target.value)}>
            <option value="">All Leads</option>
            <option value="new">New Leads</option>
            <option value="pending">Pending Leads</option>
            <option value="assigned">Assigned Leads</option>
            <option value="accepted">Accepted Leads</option>
            <option value="completed">Completed Leads</option>
          </select>
          <select className="border p-2 rounded" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            {statuses.map((s) => <option key={s._id} value={s.name}>{s.label}</option>)}
          </select>
          <select className="border p-2 rounded" value={filterStaff} onChange={(e) => setFilterStaff(e.target.value)}>
            <option value="">All Staff</option>
            <option value="unassigned">Unassigned</option>
            {staff.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <input type="date" className="border p-2 rounded" value={fromDate} onChange={(e) => setFromDate(e.target.value)} title="From date" />
          <input type="date" className="border p-2 rounded" value={toDate} onChange={(e) => setToDate(e.target.value)} title="To date" />
          <button onClick={sendReminders} className="bg-yellow-500 text-white px-4 py-2 rounded">Remind</button>
          <button onClick={exportCSV} className="bg-green-600 text-white px-4 py-2 rounded">Export</button>
          <button onClick={() => setShowForm(!showForm)} className="bg-primary-600 text-white px-4 py-2 rounded">{showForm ? "Close" : "+ New Lead"}</button>
          <button onClick={() => { setShowOld(!showOld); if (!showOld) setShowForm(false); }} className="bg-gray-700 text-white px-4 py-2 rounded">{showOld ? "Close" : "Old Data Entry"}</button>
        </div>
      </div>

      {showOld && (
        <form onSubmit={submitOld} className="bg-white p-5 rounded-xl shadow border-2 border-gray-700">
          <h2 className="font-semibold text-lg mb-1">Old Data Entry</h2>
          <p className="text-xs text-gray-500 mb-3">Purana kaam yahan daalein — lead seedha Closed banegi, amount Payments history aur Reports me us date par jayega.</p>
          <div className="grid md:grid-cols-3 gap-3">
            <label className="text-sm">Lead Date*<input required type="date" className="border p-2 rounded w-full" value={oldForm.leadDate} onChange={(e) => setOldForm({ ...oldForm, leadDate: e.target.value })} /></label>
            <input required placeholder="Customer Name*" className="border p-2 rounded self-end" value={oldForm.customerName} onChange={(e) => setOldForm({ ...oldForm, customerName: e.target.value })} />
            <input required placeholder="Phone Number*" className="border p-2 rounded self-end" value={oldForm.mobile} onChange={(e) => setOldForm({ ...oldForm, mobile: e.target.value })} />
            <select required className="border p-2 rounded" value={oldForm.service} onChange={(e) => setOldForm({ ...oldForm, service: e.target.value, subService: "" })}>
              <option value="">Choose Service*</option>
              {services.map((sv: any) => <option key={sv._id || sv.title} value={sv.title}>{sv.title}</option>)}
              <option value="Other">Other</option>
            </select>
            {subServicesFor(oldForm.service).length > 0 ? (
              <select className="border p-2 rounded" value={oldForm.subService} onChange={(e) => setOldForm({ ...oldForm, subService: e.target.value })}>
                <option value="">Category / Sub-service</option>
                {subServicesFor(oldForm.service).map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            ) : <input placeholder="Sub-service (optional)" className="border p-2 rounded" value={oldForm.subService} onChange={(e) => setOldForm({ ...oldForm, subService: e.target.value })} />}
            <input placeholder="Address" className="border p-2 rounded" value={oldForm.address} onChange={(e) => setOldForm({ ...oldForm, address: e.target.value })} />
            <div className="md:col-span-3 border rounded p-3 bg-blue-50 grid md:grid-cols-3 gap-3 items-center">
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-1"><input type="radio" checked={oldForm.technicianType === "office"} onChange={() => setOldForm({ ...oldForm, technicianType: "office" })} /> Office Technician</label>
                <label className="flex items-center gap-1"><input type="radio" checked={oldForm.technicianType === "outside"} onChange={() => setOldForm({ ...oldForm, technicianType: "outside" })} /> Outside Technician</label>
              </div>
              {oldForm.technicianType === "office" ? (
                <select className="border p-2 rounded md:col-span-2 bg-white" value={oldForm.staff} onChange={(e) => setOldForm({ ...oldForm, staff: e.target.value })}>
                  <option value="">Select office technician*</option>
                  {staff.map((st: any) => <option key={st._id} value={st._id}>{st.name}{st.employeeId ? ` (${st.employeeId})` : ""}</option>)}
                </select>
              ) : <input className="border p-2 rounded md:col-span-2" placeholder="Outside technician name*" value={oldForm.outsideTechnicianName} onChange={(e) => setOldForm({ ...oldForm, outsideTechnicianName: e.target.value })} />}
            </div>
            <input type="number" placeholder="Bill Amount" className="border p-2 rounded" value={oldForm.billAmount} onChange={(e) => setOldForm({ ...oldForm, billAmount: e.target.value })} />
            <input type="number" placeholder="Received Amount" className="border p-2 rounded" value={oldForm.receivedAmount} onChange={(e) => setOldForm({ ...oldForm, receivedAmount: e.target.value })} />
            <select className="border p-2 rounded" value={oldForm.paymentMode} onChange={(e) => setOldForm({ ...oldForm, paymentMode: e.target.value })}>
              <option value="cash">Cash</option><option value="upi">UPI</option><option value="card">Card</option><option value="online">Online</option>
            </select>
            <input placeholder="Machine Serial No." className="border p-2 rounded" value={oldForm.machineSerialNo} onChange={(e) => setOldForm({ ...oldForm, machineSerialNo: e.target.value })} />
            <textarea placeholder="Work Description / Note" className="border p-2 rounded md:col-span-2" rows={2} value={oldForm.workDescription} onChange={(e) => setOldForm({ ...oldForm, workDescription: e.target.value, note: e.target.value })} />
            {[["Bill Book Photos", oldBillPhotos, setOldBillPhotos], ["Working Photos", oldWorkPhotos, setOldWorkPhotos]].map(([label, list, setList]: any) => (
              <div key={label} className="border rounded p-3 md:col-span-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{label} ({list.length})</span>
                  <label className="cursor-pointer text-white px-3 py-1 rounded text-sm bg-blue-600">+ Add Photo<input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { const files = Array.from(e.target.files || []); setList((prev: File[]) => [...prev, ...files]); e.target.value = ""; }} /></label>
                </div>
                {list.length > 0 && <div className="flex flex-wrap gap-2">{list.map((file: File, i: number) => (
                  <div key={`${file.name}-${i}`} className="relative"><img src={URL.createObjectURL(file)} alt="" className="w-16 h-16 object-cover rounded border" /><button type="button" onClick={() => setList((prev: File[]) => prev.filter((_, j) => j !== i))} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs leading-5">×</button></div>
                ))}</div>}
              </div>
            ))}
          </div>
          <button type="submit" disabled={oldSaving} className="mt-4 bg-gray-800 text-white px-5 py-2.5 rounded font-semibold">{oldSaving ? "Saving..." : "Save Old Lead (Closed)"}</button>
        </form>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-semibold text-lg mb-3">New Lead</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input required placeholder="Full Name" className="border p-2.5 rounded" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
            <input required placeholder="Phone Number" className="border p-2.5 rounded" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
            <select required className="border p-2.5 rounded md:col-span-2" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value, subService: "" })}>
              <option value="">Choose Service</option>
              {services.map((sv: any) => <option key={sv._id || sv.title} value={sv.title}>{sv.title}</option>)}
              <option value="Other">Other</option>
            </select>
            {subServicesFor(form.service).length > 0 && (
              <select required className="border p-2.5 rounded md:col-span-2" value={form.subService} onChange={(e) => setForm({ ...form, subService: e.target.value })}>
                <option value="">Choose Category</option>
                {subServicesFor(form.service).map((sub) => <option key={sub} value={sub}>{sub}</option>)}
                <option value="Other">Other</option>
              </select>
            )}
            <textarea required placeholder="Address" rows={2} className="border p-2.5 rounded md:col-span-2" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <input placeholder="Paste Location (Google Maps link / coordinates)" className="border p-2.5 rounded md:col-span-2" value={form.locationText} onChange={(e) => setForm({ ...form, locationText: e.target.value })} />
            <label className="text-sm text-gray-600 md:col-span-2">Lead Date <span className="text-gray-400">(blank = aaj; purani ya aage ki date bhi chun sakte hain)</span>
              <input type="date" className="border p-2.5 rounded w-full mt-1" value={form.leadDate} onChange={(e) => setForm({ ...form, leadDate: e.target.value })} />
            </label>
            <textarea placeholder="Note" rows={3} className="border p-2.5 rounded md:col-span-2" value={form.problem} onChange={(e) => setForm({ ...form, problem: e.target.value })} />
          </div>
          <button type="submit" disabled={creating} className="mt-4 bg-primary-600 text-white px-6 py-2.5 rounded disabled:opacity-60">{creating ? "Submitting..." : "Submit Lead"}</button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Lead ID</th>
              <th className="p-3 text-left">Date &amp; Time</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Service</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Assigned</th>
              <th className="p-3 text-left">Accepted At</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((l) => (
              <tr key={l._id} className="border-t">
                <td className="p-3">{l.leadId}</td>
                <td className="p-3 text-xs text-gray-500">{l.createdAt ? new Date(l.createdAt).toLocaleString() : "-"}</td>
                <td className="p-3">{l.customerName} <br /><span className="text-gray-500">{l.mobile}</span></td>
                <td className="p-3">
                  <div>{l.service}</div>
                  {l.subService && <div className="text-xs text-blue-700">{l.subService}</div>}
                  {l.problem && <div className="text-xs text-gray-500 max-w-[200px] truncate" title={l.problem}>{l.problem}</div>}
                </td>
                <td className="p-3">
                  {l.assignedStaff ? (
                    <div className="flex flex-col gap-1 items-start">
                      <span className="inline-block px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-medium" title="Status is locked after assignment">
                        {statuses.find((s) => s.name === l.status)?.label || l.status}
                      </span>
                      {l.finalCompleted ? (
                        <span className="inline-block px-2 py-0.5 rounded bg-green-600 text-white text-[11px] font-semibold">Final Completed</span>
                      ) : l.status === "completed" ? (
                        <button onClick={() => finalComplete(l._id)} className="px-2 py-0.5 rounded bg-green-600 text-white text-[11px] font-semibold hover:bg-green-700">Final Complete</button>
                      ) : null}
                    </div>
                  ) : (
                    <div>
                      <select value={l.status} onChange={(e) => changeStatus(l._id, e.target.value)} className="border p-1 rounded">
                        {statuses.filter((s) => s.isActive).map((s) => <option key={s._id} value={s.name}>{s.label}</option>)}
                      </select>
                      {l.status === "cancelled" && l.cancelledReason && <div className="text-[11px] text-red-600 mt-1 max-w-[180px]">Reason: {l.cancelledReason}</div>}
                    </div>
                  )}
                </td>
                <td className="p-3">
                  {l.finalCompleted ? (
                    <span className="text-xs text-gray-500">{l.assignedStaff?.name || "-"} · Final (no re-assign)</span>
                  ) : (
                  <div className="flex gap-1">
                    <select value={assignDraft[l._id] ?? l.assignedStaff?._id ?? ""} onChange={(e) => setAssignDraft({ ...assignDraft, [l._id]: e.target.value })} className="border p-1 rounded">
                      <option value="">Select Staff</option>
                      {staff.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                    <button onClick={() => { assignLead(l._id, assignDraft[l._id] ?? l.assignedStaff?._id ?? ""); setAssignDraft(({ [l._id]: _, ...rest }) => rest); }} className="bg-blue-600 text-white text-xs px-2 rounded">Submit</button>
                  </div>
                  )}
                </td>
                <td className="p-3 text-xs text-gray-500">
                  {l.acceptedAt ? new Date(l.acceptedAt).toLocaleString() : "-"}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <button onClick={() => viewJob(l._id)} title="View Job" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100"><EyeIcon className="w-4 h-4" /> View</button>
                    <button onClick={() => setLocationModal(l)} title="Set Location" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100"><MapPinIcon className="w-4 h-4" /> Location</button>
                    {!["closed", "cancelled"].includes(l.status) && (
                      <button onClick={() => openClose(l)} title="Close Lead with Work Report" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 border border-green-100"><CheckCircleIcon className="w-4 h-4" /> Close</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-1">Cancel Lead {cancelModal.leadId ? `- ${cancelModal.leadId}` : ""}</h2>
            <p className="text-sm text-gray-500 mb-3">Reason zaroori hai — kyun cancel ho rahi hai?</p>
            <textarea autoFocus className="border p-2 rounded w-full" rows={3} placeholder="Cancel reason*" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
            <div className="mt-4 flex gap-2">
              <button onClick={() => { if (!cancelReason.trim()) return toast.error("Reason likhna zaroori hai"); changeStatus(cancelModal._id, "cancelled", cancelReason.trim()); }} className="bg-red-600 text-white px-4 py-2 rounded">Cancel Lead</button>
              <button onClick={() => { setCancelModal(null); fetchLeads(); }} className="bg-gray-300 px-4 py-2 rounded">Back</button>
            </div>
          </div>
        </div>
      )}

      {closeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-1">Work Report - {closeModal.leadId}</h2>
            <p className="text-sm text-gray-500 mb-4">{closeModal.customerName} · {closeModal.mobile} · {closeModal.service}{closeModal.subService ? ` / ${closeModal.subService}` : ""}</p>
            <div className="space-y-3">
              <div className="border rounded p-3 bg-blue-50">
                <div className="text-sm font-medium mb-2">Technician (kisne kaam kiya?)</div>
                <div className="flex gap-4 text-sm mb-2">
                  <label className="flex items-center gap-1"><input type="radio" checked={closeForm.technicianType === "office"} onChange={() => setCloseForm({ ...closeForm, technicianType: "office" })} /> Office Technician</label>
                  <label className="flex items-center gap-1"><input type="radio" checked={closeForm.technicianType === "outside"} onChange={() => setCloseForm({ ...closeForm, technicianType: "outside" })} /> Outside Technician</label>
                </div>
                {closeForm.technicianType === "office" ? (
                  <select className="border p-2 rounded w-full bg-white" value={closeForm.staff} onChange={(e) => setCloseForm({ ...closeForm, staff: e.target.value })}>
                    <option value="">Select office technician*</option>
                    {staff.filter((st: any) => st.isActive !== false).map((st: any) => <option key={st._id} value={st._id}>{st.name}{st.employeeId ? ` (${st.employeeId})` : ""}</option>)}
                  </select>
                ) : (
                  <input className="border p-2 rounded w-full" placeholder="Outside technician name*" value={closeForm.outsideTechnicianName} onChange={(e) => setCloseForm({ ...closeForm, outsideTechnicianName: e.target.value })} />
                )}
              </div>
              <textarea placeholder="Work Description" className="border p-2 rounded w-full" value={closeForm.workDescription} onChange={(e) => setCloseForm({ ...closeForm, workDescription: e.target.value })} />
              <div className="border rounded p-3">
                <div className="text-sm font-medium mb-2">Services (select one or more)</div>
                <div className="flex flex-wrap gap-2">
                  {CLOSE_SERVICE_OPTIONS.map((name) => {
                    const active = closeServices.includes(name);
                    return <button key={name} type="button" onClick={() => setCloseServices((prev) => (prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]))} className={`px-3 py-1 rounded-full text-sm border ${active ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}>{active ? "✓ " : "+ "}{name}</button>;
                  })}
                </div>
                {closeServices.includes("Other") && <input placeholder="Other service details" className="border p-2 rounded w-full mt-3" value={closeForm.repairNotes} onChange={(e) => setCloseForm({ ...closeForm, repairNotes: e.target.value })} />}
              </div>
              <input placeholder="Machine Serial No." className="border p-2 rounded w-full" value={closeForm.machineSerialNo} onChange={(e) => setCloseForm({ ...closeForm, machineSerialNo: e.target.value })} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input type="number" placeholder="Bill Amount" className="border p-2 rounded w-full" value={closeForm.billAmount} onChange={(e) => setCloseForm({ ...closeForm, billAmount: e.target.value })} />
                <input type="number" placeholder="Received Amount" className="border p-2 rounded w-full" value={closeForm.receivedAmount} onChange={(e) => setCloseForm({ ...closeForm, receivedAmount: e.target.value })} />
                <select className="border p-2 rounded w-full" value={closeForm.paymentMode} onChange={(e) => setCloseForm({ ...closeForm, paymentMode: e.target.value })}>
                  <option value="">Payment Mode</option><option value="cash">Cash</option><option value="upi">UPI</option><option value="card">Card</option><option value="online">Online</option>
                </select>
              </div>
              <textarea placeholder="Customer Feedback" className="border p-2 rounded w-full" value={closeForm.customerFeedback} onChange={(e) => setCloseForm({ ...closeForm, customerFeedback: e.target.value })} />
              <div className="border rounded p-3">
                <div className="text-sm font-medium mb-2">Rating</div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" onClick={() => setCloseForm({ ...closeForm, rating: n })} className={`text-3xl leading-none ${Number(closeForm.rating) >= n ? "text-yellow-400" : "text-gray-300"}`}>★</button>)}
                  <span className="self-center text-sm text-gray-600 ml-2">{closeForm.rating} Star{Number(closeForm.rating) > 1 ? "s" : ""}</span>
                </div>
                <div className="mt-3">
                  <div className="text-sm font-medium mb-2">Client Experience</div>
                  <div className="grid grid-cols-2 gap-2">
                    {CLOSE_EXPERIENCE_OPTIONS.map((o) => <button key={o} type="button" onClick={() => setCloseForm({ ...closeForm, clientExperience: o })} className={`border rounded px-3 py-2 text-sm text-left ${closeForm.clientExperience === o ? "border-primary-600 bg-primary-50 font-semibold" : "hover:bg-gray-50"}`}>{o}</button>)}
                  </div>
                </div>
              </div>
              <div className="border rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Photos ({closePhotos.length})</span>
                  <label className="cursor-pointer text-white px-3 py-1 rounded text-sm bg-blue-600">+ Add Photo<input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { const files = Array.from(e.target.files || []); setClosePhotos((prev) => [...prev, ...files]); e.target.value = ""; }} /></label>
                </div>
                {closePhotos.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {closePhotos.map((file, i) => (
                      <div key={`${file.name}-${i}`} className="relative">
                        <img src={URL.createObjectURL(file)} alt="" className="w-16 h-16 object-cover rounded border" />
                        <button type="button" onClick={() => setClosePhotos((prev) => prev.filter((_, j) => j !== i))} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs leading-5">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={submitClose} disabled={closing} className="bg-green-600 text-white px-4 py-2 rounded">{closing ? "Closing..." : "Close Lead"}</button>
              <button onClick={() => setCloseModal(null)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {locationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Set Location - {locationModal.leadId}</h2>
            <div className="space-y-3">
              <div className="border border-green-200 bg-green-50 rounded p-3">
                <div className="text-sm font-medium text-green-800 mb-1">Paste client location (WhatsApp / Google Maps link or "lat, lng")</div>
                <div className="flex gap-2">
                  <input
                    placeholder="https://maps.app.goo.gl/... or 26.91, 75.78"
                    className="border p-2 rounded w-full text-sm"
                    value={locationModal.pasteText || ""}
                    onChange={(e) => setLocationModal({ ...locationModal, pasteText: e.target.value })}
                    onKeyDown={(e) => { if (e.key === "Enter") pasteLocation(); }}
                  />
                  <button onClick={pasteLocation} disabled={pasteLoading} className="bg-green-600 text-white px-3 py-2 rounded whitespace-nowrap disabled:opacity-60">{pasteLoading ? "..." : "Set"}</button>
                </div>
                {locationModal.locationLink && <a href={locationModal.locationLink} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline break-all block mt-1">{locationModal.locationLink}</a>}
              </div>
              <div className="text-xs text-gray-500 text-center">— or search by address —</div>
              <div className="flex gap-2">
                <input
                  placeholder="Type location / address (e.g. Malviya Nagar, Jaipur)"
                  className="border p-2 rounded w-full"
                  value={locationModal.address || ""}
                  onChange={(e) => setLocationModal({ ...locationModal, address: e.target.value })}
                  onKeyDown={(e) => { if (e.key === "Enter") findAddress(); }}
                />
                <button onClick={findAddress} disabled={geoLoading} className="bg-blue-600 text-white px-3 py-2 rounded whitespace-nowrap disabled:opacity-60">{geoLoading ? "..." : "Find"}</button>
              </div>
              <input
                type="number"
                step="any"
                placeholder="Latitude"
                className="border p-2 rounded w-full"
                value={locationModal.lat || ""}
                onChange={(e) => setLocationModal({ ...locationModal, lat: e.target.value })}
              />
              <input
                type="number"
                step="any"
                placeholder="Longitude"
                className="border p-2 rounded w-full"
                value={locationModal.lng || ""}
                onChange={(e) => setLocationModal({ ...locationModal, lng: e.target.value })}
              />
              <button
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => setLocationModal({ ...locationModal, lat: pos.coords.latitude.toString(), lng: pos.coords.longitude.toString() }),
                      () => toast.error("Location access denied")
                    );
                  } else {
                    toast.error("Geolocation not supported");
                  }
                }}
                className="bg-gray-100 text-gray-700 px-3 py-2 rounded w-full"
              >
                Use My Current Location
              </button>
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={() => { updateLocation(locationModal._id, locationModal.lat, locationModal.lng, locationModal.address, locationModal.locationLink); setLocationModal(null); }} className="bg-primary-600 text-white px-4 py-2 rounded">Save Location</button>
              <button onClick={() => setLocationModal(null)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {jobModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{jobModal.leadOnly ? "Lead Details" : "Job Details"} - {jobModal.lead?.leadId}</h2>
              <button onClick={() => { setJobModal(null); setJobEdit(null); }} className="text-gray-500 hover:text-gray-700">Close</button>
            </div>
            {jobEdit && (
              <div className="mb-4 border border-amber-200 bg-amber-50 p-4 rounded-xl space-y-3 text-sm">
                <h3 className="font-semibold text-amber-800">Edit Report (Admin)</h3>
                <textarea className="border p-2 rounded w-full" rows={2} placeholder="Work Description" value={jobEdit.workDescription} onChange={(e) => setJobEdit({ ...jobEdit, workDescription: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <input className="border p-2 rounded" placeholder="Machine Serial No." value={jobEdit.machineSerialNo} onChange={(e) => setJobEdit({ ...jobEdit, machineSerialNo: e.target.value })} />
                  <select className="border p-2 rounded" value={jobEdit.paymentMode} onChange={(e) => setJobEdit({ ...jobEdit, paymentMode: e.target.value })}>
                    <option value="">Payment Mode</option>
                    <option value="cash">Cash</option><option value="upi">UPI</option><option value="card">Card</option><option value="online">Online</option>
                  </select>
                  <input type="number" className="border p-2 rounded" placeholder="Bill Amount" value={jobEdit.billAmount} onChange={(e) => setJobEdit({ ...jobEdit, billAmount: e.target.value })} />
                  <input type="number" className="border p-2 rounded" placeholder="Received Amount" value={jobEdit.receivedAmount} onChange={(e) => setJobEdit({ ...jobEdit, receivedAmount: e.target.value })} />
                  <input className="border p-2 rounded" placeholder="Customer Feedback" value={jobEdit.customerFeedback} onChange={(e) => setJobEdit({ ...jobEdit, customerFeedback: e.target.value })} />
                  <select className="border p-2 rounded" value={jobEdit.rating} onChange={(e) => setJobEdit({ ...jobEdit, rating: e.target.value })}>
                    <option value="">Rating</option>
                    {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{"★".repeat(n)} {n} Star{n > 1 ? "s" : ""}</option>)}
                  </select>
                  <select className="border p-2 rounded" value={jobEdit.clientExperience} onChange={(e) => setJobEdit({ ...jobEdit, clientExperience: e.target.value })}>
                    <option value="">Client Experience</option>
                    {["😊 Very Happy", "🙂 Happy", "😐 Satisfied", "🙁 Not Satisfied"].map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <textarea className="border p-2 rounded w-full" rows={2} placeholder="Admin Remark (e.g. wrong info by staff, corrected...)" value={jobEdit.adminRemark} onChange={(e) => setJobEdit({ ...jobEdit, adminRemark: e.target.value })} />
                <div className="flex gap-2">
                  <button onClick={saveJobEdit} className="bg-blue-600 text-white px-4 py-2 rounded">Save Changes</button>
                  <button onClick={() => setJobEdit(null)} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
                </div>
              </div>
            )}
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-xl">
                <div><span className="font-medium text-gray-500">Customer:</span> {jobModal.lead?.customerName}</div>
                <div><span className="font-medium text-gray-500">Mobile:</span> <a href={`tel:${jobModal.lead?.mobile}`} className="text-blue-700">{jobModal.lead?.mobile}</a></div>
                <div className="col-span-2"><span className="font-medium text-gray-500">Address:</span> {jobModal.lead?.address}{jobModal.lead?.city ? `, ${jobModal.lead.city}` : ""}</div>
                <div><span className="font-medium text-gray-500">Service:</span> {jobModal.lead?.service || "-"}{jobModal.lead?.subService ? ` · ${jobModal.lead.subService}` : ""}</div>
                <div><span className="font-medium text-gray-500">Lead Status:</span> {jobModal.lead?.status || "-"}</div>
                <div><span className="font-medium text-gray-500">Received:</span> {jobModal.lead?.createdAt ? new Date(jobModal.lead.createdAt).toLocaleString() : "-"}</div>
                <div><span className="font-medium text-gray-500">Source:</span> {jobModal.lead?.source || "-"}</div>
                <div className="col-span-2"><span className="font-medium text-gray-500">Note:</span> {jobModal.lead?.problem || "-"}</div>
                <div className="col-span-2"><span className="font-medium text-gray-500">Location:</span> {jobModal.lead?.locationLink ? <a href={jobModal.lead.locationLink} target="_blank" rel="noreferrer" className="text-blue-700 underline break-all">{jobModal.lead.locationLink}</a> : (jobModal.lead?.lat && jobModal.lead?.lng ? <a href={`https://www.google.com/maps?q=${jobModal.lead.lat},${jobModal.lead.lng}`} target="_blank" rel="noreferrer" className="text-blue-700 underline">Open in Maps</a> : "-")}</div>
              </div>
              {!jobModal.leadOnly && (<>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                <div><span className="font-medium text-gray-500">Technician:</span> {jobModal.outsideTechnician ? `${jobModal.outsideTechnician} (Outside)` : jobModal.staff ? `${jobModal.staff?.name} (${jobModal.staff?.employeeId})` : "-"}</div>
                <div><span className="font-medium text-gray-500">Job Status:</span> {jobModal.status}</div>
                <div><span className="font-medium text-gray-500">Accepted At:</span> {jobModal.acceptedAt ? new Date(jobModal.acceptedAt).toLocaleString() : "-"}</div>
                <div><span className="font-medium text-gray-500">Checked In:</span> {jobModal.checkIn?.time ? new Date(jobModal.checkIn.time).toLocaleString() : "-"}</div>
                <div><span className="font-medium text-gray-500">Completed At:</span> {jobModal.completedAt ? new Date(jobModal.completedAt).toLocaleString() : "-"}</div>
              </div>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                <div><span className="font-medium text-gray-500">Work Description:</span> {jobModal.workDescription || "-"}</div>
                <div><span className="font-medium text-gray-500">Services Done:</span> {(jobModal.servicesDone || []).join(", ") || "-"}</div>
                <div><span className="font-medium text-gray-500">Machine Serial No.:</span> {jobModal.machineSerialNo || jobModal.lead?.machineSerialNo || "-"}</div>
                <div><span className="font-medium text-gray-500">Repair Notes:</span> {jobModal.repairNotes || "-"}</div>
                <div><span className="font-medium text-gray-500">Bill Amount:</span> ₹{jobModal.billAmount || 0}</div>
                <div><span className="font-medium text-gray-500">Received Amount:</span> ₹{jobModal.receivedAmount || 0}</div>
                <div><span className="font-medium text-gray-500">Payment Mode:</span> {jobModal.paymentMode || "-"}</div>
                <div><span className="font-medium text-gray-500">Customer Feedback:</span> {jobModal.customerFeedback || "-"}</div>
                <div className="col-span-2"><span className="font-medium text-amber-700">Admin Remark:</span> {jobModal.adminRemark || "-"}</div>
                <div><span className="font-medium text-gray-500">Rating:</span> {jobModal.rating ? `${"★".repeat(Number(jobModal.rating))} (${jobModal.rating})` : "-"}</div>
                <div><span className="font-medium text-gray-500">Client Experience:</span> {jobModal.clientExperience || "-"}</div>
              </div>
              {[["workingPhotos", "Photos"], ["billPhotos", "Bill Book Photos"], ["beforePhotos", "Before Photos"], ["afterPhotos", "After Photos"]].map(([key, label]) => (
                (jobModal[key]?.length > 0 || jobEdit) && (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{label}</h3>
                      {jobEdit && (
                        <label className={`text-xs px-2 py-1 rounded cursor-pointer ${photoBusy ? "bg-gray-200 text-gray-500" : "bg-blue-50 text-blue-700 hover:bg-blue-100"}`}>
                          {photoBusy ? "Uploading..." : "+ Add Photo"}
                          <input type="file" accept="image/*" multiple className="hidden" disabled={photoBusy} onChange={(e) => { addJobPhotos(key, e.target.files); e.target.value = ""; }} />
                        </label>
                      )}
                    </div>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {(jobModal[key] || []).map((url: string, idx: number) => (
                        <div key={idx} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <a href={getImageUrl(url)} target="_blank" rel="noreferrer" className="block w-full h-full">
                            <img src={getImageUrl(url)} alt={label} className="w-full h-full object-cover" />
                          </a>
                          {jobEdit && (
                            <button type="button" onClick={() => removeJobPhoto(key, url)} title="Remove" className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold leading-none">×</button>
                          )}
                        </div>
                      ))}
                      {jobEdit && !(jobModal[key]?.length) && <div className="col-span-full text-xs text-gray-400">No photos</div>}
                    </div>
                  </div>
                )
              ))}
              </>)}
            </div>
            <div className="mt-6 flex gap-3">
              {!jobModal.leadOnly && (!jobEdit ? (
                <button onClick={startJobEdit} className="bg-amber-500 text-white px-4 py-2 rounded">Edit / Add Remark</button>
              ) : (
                <button onClick={saveJobEdit} className="bg-blue-600 text-white px-4 py-2 rounded">Save Changes</button>
              ))}
              <button onClick={() => { setJobModal(null); setJobEdit(null); }} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
