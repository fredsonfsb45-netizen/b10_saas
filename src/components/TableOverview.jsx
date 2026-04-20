import { useEffect, useState } from 'react';
import { ClipboardList, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import OrderModal from './OrderModal';

export default function TableOverview() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTables = async () => {
    try {
      // Definimos fixo 1 a 12 para o teste, mas buscamos comandas abertas
      const { data: activeComandas, error } = await supabase
        .from('comandas')
        .select('*')
        .eq('status', 'aberta');

      if (error) throw error;

      // Gerar array de mesas fixas (SaaS simplificado para o teste)
      const mockTables = Array.from({ length: 12 }, (_, i) => {
        const mesaNum = `Mesa ${(i + 1).toString().padStart(2, '0')}`;
        const comanda = activeComandas?.find(c => c.mesa === mesaNum);
        return {
          id: mesaNum,
          status: comanda ? 'ocupada' : 'disponivel',
          total: comanda ? `R$ ${comanda.total.toLocaleString('pt-BR')}` : '-',
          time: comanda ? 'Em uso' : '-',
          comanda_id: comanda?.id
        };
      });

      setTables(mockTables);
    } catch (err) {
      console.error("Erro ao carregar mesas:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
    
    // Realtime - atualização automática ao mudar comanda
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comandas' }, () => fetchTables())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'itens_pedido' }, () => fetchTables())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleTableClick = (table) => {
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ocupada': return 'border-orange-200 bg-orange-50 text-orange-700 shadow-sm';
      case 'disponivel': return 'border-green-100 bg-white text-green-700 hover:border-green-400';
      case 'aguardando': return 'border-blue-200 bg-blue-50 text-blue-700';
      default: return 'border-gray-200 bg-gray-50 text-gray-700';
    }
  };

  if (loading) return <div className="p-10 text-center animate-pulse font-bold text-gray-400">Sincronizando mesas...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ClipboardList className="text-red-600" /> Painel de Mesas
        </h2>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded">LIVRE</div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded">OCUPADA</div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table, index) => (
          <div 
            key={index} 
            onClick={() => handleTableClick(table)}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-lg active:scale-95 ${getStatusColor(table.status)}`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-lg">{table.id}</span>
              {table.status === 'disponivel' ? <CheckCircle2 size={16} /> : <Clock size={16} className="animate-pulse" />}
            </div>
            <div className="mt-4">
              <p className="text-[10px] uppercase tracking-widest font-black opacity-40">Consumo Atual</p>
              <p className="text-xl font-black">{table.total}</p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && selectedTable && (
        <OrderModal 
          table={selectedTable} 
          onClose={() => {
            setIsModalOpen(false);
            fetchTables();
          }} 
        />
      )}
    </div>
  );
}
