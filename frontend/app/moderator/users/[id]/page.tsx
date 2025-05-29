"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  role: string;
  city?: string;
  age?: number;
  description?: string;
  avatar?: string;
}

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/moderator/users/${userId}`, {
          withCredentials: true,
        });
        setUser(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Ошибка при загрузке пользователя");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  if (loading) {
    return <div className="p-4">Загрузка...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!user) {
    return <div className="p-4">Пользователь не найден</div>;
  }

  return (
    <div className="p-4 max-w-3xl mx-auto bg-gray-800 rounded-lg shadow-lg text-gray-100">
      <h1 className="text-2xl font-bold mb-4">Профиль пользователя</h1>
      <div className="flex items-center space-x-6 mb-6">
        <img
          src={user.avatar || "/placeholder.png"}
          alt="Аватар"
          className="w-24 h-24 rounded-full object-cover border-2 border-orange-500"
        />
        <div>
          <h2 className="text-xl font-semibold">{user.username}</h2>
          <p>Email: {user.email}</p>
          <p>Роль: {user.role}</p>
          {user.city && <p>Город: {user.city}</p>}
          {user.age !== undefined && <p>Возраст: {user.age}</p>}
        </div>
      </div>
      {user.description && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Описание</h3>
          <p className="whitespace-pre-line">{user.description}</p>
        </div>
      )}
      <button
        onClick={() => router.back()}
        className="mt-6 bg-orange-500 hover:bg-orange-600 text-black py-2 px-4 rounded"
      >
        Назад
      </button>
    </div>
  );
}
