import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const http = axios.create({ baseURL: API_URL, timeout: 8000 });

/**
 * Convierte un error de axios en un Error con mensaje legible en español.
 * - Sin respuesta del servidor => error de conexión.
 * - Con respuesta => usa el mensaje que envía el backend (400, 404, ...).
 */
function traducirError(err) {
  if (err.response) {
    const msg = err.response.data?.error || `Error del servidor (${err.response.status})`;
    const e = new Error(msg);
    e.status = err.response.status;
    return e;
  }
  const e = new Error("No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.");
  e.status = 0;
  return e;
}

async function pedir(promesa) {
  try {
    const res = await promesa;
    return res.data;
  } catch (err) {
    throw traducirError(err);
  }
}

export function getSalidas({ destino, fecha, tipo, q } = {}) {
  const params = {};
  if (q && q.trim()) params.q = q.trim();
  if (destino) params.destino = destino;
  if (fecha) params.fecha = fecha;
  if (tipo) params.tipo = tipo;
  return pedir(http.get("/salidas", { params }));
}

export function getDestinos() {
  return pedir(http.get("/destinos"));
}

export function crearSalida(datos) {
  return pedir(http.post("/salidas", datos));
}

export function actualizarSalida(id, datos) {
  return pedir(http.put(`/salidas/${id}`, datos));
}

export function eliminarSalida(id) {
  return pedir(http.delete(`/salidas/${id}`));
}
