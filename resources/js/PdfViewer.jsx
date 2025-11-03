import React from "react";

function PdfViewer({ pdfUrl, fileName = "Reporte.pdf", onClose }) {
  if (!pdfUrl) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        padding: "10px",
      }}
    >
      <div
        style={{
          width: "80%",
          height: "95%",
          maxWidth: "900px",
          maxHeight: "1200px",
          backgroundColor: "#fff",
          padding: "10px",
          boxShadow: "0 0 20px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            display: "flex",
    justifyContent: "center", 
    gap: "15px",
    marginBottom: "10px",
          }}
        >
          <button
            onClick={onClose}
            style={{
                backgroundColor: "#fff",
              color: "#fff",
              color: "#861542",
              fontWeight: "bold",
              padding: "5px 10px",
              border: "1px solid #861542",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Cerrar
          </button>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: "none",
              color: "#861542",
              fontWeight: "bold",
              padding: "5px 10px",
              border: "1px solid #861542",
              borderRadius: "4px",
            }}
          >
            Abrir en nueva pestaña
          </a>
          <a
            href={pdfUrl}
            download={fileName}
            style={{
              textDecoration: "none",
              color: "#861542",
              fontWeight: "bold",
              padding: "5px 10px",
              border: "1px solid #861542",
              borderRadius: "4px",
            }}
          >
            Descargar PDF
          </a>
        </div>
        <iframe
          src={pdfUrl}
          title="PDF Viewer"
          width="100%"
          height="100%"
          style={{ border: "none", flex: 1, backgroundColor: "#fff" }}
        />
      </div>
    </div>
  );
}

export default PdfViewer;
