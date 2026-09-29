"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { getImageUrl } from "@/lib/utils";
import toast from "react-hot-toast";
import { EyeIcon, MapPinIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

const sources = ["website", "call", "whatsapp", "facebook", "instagram", "google_ads", "referral", "manual", "others"];
const priorities = ["low", "medium", "high", "urgent"];

export default function LeadsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlStatus = searchParams.get("status") || "";
  const urlView = searchParams.get("view") || "";

  const [leads, setLeads] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>({ status: "new", priority: "medium", source: "manual" });
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

  const fetchLeads = () => api.get("/leads").then((res) => setLeads(res.data.data));
  const fetchStaff = () => api.get("/staff").then((res) => setStaff(res.data.data));
  const fetchStatuses = () => api.get("/lead-status/all").then((res) => setStatuses(res.data.data));

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
    try {
      await api.post("/leads", form);
      toast.success("Lead created");
      setShowForm(false);
      setForm({ status: "new", priority: "medium", source: "manual" });
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
      toast.error(err.response?.data?.message || "No job found");
    } finally {
      setLoadingJob(false);
    }
  };

  const changeStatus = async (leadId: string, status: string) => {
    try {
      await api.put(`/leads/${leadId}/status`, { status });
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
    const matchesView = !filterView || (filterView === "new" ? isOpenUnassigned(l) && ageHours(l) < 24 : filterView === "pending" ? isOpenUnassigned(l) && ageHours(l) >= 24 : true);
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
            <option value="new">New (last 24 hrs, unassigned)</option>
            <option value="pending">Pending (24 hrs+, unassigned)</option>
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
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow grid md:grid-cols-4 gap-4">
          <input required placeholder="Customer Name*" className="border p-2 rounded" onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
          <input required placeholder="Mobile*" className="border p-2 rounded" onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          <input placeholder="Email" className="border p-2 rounded" onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input required placeholder="Address*" className="border p-2 rounded" onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input required placeholder="City*" className="border p-2 rounded" onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input placeholder="Pin" className="border p-2 rounded" onChange={(e) => setForm({ ...form, pin: e.target.value })} />
          <select className="border p-2 rounded" onChange={(e) => setForm({ ...form, source: e.target.value })}>{sources.map((s) => <option key={s} value={s}>{s}</option>)}</select>
          <select className="border p-2 rounded" onChange={(e) => setForm({ ...form, priority: e.target.value })}>{priorities.map((p) => <option key={p} value={p}>{p}</option>)}</select>
          <select className="border p-2 rounded" onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {statuses.filter((s) => s.isActive).map((s) => <option key={s._id} value={s.name}>{s.label}</option>)}
          </select>
          <input required placeholder="Service Required*" className="border p-2 rounded" onChange={(e) => setForm({ ...form, service: e.target.value })} />
          <input placeholder="Machine Serial No." className="border p-2 rounded" onChange={(e) => setForm({ ...form, machineSerialNo: e.target.value })} />
          <input type="date" placeholder="Preferred Date" className="border p-2 rounded" onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} />
          <input type="number" step="any" placeholder="Latitude" className="border p-2 rounded" onChange={(e) => setForm({ ...form, lat: e.target.value })} />
          <input type="number" step="any" placeholder="Longitude" className="border p-2 rounded" onChange={(e) => setForm({ ...form, lng: e.target.value })} />
          <textarea placeholder="Problem" className="border p-2 rounded md:col-span-2" onChange={(e) => setForm({ ...form, problem: e.target.value })} />
          <button type="submit" className="bg-green-600 text-white p-2 rounded md:col-span-4">Create Lead</button>
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
              <th className="p-3 text-left">Machine Serial No.</th>
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
                  <input className="border p-1 rounded w-32 text-xs" placeholder="Serial No." defaultValue={l.machineSerialNo || ""} onBlur={(e) => { if (e.target.value !== (l.machineSerialNo || "")) updateLead(l._id, { machineSerialNo: e.target.value }); }} />
                </td>
                <td className="p-3">
                  {l.assignedStaff ? (
                    <span className="inline-block px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-medium" title="Status is locked after assignment">
                      {statuses.find((s) => s.name === l.status)?.label || l.status}
                    </span>
                  ) : (
                    <select value={l.status} onChange={(e) => changeStatus(l._id, e.target.value)} className="border p-1 rounded">
                      {statuses.filter((s) => s.isActive).map((s) => <option key={s._id} value={s.name}>{s.label}</option>)}
                    </select>
                  )}
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <select value={assignDraft[l._id] ?? l.assignedStaff?._id ?? ""} onChange={(e) => setAssignDraft({ ...assignDraft, [l._id]: e.target.value })} className="border p-1 rounded">
                      <option value="">Select Staff</option>
                      {staff.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                    <button onClick={() => { assignLead(l._id, assignDraft[l._id] ?? l.assignedStaff?._id ?? ""); setAssignDraft(({ [l._id]: _, ...rest }) => rest); }} className="bg-blue-600 text-white text-xs px-2 rounded">Submit</button>
                  </div>
                </td>
                <td className="p-3 text-xs text-gray-500">
                  {l.acceptedAt ? new Date(l.acceptedAt).toLocaleString() : "-"}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <button onClick={() => viewJob(l._id)} title="View Job" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100"><EyeIcon className="w-4 h-4" /> View</button>
                    <button onClick={() => setLocationModal(l)} title="Set Location" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100"><MapPinIcon className="w-4 h-4" /> Location</button>
                    {l.status !== "closed" && !l.assignedStaff && (
                      <button onClick={() => changeStatus(l._id, "closed")} title="Close Lead" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium bg-green-50 text-green-700 hover:bg-green-100 border border-green-100"><CheckCircleIcon className="w-4 h-4" /> Close</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
              <h2 className="text-xl font-bold">Job Details - {jobModal.lead?.leadId}</h2>
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
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                <div><span className="font-medium text-gray-500">Customer:</span> {jobModal.lead?.customerName}</div>
                <div><span className="font-medium text-gray-500">Mobile:</span> {jobModal.lead?.mobile}</div>
                <div><span className="font-medium text-gray-500">Address:</span> {jobModal.lead?.address}, {jobModal.lead?.city}</div>
                <div><span className="font-medium text-gray-500">Technician:</span> {jobModal.staff?.name} ({jobModal.staff?.employeeId})</div>
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
              {[["workingPhotos", "Photos"], ["beforePhotos", "Before Photos"], ["afterPhotos", "After Photos"]].map(([key, label]) => (
                jobModal[key]?.length > 0 && (
                  <div key={key}>
                    <h3 className="font-semibold mb-2">{label}</h3>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {jobModal[key].map((url: string, idx: number) => (
                        <a key={idx} href={getImageUrl(url)} target="_blank" rel="noreferrer" className="block aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img src={getImageUrl(url)} alt={label} className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              {!jobEdit && <button onClick={startJobEdit} className="bg-amber-500 text-white px-4 py-2 rounded">Edit / Add Remark</button>}
              <button onClick={() => { changeStatus(jobModal.lead._id, "closed"); setJobModal(null); }} className="bg-green-600 text-white px-4 py-2 rounded">Close Lead</button>
              <button onClick={() => { setJobModal(null); setJobEdit(null); }} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
