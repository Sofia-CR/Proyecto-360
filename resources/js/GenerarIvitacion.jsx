import React, { useState, useEffect } from 'react';

function GenerarInvitacion() {
  const [rol, setRol] = useState('Usuario');
  const [departamentos, setDepartamentos] = useState([]);
  const [idDepartamento, setIdDepartamento] = useState('');
  const [cantidad, setCantidad] = useState(1); // cantidad máxima de usos
  const [link, setLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/departamentos')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP status ${res.status}`);
        return res.json();
      })
      .then(data => {
        setDepartamentos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetch departamentos:', err);
        setError('No se pudieron cargar los departamentos');
        setLoading(false);
      });
  }, []);

  const handleGenerar = async () => {
    if (!idDepartamento) {
      alert('Selecciona un departamento');
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/api/invitaciones/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rol,
          id_departamento: idDepartamento,
          creado_por: 1,
          max_usos: cantidad // nuevo campo
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setLink(data.link);
        alert('Invitación generada correctamente');
      } else {
        console.log(data.error)
        alert('Error al generar invitación: ' + (data.error || ''));
      }
    } catch (err) {
      console.error('Error de conexión:', err);
      alert('Error de conexión al servidor');
    }
  };

  const handleCopiar = () => {
    if (link) {
      navigator.clipboard.writeText(link);
      alert('Link copiado al portapapeles');
    }
  };

  return (
    <div>
      <h2>Generar Invitación</h2>

      <label>Rol:</label>
      <select value={rol} onChange={e => setRol(e.target.value)}>
        <option value="Usuario">Usuario</option>
        <option value="Administrador">Administrador</option>
        <option value="Jefe">Jefe</option>
      </select>

      <label>Departamento:</label>
      {loading ? (
        <p>Cargando departamentos...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <select value={idDepartamento} onChange={e => setIdDepartamento(e.target.value)}>
          <option value="">Selecciona departamento</option>
          {departamentos.map(dep => (
            <option key={dep.id_departamento} value={dep.id_departamento}>
              {dep.d_nombre}
            </option>
          ))}
        </select>
      )}

      <label>Cantidad máxima de registros:</label>
      <input
        type="number"
        value={cantidad}
        min={1}
        onChange={e => setCantidad(parseInt(e.target.value))}
      />

      <button onClick={handleGenerar} style={{ marginTop: '10px' }}>
        Generar Link
      </button>

      {link && (
        <div style={{ marginTop: '10px' }}>
          <p>Link de invitación:</p>
          <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
          <br />
          <button onClick={handleCopiar} style={{ marginTop: '5px' }}>Copiar Link</button>
        </div>
      )}
    </div>
  );
}

export default GenerarInvitacion;
