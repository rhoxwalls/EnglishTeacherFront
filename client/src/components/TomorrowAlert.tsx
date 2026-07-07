import { useEffect, useState } from 'react';
import { FiBell } from 'react-icons/fi';
import {type  CalendarEvent } from '../types';

export const TomorrowAlert = ({ events }: { events: CalendarEvent[] }) => {
  const [tomorrowEvents, setTomorrowEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    // Calculamos la fecha de "mañana" a la medianoche para comparar correctamente
    const today = new Date();
    const tomorrowStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    const tomorrowEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2);

    const filtered = events.filter(e => {
      const eventDate = new Date(e.date);
      return eventDate >= tomorrowStart && eventDate < tomorrowEnd;
    });

    setTomorrowEvents(filtered);
  }, [events]);

  if (tomorrowEvents.length === 0) return null;

  return (
    <div className="bg-amber-100 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm mb-8 flex items-center gap-4 animate-fade-in">
      <div className="p-2 bg-amber-500 text-white rounded-full animate-bounce">
        <FiBell className="w-5 h-5" />
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="text-amber-800 font-bold text-sm mb-1 uppercase tracking-wider">Aviso: Clases programadas para mañana</p>
        <div className="flex gap-4 overflow-x-auto pb-1 custom-scrollbar">
          {tomorrowEvents.map(ev => (
            <span key={ev._id} className="bg-white px-3 py-1 rounded-lg text-amber-900 font-medium text-sm shadow-sm whitespace-nowrap border border-amber-200">
              {new Date(ev.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} - {ev.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};