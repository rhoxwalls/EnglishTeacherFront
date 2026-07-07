import { useState, FormEvent, type ChangeEvent } from 'react';
import api from '../api/axios';
import { FiPlus, FiTrash2, FiKey } from 'react-icons/fi'; // Asegúrate de tener react-icons
import { type RegisterCredentials } from '../types';

// Interfaz para el horario base
export interface ScheduleEntry {
  dayOfWeek: string; // Ej: 'Lunes', 'Martes'
  time: string;      // Ej: '16:00'
}

export const Register = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [message, setMessage] = useState<string | null>(null);

  // --- ESTADOS PARA EL HORARIO ---
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [tempDay, setTempDay] = useState<string>('Lunes');
  const [tempTime, setTempTime] = useState<string>('16:00');

  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Función para agregar un día al horario del alumno
  const handleAddSchedule = () => {
    // Evitamos duplicados exactos
    const exists = schedule.find(s => s.dayOfWeek === tempDay && s.time === tempTime);
    if (!exists) {
      setSchedule([...schedule, { dayOfWeek: tempDay, time: tempTime }]);
    }
  };

  const handleRemoveSchedule = (indexToRemove: number) => {
    setSchedule(schedule.filter((_, index) => index !== indexToRemove));
  };

  const generatePassword = () => {
    // Genera una contraseña aleatoria de 6 caracteres (Ej: a7b9k2)
    const randomPass = Math.random().toString(36).slice(-6);
    setPassword(randomPass);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);
    
    // Incluimos el horario en el payload
    const payload = { 
      name, 
      email, 
      password, 
      role,
      baseSchedule: role === 'student' ? schedule : [] // Solo los alumnos tienen este horario
    };

    try {
      await api.post('/auth/register', payload);
      
      setMessage(`✅ ${role === 'teacher' ? 'Profesor' : 'Alumno'} creado con éxito. Contraseña temporal: ${password}`);
      
      // Limpiamos el formulario
      setName(''); setEmail(''); setPassword(''); setSchedule([]);
    } catch (error) {
      console.error(error);
      setMessage('❌ Error al crear usuario. Quizás el email ya existe.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 max-w-2xl mx-auto">
      <h3 className="text-2xl font-black mb-6 text-slate-800">Registrar Nuevo Usuario</h3>
      
      {message && (
        <div className={`p-4 mb-6 rounded-xl font-medium ${message.includes('✅') ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-rose-100 text-rose-800 border border-rose-200'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* BLOQUE 1: Datos Personales */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Datos Básicos</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-2">Nombre Completo</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none" required />
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none" required />
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-2">Contraseña Temporal</label>
              <div className="flex gap-2">
                <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none" required minLength={6} />
                <button type="button" onClick={generatePassword} className="p-3 bg-violet-100 text-violet-700 rounded-xl hover:bg-violet-200 transition tooltip" title="Generar contraseña">
                  <FiKey />
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">El alumno podrá cambiarla desde su perfil.</p>
            </div>
            <div>
              <label className="block text-slate-700 text-sm font-bold mb-2">Rol de Usuario</label>
              <select value={role} onChange={(e) => setRole(e.target.value as 'student' | 'teacher')} className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-violet-500 outline-none">
                <option value="student">👨‍🎓 Alumno</option>
                <option value="teacher">👩‍🏫 Profesor</option>
              </select>
            </div>
          </div>
        </div>

        {/* BLOQUE 2: Horario (Solo visible si es alumno) */}
        {role === 'student' && (
          <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
            <h4 className="text-sm font-bold text-indigo-800 uppercase tracking-wider mb-4">Horario de Cursado Fijo</h4>
            
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <select value={tempDay} onChange={(e) => setTempDay(e.target.value)} className="p-3 rounded-xl border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500 flex-1">
                {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
              </select>
              
              <input type="time" value={tempTime} onChange={(e) => setTempTime(e.target.value)} className="p-3 rounded-xl border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500" />
              
              <button type="button" onClick={handleAddSchedule} className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition font-bold flex items-center justify-center gap-2">
                <FiPlus /> Añadir Día
              </button>
            </div>

            {/* Lista de horarios asignados */}
            <div className="space-y-2">
              {schedule.length === 0 ? (
                <p className="text-sm text-indigo-400 italic">No hay días asignados aún.</p>
              ) : (
                schedule.map((s, index) => (
                  <div key={index} className="flex justify-between items-center bg-white p-3 rounded-xl border border-indigo-100 shadow-sm">
                    <span className="font-bold text-slate-700">Todos los {s.dayOfWeek} a las {s.time} hs</span>
                    <button type="button" onClick={() => handleRemoveSchedule(index)} className="text-rose-400 hover:text-rose-600 p-1 bg-rose-50 rounded-lg">
                      <FiTrash2 />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button type="submit" className="bg-emerald-600 text-white font-black px-8 py-3 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 text-lg">
            Crear Usuario Oficial
          </button>
        </div>
      </form>
    </div>
  );
};