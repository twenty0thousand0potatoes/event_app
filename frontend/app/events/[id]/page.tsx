"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import YandexMap from "../../../components/YandexMap";
import { FiArrowLeft, FiArrowRight, FiEdit2, FiCalendar, FiUsers, FiTag, FiDollarSign, FiUser } from "react-icons/fi";

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id;

  const [event, setEvent] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const photosContainerRef = useRef<HTMLDivElement>(null);

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
      } catch (err: any) {
        setError(err.response?.data?.message || "Ошибка загрузки данных");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex(prev => 
      prev === 0 ? (event?.photos?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex(prev => 
      prev === (event?.photos?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="animate-pulse text-2xl text-white">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="text-white text-xl">Мероприятие не найдено</div>
      </div>
    );
  }

  const isCreator = Number(user?.sub) === Number(event.creator?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Кнопка назад */}
        <button 
          onClick={() => router.back()}
          className="mb-8 flex items-center text-gray-300 hover:text-white transition"
        >
          <FiArrowLeft className="mr-2" /> Назад
        </button>

        {/* Заголовок */}
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
          {event.title}
        </h1>

        {/* Слайдер фотографий */}
        {event.photos && event.photos.length > 0 && (
          <div className="relative mb-12 rounded-xl overflow-hidden shadow-2xl">
            <div 
              ref={photosContainerRef}
              className="relative h-96 w-full bg-gray-800 flex items-center justify-center"
            >
              <img
                src={event.photos[currentPhotoIndex].url}
                alt={`Photo ${event.photos[currentPhotoIndex].id}`}
                className="h-full w-full object-cover"
              />

              {/* Навигация слайдера */}
              {event.photos.length > 1 && (
                <>
                  <button
                    onClick={handlePrevPhoto}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-3 transition"
                    aria-label="Previous photo"
                  >
                    <FiArrowLeft className="text-white text-xl" />
                  </button>
                  <button
                    onClick={handleNextPhoto}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-3 transition"
                    aria-label="Next photo"
                  >
                    <FiArrowRight className="text-white text-xl" />
                  </button>
                </>
              )}

              {/* Индикаторы слайдов */}
              {event.photos.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {event.photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`w-3 h-3 rounded-full transition ${index === currentPhotoIndex ? 'bg-orange-500' : 'bg-white/50'}`}
                      aria-label={`Go to photo ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Основная информация */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Описание */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-orange-400">Описание</h2>
              <p className="text-gray-300 leading-relaxed">{event.description}</p>
            </div>

            {/* Детали мероприятия */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 text-orange-400">Детали мероприятия</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4">
                  <FiCalendar className="text-orange-400 text-xl mt-1" />
                  <div>
                    <h3 className="text-gray-400 text-sm">Дата и время</h3>
                    <p className="text-white">{new Date(event.date).toLocaleString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <FiUsers className="text-orange-400 text-xl mt-1" />
                  <div>
                    <h3 className="text-gray-400 text-sm">Участники</h3>
                    <p className="text-white">{event.maxParticipants} человек</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <FiTag className="text-orange-400 text-xl mt-1" />
                  <div>
                    <h3 className="text-gray-400 text-sm">Тип мероприятия</h3>
                    <p className="text-white capitalize">{event.type}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <FiDollarSign className="text-orange-400 text-xl mt-1" />
                  <div>
                    <h3 className="text-gray-400 text-sm">Цена</h3>
                    <p className="text-white">{event.price} ₽</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Боковая панель с организатором и картой */}
          <div className="space-y-8">
            {/* Организатор */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 text-orange-400">Организатор</h2>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                  <FiUser className="text-2xl text-gray-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">{event.creator?.username || "Неизвестный организатор"}</h3>
                  <p className="text-gray-400 text-sm">Организатор мероприятия</p>
                </div>
              </div>
            </div>

            {/* Карта */}
            {event.latitude && event.longitude && (
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-orange-400">Место проведения</h2>
                <div className="h-64 rounded-lg overflow-hidden">
                  <YandexMap 
                    initialLatitude={event.latitude} 
                    initialLongitude={event.longitude} 
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Кнопка редактирования для создателя */}
        {isCreator && (
          <div className="mt-12 flex justify-end">
            <button
              onClick={() => router.push(`/events/${eventId}/edit`)}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition flex items-center shadow-lg"
            >
              <FiEdit2 className="mr-2" />
              Редактировать мероприятие
            </button>
          </div>
        )}
      </div>
    </div>
  );
}