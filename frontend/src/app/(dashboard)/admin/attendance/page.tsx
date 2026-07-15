"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminAttendance() {
  const [staff, setStaff] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [salary, setSalary] = useState<any[]>([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedStaff, setSelectedStaff] = useState("");
  const [loading, setLoading] = useState(false);
  const [leaveModal, setLeaveModal] = useState<any>(null);

  useEffect(() => {
    api.get("/staff").then((res) => setStaff(res.data.data));
  }, []);

  const fetchData = () => {
    const from = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const to = new Date(year, month, 0).toISOString().split("T")[0];
    const staffQuery = selectedStaff ? `&staff=${selectedStaff}` : "";
    api.get(`/attendance?from=${from}&to=${to}${staffQuery}`).then((res) => setRecords(res.data.data));
    api.get(`/reports/salary?month=${month}&year=${year}${staffQuery}`).then((res) => setSalary(res.data.data));
  };

  useEffect(() => {
    fetchData();
  }, [month, year, selectedStaff]);

  const markLeave = async () => {
    if (!leaveModal.staff || !leaveModal.date) return;
    try {
      await api.post("/attendance/leave", {
        staff: leaveModal.staff,
        date: leaveModal.date,
        leaveType: leaveModal.leaveType || "casual",
        notes: leaveModal.notes,
      });
      toast.success("Leave marked");
      setLeaveModal(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  const exportSalaryCSV = () => {
    const rows = [
      ["Employee ID", "Name", "Monthly Salary", "Days", "Present", "Absent", "Half Day", "Leave", "Deduction Days", "Deduction Amount", "Payable Salary"],
      ...salary.map((s) => [
        s.employeeId, s.name, s.monthlySalary, s.daysInMonth, s.present, s.absent, s.halfDay, s.leave,
        s.deductionDays, s.deductionAmount, s.payableSalary,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `salary-${month}-${year}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Attendance & Salary</h1>

      <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl shadow">
        <select className="border p-2 rounded" value={month} onChange={(e) => setMonth(parseInt(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select className="border p-2 rounded" value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
          {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select className="border p-2 rounded" value={selectedStaff} onChange={(e) => setSelectedStaff(e.target.value)}>
          <option value="">All Staff</option>
          {staff.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.employeeId})</option>)}
        </select>
        <button onClick={fetchData} className="bg-primary-600 text-white px-4 py-2 rounded">Refresh</button>
        <button onClick={() => setLeaveModal({ staff: selectedStaff, date: "", leaveType: "casual", notes: "" })} className="bg-yellow-500 text-white px-4 py-2 rounded">Mark Leave</button>
        <button onClick={exportSalaryCSV} className="bg-green-600 text-white px-4 py-2 rounded">Export Salary</button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-4 border-b font-semibold">Salary Report</div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Staff</th>
                <th className="p-3 text-left">Monthly Salary</th>
                <th className="p-3 text-left">Present</th>
                <th className="p-3 text-left">Absent</th>
                <th className="p-3 text-left">Half Day</th>
                <th className="p-3 text-left">Leave</th>
                <th className="p-3 text-left">Working Hours</th>
                <th className="p-3 text-left">Deduction</th>
                <th className="p-3 text-left">Payable Salary</th>
              </tr>
            </thead>
            <tbody>
              {salary.map((s) => (
                <tr key={s.staffId} className="border-t">
                  <td className="p-3">{s.name} <br /><span className="text-xs text-gray-500">{s.employeeId}</span></td>
                  <td className="p-3">₹{s.monthlySalary}</td>
                  <td className="p-3">{s.present}</td>
                  <td className="p-3 text-red-600">{s.absent}</td>
                  <td className="p-3 text-orange-600">{s.halfDay}</td>
                  <td className="p-3">{s.leave}</td>
                  <td className="p-3">{s.workingHours}</td>
                  <td className="p-3 text-red-600">₹{s.deductionAmount} ({s.deductionDays})</td>
                  <td className="p-3 text-green-600 font-semibold">₹{s.payableSalary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y">
          {salary.map((s) => (
            <div key={s.staffId} className="p-4 space-y-1 text-sm">
              <div className="font-semibold">{s.name} <span className="text-xs text-gray-500">({s.employeeId})</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Monthly Salary</span><span>₹{s.monthlySalary}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Present</span><span>{s.present}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Absent</span><span className="text-red-600">{s.absent}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Half Day</span><span className="text-orange-600">{s.halfDay}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Deduction</span><span className="text-red-600">₹{s.deductionAmount}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Payable</span><span className="text-green-600 font-semibold">₹{s.payableSalary}</span></div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-4 border-b font-semibold">Attendance Records</div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Staff</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Check In</th>
                <th className="p-3 text-left">Check Out</th>
                <th className="p-3 text-left">Hours</th>
                <th className="p-3 text-left">Leave Type</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="p-3">{r.date ? new Date(r.date).toLocaleDateString() : "-"}</td>
                  <td className="p-3">{r.staff?.name} ({r.staff?.employeeId})</td>
                  <td className="p-3 capitalize">{r.status}</td>
                  <td className="p-3">{r.checkIn?.time ? new Date(r.checkIn.time).toLocaleTimeString() : "-"}</td>
                  <td className="p-3">{r.checkOut?.time ? new Date(r.checkOut.time).toLocaleTimeString() : "-"}</td>
                  <td className="p-3">{r.workingHours ?? "-"}</td>
                  <td className="p-3">{r.leaveType || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y">
          {records.map((r) => (
            <div key={r._id} className="p-4 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{r.date ? new Date(r.date).toLocaleDateString() : "-"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Staff</span><span>{r.staff?.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="capitalize">{r.status}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">In</span><span>{r.checkIn?.time ? new Date(r.checkIn.time).toLocaleTimeString() : "-"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Out</span><span>{r.checkOut?.time ? new Date(r.checkOut.time).toLocaleTimeString() : "-"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Hours</span><span>{r.workingHours ?? "-"}</span></div>
            </div>
          ))}
        </div>
      </div>

      {leaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Mark Leave</h2>
            <div className="space-y-3">
              <select className="border p-2 rounded w-full" value={leaveModal.staff} onChange={(e) => setLeaveModal({ ...leaveModal, staff: e.target.value })}>
                <option value="">Select Staff</option>
                {staff.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
              <input type="date" className="border p-2 rounded w-full" value={leaveModal.date} onChange={(e) => setLeaveModal({ ...leaveModal, date: e.target.value })} />
              <select className="border p-2 rounded w-full" value={leaveModal.leaveType} onChange={(e) => setLeaveModal({ ...leaveModal, leaveType: e.target.value })}>
                <option value="sick">Sick</option>
                <option value="casual">Casual</option>
                <option value="paid">Paid</option>
                <option value="holiday">Holiday</option>
              </select>
              <input type="text" placeholder="Notes" className="border p-2 rounded w-full" value={leaveModal.notes} onChange={(e) => setLeaveModal({ ...leaveModal, notes: e.target.value })} />
            </div>
            <div className="mt-4 flex gap-3">
              <button onClick={markLeave} className="bg-primary-600 text-white px-4 py-2 rounded">Save</button>
              <button onClick={() => setLeaveModal(null)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
