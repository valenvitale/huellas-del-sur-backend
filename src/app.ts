import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    msg: "OK",
    code: 200,
    data: {
      service: "Huellas del Sur API",
      status: "running"
    }
  });
});

export default app;
