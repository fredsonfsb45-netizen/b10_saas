import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function Configuracoes() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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
    <div className="p-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
          <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
            <Lock className="text-red-600" size={20} /> Segurança da Conta
          </h2>
          <p className="text-sm text-gray-500 mt-1">Atualize sua senha de acesso ao sistema.</p>
        </div>

        <form onSubmit={handleUpdatePassword} className="p-6 flex flex-col gap-5">
          {message.text && (
            <div className={`p-4 rounded-xl flex items-center gap-3 font-bold text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              {message.text}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Nova Senha</label>
            <input 
              type="password"
              placeholder="Digite a nova senha"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Confirmar Nova Senha</label>
            <input 
              type="password"
              placeholder="Repita a nova senha"
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-black hover:shadow-red-200'
            }`}
          >
            {loading ? 'Atualizando...' : 'Salvar Nova Senha'}
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
