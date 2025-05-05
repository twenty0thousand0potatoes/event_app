"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id;

  const [event, setEvent] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventRes, userRes] = await Promise.all([
          axios.get(`http://localhost:3000/events/${eventId}`, { withCredentials: true }),
          axios.get("http://localhost:3000/users/me", { withCredentials: true }),
        ]);
        setEvent(eventRes.data);
        setUser(userRes.data);
        console.log("User:", userRes.data);
        console.log("Event Creator:", eventRes.data.creator);
      } catch (err: any) {
        setError(err.response?.data?.message || "Ошибка загрузки данных");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  }

  if (!event) {
    return <div className="min-h-screen flex items-center justify-center">Мероприятие не найдено</div>;
  }

  const isCreator = Number(user?.sub) === Number(event.creator?.id);



  return (
    <div className="min-h-screen bg-gray-100 px-4 py-8 text-black">
      <div className="max-w-7xl mx-auto bg-white p-8 rounded-2xl shadow-xl space-y-8">
        <h1 className="text-4xl font-bold mb-6">{event.title}</h1>
        {event.imageUrl && (
          <img src={event.imageUrl} alt={event.title} className="mb-8 w-full max-h-96 object-cover rounded-lg" />
        )}
        <p className="mb-4 text-lg"><strong>Описание:</strong> {event.description}</p>
        <p className="mb-4 text-lg"><strong>Дата:</strong> {new Date(event.date).toLocaleString()}</p>
        <p className="mb-4 text-lg"><strong>Максимальное количество участников:</strong> {event.maxParticipants}</p>
        <p className="mb-4 text-lg"><strong>Тип мероприятия:</strong> {event.type}</p>
        <p className="mb-4 text-lg"><strong>Цена:</strong> {event.price} ₽</p>
        <p className="mb-4 text-lg"><strong>Организатор:</strong> {event.creator?.username || "Неизвестный организатор"}</p>

        {isCreator && (
          <button
            onClick={() => router.push(`/events/${eventId}/edit`)}
            className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Редактировать мероприятие
          </button>
        )}
      </div>
    </div>
  );
}
