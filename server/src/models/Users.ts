import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  role: "teacher" | "student";
  passwordHash: string;
  createdAt: Date;
  status?: string;
  baseSchedule?: ScheduleEntry[];
  scheduleExceptions?: ScheduleException[];
}

// 1. Interfaz para el Horario Fijo
export interface ScheduleEntry {
  dayOfWeek: string; // Ej: 'Lunes'
  time: string;      // Ej: '16:00'
}

// 2. Interfaz para los Imprevistos / Excepciones
export interface ScheduleException {
  _id?: string;
  baseScheduleId: { type: Schema.Types.ObjectId, required: true },
  originalDate: string; // La fecha que se iba a dar la clase
  status: 'cancelled' | 'rescheduled';
  newDate?: string;     // 💡 Es opcional (?) porque si el status es 'cancelled', no hay nueva fecha
}


const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: {
    type: String,
    enum: ["teacher", "student"],
    default: "student",
  },
  passwordHash: { type: String, required: true },
  
// 1. EL HORARIO BASE (Lo que enviamos desde el Register)
  baseSchedule: [{
    dayOfWeek: { type: String }, // 'Lunes', 'Martes', etc.
    time: { type: String }       // '16:00'
  }],

  // 2. LAS EXCEPCIONES (Para imprevistos futuros)
  scheduleExceptions: [{
    baseScheduleId: { type: Schema.Types.ObjectId, required: true },
    originalDate: { type: Date },       // Ej: 14 de Agosto 2026
    status: { type: String, enum: ['cancelled', 'rescheduled'] },
    newDate: { type: Date }             // Si se reprograma para el 15 de Agosto
  }]
  
},
{
    timestamps: true,
});

export default mongoose.model<IUser>("User", UserSchema);
