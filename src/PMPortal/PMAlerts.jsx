import { useEffect, useState } from "react";
import api from "../Api/api";
import { HiOutlineBell } from "react-icons/hi";

export default function PMAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get("/pm/alerts");
        setAlerts(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/pm/alerts/${id}/read`);
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#C5A572]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6 flex items-center gap-2">
        <HiOutlineBell className="text-[#C5A572]" /> Alerts & Notifications
      </h1>

      {alerts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <HiOutlineBell className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No alerts at the moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-xl shadow-sm border p-4 flex items-start gap-3 cursor-pointer transition-colors ${
                alert.isRead ? "border-gray-100" : "border-[#C5A572]/30 bg-[#FAF7F2]"
              }`}
              onClick={() => !alert.isRead && markAsRead(alert.id)}
            >
              <div className={`w-2 h-2 rounded-full mt-2 ${alert.isRead ? "bg-gray-300" : "bg-[#C5A572]"}`}></div>
              <div className="flex-1">
                <p className={`text-sm ${alert.isRead ? "text-gray-600" : "text-[#1A1A1A] font-medium"}`}>
                  {alert.title || alert.message}
                </p>
                {alert.description && <p className="text-xs text-gray-500 mt-1">{alert.description}</p>}
                <p className="text-xs text-gray-400 mt-1">{new Date(alert.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
