import { useState, useEffect } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiInfo,
  FiEdit2,
  FiCheck,
  FiX,
  FiSettings,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";
import api from "../api/axios";
import { type ScheduleEntry, type ScheduleException } from "../types";

interface MiniCalendarProps {
  studentId?: string;
}

const dayMap: Record<string, number> = {
  Domingo: 0,
  Lunes: 1,
  Martes: 2,
  Miércoles: 3,
  Jueves: 4,
  Viernes: 5,
  Sábado: 6,
};

const daysOfWeek = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

export const MiniCalendar = ({ studentId }: MiniCalendarProps) => {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [exceptions, setExceptions] = useState<ScheduleException[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentDate, setCurrentDate] = useState(new Date());

  // === 🔄 CAMBIO 1: NUEVA ESTRUCTURA DE ESTADOS DE SELECCIÓN ===
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayClasses, setDayClasses] = useState<Array<{
    baseScheduleId: string;
    time: string;
    status: 'normal' | 'rescheduled' | 'cancelled';
  }>>([]);
  
  // Guardamos el horario específico que se va a reprogramar individualmente
  const [editingClass, setEditingClass] = useState<{
    baseScheduleId: string;
    time: string;
  } | null>(null);

  const [isReprogramming, setIsReprogramming] = useState(false);
  const [newDateInput, setNewDateInput] = useState("");
  const [newTimeInput, setNewTimeInput] = useState("");

  // ==========================================
  // ESTADOS PARA EDITAR HORARIO BASE
  // ==========================================
  const [isEditingBase, setIsEditingBase] = useState(false);
  const [draftSchedule, setDraftSchedule] = useState<ScheduleEntry[]>([]);
  const [draftDay, setDraftDay] = useState("Lunes");
  const [draftTime, setDraftTime] = useState("16:00");

  const fetchSchedule = async () => {
    try {
      setIsLoading(true);
      const endpoint = studentId ? `auth/students/${studentId}` : "/auth/me";
      const { data } = await api.get(endpoint);
      setSchedule(data.baseSchedule || []);
      setExceptions(data.scheduleExceptions || []);
    } catch (error) {
      console.error("Error cargando el calendario:", error);
      setError("No se pudo cargar el horario.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [studentId]);

  // === 🔄 CAMBIO 2: REFACTORIZACIÓN EN EL ENVÍO DE DATOS (MÚLTIPLES HORARIOS) ===
  const handleReprogram = async () => {
    if (!editingClass || !selectedDate || !studentId) return;
    try {
      await api.patch(`auth/students/${studentId}/exceptions`, {
        originalDate: selectedDate,
        baseScheduleId: editingClass.baseScheduleId, // Enviamos ID del bloque específico
        newDate: newDateInput,
        time: newTimeInput,
        status: 'rescheduled'
      });
      setIsReprogramming(false);
      setEditingClass(null);
      setSelectedDate(null);
      setDayClasses([]);
      fetchSchedule();
    } catch (error) {
      alert("Error al reprogramar la clase.");
    }
  };

  // ==========================================
  // FUNCIONES PARA EDITAR HORARIO BASE
  // ==========================================
  const startEditingBase = () => {
    setDraftSchedule([...schedule]);
    setIsEditingBase(true);
    setSelectedDate(null);
    setDayClasses([]);
  };

  const handleAddDraft = () => {
    const exists = draftSchedule.find(
      (s) => s.dayOfWeek === draftDay && s.time === draftTime,
    );
    if (!exists)
      setDraftSchedule([
        ...draftSchedule,
        { dayOfWeek: draftDay, time: draftTime },
      ]);
  };

  const handleRemoveDraft = (indexToRemove: number) => {
    setDraftSchedule(
      draftSchedule.filter((_, index) => index !== indexToRemove),
    );
  };

  const saveBaseSchedule = async () => {
    if (!studentId) return;
    try {
      await api.patch(`auth/students/${studentId}/schedule`, {
        newSchedule: draftSchedule,
      });
      setSchedule(draftSchedule);
      setIsEditingBase(false);
    } catch (error) {
      alert("Error al guardar el nuevo horario base.");
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  // === 🔄 CAMBIO 3: NUEVO ALGORITMO INTEGRAL EN RENDERCELLS ===
  const renderCells = () => {
    const rows = [];
    let days = [];
    let day = startDate;
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "d");
        const cloneDay = day;

        // 1. Buscamos TODOS los horarios base configurados para este día de la semana
        const baseClasses = schedule.filter(s => dayMap[s.dayOfWeek] === cloneDay.getDay());
        
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());
        const isSelected = selectedDate && isSameDay(day, selectedDate);

        // 2. Mapeamos cada horario base evaluando sus excepciones de forma individual
        const activeClassesForToday = baseClasses.map(bc => {
          const dayException = exceptions.find(e => 
            isSameDay(new Date(e.originalDate), cloneDay) && 
            e.baseScheduleId === bc._id
          );

          return {
            baseScheduleId: bc._id!,
            time: dayException?.status === 'rescheduled' && dayException.newDate
              ? format(new Date(dayException.newDate), 'HH:mm')
              : bc.time,
            status: dayException?.status || 'normal'
          };
        });

        // 3. Revisamos si hay clases externas reprogramadas hacia hoy
        const externalRescheduled = exceptions.filter(e => e.newDate && isSameDay(new Date(e.newDate), cloneDay));
        externalRescheduled.forEach(er => {
          if (!activeClassesForToday.some(c => c.baseScheduleId === er.baseScheduleId)) {
            activeClassesForToday.push({
              baseScheduleId: er.baseScheduleId,
              time: format(new Date(er.newDate!), 'HH:mm'),
              status: 'rescheduled'
            });
          }
        });

        // Indicadores analíticos del día para los estilos visuales
        const totalLiveClasses = activeClassesForToday.filter(c => c.status !== 'cancelled');
        const hasCancelled = activeClassesForToday.some(c => c.status === 'cancelled');
        const hasRescheduled = activeClassesForToday.some(c => c.status === 'rescheduled');

        days.push(
          <div key={day.toString()} className="flex justify-center items-center h-10 w-full relative">
            <button
              type="button"
              disabled={!isCurrentMonth}
              onClick={() => {
                if (isCurrentMonth && activeClassesForToday.length > 0) {
                  setSelectedDate(cloneDay);
                  setDayClasses(activeClassesForToday);
                  setIsReprogramming(false);
                } else if (isCurrentMonth) {
                  setSelectedDate(null);
                  setDayClasses([]);
                }
              }}
              className={`
                flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full text-sm font-medium transition-all
                ${!isCurrentMonth ? 'text-slate-200 pointer-events-none' : ''} 
                ${isCurrentMonth && activeClassesForToday.length === 0 && !isToday ? 'text-slate-600 hover:bg-slate-100 cursor-pointer' : ''}
                
                ${/* Si todas las clases fijas de hoy fueron canceladas */ ''}
                ${totalLiveClasses.length === 0 && hasCancelled && !isSelected ? 'bg-rose-100 text-rose-700 line-through font-bold' : ''}
                
                ${/* Clases normales vigentes hoy */ ''}
                ${totalLiveClasses.length > 0 && !hasRescheduled && !isSelected ? 'bg-violet-100 text-violet-700 font-bold hover:bg-violet-200' : ''}
                
                ${/* Si hay por lo menos una reprogramada hoy */ ''}
                ${hasRescheduled && !isSelected ? 'bg-amber-100 text-amber-700 font-bold hover:bg-amber-200' : ''}
                
                ${/* Estado seleccionado global */ ''}
                ${isSelected ? 'bg-slate-800 text-white scale-110 z-10 shadow-md' : ''}
              `}
            >
              {formattedDate}
            </button>
            {/* 💡 Pequeña insignia de conteo si hay más de 1 clase en el día */}
            {totalLiveClasses.length > 1 && isCurrentMonth && (
              <span className="absolute top-1 right-1 bg-violet-500 text-white text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-black scale-90">
                {totalLiveClasses.length}
              </span>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1" key={day.toString()}>
          {days}
        </div>,
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  if (isLoading)
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200 animate-pulse h-64"></div>
    );
  if (error)
    return (
      <div className="text-rose-500 text-sm font-bold bg-rose-50 p-4 rounded-2xl">
        {error}
      </div>
    );

  // === 🔄 CAMBIO 4: CANCELACIÓN INDIVIDUAL ADAPTADA PARA LEER EL ID DEL BLOQUE ===
  const handleCancelDay = async (baseScheduleId: string) => {
    if (!selectedDate || !studentId) return;
    if (!window.confirm("¿Seguro que quieres cancelar este bloque de clase por imprevisto?")) return;

    try {
      await api.patch(`auth/students/${studentId}/exceptions`, {
        originalDate: selectedDate,
        baseScheduleId: baseScheduleId, // Pasamos el ID del bloque seleccionado
        status: 'cancelled'
      });
      
      setSelectedDate(null);
      setDayClasses([]);
      fetchSchedule();
    } catch (error) {
      alert("Error al cancelar la clase.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
      {/* CABECERA DINÁMICA */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        {isEditingBase ? (
          <h3 className="text-lg font-black text-indigo-800 flex items-center gap-2">
            <FiSettings /> Reconfigurar Días Fijos
          </h3>
        ) : (
          <h3 className="text-lg font-black text-slate-800 capitalize flex items-center gap-2">
            {format(currentDate, "MMMM yyyy", { locale: es })}
          </h3>
        )}

        <div className="flex gap-2 items-center">
          {studentId && !isEditingBase && (
            <button
              onClick={startEditingBase}
              className="text-xs font-bold text-slate-400 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition flex items-center gap-2"
            >
              <FiSettings /> Editar Rutina
            </button>
          )}
          {!isEditingBase && (
            <div className="flex gap-1 ml-2">
              <button
                type="button"
                onClick={prevMonth}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition"
              >
                <FiChevronLeft />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 transition"
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* VISTA 1: MODO EDICIÓN */}
      {isEditingBase ? (
        <div className="animate-fade-in space-y-6">
          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <select
                value={draftDay}
                onChange={(e) => setDraftDay(e.target.value)}
                className="p-2.5 rounded-xl border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500 flex-1 text-sm font-medium"
              >
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <input
                type="time"
                value={draftTime}
                onChange={(e) => setDraftTime(e.target.value)}
                className="p-2.5 rounded-xl border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
              />
              <button
                type="button"
                onClick={handleAddDraft}
                className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition flex justify-center items-center"
              >
                <FiPlus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {draftSchedule.length === 0 ? (
                <p className="text-sm text-indigo-400 italic text-center py-2">
                  Sin días asignados.
                </p>
              ) : (
                draftSchedule.map((s, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-white p-3 rounded-xl border border-indigo-100 shadow-sm"
                  >
                    <span className="font-bold text-slate-700 text-sm">
                      Todos los {s.dayOfWeek} a las {s.time}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDraft(index)}
                      className="text-rose-400 hover:text-rose-600 p-1.5 bg-rose-50 rounded-lg"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsEditingBase(false)}
              className="px-4 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={saveBaseSchedule}
              className="px-5 py-2 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition shadow-sm text-sm"
            >
              Guardar Nuevo Horario
            </button>
          </div>
        </div>
      ) : (
        /* VISTA 2: MODO CALENDARIO NORMAL */
        <>
          {schedule.length === 0 ? (
            <div className="bg-slate-50 p-4 rounded-2xl border flex items-start gap-3 mt-4">
              <FiInfo className="text-slate-400 w-5 h-5 shrink-0" />
              <p className="text-sm text-slate-500 font-medium">
                No hay horarios asignados.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"].map((d) => (
                  <div
                    key={d}
                    className="text-center text-xs font-bold text-slate-400 uppercase"
                  >
                    {d}
                  </div>
                ))}
              </div>
              {renderCells()}

              {/* === 🔄 CAMBIO 5: REESTRUCTURACIÓN COMPLETA DEL PANEL INFERIOR ITERATIVO === */}
              <div className="mt-6 pt-4 border-t border-slate-100 min-h-[4rem] space-y-3">
                {selectedDate && dayClasses.length > 0 ? (
                  isReprogramming && editingClass ? (
                    /* 🛠️ FORMULARIO DE REPROGRAMACIÓN */
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-fade-in space-y-3">
                      <div className="flex justify-between items-center mb-1">
                        <h4 className="text-sm font-bold text-slate-700">
                          Reprogramar bloque de las {editingClass.time} hs
                        </h4>
                        <button
                          onClick={() => { setIsReprogramming(false); setEditingClass(null); }}
                          className="text-slate-400 hover:text-rose-500 transition"
                        >
                          <FiX />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={newDateInput}
                          onChange={(e) => setNewDateInput(e.target.value)}
                          className="p-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-violet-500 w-full"
                        />
                        <input
                          type="time"
                          value={newTimeInput}
                          onChange={(e) => setNewTimeInput(e.target.value)}
                          className="p-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-violet-500 w-32"
                        />
                        <button
                          onClick={handleReprogram}
                          className="bg-emerald-500 text-white p-2 rounded-lg hover:bg-emerald-600 transition flex items-center justify-center w-12"
                        >
                          <FiCheck />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* 👀 RENDER DE MÚLTIPLES TARJETAS DE CLASE (ITERATIVO CON .MAP) */
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Clases para el {format(selectedDate, "EEEE d, MMMM", { locale: es })}:
                      </h4>
                      
                      {dayClasses.map((clase, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-3 rounded-xl border animate-fade-in 
                            ${clase.status === "cancelled" ? "bg-rose-50 border-rose-100" : ""}
                            ${clase.status === "rescheduled" ? "bg-amber-50 border-amber-100" : ""}
                            ${clase.status === "normal" ? "bg-violet-50 border-violet-100" : ""}
                          `}
                        >
                          <div>
                            <span
                              className={`text-sm font-bold capitalize 
                                ${clase.status === "cancelled" ? "text-rose-900 line-through opacity-70" : "text-slate-800"}
                              `}
                            >
                              Horario bloque {idx + 1}
                            </span>
                            {clase.status === "cancelled" && (
                              <span className="block text-xs font-bold text-rose-600 uppercase mt-0.5">
                                ❌ Clase Cancelada (Imprevisto)
                              </span>
                            )}
                            {clase.status === "rescheduled" && (
                              <span className="block text-xs font-bold text-amber-600 uppercase mt-0.5">
                                Clase Reprogramada
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            {clase.status !== "cancelled" && (
                              <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg shadow-sm border border-slate-100 text-slate-700 font-bold text-sm">
                                <FiClock className={clase.status === "rescheduled" ? "text-amber-500" : "text-violet-500"} />
                                {clase.time} hs
                              </div>
                            )}

                            {studentId && (
                              <div className="flex gap-1">
                                {clase.status !== "cancelled" && (
                                  <button
                                    onClick={() => {
                                      setEditingClass({ baseScheduleId: clase.baseScheduleId, time: clase.time });
                                      setNewDateInput(format(selectedDate, "yyyy-MM-dd"));
                                      setNewTimeInput(clase.time);
                                      setIsReprogramming(true);
                                    }}
                                    className="p-2 text-slate-400 hover:text-violet-600 hover:bg-white rounded-lg transition"
                                    title="Reprogramar este bloque"
                                  >
                                    <FiEdit2 />
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => handleCancelDay(clase.baseScheduleId)}
                                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition"
                                  title="Cancelar este bloque"
                                >
                                  <FiTrash2 />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <p className="text-sm text-slate-400 font-medium text-center italic mt-3">
                    Selecciona un día para ver detalles
                  </p>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};