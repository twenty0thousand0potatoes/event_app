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
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [hobbies, setHobbies] = useState<HobbyData[]>([]);
  const [allHobbies, setAllHobbies] = useState<string[]>([]);
  const [newHobby, setNewHobby] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">(
    "success"
  );
  const [loading, setLoading] = useState(true);
  const [isCustomHobby, setIsCustomHobby] = useState(false);

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
        setAvatarUrl(userData.avatar || "");
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

  const updateUsername = async () => {
    try {
      await axios.patch(
        "http://localhost:3000/users/me/username",
        { username },
        { withCredentials: true }
      );
      setUser((u) => (u ? { ...u, username } : u));
      showMessage("Имя пользователя обновлено", "success");
    } catch {
      showMessage("Ошибка при обновлении имени", "error");
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
      <div className="min-h-screen flex items-center justify-center">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10 text-black">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-xl space-y-8">
        <h2 className="text-3xl font-bold text-center">Мой аккаунт</h2>

        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <img
              src={user?.avatar || "/placeholder.png"}
              alt="Аватар"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
            />
            <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              📷
            </label>
          </div>

          <div className="w-full space-y-4">
            <div>
              <label className="text-sm font-medium">Ссылка на аватар</label>
              <div className="flex space-x-2 mt-1">
                <input
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded"
                  placeholder="https://..."
                />
                <button
                  onClick={updateAvatarByUrl}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Сохранить
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Имя пользователя</label>
              <div className="flex space-x-2 mt-1">
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded"
                />
                <button
                  onClick={updateUsername}
                  disabled={!username.trim() || username === user?.username}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Сохранить
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="bg-gray-50 px-4 py-2 mt-1 rounded">{user?.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium">Увлечения</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {hobbies.map((h) => (
                  <span
                    key={h.id}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center space-x-1"
                  >
                    <span>{h.name}</span>
                    <button
                      onClick={() => removeHobby(h.id)}
                      className="text-red-500 ml-2"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              <div className="mt-4 flex space-x-2">
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
                  className="flex-1 px-3 py-2 border rounded"
                >
                  <option value="">Выберите из списка...</option>
                  {allHobbies.map((h, idx) => (
                    <option key={idx} value={h}>
                      {h}
                    </option>
                  ))}
                  <option value="__custom__">Добавить своё</option>
                </select>

                <button
                  onClick={addHobby}
                  disabled={!newHobby || newHobby === "__custom__"}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                  Добавить
                </button>
              </div>

              {isCustomHobby && (
                <div className="mt-2 flex space-x-2">
                  <input
                    placeholder="Введите своё увлечение"
                    value={newHobby}
                    onChange={(e) => setNewHobby(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded"
                  />
                  <button
                    onClick={addHobby}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Добавить
                  </button>
                </div>
              )}
            </div>

            {message && (
              <div
                className={`p-3 rounded text-center ${
                  messageType === "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
