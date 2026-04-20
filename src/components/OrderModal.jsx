import { useState, useEffect } from 'react';
import { X, Plus, Minus, Receipt, ShoppingCart, CheckCircle, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function OrderModal({ table, onClose }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [comandaItems, setComandaItems] = useState([]);
  const [comandaId, setComandaId] = useState(table.comanda_id);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' ou 'conta'

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('produtos').select('*').order('nome');
    if (!error) setProducts(data);
  };

  const fetchComandaItems = async () => {
    const { data, error } = await supabase
      .from('itens_pedido')
      .select('*, produtos(nome)')
      .eq('comanda_id', comandaId);
    if (!error) setComandaItems(data);
  };

  useEffect(() => {
    fetchProducts();
    if (comandaId) {
      fetchComandaItems();
    }
  }, [comandaId]);

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    const existing = cart.find(item => item.id === productId);
    if (existing.qty === 1) {
      setCart(cart.filter(item => item.id !== productId));
    } else {
      setCart(cart.map(item => item.id === productId ? { ...item, qty: item.qty - 1 } : item));
    }
  };

  const handleLaunchItems = async () => {
    setLoading(true);
    try {
      let currentComandaId = comandaId;

      // 1. Criar comanda se não existir
      if (!currentComandaId) {
        const { data: newComanda, error: cError } = await supabase
          .from('comandas')
          .insert({ mesa: table.id, status: 'aberta', total: 0 })
          .select()
          .single();
        
        if (cError) throw cError;
        currentComandaId = newComanda.id;
        setComandaId(currentComandaId);
      }

      // 2. Inserir itens
      const itemsToInsert = cart.map(item => ({
        comanda_id: currentComandaId,
        produto_id: item.id,
        quantidade: item.qty,
        preco_unitario: item.preco,
        status: 'pendente'
      }));

      const { error: iError } = await supabase.from('itens_pedido').insert(itemsToInsert);
      if (iError) throw iError;

      // 3. Atualizar total da comanda
      const newTotal = cart.reduce((acc, item) => acc + (item.preco * item.qty), 0);
      await supabase.rpc('increment_comanda_total', { 
        cid: currentComandaId, 
        amount: newTotal 
      });

      setCart([]);
      fetchComandaItems();
      setActiveTab('conta');
    } catch (err) {
      alert("Erro ao lançar itens: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseComanda = async () => {
    if (!window.confirm("Deseja realmente fechar esta conta?")) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('comandas')
        .update({ status: 'fechada' })
        .eq('id', comandaId);
      
      if (error) throw error;
      onClose();
    } catch (err) {
      alert("Erro ao fechar conta: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-red-600 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black">{table.id}</h2>
            <p className="text-red-100 text-xs font-bold uppercase tracking-widest">
              {comandaId ? 'Comanda em Aberto' : 'Mesa Disponível'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          <button 
            onClick={() => setActiveTab('menu')}
            className={`flex-1 py-4 font-black text-sm uppercase tracking-wider transition-all ${activeTab === 'menu' ? 'text-red-600 border-b-4 border-red-600' : 'text-gray-400'}`}
          >
            Lançar Items
          </button>
          <button 
            onClick={() => setActiveTab('conta')}
            className={`flex-1 py-4 font-black text-sm uppercase tracking-wider transition-all ${activeTab === 'conta' ? 'text-red-600 border-b-4 border-red-600' : 'text-gray-400'}`}
          >
            Ver Conta {comandaItems.length > 0 && `(${comandaItems.length})`}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {activeTab === 'menu' ? (
            <div className="grid grid-cols-1 gap-3">
              {products.map(product => (
                <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center group hover:border-red-200 transition-all">
                  <div>
                    <h4 className="font-bold text-gray-800">{product.nome}</h4>
                    <p className="text-red-600 font-black">R$ {product.preco.toLocaleString('pt-BR')}</p>
                    <span className="text-[10px] text-gray-400 uppercase font-bold">{product.categoria}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {cart.find(i => i.id === product.id) ? (
                      <div className="flex items-center gap-3 bg-red-50 p-1 rounded-full">
                        <button onClick={() => removeFromCart(product.id)} className="w-8 h-8 rounded-full bg-white text-red-600 shadow-sm flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                          <Minus size={16} />
                        </button>
                        <span className="font-black text-red-600 w-4 text-center">
                          {cart.find(i => i.id === product.id).qty}
                        </span>
                        <button onClick={() => addToCart(product)} className="w-8 h-8 rounded-full bg-white text-red-600 shadow-sm flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                          <Plus size={16} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => addToCart(product)}
                        className="bg-gray-100 hover:bg-red-600 hover:text-white text-gray-600 p-3 rounded-xl transition-all"
                      >
                        <Plus size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {comandaItems.length === 0 ? (
                <div className="text-center py-10 opacity-30">
                  <Receipt size={64} className="mx-auto mb-4" />
                  <p className="font-bold uppercase tracking-widest">Nenhum item consumido</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {comandaItems.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center transition-all hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center text-red-600 font-black text-xs">
                          {item.quantidade}x
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{item.produtos?.nome}</p>
                          <p className="text-[10px] uppercase font-bold text-gray-400">Status: {item.status}</p>
                        </div>
                      </div>
                      <p className="font-black text-gray-900 text-sm">R$ {(item.preco_unitario * item.quantidade).toLocaleString('pt-BR')}</p>
                    </div>
                  ))}
                  <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-gray-400 font-bold uppercase tracking-widest">Total da Conta</span>
                      <span className="text-2xl font-black text-red-600">
                        R$ {comandaItems.reduce((acc, item) => acc + (item.preco_unitario * item.quantidade), 0).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-white border-t border-gray-100 flex gap-4">
          {activeTab === 'menu' ? (
            <button 
              disabled={cart.length === 0 || loading}
              onClick={handleLaunchItems}
              className="flex-1 bg-red-600 disabled:bg-gray-200 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-200 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
            >
              {loading ? "Processando..." : (
                <>
                  <ShoppingCart size={20} /> Lançar Pedido (R$ {cart.reduce((acc, item) => acc + (item.preco * item.qty), 0).toFixed(2)})
                </>
              )}
            </button>
          ) : (
            <button 
              disabled={comandaItems.length === 0 || loading}
              onClick={handleCloseComanda}
              className="flex-1 bg-black text-white font-black py-4 rounded-2xl shadow-lg shadow-gray-200 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-20"
            >
              <CheckCircle size={20} /> Fechar e Imprimir Conta
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
