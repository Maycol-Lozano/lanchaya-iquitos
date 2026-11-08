const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "salidas.json");
const TIPOS_VALIDOS = ["lancha", "rapido", "deslizador"];

// ---------- Persistencia (archivo JSON) ----------

function leerSalidas() {
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  return JSON.parse(raw);
}

function guardarSalidas(salidas) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(salidas, null, 2), "utf8");
}

// ---------- Validación ----------

function textoValido(valor) {
  return typeof valor === "string" && valor.trim().length > 0;
}

function numeroValido(valor) {
  return typeof valor === "number" && Number.isFinite(valor);
}

/**
 * Valida el cuerpo de una salida. Devuelve un arreglo de mensajes de error
 * (vacío si todo está bien).
 * @param {object} body
 * @param {{ esNueva: boolean }} opciones  esNueva => fechaHora no puede estar en el pasado
 */
function validarSalida(body, { esNueva }) {
  const errores = [];

  if (!body || typeof body !== "object") {
    return ["El cuerpo de la petición es obligatorio"];
  }

  // Campos obligatorios
  for (const campo of ["empresa", "destino", "puerto", "fechaHora"]) {
    if (!textoValido(body[campo])) {
      errores.push(`El campo "${campo}" es obligatorio`);
    }
  }

  // precio > 0
  if (!numeroValido(body.precio) || body.precio <= 0) {
    errores.push('El campo "precio" debe ser un número mayor que 0');
  }

  // tipo
  if (!TIPOS_VALIDOS.includes(body.tipo)) {
    errores.push(`El campo "tipo" solo acepta: ${TIPOS_VALIDOS.join(", ")}`);
  }

  // fechaHora válida y no pasada al registrar
  if (textoValido(body.fechaHora)) {
    const fecha = new Date(body.fechaHora);
    if (Number.isNaN(fecha.getTime())) {
      errores.push('El campo "fechaHora" no tiene un formato de fecha válido (ISO 8601)');
    } else if (esNueva && fecha.getTime() < Date.now()) {
      errores.push('La "fechaHora" no puede estar en el pasado');
    }
  }

  // Opcionales: si vienen, deben ser números válidos
  if (body.duracionHoras !== undefined && (!numeroValido(body.duracionHoras) || body.duracionHoras <= 0)) {
    errores.push('El campo "duracionHoras" debe ser un número mayor que 0');
  }
  if (body.cupos !== undefined && (!numeroValido(body.cupos) || body.cupos < 0 || !Number.isInteger(body.cupos))) {
    errores.push('El campo "cupos" debe ser un entero mayor o igual a 0');
  }
  if (body.embarcacion !== undefined && typeof body.embarcacion !== "string") {
    errores.push('El campo "embarcacion" debe ser texto');
  }

  return errores;
}

// Deja solo los campos del modelo, con texto limpio
function normalizarSalida(body) {
  return {
    empresa: body.empresa.trim(),
    embarcacion: typeof body.embarcacion === "string" ? body.embarcacion.trim() : "",
    tipo: body.tipo,
    destino: body.destino.trim(),
    puerto: body.puerto.trim(),
    fechaHora: body.fechaHora.trim(),
    duracionHoras: body.duracionHoras !== undefined ? body.duracionHoras : 0,
    precio: body.precio,
    cupos: body.cupos !== undefined ? body.cupos : 0,
  };
}

function sinTildes(texto) {
  return String(texto).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

// ---------- Controladores ----------

// GET /api/salidas?destino=&fecha=&tipo=
function listarSalidas(req, res) {
  const { destino, fecha, tipo, q } = req.query;
  let salidas = leerSalidas();

  // Búsqueda por texto en empresa, embarcación, destino o puerto (sin distinguir tildes ni mayúsculas)
  if (q && q.trim()) {
    const buscado = sinTildes(q.trim());
    salidas = salidas.filter(
      (s) =>
        sinTildes(s.empresa).includes(buscado) ||
        sinTildes(s.embarcacion || "").includes(buscado) ||
        sinTildes(s.destino).includes(buscado) ||
        sinTildes(s.puerto).includes(buscado)
    );
  }

  if (destino) {
    salidas = salidas.filter((s) => sinTildes(s.destino) === sinTildes(destino));
  }
  if (fecha) {
    // fecha en formato YYYY-MM-DD
    salidas = salidas.filter((s) => s.fechaHora.slice(0, 10) === fecha);
  }
  if (tipo) {
    salidas = salidas.filter((s) => s.tipo === tipo);
  }

  // Orden por fecha más próxima
  salidas.sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));
  res.status(200).json(salidas);
}

// GET /api/salidas/:id
function obtenerSalida(req, res) {
  const id = Number(req.params.id);
  const salida = leerSalidas().find((s) => s.id === id);
  if (!salida) {
    return res.status(404).json({ error: `No existe la salida con id ${req.params.id}` });
  }
  res.status(200).json(salida);
}

// POST /api/salidas
function crearSalida(req, res) {
  const errores = validarSalida(req.body, { esNueva: true });
  if (errores.length > 0) {
    return res.status(400).json({ error: errores[0], errores });
  }

  const salidas = leerSalidas();
  const nuevoId = salidas.reduce((max, s) => Math.max(max, s.id), 0) + 1;
  const nueva = { id: nuevoId, ...normalizarSalida(req.body) };

  salidas.push(nueva);
  guardarSalidas(salidas);
  res.status(201).json(nueva);
}

// PUT /api/salidas/:id
function actualizarSalida(req, res) {
  const id = Number(req.params.id);
  const salidas = leerSalidas();
  const indice = salidas.findIndex((s) => s.id === id);
  if (indice === -1) {
    return res.status(404).json({ error: `No existe la salida con id ${req.params.id}` });
  }

  // Al editar se permite conservar una fecha ya pasada; solo se rechaza
  // si el usuario la cambia a una fecha pasada.
  const fechaCambio = req.body && req.body.fechaHora !== salidas[indice].fechaHora;
  const errores = validarSalida(req.body, { esNueva: fechaCambio });
  if (errores.length > 0) {
    return res.status(400).json({ error: errores[0], errores });
  }

  const actualizada = { id, ...normalizarSalida(req.body) };
  salidas[indice] = actualizada;
  guardarSalidas(salidas);
  res.status(200).json(actualizada);
}

// DELETE /api/salidas/:id
function eliminarSalida(req, res) {
  const id = Number(req.params.id);
  const salidas = leerSalidas();
  const indice = salidas.findIndex((s) => s.id === id);
  if (indice === -1) {
    return res.status(404).json({ error: `No existe la salida con id ${req.params.id}` });
  }
  salidas.splice(indice, 1);
  guardarSalidas(salidas);
  res.status(204).send();
}

// GET /api/destinos
function listarDestinos(req, res) {
  const destinos = [...new Set(leerSalidas().map((s) => s.destino))].sort((a, b) =>
    a.localeCompare(b, "es")
  );
  res.status(200).json(destinos);
}

module.exports = {
  listarSalidas,
  obtenerSalida,
  crearSalida,
  actualizarSalida,
  eliminarSalida,
  listarDestinos,
};