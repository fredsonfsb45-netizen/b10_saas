import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Utensils } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const { error } = await signIn(email, password);
    if (error) {
      setErrorMsg(error.message);
    } else {
      navigate('/app');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border-t-4 border-red-600">
        <div className="flex justify-center mb-6 text-red-600">
          <Utensils size={48} />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Acesso Restrito</h2>
        
        {errorMsg && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-700 mb-1 font-bold">E-mail do Funcionário/Dono</label>
            <input 
              type="email" 
              className="w-full p-3 border rounded focus:ring-2 focus:ring-red-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 font-bold">Senha de Acesso</label>
            <input 
              type="password" 
              className="w-full p-3 border rounded focus:ring-2 focus:ring-red-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="bg-red-600 text-white font-bold py-3 rounded hover:bg-black transition-colors mt-2">
            Entrar no Sistema
          </button>
        </form>
      </div>
    </div>
  );
}
