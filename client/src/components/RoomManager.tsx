import { useEffect, useState } from "react";
import api from "../api/axios";
import { type classRoom } from "../Types";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";
import {
  FiPlus,
  FiTrash2,
  FiUser,
  FiClock,
  FiBookOpen,
  FiArrowRight,
  FiInfo,
} from "react-icons/fi";

interface Student {
  _id: string;
  name: string;
  email: string;
}

// 💡 Interfaz para "enseñarle" a TypeScript cómo viene el alumno populado desde la BD
interface PopulatedStudent {
  _id: string;
  name: string;
  email: string;
}

export const RoomManager = () => {
  const { user } = useAuth();
  const [classRooms, setClassrooms] = useState<classRoom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [newClassRoomName, setNewClassRoomName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");

  const fetchData = async () => {
    try {
      const [roomsResponse, studentsResponse] = await Promise.all([
        api.get("/classrooms"),
        api.get("/auth/students"),
      ]);
      setClassrooms(roomsResponse.data);
      setStudents(studentsResponse.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSala = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/classrooms", { name: newClassRoomName, studentEmail });
      setNewClassRoomName("");
      setStudentEmail("");
      fetchData();
    } catch (error) {
      console.error("Error al crear sala", error);
      alert("Error creando sala. Verifica que el email sea correcto.");
    }
  };

  const handleDeleteSala = async (e: React.MouseEvent, roomId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      window.confirm(
        "¿Estás segura de que quieres eliminar el aula de este alumno? Se perderán todos sus temas y tareas.",
      )
    ) {
      try {
        await api.delete(`/classrooms/${roomId}`);
        fetchData();
      } catch (error) {
        console.error("Error al eliminar", error);
      }
    }
  };

  const handleSelectStudent = (email: string, name: string) => {
    setStudentEmail(email);
    setNewClassRoomName(`Clase de ${name}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteStudent = async (e: React.MouseEvent, studentId: string, studentName: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm(`¿PELIGRO: Estás segura de que quieres eliminar definitivamente a ${studentName}? Se borrará su cuenta y todo su progreso.`)) {
      try {
        await api.delete(`/auth/students/${studentId}`);
        fetchData();
      } catch (error) {
        console.error("Error al eliminar alumno", error);
        alert("Hubo un error al intentar eliminar al alumno.");
      }
    }
  };

  return (
    <div className="space-y-12">
      {/* 1. SECCIÓN: CREAR NUEVA AULA */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
          <div className="p-1.5 bg-violet-100 text-violet-600 rounded-lg">
            <FiPlus />
          </div>
          Asignar Nuevo Espacio de Estudio
        </h3>
        <form
          onSubmit={handleCreateSala}
          className="flex flex-col md:flex-row gap-4"
        >
          <input
            placeholder="Nombre del Espacio (Ej: Inglés Particular Juan)"
            value={newClassRoomName}
            onChange={(e) => setNewClassRoomName(e.target.value)}
            className="border border-slate-300 p-3 rounded-xl flex-1 focus:ring-2 focus:ring-violet-500 outline-none bg-slate-50/50"
            required
          />
          <input
            type="email"
            placeholder="Email registrado del alumno"
            value={studentEmail}
            onChange={(e) => setStudentEmail(e.target.value)}
            className="border border-slate-300 p-3 rounded-xl flex-1 focus:ring-2 focus:ring-violet-500 outline-none bg-slate-50/50"
            required
          />
          <button
            type="submit"
            className="bg-violet-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-violet-700 transition shadow-md shadow-violet-100"
          >
            Crear Espacio
          </button>
        </form>
      </section>

      {/* 2. SECCIÓN: DIRECTORIO DE ALUMNOS */}
      <section>
        <div className="mb-4">
          <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Directorio de Alumnos
          </h3>
          <p className="text-slate-500 text-sm mt-0.5">
            Haz clic en cualquier alumno para rellenar el formulario superior de
            forma automática.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {students.map(student => (
            <div 
              key={student._id} 
              onClick={() => handleSelectStudent(student.email, student.name)}
              className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm hover:border-violet-400 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
            >
              {user?.role === 'teacher' && (
                <button 
                  onClick={(e) => handleDeleteStudent(e, student._id, student.name)}
                  className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors z-10"
                  title="Eliminar Alumno Definitivamente"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              )}

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors">
                  <FiUser className="w-5 h-5" />
                </div>
                <div className="overflow-hidden pr-6">
                  <p className="font-bold text-slate-800 truncate group-hover:text-violet-600 transition-colors">{student.name}</p>
                  <p className="text-xs text-slate-400 truncate">{student.email}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SECCIÓN: TARJETAS DE AULAS ACTIVAS */}
      <section>
        <h3 className="text-xl font-extrabold text-slate-800 tracking-tight mb-6 border-b pb-2">
          Alumnos en Curso Activo
        </h3>

        {classRooms.length === 0 ? (
          <p className="text-slate-400 italic text-center py-8">
            No hay espacios de alumnos activos todavía.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 💡 AQUÍ ADENTRO DEL MAP ES DONDE EXISTE LA VARIABLE 'sala' */}
            {classRooms.map((sala) => {
              
              // 🛡️ SOLUCIÓN AL 'any': Transformamos el StudentId populado de forma segura
              const student = sala.StudentId as unknown as PopulatedStudent;

              return (
                <Link
                  to={`/sala/${sala._id}`}
                  key={sala._id}
                  className="relative block bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-violet-300 transition-all group"
                >
                  {user?.role === "teacher" && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSala(e, sala._id)}
                      className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors z-10"
                      title="Eliminar Espacio del Alumno"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  )}

                  <h4 className="text-xl font-black text-slate-800 group-hover:text-violet-600 transition-colors pr-8">
                    {/* Usamos nuestra variable tipada en lugar de 'any' */}
                    {student?.name || "Alumno no asignado"}
                  </h4>
                  <p className="text-slate-400 text-xs font-semibold mt-0.5 tracking-wide uppercase">
                    {sala.name}
                  </p>

                  <div className="mt-6 space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    
                    {/* Sección de Horarios */}
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FiClock className="text-slate-400 shrink-0" />
                      <span className="font-medium truncate">
                        {/* Como las clases viven en el Calendario y no en la Sala, dejamos un texto limpio */}
                        Gestionar horario en Calendario
                      </span>
                    </div>
                    
                    {/* Sección de Tareas / Temas */}
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FiBookOpen className="text-slate-400 shrink-0" />
                      <span className="font-medium">
                        {/* Esto lee las 'tasks' de tu modelo Classroom */}
                        {sala.tasks?.length || 0} Temas / Unidades asignadas
                      </span>
                    </div>

                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-violet-600 group-hover:text-violet-700">
                    <span className="flex items-center gap-1.5">
                      <FiInfo /> Ver programa completo
                    </span>
                    <FiArrowRight className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};