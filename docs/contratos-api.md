
# Huellas del Sur — Contratos de API

## 1. Introducción

Este documento define los contratos de comunicación entre
el frontend y el backend de Huellas del Sur.

La API utilizará arquitectura REST y respuestas JSON.

En el prototipo V1, las operaciones se simularán mediante
mocks, sin utilizar una base de datos persistente.

**URL base:** `/api`

## 2. Endpoints REST

Los endpoints permitirán consultar, crear, modificar
y eliminar registros.

### 2.1 Refugios

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | /api/refugios | Listar refugios |
| GET | /api/refugios/:id | Obtener refugio por ID |
| POST | /api/refugios | Crear refugio |
| PUT | /api/refugios/:id | Reemplazar refugio |
| PATCH | /api/refugios/:id | Modificar parcialmente |
| DELETE | /api/refugios/:id | Eliminar refugio |

**Ejemplo POST — Request Body:**

```json
{
  "nombre": "Patitas Felices",
  "direccion": "Bahía Blanca",
  "telefono": "2911234567",
  "descripcion": "Refugio dedicado al rescate de animales",
  "estado": "activo"
}
```

Campos obligatorios: nombre, direccion, telefono,
descripcion y estado.

Campo opcional: email.

El backend genera automáticamente el id.

Para PUT se envían todos los campos obligatorios.
Para PATCH se envían solamente los campos a modificar.
El id se indica en la URL y no se modifica.

DELETE no requiere cuerpo JSON.

### 2.2 Animales

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | /api/animales | Listar animales |
| GET | /api/animales/:id | Obtener animal por ID |
| POST | /api/animales | Crear animal |
| PUT | /api/animales/:id | Reemplazar animal |
| PATCH | /api/animales/:id | Modificar parcialmente |
| DELETE | /api/animales/:id | Eliminar animal |

**Ejemplo POST — Request Body:**

```json
{
  "refugioId": "1",
  "nombre": "Luna",
  "especie": "perro",
  "edad": 2,
  "sexo": "hembra",
  "tamanio": "mediano",
  "descripcion": "Perra sociable",
  "estado": "disponible"
}
```

Campos obligatorios: refugioId, nombre, especie,
edad, sexo, tamanio, descripcion y estado.

Campos opcionales: raza e imagenUrl.

El backend genera id, fechaCreacion y
fechaActualizacion.

PUT requiere todos los campos obligatorios.
PATCH permite modificar campos individuales.

### 2.3 Otras entidades

Se definen los siguientes endpoints para las
demás entidades del prototipo.

| Entidad | Endpoint base | Métodos |
| --- | --- | --- |
| Usuarios | /api/usuarios | GET, POST, PUT, PATCH, DELETE |
| Solicitudes | /api/solicitudes | GET, POST, PUT, PATCH, DELETE |
| Encuestas | /api/encuestas | GET, POST, PUT, PATCH, DELETE |
| Preguntas | /api/preguntas | GET, POST, PUT, PATCH, DELETE |
| Respuestas | /api/respuestas | GET, POST, PUT, PATCH, DELETE |

Para cada entidad se utilizarán:

- GET /api/{entidad}: obtener listado.
- GET /api/{entidad}/:id: obtener por ID.
- POST /api/{entidad}: crear registro.
- PUT /api/{entidad}/:id: reemplazar registro.
- PATCH /api/{entidad}/:id: modificar parcialmente.
- DELETE /api/{entidad}/:id: eliminar registro.

### 2.4 Datos de las otras entidades

Los cuerpos JSON deberán respetar las interfaces
definidas en src/types/.

**Usuario:**

POST requiere nombre, telefono, email y rol.
refugioId es opcional según el rol.
El backend genera id.

**Solicitud:**

POST requiere usuarioId y animalId.
El backend genera id y asigna estado "pendiente".

**Encuesta:**

POST requiere titulo y estado.
El backend genera id.

**Pregunta:**

POST requiere encuestaId y contenido.
El backend genera id.

**Respuesta:**

POST requiere encuestaId, preguntaId,
usuarioId y contenido.
El backend genera id.

En todos los casos, PUT requiere los campos
obligatorios editables y PATCH permite enviar
solamente los campos que se desean modificar.

Los identificadores no se modifican.

## 3. Parámetros de consulta

