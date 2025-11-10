import React, { useState } from 'react';
import '../css/App.css';
import logo1 from '../imagenes/logo1.png';
import logo2 from '../imagenes/logo2.png';
import logo3 from '../imagenes/logo3.png';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "./context/AuthContext"; // 👈 importa useAuth



function Contenedor() {
   const { login } = useAuth(); 
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setErrorMsg('');
    if (!correo || !password) {
      setErrorMsg('❌ Ingresa tu correo y contraseña');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || '❌ Credenciales inválidas');
        setLoading(false);
        return;
      }
      localStorage.setItem("jwt_token", data.token);
      localStorage.setItem("rol", data.usuario.rol);
      console.log(localStorage.getItem(data.usuario));
login(data.usuario, data.token); // Guardar usuario en contexto
setPassword('');

if (data.usuario.rol === "Jefe") {
  navigate("/GestionProyectos"); // 👉 los Jefes van a nuevo proyecto
} else if (data.usuario.rol === "Usuario") {
  navigate("/GestionProyectosUsuario"); // 👉 los usuarios normales van a su interfaz
} else {
  navigate("/"); // 👉 por si acaso, lo mandas a inicio
}

console.log(data.usuario);




    } catch (error) {
      console.log('Error de conexión:', error);
      setErrorMsg('❌ Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-body">
      <div className="login-container">
        <div className="login-logos">
          <img src={logo3} alt="Logo3" className="login-logo3" />
          <img src={logo1} alt="Logo1" className="login-logo1" />
          <img src={logo2} alt="Logo2" className="login-logo2" />
        </div>

        <h1 className="login-title">INICIAR SESIÓN</h1>
        {errorMsg && <div style={{ color: 'red', marginBottom: '15px' }}>{errorMsg}</div>}

        <div className="login-campo">
          <label htmlFor="usuario">Correo:</label>
          <input
            type="email"
            id="usuario"
            placeholder="Ingresa tu correo"
            className="login-input"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div className="login-campo">
          <label htmlFor="contrasena">Contraseña:</label>
          <div className="login-input-contenedor">
            <input
              type={showPassword ? "text" : "password"}
              id="contrasena"
              placeholder="Ingresa tu contraseña"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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

        <h2 className="login-campo">
          <Link to="/CambiaContrasena">¿Olvidaste tu contraseña?</Link>
        </h2>
        <button
          type="button"
          className="login-button"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Cargando...' : 'INICIAR'}
        </button>
      </div>
    </div>
  );
}

export default Contenedor;


