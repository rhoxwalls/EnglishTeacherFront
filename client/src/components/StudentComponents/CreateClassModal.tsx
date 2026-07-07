import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { FiX, FiPlus, FiClock, FiBookOpen } from 'react-icons/fi';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date | null;
  studentId: string;
  studentName: string;
  onSuccess: () => void;
}

export const CreateClassModal = ({ isOpen, onClose, selectedDate, studentId, studentName, onSuccess }: CreateModalProps) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('16:00'); // Hora por defecto para facilitar UX
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(`Clase con ${studentName}`);
    }
  }, [isOpen, studentName]);

  if (!isOpen || !selectedDate) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Combinamos la fecha del casillero con la hora elegida en el input
      const finalDate = new Date(selectedDate);
      const [hours, minutes] = time.split(':');
      finalDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      // Enviamos al endpoint actual. Al no mandar 'schedules', creará un solo evento
      await api.post('/events', {
        title,
        startDate: finalDate,
        studentId,
        description: "",
        location: "Online",
      });

      onSuccess();
      onClose();
      setTitle('');
    } catch (error) {
     return console.error("Error al programar la clase individual.", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        
        <div className="bg-emerald-50 p-5 flex justify-between items-start border-b border-emerald-100">
          <div>
            <h3 className="text-xl font-black text-emerald-900 flex items-center gap-2">
              <FiPlus /> Nueva Clase Individual
            </h3>
            <p className="text-emerald-600 text-sm mt-1 font-medium">
              Para: {studentName} — {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-2 text-emerald-400 hover:text-emerald-700 hover:bg-emerald-100 rounded-xl transition">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className=" text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <FiBookOpen /> Título de la sesión
            </label>
            <input 
              type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" required
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <FiClock /> Hora de la clase
            </label>
            <input 
              type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" required
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition shadow-md disabled:opacity-50 mt-2"
          >
            {loading ? 'Programando...' : 'Agendar Clase'}
          </button>
        </div>

      </form>
    </div>
  );
};