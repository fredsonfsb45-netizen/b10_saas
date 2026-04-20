import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function FinancialSummary() {
  const [stats, setStats] = useState([
    { title: 'Vendas Hoje', value: 'R$ 0,00', icon: <DollarSign className="text-green-500" />, change: '0%', color: 'bg-green-50' },
    { title: 'Despesas', value: 'R$ 0,00', icon: <TrendingDown className="text-red-500" />, change: '0%', color: 'bg-red-50' },
    { title: 'Mesas Ativas', value: '0', icon: <Users className="text-blue-500" />, change: 'Sinc', color: 'bg-blue-50' },
    { title: 'Lucro Bruto', value: 'R$ 0,00', icon: <TrendingUp className="text-purple-500" />, change: '0%', color: 'bg-purple-50' },
  ]);

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // 1. Vendas Hoje
      const { data: vData } = await supabase.from('comandas').select('total').gte('criado_em', today);
      const totalVendas = vData?.reduce((acc, c) => acc + c.total, 0) || 0;

      // 2. Despesas Hoje
      const { data: dData } = await supabase.from('despesas').select('valor').gte('data_vencimento', today);
      const totalDespesas = dData?.reduce((acc, d) => acc + d.valor, 0) || 0;

      // 3. Mesas Ativas
      const { count: activeMesas } = await supabase.from('comandas').select('*', { count: 'exact', head: true }).eq('status', 'aberta');

      // 4. Cálculo de Lucro Bruto (Vendas - Despesas)
      // Futuramente podemos integrar o custo dos produtos aqui para Lucro Líquido
      const lucro = totalVendas - totalDespesas;

      setStats([
        { title: 'Vendas Hoje', value: `R$ ${totalVendas.toLocaleString('pt-BR')}`, icon: <DollarSign className="text-green-500" />, change: '+Vidal', color: 'bg-green-50' },
        { title: 'Despesas', value: `R$ ${totalDespesas.toLocaleString('pt-BR')}`, icon: <TrendingDown className="text-red-500" />, change: '-Vidal', color: 'bg-red-50' },
        { title: 'Mesas Ativas', value: activeMesas || 0, icon: <Users className="text-blue-500" />, change: 'Live', color: 'bg-blue-50' },
        { title: 'Lucro Previsto', value: `R$ ${lucro.toLocaleString('pt-BR')}`, icon: <TrendingUp className="text-purple-500" />, change: '+Meta', color: 'bg-purple-50' },
      ]);
    } catch (err) {
      console.error("Erro dashboard:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${stat.color}`}>
              {stat.icon}
            </div>
            <span className="text-[10px] font-black px-2 py-1 bg-gray-50 text-gray-400 rounded-full uppercase tracking-widest">
              {stat.change}
            </span>
          </div>
          <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest">{stat.title}</h3>
          <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
