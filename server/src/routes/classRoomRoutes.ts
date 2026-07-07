import { Router } from "express";
import {
  createClassroom,
  obtainMyClassRooms,
  addTask,
  toggleTask,
  deleteClassroom,
  updateTask,
  deleteTask,
  toggleLiveStatus,
  addClassNote,
} from "../controllers/classRoomController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Todas las rutas aquí requieren estar logueado
router.use(protect);

// POST /api/salas -> Crear una sala (Solo profes)
router.post("/", createClassroom);

// GET /api/salas -> Ver mis salas (Profes y Alumnos)
router.get("/", obtainMyClassRooms);

// DELETE /api/salas/:id -> Eliminar una sala (Solo el prof que la creó)
router.delete("/:id", deleteClassroom);

// --- RUTAS DE TAREAS ---

// POST: Agregar tarea a una sala específica
// Ejemplo: /api/salas/65a1b2c3d4e5/tareas
router.post("/:classRoomId/tasks", addTask);

// PATCH: Modificar estado de una tarea específica
// Ejemplo: /api/salas/65a1b2c3d4e5/tareas/98z7y6x5
router.put("/:classRoomId/tasks/:taskId", toggleTask);

router.patch("/:classRoomId/tasks/:taskId", updateTask);

router.delete("/:classRoomId/tasks/:taskId", deleteTask);

router.patch("/:id/live", toggleLiveStatus);
router.post("/:id/notes", addClassNote);
export default router;
