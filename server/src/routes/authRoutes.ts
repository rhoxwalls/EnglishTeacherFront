import { Router } from "express";
import {
  registerUser,
  loginUser,
  getAllStudents,
  deleteStudent,
  getMe,
  getStudentById,
  addScheduleException,
  updateBaseSchedule,
} from "../controllers/authControllers.js";
import { protect, type AuthRequest } from "../middleware/authMiddleware.js";

const router = Router();

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

router.get("/me", protect, getMe);

// Asegúrate de ponerle tu middleware de protección si lo deseas
router.get("/students", protect, getAllStudents);

router.get("/students/:studentId", protect, getStudentById);

router.patch("/students/:studentId/exceptions", protect, addScheduleException);

router.patch("/students/:studentId/schedule", protect, updateBaseSchedule);

router.delete("/students/:studentId", protect, deleteStudent);

export default router;
