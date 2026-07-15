"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

const availablePermissions = [
  "dashboard",
  "leads",
  "lead_status",
  "staff",
  "roles",
  "services",
  "payments",
  "reports",
  "settings",
  "banners",
  "gallery",
];

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [form, setForm] = useState<any>({ name: "", permissions: [], isDefault: false });
  const [editing, setEditing] = useState<any>(null);

  const fetchRoles = () => api.get("/roles/all").then((res) => setRoles(res.data.data));

  useEffect(() => {
    fetchRoles();
  }, []);

  const togglePermission = (perm: string) => {
    const perms = new Set(form.permissions || []);
    if (perms.has(perm)) perms.delete(perm);
    else perms.add(perm);
    setForm({ ...form, permissions: Array.from(perms) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/roles/${editing._id}`, form);
        toast.success("Role updated");
      } else {
        await api.post("/roles", { ...form, name: form.name.toLowerCase() });
        toast.success("Role created");
      }
      setForm({ name: "", permissions: [], isDefault: false });
      setEditing(null);
      fetchRoles();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const editRole = (r: any) => {
    setEditing(r);
    setForm({ name: r.name, permissions: r.permissions || [], isDefault: r.isDefault });
  };

  const deleteRole = async (id: string) => {
    if (!confirm("Delete this role?")) return;
    try {
      await api.delete(`/roles/${id}`);
      toast.success("Role deleted");
      fetchRoles();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Role Management</h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <input required disabled={!!editing} placeholder="Role name" className="border p-2 rounded" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
            Default Role
          </label>
        </div>
        <div>
          <div className="font-medium mb-2">Permissions</div>
          <div className="flex flex-wrap gap-3">
            {availablePermissions.map((perm) => (
              <label key={perm} className="flex items-center gap-1 text-sm bg-gray-50 px-2 py-1 rounded">
                <input type="checkbox" checked={(form.permissions || []).includes(perm)} onChange={() => togglePermission(perm)} />
                {perm.replace("_", " ")}
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded">{editing ? "Update" : "Create"}</button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: "", permissions: [], isDefault: false }); }} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>}
        </div>
      </form>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Permissions</th>
              <th className="p-3 text-left">Default</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="p-3 capitalize">{r.name}</td>
                <td className="p-3">{(r.permissions || []).join(", ")}</td>
                <td className="p-3">{r.isDefault ? "Yes" : "No"}</td>
                <td className="p-3 space-x-2">
                  <button onClick={() => editRole(r)} className="text-blue-600 hover:underline">Edit</button>
                  {!r.isDefault && <button onClick={() => deleteRole(r._id)} className="text-red-600 hover:underline">Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
