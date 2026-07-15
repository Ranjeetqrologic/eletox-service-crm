"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function StaffAttendance() {
  const [todayStatus, setTodayStatus] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [salary, setSalary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const fetchAttendance = () => {
    const from = new Date(currentYear, currentMonth - 1, 1).toISOString().split("T")[0];
    const to = new Date(currentYear, currentMonth, 0).toISOString().split("T")[0];
    api.get(`/attendance?from=${from}&to=${to}`).then((res) => {
      setRecords(res.data.data);
      const todayRec = res.data.data.find((r: any) => r.date?.split("T")[0] === today);
      setTodayStatus(todayRec || null);
    });
  };

  const fetchSalary = () => {
    api.get(`/reports/salary?month=${currentMonth}&year=${currentYear}`).then((res) => {
      setSalary(res.data.data[0] || null);
    });
  };

  useEffect(() => {
    fetchAttendance();
    fetchSalary();
  }, []);

  const checkIn = async () => {
    setLoading(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            await api.post("/attendance/checkin", { lat: pos.coords.latitude, lng: pos.coords.longitude });
            toast.success("Check-in marked");
            fetchAttendance();
          },
          async () => {
            await api.post("/attendance/checkin", {});
            toast.success("Check-in marked");
            fetchAttendance();
          }
        );
      } else {
        await api.post("/attendance/checkin", {});
        toast.success("Check-in marked");
        fetchAttendance();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const checkOut = async () => {
    setLoading(true);
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            await api.post("/attendance/checkout", { lat: pos.coords.latitude, lng: pos.coords.longitude });
            toast.success("Check-out marked");
            fetchAttendance();
          },
          async () => {
            await api.post("/attendance/checkout", {});
            toast.success("Check-out marked");
            fetchAttendance();
          }
        );
      } else {
        await api.post("/attendance/checkout", {});
        toast.success("Check-out marked");
        fetchAttendance();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Attendance</h1>

      <div className="bg-white p-5 rounded-xl shadow space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-500">Today</div>
            <div className="text-lg font-semibold">{today}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Status</div>
            <div className={`text-lg font-semibold capitalize ${todayStatus ? "text-green-600" : "text-red-600"}`}>
              {todayStatus ? todayStatus.status : "Not marked"}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={checkIn} disabled={loading || todayStatus?.checkIn} className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50">
            {todayStatus?.checkIn ? "Checked In" : "Check In"}
          </button>
          <button onClick={checkOut} disabled={loading || !todayStatus?.checkIn || todayStatus?.checkOut} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">
            {todayStatus?.checkOut ? "Checked Out" : "Check Out"}
          </button>
        </div>
      </div>

      {salary && (
        <div className="bg-white p-5 rounded-xl shadow">
          <h2 className="font-semibold text-lg mb-3">Salary Summary - {currentMonth}/{currentYear}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded"><span className="text-gray-500">Monthly Salary</span><div className="font-semibold">₹{salary.monthlySalary}</div></div>
            <div className="bg-gray-50 p-3 rounded"><span className="text-gray-500">Present Days</span><div className="font-semibold">{salary.present}</div></div>
            <div className="bg-gray-50 p-3 rounded"><span className="text-gray-500">Absent</span><div className="font-semibold text-red-600">{salary.absent}</div></div>
            <div className="bg-gray-50 p-3 rounded"><span className="text-gray-500">Half Day</span><div className="font-semibold text-orange-600">{salary.halfDay}</div></div>
            <div className="bg-gray-50 p-3 rounded"><span className="text-gray-500">Deduction</span><div className="font-semibold text-red-600">₹{salary.deductionAmount}</div></div>
            <div className="bg-gray-50 p-3 rounded"><span className="text-gray-500">Payable Salary</span><div className="font-semibold text-green-600">₹{salary.payableSalary}</div></div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-4 border-b font-semibold">Attendance History</div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Check In</th>
                <th className="p-3 text-left">Check Out</th>
                <th className="p-3 text-left">Working Hours</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="p-3">{r.date ? new Date(r.date).toLocaleDateString() : "-"}</td>
                  <td className="p-3 capitalize">{r.status}</td>
                  <td className="p-3">{r.checkIn?.time ? new Date(r.checkIn.time).toLocaleTimeString() : "-"}</td>
                  <td className="p-3">{r.checkOut?.time ? new Date(r.checkOut.time).toLocaleTimeString() : "-"}</td>
                  <td className="p-3">{r.workingHours ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y">
          {records.map((r) => (
            <div key={r._id} className="p-4 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Date</span><span>{r.date ? new Date(r.date).toLocaleDateString() : "-"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="capitalize font-medium">{r.status}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Check In</span><span>{r.checkIn?.time ? new Date(r.checkIn.time).toLocaleTimeString() : "-"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Check Out</span><span>{r.checkOut?.time ? new Date(r.checkOut.time).toLocaleTimeString() : "-"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Hours</span><span>{r.workingHours ?? "-"}</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
