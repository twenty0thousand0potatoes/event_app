
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  // Removed imageUrl state as photos are stored in event-photo table only
  // const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isPlusSubscriber, setIsPlusSubscriber] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragCounter = useRef(0);
  const [dragging, setDragging] = useState(false);

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
    if (userRole && !["user", "admin", "moderator", "organizer"].includes(userRole)) {
      router.push("/login?reason=unauthorized");
    }
  }, [userRole, router]);

  const maxPhotos = (userRole === "organizer" || isPlusSubscriber) ? 7 : 3;

  const uploadFiles = useCallback(
    async (files: FileList) => {
      if (photoUrls.length + files.length > maxPhotos) {
        setError(`Максимальное количество фото для вашего типа пользователя: ${maxPhotos}`);
        return;
      }
      setUploading(true);
      setError(null);
      try {
        const uploadedUrls: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const formData = new FormData();
          formData.append("file", files[i]);
          const res = await axios.post("http://localhost:3000/events/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          });
          uploadedUrls.push(res.data.url);
        }
          setPhotoUrls(prev => [...prev, ...uploadedUrls]);
          // Removed setting imageUrl as main photo
          // if (!imageUrl && uploadedUrls.length > 0) {
          //   setImageUrl(uploadedUrls[0]);
          // }
      } catch (err) {
        console.error("Ошибка загрузки файла", err);
        setError("Ошибка загрузки файла");
      } finally {
        setUploading(false);
      }
    },
    [photoUrls.length, maxPhotos]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    uploadFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const removePhoto = (index: number) => {
    setPhotoUrls(prev => {
      const newPhotos = [...prev];
      newPhotos.splice(index, 1);
      // Removed imageUrl related logic
      // if (imageUrl === prev[index]) {
      //   setImageUrl(newPhotos.length > 0 ? newPhotos[0] : null);
      // }
      return newPhotos;
    });
  };

  const setMainPhoto = (index: number) => {
    // Removed imageUrl related logic
    // setImageUrl(photoUrls[index]);
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
            photos: photoUrls,
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
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`w-full p-4 border-2 border-dashed rounded cursor-pointer ${
                dragging ? "border-orange-400 bg-orange-900" : "border-orange-500"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <p>Загрузка...</p>
              ) : (
                <p>Перетащите фото сюда или кликните для выбора файлов</p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
            </div>
            <div className="mt-2 flex space-x-2 overflow-x-auto">
            {photoUrls.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Фото ${index + 1}`}
                  className="max-h-48 object-contain rounded cursor-pointer border-4 border-transparent"
                  // Removed imageUrl related conditional border
                  // className={`max-h-48 object-contain rounded cursor-pointer border-4 ${
                  //   imageUrl === url ? "border-orange-500" : "border-transparent"
                  // }`}
                  // Removed onClick handler for setMainPhoto
                  // onClick={() => setMainPhoto(index)}
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                  title="Удалить фото"
                >
                  &times;
                </button>
              </div>
            ))}
            </div>
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
