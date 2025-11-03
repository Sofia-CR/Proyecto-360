import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/App.css';
import logo1 from '../imagenes/logo1.png';
import logo2 from '../imagenes/logo2.png';
import logo3 from '../imagenes/logo3.png';

function RegistroPaso2() {
  const location = useLocation();
  const navigate = useNavigate();

  // Datos enviados desde RegistroPaso1
  const { correo, password, token: tokenInvitacion } = location.state || {};

  // Redirigir si no hay datos del paso 1
  useEffect(() => {
    if (!correo || !password || !tokenInvitacion) {
      alert('Debes completar primero el Paso 1');
      navigate(`/RegistroPaso1/${tokenInvitacion || ''}`);
    }
  }, [correo, password, tokenInvitacion, navigate]);

  // Estados para los campos del formulario
  const [nombre, setNombre] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tokenVerificacion, setTokenVerificacion] = useState('');

  // Mensajes de error y éxito
  const [errorMsg, setErrorMsg] = useState('');
  const [exitoMsg, setExitoMsg] = useState('');

  // Función para completar el registro
  const handleRegistroFinal = async () => {
    setErrorMsg('');
    setExitoMsg('');

    // 1️⃣ Validación local de campos obligatorios
    if (!nombre || !apellidoPaterno || !correo || !password || !tokenVerificacion) {
      setErrorMsg('❌ Por favor completa todos los campos requeridos');
      return;
    }

    // 2️⃣ Validar formato del token: 8 caracteres alfanuméricos
    if (!/^[A-Za-z0-9]{8}$/.test(tokenVerificacion.trim())) {
      setErrorMsg('❌ El token debe tener 8 caracteres alfanuméricos');
      return;
    }

    try {
      // 3️⃣ Enviar datos al backend
      const res = await fetch('http://127.0.0.1:8000/api/RegistroPaso2/invitado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json' // clave para que Laravel devuelva JSON
        },
        body: JSON.stringify({
          correo,
          password,
          nombre: nombre.trim(),
          apellidoPaterno: apellidoPaterno.trim(),
          apellidoMaterno: apellidoMaterno.trim() || "",
          telefono: telefono.trim(),
          token_verificacion: tokenVerificacion.trim(),
          token_invitacion: tokenInvitacion,
        }),
      });

      const data = await res.json();

      // 4️⃣ Manejar errores del backend
      if (!res.ok) {
        // a) Validaciones de Laravel
        if (data.errors) {
          const errores = Object.values(data.errors).flat().join(' | ');
          setErrorMsg(`❌ ${errores}`);
          return;
        }

        // b) Errores definidos por el backend
        switch (data.error) {
          case 'token_incorrecto':
            setErrorMsg('❌ Token de verificación incorrecto');
            break;
          case 'invitacion_invalida':
            setErrorMsg('❌ Invitación no válida');
            break;
          case 'invitacion_completa':
            setErrorMsg('❌ La invitación ya alcanzó el límite de usuarios');
            break;
          case 'exception':
            setErrorMsg('❌ Error del servidor: ' + data.message);
            break;
          default:
            setErrorMsg(data.message || '❌ Error desconocido');
        }
        return;
      }

      // 5️⃣ Registro exitoso
      setExitoMsg('✅ Registro completado correctamente');
      setTimeout(() => navigate('/Contenedor'), 2000);

    } catch (error) {
      // 6️⃣ Errores de conexión o JSON inválido
      console.error("Error de conexión:", error);
      setErrorMsg('❌ Error de conexión con el servidor: ' + error.message);
    }
  };

  return (
    <div className="login-body">
      <div className="login-container">
        {/* Logos */}
        <div className="login-logos">
          <img src={logo3} alt="Logo3" className="login-logo3" />
          <img src={logo1} alt="Logo1" className="login-logo1" />
          <img src={logo2} alt="Logo2" className="login-logo2" />
        </div>

        <h1 className="login-title">REGISTRO - PASO 2</h1>

        {/* Mensajes */}
        {errorMsg && <div style={{ color: 'red', marginBottom: '15px' }}>{errorMsg}</div>}
        {exitoMsg && <div style={{ color: 'green', marginBottom: '15px' }}>{exitoMsg}</div>}

        {/* Campos de registro */}
        <div className="login-campo">
          <label>Nombre(s):</label>
          <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ingresa tu nombre" className="login-input" />
        </div>
        <div className="login-campo">
          <label>Apellido Paterno:</label>
          <input type="text" value={apellidoPaterno} onChange={(e) => setApellidoPaterno(e.target.value)} placeholder="Ingresa tu apellido paterno" className="login-input" />
        </div>
        <div className="login-campo">
          <label>Apellido Materno (opcional):</label>
          <input type="text" value={apellidoMaterno} onChange={(e) => setApellidoMaterno(e.target.value)} placeholder="Ingresa tu apellido materno" className="login-input" />
        </div>
        <div className="login-campo">
          <label>Teléfono:</label>
          <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Ingresa tu teléfono" className="login-input" />
        </div>
        <div className="login-campo">
          <label>Token de verificación (8 dígitos):</label>
          <input type="text" value={tokenVerificacion} onChange={(e) => setTokenVerificacion(e.target.value)} maxLength={8} placeholder="Ingresa el token recibido por correo" className="login-input" />
        </div>

        <div className="login-campo" style={{ marginTop: '20px' }}>
          <button className="login-button" onClick={handleRegistroFinal}>COMPLETAR REGISTRO</button>
        </div>
      </div>
    </div>
  );
}

export default RegistroPaso2;
