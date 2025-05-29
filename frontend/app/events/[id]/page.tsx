"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import YandexMap from "../../../components/YandexMap";
import Sidebar from "../../../components/Sidebar";
import {
  FiArrowLeft,
  FiArrowRight,
  FiEdit2,
  FiCalendar,
  FiUsers,
  FiTag,
  FiDollarSign,
  FiUser,
} from "react-icons/fi";

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id;

  const [event, setEvent] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isGoing, setIsGoing] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  const photosContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!eventId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [eventRes, userRes] = await Promise.all([
          axios.get(`http://localhost:3000/events/${eventId}`, {
            withCredentials: true,
          }),
          axios.get("http://localhost:3000/users/me", {
            withCredentials: true,
          }),
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

  useEffect(() => {
    if (event?.subscriptions && user) {
      const subscribed = event.subscriptions.some(
        (sub: any) => sub.user && sub.user.id === user.sub
      );
      setIsGoing(subscribed);
    }
  }, [event?.subscriptions, user]);

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? (event?.photos?.length || 1) - 1 : prev - 1
    );
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex((prev) =>
      prev === (event?.photos?.length || 1) - 1 ? 0 : prev + 1
    );
  };

  const handleSubscribe = async () => {
    setSubscriptionError(null);
    setSubscribing(true);
    try {
      await axios.post(
        `http://localhost:3000/events/${event.id}/subscribe`,
        {},
        { withCredentials: true }
      );
      setIsGoing(true);
    } catch (error: any) {
      setSubscriptionError(error.response?.data?.message || "Ошибка подписки");
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white bg-gradient-to-b from-gray-900 to-black">
        <div className="animate-pulse text-2xl">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white bg-gradient-to-b from-gray-900 to-black">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white bg-gradient-to-b from-gray-900 to-black">
        <div className="text-xl">Мероприятие не найдено</div>
      </div>
    );
  }

  const isCreator = Number(user?.sub) === Number(event.creator?.id);
  const availableSeats =
    event.maxParticipants - (event.subscriptions?.length || 0);
  const now = new Date();
  const eventEnded = event.endDate ? new Date(event.endDate) <= now : false;
  const isButtonDisabled = availableSeats <= 0 || subscribing || isGoing || eventEnded;

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Sidebar />
      <div className="flex-1 px-4 py-12 md:ml-56">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="mb-8 flex items-center text-gray-300 hover:text-white transition"
          >
            <FiArrowLeft className="mr-2" /> Назад
          </button>

          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
            {event.title}
          </h1>

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

                {event.photos.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                    {event.photos.map((_: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`w-3 h-3 rounded-full transition ${
                          index === currentPhotoIndex
                            ? "bg-orange-500"
                            : "bg-white/50"
                        }`}
                        aria-label={`Go to photo ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-orange-400">
                  Описание
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  {event.description}
                </p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-6 text-orange-400">
                  Детали мероприятия
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-4">
                    <FiCalendar className="text-orange-400 text-xl mt-1" />
                    <div>
                      <h3 className="text-gray-400 text-sm">Дата и время начала</h3>
                      <p className="text-white">
                        {new Date(event.date).toLocaleString("ru-RU", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>

                  {event.endDate && (
                    <div className="flex items-start space-x-4">
                      <FiCalendar className="text-orange-400 text-xl mt-1" />
                      <div>
                        <h3 className="text-gray-400 text-sm">Дата и время окончания</h3>
                        <p className="text-white">
                          {new Date(event.endDate).toLocaleString("ru-RU", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  )}

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

            <div className="space-y-8">
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-6 text-orange-400">
                  Организатор
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                    <FiUser className="text-2xl text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">
                      {event.creator?.username || "Неизвестный организатор"}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Организатор мероприятия
                    </p>
                  </div>
                </div>
              </div>

              {event.latitude && event.longitude && (
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold mb-4 text-orange-400">
                  Место проведения
                </h2>
                <div className="h-64 rounded-lg overflow-hidden">
                  <YandexMap
                    initialLatitude={event.latitude}
                    initialLongitude={event.longitude}
                  />
                </div>
                {event.location && (
                  <p className="mt-2 text-gray-400">{event.location}</p>
                )}
              </div>
              )}
            </div>
          </div>

          {isCreator ? (
            <div className="mt-12 flex justify-end">
              <button
                onClick={() => router.push(`/events/${eventId}/edit`)}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition flex items-center shadow-lg"
              >
                <FiEdit2 className="mr-2" />
                Редактировать мероприятие
              </button>
            </div>
          ) : (
            <div className="mt-12 flex justify-end flex-col items-end space-y-2">
              <button
                onClick={handleSubscribe}
                disabled={isButtonDisabled}
                className={`px-6 py-3 rounded-lg text-white shadow-lg transition flex items-center justify-center ${
                  isButtonDisabled
                    ? "bg-gray-600 cursor-not-allowed opacity-50"
                    : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                }`}
              >
                {isGoing ? "Вы уже идёте" : subscribing ? "Подписка..." : "Я иду!"}
              </button>
              {subscriptionError && (
                <p className="text-red-500 text-sm">{subscriptionError}</p>
              )}
              <p className="text-gray-400 text-sm">
                Свободных мест: {availableSeats}
              </p>
              {eventEnded && (
                <p className="text-red-500 text-sm font-semibold">
                  Мероприятие завершено
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
