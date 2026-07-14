"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>({
    employeeId: "",
    name: "",
    email: "",
    password: "",
    mobile: "",
    address: "",
    role: "technician",
    salary: "",
    joiningDate: "",
    emergencyContact: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    upi: "",
  });
  const [docs, setDocs] = useState<any>({});

  const fetchStaff = () => {
    api.get("/staff").then((res) => setStaff(res.data.data));
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key] !== undefined && form[key] !== "") data.append(key, form[key]);
    });
    ["photo", "aadharFront", "aadharBack", "pan", "drivingLicense"].forEach((field) => {
      if (docs[field]) data.append(field, docs[field]);
    });

    try {
      await api.post("/staff", data, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Staff registered");
      setForm({
        employeeId: "", name: "", email: "", password: "", mobile: "", address: "", role: "technician",
        salary: "", joiningDate: "", emergencyContact: "", bankName: "", accountNumber: "", ifsc: "", upi: "",
      });
      setDocs({});
      fetchStaff();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const deactivate = async (id: string) => {
    if (!confirm("Deactivate this staff?")) return;
    try {
      await api.delete(`/staff/${id}`);
      toast.success("Staff deactivated");
      fetchStaff();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Staff Management</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="font-semibold text-lg">Register New Staff</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input className="border p-2 rounded" placeholder="Employee ID*" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required />
          <input className="border p-2 rounded" placeholder="Name*" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="border p-2 rounded" placeholder="Email*" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="border p-2 rounded" type="password" placeholder="Password*" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <input className="border p-2 rounded" placeholder="Mobile*" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required />
          <input className="border p-2 rounded" placeholder="Address*" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          <select className="border p-2 rounded" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="admin">Admin</option>
            <option value="technician">Staff</option>
          </select>
          <input className="border p-2 rounded" type="number" placeholder="Salary" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
          <input className="border p-2 rounded" type="date" placeholder="Joining Date" value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Emergency Contact" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Bank Name" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Account Number" value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} />
          <input className="border p-2 rounded" placeholder="IFSC" value={form.ifsc} onChange={(e) => setForm({ ...form, ifsc: e.target.value })} />
          <input className="border p-2 rounded" placeholder="UPI ID" value={form.upi} onChange={(e) => setForm({ ...form, upi: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {["photo", "aadharFront", "aadharBack", "pan", "drivingLicense"].map((field) => (
            <label key={field} className="block text-sm">
              {field.replace(/([A-Z])/g, " $1")}: <input type="file" className="w-full" onChange={(e) => setDocs({ ...docs, [field]: e.target.files?.[0] })} />
            </label>
          ))}
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? "Saving..." : "Register Staff"}</button>
      </form>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Emp ID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Mobile</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s._id} className="border-t">
                <td className="p-3">{s.employeeId}</td>
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.user?.email}</td>
                <td className="p-3">{s.mobile}</td>
                <td className="p-3">{s.role}</td>
                <td className="p-3">{s.isActive ? "Active" : "Inactive"}</td>
                <td className="p-3">
                  <button onClick={() => deactivate(s._id)} className="text-red-600">Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
