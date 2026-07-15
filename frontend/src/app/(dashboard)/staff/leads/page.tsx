"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function StaffLeads() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [report, setReport] = useState<any>({});
  const [photos, setPhotos] = useState<any>({});

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
      ["beforePhotos", "workingPhotos", "afterPhotos"].forEach((field) => {
        if (photos[field]) {
          Array.from(photos[field]).forEach((file: any) => data.append(field, file));
        }
      });
      await api.put(`/jobs/${jobId}/report`, data, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(status === "completed" ? "Job completed" : "Report saved");
      setSelected(null);
      setReport({});
      setPhotos({});
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

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Lead ID</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Address</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j._id} className="border-t">
                <td className="p-3">{j.lead?.leadId}</td>
                <td className="p-3">{j.lead?.customerName} <br /> {j.lead?.mobile}</td>
                <td className="p-3">{j.status}</td>
                <td className="p-3">{j.lead?.address}, {j.lead?.city}</td>
                <td className="p-3 space-x-2">
                  {j.status === "assigned" && (
                    <button onClick={() => acceptJob(j._id)} className="text-primary-600 hover:underline font-medium">Accept</button>
                  )}
                  {j.status === "accepted" && (
                    <button onClick={() => checkIn(j._id)} className="text-blue-600 hover:underline">Check In</button>
                  )}
                  {["working", "started", "on_the_way", "reached", "need_parts", "pending", "follow_up"].includes(j.status) && (
                    <button onClick={() => setSelected(j)} className="text-green-600 hover:underline">Report</button>
                  )}
                  {j.status === "completed" && <span className="text-gray-500">Completed</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
            <h2 className="text-xl font-bold mb-4">Work Report - {selected.lead?.leadId}</h2>
            <div className="space-y-3">
              <textarea placeholder="Work Description" className="border p-2 rounded w-full" onChange={(e) => setReport({ ...report, workDescription: e.target.value })} />
              <textarea placeholder="Repair Notes" className="border p-2 rounded w-full" onChange={(e) => setReport({ ...report, repairNotes: e.target.value })} />
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
              <textarea placeholder="Customer Feedback" className="border p-2 rounded w-full" onChange={(e) => setReport({ ...report, customerFeedback: e.target.value })} />
              <input type="number" placeholder="Rating 1-5" min="1" max="5" className="border p-2 rounded w-full" onChange={(e) => setReport({ ...report, rating: e.target.value })} />

              {["beforePhotos", "workingPhotos", "afterPhotos"].map((field) => (
                <label key={field} className="block text-sm">
                  {field.replace(/([A-Z])/g, " $1")}: <input type="file" multiple className="w-full" onChange={(e) => setPhotos({ ...photos, [field]: e.target.files })} />
                </label>
              ))}
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={() => submitReport(selected._id, "completed")} className="bg-green-600 text-white px-4 py-2 rounded">Complete Job</button>
              <button onClick={() => submitReport(selected._id, "working")} className="bg-blue-600 text-white px-4 py-2 rounded">Save Progress</button>
              <button onClick={() => setSelected(null)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
