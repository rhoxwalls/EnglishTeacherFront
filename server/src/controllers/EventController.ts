import type {Response} from "express";
import mongoose from "mongoose";
import {type AuthRequest} from "../middleware/authMiddleware.js";
import Event from "../models/Event.js";

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "No autorizado" }); return;
    }

    const { title, description, location, studentId, startDate, schedules, attendees } = req.body;
    
    // Si NO es recurrente (schedules está vacío o no existe)
    if (!schedules || schedules.length === 0) {
      const newEvent = await Event.create({
        title, description, date: startDate, location, teacherId: req.user._id, studentId
      });
      res.status(201).json(newEvent);
      return;
    }

    // SI ES RECURRENTE: Generamos clases combinando la fecha base con las horas específicas
    const groupId = new mongoose.Types.ObjectId().toString(); 
    const eventsToCreate = [];
    
    let currentDate = new Date(startDate);
    const endDateLimit = new Date(currentDate);
    endDateLimit.setDate(endDateLimit.getDate() + 28); // Generamos 4 semanas hacia adelante

    while (currentDate <= endDateLimit) {
      const currentDay = currentDate.getDay(); // 0=Dom, 1=Lun, 2=Mar...
      
      // Buscamos si el día actual está en el horario que armó la profesora
      const daySchedule = schedules.find((s: any) => s.day === currentDay);

      if (daySchedule) {
        // Extraemos las horas y minutos (Ej: "14:00" -> 14 y 00)
        const [startHour, startMin] = daySchedule.start.split(':');
        const [endHour, endMin] = daySchedule.end.split(':');

        // Construimos la fecha exacta de inicio
        const eventStart = new Date(currentDate);
        eventStart.setHours(parseInt(startHour), parseInt(startMin), 0, 0);

        // Construimos la fecha exacta de fin
        const eventEnd = new Date(currentDate);
        eventEnd.setHours(parseInt(endHour), parseInt(endMin), 0, 0);

        eventsToCreate.push({
          title, 
          description, 
          location,
          date: eventStart,
          endDate: eventEnd,
          teacherId: req.user._id,
          studentId,
          groupId,
          attendees,
        });
      }
      currentDate.setDate(currentDate.getDate() + 1); // Avanzamos al siguiente día
    }

    await Event.insertMany(eventsToCreate);
    res.status(201).json({ message: "Cronograma avanzado creado con éxito" });

  } catch (error) {
    console.error("Error al crear eventos:", error);
    res.status(500).json({ message: "Error interno al crear cronograma" });
  }
};

// --- OBTENER TODOS LOS EVENTOS DE LA PROFESORA ---
export const getMyEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // 1. 🛡️ ESCUDO ANTI-UNDEFINED: Garantizamos que hay usuario
    if (!req.user) {
      res.status(401).json({ message: "Usuario no autenticado" });
      return;
    }

    // 2. Buscamos todos los eventos que le pertenezcan a esta profesora
    // Usamos .sort({ date: 1 }) para que se ordenen cronológicamente (los más próximos primero)
    const events = await Event.find({ teacherId: req.user._id })
      .sort({ date: 1 });

    // 3. Devolvemos la lista al Frontend
    res.json(events);
    
  } catch (error) {
    console.error("Error al obtener la agenda:", error);
    res.status(500).json({ message: "Error interno al obtener los eventos" });
  }
};

    // --- ACTUALIZAR / REPROGRAMAR CLASE ---
export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) return;
    const { eventId } = req.params;
    const { date, updateGroup } = req.body; // updateGroup decide si es solo esta o todas


    if(!eventId || !date ) return;

    const event = await Event.findOne({ _id: eventId, teacherId: req.user._id });

    if (!event) { res.status(404).json({ message: "No encontrado" }); return; }

    if (updateGroup && event.groupId) {
      // Reprogramar en masa (Ej: Mover todas 1 hora adelante) no lo haremos automático aquí para no complicarlo,
      // pero aquí borrarías el grupo y pedirías crearlo de nuevo.
    } else {
      // Reprogramar solo esta clase (Autonomía)
      event.date = date;
      await event.save();
    }
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Error al reprogramar" });
  }
};

// --- ELIMINAR EVENTO (Opción Individual o Grupo Completo) ---
export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) return;
    const { eventId } = req.params;
    const { deleteGroup } = req.query; // Si manda ?deleteGroup=true en la URL

    if(!eventId) return;

    const event = await Event.findOne({ _id: eventId, teacherId: req.user._id });
    if (!event) return;

    if (deleteGroup === 'true' && event.groupId) {
      await Event.deleteMany({ groupId: event.groupId, teacherId: req.user._id });
    } else {
      await Event.findByIdAndDelete(eventId);
    }
    res.json({ message: "Eliminado" });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
};