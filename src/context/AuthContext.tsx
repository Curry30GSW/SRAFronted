import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { FetchDynamic } from "../components/Api/FetchDynamic";

type AuthContextType = {
    authenticated: boolean;
    loading: boolean;
    login: () => Promise<void>;
    logout: () => Promise<void>;
    checkSession: () => Promise<void>;
    user: string | null;
};

const AuthContext = createContext<AuthContextType>({
    authenticated: false,
    loading: true,
    login: async () => { },
    logout: async () => { },
    checkSession: async () => { },
    user: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [authenticated, setAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<string | null>(null);

    const checkSession = useCallback(async () => {
        try {
            const res = await FetchDynamic('/auth/check-auth', {
                credentials: 'include'
            });

            if (res.ok) {
                const data = await res.json();
                setAuthenticated(true);
                setUser(data.user || 'Usuario');
            } else {
                setAuthenticated(false);
                setUser(null);
            }
        } catch {
            setAuthenticated(false);
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async () => {
        await checkSession();
    };

    const logout = async () => {
        try {

            setAuthenticated(false);
            setUser(null);


            await FetchDynamic('/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Error en logout:', error);
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
            checkSession,
            user
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);