Los endpoints de listado utilizarán los siguientes
parámetros opcionales:

| Parámetro | Tipo | Descripción |
| --- | --- | --- |
| page | number | Número de página |
| limit | number | Registros por página |
| sortBy | string | Campo de ordenamiento |
| order | string | asc o desc |
| search | string | Búsqueda por texto |

Valores predeterminados:

- page: 1
- limit: 10
- order: asc

page debe ser mayor o igual a 1.
limit debe estar entre 1 y 100.

**Filtros para Refugios:**

- estado: activo o inactivo.

sortBy permite: nombre, direccion o estado.

**Filtros para Animales:**

- especie
- sexo
- tamanio
- estado
- refugioId

sortBy permite: nombre, edad o fechaCreacion.

**Filtros para otras entidades:**

- Usuarios: rol.
- Solicitudes: usuarioId, animalId, estado.
- Encuestas: estado.
- Preguntas: encuestaId.
- Respuestas: encuestaId, preguntaId, usuarioId.

El valor de sortBy deberá corresponder a un campo
válido de la entidad consultada.

**Ejemplo:**

GET /api/refugios?page=1&limit=10&sortBy=nombre&order=asc&estado=activo

## 4. Respuestas de la API

### 4.1 Respuesta exitosa — GET por ID

Código HTTP: 200 OK.

```json
{
  "success": true,
  "data": {
    "id": "1",
    "nombre": "Patitas Felices",
    "direccion": "Bahía Blanca",
    "telefono": "2911234567",
    "descripcion": "Refugio dedicado al rescate de animales",
    "estado": "activo"
  }
}
```

### 4.2 Respuesta exitosa — GET listado

Código HTTP: 200 OK.

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "nombre": "Patitas Felices",
      "direccion": "Bahía Blanca",
      "telefono": "2911234567",
      "descripcion": "Refugio dedicado al rescate de animales",
      "estado": "activo"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### 4.3 Respuesta exitosa — POST

Código HTTP: 201 Created.

Devuelve el registro creado dentro de data,
incluyendo el id generado por el backend.

### 4.4 Respuesta exitosa — PUT y PATCH

Código HTTP: 200 OK.

Devuelven el registro completo actualizado
dentro de data.

### 4.5 Respuesta exitosa — DELETE

Código HTTP: 200 OK.

```json
{
  "success": true,
  "message": "Registro eliminado correctamente"
}
```

### 4.6 Respuesta de error

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "No se encontró el recurso solicitado"
  }
}
```

### 4.7 Códigos HTTP

| Código | Descripción |
| --- | --- |
| 200 OK | Operación exitosa |
| 201 Created | Registro creado |
| 400 Bad Request | Datos o parámetros inválidos |
| 404 Not Found | Recurso inexistente |
| 409 Conflict | Conflicto con datos relacionados |
| 500 Internal Server Error | Error interno del servidor |

## 5. Modelos y relaciones

Las interfaces TypeScript se encuentran en src/types/.

Los identificadores serán de tipo string.

Las relaciones se establecen mediante identificadores:

| Campo | Relación |
| --- | --- |
| Animal.refugioId | Refugio.id |
| Usuario.refugioId | Refugio.id |
| Solicitud.usuarioId | Usuario.id |
| Solicitud.animalId | Animal.id |
| Pregunta.encuestaId | Encuesta.id |
| Respuesta.encuestaId | Encuesta.id |
| Respuesta.preguntaId | Pregunta.id |
| Respuesta.usuarioId | Usuario.id |

Los estados permitidos son:

- Animal: disponible, en_proceso, adoptado.
- Refugio: activo, inactivo.
- Solicitud: pendiente, aprobada, rechazada.
- Encuesta: activa, inactiva.

Los roles de Usuario son:

- adoptante
- refugio
- administrador

## 6. Consideraciones del prototipo V1

La API utilizará mocks sin base de datos persistente.

Las operaciones de creación, modificación y
eliminación serán simuladas.

Los cambios realizados en memoria no se
conservarán al reiniciar el servidor.

Los contratos deberán compartirse entre
Valentina Vitale Haag y Alesio Fabián Cragno
antes de implementar las entidades.

La entidad Animal corresponde a Valentina
y la entidad Refugio corresponde a Alesio.
