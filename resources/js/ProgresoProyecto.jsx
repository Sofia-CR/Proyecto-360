import React from "react";
import "../css/ProgresoProyecto.css";

export default function ProgresoProyecto({ progresoInicial, tareasTotales, tareasCompletadas }) {
  const p = Number(progresoInicial) || 0;

  const getColorProgreso = () => {
    if (p < 50) return "linear-gradient(90deg, #d9534f, #ff9999)";
    if (p < 80) return "linear-gradient(90deg, #ffcc00, #ffd633)";
    return "linear-gradient(90deg, #2ecc71, #27ae60)";

  };

  return (
    <div className="contenedor-progreso-chart">
      {tareasTotales > 0 && (
        <>
          <div className="barra-fondo" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={p}>
            <div
              className="barra-progreso"
              style={{
                width: `${p}%`,
                background: getColorProgreso(),
              }}
            >
              <span className="porcentaje-en-barra">{p}%</span>
            </div>
          </div>

          <div className="info-burbujas">
            <span className="chip completadas">✅ {tareasCompletadas} completadas</span>
            <span className="chip pendientes">🕒 {tareasTotales - tareasCompletadas} pendientes</span>
            <span className="chip porcentaje">📊 {p}% de avance</span>
          </div>
        </>
      )}
    </div>
  );
}
