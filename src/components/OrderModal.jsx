import { useState, useEffect, useCallback } from 'react';
import { X, Plus, Minus, Receipt, ShoppingCart, CheckCircle, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function OrderModal({ table, onClose }) {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [comandaItems, setComandaItems] = useState([]);
  const [comandaId, setComandaId] = useState(table.comanda_id);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' ou 'conta'
  const { tenantId } = useAuth();

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase.from('produtos').select('*').order('nome');
    if (!error) setProducts(data);
  }, []);
  
  const fetchComandaItems = useCallback(async () => {
    if (!comandaId) return;
    const { data, error } = await supabase
      .from('itens_pedido')
      .select('*, produtos(nome)')
      .eq('comanda_id', comandaId);
    if (!error) setComandaItems(data);
  }, [comandaId]);

  useEffect(() => {
    fetchProducts();
    if (comandaId) {
      fetchComandaItems();
    }
  }, [comandaId, fetchProducts, fetchComandaItems]);

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
          .insert({ 
            mesa: table.id, 
            status: 'aberta', 
            total: 0,
            restaurante_id: tenantId 
          })
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
        status: 'pendente',
        restaurante_id: tenantId
      }));

      const { error: iError } = await supabase.from('itens_pedido').insert(itemsToInsert);
      if (iError) throw iError;

      setCart([]);
      fetchComandaItems();
      setActiveTab('conta');
    } catch (err) {
      alert("ERRO AO LANÇAR: " + err.message);
      console.error("Erro ao lançar itens:", err.message);
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
      console.error("Erro ao fechar conta:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Deseja remover este item do pedido?")) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('itens_pedido')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
      fetchComandaItems();
    } catch (err) {
      console.error("Erro ao excluir item:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[40px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-red-600 p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black">{table.id}</h2>
            <p className="text-red-100 text-[10px] font-black uppercase tracking-widest">
              {comandaId ? 'Comanda em Aberto' : 'Mesa Disponível'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 px-4">
          <button 
            onClick={() => setActiveTab('menu')}
            className={`flex-1 py-4 font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'menu' ? 'text-red-600 border-b-4 border-red-600' : 'text-gray-400'}`}
          >
            Lançar Items
          </button>
          <button 
            onClick={() => setActiveTab('conta')}
            className={`flex-1 py-4 font-black text-xs uppercase tracking-widest transition-all ${activeTab === 'conta' ? 'text-red-600 border-b-4 border-red-600' : 'text-gray-400'}`}
          >
            Ver Conta {comandaItems.length > 0 && `(${comandaItems.length})`}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {activeTab === 'menu' ? (
            <div className="grid grid-cols-1 gap-3">
              {products.map(product => (
                <div key={product.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center group hover:border-red-200 transition-all">
                  <div>
                    <h4 className="font-bold text-gray-800">{product.nome}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-red-600 font-black">R$ {product.preco.toLocaleString('pt-BR')}</p>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${product.estoque_atual > 5 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        Estoque: {product.estoque_atual}
                      </span>
                    </div>
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
                        <button 
                          disabled={product.estoque_atual <= (cart.find(i => i.id === product.id).qty)}
                          onClick={() => addToCart(product)} 
                          className="w-8 h-8 rounded-full bg-white text-red-600 shadow-sm flex items-center justify-center hover:bg-red-600 hover:text-white transition-all disabled:opacity-30"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        disabled={product.estoque_atual <= 0}
                        onClick={() => addToCart(product)}
                        className="bg-gray-100 hover:bg-red-600 hover:text-white text-gray-600 p-3 rounded-xl transition-all disabled:opacity-20"
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
                  <p className="font-bold uppercase tracking-widest text-xs">Nenhum item consumido</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {comandaItems.map(item => (
                    <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center animate-in slide-in-from-left duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600 font-black text-sm">
                          {item.quantidade}x
                        </div>
                        <div>
                          <p className="font-black text-gray-800">{item.produtos?.nome}</p>
                          <p className="text-[9px] uppercase font-bold text-gray-400">Total: R$ {(item.preco_unitario * item.quantidade).toLocaleString('pt-BR')}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <div className="mt-8 pt-8 border-t-2 border-dashed border-gray-200">
                    <div className="flex justify-between items-center mb-6 px-2">
                      <span className="text-gray-400 font-black uppercase text-[10px] tracking-[0.2em]">Total Acumulado</span>
                      <span className="text-3xl font-black text-red-600">
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
        <div className="p-8 bg-white border-t border-gray-100 flex gap-4">
          {activeTab === 'menu' ? (
            <button 
              disabled={cart.length === 0 || loading}
              onClick={handleLaunchItems}
              className="flex-1 bg-red-600 disabled:bg-gray-200 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-200 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95"
            >
              {loading ? "Processando..." : (
                <>
                  <ShoppingCart size={20} /> CONFIRMAR PEDIDO (R$ {(Number(cart.reduce((acc, item) => acc + (item.preco * item.qty), 0)) || 0).toFixed(2)})
                </>
              )}
            </button>
          ) : (
            <button 
              disabled={comandaItems.length === 0 || loading}
              onClick={handleCloseComanda}
              className="flex-1 bg-black text-white font-black py-4 rounded-2xl shadow-xl shadow-gray-200 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-20"
            >
              <CheckCircle size={20} /> FINALIZAR E LIBERAR MESA
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
