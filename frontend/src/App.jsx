import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SalidaCard from "./components/SalidaCard.jsx";
import Filtros from "./components/Filtros.jsx";
import SalidaForm from "./components/SalidaForm.jsx";
import * as api from "./services/api.js";

const FILTROS_VACIOS = { destino: "", fecha: "", tipo: "", q: "" };

export default function App() {
  const [salidas, setSalidas] = useState([]);
  const [destinos, setDestinos] = useState([]);
  const [filtros, setFiltros] = useState(FILTROS_VACIOS);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [formAbierto, setFormAbierto] = useState(false);
  const [enEdicion, setEnEdicion] = useState(null);
  const [porEliminar, setPorEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [busquedaAbierta, setBusquedaAbierta] = useState(false);
  const inputBusqueda = useRef(null);

  const alternarBusqueda = () => {
    if (busquedaAbierta) setFiltros((f) => ({ ...f, q: "" })); // al cerrar, se limpia el texto
    setBusquedaAbierta((v) => !v);
  };

  // Al abrir el buscador, el cursor queda listo para escribir
  useEffect(() => {
    if (!busquedaAbierta) return undefined;
    const t = setTimeout(() => inputBusqueda.current?.focus(), 200);
    return () => clearTimeout(t);
  }, [busquedaAbierta]);

  const cargarDestinos = useCallback(async () => {
    try {
      setDestinos(await api.getDestinos());
    } catch {
      /* el error principal ya se muestra al cargar las salidas */
    }
  }, []);

  const cargarSalidas = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      setSalidas(await api.getSalidas(filtros));
    } catch (err) {
      setError(err.message);
      setSalidas([]);
    } finally {
      setCargando(false);
    }
  }, [filtros]);

  useEffect(() => {
    cargarDestinos();
  }, [cargarDestinos]);

  // Pequeña espera para no consultar la API en cada tecla al buscar por texto
  useEffect(() => {
    const t = setTimeout(cargarSalidas, 300);
    return () => clearTimeout(t);
  }, [cargarSalidas]);

  // Los mensajes de éxito desaparecen solos
  useEffect(() => {
    if (!mensaje) return undefined;
    const t = setTimeout(() => setMensaje(""), 3500);
    return () => clearTimeout(t);
  }, [mensaje]);

  const abrirNuevo = () => {
    setEnEdicion(null);
    setFormAbierto(true);
  };

  const abrirEdicion = (salida) => {
    setEnEdicion(salida);
    setFormAbierto(true);
  };

  const cerrarForm = () => {
    setFormAbierto(false);
    setEnEdicion(null);
  };

  const guardar = async (datos) => {
    if (enEdicion) {
      await api.actualizarSalida(enEdicion.id, datos);
      setMensaje("Salida actualizada correctamente");
    } else {
      await api.crearSalida(datos);
      setMensaje("Salida registrada correctamente");
    }
    cerrarForm();
    await Promise.all([cargarSalidas(), cargarDestinos()]);
  };

  const confirmarEliminar = async () => {
    setEliminando(true);
    try {
      await api.eliminarSalida(porEliminar.id);
      setMensaje("Salida eliminada");
      setPorEliminar(null);
      await Promise.all([cargarSalidas(), cargarDestinos()]);
    } catch (err) {
      setError(err.message);
      setPorEliminar(null);
    } finally {
      setEliminando(false);
    }
  };

  // Si el destino seleccionado ya no existe en la lista, se limpia
  useEffect(() => {
    if (filtros.destino && destinos.length > 0 && !destinos.includes(filtros.destino)) {
      setFiltros((f) => ({ ...f, destino: "" }));
    }
  }, [destinos, filtros.destino]);

  const hayFiltros = useMemo(
    () => Boolean(filtros.destino || filtros.fecha || filtros.tipo || filtros.q),
    [filtros]
  );

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-contenido">
          <div>
            <h1>
              <img src="/logo.png" alt="" className="logo" /> LanchaYa Iquitos
            </h1>
            <p className="subtitulo">Salidas fluviales desde Iquitos: horarios, puertos y precios</p>
          </div>
          <div className="topbar-acciones">
            <div className={`buscador ${busquedaAbierta ? "abierto" : ""}`}>
              <input
                ref={inputBusqueda}
                type="search"
                value={filtros.q}
                onChange={(e) => setFiltros((f) => ({ ...f, q: e.target.value }))}
                placeholder="Buscar empresa, destino, puerto…"
                aria-label="Buscar por empresa, embarcación, destino o puerto"
                tabIndex={busquedaAbierta ? 0 : -1}
              />
            </div>
            <button
              type="button"
              className={`btn-lupa ${busquedaAbierta ? "activa" : ""}`}
              onClick={alternarBusqueda}
              aria-label="Buscar"
              aria-expanded={busquedaAbierta}
              title="Buscar"
            >
              🔍
            </button>
            <button type="button" className="btn btn-primario" onClick={abrirNuevo}>
              + Registrar salida
            </button>
          </div>
        </div>
      </header>

      <main className="contenido">
        <div className="layout">
          <Filtros
            filtros={filtros}
            destinos={destinos}
            onChange={setFiltros}
            onLimpiar={() => setFiltros(FILTROS_VACIOS)}
          />

          <section className="resultados">
            {mensaje && <div className="alerta alerta-ok">{mensaje}</div>}

            {cargando && <div className="estado">Cargando salidas…</div>}

            {!cargando && error && (
              <div className="alerta alerta-error">
                <strong>Error:</strong> {error}
                <button type="button" className="btn btn-secundario btn-chico" onClick={cargarSalidas}>
                  Reintentar
                </button>
              </div>
            )}

            {!cargando && !error && salidas.length === 0 && (
              <div className="estado">
                {hayFiltros
                  ? "No hay salidas que coincidan con los filtros."
                  : "Todavía no hay salidas registradas."}
              </div>
            )}

            {!cargando && !error && salidas.length > 0 && (
              <>
                <p className="resumen">
                  {salidas.length} {salidas.length === 1 ? "salida encontrada" : "salidas encontradas"}
                </p>
                <div className="grilla">
                  {salidas.map((s) => (
                    <SalidaCard key={s.id} salida={s} onEditar={abrirEdicion} onEliminar={setPorEliminar} />
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {formAbierto && (
        <SalidaForm salida={enEdicion} destinos={destinos} onGuardar={guardar} onCancelar={cerrarForm} />
      )}

      {porEliminar && (
        <div className="modal-fondo" role="alertdialog" aria-modal="true" aria-labelledby="del-titulo">
          <div className="modal modal-chico">
            <h2 id="del-titulo">¿Eliminar salida?</h2>
            <p>
              Se eliminará la salida de <strong>{porEliminar.empresa}</strong> hacia{" "}
              <strong>{porEliminar.destino}</strong>. Esta acción no se puede deshacer.
            </p>
            <div className="modal-acciones">
              <button
                type="button"
                className="btn btn-secundario"
                onClick={() => setPorEliminar(null)}
                disabled={eliminando}
              >
                Cancelar
              </button>
              <button type="button" className="btn btn-peligro" onClick={confirmarEliminar} disabled={eliminando}>
                {eliminando ? "Eliminando…" : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="pie">Hecho en Iquitos · Precios referenciales, confirma en el puerto</footer>
    </div>
  );
}
