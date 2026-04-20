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
  const [retryCount, setRetryCount] = useState(0);

  const fetchUserProfile = async (userId) => {
    if (!supabase) return;
    
    try {
      const { data, error: profileError } = await supabase
        .from('usuarios_restaurante')
        .select('cargo, restaurante_id, restaurantes (nome, cor_primaria, logo_url, status_assinatura, num_mesas)')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116' && retryCount < 5) {
          setTimeout(() => setRetryCount(c => c + 1), 2000);
          return;
        }
        throw profileError;
      }

      if (data) {
        setUserRole(data.cargo);
        setTenantId(data.restaurante_id);
        setTenantData(data.restaurantes);
        setError(null);
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !tenantId) {
      fetchUserProfile(user.id);
    }
  }, [user, retryCount]);

  useEffect(() => {
    if (!supabase) {
      setError("Erro de Conexão: Verifique as Variáveis de Ambiente no seu provedor de hospedagem.");
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
  const signUp = (email, password) => supabase.auth.signUp({ email, password });
  const signOut = () => supabase.auth.signOut();

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-6"></div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">B10 Gestão</h2>
        <p className="text-gray-500 animate-pulse font-bold">
          {retryCount > 0 ? "Finalizando as configurações do restaurante..." : "Iniciando o sistema..."}
        </p>
        {retryCount > 0 && (
          <p className="text-xs text-gray-400 mt-4 max-w-xs">
            Isso acontece apenas no primeiro acesso enquanto configuramos seu banco de dados.
          </p>
        )}
      </div>
    );
  }

  if (error && !user) return (
    <div className="h-screen flex items-center justify-center bg-red-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-200 text-center max-w-md">
        <h2 className="text-2xl font-black text-red-600 mb-4">Erro de Configuração</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <p className="text-sm text-gray-400">Verifique se você adicionou o VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no painel da Vercel.</p>
      </div>
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, userRole, tenantId, tenantData, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
