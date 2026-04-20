import { useState, useEffect } from 'react';
import { Package, Beef, Search, Plus, Trash2, Edit3, Save, X, Layers, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function InventoryManager() {
  const [activeSubTab, setActiveSubTab] = useState('produtos'); // 'produtos' ou 'insumos'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // States for new item
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newUnit, setNewUnit] = useState('kg');

  const fetchData = async () => {
    setLoading(true);
    const table = activeSubTab === 'produtos' ? 'produtos' : 'insumos';
    const { data: result, error } = await supabase.from(table).select('*').order('nome');
    if (!error) setData(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [activeSubTab]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const table = activeSubTab === 'produtos' ? 'produtos' : 'insumos';
    const payload = activeSubTab === 'produtos' 
      ? { nome: newName, preco: parseFloat(newPrice), categoria: newCategory }
      : { nome: newName, quantidade: 0, unidade_medida: newUnit, custo_unitario: parseFloat(newPrice) };

    const { error } = await supabase.from(table).insert([payload]);
    if (!error) {
      setIsAdding(false);
      setNewName('');
      setNewPrice('');
      setNewCategory('');
      fetchData();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Deseja excluir este item?")) return;
    const table = activeSubTab === 'produtos' ? 'produtos' : 'insumos';
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (!error) fetchData();
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2">
            <Package className="text-red-600" /> Gestão de Catálogo
          </h2>
          <p className="text-gray-400 font-bold text-sm">Controle seus produtos e matérias-primas</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveSubTab('produtos')}
            className={`px-6 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${activeSubTab === 'produtos' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}
          >
            Produtos (Venda)
          </button>
          <button 
            onClick={() => setActiveSubTab('insumos')}
            className={`px-6 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${activeSubTab === 'insumos' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}
          >
            Insumos (Estoque)
          </button>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder={`Buscar ${activeSubTab}...`}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-red-500 outline-none font-bold"
          />
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-black text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-red-600 transition-all"
        >
          <Plus size={18} /> Novo Item
        </button>
      </div>

      {isAdding && (
        <div className="bg-red-50 p-6 rounded-3xl border-2 border-red-100 mb-8 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-red-800 uppercase text-xs">Novo {activeSubTab === 'produtos' ? 'Produto' : 'Insumo'}</h3>
            <button onClick={() => setIsAdding(false)} className="text-red-400"><X size={20}/></button>
          </div>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input 
              required
              placeholder="Nome do Item"
              className="p-3 rounded-xl border border-red-200 outline-none font-bold text-sm"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <input 
              required
              type="number"
              step="0.01"
              placeholder={activeSubTab === 'produtos' ? "Preço de Venda" : "Custo Unitário"}
              className="p-3 rounded-xl border border-red-200 outline-none font-bold text-sm"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
            />
            {activeSubTab === 'produtos' ? (
              <input 
                placeholder="Categoria (Ex: Bebidas)"
                className="p-3 rounded-xl border border-red-200 outline-none font-bold text-sm"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            ) : (
              <select 
                className="p-3 rounded-xl border border-red-200 outline-none font-bold text-sm"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
              >
                <option value="kg">Quilo (kg)</option>
                <option value="un">Unidade (un)</option>
                <option value="lt">Litro (lt)</option>
                <option value="pt">Pote (pt)</option>
              </select>
            )}
            <button type="submit" className="bg-red-600 text-white font-black rounded-xl py-3 shadow-lg shadow-red-200">
              SALVAR ITEM
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Item</th>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {activeSubTab === 'produtos' ? 'Preço' : 'Custo'}
              </th>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                {activeSubTab === 'produtos' ? 'Categoria' : 'Unidade'}
              </th>
              <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map(item => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-4 font-bold text-gray-800">{item.nome}</td>
                <td className="p-4 font-black text-red-600">
                  R$ {(activeSubTab === 'produtos' ? item.preco : item.custo_unitario).toFixed(2)}
                </td>
                <td className="p-4">
                  <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-1 rounded uppercase tracking-wider">
                    {activeSubTab === 'produtos' ? item.categoria : item.unidade_medida}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button onClick={() => handleDelete(item.id)} className="text-gray-300 hover:text-red-600 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && !loading && (
          <div className="p-20 text-center opacity-20 font-black uppercase tracking-widest">Nenhum item cadastrado</div>
        )}
      </div>
    </div>
  );
}
