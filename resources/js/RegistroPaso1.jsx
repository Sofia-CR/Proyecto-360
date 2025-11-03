import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../css/App.css';
import logo1 from '../imagenes/logo1.png';
import logo2 from '../imagenes/logo2.png';
import logo3 from '../imagenes/logo3.png';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

function RegistroPaso1() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();
  const { token } = useParams();

  const handleSiguiente = async () => {
    if (!correo || !password) {
      setErrorMsg('❌ Completa correo y contraseña');
      return;
    }

    setErrorMsg(''); // Limpiar mensajes anteriores

    try {
      // Verificamos si el correo ya está registrado o invitación inválida
      const res = await fetch('http://127.0.0.1:8000/api/RegistroPaso1/invitado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, token_invitacion: token }),
      });

      const data = await res.json();

      if (!data.ok) {
        // Mostrar mensaje de error y NO activar loading
        setErrorMsg(data.message || '❌ Error al validar invitación');
        return;
      }

      // Si todo está bien, activamos loading y avanzamos
      setLoading(true);
      alert('✅ Se envió un token de verificación a tu correo');
      navigate('/RegistroPaso2', { state: { correo, password, token } });

    } catch (error) {
      console.error(error);
      setErrorMsg('❌ Error de conexión con el servidor');
    } finally {
      setLoading(false);
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

        <h1 className="login-title">REGISTRARSE</h1>

        {/* Mostrar mensaje de error */}
        {errorMsg && (
          <div style={{ color: 'red', marginBottom: '15px' }}>
            {errorMsg}
          </div>
        )}

        {/* Campo correo */}
        <div className="login-campo">
          <label htmlFor="correo">Correo:</label>
          <input
            type="email"
            id="correo"
            placeholder="Ingresa tu correo"
            className="login-input"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
          />
        </div>

        {/* Campo contraseña con opción de mostrar/ocultar */}
        <div className="login-campo">
          <label htmlFor="contrasena">Contraseña:</label>
          <div className="login-input-contenedor">
            <input
              type={showPassword ? 'text' : 'password'}
              id="contrasena"
              placeholder="Ingresa tu contraseña"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {password.length > 0 && (
              <span
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
              </span>
            )}
          </div>
        </div>

        {/* Mensaje de carga solo cuando realmente se envía */}
        {loading && (
          <p style={{ color: 'blue', marginTop: '10px' }}>
            ⏳ Enviando token, espera un momento...
          </p>
        )}

        {/* Botón siguiente */}
        <div className="login-campo" style={{ marginTop: '20px' }}>
          <button
            type="button"
            className="login-button"
            onClick={handleSiguiente}
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'SIGUIENTE'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegistroPaso1;
