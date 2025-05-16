"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import YandexMap from "../../../../components/YandexMap";
import { Toaster, toast } from "react-hot-toast";

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(50);
  const [type, setType] = useState("regular");
  const [price, setPrice] = useState(0);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isPlusSubscriber, setIsPlusSubscriber] = useState(false);
  const [isCreator, setIsCreator] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dragCounter = useRef(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventRes, userRes] = await Promise.all([
          axios.get(`http://localhost:3000/events/${eventId}`, { withCredentials: true }),
          axios.get("http://localhost:3000/users/me", { withCredentials: true }),
        ]);
        const eventData = eventRes.data;
        let userData = userRes.data;
        
        if (!userData.sub && userData.id) {
          userData = { ...userData, sub: userData.id };
        }

        setTitle(eventData.title || "");
        setDescription(eventData.description || "");
        setDate(eventData.date ? new Date(eventData.date).toISOString().slice(0,16) : "");
        setMaxParticipants(eventData.maxParticipants || 50);
        setType(eventData.type || "regular");
        setPrice(eventData.price || 0);
        setPhotoUrls(eventData.photos?.map((p: any) => p.url) || []);
        setLatitude(eventData.latitude || null);
        setLongitude(eventData.longitude || null);
        setUserRole(userData.role);
        setIsPlusSubscriber(userData.isPlusSubscriber || false);
        setIsCreator(Number(userData.sub) === Number(eventData.creator?.id));

        if (Number(userData.sub) !== Number(eventData.creator?.id)) {
          toast.error("У вас нет прав на редактирование этого мероприятия");
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Ошибка загрузки данных");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const maxPhotos = (userRole === "organizer" || isPlusSubscriber) ? 7 : 3;

  const uploadFiles = useCallback(
    async (files: FileList) => {
      if (photoUrls.length + files.length > maxPhotos) {
        toast.error(`Максимальное количество фото: ${maxPhotos}`);
        return;
      }
      setUploading(true);
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
        toast.success(`Загружено ${files.length} фото`);
      } catch (err) {
        console.error("Ошибка загрузки файла", err);
        toast.error("Ошибка загрузки файла");
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
      return newPhotos;
    });
    toast.success("Фото удалено");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!isCreator) {
      toast.error("У вас нет прав на редактирование этого мероприятия");
      setLoading(false);
      return;
    }

    if (userRole === "user" && !isPlusSubscriber) {
      if (type === "premium") {
        toast.error('Мероприятия типа "Премиум" доступны только для пользователей с подпиской Plus');
        setLoading(false);
        return;
      }
      if (price > 0) {
        toast.error('Платные мероприятия доступны только для пользователей с подпиской Plus');
        setLoading(false);
        return;
      }
    }

    try {
      const response = await axios.put(
        `http://localhost:3000/events/${eventId}`,
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

      toast.success("Мероприятие успешно обновлено!");
      setTimeout(() => {
        router.push(`/events/${eventId}`);
      }, 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Ошибка при обновлении мероприятия");
      setLoading(false);
    }
  };

  if (loading && !isCreator) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-b from-black to-gray-900">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isCreator) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-b from-black to-gray-900 p-4">
        <div className="max-w-md w-full bg-gray-800 p-6 rounded-xl text-center">
          <h2 className="text-2xl font-bold text-orange-500 mb-4">Доступ запрещен</h2>
          <p className="mb-6">У вас нет прав для редактирования этого мероприятия</p>
          <button
            onClick={() => router.push("/events")}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
          >
            Вернуться к мероприятиям
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 px-4 py-8 text-white">
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#1f2937',
          color: '#fff',
          border: '1px solid #f97316',
        }
      }} />
      
      <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-orange-500">Редактировать мероприятие</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-medium">Название *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-700 text-white"
                placeholder="Введите название"
              />
            </div>
            
            <div>
              <label className="block mb-2 font-medium">Дата и время *</label>
              <input
                type="datetime-local"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-700 text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block mb-2 font-medium">Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-700 text-white"
              rows={5}
              placeholder="Расскажите о вашем мероприятии"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block mb-2 font-medium">Макс. участников</label>
              <input
                type="number"
                min={1}
                max={1000}
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                className="w-full p-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-700 text-white"
              />
            </div>
            
            <div>
              <label className="block mb-2 font-medium">Тип</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-700 text-white"
                disabled={userRole === "user" && !isPlusSubscriber}
              >
                <option value="regular">Обычные</option>
                <option value="online">Онлайн</option>
                {userRole !== "user" && <option value="premium">Премиум</option>}
              </select>
            </div>
            
            <div>
              <label className="block mb-2 font-medium">Цена (руб)</label>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full p-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-gray-700 text-white"
                disabled={userRole === "user" && !isPlusSubscriber}
              />
            </div>
          </div>
          
          <div>
            <label className="block mb-2 font-medium">Место проведения</label>
            <div className="border border-gray-600 rounded-lg overflow-hidden">
              <YandexMap 
                onLocationSelect={(lat, lon) => { 
                  setLatitude(lat); 
                  setLongitude(lon); 
                  toast.success("Место выбрано");
                }} 
                initialLatitude={latitude || undefined} 
                initialLongitude={longitude || undefined} 
              />
            </div>
            {latitude && longitude && (
              <p className="mt-2 text-gray-400">
                Координаты: {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </p>
            )}
          </div>
          
          <div>
            <label className="block mb-2 font-medium">Фото мероприятия ({photoUrls.length}/{maxPhotos})</label>
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`w-full p-8 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                dragging ? "border-orange-400 bg-orange-900/30" : "border-gray-600 hover:border-orange-500"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center">
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p>Загрузка...</p>
                  </div>
                ) : (
                  <>
                    <svg className="w-12 h-12 mx-auto text-orange-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p className="mb-1">Перетащите фото сюда или кликните для выбора</p>
                    <p className="text-sm text-gray-400">Максимум {maxPhotos} фото</p>
                  </>
                )}
              </div>
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
            
            {photoUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {photoUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Фото ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-600 group-hover:border-orange-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Удалить фото"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="pt-4 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push(`/events/${eventId}`)}
              className="px-6 py-2 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              disabled={loading || uploading}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Сохранение...
                </>
              ) : "Сохранить изменения"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}