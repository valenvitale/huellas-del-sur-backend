import { Router, Request, Response } from "express";
import { refugiosMock } from "../mocks/refugios.mock";
import { Refugio } from "../types/Refugio";

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

// Obtener un refugio por ID
router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  const refugio = refugiosMock.find((refugio) => refugio.id === id);

  if (!refugio) {
    res.status(404).json({
      msg: "Refugio no encontrado",
      code: 404,
      data: null
    });
    return;
  }

  res.status(200).json({
    msg: "Refugio obtenido correctamente",
    code: 200,
    data: {
      refugio
    }
  });
});

// Crear un refugio
router.post("/", (req: Request, res: Response) => {
  const { nombre, direccion, localidad, telefono, email, descripcion, estado } =
    req.body ?? {};

  // Validar campos obligatorios
  const camposObligatorios = {
    nombre,
    direccion,
    localidad,
    telefono,
    descripcion,
    estado
  };

  const datosInvalidos = Object.values(camposObligatorios).some(
    (valor) => typeof valor !== "string" || valor.trim() === ""
  );

  if (
    datosInvalidos ||
    (email !== undefined && typeof email !== "string") ||
    (estado !== "activo" && estado !== "inactivo")
  ) {
    res.status(400).json({
      msg: "Datos del refugio inválidos o incompletos",
      code: 400,
      data: null
    });
    return;
  }

  // Generar un ID nuevo
  const nuevoId = String(
    Math.max(0, ...refugiosMock.map((refugio) => Number(refugio.id))) + 1
  );

  const nuevoRefugio: Refugio = {
    id: nuevoId,
    nombre,
    direccion,
    localidad,
    telefono,
    descripcion,
    estado,
    ...(email !== undefined && { email })
  };

  // Guardar temporalmente en memoria
  refugiosMock.push(nuevoRefugio);

  res.status(201).json({
    msg: "Refugio creado correctamente",
    code: 201,
    data: {
      refugio: nuevoRefugio
    }
  });
});

// Actualizar un refugio por ID
router.put("/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  const refugio = refugiosMock.find((refugio) => refugio.id === id);

  if (!refugio) {
    res.status(404).json({
      msg: "Refugio no encontrado",
      code: 404,
      data: null
    });
    return;
  }

  const {
    nombre,
    direccion,
    localidad,
    telefono,
    email,
    descripcion,
    estado
  } = req.body ?? {};

  // Validar campos obligatorios
  const camposObligatorios = {
    nombre,
    direccion,
    localidad,
    telefono,
    descripcion,
    estado
  };

  const datosInvalidos = Object.values(camposObligatorios).some(
    (valor) => typeof valor !== "string" || valor.trim() === ""
  );

  if (
    datosInvalidos ||
    (email !== undefined && typeof email !== "string") ||
    (estado !== "activo" && estado !== "inactivo")
  ) {
    res.status(400).json({
      msg: "Datos del refugio inválidos o incompletos",
      code: 400,
      data: null
    });
    return;
  }

  // Actualizar los datos en memoria
  Object.assign(refugio, {
    nombre,
    direccion,
    localidad,
    telefono,
    descripcion,
    estado,
    email
  });

  res.status(200).json({
    msg: "Refugio actualizado correctamente",
    code: 200,
    data: {
      refugio
    }
  });
});

// Eliminar un refugio por ID
router.delete("/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  const indice = refugiosMock.findIndex((refugio) => refugio.id === id);

  if (indice === -1) {
    res.status(404).json({
      msg: "Refugio no encontrado",
      code: 404,
      data: null
    });
    return;
  }

  // Eliminar el refugio de la memoria
  refugiosMock.splice(indice, 1);

  res.status(200).json({
    msg: "Refugio eliminado correctamente",
    code: 200,
    data: null
  });
});

export default router;