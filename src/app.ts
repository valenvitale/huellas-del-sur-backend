import express from "express";
import cors from "cors";
import { errorHandler } from "./middlewares/errorHandler";
import refugiosRoutes from "./routes/refugios.routes";
import animalesRoutes from "./routes/animales.routes";

const app = express();

app.use(cors());
app.use(express.json());

// Endpoint de salud de la API
const healthHandler = (_req: express.Request, res: express.Response) => {
  res.status(200).json({
    msg: "OK",
    code: 200,
    data: {
      service: "Huellas del Sur API",
      status: "running"
    }
  });
};

app.get("/api/health", healthHandler);
app.get("/api/v1/health", healthHandler);
app.use("/api/v1/refugios", refugiosRoutes);
app.use("/api/v1/animales", animalesRoutes);

// Middleware para rutas inexistentes
app.use((_req, res) => {
  res.status(404).json({
    msg: "Ruta no encontrada",
    code: 404,
    data: null
  });
});

// Middleware centralizado de errores
app.use(errorHandler);

export default app;