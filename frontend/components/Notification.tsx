"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function NotificationsBlock() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://localhost:3000/notifications", { 
          withCredentials: true 
        });
        setNotifications(res.data);
      } catch (err) {
        setError("Не удалось загрузить уведомления");
        console.error("Ошибка загрузки уведомлений:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    const interval =  0
    
    //setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notifications.length === 0 ? (
        <div className="text-center py-4 text-gray-400">
          Нет новых уведомлений
        </div>
      ) : (
        <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {notifications.map((notification) => (
            <li 
              key={notification.id} 
              className="border border-gray-700 rounded-lg p-3 hover:bg-gray-700 transition"
            >
              <p className="text-gray-300">{notification.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}