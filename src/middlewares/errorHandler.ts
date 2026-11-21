import { ErrorRequestHandler } from "express";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);

  const status = typeof err.status === "number" &&
    err.status >= 400 &&
    err.status < 600
    ? err.status
    : 500;

  res.status(status).json({
    msg: status === 500 ? "Error interno del servidor" : err.message,
    code: status,
    data: null
  });
};