import { useState, useEffect } from 'react';
import { Flame, Clock, CheckCircle2, Timer } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function KitchenMonitor() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('itens_pedido')
      .select('*, produtos(nome), comandas(mesa)')
      .eq('status', 'pendente')
      .order('criado_em', { ascending: true });

    if (!error) setOrders(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('kitchen-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'itens_pedido' }, () => fetchOrders())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const handleMarkAsReady = async (itemId) => {
    const { error } = await supabase
      .from('itens_pedido')
      .update({ status: 'pronto' })
      .eq('id', itemId);
    
    if (!error) fetchOrders();
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Carregando pedidos...</div>;

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-3">
            <Flame className="text-orange-600" /> Monitor de Produção
          </h2>
          <p className="text-gray-400 font-bold text-sm">Pedidos aguardando preparo</p>
        </div>
        <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-full font-black text-xs animate-pulse">
          {orders.length} PENDENTES
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center opacity-20 py-20">
          <CheckCircle2 size={80} className="mb-4" />
          <p className="text-xl font-black uppercase tracking-widest">Tudo pronto!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl border-2 border-gray-100 shadow-sm overflow-hidden flex flex-col hover:border-orange-200 transition-all">
              <div className="bg-orange-50 p-4 flex justify-between items-center border-b border-orange-100">
                <span className="font-black text-orange-700">{order.comandas?.mesa}</span>
                <div className="flex items-center gap-1 text-[10px] font-black text-orange-600 bg-white px-2 py-1 rounded-full shadow-sm">
                  <Timer size={10} /> {new Date(order.criado_em).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="p-6 flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-black text-gray-800 leading-tight">{order.produtos?.nome}</h3>
                    <p className="text-2xl font-black text-gray-900 mt-2">Qtd: {order.quantidade}</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleMarkAsReady(order.id)}
                className="w-full bg-orange-600 hover:bg-black text-white font-black py-4 transition-all flex items-center justify-center gap-2 group"
              >
                <CheckCircle2 size={18} className="group-hover:scale-125 transition-transform" /> MARCAR COMO PRONTO
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
