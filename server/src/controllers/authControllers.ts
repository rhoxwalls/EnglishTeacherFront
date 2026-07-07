import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Users, { type IUser } from "../models/Users.js";
import Event from "../models/Event.js";
import ClassRoom from "../models/ClassRoom.js";
import { type AuthRequest } from "../middleware/authMiddleware.js";

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "temporal_secret", {
    expiresIn: "30d",
  });
};

// User Register
export const registerUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { name, email, password, role, baseSchedule } = req.body;

  try {
    if (!name || !email || !password) {
      res.status(400).json({ message: "Por favor complete los campos" });
      return;
    }

    const userExist = await Users.findOne({ email });
    if (userExist) {
      res.status(400).json({ message: "Un usuario ya existe con ese email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await Users.create({
      name,
      email,
      passwordHash: hashedPassword,
      role: role || "student", 
      baseSchedule: role === 'student' ? baseSchedule : [],
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });


      
    } else {
      res.status(400).json({ message: "Datos de usuario inválidos" });
    }
  } catch (error) {
    res.status(500).json({ response: "Error en el servidor al registrarse" });
  }
};

// USER LOGIN

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await Users.findOne({ email });

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({
        message: "Credenciales inválidas (email o contraseña incorrectos)",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor al loguear" });
  }
};

// --- OBTENER TODOS LOS ALUMNOS ---
export const getAllStudents = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Buscamos solo los que tienen rol 'student' y evitamos enviar las contraseñas
    const students = await Users.find({ role: "student" }).select("-password");
    res.json(students);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener la lista de alumnos" });
  }
};

// --- ELIMINAR ALUMNO Y SUS AULAS ---
export const deleteStudent = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { studentId } = req.params;

    // 1. Verificamos que quien pide esto sea un profesor
    if (req.user?.role !== "teacher") {
      res
        .status(403)
        .json({ message: "Solo los profesores pueden eliminar alumnos" });
      return;
    }

    // 2. 🛡️ EL ESCUDO ANTI-UNDEFINED: Garantizamos que studentId existe
    if (!studentId || typeof studentId !== 'string') {
      res.status(400).json({ message: "ID de alumno faltante o inválido" });
      return;
    }
    
    // 2. Eliminamos todas las salas/aulas donde este usuario sea el StudentId
    await ClassRoom.deleteMany({ StudentId: studentId });
    await Event.deleteMany({ studentId: studentId }); // NUEVO: También eliminamos las clases/eventos vinculados a este alumno
    // 3. Eliminamos al usuario de la base de datos
    const deletedUser = await Users.findByIdAndDelete(studentId);

    if (!deletedUser) {
      res.status(404).json({ message: "Alumno no encontrado" });
      return;
    }

    res.json({
      message: "Alumno y todos sus registros eliminados correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar alumno:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor al eliminar alumno" });
  }
};

// --- OBTENER PERFIL DE USUARIO ACTUAL (Validación de Token) ---
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // El middleware 'protect' ya extrajo el ID del token y lo inyectó en req.user
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ message: "No autorizado, sesión inválida" });
      return;
    }

    // Buscamos al usuario por su ID en la base de datos
    // Usamos .select('-password') por seguridad, para jamás enviar el hash de la contraseña al cliente
    const user = await Users.findById(userId).select("-password");

    if (!user) {
      res
        .status(404)
        .json({ message: "El usuario ya no existe en la base de datos" });
      return;
    }

    // Si todo está bien, devolvemos el objeto del usuario
    res.json(user);
  } catch (error) {
    console.error("Error crítico en el controlador getMe:", error);
    res
      .status(500)
      .json({ message: "Error interno del servidor al recuperar la sesión" });
  }
};

export const getStudentById = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    
    // Buscamos al usuario por su ID y excluimos la contraseña por seguridad
    const student = await Users.findById(studentId).select('-passwordHash');
    
    if (!student) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    // Lo devolvemos al frontend
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Error al buscar el estudiante', error });
  }
};

