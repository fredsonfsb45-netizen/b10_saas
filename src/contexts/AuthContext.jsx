import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [tenantId, setTenantId] = useState(null);
  const [tenantData, setTenantData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);

  async function fetchUserProfile(userId) {
    try {
      if (!supabase) throw new Error("Supabase não configurado.");

      const { data, error: profileError } = await supabase
        .from('usuarios_restaurante')
        .select('cargo, restaurante_id, restaurantes (nome, cor_primaria, logo_url)')
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;

      if (data) {
        setUserRole(data.cargo);
        setTenantId(data.restaurante_id);
        setTenantData(data.restaurantes);
      }
    } catch (err) {
      console.error("Erro ao buscar perfil:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!supabase) {
      setError("Erro de Conexão: Verifique as Variáveis de Ambiente no Netlify.");
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      if (sessionError) {
        setError(sessionError.message);
        setLoading(false);
      } else if (session) {
        setUser(session.user);
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch(err => {
      setError(err.message);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setUserRole(null);
        setTenantId(null);
        setTenantData(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const signOut = () => supabase.auth.signOut();

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-red-600 animate-pulse">Iniciando B10 Gestão...</div>;

  if (error && !user) return (
    <div className="h-screen flex items-center justify-center bg-red-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-200 text-center max-w-md">
        <h2 className="text-2xl font-black text-red-600 mb-4">Erro de Configuração</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <p className="text-sm text-gray-400">Verifique se você adicionou o VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no painel do Netlify.</p>
      </div>
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, userRole, tenantId, tenantData, signIn, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
