import express from "express";
import type { Express } from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

// IMPORT ROUTES
import authRoutes from "./routes/authRoutes.js";
import classRoomRoutes from "./routes/classRoomRoutes.js";
import eventRoutes from "./routes/EventRoutes.js";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "";

app.use(helmet());

const allowedOrigins = [
  "http://localhost:5173", // Local
  "https://tu-app-frontend.vercel.app", // URL de producción (reemplazar luego)
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
}));



const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Limita a 100 peticiones por IP cada 15 mins
  message:
    "Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos.",
});
app.use(limiter);

app.use(express.json());

const connectDB = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI no está definida en el archivo .env");
    }
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Conectado exitosamente a MongoDB Atlas");
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error);
    process.exit(1);
  }
};

// --- RUTAS (Endpoints) ---
app.use("/api/auth", authRoutes);
app.use("/api/classrooms", classRoomRoutes);
app.use("/api/events", eventRoutes);

// --- INICIO DEL SERVIDOR ---

// Primero conectamos la DB, luego levantamos el servidor
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`📡 Servidor escuchando en el puerto ${PORT}`);
    console.log(`🛡️  Modo: ${process.env.NODE_ENV || "development"}`);
  });
});


