"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import YandexMap from "../../../components/YandexMap";

export default function CreateEventPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(50);
  const [type, setType] = useState("regular");
  const [price, setPrice] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isPlusSubscriber, setIsPlusSubscriber] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:3000/users/me", {
          withCredentials: true,
        });

        setUserRole(res.data.role);
        setIsPlusSubscriber(res.data.isPlusSubscriber || false);
        setLoading(false);
      } catch {
        router.push("/login?reason=unauthorized");
      }
    };

    fetchUser();
  }, [router]);

  useEffect(() => {
    if (userRole && !["user", "admin", "moderator"].includes(userRole)) {
      router.push("/login?reason=unauthorized");
    }
  }, [userRole, router]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await axios.post("http://localhost:3000/events/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setImageUrl(res.data.url);
    } catch (err) {
      console.error("Ошибка загрузки файла", err);
      setError("Ошибка загрузки файла");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (userRole === "user" && !isPlusSubscriber) {
      if (type === "premium") {
        setError('Мероприятия типа "Премиум" доступны только для пользователей с подпиской Plus');
        setLoading(false);
        return;
      }
      if (price > 0) {
        setError('Платные мероприятия доступны только для пользователей с подпиской Plus');
        setLoading(false);
        return;
      }
    }

    try {
      const response = await axios.post(
        "http://localhost:3000/events",
        {
          title,
          description,
          date,
          maxParticipants,
          type,
          price,
          imageUrl,
          latitude,
          longitude,
        },
        { withCredentials: true }
      );

      if (response.status !== 201 && response.status !== 200) {
        setError("Ошибка при создании мероприятия");
        setLoading(false);
        return;
      }

      router.push("/events");
    } catch (err: any) {
      setError(err.response?.data?.message || "Ошибка при создании мероприятия");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-8 text-white">
      <div className="max-w-3xl mx-auto bg-black p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-semibold mb-6">Создать мероприятие</h1>
        {error && <p className="mb-4 text-orange-500">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-medium">Название</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-orange-500 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border border-orange-500 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white"
              rows={4}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Дата и время</label>
            <input
              type="datetime-local"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border border-orange-500 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Максимальное количество участников</label>
            <input
              type="number"
              min={1}
              max={1000}
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(Number(e.target.value))}
              className="w-full p-2 border border-orange-500 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Тип мероприятия</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 border border-orange-500 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white"
              disabled={userRole === "user" && !isPlusSubscriber}
            >
              <option value="regular">Обычные</option>
              <option value="online">Онлайн</option>
              {userRole !== "user" && <option value="premium">Премиум</option>}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">Цена</label>
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full p-2 border border-orange-500 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white"
              disabled={userRole === "user" && !isPlusSubscriber}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Место проведения</label>
            <YandexMap onLocationSelect={(lat, lon) => { setLatitude(lat); setLongitude(lon); }} />
            {latitude && longitude && (
              <p className="mt-2">Выбранные координаты: {latitude.toFixed(6)}, {longitude.toFixed(6)}</p>
            )}
          </div>
          <div>
            <label className="block mb-1 font-medium">Фото мероприятия</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border border-orange-500 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white"
              disabled={uploading}
            />
            {uploading && <p>Загрузка...</p>}
            {imageUrl && (
              <img src={imageUrl} alt="Фото мероприятия" className="mt-2 max-h-48 object-contain" />
            )}
          </div>
          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full bg-orange-500 text-black py-2 rounded hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? "Создание..." : "Создать"}
          </button>
        </form>
      </div>
    </div>
  );
}
