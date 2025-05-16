"use client";

import { useState, useEffect, useMemo, ReactNode } from "react";
import axios from "axios";
import EventCard from "../../components/EventCard";

type Organizer = {
  id: number;
  username: string;
};

type Event = {
  id: number;
  title: string | ReactNode;
  description: string;
  date: string;
  location: string;
  type: string;
  price: number;
  creator?: Organizer;
};

type Filters = {
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "date" | "price";
  sortOrder?: "asc" | "desc";
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // New states for "я иду" and "созданные" filters
  const [showSubscribed, setShowSubscribed] = useState(false);
  const [showCreated, setShowCreated] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        if (showSubscribed || showCreated) {
          // Fetch from /events/mine endpoint with credentials for auth
          const res = await axios.get("http://localhost:3000/events/mine", { withCredentials: true });
          let filteredEvents: Event[] = [];
          if (showSubscribed && showCreated) {
            // Combine both arrays, remove duplicates by id
            const combined = [...res.data.subscribedEvents, ...res.data.createdEvents];
            const uniqueMap = new Map<number, Event>();
            combined.forEach((ev: Event) => {
              uniqueMap.set(ev.id, ev);
            });
            filteredEvents = Array.from(uniqueMap.values());
          } else if (showSubscribed) {
            filteredEvents = res.data.subscribedEvents;
          } else if (showCreated) {
            filteredEvents = res.data.createdEvents;
          }
          setEvents(filteredEvents);
        } else {
          // Existing filters for /events endpoint
          const query = new URLSearchParams();
          if (filters.type) query.append("type", filters.type);
          if (filters.minPrice) query.append("minPrice", filters.minPrice.toString());
          if (filters.maxPrice) query.append("maxPrice", filters.maxPrice.toString());
          if (filters.sortBy) query.append("sortBy", filters.sortBy);
          if (filters.sortOrder) query.append("sortOrder", filters.sortOrder);

          const res = await axios.get("http://localhost:3000/events", { params: query, withCredentials: true });
          setEvents(res.data);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [filters, showSubscribed, showCreated]);

  const filteredEvents = useMemo(() => {
    if (!searchTerm) return events;

    const lowerSearch = searchTerm.toLowerCase();

    return events.filter(event => {
      const inTitle = typeof event.title === "string" && event.title.toLowerCase().includes(lowerSearch);
      const inCreator = event.creator?.username.toLowerCase().includes(lowerSearch);
      return inTitle || inCreator;
    });
  }, [events, searchTerm]);

  const highlightMatch = (text: string, highlight: string) => {
    if (!highlight) return text;
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-orange-100 text-orange-800">{part}</mark> : part
    );
  };

  const eventTypes = [
    { value: "regular", label: "Обычные", color: "bg-blue-500" },
    { value: "premium", label: "Премиум", color: "bg-purple-500" },
    { value: "online", label: "Онлайн", color: "bg-green-500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black px-4 py-8 text-white">
      <div className="max-w-7xl mx-auto p-4 space-y-8">
        {/* Hero Section */}
        <div className="text-center py-12">
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-600">
            Найди свои идеальные мероприятия
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Открой для себя уникальные события, которые вдохновляют и объединяют
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-1/4 bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 space-y-6">
            <h2 className="text-2xl font-bold mb-2 text-orange-400">Фильтры</h2>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск мероприятий..."
                className="w-full p-3 pl-10 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Event Type */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-300">Тип мероприятия</h3>
              <div className="space-y-2">
                {eventTypes.map((type) => (
                  <button
                    key={type.value}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-all ${filters.type === type.value ? `${type.color} text-white` : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
                    onClick={() => setFilters({ ...filters, type: filters.type === type.value ? undefined : type.value })}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-300">Ценовой диапазон</h3>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="От"
                  className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                  onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
                />
                <input
                  type="number"
                  placeholder="До"
                  className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                  onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                />
              </div>
            </div>

            {/* Sorting */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-300">Сортировка</h3>
              <select
                className="w-full p-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 text-white"
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split("-");
                  setFilters({ ...filters, sortBy: sortBy as any, sortOrder: sortOrder as any });
                }}
              >
                <option value="">По умолчанию</option>
                <option value="date-asc">Дата (по возрастанию)</option>
                <option value="date-desc">Дата (по убыванию)</option>
                <option value="price-asc">Цена (по возрастанию)</option>
                <option value="price-desc">Цена (по убыванию)</option>
              </select>
            </div>

            {/* New Filters: "я иду" and "созданные" */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-300">Мои фильтры</h3>
              <div className="flex flex-col space-y-2">
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-orange-500"
                    checked={showSubscribed}
                    onChange={() => setShowSubscribed(!showSubscribed)}
                  />
                  <span className="ml-2 text-gray-300">Я иду</span>
                </label>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-orange-500"
                    checked={showCreated}
                    onChange={() => setShowCreated(!showCreated)}
                  />
                  <span className="ml-2 text-gray-300">Созданные</span>
                </label>
              </div>
            </div>

            {/* Reset Filters */}
            <button
              className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-orange-400 rounded-lg transition-colors font-medium"
              onClick={() => {
                setFilters({});
                setSearchTerm("");
                setShowSubscribed(false);
                setShowCreated(false);
              }}
            >
              Сбросить фильтры
            </button>
          </div>

          {/* Events List */}
          <div className="w-full lg:w-3/4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">
                Доступные мероприятия
                {filteredEvents.length > 0 && (
                  <span className="ml-2 text-orange-400 text-xl">
                    ({filteredEvents.length})
                  </span>
                )}
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-12 h-12 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-300 mb-2">
                  Мероприятий не найдено
                </h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Попробуйте изменить параметры поиска или сбросить фильтры
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={{
                      ...event,
                      id: event.id,
                      imageUrl: (event as any).mainPhotoUrl,
                      title: typeof event.title === "string" ? highlightMatch(event.title, searchTerm) : event.title,
                      creator: event.creator
                        ? {
                            ...event.creator,
                            username: highlightMatch(event.creator.username, searchTerm) as unknown as string,
                          }
                        : undefined,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
