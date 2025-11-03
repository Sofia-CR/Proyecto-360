import { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [idUsuario, setIdUsuario] = useState(() => {
    // Leer ID de sessionStorage si existe
    return sessionStorage.getItem('id_usuario') || null;
  });

  useEffect(() => {
    if (idUsuario) {
      sessionStorage.setItem('id_usuario', idUsuario);
    } else {
      sessionStorage.removeItem('id_usuario');
    }
  }, [idUsuario]);

  return (
    <UserContext.Provider value={{ idUsuario, setIdUsuario }}>
      {children}
    </UserContext.Provider>
  );
};
