import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, CheckCircle, AlertCircle, Layout } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Configuracoes() {
  const { tenantData, tenantId } = useAuth();
  const [numMesas, setNumMesas] = useState(tenantData?.num_mesas || 12);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdateTables = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase
        .from('restaurantes')
        .update({ num_mesas: parseInt(numMesas) })
        .eq('id', tenantId);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Configuração de mesas atualizada!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      return setMessage({ type: 'error', text: 'As senhas não coincidem.' });
    }

    if (newPassword.length < 6) {
      return setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Senha atualizada com sucesso!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {message.text && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
        }`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      {/* Configuração de Mesas */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/20">
          <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
            <Layout className="text-red-600" size={24} /> Layout do Salão
          </h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Configure o número de mesas disponíveis.</p>
        </div>

        <form onSubmit={handleUpdateTables} className="p-8 flex flex-col gap-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Total de Mesas</label>
            <div className="flex items-center gap-4">
              <input 
                type="number"
                min="1"
                max="100"
                className="flex-1 p-4 bg-gray-50 border-none rounded-2xl font-black outline-none ring-2 ring-transparent focus:ring-red-500 transition-all"
                value={numMesas}
                onChange={(e) => setNumMesas(e.target.value)}
                required
              />
              <button 
                type="submit"
                disabled={loading}
                className="bg-red-600 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-red-100 hover:bg-black transition-all disabled:opacity-50"
              >
                SALVAR
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Segurança */}
      <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/20">
          <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
            <Lock className="text-red-600" size={24} /> Segurança
          </h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mt-1">Atualize sua senha de acesso.</p>
        </div>

        <form onSubmit={handleUpdatePassword} className="p-8 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Nova Senha</label>
              <input 
                type="password"
                className="w-full p-4 bg-gray-50 border-none rounded-2xl font-black outline-none ring-2 ring-transparent focus:ring-red-500 transition-all"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-2">Confirmar Senha</label>
              <input 
                type="password"
                className="w-full p-4 bg-gray-50 border-none rounded-2xl font-black outline-none ring-2 ring-transparent focus:ring-red-500 transition-all"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white font-black py-4 rounded-2xl shadow-xl hover:bg-red-600 transition-all disabled:opacity-50"
          >
            ATUALIZAR SENHA
          </button>
        </form>
      </div>

      <div className="mt-8 p-6 bg-red-50 rounded-2xl border border-red-100">
        <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2">
          <AlertCircle size={18} /> Lembrete importante
        </h3>
        <p className="text-sm text-red-700/80 leading-relaxed">
          Ao alterar sua senha, sua sessão atual permanecerá ativa, mas você precisará usar a nova senha na próxima vez que fizer login em qualquer dispositivo.
        </p>
      </div>
    </div>
  );
}
