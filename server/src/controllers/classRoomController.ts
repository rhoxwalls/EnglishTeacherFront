import type { Response, Request } from "express";
import type { AuthRequest } from "../middleware/authMiddleware.js";
import ClassRoom from "../models/ClassRoom.js";
import Users from "../models/Users.js";

// CREATE A NEW CLASSROOM

export const createClassroom = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, studentEmail } = req.body;

    // 1. Verificar Rol: Solo los profesores pueden crear salas
    if (req.user?.role !== "teacher") {
      res
        .status(403)
        .json({ message: "Solo los profesores pueden crear salas" });
      return;
    }

    // 2. Buscar al alumno por su email
    const student = await Users.findOne({ email: studentEmail });

    if (!student) {
      res
        .status(404)
        .json({ message: "No se encontró un usuario con ese email" });
      return;
    }

    // 3. Crear la sala vinculando al Profe (req.user) y al Alumno encontrado
    const newClassRoom = await ClassRoom.create({
      name,
      TeacherId: req.user._id, // El ID viene del token del usuario logueado
      StudentId: student._id, // El ID lo sacamos de la búsqueda por email
      tasks: [], // Empieza vacía
    });

    res.status(201).json(newClassRoom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear la sala" });
  }
};

// --- OBTENER MIS SALAS ---
// Esta función sirve tanto para profesores como alumnos.
// Devuelve las salas donde tú eres participante.
export const obtainMyClassRooms = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ message: "Usuario no identificado" });
      return;
    }
    // Buscamos salas donde soy profesor O soy alumno ($or)
    const classRooms = await ClassRoom.find({
      $or: [{ TeacherId: userId }, { StudentId: userId }],
    })
      .populate("TeacherId", "name email") // .populate rellena los datos del usuario en vez de solo mostrar el ID
      .populate("StudentId", "name email");

    res.json(classRooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener las salas" });
  }
};

// ... (imports anteriores)
// Asegúrate de importar también Request de express y Types de mongoose si hace falta
import { Types } from "mongoose";
import mongoose from "mongoose";

// --- AGREGAR TAREA (Solo Profesor) ---
export const addTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { classRoomId } = req.params; // Viene de la URL /api/salas/:salaId/tareas

  if (typeof classRoomId !== 'string') {
        res.status(400).json({ message: "Los IDs de sala y tarea son obligatorios y deben ser texto" });
        return;
    }

    
   if (!mongoose.Types.ObjectId.isValid(classRoomId)) {
  res.status(400).json({ message: "El ID de la sala no es válido" });
  return;
}

  const {topic, subTopic, title, type, content, options, correctAnswers, correction, studentAnswers, teacherFeedback } = req.body;
    
    if (!classRoomId) {
      res.status(404).json({ message: "Sala no encontrada" });
      return;
    }
  try {
    const room = await ClassRoom.findById(classRoomId);

    if (!room) {
      res.status(404).json({ message: "Sala no encontrada" });
      return; 
    }

    // Seguridad: ¿Es el usuario actual el dueño de la sala?
    if (room.TeacherId.toString() !== req.user?._id.toString()) {
      res
        .status(403)
        .json({ message: "No tienes permiso para editar esta sala" });
      return;
    }

    // Creamos el objeto tarea
    const newTask = {
          title,
          type,
          content,
          correction,
          options: options || [],
          correctAnswers: correctAnswers || [],
          completed: false,
          studentAnswers: studentAnswers ||  [],
          teacherFeedback: teacherFeedback || "",
          topic: topic || "General",
          subTopic: subTopic || "", // <-- NUEVO
    };

    // PUSH: Empujamos la tarea al array
    // @ts-ignore (A veces TS se queja con los subdocumentos, esto lo soluciona rápido)
    room.tasks.push(newTask);

    // Guardamos la sala completa (esto actualiza la DB)
    await room.save();

    res.status(201).json(ClassRoom); // Devolvemos la sala actualizada
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al agregar tarea" });
  }
};

// --- MARCAR TAREA COMO COMPLETADA (Alumno o Profesor) ---
export const toggleTask = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  const { classRoomId, taskId } = req.params;

  try {
    const classRoom = await ClassRoom.findById(classRoomId);

    if (!classRoom) {
      res.status(404).json({ message: "Sala no encontrada" });
      return;
    }

    // Seguridad: ¿El usuario pertenece a esta sala?
    const itsMyRoom =
      classRoom.TeacherId.toString() === req.user?._id.toString() ||
      classRoom.StudentId.toString() === req.user?._id.toString();

    if (!itsMyRoom) {
      res.status(403).json({ message: "No tienes acceso a esta sala" });
      return;
    }

    // Buscamos la tarea específica dentro del array
    // Mongoose nos da el método .id() para buscar en subdocumentos
    const task = classRoom.tasks.find((t: any) => t._id.toString() === taskId);

    if (!task) {
      res.status(404).json({ message: "Tarea no encontrada" });
      return;
    }

    // Invertimos el valor (si era false -> true, si era true -> false)
    task.completed = !task.completed;

    await classRoom.save();

    res.json(classRoom);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar la tarea" });
  }
};



