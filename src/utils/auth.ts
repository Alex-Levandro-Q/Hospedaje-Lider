import Cookies from 'js-cookie';

export interface Usuario {
  id: number;
  nombre: string;
  apellidos: string;
  email: string;
  numeroCarnet: string;
  rol: string;
}

export const setAuthCookies = (token: string, usuario: Usuario) => {
  Cookies.set('token', token, { expires: 1 }); // 1 día
  Cookies.set('usuario', JSON.stringify(usuario), { expires: 1 });
};

export const getAuthCookies = (): { token: string | null; usuario: Usuario | null } => {
  const token = Cookies.get('token') || null;
  const usuarioStr = Cookies.get('usuario');
  const usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
  
  return { token, usuario };
};

export const clearAuthCookies = () => {
  Cookies.remove('token');
  Cookies.remove('usuario');
};

export const isAuthenticated = (): boolean => {
  const { token } = getAuthCookies();
  return !!token;
};

export const isAdmin = (): boolean => {
  const { usuario } = getAuthCookies();
  return usuario?.rol === 'administrador' || usuario?.rol === 'gerente';
};