"use client";

import { useRouter } from "next/navigation";

interface EventCardProps {
  event: {
    id: number;
    title: React.ReactNode;
    description: string;
    date: string;
    location: string;
    type: string;
    price: number;
    imageUrl?: string;
    creator?: {
      id: number;
      username: React.ReactNode;
    };
  };
}

export default function EventCard({ event }: EventCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/events/${event.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="cursor-pointer bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-orange-500/20 transition-all duration-300 hover:scale-[1.02]"
    >
      {event.imageUrl && (
        <img src={event.imageUrl} alt={typeof event.title === 'string' ? event.title : 'Event image'} className="w-full h-40 object-cover" />
      )}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{event.title}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-orange-500 font-medium">
            {new Date(event.date).toLocaleDateString()}
          </span>
          <span className="bg-orange-500/10 text-orange-500 px-2 py-1 rounded">
            {event.price > 0 ? `${event.price} ₽` : "Бесплатно"}
          </span>
        </div>
        {event.creator && (
          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-gray-400 text-sm">Организатор: {event.creator.username}</p>
          </div>
        )}
      </div>
    </div>
  );
}