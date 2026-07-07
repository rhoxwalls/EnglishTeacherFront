import mongoose, {Schema, Document, Types} from "mongoose";

export interface IEvent extends Document {
    title: string;
    description: string;
    date: Date;
    location: string;
    attendees: Types.ObjectId[]; // Referencias a usuarios
    teacherId: Types.ObjectId; // Referencia al profesor organizador
    studentId: Types.ObjectId; // Referencia al alumno invitado
    groupId?: string; // Para editar/borrar en masa
    endDate?: Date; // NUEVO: Fecha y Hora de FIN
};

const EventSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: false, default:"" },
    date: { type: Date, required: true },
    location: { type: String, required: false, default:"Online" },
    attendees: [{ type: Types.ObjectId, ref: 'User' }],
    teacherId: { type: Types.ObjectId, ref: 'User', required: true },
    studentId: { type: Types.ObjectId, ref: 'User', required: true }, // NUEVO: Vinculado al alumno
    groupId: { type: String, required: false }, // NUEVO: Para editar/borrar en masa
    endDate: { type: Date },
});

export default mongoose.model<IEvent>('Event', EventSchema);