"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { homeForRole } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";

const availablePermissions = [
  "dashboard", "leads", "lead_status", "staff", "roles", "services",
  "payments", "reports", "settings", "banners", "gallery",
];

export default function StaffPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [staff, setStaff] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showKyc, setShowKyc] = useState<any>(null);
  const [roleEdit, setRoleEdit] = useState<any>(null);
  const [roleForm, setRoleForm] = useState<{ roleId: string; role: string; permissions: string[] }>({ roleId: "", role: "", permissions: [] });
  const [roleSaving, setRoleSaving] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({
    employeeId: "",
    name: "",
    email: "",
    password: "",
    mobile: "",
    address: "",
    role: "",
    roleId: "",
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
  const fetchRoles = () => {
    api.get("/roles/all").then((res) => setRoles(res.data.data));
  };

  useEffect(() => {
    fetchStaff();
    fetchRoles();
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
      if (editing) {
        await api.put(`/staff/${editing._id}`, data, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Staff updated");
      } else {
        await api.post("/staff", data, { headers: { "Content-Type": "multipart/form-data" } });
        toast.success("Staff registered");
      }
      resetForm();
      fetchStaff();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditing(null);
    setForm({
      employeeId: "", name: "", email: "", password: "", mobile: "", address: "", role: "", roleId: "",
      joiningDate: "", emergencyContact: "", bankName: "", accountNumber: "", ifsc: "", upi: "",
    });
    setDocs({});
  };

  const startEdit = (s: any) => {
    const current = roles.find((r) => r._id === s.roleId) || roles.find((r) => r.name === s.role);
    setEditing(s);
    setForm({
      employeeId: s.employeeId || "",
      name: s.name || "",
      email: s.user?.email || s.email || "",
      password: "",
      mobile: s.mobile || "",
      address: s.address || "",
      role: s.role || "",
      roleId: current?._id || "",
      joiningDate: s.joiningDate ? String(s.joiningDate).slice(0, 10) : "",
      emergencyContact: s.emergencyContact || "",
      bankName: s.bankDetails?.bankName || "",
      accountNumber: s.bankDetails?.accountNumber || "",
      ifsc: s.bankDetails?.ifsc || "",
      upi: s.bankDetails?.upi || "",
    });
    setDocs({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const loginAs = async (userId: string) => {
    try {
      const { data } = await api.post(`/auth/impersonate/${userId}`);
      setAuth(data.user, data.token);
      toast.success("Logged in as staff");
      router.replace(homeForRole(data.user.role));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const openRoleEdit = (s: any) => {
    const current = roles.find((r) => r._id === s.roleId) || roles.find((r) => r.name === s.role);
    setRoleForm({ roleId: current?._id || "", role: current?.name || s.role || "", permissions: current?.permissions || [] });
    setRoleEdit(s);
  };

  const selectRole = (roleId: string) => {
    const r = roles.find((x) => x._id === roleId);
    setRoleForm({ roleId, role: r?.name || "", permissions: r?.permissions || [] });
  };

  const togglePermission = (perm: string) => {
    const perms = new Set(roleForm.permissions);
    if (perms.has(perm)) perms.delete(perm); else perms.add(perm);
    setRoleForm({ ...roleForm, permissions: Array.from(perms) });
  };

  const saveRole = async () => {
    if (!roleForm.roleId) return toast.error("Select a role");
    setRoleSaving(true);
    try {
      await api.put(`/roles/${roleForm.roleId}`, { permissions: roleForm.permissions });
      await api.put(`/staff/${roleEdit._id}`, { role: roleForm.role, roleId: roleForm.roleId });
      toast.success("Role & permissions updated");
      setRoleEdit(null);
      fetchStaff();
      fetchRoles();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setRoleSaving(false);
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
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">{editing ? `Edit Staff - ${editing.name}` : "Register New Staff"}</h2>
          {editing && <button type="button" onClick={resetForm} className="text-sm text-gray-500 hover:underline">Cancel edit</button>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input className="border p-2 rounded" placeholder="Employee ID*" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required />
          <input className="border p-2 rounded" placeholder="Name*" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="border p-2 rounded" placeholder="Email*" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="border p-2 rounded" type="password" placeholder={editing ? "New Password (leave blank to keep)" : "Password*"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editing} />
          <input className="border p-2 rounded" placeholder="Mobile*" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} required />
          <input className="border p-2 rounded" placeholder="Address*" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          <select
            className="border p-2 rounded"
            value={form.roleId}
            onChange={(e) => {
              const role = roles.find((r) => r._id === e.target.value);
              setForm({ ...form, roleId: e.target.value, role: role?.name || "" });
            }}
          >
            <option value="">Select Role</option>
            {roles.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
          </select>
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
        <div className="flex gap-2">
          <button className="bg-primary-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? "Saving..." : editing ? "Update Staff" : "Register Staff"}</button>
          {editing && <button type="button" onClick={resetForm} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>}
        </div>
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
                <td className="p-3 space-x-2">
                  {s.user?._id && (
                    <button onClick={() => loginAs(s.user._id)} className="text-blue-600 hover:underline">Login As</button>
                  )}
                  <button onClick={() => startEdit(s)} className="text-indigo-600 hover:underline">Edit</button>
                  <button onClick={() => setShowKyc(s)} className="text-green-600 hover:underline">KYC & Bank</button>
                  <button onClick={() => openRoleEdit(s)} className="text-purple-600 hover:underline">Role & Permissions</button>
                  <button onClick={() => deactivate(s._id)} className="text-red-600 hover:underline">Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {roleEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Role & Permissions - {roleEdit.name}</h2>
              <button onClick={() => setRoleEdit(null)} className="text-gray-500 hover:text-gray-700">Close</button>
            </div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select className="border p-2 rounded w-full mb-4" value={roleForm.roleId} onChange={(e) => selectRole(e.target.value)}>
              <option value="">Select Role</option>
              {roles.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
            <div className="font-medium text-sm mb-2">Permissions</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm mb-4">
              {availablePermissions.map((perm) => (
                <label key={perm} className="flex items-center gap-2">
                  <input type="checkbox" checked={roleForm.permissions.includes(perm)} onChange={() => togglePermission(perm)} disabled={!roleForm.roleId} />
                  <span className="capitalize">{perm.replace("_", " ")}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mb-4">Permissions apply to the selected role (all staff with this role).</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setRoleEdit(null)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
              <button onClick={saveRole} disabled={roleSaving} className="bg-primary-600 text-white px-4 py-2 rounded">{roleSaving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {showKyc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">KYC & Bank Details - {showKyc.name}</h2>
              <button onClick={() => setShowKyc(null)} className="text-gray-500 hover:text-gray-700">Close</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span className="font-medium text-gray-500">Employee ID:</span> {showKyc.employeeId}</div>
              <div><span className="font-medium text-gray-500">Mobile:</span> {showKyc.mobile}</div>
              <div className="md:col-span-2"><span className="font-medium text-gray-500">Address:</span> {showKyc.address}</div>
              <div><span className="font-medium text-gray-500">Bank Name:</span> {showKyc.bankDetails?.bankName || "-"}</div>
              <div><span className="font-medium text-gray-500">Account Number:</span> {showKyc.bankDetails?.accountNumber || "-"}</div>
              <div><span className="font-medium text-gray-500">IFSC:</span> {showKyc.bankDetails?.ifsc || "-"}</div>
              <div><span className="font-medium text-gray-500">UPI:</span> {showKyc.bankDetails?.upi || "-"}</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              {["photo", "aadharFront", "aadharBack", "pan", "drivingLicense"].map((field) => (
                <div key={field}>
                  <div className="text-xs text-gray-500 capitalize mb-1">{field.replace(/([A-Z])/g, " $1")}</div>
                  {showKyc[field] ? (
                    <a href={showKyc[field]} target="_blank" rel="noreferrer" className="text-blue-600 text-sm hover:underline">View</a>
                  ) : (
                    <span className="text-gray-400 text-sm">Not uploaded</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
