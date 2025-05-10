import React, { ReactNode } from 'react';

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
  imageUrl?: string;
  creator?: Organizer;
};

const EventCard: React.FC<{ event: Event }> = ({ event }) => {
  return (
    <div className="bg-black rounded-2xl p-6 shadow-xl hover:shadow-2xl transition cursor-pointer">
      {event.imageUrl && (
        <img
          src={event.imageUrl}
          alt={typeof event.title === 'string' ? event.title : 'Event image'}
          className="mb-4 w-full max-h-48 object-cover rounded-lg"
        />
      )}
      <h3 className="text-lg font-bold mb-2 text-white">{event.title}</h3>
      <p className="text-sm text-white mb-1">{new Date(event.date).toLocaleDateString()}</p>
      <p className="text-sm mb-2 text-white">{event.location}</p>
      <p className="text-sm mb-2 text-white">{event.description}</p>
      <p className="text-sm font-semibold mb-2 text-white">Цена: {event.price} ₽</p>
      <p className="text-sm text-white">Организатор: {event.creator?.username || 'Неизвестный организатор'}</p>
    </div>
  );
};

export default EventCard;
