"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

const SERVICE_OPTIONS = [
  "AC Service",
  "Installation",
  "Uninstallation",
  "Gas Topup",
  "Gas Full Charge",
  "Copper Pipe Fitting",
  "Other",
];

const PHOTO_FIELDS: [string, string][] = [
  ["beforePhotos", "Before Photos"],
  ["workingPhotos", "Working Photos"],
  ["afterPhotos", "After Photos"],
];

export default function StaffLeads() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [report, setReport] = useState<any>({});
  const [photos, setPhotos] = useState<Record<string, File[]>>({});
  const [services, setServices] = useState<string[]>([]);

  const openReport = (job: any) => {
    setSelected(job);
    setServices(job.servicesDone || []);
    setReport({
      machineSerialNo: job.machineSerialNo || job.lead?.machineSerialNo || "",
      customerFeedback: job.customerFeedback || "Customer satisfied with the service",
      rating: job.rating || 5,
    });
    setPhotos({});
  };

  const toggleService = (name: string) =>
    setServices((prev) => (prev.includes(name) ? prev.filter((s) => s !== name) : [...prev, name]));

  const addPhotos = (field: string, files: FileList | null) => {
    if (!files) return;
    setPhotos((prev) => ({ ...prev, [field]: [...(prev[field] || []), ...Array.from(files)] }));
  };

  const removePhoto = (field: string, index: number) =>
    setPhotos((prev) => ({ ...prev, [field]: (prev[field] || []).filter((_, i) => i !== index) }));

  const fetchJobs = () => api.get("/jobs").then((res) => setJobs(res.data.data));

  useEffect(() => {
    fetchJobs();
  }, []);

  const acceptJob = async (jobId: string) => {
    try {
      await api.put(`/jobs/${jobId}/accept`);
      toast.success("Job accepted");
      fetchJobs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const checkIn = async (jobId: string) => {
    try {
      await api.put(`/jobs/${jobId}/checkin`, { lat: 0, lng: 0, address: "" });
      toast.success("Checked in");
      fetchJobs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const submitReport = async (jobId: string, status: string) => {
    try {
      const data = new FormData();
      Object.keys(report).forEach((key) => {
        if (report[key] !== undefined && report[key] !== "") data.append(key, report[key]);
      });
      data.append("status", status);
      data.append("servicesDone", JSON.stringify(services));
      PHOTO_FIELDS.forEach(([field]) => {
        (photos[field] || []).forEach((file) => data.append(field, file));
      });
      await api.put(`/jobs/${jobId}/report`, data, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(status === "completed" ? "Job completed" : "Report saved");
      setSelected(null);
      setReport({});
      setPhotos({});
      setServices([]);
      fetchJobs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const followUpsToday = jobs.filter((j) => j.lead?.followUpDate && j.lead.followUpDate.split("T")[0] === today);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Assigned Jobs</h1>

      {followUpsToday.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-300 p-4 rounded-xl">
          <h2 className="font-semibold text-yellow-800">Today's Follow-ups ({followUpsToday.length})</h2>
          <div className="space-y-1 mt-2">
            {followUpsToday.map((j) => (
              <div key={j._id} className="text-sm text-yellow-900">
                {j.lead?.customerName} - {j.lead?.mobile} - {j.lead?.followUpNote}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Lead ID</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Machine Serial No.</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Address</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j._id} className="border-t">
                  <td className="p-3">{j.lead?.leadId}</td>
                  <td className="p-3">
                    <div className="font-medium">{j.lead?.customerName}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <a href={`tel:${j.lead?.mobile}`} className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                        <span>{j.lead?.mobile}</span>
                        <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs">Call</span>
                      </a>
                    </div>
                  </td>
                  <td className="p-3">{j.machineSerialNo || j.lead?.machineSerialNo || "-"}</td>
                  <td className="p-3">{j.status}</td>
                  <td className="p-3">
                    <div>{j.lead?.address}, {j.lead?.city}</div>
                    {(j.lead?.lat || j.lead?.lng) && (
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${j.lead?.lat},${j.lead?.lng}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-green-600 hover:underline text-sm mt-1">
                        Directions
                      </a>
                    )}
                  </td>
                  <td className="p-3 space-x-2">
                    {j.status === "assigned" && (
                      <button onClick={() => acceptJob(j._id)} className="text-primary-600 hover:underline font-medium">Accept</button>
                    )}
                    {j.status === "accepted" && (
                      <button onClick={() => checkIn(j._id)} className="text-blue-600 hover:underline">Check In</button>
                    )}
                    {["working", "started", "on_the_way", "reached", "half_done", "need_parts", "pending", "follow_up"].includes(j.status) && (
                      <button onClick={() => openReport(j)} className="text-green-600 hover:underline">Report</button>
                    )}
                    {j.status === "completed" && <span className="text-gray-500">Completed</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y">
          {jobs.map((j) => (
            <div key={j._id} className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold">{j.lead?.customerName}</div>
                  <div className="text-xs text-gray-500">{j.lead?.leadId}</div>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded bg-gray-100">{j.status}</span>
              </div>
              <a href={`tel:${j.lead?.mobile}`} className="inline-flex items-center gap-2 text-blue-600 text-sm">
                <span className="bg-green-600 text-white px-2 py-0.5 rounded text-xs">Call Now</span>
                {j.lead?.mobile}
              </a>
              <div className="text-sm text-gray-600">{j.lead?.address}, {j.lead?.city}</div>
              <div className="text-xs text-gray-500">Machine Serial No.: {j.machineSerialNo || j.lead?.machineSerialNo || "-"}</div>
              {(j.lead?.lat || j.lead?.lng) && (
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${j.lead?.lat},${j.lead?.lng}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-green-600 text-sm">
                  Google Map Directions
                </a>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                {j.status === "assigned" && (
                  <button onClick={() => acceptJob(j._id)} className="bg-primary-600 text-white px-3 py-1 rounded text-sm">Accept</button>
                )}
                {j.status === "accepted" && (
                  <button onClick={() => checkIn(j._id)} className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Check In</button>
                )}
                {["working", "started", "on_the_way", "reached", "half_done", "need_parts", "pending", "follow_up"].includes(j.status) && (
                  <button onClick={() => openReport(j)} className="bg-green-600 text-white px-3 py-1 rounded text-sm">Report</button>
                )}
                {j.status === "completed" && <span className="text-gray-500 text-sm">Completed</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">Work Report - {selected.lead?.leadId}</h2>
            <div className="space-y-3">
              <textarea placeholder="Work Description" className="border p-2 rounded w-full" onChange={(e) => setReport({ ...report, workDescription: e.target.value })} />
              <div className="border rounded p-3">
                <div className="text-sm font-medium mb-2">Services (select one or more)</div>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_OPTIONS.map((name) => {
                    const active = services.includes(name);
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => toggleService(name)}
                        className={`px-3 py-1 rounded-full text-sm border ${active ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                      >
                        {active ? "✓ " : "+ "}{name}
                      </button>
                    );
                  })}
                </div>
                {services.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {services.map((name) => (
                      <span key={name} className="inline-flex items-center gap-1 bg-green-50 text-green-800 border border-green-200 px-2 py-1 rounded text-xs">
                        {name}
                        <button type="button" onClick={() => toggleService(name)} className="text-red-600 font-bold" aria-label={`Remove ${name}`}>×</button>
                      </span>
                    ))}
                  </div>
                )}
                {services.includes("Other") && (
                  <input placeholder="Other service details" className="border p-2 rounded w-full mt-3" onChange={(e) => setReport({ ...report, repairNotes: e.target.value })} />
                )}
              </div>
              <input placeholder="Machine Serial No." className="border p-2 rounded w-full" value={report.machineSerialNo || ""} onChange={(e) => setReport({ ...report, machineSerialNo: e.target.value })} />
              <input placeholder="Gas Filled" className="border p-2 rounded w-full" onChange={(e) => setReport({ ...report, gasFilled: e.target.value })} />
              <input type="number" placeholder="Bill Amount" className="border p-2 rounded w-full" onChange={(e) => setReport({ ...report, billAmount: e.target.value })} />
              <input type="number" placeholder="Received Amount" className="border p-2 rounded w-full" onChange={(e) => setReport({ ...report, receivedAmount: e.target.value })} />
              <select className="border p-2 rounded w-full" onChange={(e) => setReport({ ...report, paymentMode: e.target.value })}>
                <option value="">Payment Mode</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="online">Online</option>
              </select>
              <textarea placeholder="Customer Feedback" className="border p-2 rounded w-full" value={report.customerFeedback || ""} onChange={(e) => setReport({ ...report, customerFeedback: e.target.value })} />
              <input type="number" placeholder="Rating 1-5" min="1" max="5" className="border p-2 rounded w-full" value={report.rating || ""} onChange={(e) => setReport({ ...report, rating: e.target.value })} />

              {PHOTO_FIELDS.map(([field, label]) => {
                const list = photos[field] || [];
                return (
                  <div key={field} className="border rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{label} ({list.length})</span>
                      <label className="cursor-pointer bg-blue-600 text-white px-3 py-1 rounded text-sm">
                        + Add Photo
                        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { addPhotos(field, e.target.files); e.target.value = ""; }} />
                      </label>
                    </div>
                    {list.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {list.map((file, i) => (
                          <div key={`${file.name}-${i}`} className="relative">
                            <img src={URL.createObjectURL(file)} alt={file.name} className="w-16 h-16 object-cover rounded border" />
                            <button type="button" onClick={() => removePhoto(field, i)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs leading-5" aria-label="Remove photo">×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={() => submitReport(selected._id, "completed")} className="bg-green-600 text-white px-4 py-2 rounded">Complete Job</button>
              <button onClick={() => submitReport(selected._id, "half_done")} className="bg-orange-500 text-white px-4 py-2 rounded">Half Done</button>
              <button onClick={() => submitReport(selected._id, "working")} className="bg-blue-600 text-white px-4 py-2 rounded">Save Progress</button>
              <button onClick={() => { setSelected(null); setPhotos({}); setServices([]); setReport({}); }} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
