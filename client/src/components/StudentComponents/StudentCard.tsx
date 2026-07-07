import { useState } from 'react';
import { MiniCalendar } from '../MiniCalendar';
import { ClassActionModal } from './ClassActionModal'; 
import { CreateClassModal } from './CreateClassModal'; 
import { type CalendarEvent } from '../../Types';

interface Student {
  _id: string;
  name: string;
  email: string;
}

interface StudentCardProps {
  student: Student;
  allEvents: CalendarEvent[];
  onDataChange?: () => void; // Para recargar datos al crear/borrar
}

export const StudentCard = ({ student, allEvents, onDataChange }: StudentCardProps) => {
  // 1. ESTADOS PARA LOS MODALES
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 2. FILTRO BLINDADO (Funciona con objetos populados o strings)
  const studentEvents = allEvents.filter(ev => {
    if (!ev.studentId) return false;
    const eventStudentId = typeof ev.studentId === 'object' ? (ev.studentId as any)._id : ev.studentId;
    return eventStudentId === student._id;
  });

  const now = new Date();

  // 3. MATEMÁTICA DE ESTADÍSTICAS
  const totalClasses = studentEvents.length;
  const pastClasses = studentEvents.filter(ev => new Date(ev.date) < now).length;
  
  const futureClasses = studentEvents.filter(ev => new Date(ev.date) >= now);
  futureClasses.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextClass = futureClasses[0];

  // 4. 🔌 EL CONECTOR: Esta función recibe el clic del MiniCalendar
  const handleDateSelection = (date: Date, event?: CalendarEvent) => {
    if (event) {
        console.log("first",date,event)
      // Si el día YA TIENE clase, abrimos edición
      setSelectedEvent(event);
      setIsEditOpen(true);
    } else {
      // Si el día ESTÁ LIBRE, guardamos la fecha y abrimos creación
      setSelectedDate(date);
      setIsCreateOpen(true);
    }
  };

  // Función segura de recarga
  const handleSuccess = () => {
    if (onDataChange) onDataChange();
  };

  return (
    <>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
        
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-5 text-white flex justify-between items-center">
          <div className="overflow-hidden flex flex-col items-start">
            <h3 className="text-xl font-black truncate">{student.name}</h3>
            <p className="text-indigo-200 text-sm truncate">{student.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 p-5 flex-1">
          
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col justify-center">
            {/* 🔌 CONECTAMOS EL CALENDARIO AQUÍ */}
            <MiniCalendar 
              events={studentEvents} 
              studentId={student._id}
              onDateClick={handleDateSelection} 
            />
          </div>

          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-emerald-600">{pastClasses}</span>
                <span className="text-emerald-800 font-bold text-xs uppercase tracking-wider mt-1">Completadas</span>
              </div>
              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-indigo-600">{totalClasses}</span>
                <span className="text-indigo-800 font-bold text-xs uppercase tracking-wider mt-1">Programadas</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Próxima Clase</p>
              {nextClass ? (
                <p className="font-bold text-violet-600 text-sm">
                  {new Date(nextClass.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })} a las {new Date(nextClass.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </p>
              ) : (
                <p className="text-slate-500 text-sm font-medium">Sin clases futuras</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🔌 LOS MODALES (Invisibles hasta que cambia el estado) */}
      
      {/* MODAL 1: EDITAR / CANCELAR CLASE EXISTENTE */}
      <ClassActionModal 
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        event={selectedEvent}
        onSuccess={handleSuccess}
      />

      {/* MODAL 2: CREAR CLASE ÚNICA EN DÍA LIBRE */}
      <CreateClassModal 
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        selectedDate={selectedDate}
        studentId={student._id}
        studentName={student.name}
        onSuccess={handleSuccess}
      />
    </>
  );
};