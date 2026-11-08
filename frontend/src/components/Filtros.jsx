export default function Filtros({ filtros, destinos, onChange, onLimpiar }) {
  const hayFiltros = filtros.destino || filtros.fecha || filtros.tipo || filtros.q;

  const manejar = (e) => onChange({ ...filtros, [e.target.name]: e.target.value });

  return (
    <section className="filtros" aria-label="Filtros de búsqueda">
      <div className="campo">
        <label htmlFor="f-destino">Destino</label>
        <select id="f-destino" name="destino" value={filtros.destino} onChange={manejar}>
          <option value="">Todos los destinos</option>
          {destinos.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="campo">
        <label htmlFor="f-fecha">Fecha</label>
        <input id="f-fecha" type="date" name="fecha" value={filtros.fecha} onChange={manejar} />
      </div>

      <div className="campo">
        <label htmlFor="f-tipo">Tipo de embarcación</label>
        <select id="f-tipo" name="tipo" value={filtros.tipo} onChange={manejar}>
          <option value="">Todos los tipos</option>
          <option value="lancha">Lancha</option>
          <option value="rapido">Rápido</option>
          <option value="deslizador">Deslizador</option>
        </select>
      </div>

      <button type="button" className="btn btn-secundario" onClick={onLimpiar} disabled={!hayFiltros}>
        Limpiar filtros
      </button>
    </section>
  );
}
