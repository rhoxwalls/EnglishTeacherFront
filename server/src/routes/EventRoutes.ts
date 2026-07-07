import { Router } from "express";
import { createEvent, deleteEvent, getMyEvents, updateEvent } from "../controllers/EventController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", protect, createEvent);
router.get("/", protect, getMyEvents);
router.delete("/:eventId", protect, deleteEvent);
router.patch('/:eventId', protect, updateEvent)

export default router;