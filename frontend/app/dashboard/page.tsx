"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

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
    setTimeout(() => setMessage(""), 3000);
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
      showMessage("Увлечение добавлено", "success");
    } catch {
      showMessage("Ошибка при добавлении увлечения", "error");
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-orange-400">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black px-4 py-6 text-orange-100">
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
            <p className="mb-4">Создайте классику встречу, это легко!</p>
            <button className="bg-orange-500 hover:bg-orange-600 text-black px-6 py-2 rounded transition">
              Создать встречу
            </button>
          </div>
        </div>

        {/* Настройки профиля (скрытые по умолчанию) */}
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

            <div>
              <label className="block text-sm font-medium mb-1 text-orange-300">Увлечения</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {hobbies.map((h) => (
                  <span
                    key={h.id}
                    className="px-3 py-1 bg-orange-900 text-orange-200 rounded-full text-sm flex items-center space-x-1"
                  >
                    <span>{h.name}</span>
                    <button
                      onClick={() => removeHobby(h.id)}
                      className="text-orange-400 hover:text-orange-300 ml-1"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

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
                <div className="mt-2 flex space-x-2">
                  <input
                    placeholder="Введите своё увлечение"
                    value={newHobby}
                    onChange={(e) => setNewHobby(e.target.value)}
                    className="flex-1 px-3 py-2 border border-orange-700 rounded bg-gray-800 text-orange-100"
                  />
                </div>
              )}

              <button
                onClick={addHobby}
                disabled={!newHobby || newHobby === "__custom__"}
                className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-black px-4 py-2 rounded transition disabled:bg-gray-600 disabled:text-gray-400"
              >
                Добавить увлечение
              </button>
            </div>

            <button
              onClick={updateProfile}
              className="w-full bg-orange-500 hover:bg-orange-600 text-black py-2 rounded transition"
            >
              Сохранить изменения
            </button>

            <button
              onClick={handleLogout}
              className="w-full bg-red-700 hover:bg-red-600 text-orange-100 py-2 rounded transition"
            >
              Выйти
            </button>
          </div>
        </details>

        {message && (
          <div
            className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 p-3 rounded text-center ${
              messageType === "success"
                ? "bg-green-900 text-green-200 border border-green-700"
                : "bg-red-900 text-red-200 border border-red-700"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}