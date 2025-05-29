"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { motion } from 'framer-motion';

type User = {
  id: number;
  email: string;
  username: string;
  role: string;
  city?: string;
  age?: number;
};

type Event = {
  id: number;
  title: string;
  description?: string;
  date: string;
  type: string;
  price: number;
  creator: {
    id: number;
    username: string;
  };
};

type Tab = 'users' | 'events';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const ModeratorPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [eventSearch, setEventSearch] = useState('');
  const [userSortBy, setUserSortBy] = useState<string>('id');
  const [userSortOrder, setUserSortOrder] = useState<'asc' | 'desc'>('asc');
  const [eventSortBy, setEventSortBy] = useState<string>('date');
  const [eventSortOrder, setEventSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userParams = new URLSearchParams();
        // if (userSearch) userParams.append('search', userSearch);
        // if (userSortBy) userParams.append('sortBy', userSortBy);
        // if (userSortOrder) userParams.append('sortOrder', userSortOrder);

        const eventParams = new URLSearchParams();
        // if (eventSearch) eventParams.append('search', eventSearch);
        // if (eventSortBy) eventParams.append('sortBy', eventSortBy);
        // if (eventSortOrder) eventParams.append('sortOrder', eventSortOrder);

        const [userRes, usersRes, eventsRes] = await Promise.all([
          axios.get('http://localhost:3000/users/me', { withCredentials: true }),
          axios.get(`http://localhost:3000/moderator/users?${userParams.toString()}`, { withCredentials: true }),
          axios.get(`http://localhost:3000/moderator/events?${eventParams.toString()}`, { withCredentials: true }),
        ]);

        const user = userRes.data;
        if (user.role.toUpperCase() !== 'MODERATOR') {
          throw new Error('Недостаточно прав');
        }

        setUsers(usersRes.data.data || []);
        setEvents(eventsRes.data.data || []);
      } catch (error: any) {
        console.log(error)
        console.error('Ошибка загрузки данных:', error.response?.data || error.message);
        if (error.response?.status === 401 || error.message === 'Не авторизован') {
          router.push('/login?reason=unauthorized');
        } else if (error.message === 'Недостаточно прав') {
          setErrorMessage('У вас нет прав модератора.');
          router.push('/dashboard');
        } else {
          setErrorMessage('Ошибка загрузки данных. Попробуйте позже.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router, userSearch, userSortBy, userSortOrder, eventSearch, eventSortBy, eventSortOrder]);

  const handleUserSort = (column: string) => {
    if (userSortBy === column) {
      setUserSortOrder(userSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setUserSortBy(column);
      setUserSortOrder('asc');
    }
  };

  const handleEventSort = (column: string) => {
    if (eventSortBy === column) {
      setEventSortOrder(eventSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setEventSortBy(column);
      setEventSortOrder('asc');
    }
  };

  const getSortIndicator = (currentSortBy: string, column: string, sortOrder: 'asc' | 'desc') => {
    if (currentSortBy !== column) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-orange-400">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-orange-400">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <p className="text-red-400">{errorMessage}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-black px-4 py-2 rounded-lg"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 px-4 py-8 text-orange-100">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="max-w-7xl mx-auto bg-gray-900/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-700"
      >
        <div className="h-1.5 bg-gradient-to-r from-orange-500 to-pink-600 rounded-t-lg -mx-6 -mt-6 mb-6"></div>

        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 mb-6">
          Панель модератора
        </h1>

        <div className="flex space-x-2 mb-6">
          <button
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'users'
                ? 'bg-orange-500 text-black font-bold'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('users')}
          >
            Пользователи
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'events'
                ? 'bg-orange-500 text-black font-bold'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('events')}
          >
            События
          </button>
        </div>

        {activeTab === 'users' && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.2 }}
          >
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Поиск пользователей..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-orange-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <svg
                className="absolute right-3 top-2.5 h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800 text-orange-300">
                    <th
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-700 transition"
                      onClick={() => handleUserSort('id')}
                    >
                      ID {getSortIndicator(userSortBy, 'id', userSortOrder)}
                    </th>
                    <th
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-700 transition"
                      onClick={() => handleUserSort('username')}
                    >
                      Имя {getSortIndicator(userSortBy, 'username', userSortOrder)}
                    </th>
                    <th
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-700 transition"
                      onClick={() => handleUserSort('email')}
                    >
                      Email {getSortIndicator(userSortBy, 'email', userSortOrder)}
                    </th>
                    <th
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-700 transition"
                      onClick={() => handleUserSort('role')}
                    >
                      Роль {getSortIndicator(userSortBy, 'role', userSortOrder)}
                    </th>
                    <th
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-700 transition"
                      onClick={() => handleUserSort('city')}
                    >
                      Город {getSortIndicator(userSortBy, 'city', userSortOrder)}
                    </th>
                    <th
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-700 transition"
                      onClick={() => handleUserSort('age')}
                    >
                      Возраст {getSortIndicator(userSortBy, 'age', userSortOrder)}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-800/50 transition">
                      <td className="px-4 py-3">{user.id}</td>
                      <td className="px-4 py-3">{user.username}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            user.role.toUpperCase() === 'MODERATOR'
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">{user.city || '-'}</td>
                      <td className="px-4 py-3">{user.age || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'events' && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ delay: 0.2 }}
          >
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Поиск событий..."
                value={eventSearch}
                onChange={(e) => setEventSearch(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-orange-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <svg
                className="absolute right-3 top-2.5 h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800 text-orange-300">
                    <th
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-700 transition"
                      onClick={() => handleEventSort('id')}
                    >
                      ID {getSortIndicator(eventSortBy, 'id', eventSortOrder)}
                    </th>
                    <th
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-700 transition"
                      onClick={() => handleEventSort('title')}
                    >
                      Название {getSortIndicator(eventSortBy, 'title', eventSortOrder)}
                    </th>
                    <th
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-700 transition"
                      onClick={() => handleEventSort('date')}
                    >
                      Дата {getSortIndicator(eventSortBy, 'date', eventSortOrder)}
                    </th>
                    <th
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-700 transition"
                      onClick={() => handleEventSort('type')}
                    >
                      Тип {getSortIndicator(eventSortBy, 'type', eventSortOrder)}
                    </th>
                    <th
                      className="px-4 py-3 text-left cursor-pointer hover:bg-gray-700 transition"
                      onClick={() => handleEventSort('price')}
                    >
                      Цена {getSortIndicator(eventSortBy, 'price', eventSortOrder)}
                    </th>
                    <th className="px-4 py-3 text-left">Создатель</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-800/50 transition">
                      <td className="px-4 py-3">{event.id}</td>
                      <td className="px-4 py-3 font-medium">{event.title}</td>
                      <td className="px-4 py-3">{new Date(event.date).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            event.type === 'premium'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-green-500/20 text-green-400'
                          }`}
                        >
                          {event.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">{event.price} ₽</td>
                      <td className="px-4 py-3">{event.creator.username}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ModeratorPage;