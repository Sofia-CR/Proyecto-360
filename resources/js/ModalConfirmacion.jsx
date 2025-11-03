import React from "react";

function ModalConfirmacion({
  mostrar,
  onCerrar,
  onConfirmar,
  titulo,
  mensaje,
  icono
}) {
  if (!mostrar) return null;

  return (
    <>
      <div className="modal-backdrop-custom" onClick={onCerrar}></div>
      <div className="modal-container-custom">
        <div className="modal-content-custom">
          <button className="btn-close-custom" onClick={onCerrar}>
            &times;
          </button>
          <div className="modal-header-custom">
            {icono && <span>{icono}</span>}
            {titulo}
          </div>

          <div className="modal-body-custom">
            <p>{mensaje}</p>
            <p style={{ color: "#861542", fontWeight: "bold" }}>
              Esta acción no se puede deshacer.
            </p>
          </div>
          <div className="modal-footer-custom">
            <button
              className="btn-custom"
              onClick={onCerrar}
            >
              No
            </button>
            <button className="btn-custom" onClick={onConfirmar}>
              Sí
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default ModalConfirmacion;

