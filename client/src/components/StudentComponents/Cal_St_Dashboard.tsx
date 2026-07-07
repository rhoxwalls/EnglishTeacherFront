import { useState, useEffect, useMemo } from 'react';
import  api from '../../api/axios';
import { FiSearch, FiLoader } from 'react-icons/fi';
import { StudentCard } from './StudentCard'; // Importamos la nueva tarjeta
import {type CalendarEvent } from '../../types';

export const Cal_St_Dashboard = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. CARGAMOS LOS DATOS REALES DEL BACKEND
  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, eventsRes] = await Promise.all([
        api.get('/auth/students'), // Ruta donde obtienes tus alumnos
        api.get('/events')         // Ruta donde obtienes todo tu calendario
      ]);
      setStudents(studentsRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      console.error("Error cargando el Dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. FILTRADO EN TIEMPO REAL
  const filteredStudents = useMemo(() => {
    return students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, students]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <FiLoader className="w-10 h-10 text-violet-600 animate-spin mb-4" />
        <p className="text-slate-500 font-bold animate-pulse">Cargando alumnos y cronogramas...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 pb-20">
      
      {/* HEADER Y BARRA DE BÚSQUEDA */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm px-4 py-4 md:px-8">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Mis Alumnos</h1>
            <p className="text-sm text-slate-500 font-medium">Gestiona calendarios, asistencias y notas</p>
          </div>

          <div className="flex w-full md:w-auto items-center gap-2">
            <div className="relative w-full md:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" placeholder="Buscar alumno..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-xl outline-none focus:bg-white focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"
              />
            </div>
            
          
            
            
          </div>
          
        </div>
      </div>

      {/* GRILLA DE TARJETAS DE ALUMNOS */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-8">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 font-medium text-lg">No se encontraron alumnos registrados.</p>
          </div>
        ) : (
          // Usamos grid-cols-1 para móviles, 2 para tablets, y xl:grid-cols-2 para PCs grandes 
          // (Las tarjetas son anchas, así que 2 columnas en PC se ven muy bien)
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {filteredStudents.map(student => (
              <StudentCard 
                key={student._id} 
                student={student} 
                allEvents={events}
                onDataChange={fetchData}
              />
            ))}

          </div>
        )}
      </div>

    </div>
  );
};