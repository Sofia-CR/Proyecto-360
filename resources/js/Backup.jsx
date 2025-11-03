import Header from "./Header";
import React, { useState } from "react";
import "../css/Backup.css";

function Backup() {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(""); // <-- para mostrar mensaje en la UI

 const handleGenerar = async () => {
  setLoading(true);
  setMensaje("");
  
  try {
    
    const res = await fetch("/api/realizar-copia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    
    const text = await res.text();

    let data;

    try {
      data = JSON.parse(text);
     
    } catch (parseError) {
      throw { message: "Respuesta inesperada del servidor", backend: text };
    }

    if (!res.ok) {
      throw { 
        message: data.message || `Error ${res.status}`, 
        backend: data,
        status: res.status
      };
    }
    setMensaje(data.message);
    
  } catch (err) {
    console.error("Error completo:", err);
    console.dir(err);
  }
  setLoading(false);
};

  return (
    <div className="container-fluid p-0 app-global">
      <Header />
      <div className="backup-container">
        <button
          type="button"
          className="btn-form"
          onClick={handleGenerar}
          disabled={loading}
        >
          {loading && (
            <span
              className="spinner-border spinner-border-sm me-2"
              role="status"
              aria-hidden="true"
            ></span>
          )}
          {loading ? "Generando" : "Generar copia de seguridad"}
        </button>

        {mensaje && (
          <div className="backup-mensaje mt-3">
            {mensaje}
          </div>
        )}
      </div>
    </div>
  );
}

export default Backup;

