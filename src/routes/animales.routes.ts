import { Router, Request, Response } from "express";
import { animalesMock } from "../mocks/animales.mock";

const router = Router();

router.get("/", (req: Request, res: Response) => {
    const {
        nombre,
        especie,
        tamanio,
        estado,
        sexo,
        refugioId,
        page = "1",
        limit = "10",
        sortBy = "nombre",
        order = "asc"
    } = req.query;

    // Validar parámetros de búsqueda
    if (
        (nombre !== undefined && typeof nombre !== "string") ||
        (especie !== undefined && typeof especie !== "string") ||
        (tamanio !== undefined && typeof tamanio !== "string") ||
        (estado !== undefined && typeof estado !== "string") ||
        (sexo !== undefined && typeof sexo !== "string") ||
        (refugioId !== undefined && typeof refugioId !== "string")
    ) {
        res.status(400).json({
            msg: "Parámetros de búsqueda inválidos",
            code: 400,
            data: null
        });
        return;
    }

    // Validar tamaño
    const tamaniosPermitidos = ["pequeno", "mediano", "grande"];

    if (
        tamanio !== undefined &&
        !tamaniosPermitidos.includes(tamanio)
    ) {
        res.status(400).json({
            msg: "Tamaño inválido",
            code: 400,
            data: null
        });
        return;
    }

    // Validar estado
    const estadosPermitidos = [
        "disponible",
        "en_proceso",
        "adoptado"
    ];

    if (
        estado !== undefined &&
        !estadosPermitidos.includes(estado)
    ) {
        res.status(400).json({
            msg: "Estado inválido",
            code: 400,
            data: null
        });
        return;
    }

    // Validar sexo
    if (
        sexo !== undefined &&
        sexo !== "macho" &&
        sexo !== "hembra"
    ) {
        res.status(400).json({
            msg: "Sexo inválido",
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

    if (
        !esEnteroPositivo(page) ||
        !esEnteroPositivo(limit) ||
        Number(limit) > 100
    ) {
        res.status(400).json({
            msg: "page debe ser un entero positivo y limit debe estar entre 1 y 100",
            code: 400,
            data: null
        });
        return;
    }

    // Validar ordenamiento
    const camposPermitidos = [
        "nombre",
        "edad",
        "fechaCreacion"
    ];

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

    // Crear una copia de los datos mock
    let animales = [...animalesMock];

    // Aplicar filtros
    if (nombre) {
        animales = animales.filter((animal) =>
            animal.nombre.toLowerCase().includes(
                nombre.trim().toLowerCase()
            )
        );
    }

    if (especie) {
        animales = animales.filter((animal) =>
            animal.especie.toLowerCase() ===
            especie.trim().toLowerCase()
        );
    }

    if (tamanio) {
        animales = animales.filter(
            (animal) => animal.tamanio === tamanio
        );
    }

    if (estado) {
        animales = animales.filter(
            (animal) => animal.estado === estado
        );
    }

    if (sexo) {
        animales = animales.filter(
            (animal) => animal.sexo === sexo
        );
    }

    if (refugioId) {
        animales = animales.filter(
            (animal) => animal.refugioId === refugioId
        );
    }

    // Aplicar ordenamiento
    animales.sort((a, b) => {
        let comparacion = 0;

        switch (sortBy) {
            case "nombre":
                comparacion = a.nombre.localeCompare(
                    b.nombre,
                    "es",
                    { sensitivity: "base" }
                );
                break;

            case "edad":
                comparacion = a.edad - b.edad;
                break;

            case "fechaCreacion":
                comparacion =
                    new Date(a.fechaCreacion).getTime() -
                    new Date(b.fechaCreacion).getTime();
                break;
        }

        return order === "asc" ? comparacion : -comparacion;
    });

    // Aplicar paginación
    const total = animales.length;
    const totalPages = Math.ceil(total / limite);
    const inicio = (pagina - 1) * limite;
    const resultados = animales.slice(inicio, inicio + limite);

    // Devolver respuesta
    res.status(200).json({
        msg: "Animales obtenidos correctamente",
        code: 200,
        data: {
            animales: resultados,
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