import { Router, Request, Response } from "express";
import { animalesMock } from "../mocks/animales.mock";
import { Animal, AnimalCatalogo } from "../types/Animal";
import { refugiosMock } from "../mocks/refugios.mock";

const router = Router();

// Incorporar información del refugio asociado
function obtenerAnimalCatalogo(animal: Animal): AnimalCatalogo {
    const refugio = refugiosMock.find(
        (refugio) => refugio.id === animal.refugioId
    );

    return {
        ...animal,
        refugio: refugio
            ? {
                id: refugio.id,
                nombre: refugio.nombre,
                localidad: refugio.localidad
            }
            : null
    };
}

type DatosAnimal = Omit<
    Animal,
    "id" | "fechaCreacion" | "fechaActualizacion"
>;

function validarDatosAnimal(
    datos: Partial<DatosAnimal>
): string | null {
    const {
        nombre,
        especie,
        refugioId,
        raza,
        edad,
        sexo,
        tamanio,
        descripcion,
        imagenUrl,
        estado
    } = datos;

    // Validar campos de texto obligatorios
    const camposObligatorios = {
        nombre,
        especie,
        refugioId,
        descripcion
    };

    const datosInvalidos = Object.values(
        camposObligatorios
    ).some(
        (valor) =>
            typeof valor !== "string" ||
            valor.trim() === ""
    );

    if (datosInvalidos) {
        return "Los campos obligatorios deben estar completos";
    }

    // Validar edad
    if (
        typeof edad !== "number" ||
        !Number.isFinite(edad) ||
        edad < 0
    ) {
        return "La edad debe ser un número mayor o igual a cero";
    }

    // Validar sexo
    if (sexo !== "macho" && sexo !== "hembra") {
        return "Sexo inválido";
    }

    // Validar tamaño
    if (
        tamanio !== "pequeno" &&
        tamanio !== "mediano" &&
        tamanio !== "grande"
    ) {
        return "Tamaño inválido";
    }

    // Validar estado
    if (
        estado !== "disponible" &&
        estado !== "en_proceso" &&
        estado !== "adoptado"
    ) {
        return "Estado de adopción inválido";
    }

    // Validar campos opcionales
    if (raza !== undefined && typeof raza !== "string") {
        return "La raza debe ser una cadena de texto";
    }

    if (
        imagenUrl !== undefined &&
        typeof imagenUrl !== "string"
    ) {
        return "La imagen debe ser una cadena de texto";
    }

    // Validar campos opcionales de salud y compatibilidad
    const camposBooleanos = {
        vacunado: datos.vacunado,
        castrado: datos.castrado,
        desparasitado: datos.desparasitado,
        compatibleConNinos: datos.compatibleConNinos,
        compatibleConPerros: datos.compatibleConPerros,
        compatibleConGatos: datos.compatibleConGatos
    };

    for (const [campo, valor] of Object.entries(camposBooleanos)) {
        if (valor !== undefined && typeof valor !== "boolean") {
            return `El campo ${campo} debe ser un valor booleano`;
        }
    }

    // Validar información de salud y comportamiento
    const camposTexto = {
        estadoSalud: datos.estadoSalud,
        comportamiento: datos.comportamiento
    };

    for (const [campo, valor] of Object.entries(camposTexto)) {
        if (valor !== undefined && typeof valor !== "string") {
            return `El campo ${campo} debe ser una cadena de texto`;
        }
    }

    // Validar existencia del refugio
    const refugioExiste = refugiosMock.some(
        (refugio) => refugio.id === refugioId
    );

    if (!refugioExiste) {
        return "El refugio asociado no existe";
    }

    return null;
}

