import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import api from "../Api/Axios";
import { useAuth } from "../hooks/useAuth";
import type { classRoom, TaskType, Task, ClassNote } from "../Types";
import {
  FiPlus,
  FiArrowLeft,
  FiFolder,
  FiCheckCircle,
  FiX,
  FiCalendar,
  FiList,
  FiEdit3,
  FiFileText,
  FiPlayCircle,
  FiTrash2,
  FiLayers,
} from "react-icons/fi";

export const ClassRoomDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [room, setRoom] = useState<classRoom | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Navegación
  const [activeTopic, setActiveTopic] = useState<string | null>(null);

  // Estados para crear Módulo
  const [isCreatingModule, setIsCreatingModule] = useState(false);
  const [newModuleName, setNewModuleName] = useState("");

  // Estados para crear Tarea (dentro del Módulo)
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskSubTopic, setTaskSubTopic] = useState(""); // El "Sub-módulo" o lección
  const [taskTitle, setTaskTitle] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("text");
  const [taskContent, setTaskContent] = useState("");
  const [taskOptions, setTaskOptions] = useState<string[]>(["", ""]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState<number>(0);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);

  const fetchRoom = async () => {
    try {
      const { data } = await api.get("/classrooms");
      const currentRoom = data.find((r: classRoom) => r._id === id);

      console.log("📡 Estado actual de la sala recibida:", currentRoom?.isLive);
      
      if (currentRoom) setRoom(currentRoom);
      else setError("No se encontró la sala.");
    } catch (error) {
      setError("Error al cargar la sala." + error);
    }
  };
  useEffect(() => {
    fetchRoom();

    // 💡 AUTOMATIZACIÓN: Si es alumno, revisamos el backend cada 5 segundos
    let interval: NodeJS.Timeout;

    if (user?.role === "student") {
      interval = setInterval(() => {
        // Esta función vuelve a hacer el api.get y actualiza el estado 'room'
        fetchRoom();
      }, 15000);
    }

    // Limpieza vital de React: cuando el alumno sale de la pantalla, apagamos el temporizador
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id, user?.role]);
  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleName.trim()) return;
    setActiveTopic(newModuleName);
    setNewModuleName("");
    setIsCreatingModule(false);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalCorrectAnswers: string[] = [];
    let finalOptions: string[] = [];

    if (taskType === "multiple_choice") {
      finalOptions = taskOptions.filter((opt) => opt.trim() !== "");
      if (finalOptions.length < 2) return alert("Añade al menos 2 opciones.");
      finalCorrectAnswers = [taskOptions[correctOptionIndex]];
    } else if (taskType === "fill_blanks") {
      const matches = taskContent.match(/\[(.*?)\]/g);
      if (matches)
        finalCorrectAnswers = matches.map((match) =>
          match.replace(/\[|\]/g, ""),
        );
      else
        return alert("Debes incluir al menos una palabra entre corchetes [ ].");
    }

    try {
      await api.post(`/classrooms/${id}/tasks`, {
        topic: activeTopic,
        subTopic: taskSubTopic || "Lección General", // Si lo deja vacío
        title: taskTitle,
        type: taskType,
        content: taskContent,
        options: finalOptions,
        correctAnswers: finalCorrectAnswers,
      });

      // NO limpiamos el taskSubTopic para que pueda seguir creando ejercicios en la misma lección rápidamente
      setTaskTitle("");
      setTaskContent("");
      setTaskOptions(["", ""]);
      setCorrectOptionIndex(0);
      setIsCreatingTask(false);
      fetchRoom();
    } catch (error) {
      alert("Error al guardar la tarea." + error);
    }
  };

  if (error)
    return (
      <div className="p-20 text-center text-red-500 font-bold">{error}</div>
    );
  if (!room)
    return (
      <div className="p-20 text-center text-slate-500 font-bold animate-pulse">
        Cargando aula...
      </div>
    );

  // AGRUPACIÓN 1: Por Módulo Principal
  const groupedTasks =
    room.tasks?.reduce(
      (acc, task) => {
        const t = task.topic || "General";
        if (!acc[t]) acc[t] = [];
        acc[t].push(task);
        return acc;
      },
      {} as Record<string, Task[]>,
    ) || {};

  // AGRUPACIÓN 2: Por Sub-módulo (dentro del Módulo activo)
  const tasksInActiveModule = activeTopic
    ? groupedTasks[activeTopic] || []
    : [];
  const groupedBySubTopic = tasksInActiveModule.reduce(
    (acc, task) => {
      const st = task.subTopic || "Lección General";
      if (!acc[st]) acc[st] = [];
      acc[st].push(task);
      return acc;
    },
    {} as Record<string, Task[]>,
  );

  const handleStartCall = async () => {
    try {
      // Encendemos la sala en la base de datos
      await api.patch(`/classrooms/${id}/live`, { isLive: true });
      // Navegamos a la sala de video
      navigate(`/live/${id}`);
    } catch (error) {
      alert("Error al iniciar la sala de video.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              to={user?.role === "teacher" ? "/dashboard" : "/mis-clases"}
              className="text-slate-400 hover:text-violet-600 transition-colors p-2 bg-slate-100 rounded-full"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                Espacio de {room.StudentId.name}
              </h1>
              <p className="text-slate-500 text-sm font-medium">
                Programa de Estudio
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-8">
        {/* --- VISTA 1: GRID DE MÓDULOS --- */}
        {!activeTopic ? (
          <div className="animate-fade-in">
            {user?.role === "teacher" && (
              <div className="mb-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    Módulos de Aprendizaje
                  </h3>
                  <p className="text-sm text-slate-500">
                    Organiza el contenido por temas principales.
                  </p>
                </div>

                {!isCreatingModule ? (
                  <button
                    onClick={() => setIsCreatingModule(true)}
                    className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-violet-700 transition"
                  >
                    <FiPlus /> Crear Nuevo Módulo
                  </button>
                ) : (
                  <form
                    onSubmit={handleCreateModule}
                    className="flex gap-2 w-full sm:w-auto"
                  >
                    <input
                      autoFocus
                      type="text"
                      value={newModuleName}
                      onChange={(e) => setNewModuleName(e.target.value)}
                      placeholder="Ej: Simple Present"
                      className="border border-slate-300 p-2 rounded-lg outline-none focus:ring-2 focus:ring-violet-500 flex-1"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700"
                    >
                      Crear
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreatingModule(false)}
                      className="bg-slate-200 text-slate-600 px-4 py-2 rounded-lg font-bold hover:bg-slate-300"
                    >
                      <FiX />
                    </button>
                  </form>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {Object.entries(groupedTasks).map(([topicName, tasksInTopic]) => {
                const progress =
                  Math.round(
                    (tasksInTopic.filter((t) => t.completed).length /
                      tasksInTopic.length) *
                      100,
                  ) || 0;
                return (
                  <div
                    key={topicName}
                    onClick={() => setActiveTopic(topicName)}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-violet-300 transition-all cursor-pointer group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-violet-50 text-violet-600 rounded-xl group-hover:bg-violet-600 group-hover:text-white transition-colors">
                        <FiFolder className="w-6 h-6" />
                      </div>
                      {progress === 100 && (
                        <span className="bg-emerald-100 text-emerald-700 p-1.5 rounded-full">
                          <FiCheckCircle />
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-violet-700">
                      {topicName}
                    </h3>
                    <p className="text-sm text-slate-500 font-medium mb-4">
                      {tasksInTopic.length} Ejercicios
                    </p>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${progress === 100 ? "bg-emerald-500" : "bg-violet-500"}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* --- VISTA 2: DENTRO DEL MÓDULO (AGRUPADO POR SUB-TEMA) --- */
          <div className="animate-fade-in">
            <button
              onClick={() => {
                setActiveTopic(null);
                setIsCreatingTask(false);
              }}
              className="flex items-center gap-2 text-violet-600 font-bold hover:text-violet-800 transition mb-6"
            >
              <FiArrowLeft /> Volver a Módulos
            </button>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-4 border-b border-slate-200 gap-4">
              <div>
                <span className="text-violet-600 font-bold text-sm tracking-widest uppercase mb-1 block">
                  Módulo Actual
                </span>
                <h2 className="text-3xl font-black text-slate-800">
                  {activeTopic}
                </h2>
              </div>

              {/* GRUPO DE BOTONES SUPERIORES */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Botón 1: Ver Apuntes Anteriores */}
                <button
                  onClick={() => setIsNotesModalOpen(true)}
                  className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-200 transition"
                >
                  <FiFileText /> Apuntes de Clase
                </button>

                {/* Botón 2: Videollamada Inteligente con Estado Real-Time */}
                {user?.role === "teacher" ? (
                  <button
                    onClick={handleStartCall}
                    className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-violet-700 transition shadow-md"
                  >
                    <FiPlayCircle className="w-5 h-5" /> Iniciar Videollamada
                  </button>
                ) : // LÓGICA REDISEÑADA PARA EL ALUMNO
                room.isLive ? (
                  // 🟢 ESTADO ONLINE: Botón verde brillante con animación de pulso
                  <Link
                    to={`/live/${id}`}
                    className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-xl font-black hover:bg-emerald-600 transition shadow-lg shadow-emerald-200 animate-pulse w-full md:w-auto justify-center text-center text-sm tracking-wide"
                  >
                    <FiPlayCircle className="w-5 h-5 text-white animate-bounce" />
                    ¡CLASE EN VIVO! ENTRAR A TU CLASE
                  </Link>
                ) : (
                  // 🔴 ESTADO OFFLINE: Indicador sutil con punto rojo titilando
                  <div className="flex items-center gap-3 bg-rose-50/50 border border-rose-100 px-5 py-2.5 rounded-xl w-full md:w-auto justify-center select-none">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                    </span>
                    <span className="font-bold text-rose-700 text-xs uppercase tracking-wider">
                      Clase Offline (Esperando Profe)
                    </span>
                  </div>
                )}

                {/* Botón 3: Añadir Actividad (Solo Profesor) */}
                {user?.role === "teacher" && (
                  <button
                    onClick={() => setIsCreatingTask(!isCreatingTask)}
                    className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-violet-700 transition"
                  >
                    {isCreatingTask ? (
                      <>
                        <FiX /> Cancelar
                      </>
                    ) : (
                      <>
                        <FiPlus /> Añadir Ejercicio
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {isCreatingTask && (
              <form
                onSubmit={handleCreateTask}
                className="mb-10 bg-white p-6 rounded-2xl shadow-lg border border-slate-200"
              >
                <h3 className="text-lg font-bold mb-6 text-slate-800 border-b pb-4">
                  Añadir Actividad
                </h3>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Sub-tema / Lección (Ej: Voy a la escuela)
                    </label>
                    {/* Al escribir un sub-tema, todas las tareas con este sub-tema se agruparán bajo él */}
                    <input
                      type="text"
                      value={taskSubTopic}
                      onChange={(e) => setTaskSubTopic(e.target.value)}
                      placeholder="¿A qué lección pertenece?"
                      className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Título de la Actividad
                    </label>
                    <input
                      type="text"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Formato
                    </label>
                    <select
                      value={taskType}
                      onChange={(e) => setTaskType(e.target.value as TaskType)}
                      className="w-full p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-violet-500 outline-none bg-white"
                    >
                      <option value="text">📖 Lectura / Teoría</option>
                      <option value="audio">🎧 Audio</option>
                      <option value="multiple_choice">
                        ✅ Multiple Choice
                      </option>
                      <option value="fill_blanks">📝 Completar</option>
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-6">
                  {taskType === "text" && (
                    <textarea
                      value={taskContent}
                      onChange={(e) => setTaskContent(e.target.value)}
                      rows={4}
                      placeholder="Escribe el texto..."
                      className="w-full p-3 rounded-xl border border-slate-300 outline-none resize-none"
                      required
                    />
                  )}
                  {taskType === "audio" && (
                    <input
                      type="url"
                      value={taskContent}
                      onChange={(e) => setTaskContent(e.target.value)}
                      placeholder="URL del audio..."
                      className="w-full p-3 rounded-xl border border-slate-300 outline-none"
                      required
                    />
                  )}
                  {taskType === "fill_blanks" && (
                    <textarea
                      value={taskContent}
                      onChange={(e) => setTaskContent(e.target.value)}
                      rows={3}
                      placeholder="Ej: She [has lived] in London."
                      className="w-full p-3 rounded-xl border border-slate-300 outline-none resize-none"
                      required
                    />
                  )}
                  {taskType === "multiple_choice" && (
                    <div>
                      <input
                        type="text"
                        value={taskContent}
                        onChange={(e) => setTaskContent(e.target.value)}
                        placeholder="Pregunta..."
                        className="w-full p-3 rounded-xl border border-slate-300 mb-4 outline-none"
                        required
                      />
                      <div className="space-y-3">
                        {taskOptions.map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <input
                              type="radio"
                              checked={correctOptionIndex === idx}
                              onChange={() => setCorrectOptionIndex(idx)}
                              className="w-5 h-5 text-violet-600"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...taskOptions];
                                newOpts[idx] = e.target.value;
                                setTaskOptions(newOpts);
                              }}
                              placeholder={`Opción ${idx + 1}`}
                              className="flex-1 p-3 rounded-xl border border-slate-300 outline-none"
                              required
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setTaskOptions([...taskOptions, ""])}
                        className="mt-4 text-sm font-bold text-violet-600"
                      >
                        + Otra opción
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg"
                  >
                    Guardar Actividad
                  </button>
                </div>
              </form>
            )}

            {/* AQUÍ ESTÁ LA MAGIA: Renderizamos separando por Sub-Módulos (Lecciones) */}
            {tasksInActiveModule.length === 0 ? (
              <p className="text-slate-500 text-center py-10 bg-white rounded-2xl border border-slate-200">
                El profesor aún no ha añadido material a este módulo.
              </p>
            ) : (
              <div className="space-y-12">
                {Object.entries(groupedBySubTopic).map(
                  ([subTopicName, tasks]) => (
                    <div key={subTopicName} className="relative">
                      {/* Encabezado del Sub-Módulo / Lección */}
                      <div className="flex items-center gap-3 mb-6 pl-2">
                        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg shadow-sm">
                          <FiLayers className="w-5 h-5" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">
                          {subTopicName}
                        </h3>
                      </div>

                      {/* Línea conectora visual a la izquierda (Opcional, queda muy profesional) */}
                      <div className="pl-6 border-l-2 border-indigo-100 space-y-6">
                        {tasks.map((task) => (
                          <TaskCard
                            key={task._id}
                            task={task}
                            isTeacher={user?.role === "teacher"}
                            roomId={room._id}
                            onTaskUpdate={fetchRoom}
                          />
                        ))}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        )}

        {/* Renderizamos el Modal al final */}
        <ClassNotesModal
          isOpen={isNotesModalOpen}
          onClose={() => setIsNotesModalOpen(false)}
          topicName={activeTopic || ""}
          roomNotes={room?.notes}
        />
      </main>
    </div>
  );
};

// ==========================================
// TARJETA DE TAREA (Ahora muestra Sub-tema y Fecha)
// ==========================================
const TaskCard = ({
  task,
  isTeacher,
  roomId,
  onTaskUpdate,
}: {
  task: Task;
  isTeacher: boolean;
  roomId: string;
  onTaskUpdate: () => void;
}) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [blankAnswers, setBlankAnswers] = useState<string[]>([]);
  const [feedbackInput, setFeedbackInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task.completed || task.studentAnswers?.length) {
      const idx = task.options
        ? task.options.indexOf(task.studentAnswers?.[0] || "")
        : -1;
      setSelectedIdx(idx !== -1 ? idx : null);
      setBlankAnswers(task.studentAnswers || []);
    }
    setFeedbackInput(task.teacherFeedback || "");
  }, [task.completed, task.studentAnswers, task.teacherFeedback, task.options]);

  useEffect(() => {
    if (
      !task.completed &&
      blankAnswers.length === 0 &&
      task.correctAnswers?.length
    ) {
      setBlankAnswers(Array(task.correctAnswers.length).fill(""));
    }
  }, [task.correctAnswers, task.completed, blankAnswers.length]);

  const getIcon = () => {
    switch (task.type) {
      case "text":
        return <FiFileText className="text-blue-500 w-5 h-5" />;
      case "audio":
        return <FiPlayCircle className="text-fuchsia-500 w-5 h-5" />;
      case "multiple_choice":
        return <FiList className="text-orange-500 w-5 h-5" />;
      case "fill_blanks":
        return <FiEdit3 className="text-emerald-500 w-5 h-5" />;
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let answersToSave: string[] = [];
    if (task.type === "multiple_choice") {
      if (selectedIdx === null || !task.options)
        return alert("Selecciona una opción.");
      answersToSave = [task.options[selectedIdx]];
    }
    if (task.type === "fill_blanks") {
      if (blankAnswers.some((ans) => ans.trim() === ""))
        return alert("Completa todos los espacios.");
      answersToSave = blankAnswers;
    }
    if (task.type === "text") answersToSave = ["Leído"];
    if (task.type === "audio") answersToSave = ["Escuchado"];

    setIsSubmitting(true);
    try {
      await api.patch(`/classrooms/${roomId}/tasks/${task._id}`, {
        completed: true,
        studentAnswers: answersToSave,
      });
      onTaskUpdate();
    } catch (error) {
      alert("Error al guardar." + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTeacherFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackInput.trim()) return alert("Escribe un comentario.");
    setIsSubmitting(true);
    try {
      await api.patch(`/classrooms/${roomId}/tasks/${task._id}`, {
        teacherFeedback: feedbackInput,
      });
      onTaskUpdate();
    } catch (error) {
      alert("Error al guardar el feedback." + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFillBlanksText = () => {
    const parts = task.content.split(/(\[.*?\])/);
    let inputIndex = 0;
    return parts.map((part, index) => {
      if (part.startsWith("[") && part.endsWith("]")) {
        const currentIndex = inputIndex++;
        let inputColorClass = "border-emerald-300 text-emerald-800";
        if (task.completed) {
          const isCorrect =
            task.correctAnswers?.[currentIndex]?.toLowerCase().trim() ===
            blankAnswers[currentIndex]?.toLowerCase().trim();
          inputColorClass = isCorrect
            ? "border-emerald-500 text-emerald-700 bg-emerald-50"
            : "border-red-500 text-red-700 bg-red-50 line-through";
        }
        return (
          <input
            key={index}
            type="text"
            disabled={task.completed || isTeacher}
            value={blankAnswers[currentIndex] || ""}
            onChange={(e) => {
              const newAnswers = [...blankAnswers];
              newAnswers[currentIndex] = e.target.value;
              setBlankAnswers(newAnswers);
            }}
            className={`w-32 border-b-2 bg-transparent text-center focus:outline-none font-bold transition-colors ${inputColorClass}`}
            placeholder={task.completed ? "" : "_____"}
          />
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Formatear la fecha para que se vea legible (Ej: "14 de Junio, 2026")
  const formattedDate = task.startDate
    ? new Date(task.startDate).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Fecha no registrada";

  return (
    <div
      className={`relative bg-white rounded-2xl shadow-sm border ${task.completed ? "border-emerald-200 bg-emerald-50/10" : "border-slate-200"} p-6 transition-all duration-300 hover:shadow-md`}
    >
      {isTeacher && (
        <button
          type="button"
          onClick={() => {
            if (window.confirm("¿Borrar?")) {
              setIsDeleting(true);
              api
                .delete(`/classrooms/${roomId}/tasks/${task._id}`)
                .then(() => onTaskUpdate())
                .catch(() => setIsDeleting(false));
            }
          }}
          disabled={isDeleting}
          className="absolute top-6 right-6 text-slate-300 hover:text-red-500 p-2 bg-slate-50 rounded-lg transition-colors"
        >
          <FiTrash2 className="w-5 h-5" />
        </button>
      )}

      {/* CABECERA CON SUB-TEMA Y FECHA */}
      <div className="flex items-start gap-4 mb-6 pr-12 border-b border-slate-100 pb-4">
        <div
          className={`p-3 rounded-xl border ${task.completed ? "bg-emerald-100 border-emerald-200" : "bg-indigo-50 border-indigo-100"}`}
        >
          {task.completed ? (
            <FiCheckCircle className="text-emerald-600 w-6 h-6" />
          ) : (
            getIcon()
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider">
              {task.subTopic || "Actividad General"}
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
              <FiCalendar /> {formattedDate}
            </span>
          </div>
          <h3
            className={`text-xl font-bold mt-1 ${task.completed ? "text-emerald-800" : "text-slate-800"}`}
          >
            {task.title}
          </h3>
        </div>
      </div>

      {/* CONTENIDO (El mismo renderizado que ya teníamos) */}
      <div className="mb-6">
        {task.type === "text" && (
          <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-wrap">
            {task.content}
          </div>
        )}
        {task.type === "audio" && (
          <audio controls className="w-full">
            <source src={task.content} type="audio/mpeg" />
          </audio>
        )}
        {task.type === "multiple_choice" && (
          <div>
            <p className="text-lg text-slate-700 font-medium mb-4">
              {task.content}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {task.options?.map((opt, idx) => {
                let buttonStyle =
                  "border-slate-200 text-slate-600 hover:border-emerald-300";
                if (task.completed) {
                  const isCorrect = task.correctAnswers?.[0] === opt;
                  if (selectedIdx === idx && isCorrect)
                    buttonStyle =
                      "border-emerald-500 bg-emerald-50 text-emerald-700 font-bold";
                  else if (selectedIdx === idx && !isCorrect)
                    buttonStyle =
                      "border-red-500 bg-red-50 text-red-700 font-bold";
                  else if (selectedIdx !== idx && isCorrect)
                    buttonStyle =
                      "border-emerald-300 bg-emerald-50/50 text-emerald-600 border-dashed";
                  else
                    buttonStyle =
                      "border-slate-100 text-slate-300 bg-slate-50 opacity-50";
                } else if (selectedIdx === idx) {
                  buttonStyle =
                    "border-indigo-400 bg-indigo-50 text-indigo-700 font-bold";
                }
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={task.completed || isTeacher}
                    onClick={() => setSelectedIdx(idx)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${buttonStyle}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {task.type === "fill_blanks" && (
          <div className="bg-emerald-50/40 p-6 rounded-xl border border-emerald-100">
            <p className="text-lg text-slate-700 leading-loose">
              {renderFillBlanksText()}
            </p>
            {isTeacher && task.completed && task.studentAnswers && (
              <div className="mt-5 p-4 bg-white rounded-lg border border-slate-200 shadow-sm text-sm">
                <p className="font-bold text-slate-700 mb-3 border-b pb-2">
                  Desglose de Respuestas:
                </p>
                {task.correctAnswers?.map((correct, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mb-2"
                  >
                    <span className="text-emerald-600 font-bold w-auto sm:w-32">
                      ✔ {correct}
                    </span>
                    <span
                      className={`font-medium ${task.studentAnswers?.[i]?.toLowerCase().trim() === correct.toLowerCase().trim() ? "text-emerald-600" : "text-red-500"}`}
                    >
                      ✎ Alumno: {task.studentAnswers?.[i] || "(vacío)"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {!isTeacher && !task.completed && (
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleStudentSubmit}
            disabled={isSubmitting}
            className="bg-slate-800 text-white px-8 py-3 rounded-full font-bold hover:bg-slate-700 transition-all shadow-md"
          >
            {isSubmitting ? "Enviando..." : "Completar Ejercicio"}
          </button>
        </div>
      )}

      {task.completed && (
        <div className="mt-6 bg-amber-50 rounded-xl p-5 border border-amber-200">
          <h4 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
            <FiEdit3 /> Comentarios del Profesor
          </h4>
          {isTeacher ? (
            <div className="flex flex-col gap-3">
              <textarea
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                className="w-full p-3 rounded-lg border border-amber-300 bg-white"
                rows={2}
              />
              <button
                type="button"
                onClick={handleTeacherFeedback}
                className="self-end bg-amber-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-amber-700 shadow-sm"
              >
                Guardar Feedback
              </button>
            </div>
          ) : (
            <p className="text-amber-900 font-medium bg-white p-4 rounded-lg border border-amber-100">
              {task.teacherFeedback || (
                <span className="text-amber-700/60 italic">
                  Aún no hay feedback.
                </span>
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ==========================================
// MODAL DE APUNTES DE VIDEOLLAMADA
// ==========================================
const ClassNotesModal = ({ isOpen, onClose, topicName, roomNotes }: { isOpen: boolean, onClose: () => void, topicName: string, roomNotes?: ClassNote[] }) => {
  if (!isOpen) return null;

  // Filtramos para mostrar solo los apuntes de este módulo específico
  const topicNotes = roomNotes?.filter(note => note.topic === topicName) || [];

  console.log("Apuntes filtrados para el módulo:",  topicName,  roomNotes, topicNotes);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        
        <div className="bg-violet-50 p-5 flex justify-between items-start border-b border-violet-100 shrink-0">
          <div>
            <h3 className="text-xl font-black text-violet-900 flex items-center gap-2">
              <FiFileText /> Apuntes de Clase en Vivo
            </h3>
            <p className="text-violet-600 text-sm mt-1 font-medium">Módulo: {topicName}</p>
          </div>
          <button onClick={onClose} className="p-2 text-violet-400 hover:text-violet-700 hover:bg-violet-100 rounded-xl transition">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          {topicNotes.length === 0 ? (
            <p className="text-slate-400 text-center italic py-10">Aún no hay apuntes de videollamadas para este módulo.</p>
          ) : (
            topicNotes.map((note, idx) => (
              <div key={idx} className="space-y-4 border-b border-slate-100 pb-6 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                  <FiCalendar /> {new Date(note.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>

                <div>
                  <p className="text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed text-sm">
                    {note.text || <span className="italic opacity-50">Sin notas adicionales.</span>}
                  </p>
                </div>

                {note.vocab && note.vocab.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Vocabulario Nuevo:</h4>
                    <div className="flex flex-wrap gap-2">
                      {note.vocab.map((word:string, wordIdx:number) => (
                        <span key={wordIdx} className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg text-sm font-bold border border-emerald-200">
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end shrink-0">
          <button onClick={onClose} className="px-6 py-2 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
