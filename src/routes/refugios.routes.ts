import { Router, Request, Response } from "express";
import { refugiosMock } from "../mocks/refugios.mock";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const {
    nombre,
    localidad,
    page = "1",
    limit = "10",
    sortBy = "nombre",
    order = "asc"
  } = req.query;

  // Validar que los parámetros de búsqueda sean cadenas
  if (
    (nombre !== undefined && typeof nombre !== "string") ||
    (localidad !== undefined && typeof localidad !== "string")
  ) {
    res.status(400).json({
      msg: "Parámetros de búsqueda inválidos",
      code: 400,
      data: null
    });
    return;
  }

  // Validar paginación
  const esEnteroPositivo = (valor: unknown): valor is string =>
    typeof valor === "string" &&
    /^[1-9]\d*$/.test(valor) &&
    Number.isSafeInteger(Number(valor));

  if (!esEnteroPositivo(page) || !esEnteroPositivo(limit)) {
    res.status(400).json({
      msg: "page y limit deben ser números enteros positivos",
      code: 400,
      data: null
    });
    return;
  }

  // Validar ordenamiento
  const camposPermitidos = ["nombre", "localidad"];

  if (
    typeof sortBy !== "string" ||
    !camposPermitidos.includes(sortBy) ||
    (order !== "asc" && order !== "desc")
  ) {
    res.status(400).json({
      msg: "Parámetros de ordenamiento inválidos",
      code: 400,
      data: null
    });
    return;
  }

  const pagina = Number(page);
  const limite = Number(limit);

  // Aplicar filtros
  let refugios = [...refugiosMock];

  if (nombre) {
    refugios = refugios.filter((refugio) =>
      refugio.nombre.toLowerCase().includes(nombre.toLowerCase())
    );
  }

  if (localidad) {
    refugios = refugios.filter((refugio) =>
      refugio.localidad.toLowerCase().includes(localidad.toLowerCase())
    );
  }

  // Aplicar ordenamiento
  refugios.sort((a, b) => {
    const campo = sortBy as "nombre" | "localidad";

    const comparacion = a[campo].localeCompare(b[campo], "es", {
      sensitivity: "base"
    });

    return order === "asc" ? comparacion : -comparacion;
  });

  // Aplicar paginación
  const total = refugios.length;
  const totalPages = Math.ceil(total / limite);
  const inicio = (pagina - 1) * limite;
  const resultados = refugios.slice(inicio, inicio + limite);

  res.status(200).json({
    msg: "Refugios obtenidos correctamente",
    code: 200,
    data: {
      refugios: resultados,
      pagination: {
        page: pagina,
        limit: limite,
        total,
        totalPages
      }
    }
  });
});

export default router;