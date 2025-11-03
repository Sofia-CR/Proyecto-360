import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    const usuarioGuardado = localStorage.getItem("usuario");

    if (token && usuarioGuardado) {
      // Recuperar usuario directamente del localStorage
      setUsuario(JSON.parse(usuarioGuardado));
    }

    setLoading(false);
  }, []);

  const login = (usuario, token) => {
    localStorage.setItem("jwt_token", token);
    localStorage.setItem("usuario", JSON.stringify(usuario));
    setUsuario(usuario);
  };

  const logout = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