router.get("/", (req: Request, res: Response) => {
    const {
        nombre,
        especie,
        tamanio,
        estado,
        sexo,
        refugioId,
        localidad,
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
        (refugioId !== undefined && typeof refugioId !== "string") ||
        (localidad !== undefined && typeof localidad !== "string")
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

    // Filtrar por refugio asociado
    if (refugioId) {
        animales = animales.filter(
            (animal) => animal.refugioId === refugioId
        );
    }

    // Filtrar por localidad del refugio
    if (localidad) {
        const refugiosLocalidad = refugiosMock
            .filter(
                (refugio) =>
                    refugio.localidad.localeCompare(
                        localidad.trim(),
                        "es",
                        { sensitivity: "base" }
                    ) === 0
            )
            .map((refugio) => refugio.id);

        animales = animales.filter(
            (animal) => refugiosLocalidad.includes(animal.refugioId)
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
    const resultados = animales
    .slice(inicio, inicio + limite)
    .map(obtenerAnimalCatalogo);

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

// Obtener un animal por ID
router.get("/:id", (req: Request, res: Response) => {
    const { id } = req.params;

    const animal = animalesMock.find(
        (animal) => animal.id === id
    );

    if (!animal) {
        res.status(404).json({
            msg: "Animal no encontrado",
            code: 404,
            data: null
        });
        return;
    }

    res.status(200).json({
        msg: "Animal obtenido correctamente",
        code: 200,
        data: {
            animal: obtenerAnimalCatalogo(animal)
        }
    });
});

// Crear un animal
router.post("/", (req: Request, res: Response) => {
    const datos = req.body ?? {};

    // Validar los datos recibidos
    const error = validarDatosAnimal(datos);

    if (error) {
        res.status(400).json({
            msg: error,
            code: 400,
            data: null
        });
        return;
    }

    // Generar un nuevo ID
    const nuevoId = String(
        Math.max(
            0,
            ...animalesMock.map((animal) => Number(animal.id))
        ) + 1
    );

    const fechaActual = new Date().toISOString();

    // Crear el nuevo animal
    const nuevoAnimal: Animal = {
        id: nuevoId,
        refugioId: datos.refugioId,
        nombre: datos.nombre.trim(),
        especie: datos.especie.trim().toLowerCase(),
        edad: datos.edad,
        sexo: datos.sexo,
        tamanio: datos.tamanio,
        descripcion: datos.descripcion.trim(),
        // Salud
        vacunado: datos.vacunado,
        castrado: datos.castrado,
        desparasitado: datos.desparasitado,
        estadoSalud: datos.estadoSalud?.trim(),

        // Comportamiento y compatibilidad
        comportamiento: datos.comportamiento?.trim(),
        compatibleConNinos: datos.compatibleConNinos,
        compatibleConPerros: datos.compatibleConPerros,
        compatibleConGatos: datos.compatibleConGatos,
            estado: datos.estado,
        fechaCreacion: fechaActual,
        fechaActualizacion: fechaActual,
        ...(datos.raza !== undefined && {
            raza: datos.raza.trim()
        }),
        ...(datos.imagenUrl !== undefined && {
            imagenUrl: datos.imagenUrl.trim()
        })
    };

    // Guardar temporalmente en memoria
    animalesMock.push(nuevoAnimal);

    res.status(201).json({
        msg: "Animal creado correctamente",
        code: 201,
        data: {
            animal: obtenerAnimalCatalogo(nuevoAnimal)
        }
    });
});

// Actualizar un animal por ID
router.put("/:id", (req: Request, res: Response) => {
    const { id } = req.params;

    // Buscar el animal
    const animal = animalesMock.find(
        (animal) => animal.id === id
    );

    if (!animal) {
        res.status(404).json({
            msg: "Animal no encontrado",
            code: 404,
            data: null
        });
        return;
    }

    const datos = req.body ?? {};

    // Validar los datos recibidos
    const error = validarDatosAnimal(datos);

    if (error) {
        res.status(400).json({
            msg: error,
            code: 400,
            data: null
        });
        return;
    }

    // Actualizar los datos en memoria
    Object.assign(animal, {
        refugioId: datos.refugioId,
        nombre: datos.nombre.trim(),
        especie: datos.especie.trim().toLowerCase(),
        raza: datos.raza?.trim(),
        edad: datos.edad,
        sexo: datos.sexo,
        tamanio: datos.tamanio,
        descripcion: datos.descripcion.trim(),

        // Salud
        vacunado: datos.vacunado,
        castrado: datos.castrado,
        desparasitado: datos.desparasitado,
        estadoSalud: datos.estadoSalud?.trim(),

        // Comportamiento y compatibilidad
        comportamiento: datos.comportamiento?.trim(),
        compatibleConNinos: datos.compatibleConNinos,
        compatibleConPerros: datos.compatibleConPerros,
        compatibleConGatos: datos.compatibleConGatos,

        imagenUrl: datos.imagenUrl?.trim(),
        estado: datos.estado,
        fechaActualizacion: new Date().toISOString()
    });
    res.status(200).json({
        msg: "Animal actualizado correctamente",
        code: 200,
        data: {
            animal: obtenerAnimalCatalogo(animal)
        }
    });
});

// Eliminar un animal por ID
router.delete("/:id", (req: Request, res: Response) => {
    const { id } = req.params;

    // Buscar el índice del animal
    const indice = animalesMock.findIndex(
        (animal) => animal.id === id
    );

    if (indice === -1) {
        res.status(404).json({
            msg: "Animal no encontrado",
            code: 404,
            data: null
        });
        return;
    }

    // Eliminar el animal de la memoria
    animalesMock.splice(indice, 1);

    res.status(200).json({
        msg: "Animal eliminado correctamente",
        code: 200,
        data: null
    });
});

export default router;