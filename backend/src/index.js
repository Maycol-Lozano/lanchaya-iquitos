const express = require("express");
const cors = require("cors");
const salidasRouter = require("./routes/salidas");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ nombre: "LanchaYa Iquitos API", estado: "ok" });
});

app.use("/api", salidasRouter);

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Middleware de manejo de errores
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // JSON mal formado enviado por el cliente
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El cuerpo de la petición no es un JSON válido" });
  }
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`LanchaYa API escuchando en http://localhost:${PORT}`);
});
