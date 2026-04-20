import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Utensils, Store, Mail, Lock, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Register() {
  const [restauranteNome, setRestauranteNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Criar usuário no Auth
      const { data: authData, error: authError } = await signUp(email, password);
      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error("Usuário criado, mas aguardando confirmação de e-mail. Por favor, verifique sua caixa de entrada ou desative a confirmação no Supabase.");

      // Pequena pausa para garantir que o Supabase registrou o usuário no banco
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 2. Criar o Restaurante
      const { data: restData, error: restError } = await supabase
        .from('restaurantes')
        .insert({ 
          nome: restauranteNome,
          status_assinatura: 'trial' // Começa em modo teste
        })
        .select()
        .single();
      
      if (restError) throw restError;

      // 3. Vincular usuário como Dono
      const { error: linkError } = await supabase
        .from('usuarios_restaurante')
        .insert({
          user_id: userId,
          restaurante_id: restData.id,
          cargo: 'dono'
        });

      if (linkError) throw linkError;

      // Sucesso!
      navigate('/app');
    } catch (err) {
      console.error("Erro no cadastro:", err.message);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-600"></div>
        
        <div className="flex justify-center mb-6 text-red-600">
          <Utensils size={48} />
        </div>
        
        <h2 className="text-3xl font-black text-center mb-2 text-gray-900">Comece Grátis</h2>
        <p className="text-gray-500 text-center mb-8 text-sm px-4">Crie sua conta em 30 segundos e modernize sua churrascaria hoje.</p>
        
        {errorMsg && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 text-sm font-bold border border-red-100 flex items-start gap-2">
            <span className="mt-0.5">⚠️</span> {errorMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          <div>
            <label className="block text-gray-700 mb-1.5 font-bold text-sm">Nome da sua Churrascaria</label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Ex: Churrascaria do B10"
                className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
                value={restauranteNome}
                onChange={(e) => setRestauranteNome(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-1.5 font-bold text-sm">E-mail Administrativo</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" 
                placeholder="seu@email.com"
                className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-1.5 font-bold text-sm">Crie uma Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" 
                placeholder="Mínimo 6 caracteres"
                className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-red-600 text-white font-black py-4 rounded-xl hover:bg-black transition-all mt-2 shadow-lg shadow-red-100 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Criando sua conta...' : (
              <>Criar Conta e Acessar <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-sm">
            Já tem uma conta? <Link to="/login" className="text-red-600 font-bold hover:underline">Fazer Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
