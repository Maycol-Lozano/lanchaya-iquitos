# 🚤 LanchaYa Iquitos

Aplicación web full stack donde las empresas fluviales registran sus salidas desde Iquitos y los pasajeros las consultan y filtran por **destino**, **fecha** y **tipo de embarcación**.

**Problema que resuelve:** en Iquitos no hay un lugar único y confiable para saber qué lanchas y rápidos salen, a qué hora, a qué destino y cuánto cuesta el pasaje. Hoy esa información se consigue yendo a los puertos o por publicaciones sueltas. LanchaYa la reúne en un solo lugar, consultable desde el celular.

- **Backend:** Node.js 20 + Express 4 (API REST, persistencia en archivo JSON)
- **Frontend:** React 18 + Vite + axios

## Integrantes

- Maycol j. lozano Yuimachi


## Repositorio

https://github.com/Maycol-Lozano/lanchaya-iquitos

## Requisitos

- Node.js 20 o superior (incluye npm). Comprobar con `node -v` y `npm -v`.
- Git, solo si se va a clonar el repositorio.

## Estructura del proyecto

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
│   ├── public/                           # logo y fondo
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/                   # SalidaCard, Filtros, SalidaForm
│   │   └── services/api.js
│   └── package.json
└── README.md
```

## Instalación y ejecución

Se necesitan **dos terminales abiertas a la vez**: una para el backend y otra para el frontend.

### 0. Obtener el proyecto

```bash
git clone https://github.com/Maycol-Lozano/lanchaya-iquitos.git
cd lanchaya-iquitos
```

(O descomprimir el ZIP de la entrega.)

### 1. Backend (puerto 3000)

```bash
cd backend
npm install
npm run dev      # con nodemon (recarga automática)
# o: npm start   # sin nodemon
```

Debe mostrar: `LanchaYa API escuchando en http://localhost:3000`

### 2. Frontend (puerto 5173)

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abrir <http://localhost:5173> en el navegador.

El frontend se conecta por defecto a `http://localhost:3000/api`. Se puede cambiar con la variable `VITE_API_URL` (ver `frontend/.env.example`).

## API REST

| Método | Ruta               | Descripción                                                                 | Respuesta           |
| ------ | ------------------ | --------------------------------------------------------------------------- | ------------------- |
| GET    | `/api/salidas`     | Lista salidas; acepta `?destino=`, `?fecha=`, `?tipo=` y `?q=` (texto)      | 200 + arreglo       |
| GET    | `/api/salidas/:id` | Detalle de una salida                                                       | 200 o 404           |
| POST   | `/api/salidas`     | Registra una salida                                                         | 201 + objeto creado |
| PUT    | `/api/salidas/:id` | Actualiza una salida                                                        | 200 o 404           |
| DELETE | `/api/salidas/:id` | Elimina una salida                                                          | 204 o 404           |
| GET    | `/api/destinos`    | Lista de destinos sin repetir                                               | 200 + arreglo       |

- El listado se devuelve **ordenado por fecha más próxima**.
- El filtro `fecha` usa el formato `YYYY-MM-DD`.
- El filtro `q` busca por empresa, embarcación, destino o puerto, sin distinguir mayúsculas ni tildes.
- Los filtros se pueden combinar: `/api/salidas?destino=Nauta&tipo=rapido`.

### Modelo de datos: Salida

| Campo         | Tipo                         | Ejemplo               |
| ------------- | ---------------------------- | --------------------- |
| id            | número (autogenerado)        | 1                     |
| empresa       | texto                        | Transportes Río Itaya |
| embarcacion   | texto                        | Don José II           |
| tipo          | lancha / rapido / deslizador | rapido                |
| destino       | texto                        | Nauta                 |
| puerto        | texto                        | Puerto Productores    |
| fechaHora     | texto ISO 8601               | 2026-11-09T06:30      |
| duracionHoras | número                       | 2                     |
| precio        | número (S/)                  | 20                    |
| cupos         | número                       | 30                    |

### Validaciones (responden `400` con un mensaje claro)

- `empresa`, `destino`, `puerto` y `fechaHora` son obligatorios.
- `precio` es un número mayor que 0.
- `tipo` solo acepta: `lancha`, `rapido`, `deslizador`.
- `fechaHora` no puede estar en el pasado al registrar.

Ejemplo de respuesta de error:

```json
{
  "error": "El campo \"precio\" debe ser un número mayor que 0",
  "errores": ["El campo \"precio\" debe ser un número mayor que 0"]
}
```

### Ejemplos rápidos

```bash
# Listar con filtros
curl "http://localhost:3000/api/salidas?destino=Nauta&tipo=rapido"

# Destinos
curl http://localhost:3000/api/destinos

# Registrar una salida
curl -X POST http://localhost:3000/api/salidas \
  -H "Content-Type: application/json" \
  -d '{"empresa":"Fluvial Amazonas","embarcacion":"Eduardo VII","tipo":"lancha","destino":"Yurimaguas","puerto":"Puerto Henry","fechaHora":"2026-12-20T18:00","duracionHoras":72,"precio":120,"cupos":150}'
```

> Nota: al registrar, la `fechaHora` debe ser futura; si no, la API responde 400.

Las rutas también se pueden probar con Thunder Client o Postman usando las mismas direcciones y métodos de la tabla.

## Funcionalidades del frontend

- Listado en tarjetas con empresa, destino, puerto, fecha y hora, precio y tipo, ordenado por fecha más próxima.
- **Filtros** por destino (cargado desde `/api/destinos`), fecha y tipo, con botón **Limpiar filtros**.
- **Formulario** de registro y edición, con validación antes de enviar.
- **Eliminar** con confirmación.
- Mensajes de **carga**, **lista vacía** y **error de conexión** (con botón Reintentar).
- Diseño **responsive**, pensado para consultar desde el celular en el puerto.

### Extras (retos opcionales)

- Indicador de cupos con color: verde (muchos), amarillo (pocos), rojo (casi agotado) y "Agotado".
- Búsqueda por texto desde la lupa del encabezado (empresa, embarcación, destino o puerto).

## Persistencia

Los datos se guardan en `backend/src/data/salidas.json`. El archivo incluye 12 salidas de ejemplo (empresas ficticias y precios referenciales). Las salidas que se registran, editan o eliminan desde la aplicación modifican este archivo.

## Alcance

Incluye: API REST con CRUD completo, listado de destinos, filtros, validaciones y frontend en React.
No incluye: login, pagos, venta de pasajes ni despliegue en la nube.