# 🚤 LanchaYa Iquitos

Aplicación web full stack donde las empresas fluviales registran sus salidas desde Iquitos y los pasajeros las consultan y filtran por **destino**, **fecha** y **tipo de embarcación**.

- **Backend:** Node.js 20 + Express 4 (API REST, persistencia en archivo JSON)
- **Frontend:** React 18 + Vite + axios

## Integrantes

- Christian Arévalo Jesús
- _(agrega aquí a tu pareja, si aplica)_

## Requisitos

- Node.js 20 o superior
- npm

## Estructura

```
lanchaya/
├── backend/
│   ├── src/
│   │   ├── index.js                      # arranque del servidor (puerto 3000)
│   │   ├── routes/salidas.js
│   │   ├── controllers/salidas.controller.js
│   │   └── data/salidas.json             # 12 salidas semilla
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/                   # SalidaCard, Filtros, SalidaForm
│   │   └── services/api.js
│   └── package.json
└── README.md
```

## Instalación y ejecución

Abre **dos terminales**.

### 1. Backend (puerto 3000)

```bash
cd backend
npm install
npm run dev      # con nodemon (recarga automática)
# o: npm start   # sin nodemon
```

### 2. Frontend (puerto 5173)

```bash
cd frontend
npm install
npm run dev
```

Abre <http://localhost:5173>. El frontend se conecta a `http://localhost:3000/api`
(se puede cambiar con la variable `VITE_API_URL`, ver `frontend/.env.example`).

## API REST

| Método | Ruta                | Descripción                                          | Respuesta           |
| ------ | ------------------- | ---------------------------------------------------- | ------------------- |
| GET    | `/api/salidas`      | Lista salidas; acepta `?destino=`, `?fecha=`, `?tipo=` y `?q=` (búsqueda por empresa o embarcación) | 200 + arreglo       |
| GET    | `/api/salidas/:id`  | Detalle de una salida                                | 200 o 404           |
| POST   | `/api/salidas`      | Registra una salida                                  | 201 + objeto creado |
| PUT    | `/api/salidas/:id`  | Actualiza una salida                                 | 200 o 404           |
| DELETE | `/api/salidas/:id`  | Elimina una salida                                   | 204 o 404           |
| GET    | `/api/destinos`     | Lista de destinos sin repetir                        | 200 + arreglo       |

El listado se devuelve ordenado por fecha más próxima. La fecha del filtro usa el formato `YYYY-MM-DD`.

### Validaciones (responden `400` con un mensaje claro)

- `empresa`, `destino`, `puerto` y `fechaHora` son obligatorios.
- `precio` es un número mayor que 0.
- `tipo` solo acepta: `lancha`, `rapido`, `deslizador`.
- `fechaHora` no puede estar en el pasado al registrar.

Ejemplo de error:

```json
{ "error": "El campo \"precio\" debe ser un número mayor que 0", "errores": ["..."] }
```

### Ejemplos rápidos (curl)

```bash
curl "http://localhost:3000/api/salidas?destino=Nauta&tipo=rapido"
curl http://localhost:3000/api/destinos

curl -X POST http://localhost:3000/api/salidas \
  -H "Content-Type: application/json" \
  -d '{"empresa":"Fluvial Amazonas","embarcacion":"Eduardo VII","tipo":"lancha","destino":"Yurimaguas","puerto":"Puerto Henry","fechaHora":"2026-12-20T18:00","duracionHoras":72,"precio":120,"cupos":150}'
```

> Nota: si registras salidas con la fecha de hoy o anteriores, la API responde 400. Usa fechas futuras.

## Funcionalidades del frontend

- Listado en tarjetas ordenado por fecha más próxima.
- Filtros por destino (cargado desde `/api/destinos`), fecha y tipo, con botón **Limpiar filtros**.
- Formulario de registro y edición con validación antes de enviar.
- Eliminación con confirmación.
- Estados de carga, lista vacía y error de conexión (con botón Reintentar).
- Diseño responsive pensado para consultar desde el celular.
- Extra: indicador de cupos con color (verde / amarillo / rojo).
- Extra: búsqueda por texto de empresa o embarcación.

## Entrega

Crear el ZIP **sin** `node_modules`, con el nombre `S#_ProyectoFullStack_Apellidos`, por ejemplo `S12_ProyectoFullStack_Arevalo_Jesus.zip`.
