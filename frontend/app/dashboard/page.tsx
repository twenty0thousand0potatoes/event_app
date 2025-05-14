"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import SubscriptionForm from "../../components/SubscriptionForm";

interface HobbyData {
  id: number;
  name: string;
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

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, hobbiesRes, allHobbiesRes] = await Promise.all([
          axios.get("http://localhost:3000/users/me", {
            withCredentials: true,
          }),
          axios.get("http://localhost:3000/users/me/hobbies", {
            withCredentials: true,
          }),
          axios.get("http://localhost:3000/hobbies", { withCredentials: true }),
        ]);

        const userData = userRes.data as UserData;
        console.log(userData);
        setUser({ ...userData, hobbies: hobbiesRes.data });
        setUsername(userData.username);
        setCity(userData.city || "");
        setAge(userData.age?.toString() || "");
        setAvatarUrl(userData.avatar || "");
        setDescription(userData.description || "");
        setHobbies(hobbiesRes.data);
        setAllHobbies(allHobbiesRes.data.map((h: HobbyData) => h.name));
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
    <div className="min-h-screen bg-black px-4 py-6 text-orange-100 relative">
      {/* Сообщения */}
      {showMessagePopup && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-md ${
          messageType === "success" ? "bg-green-600" : "bg-red-600"
        } text-white shadow-lg transition-opacity duration-300`}>
          {message}
        </div>
      )}

      <div className="max-w-md mx-auto space-y-6">
        {/* Профиль пользователя */}
        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-orange-800">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={user?.avatar || "/placeholder.png"}
                alt="Аватар"
                className="w-16 h-16 rounded-full object-cover border-2 border-orange-500"
              />
              <label className="absolute bottom-0 right-0 bg-orange-500 text-black p-1 rounded-full cursor-pointer hover:bg-orange-600 transition text-xs">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                📷
              </label>
            </div>
            <div>
              <h1 className="text-xl font-bold text-orange-400">{username}</h1>
              <p className="text-orange-300">
                {city && `${city}, `}
                {age && `${age} лет`}
              </p>
            </div>
          </div>

          {/* Блок с хобби */}
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2 text-orange-400">Мои увлечения</h2>
            {hobbies.length > 0 ? (
              <div className="flex flex-wrap gap-2 mb-4">
                {hobbies.map((h) => (
                  <span
                    key={h.id}
                    className="px-3 py-1 bg-orange-500 bg-opacity-20 text-orange-200 rounded-full text-sm flex items-center space-x-1 border border-orange-500 border-opacity-50"
                  >
                    <span>{h.name}</span>
                    <button
                      onClick={() => removeHobby(h.id)}
                      className="text-orange-300 hover:text-orange-100 ml-1 text-xs"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-orange-300 text-sm mb-4">У вас пока нет увлечений</p>
            )}

            <div className="space-y-2">
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
                  className="flex-1 px-3 py-2 border border-orange-700 rounded bg-gray-800 text-orange-100"
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
                    className="flex-1 px-3 py-2 border border-orange-700 rounded bg-gray-800 text-orange-100"
                  />
                </div>
              )}

              <button
                onClick={saveHobbies}
                disabled={!newHobby.trim()}
                className={`w-full py-2 rounded transition ${
                  !newHobby.trim()
                    ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600 text-black"
                }`}
              >
                Сохранить увлечение
              </button>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-orange-400">Описание</h2>
              <button 
                onClick={() => setShowDescriptionInput(!showDescriptionInput)}
                className="text-orange-500 hover:text-orange-400 text-sm"
              >
                {showDescriptionInput ? "Отмена" : "Добавить описание >"}
              </button>
            </div>
            
            {!showDescriptionInput && description && (
              <p className="mt-2 text-orange-200">{description}</p>
            )}
            
            {showDescriptionInput && (
              <div className="mt-2">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-orange-700 rounded bg-gray-800 text-orange-100"
                  placeholder="Расскажите о себе..."
                  rows={3}
                />
                <button
                  onClick={updateProfile}
                  className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-black py-2 rounded transition"
                >
                  Сохранить
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Подписка Plus */}
        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-orange-800">
          <h2 className="text-lg font-semibold mb-4 text-orange-400">Подписка Plus</h2>
          {user?.isPlusSubscriber ? (
            <p className="text-green-400 mb-2">
              Ваша подписка активна до {user.plusSubscriptionExpiresAt ? new Date(user.plusSubscriptionExpiresAt).toLocaleDateString() : "неизвестно"}.
            </p>
          ) : (
            <>
              <button
                onClick={openSubscriptionPopup}
                className="w-full bg-orange-500 hover:bg-orange-600 text-black py-2 rounded transition"
              >
                Оформить подписку Plus
              </button>

              {showSubscriptionPopup && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                  <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-orange-800 max-w-sm w-full">
                    {!showPaymentForm && (
                      <>
                        <h3 className="text-lg font-semibold mb-4 text-orange-400">Подтвердите оформление подписки</h3>
                        <p className="mb-4 text-orange-200">Стоимость подписки: 2,99$ в месяц.</p>
                        <div className="flex justify-end space-x-4">
                          <button
                            onClick={closeSubscriptionPopup}
                            className="bg-gray-700 hover:bg-gray-600 text-orange-300 px-4 py-2 rounded transition"
                          >
                            Отмена
                          </button>
                          <button
                            onClick={handleSubscribe}
                            className="bg-orange-500 hover:bg-orange-600 text-black px-4 py-2 rounded transition"
                          >
                            Подтвердить
                          </button>
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
            </>
          )}
        </div>

        {/* Друзья */}
        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-orange-800">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-orange-400">Нет друзей</h2>
            <button className="bg-orange-500 hover:bg-orange-600 text-black px-4 py-1 rounded text-sm transition">
              Найти друзей
            </button>
          </div>
        </div>

        {/* Мои встречи */}
        <div className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-orange-800">
          <h2 className="text-lg font-semibold mb-4 text-orange-400">Мои встречи</h2>
          
          <div className="flex space-x-2 mb-4">
            <button className="px-4 py-1 bg-orange-800 hover:bg-orange-700 text-orange-200 rounded-full text-sm transition">
              Я иду
            </button>
            <button className="px-4 py-1 bg-orange-800 hover:bg-orange-700 text-orange-200 rounded-full text-sm transition">
              Избранное
            </button>
          </div>
          
          <div className="text-center py-8 text-orange-300">
            <p>У вас нет созданных встреч.</p>
            <p className="mb-4">Создайте встречу, это легко!</p>
            <button className="bg-orange-500 hover:bg-orange-600 text-black px-6 py-2 rounded transition" onClick={handleCreateMeeting}>
              Создать встречу
            </button>
          </div>
        </div>

        {/* Настройки профиля */}
        <details className="bg-gray-900 p-6 rounded-2xl shadow-lg border border-orange-800">
          <summary className="text-lg font-semibold cursor-pointer text-orange-400 hover:text-orange-300">
            Настройки профиля
          </summary>
          
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-orange-300">Имя пользователя</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-orange-700 rounded bg-gray-800 text-orange-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-orange-300">Город</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-orange-700 rounded bg-gray-800 text-orange-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-orange-300">Возраст</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 border border-orange-700 rounded bg-gray-800 text-orange-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-orange-300">Ссылка на аватар</label>
              <div className="flex space-x-2">
                <input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border border-orange-700 rounded bg-gray-800 text-orange-100"
                  placeholder="https://..."
                />
                <button
                  onClick={updateAvatarByUrl}
                  className="bg-orange-500 hover:bg-orange-600 text-black px-4 py-2 rounded transition"
                >
                  Сохранить
                </button>
              </div>
            </div>

            <button
              onClick={updateProfile}
              className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-black py-2 rounded transition"
            >
              Сохранить изменения профиля
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded transition"
            >
              Выйти из аккаунта
            </button>
          </div>
        </details>
      </div>
    </div>
  );
}