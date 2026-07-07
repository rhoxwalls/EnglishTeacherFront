import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../hooks/useAuth';
import { type classRoom } from '../types';
import { FiBookOpen, FiLogOut, FiCheckCircle } from 'react-icons/fi';

export const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [myRooms, setMyRooms] = useState<classRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyRooms = async () => {
      try {
        const { data } = await api.get('/classrooms');
        setMyRooms(data);
      } catch (error) {
        console.error("Error al cargar las clases", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyRooms();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* HEADER DEL ALUMNO */}
      <header className="bg-indigo-600 text-white shadow-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">English Platform</h1>
            <p className="text-indigo-200 text-sm">Portal del Estudiante</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-medium hidden md:block">¡Hola, {user?.name}! 👋</span>
            <button 
              onClick={logout}
              className="p-2 bg-indigo-700 hover:bg-indigo-800 rounded-lg transition-colors"
              title="Cerrar Sesión"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-slate-800 mb-8">Mis Aulas Virtuales</h2>

        {isLoading ? (
          <div className="text-center py-10 text-slate-500">Buscando tus clases...</div>
        ) : myRooms.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center shadow-sm">
            <FiBookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-700">Aún no tienes clases asignadas</h3>
            <p className="text-slate-500 mt-2">Tu profesora te asignará a un aula pronto. ¡Revisa más tarde!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myRooms.map(room => {
              // Calculamos el progreso para mostrarlo en la tarjeta
              const total = room.tasks?.length || 0;
              const completed = room.tasks?.filter(t => t.completed).length || 0;
              const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

              return (
                <Link 
                  to={`/sala/${room._id}`} 
                  key={room._id} 
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all group flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                      <FiBookOpen className="w-6 h-6" />
                    </div>
                    {progress === 100 && total > 0 && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        <FiCheckCircle /> Al día
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                    {room.name}
                  </h3>
                  <p className="text-sm text-slate-500 mb-6">Prof. {room.TeacherId?.name}</p>

                  {/* Barra de progreso miniatura */}
                  <div className="mt-auto">
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                      <span>Progreso</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};