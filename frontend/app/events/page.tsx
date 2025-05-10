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

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (filters.type) query.append("type", filters.type);
        if (filters.minPrice) query.append("minPrice", filters.minPrice.toString());
        if (filters.maxPrice) query.append("maxPrice", filters.maxPrice.toString());
        if (filters.sortBy) query.append("sortBy", filters.sortBy);
        if (filters.sortOrder) query.append("sortOrder", filters.sortOrder);


        const res = await axios.get("http://localhost:3000/events", { params: query, withCredentials: true });
        setEvents(res.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [filters]);

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
      regex.test(part) ? <mark key={i}>{part}</mark> : part
    );
  };

  return (
    <div className="min-h-screen bg-black px-4 py-8 text-white">
      <div className="max-w-7xl mx-auto bg-black p-8 rounded-2xl shadow-xl space-y-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/4 bg-black p-6 rounded-lg shadow space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Фильтры</h2>

            <input
              type="text"
              placeholder="Поиск по названию и организатору"
              className="w-full p-2 border border-orange-500 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4 bg-black text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div>
              <label className="block text-base font-medium mb-1">Тип мероприятия</label>
              <select
                className="w-full p-2 border border-orange-500 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white"
                onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined })}
              >
                <option value="">Все</option>
                <option value="regular">Обычные</option>
                <option value="premium">Премиум</option>
                <option value="online">Онлайн</option>
              </select>
            </div>

            <div>
              <label className="block text-base font-medium mb-1">Цена</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="От"
                  className="w-full p-2 border border-orange-500 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white"
                  onChange={(e) => setFilters({ ...filters, minPrice: Number(e.target.value) })}
                />
                <input
                  type="number"
                  placeholder="До"
                  className="w-full p-2 border border-orange-500 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white"
                  onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <label className="block text-base font-medium mb-1">Сортировка</label>
              <select
                className="w-full p-2 border border-orange-500 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 bg-black text-white"
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
          </div>

          <div className="w-full md:w-3/4">
            <h1 className="text-3xl font-semibold mb-6">Мероприятия</h1>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <p className="text-center text-orange-300 py-8">Мероприятий не найдено</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={{
                      ...event,
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