// --- ELIMINAR SALA ---
export const deleteClassroom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const room = await ClassRoom.findById(id);

    if (!room) {
      res.status(404).json({ message: "Sala no encontrada" });
      return;
    }

    // Seguridad extra: Solo el profesor que creó la sala puede eliminarla
    if (room.TeacherId.toString() !== req.user?._id.toString()) {
      res.status(403).json({ message: "No tienes permiso para eliminar esta sala" });
      return;
    }

    await ClassRoom.findByIdAndDelete(id);
    
    res.json({ message: "Sala eliminada correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar la sala" });
  }
};

// --- ACTUALIZAR TAREA (Alumno envía respuesta o Profe envía corrección) ---
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { classRoomId, taskId } = req.params;
    const { completed, studentAnswers, teacherFeedback } = req.body;

    console.log("=== PETICIÓN HTTP RECIBIDA EN BACKEND ===");
    console.log("Room ID:", classRoomId, "Task ID:", taskId);
    console.log("Datos del Body:", req.body);

    // Creamos un objeto dinámico con los campos que realmente vienen en la petición
    const updateFields: any = {};
    
    // El uso de "tasks.$" le dice a MongoDB que actualice exactamente el subdocumento que hizo match
    if (completed !== undefined) updateFields["tasks.$.completed"] = completed;
    if (studentAnswers !== undefined) updateFields["tasks.$.studentAnswers"] = studentAnswers;
    if (teacherFeedback !== undefined) updateFields["tasks.$.teacherFeedback"] = teacherFeedback;

    const updatedRoom = await ClassRoom.findOneAndUpdate(
      { _id: classRoomId, "tasks._id": taskId }, // Filtro: Busca la sala y la tarea exacta
      { $set: updateFields },               // Acción: Modifica solo los campos enviados
      { new: true }                         // Opción: Devuelve el documento ya actualizado
    );

    if (!updatedRoom) {
      console.log("❌ No se encontró la sala o la tarea con esos IDs");
      res.status(404).json({ message: "Sala o Tarea no encontrada" });
      return;
    }

    console.log("✅ Base de datos actualizada con éxito.");
    res.json(updatedRoom);
  } catch (error) {
    console.error("❌ Error crítico en updateTask:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

// --- ELIMINAR TAREA ---
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { classRoomId, taskId } = req.params;

    const room = await ClassRoom.findById(classRoomId);
    if (!room) {
      res.status(404).json({ message: "Sala no encontrada" });
      return;
    }

    // Verificamos si la tarea realmente existe
    const taskExists = room.tasks.some(t => t._id?.toString() === taskId);
    if (!taskExists) {
      res.status(404).json({ message: "Tarea no encontrada" });
      return;
    }

    // Filtramos el arreglo para dejar todas las tareas EXCEPTO la que queremos borrar
    room.tasks = room.tasks.filter(t => t._id?.toString() !== taskId);

    // Obligamos a Mongoose a registrar el cambio en el subdocumento
    room.markModified('tasks');
    
    await room.save();
    
    res.json({ message: "Tarea eliminada con éxito" });
  } catch (error) {
    console.error("Error al eliminar la tarea:", error);
    res.status(500).json({ message: "Error en el servidor al eliminar la tarea" });
  }
};

// --- ENCENDER / APAGAR LA VIDEOLLAMADA ---
export const toggleLiveStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isLive } = req.body; // Recibimos true o false desde el frontend

    // Verificamos que solo un profesor pueda iniciar la clase
    if (req.user?.role !== 'teacher') {
      res.status(403).json({ message: "Solo los profesores pueden iniciar la llamada" });
      return;
    }

    const classroom = await ClassRoom.findByIdAndUpdate(
      id, 
      { isLive }, 
      { new: true }
    );

    if (!classroom) {
      res.status(404).json({ message: "Aula no encontrada" });
      return;
    }

    res.json({ message: isLive ? "Clase iniciada" : "Clase finalizada", isLive: classroom.isLive });
  } catch (error) {
    res.status(500).json({ message: "Error al cambiar el estado de la clase" });
  }
};

export const addClassNote = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { text, vocab, topic } = req.body;

    const updatedRoom = await ClassRoom.findByIdAndUpdate(
      id,
      { $push: { notes: { text, vocab, topic } } }, // $push añade el apunte a la lista
      { new: true }
    );

    res.status(200).json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: "Error al guardar los apuntes" });
  }
};