// export const addScheduleException = async (req: AuthRequest, res: Response) => {
//   try {
//     const { studentId } = req.params;
//     const { originalDate, status, baseScheduleId, newDate, time } = req.body; // 💡 Recibimos 'status'

//     const user = await Users.findById(studentId);
//     if (!user) return res.status(404).json({ message: 'Estudiante no encontrado' });

//     if (!user.scheduleExceptions) user.scheduleExceptions = [];

//     const targetDateStr = new Date(originalDate).toISOString().split('T')[0];

//     const existingExceptionIndex = user.scheduleExceptions.findIndex((e) => {
//       return (
//         new Date(e.originalDate).toISOString().split('T')[0] === targetDateStr &&
//         e.baseScheduleId.toString() === baseScheduleId.toString()
//       );
//     });

//     // 💡 Armamos la excepción dinámicamente según el caso
//     let exceptionData: any = {
//       originalDate: new Date(originalDate),
//       status: status // Puede ser 'cancelled' o 'rescheduled'
//     };

//     // Si es reprogramación, sumamos la nueva fecha y hora
//     if (status === 'rescheduled' && newDate && time) {
//       exceptionData.newDate = new Date(`${newDate}T${time}:00`);
//     }

//     if (existingExceptionIndex >= 0) {
//       user.scheduleExceptions[existingExceptionIndex] = exceptionData;
//     } else {
//       user.scheduleExceptions.push(exceptionData);
//     }

//     await user.save();
//     return res.status(200).json(user);
//   } catch (error) {
//     return res.status(500).json({ message: 'Error al procesar la excepción', error: error.message });
//   }
// };


export const updateBaseSchedule = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    const { newSchedule } = req.body;

    const user = await Users.findById(studentId);
    if (!user) {
      return res.status(404).json({ message: 'Estudiante no encontrado' });
    }

    // Reemplazamos el horario base viejo por el nuevo
    user.baseSchedule = newSchedule;
    await user.save();

    return res.status(200).json({ 
      message: 'Horario base actualizado con éxito', 
      baseSchedule: user.baseSchedule 
    });
  } catch (error: any) {
    console.error("❌ Error al actualizar el horario base:", error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const addScheduleException = async (req: AuthRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    const { originalDate, baseScheduleId, status, newDate, time } = req.body;

    // 💡 SALVAVIDAS 1: Verificamos que el frontend haya enviado el ID del bloque
    if (!baseScheduleId) {
      return res.status(400).json({ 
        message: 'Falta el ID del horario. Si el alumno es antiguo, edita y guarda su rutina nuevamente.' 
      });
    }

    const user = await Users.findById(studentId);
    if (!user) return res.status(404).json({ message: 'Estudiante no encontrado' });

    if (!user.scheduleExceptions) user.scheduleExceptions = [];

    const targetDateStr = new Date(originalDate).toISOString().split('T')[0];

    // Buscamos si ya existía una excepción para ese bloque exacto
    const existingExceptionIndex = user.scheduleExceptions.findIndex((e: any) => {
      // 💡 SALVAVIDAS 2: Evitamos que .toString() rompa la app si hay datos viejos corruptos
      if (!e.originalDate || !e.baseScheduleId) return false; 
      
      return (
        new Date(e.originalDate).toISOString().split('T')[0] === targetDateStr &&
        e.baseScheduleId.toString() === baseScheduleId.toString()
      );
    });

    let exceptionData: any = {
      originalDate: new Date(originalDate),
      baseScheduleId: baseScheduleId,
      status: status
    };

    if (status === 'rescheduled' && newDate && time) {
      exceptionData.newDate = new Date(`${newDate}T${time}:00`);
    }

    if (existingExceptionIndex >= 0) {
      user.scheduleExceptions[existingExceptionIndex] = exceptionData;
    } else {
      user.scheduleExceptions.push(exceptionData);
    }

    await user.save();
    return res.status(200).json(user);
  } catch (error: any) {
    console.error("❌ Error en la excepción:", error);
    return res.status(500).json({ message: 'Error interno', error: error.message });
  }
};