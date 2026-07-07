// src/types.ts
export type TaskType =
  | "quiz"
  | "multiple_choice"
  | "audio"
  | "text"
  | "fill_blanks";

// --- Modelos de Base de Datos ---
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "teacher" | "student";
  baseSchedule?: ScheduleEntry[];
  scheduleExceptions?: ScheduleException[];
}

export interface Task {
  _id: string;
  topic: string; // <-- NUEVO
  subTopic?: string; // <-- NUEVO
  title: string;
  type: TaskType;
  content: string;
  options?: string[]; // El '?' significa que es opcional
  correctAnswers?: string[]; // El '?' significa que es opcional
  correction?: string;
  completed: boolean;
  studentAnswers?: string[]; // <-- NUEVO
  teacherFeedback?: string; // <-- NUEVO
  startDate?: string; // <-- NUEVO
}


export interface ClassNote {
  _id?: string;
  topic: string;
  text: string;
  vocab: string[];
  date: string;
}

export interface classRoom {
  _id: string;
  name: string;
  TeacherId: User; // Backend popula esto
  StudentId: User; // Backend popula esto
  notes: ClassNote[];
  tasks: Task[];
  createdAt: string;
  isLive: boolean;
}

// --- Respuestas de API ---
export interface AuthResponse {
  token: string;
  _id: string;
  name: string;
  email: string;
  role: "teacher" | "student";
}

// --- Payloads (Datos que enviamos en formularios) ---
export interface LoginCredentials {
  email: string;
  password?: string; // Opcional porque al escribir en el input puede estar vacio
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password?: string;
  role: "teacher" | "student";
}

export interface NewClassRoomPayload {
  name: string;
  studentEmail: string;
}

export interface NewTaskPayload {
  type: string;
  content: string;
  correction: string;
}

export interface CalendarEvent {
  _id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  teacherId: string;
  studentId: string;
  groupId: string;
  endDate?: string; // 👈 NUEVO: Le avisamos a TypeScript que esto ahora existe
  attendees?: string[];
}

// 1. Interfaz para el Horario Fijo
export interface ScheduleEntry {
  dayOfWeek: string; // Ej: 'Lunes'
  time: string;      // Ej: '16:00'
}

// 2. Interfaz para los Imprevistos / Excepciones
export interface ScheduleException {
  _id?: string;
  originalDate: string; // La fecha que se iba a dar la clase
  status: 'cancelled' | 'rescheduled';
  newDate?: string;     // 💡 Es opcional (?) porque si el status es 'cancelled', no hay nueva fecha
}