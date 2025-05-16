"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import SubscriptionForm from "../../components/SubscriptionForm";
import Link from "next/link";

interface HobbyData {
  id: number;
  name: string;
}

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
}

interface UserData {
  username: string;
  email: string;
  hobbies: HobbyData[];
  avatar: string;
  city?: string;
  age?: number;
  description?: string;
  isPlusSubscriber?: boolean;
  plusSubscriptionExpiresAt?: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [username, setUsername] = useState("");
  const [city, setCity] = useState("");
  const [age, setAge] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [hobbies, setHobbies] = useState<HobbyData[]>([]);
  const [allHobbies, setAllHobbies] = useState<string[]>([]);
  const [newHobby, setNewHobby] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [loading, setLoading] = useState(true);
  const [isCustomHobby, setIsCustomHobby] = useState(false);
  const [showDescriptionInput, setShowDescriptionInput] = useState(false);
  const [description, setDescription] = useState("");
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [subscriptionClientSecret, setSubscriptionClientSecret] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // New state for meetings
  const [createdEvents, setCreatedEvents] = useState<Event[]>([]);
  const [subscribedEvents, setSubscribedEvents] = useState<Event[]>([]);
  const [activeMeetingTab, setActiveMeetingTab] = useState<"subscribed" | "created">("subscribed");

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, hobbiesRes, allHobbiesRes, meetingsRes] = await Promise.all([
          axios.get("http://localhost:3000/users/me", {
            withCredentials: true,
          }),
          axios.get("http://localhost:3000/users/me/hobbies", {
            withCredentials: true,
          }),
          axios.get("http://localhost:3000/hobbies", { withCredentials: true }),
          axios.get("http://localhost:3000/events/mine", { withCredentials: true }),
        ]);

        const userData = userRes.data as UserData;

        setUser({ ...userData, hobbies: hobbiesRes.data });
        setUsername(userData.username);
        setCity(userData.city || "");
        setAge(userData.age?.toString() || "");
        setAvatarUrl(userData.avatar || "");
        setDescription(userData.description || "");
        setHobbies(hobbiesRes.data);
        setAllHobbies(allHobbiesRes.data.map((h: HobbyData) => h.name));
        setCreatedEvents(meetingsRes.data.createdEvents);
        setSubscribedEvents(meetingsRes.data.subscribedEvents);
      } catch {
        router.push("/login?reason=unauthorized");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const showMessage = (msg: string, type: "success" | "error") => {
    setMessage(msg);
    setMessageType(type);
    setShowMessagePopup(true);
    setTimeout(() => {
      setShowMessagePopup(false);
      setMessage("");
    }, 3000);
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:3000/auth/logout",
        {},
        { withCredentials: true }
      );
      router.push("/login");
    } catch {
      showMessage("Ошибка при выходе", "error");
    }
  };

  const updateProfile = async () => {
    try {
      const updatePromises = [];

      if (user?.username !== username) {
        updatePromises.push(
          axios.patch(
            "http://localhost:3000/users/me/username",
            { username },
            { withCredentials: true }
          )
        );
      }

      if (user?.city !== city) {
        updatePromises.push(
          axios.patch(
            "http://localhost:3000/users/me/city",
            { city },
            { withCredentials: true }
          )
        );
      }

      if (user?.age !== parseInt(age)) {
        updatePromises.push(
          axios.patch(
            "http://localhost:3000/users/me/age",
            { age: parseInt(age) || null },
            { withCredentials: true }
          )
        );
      }

      if (user?.description !== description) {
        updatePromises.push(
          axios.patch(
            "http://localhost:3000/users/me/description",
            { description },
            { withCredentials: true }
          )
        );
      }

      await Promise.all(updatePromises);

      setUser((u) =>
        u ? { ...u, username, city, age: parseInt(age) || undefined, description } : u
      );
      showMessage("Профиль обновлен", "success");
    } catch {
      showMessage("Ошибка при обновлении профиля", "error");
    }
  };

  const updateAvatarByUrl = async () => {
    try {
      await axios.patch(
        "http://localhost:3000/users/me/avatar",
        { avatar: avatarUrl },
        { withCredentials: true }
      );
      setUser((u) => (u ? { ...u, avatar: avatarUrl } : u));
      showMessage("Аватар обновлен", "success");
    } catch {
      showMessage("Ошибка при обновлении аватара", "error");
    }
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.patch(
        "http://localhost:3000/users/me/avatar/upload",
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setUser((u) => (u ? { ...u, avatar: res.data.avatar } : u));
      setAvatarUrl(res.data.avatar);
      showMessage("Аватар загружен и обновлен", "success");
    } catch {
      showMessage("Ошибка при загрузке файла", "error");
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showMessage("Файл слишком большой (макс. 2MB)", "error");
      return;
    }

    handleFileUpload(file);
  };

  const addHobby = async () => {
    if (!newHobby.trim()) return;
    try {
      await axios.post(
        "http://localhost:3000/users/me/hobbies",
        { hobbyNames: [newHobby.trim()] },
        { withCredentials: true }
      );
      const res = await axios.get("http://localhost:3000/users/me/hobbies", {
        withCredentials: true,
      });
      setHobbies(res.data);
      setNewHobby("");
    } catch {
      throw new Error("Ошибка при добавлении увлечения");
    }
  };

  const removeHobby = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3000/users/me/hobbies/${id}`, {
        withCredentials: true,
      });
      setHobbies((h) => h.filter((x) => x.id !== id));
      showMessage("Увлечение удалено", "success");
    } catch {
      showMessage("Ошибка при удалении", "error");
    }
  };

  const saveHobbies = async () => {
    if (!newHobby.trim()) return;
    try {
      await addHobby();
      showMessage("Хобби сохранены", "success");
    } catch {
      showMessage("Ошибка при сохранении хобби", "error");
    }
  };

  const openSubscriptionPopup = () => {
    setShowSubscriptionPopup(true);
  };

  const closeSubscriptionPopup = () => {
    setShowSubscriptionPopup(false);
  };

  const handleSubscribe = async () => {
    try {
      const res = await axios.post(
        "http://localhost:3000/users/me/subscribe",
        {},
        { withCredentials: true }
      );
      const { clientSecret } = res.data;
      if (clientSecret) {
        setSubscriptionClientSecret(clientSecret);
        setShowPaymentForm(true);
      } else {
        showMessage("Подписка оформлена. Спасибо!", "success");
        closeSubscriptionPopup();
        const userRes = await axios.get("http://localhost:3000/users/me", {
          withCredentials: true,
        });
        setUser(userRes.data);
      }
    } catch {
      showMessage("Ошибка при оформлении подписки", "error");
    }
  };

  const handlePaymentSuccess = async () => {
    showMessage("Оплата прошла успешно! Подписка активирована.", "success");
    setShowPaymentForm(false);
    setSubscriptionClientSecret(null);
    closeSubscriptionPopup();
    const userRes = await axios.get("http://localhost:3000/users/me", {
      withCredentials: true,
    });
    setUser(userRes.data);
  };

  const handlePaymentError = (message: string) => {
    showMessage(message, "error");
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setSubscriptionClientSecret(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-orange-400">
        Загрузка...
      </div>
    );
  }


  
  const handleCreateMeeting = () => {
    router.push("http://localhost:3001/events/create");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black px-4 py-8 text-gray-100 relative">

      {showMessagePopup && (
        <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-xl ${
          messageType === "success" 
            ? "bg-gradient-to-r from-green-600 to-emerald-700" 
            : "bg-gradient-to-r from-red-600 to-rose-700"
        } text-white flex items-center space-x-2 animate-fade-in`}>
          {messageType === "success" ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span>{message}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Шапка профиля */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Блок аватара */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 w-full md:w-1/3">
            <div className="flex flex-col items-center">
              <div className="relative group">
                <img
                  src={user?.avatar || "/placeholder.png"}
                  alt="Аватар"
                  className="w-32 h-32 rounded-full object-cover border-4 border-orange-500 shadow-lg"
                />
                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              
              <div className="mt-4 text-center">
                <h1 className="text-2xl font-bold text-orange-400">{username}</h1>
                <div className="flex justify-center space-x-4 mt-1">
                  {city && (
                    <span className="flex items-center text-gray-300">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {city}
                    </span>
                  )}
                  {age && (
                    <span className="flex items-center text-gray-300">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {age} лет
                    </span>
                  )}
                </div>
              </div>
              
              {/* Ссылка на аватар */}
              <div className="w-full mt-4">
                <label className="block text-sm font-medium mb-1 text-gray-300">Ссылка на аватар</label>
                <div className="flex space-x-2">
                  <input
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="https://..."
                  />
                  <button
                    onClick={updateAvatarByUrl}
                    className="bg-orange-500 hover:bg-orange-600 text-black px-4 py-2 rounded-lg transition transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Основная информация */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 w-full md:w-2/3 space-y-6">
            {/* Описание */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold text-orange-400">О себе</h2>
                <button 
                  onClick={() => setShowDescriptionInput(!showDescriptionInput)}
                  className="text-orange-500 hover:text-orange-400 text-sm flex items-center"
                >
                  {showDescriptionInput ? (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Отмена
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      {description ? "Редактировать" : "Добавить"}
                    </>
                  )}
                </button>
              </div>
              
              {!showDescriptionInput && description ? (
                <p className="text-gray-300 whitespace-pre-line">{description}</p>
              ) : !showDescriptionInput ? (
                <p className="text-gray-500 italic">Расскажите о себе...</p>
              ) : (
                <div className="space-y-2">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Расскажите о себе..."
                    rows={4}
                  />
                  <button
                    onClick={updateProfile}
                    className="bg-orange-500 hover:bg-orange-600 text-black py-2 px-4 rounded-lg transition transform hover:scale-105 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Сохранить
                  </button>
                </div>
              )}
            </div>

            {/* Хобби */}
            <div>
              <h2 className="text-xl font-semibold mb-3 text-orange-400">Мои увлечения</h2>
              {hobbies.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-4">
                  {hobbies.map((h) => (
                    <span
                      key={h.id}
                      className="px-3 py-1 bg-orange-500 bg-opacity-20 text-orange-200 rounded-full text-sm flex items-center space-x-1 border border-orange-500 border-opacity-50 hover:bg-opacity-30 transition"
                    >
                      <span>{h.name}</span>
                      <button
                        onClick={() => removeHobby(h.id)}
                        className="text-orange-300 hover:text-orange-100 ml-1 text-xs transition"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic mb-4">У вас пока нет увлечений</p>
              )}

              <div className="space-y-3">
                <div className="flex space-x-2">
                  <select
                    value={isCustomHobby ? "__custom__" : newHobby}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "__custom__") {
                        setIsCustomHobby(true);
                        setNewHobby("");
                      } else {
                        setIsCustomHobby(false);
                        setNewHobby(value);
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Выберите из списка...</option>
                    {allHobbies.map((h, idx) => (
                      <option key={idx} value={h}>
                        {h}
                      </option>
                    ))}
                    <option value="__custom__">Добавить своё</option>
                  </select>
                </div>

                {isCustomHobby && (
                  <div className="flex space-x-2">
                    <input
                      placeholder="Введите своё увлечение"
                      value={newHobby}
                      onChange={(e) => setNewHobby(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                )}

                <button
                  onClick={saveHobbies}
                  disabled={!newHobby.trim()}
                  className={`w-full py-2 rounded-lg transition flex items-center justify-center ${
                    !newHobby.trim()
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-orange-600 text-black transform hover:scale-105"
                  }`}
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Добавить увлечение
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Подписка Plus */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-semibold text-orange-400">Подписка Plus</h2>
              <p className="text-gray-300">Дополнительные возможности и привилегии</p>
            </div>
            
            {user?.isPlusSubscriber ? (
              <div className="bg-green-900 bg-opacity-30 border border-green-600 px-4 py-2 rounded-lg">
                <p className="text-green-400 font-medium">
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Активна до {user.plusSubscriptionExpiresAt ? new Date(user.plusSubscriptionExpiresAt).toLocaleDateString() : "неизвестно"}
                </p>
              </div>
            ) : (
              <button
                onClick={openSubscriptionPopup}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-black font-bold py-3 px-6 rounded-lg shadow-lg transition transform hover:scale-105 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Оформить Plus
              </button>
            )}
          </div>

          {showSubscriptionPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-700 max-w-md w-full animate-pop-in">
                {!showPaymentForm && (
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-orange-400">Подписка Plus</h3>
                      <button
                        onClick={closeSubscriptionPopup}
                        className="text-gray-400 hover:text-gray-200"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-700 p-4 rounded-lg">
                        <h4 className="font-bold text-lg mb-2 text-white">Преимущества Plus:</h4>
                        <ul className="space-y-2 text-gray-300">
                          <li className="flex items-start">
                            <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Приоритет в поиске и рекомендациях
                          </li>
                          <li className="flex items-start">
                            <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Расширенные настройки профиля
                          </li>
                          <li className="flex items-start">
                            <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Эксклюзивные мероприятия
                          </li>
                        </ul>
                      </div>
                      
                      <div className="flex justify-between items-center bg-gray-700 p-4 rounded-lg">
                        <div>
                          <p className="text-gray-300">Стоимость:</p>
                          <p className="text-2xl font-bold text-orange-400">2,99$ <span className="text-sm text-gray-400">/ месяц</span></p>
                        </div>
                        <button
                          onClick={handleSubscribe}
                          className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-black font-bold py-2 px-6 rounded-lg shadow transition transform hover:scale-105"
                        >
                          Продолжить
                        </button>
                      </div>
                    </div>
                  </>
                )}
                {showPaymentForm && subscriptionClientSecret && (
                  <SubscriptionForm
                    clientSecret={subscriptionClientSecret}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    onCancel={handlePaymentCancel}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Встречи и друзья */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Друзья */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-orange-400">Друзья</h2>
              <button className="bg-orange-500 hover:bg-orange-600 text-black px-4 py-2 rounded-lg transition transform hover:scale-105 flex items-center">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Найти
              </button>
            </div>
            
            <div className="text-center py-8">
              <div className="mx-auto w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">У вас пока нет друзей</h3>
              <p className="text-gray-400">Найдите друзей по интересам</p>
            </div>
          </div>

          {/* Мои встречи */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-orange-400">Мои встречи</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveMeetingTab("subscribed")}
                  className={`px-4 py-1 rounded-full text-sm transition ${
                    activeMeetingTab === "subscribed"
                      ? "bg-orange-500 text-black"
                      : "bg-gray-700 text-orange-200 hover:bg-gray-600"
                  }`}
                >
                  Я иду
                </button>
                <button
                  onClick={() => setActiveMeetingTab("created")}
                  className={`px-4 py-1 rounded-full text-sm transition ${
                    activeMeetingTab === "created"
                      ? "bg-orange-500 text-black"
                      : "bg-gray-700 text-orange-200 hover:bg-gray-600"
                  }`}
                >
                  Созданные
                </button>
              </div>
            </div>

            {activeMeetingTab === "subscribed" && (
              <div>
                {subscribedEvents.length > 0 ? (
                <ul className="space-y-4 max-h-60 overflow-y-auto pr-2">
                {subscribedEvents.map((event) => (
                  <li key={event.id} className="border border-gray-700 rounded-lg p-4 hover:bg-gray-800 transition">
                    <Link href={`/events/${event.id}`} className="block">
                      <h3 className="text-lg font-semibold text-orange-400">{event.title}</h3>
                      <p className="text-gray-300">{event.description}</p>
                      <p className="text-gray-400 text-sm">
                        Дата: {new Date(event.date).toLocaleDateString()}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-300 mb-2">Вы не подписаны ни на одну встречу</h3>
                    <p className="text-gray-400 mb-4">Подпишитесь на встречи по своим интересам</p>
                  </div>
                )}
              </div>
            )}

            {activeMeetingTab === "created" && (
              <div>
                {createdEvents.length > 0 ? (
                  <ul className="space-y-4 max-h-60 overflow-y-auto pr-2">
                    {createdEvents.map((event) => (
                      <li key={event.id} className="border border-gray-700 rounded-lg p-4">
                         <Link href={`/events/${event.id}`} className="block">
                        <h3 className="text-lg font-semibold text-orange-400">{event.title}</h3>
                        <p className="text-gray-300">{event.description}</p>
                        <p className="text-gray-400 text-sm">Дата: {new Date(event.date).toLocaleDateString()}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-8">
                    <div className="mx-auto w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-300 mb-2">Вы не создали ни одной встречи</h3>
                    <p className="text-gray-400 mb-4">Создайте встречи по своим интересам</p>
                  </div>
                )}
              </div>
            )}

            <button 
              className="bg-orange-500 hover:bg-orange-600 text-black px-6 py-2 rounded-lg transition transform hover:scale-105 flex items-center mx-auto mt-4"
              onClick={handleCreateMeeting}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Создать встречу
            </button>
          </div>
        </div>

        {/* Настройки профиля */}
        <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-orange-400">Настройки профиля</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Имя пользователя</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Город</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Возраст</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={updateProfile}
              className="bg-orange-500 hover:bg-orange-600 text-black py-3 px-6 rounded-lg transition transform hover:scale-105 flex-1 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Сохранить изменения
            </button>

            <button
              onClick={handleLogout}
              className="bg-gray-700 hover:bg-gray-600 text-orange-400 py-3 px-6 rounded-lg transition transform hover:scale-105 flex-1 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Выйти
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
