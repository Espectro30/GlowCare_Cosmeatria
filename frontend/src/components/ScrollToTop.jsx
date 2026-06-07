import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente global que fuerza el scroll al inicio
 * cada vez que cambia la ruta de navegación.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
