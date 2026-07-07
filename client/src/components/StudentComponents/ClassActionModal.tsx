import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { type CalendarEvent } from '../../Types';
import { FiX, FiCalendar, FiTrash2, FiClock } from 'react-icons/fi';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onSuccess: () => void; // Para recargar el dashboard después de editar
}

export const ClassActionModal = ({ isOpen, onClose, event, onSuccess }: ModalProps) => {
  const [newDate, setNewDate] = useState('');
  const [loading, setLoading] = useState(false);

  // Cuando se abre el modal, cargamos la fecha actual de la clase en el input
  useEffect(() => {
    if (event && event.date) {
      // Formateamos la fecha para que el input type="datetime-local" la entienda
      const dateObj = new Date(event.date);
      // Ajuste de zona horaria local para evitar saltos de hora
      dateObj.setMinutes(dateObj.getMinutes() - dateObj.getTimezoneOffset());
      setNewDate(dateObj.toISOString().slice(0, 16));
    }
  }, [event]);

  if (!isOpen || !event) return null;

  const handleUpdate = async () => {
    try {
      setLoading(true);
      // Enviamos el parche al backend
      await api.patch(`/events/${event._id}`, { date: newDate });
      onSuccess(); // Recargamos datos
      onClose();   // Cerramos modal
    } catch (error) {
      alert("Error al reprogramar la clase."+error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const isGroup = !!event.groupId;
    const msg = isGroup ? "¿Borrar solo esta clase o todo el cronograma futuro?" : "¿Cancelar esta clase?";
    if (!window.confirm(msg)) return;
    
    const deleteGroup = isGroup && window.confirm("Presiona OK para borrar TODA LA SERIE, o Cancelar para borrar solo esta.");

    try {
      setLoading(true);
      await api.delete(`/events/${event._id}?deleteGroup=${deleteGroup}`);
      onSuccess();
      onClose();
    } catch (error) {
      alert("Error al cancelar la clase."+error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        
        <div className="bg-violet-50 p-5 flex justify-between items-start border-b border-violet-100">
          <div>
            <h3 className="text-xl font-black text-violet-900 flex items-center gap-2">
              <FiCalendar /> Gestionar Clase
            </h3>
            <p className="text-violet-600 text-sm mt-1 font-medium">{event.title}</p>
          </div>
          <button onClick={onClose} className="p-2 text-violet-400 hover:text-violet-700 hover:bg-violet-100 rounded-xl transition">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <label className=" text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
            <FiClock /> Reprogramar Fecha y Hora
          </label>
          <input 
            type="datetime-local" 
            value={newDate} 
            onChange={(e) => setNewDate(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-violet-500 mb-6"
          />

          <div className="flex flex-col gap-3">
            <button 
              onClick={handleUpdate} disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl transition shadow-md disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button 
              onClick={handleDelete} disabled={loading}
              className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 font-bold py-3 rounded-xl transition"
            >
              <FiTrash2 /> Cancelar esta clase
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};