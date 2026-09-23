import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { FetchDynamic } from "../components/Api/FetchDynamic";
import { useNavigate } from 'react-router-dom';

type AuthContextType = {
    authenticated: boolean;
    loading: boolean;
    login: (user: string, password: string, captcha: string) => Promise<{ success: boolean; message: string }>;
    logout: () => Promise<void>;
    user: string | null;
    nombre: string | null;
    rol: string | null;
};

const AuthContext = createContext<AuthContextType>({
    authenticated: false,
    loading: true,
    login: async () => ({ success: false, message: '' }),
    logout: async () => { },
    user: null,
    nombre: null,
    rol: null,
});

const isLoginRoute = () => {
    const path = window.location.pathname.replace(/\/+$/, '');
    const isLoginPath = [
        '/sign-in',
        '/signin',
        '/sra/sign-in',
        '/sra/signin',
        '/sra',
        '/',
        '/afiliacion',
        '/sra/afiliacion',
    ].includes(path);

    return isLoginPath || path.startsWith('/afiliacion/') || path.startsWith('/sra/afiliacion/');
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<string | null>(null);
    const [nombre, setNombre] = useState<string | null>(null);
    const [rol, setRol] = useState<string | null>(null);

    const goToLogin = useCallback(() => {
        if (isLoginRoute()) {
            setAuthenticated(false);
            setUser(null);
            setNombre(null);
            setRol(null);
            setLoading(false);
            return;
        }

        navigate('/sign-in', { replace: true });
    }, [navigate]);

    const checkSession = useCallback(async () => {
        if (isLoginRoute()) {
            setAuthenticated(false);
            setUser(null);
            setNombre(null);
            setRol(null);
            setLoading(false);
            return;
        }

        try {
            const res = await FetchDynamic('/auth/check-auth', {
                credentials: 'include'
            });

            if (res.status === 404) {
                setAuthenticated(false);
                setUser(null);
                setNombre(null);
                setRol(null);
                setLoading(false);
                return;
            }

            if (res.ok) {
                const data = await res.json();
                setAuthenticated(true);
                setUser(data.data?.usuario || 'Usuario');
                setNombre(data.data?.nombre || null);
                setRol(data.data?.rol || null);
            } else {
                setAuthenticated(false);
                setUser(null);
                setNombre(null);
                setRol(null);
                goToLogin();
            }
        } catch {
            setAuthenticated(false);
            setUser(null);
            setNombre(null);
            setRol(null);
            goToLogin();
        } finally {
            setLoading(false);
        }
    }, [goToLogin]);

    const login = async (user: string, password: string, captcha: string) => {
        try {
            const res = await FetchDynamic('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user, password, captcha }),
                credentials: 'include'
            });

            const data = await res.json();

            if (!res.ok) {
                // Manejar error de bloqueo
                if (res.status === 429) {
                    return {
                        success: false,
                        message: data.message || 'Demasiados intentos fallidos'
                    };
                }
                return {
                    success: false,
                    message: data.message || 'Credenciales incorrectas'
                };
            }

            // Login exitoso
            setAuthenticated(true);
            setLoading(false);
            setUser(data.data?.usuario || user);
            setNombre(data.data?.nombre || null);
            setRol(data.data?.rol || null);

            return {
                success: true,
                message: data.message || 'Login exitoso'
            };

        } catch (error) {
            console.error('Error en login:', error);
            return {
                success: false,
                message: 'Error al iniciar sesión'
            };
        }
    };

    const logout = async () => {
        try {
            await FetchDynamic('/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Error en logout:', error);
        } finally {
            setAuthenticated(false);
            setUser(null);
            setNombre(null);
            setRol(null);
        }
    };

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    return (
        <AuthContext.Provider value={{
            authenticated,
            loading,
            login,
            logout,
            user,
            nombre,
            rol
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);