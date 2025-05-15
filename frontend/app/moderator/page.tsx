'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

const ModeratorPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isModerator, setIsModerator] = useState(false);
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
    const checkAuthAndRole = async () => {
      try {
        const res = await fetch('http://localhost:3000/users/me');
        if (!res.ok) {
          throw new Error('Не авторизован');
        }
        const user = await res.json();
        if (user.role !== 'moderator') {
          throw new Error('Недостаточно прав');
        }
        setIsModerator(true);
      } catch (error:any) {
        console.error(error);
      
        if (error.message === 'Не авторизован') {
          router.push('/login');
        } else {
          router.push('/dashboard'); 
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndRole();
  }, [router]);

  useEffect(() => {
    if (isModerator) {
      if (activeTab === 'users') {
        fetchUsers();
      } else {
        fetchEvents();
      }
    }
  }, [isModerator, activeTab, userSearch, userSortBy, userSortOrder, eventSearch, eventSortBy, eventSortOrder]);

  const fetchUsers = async () => {
    const params = new URLSearchParams();
    if (userSearch) params.append('search', userSearch);
    if (userSortBy) params.append('sortBy', userSortBy);
    if (userSortOrder) params.append('sortOrder', userSortOrder);

    const res = await fetch(`/moderator/users?${params.toString()}`);
    const data = await res.json();
    setUsers(data.data);
  };

  const fetchEvents = async () => {
    const params = new URLSearchParams();
    if (eventSearch) params.append('search', eventSearch);
    if (eventSortBy) params.append('sortBy', eventSortBy);
    if (eventSortOrder) params.append('sortOrder', eventSortOrder);

    const res = await fetch(`/moderator/events?${params.toString()}`);
    const data = await res.json();
    setEvents(data.data);
  };

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

  if (isLoading) {
    return <div className="p-4">Загрузка...</div>;
  }

  if (!isModerator) {
    return <div className="p-4">Проверка прав доступа...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Панель модератора</h1>
      <div className="mb-4">
        <button
          className={`mr-4 px-4 py-2 ${activeTab === 'users' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('users')}
        >
          Пользователи
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'events' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('events')}
        >
          События
        </button>
      </div> 
 
      {activeTab === 'users' && (
        <div>
          <input
            type="text"
            placeholder="Поиск пользователей..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="mb-2 p-2 border border-gray-300 rounded"
          />
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 cursor-pointer" onClick={() => handleUserSort('id')}>ID</th>
                <th className="border border-gray-300 cursor-pointer" onClick={() => handleUserSort('username')}>Имя пользователя</th>
                <th className="border border-gray-300 cursor-pointer" onClick={() => handleUserSort('email')}>Email</th>
                <th className="border border-gray-300 cursor-pointer" onClick={() => handleUserSort('role')}>Роль</th>
                <th className="border border-gray-300 cursor-pointer" onClick={() => handleUserSort('city')}>Город</th>
                <th className="border border-gray-300 cursor-pointer" onClick={() => handleUserSort('age')}>Возраст</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="border border-gray-300 p-1">{user.id}</td>
                  <td className="border border-gray-300 p-1">{user.username}</td>
                  <td className="border border-gray-300 p-1">{user.email}</td>
                  <td className="border border-gray-300 p-1">{user.role}</td>
                  <td className="border border-gray-300 p-1">{user.city || '-'}</td>
                  <td className="border border-gray-300 p-1">{user.age || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'events' && (
        <div>
          <input
            type="text"
            placeholder="Поиск событий..."
            value={eventSearch}
            onChange={(e) => setEventSearch(e.target.value)}
            className="mb-2 p-2 border border-gray-300 rounded"
          />
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 cursor-pointer" onClick={() => handleEventSort('id')}>ID</th>
                <th className="border border-gray-300 cursor-pointer" onClick={() => handleEventSort('title')}>Название</th>
                <th className="border border-gray-300 cursor-pointer" onClick={() => handleEventSort('date')}>Дата</th>
                <th className="border border-gray-300 cursor-pointer" onClick={() => handleEventSort('type')}>Тип</th>
                <th className="border border-gray-300 cursor-pointer" onClick={() => handleEventSort('price')}>Цена</th>
                <th className="border border-gray-300 cursor-pointer">Создатель</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td className="border border-gray-300 p-1">{event.id}</td>
                  <td className="border border-gray-300 p-1">{event.title}</td>
                  <td className="border border-gray-300 p-1">{new Date(event.date).toLocaleString()}</td>
                  <td className="border border-gray-300 p-1">{event.type}</td>
                  <td className="border border-gray-300 p-1">{event.price}</td>
                  <td className="border border-gray-300 p-1">{event.creator.username}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ModeratorPage;