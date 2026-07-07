import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITasks {
  _id?: Types.ObjectId | string;
  title: string;
  topic: string; // <-- NUEVO: Para agrupar por tema
  subTopic?: string; // <-- NUEVO: Para el título específico (Ej: "Voy a la escuela")
  type: "quiz" | "multiple_choice" | "audio" | "text" | "fill_blanks";
  content: string;
  options?: string[];
  correctAnswers?: string[]; // <-- CAMBIADO: Arreglo para soportar múltiples respuestas
  completed: boolean;
  studentAnswers?: string[]; // <-- Donde guardamos lo del alumno
  teacherFeedback?: string; // <-- Donde guardamos lo de la profe
}

const TaskSchema: Schema = new Schema(
  {
    topic: { type: String, default: "General" }, // <-- NUEVO
    subTopic: { type: String, default: "" }, // <-- NUEVO
    title: { type: String, required: true },
    type: {
      type: String,
      enum: ["quiz", "multiple_choice", "audio", "text", "fill_blanks"],
      required: true,
    },
    content: { type: String, required: true },
    options: [String],
    correctAnswers: [String], // <-- CAMBIADO
    completed: { type: Boolean, default: false },
    studentAnswers: [String], // <-- NUEVO
    teacherFeedback: { type: String, default: "" }, // <-- NUEVO
    startDate: { type: String, default: "" },
  },
  { timestamps: true },
);

export interface ClassNote {
  _id?: string;
  topic: string;
  text: string;
  vocab: string[];
  date: string;
}

export interface IClassroom extends Document {
  name: String;
  TeacherId: Types.ObjectId;
  StudentId: Types.ObjectId;
  tasks: ITasks[];
  notes?: ClassNote[];
  active: Boolean;
  isLive: boolean; // <-- NUEVO
}

const ClassroomSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    TeacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    StudentId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    tasks: [TaskSchema],
    notes: [
      {
        topic: String,
        text: String,
        vocab: [String],
        date: { type: Date, default: Date.now },
      },
    ],

    active: { type: Boolean, default: true },
    isLive: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model<IClassroom>("classroom", ClassroomSchema);
