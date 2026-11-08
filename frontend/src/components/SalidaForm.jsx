import { useState } from "react";

const VACIO = {
  empresa: "",
  embarcacion: "",
  tipo: "",
  destino: "",
  puerto: "",
  fechaHora: "",
  duracionHoras: "",
  precio: "",
  cupos: "",
};

function aFormulario(salida) {
  if (!salida) return VACIO;
  return {
    empresa: salida.empresa ?? "",
    embarcacion: salida.embarcacion ?? "",
    tipo: salida.tipo ?? "",
    destino: salida.destino ?? "",
    puerto: salida.puerto ?? "",
    fechaHora: salida.fechaHora ? salida.fechaHora.slice(0, 16) : "",
    duracionHoras: salida.duracionHoras ?? "",
    precio: salida.precio ?? "",
    cupos: salida.cupos ?? "",
  };
}

// Valida en el frontend las mismas reglas que el backend
function validar(valores, esEdicion, fechaOriginal) {
  const errores = {};

  if (!valores.empresa.trim()) errores.empresa = "La empresa es obligatoria";
  if (!valores.destino.trim()) errores.destino = "El destino es obligatorio";
  if (!valores.puerto.trim()) errores.puerto = "El puerto es obligatorio";

  if (!valores.tipo) errores.tipo = "Selecciona un tipo de embarcación";

  if (!valores.fechaHora) {
    errores.fechaHora = "La fecha y hora son obligatorias";
  } else {
    const cambio = !esEdicion || valores.fechaHora !== fechaOriginal;
    if (cambio && new Date(valores.fechaHora).getTime() < Date.now()) {
      errores.fechaHora = "La fecha y hora no pueden estar en el pasado";
    }
  }

  const precio = Number(valores.precio);
  if (valores.precio === "" || !Number.isFinite(precio) || precio <= 0) {
    errores.precio = "El precio debe ser un número mayor que 0";
  }

  if (valores.duracionHoras !== "" && !(Number(valores.duracionHoras) > 0)) {
    errores.duracionHoras = "La duración debe ser mayor que 0";
  }

  if (valores.cupos !== "") {
    const c = Number(valores.cupos);
    if (!Number.isInteger(c) || c < 0) errores.cupos = "Los cupos deben ser un entero igual o mayor a 0";
  }

  return errores;
}

export default function SalidaForm({ salida, destinos, onGuardar, onCancelar }) {
  const esEdicion = Boolean(salida);
  const [valores, setValores] = useState(aFormulario(salida));
  const [errores, setErrores] = useState({});
  const [errorServidor, setErrorServidor] = useState("");
  const [enviando, setEnviando] = useState(false);

  const manejar = (e) => {
    const { name, value } = e.target;
    setValores((v) => ({ ...v, [name]: value }));
    if (errores[name]) setErrores((er) => ({ ...er, [name]: undefined }));
  };

  const enviar = async (e) => {
    e.preventDefault();
    setErrorServidor("");

    const errs = validar(valores, esEdicion, salida?.fechaHora?.slice(0, 16));
    setErrores(errs);
    if (Object.keys(errs).length > 0) return;

    const datos = {
      empresa: valores.empresa.trim(),
      embarcacion: valores.embarcacion.trim(),
      tipo: valores.tipo,
      destino: valores.destino.trim(),
      puerto: valores.puerto.trim(),
      fechaHora: valores.fechaHora,
      precio: Number(valores.precio),
    };
    if (valores.duracionHoras !== "") datos.duracionHoras = Number(valores.duracionHoras);
    if (valores.cupos !== "") datos.cupos = Number(valores.cupos);

    setEnviando(true);
    try {
      await onGuardar(datos);
    } catch (err) {
      setErrorServidor(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const campo = (name, label, props = {}) => (
    <div className={`campo ${errores[name] ? "campo-error" : ""}`}>
      <label htmlFor={`sf-${name}`}>{label}</label>
      <input id={`sf-${name}`} name={name} value={valores[name]} onChange={manejar} {...props} />
      {errores[name] && <span className="error-texto">{errores[name]}</span>}
    </div>
  );

  return (
    <div className="modal-fondo" role="dialog" aria-modal="true" aria-labelledby="form-titulo">
      <form className="modal" onSubmit={enviar} noValidate>
        <h2 id="form-titulo">{esEdicion ? "Editar salida" : "Registrar salida"}</h2>

        {errorServidor && <div className="alerta alerta-error">{errorServidor}</div>}

        {campo("empresa", "Empresa *", { type: "text", placeholder: "Ej. Transportes Río Itaya" })}
        {campo("embarcacion", "Embarcación", { type: "text", placeholder: "Ej. Don José II" })}

        <div className={`campo ${errores.tipo ? "campo-error" : ""}`}>
          <label htmlFor="sf-tipo">Tipo *</label>
          <select id="sf-tipo" name="tipo" value={valores.tipo} onChange={manejar}>
            <option value="">Selecciona…</option>
            <option value="lancha">Lancha</option>
            <option value="rapido">Rápido</option>
            <option value="deslizador">Deslizador</option>
          </select>
          {errores.tipo && <span className="error-texto">{errores.tipo}</span>}
        </div>

        <div className={`campo ${errores.destino ? "campo-error" : ""}`}>
          <label htmlFor="sf-destino">Destino *</label>
          <input
            id="sf-destino"
            name="destino"
            type="text"
            list="lista-destinos"
            value={valores.destino}
            onChange={manejar}
            placeholder="Ej. Nauta"
          />
          <datalist id="lista-destinos">
            {destinos.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
          {errores.destino && <span className="error-texto">{errores.destino}</span>}
        </div>

        {campo("puerto", "Puerto de salida *", { type: "text", placeholder: "Ej. Puerto Henry" })}
        {campo("fechaHora", "Fecha y hora *", { type: "datetime-local" })}

        <div className="fila-2">
          {campo("precio", "Precio (S/) *", { type: "number", min: "0", step: "0.5", inputMode: "decimal" })}
          {campo("duracionHoras", "Duración (horas)", { type: "number", min: "0", step: "0.5", inputMode: "decimal" })}
        </div>

        {campo("cupos", "Cupos disponibles", { type: "number", min: "0", step: "1", inputMode: "numeric" })}

        <div className="modal-acciones">
          <button type="button" className="btn btn-secundario" onClick={onCancelar} disabled={enviando}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primario" disabled={enviando}>
            {enviando ? "Guardando…" : esEdicion ? "Guardar cambios" : "Registrar"}
          </button>
        </div>
      </form>
    </div>
  );
}
