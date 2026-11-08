const ETIQUETAS_TIPO = {
  lancha: "Lancha",
  rapido: "Rápido",
  deslizador: "Deslizador",
};

function formatearFecha(fechaHora) {
  const d = new Date(fechaHora);
  const fecha = d.toLocaleDateString("es-PE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const hora = d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: true });
  return { fecha, hora };
}

function formatearDuracion(horas) {
  if (!horas) return null;
  if (horas >= 24) {
    const dias = Math.round((horas / 24) * 10) / 10;
    return `${horas} h (~${dias} días)`;
  }
  return `${horas} h`;
}

// Semáforo de cupos: rojo (agotado/pocos), amarillo (medio), verde (suficientes)
function nivelCupos(cupos) {
  if (cupos <= 0) return { clase: "rojo", texto: "Agotado" };
  if (cupos <= 10) return { clase: "rojo", texto: `${cupos} cupos` };
  if (cupos <= 25) return { clase: "amarillo", texto: `${cupos} cupos` };
  return { clase: "verde", texto: `${cupos} cupos` };
}

export default function SalidaCard({ salida, onEditar, onEliminar }) {
  const { fecha, hora } = formatearFecha(salida.fechaHora);
  const cupos = nivelCupos(salida.cupos);
  const duracion = formatearDuracion(salida.duracionHoras);

  return (
    <article className="card">
      <header className="card-header">
        <div>
          <h3 className="card-destino">{salida.destino}</h3>
          <p className="card-empresa">
            {salida.empresa}
            {salida.embarcacion ? ` · ${salida.embarcacion}` : ""}
          </p>
        </div>
        <span className={`badge badge-${salida.tipo}`}>{ETIQUETAS_TIPO[salida.tipo] || salida.tipo}</span>
      </header>

      <dl className="card-datos">
        <div>
          <dt>Fecha</dt>
          <dd>{fecha}</dd>
        </div>
        <div>
          <dt>Hora</dt>
          <dd>{hora}</dd>
        </div>
        <div>
          <dt>Puerto</dt>
          <dd>{salida.puerto}</dd>
        </div>
        {duracion && (
          <div>
            <dt>Duración</dt>
            <dd>{duracion}</dd>
          </div>
        )}
      </dl>

      <footer className="card-footer">
        <span className="precio">S/ {Number(salida.precio).toFixed(2)}</span>
        <span className={`cupos cupos-${cupos.clase}`}>{cupos.texto}</span>
      </footer>

      <div className="card-acciones">
        <button type="button" className="btn btn-secundario" onClick={() => onEditar(salida)}>
          Editar
        </button>
        <button type="button" className="btn btn-peligro" onClick={() => onEliminar(salida)}>
          Eliminar
        </button>
      </div>
    </article>
  );
}
