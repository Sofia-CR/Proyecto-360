import React, { useState } from "react";
import "../css/Home.css";

function Home() {
  const [departamento, setDepartamento] = useState("CULTURA");

  // Lista de departamentos para simular el cambio
  const departamentos = ["CULTURA", "OBRA PÚBLICA", "EDUCACIÓN", "DEPORTE"];

  return (
    <div className="home-app">
      {/* Barra superior */}
      <div className="home-barra">
        <svg
          className="home-icono-casa"
          viewBox="0 0 24 24"
          onClick={() => setDepartamento("CULTURA")}
        >
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
        <span className="home-proyectos-titulo-barra">
          DEPARTAMENTO DE {departamento}
        </span>
      </div>

      {/* Contenido */}
      <div className="home-contenido">
        <h1 className="home-h1">Selecciona un departamento:</h1>
        <div className="home-lista-proyectos">
          {departamentos.map((dep) => (
            <div
              key={dep}
              className="home-proyecto-card"
              onClick={() => setDepartamento(dep)}
              style={{ cursor: "pointer" }}
            >
              <h2>{dep}</h2>
              <p>Haz clic para entrar al departamento de {dep.toLowerCase()}.</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;
