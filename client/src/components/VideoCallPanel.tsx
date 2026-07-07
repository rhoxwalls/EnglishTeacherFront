import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { FiVideo, FiUsers, FiUser } from 'react-icons/fi';
import { type classRoom } from '../Types';

export const VideoCallPanel = () => {
  const [classrooms, setClassrooms] = useState<classRoom[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Descargamos todas las aulas (individuales y grupales)
    api.get('/classrooms').then(res => setClassrooms(res.data));
  }, []);

  const handleStartCall = async (roomId: string) => {
    try {
      console.log("Enviando orden de encendido al backend...");
      const res = await api.patch(`/classrooms/${roomId}/live`, { isLive: true });
      console.log("✅ Respuesta del backend:", res.data);
      // 2. Nos metemos a la llamada
      navigate(`/live/${roomId}`);
    } catch (error) {
      alert("Error al iniciar la transmisión."+error);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-8">
      <div className="mb-8 border-b border-slate-100 pb-4">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <FiVideo className="text-rose-500" /> Central de Videollamadas
        </h2>
        <p className="text-slate-500 font-medium mt-1">Inicia la transmisión para tus alumnos o grupos.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {classrooms.map((room) => {
          // Detectamos si es grupal verificando si el nombre dice "Grupo" o analizando sus datos
          const isGroup = room.name.toLowerCase().includes('grupo');

          return (
            <div key={room._id} className="p-5 border border-slate-200 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-violet-300 transition-colors">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="p-1.5 bg-slate-100 rounded-lg text-slate-600">
                    {isGroup ? <FiUsers /> : <FiUser />}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {isGroup ? 'Clase Grupal' : 'Clase Individual'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-800">{room.name}</h3>
                {/* Si no es grupal, mostramos el nombre del alumno. Si es grupal, mostramos la cantidad */}
                <p className="text-sm text-slate-500">
                  {isGroup ? 'Varios alumnos inscritos' : `Alumno: ${(room.StudentId as any)?.name || 'Sin asignar'}`}
                </p>
              </div>

              <button 
                onClick={() => handleStartCall(room._id)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-rose-500 transition-all shadow-md hover:shadow-rose-200"
              >
                <FiVideo /> Llamar
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};