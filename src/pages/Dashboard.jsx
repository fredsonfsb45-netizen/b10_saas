import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, UtensilsCrossed, Flame, Settings, Package } from 'lucide-react';
import FinancialSummary from '../components/FinancialSummary';
import TableOverview from '../components/TableOverview';
import Configuracoes from '../components/Configuracoes';
import KitchenMonitor from '../components/KitchenMonitor';
import InventoryManager from '../components/InventoryManager';

export default function Dashboard() {
  const { userRole, tenantData, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState(userRole === 'dono' ? 'dono' : 'garcom');

  const corBrand = tenantData?.cor_primaria || '#dc2626';
  const nomeBrand = tenantData?.nome || 'B10 Gestão';
  
  const content = () => {
    return (
      <div className="flex flex-col h-full bg-white">
        <div className="flex-1 overflow-y-auto">
          {(() => {
            switch (activeTab) {
              case 'dono':
                return (
                  <div className="animate-in fade-in duration-500">
                    <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                      <div>
                        <h2 className="text-3xl font-black text-gray-800">Painel do Dono</h2>
                        <p className="text-gray-400 font-bold text-sm">Visão geral do lucro e desempenho</p>
                      </div>
                    </div>
                    <FinancialSummary />
                    <div className="p-8 border-t border-gray-50 flex gap-4">
                       <button 
                        onClick={() => setActiveTab('estoque')}
                        className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center gap-3"
                       >
                         <Package size={20} /> Gerenciar Estoque & Produtos
                       </button>
                    </div>
                  </div>
                );
              case 'estoque':
                return <InventoryManager />;
              case 'garcom':
                return (
                  <div className="animate-in slide-in-from-right duration-500">
                    <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                      <div>
                        <h2 className="text-3xl font-black text-gray-800">Área do Garçom</h2>
                        <p className="text-gray-400 font-bold text-sm">Gestão de mesas e pedidos</p>
                      </div>
                    </div>
                    <TableOverview />
                  </div>
                );
              case 'cozinha':
                return (
                  <div className="animate-in slide-in-from-left duration-500">
                    <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                      <div>
                        <h2 className="text-3xl font-black text-gray-800">Monitor da Cozinha</h2>
                        <p className="text-gray-400 font-bold text-sm">Pedidos em preparação</p>
                      </div>
                    </div>
                    <KitchenMonitor />
                  </div>
                );
              case 'config':
                return <Configuracoes />;
              default:
                return <div>Selecione um menu.</div>;
            }
          })()}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <aside className="bg-black text-white w-full md:w-72 flex-shrink-0 flex flex-col relative border-r border-white/5">
        <div className="p-10 border-b border-white/5">
          <h2 className="text-2xl font-black truncate flex flex-col gap-1">
             <span className="text-[10px] text-gray-500 uppercase tracking-[0.3em]">Gestão Cloud</span>
             <span style={{ color: corBrand }}>{nomeBrand}</span>
          </h2>
        </div>
        
        <nav className="flex-1 p-6 flex flex-col gap-3">
          {userRole === 'dono' && (
            <button 
              onClick={() => setActiveTab('dono')}
              className={`text-left px-5 py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'dono' || activeTab === 'estoque' ? 'bg-red-600 text-white shadow-2xl shadow-red-900/40' : 'hover:bg-white/5 text-gray-500'}`}
            >
              <LayoutDashboard size={22} /> Painel Administrativo
            </button>
          )}
          
          <div className="h-px bg-white/5 my-4"></div>
          
          <button 
            onClick={() => setActiveTab('garcom')}
            className={`text-left px-5 py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'garcom' ? 'bg-red-600 text-white shadow-2xl shadow-red-900/40' : 'hover:bg-white/5 text-gray-500'}`}
          >
            <UtensilsCrossed size={22} /> Garçom / Mesas
          </button>
          <button 
            onClick={() => setActiveTab('cozinha')}
            className={`text-left px-5 py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-4 ${activeTab === 'cozinha' ? 'bg-red-600 text-white shadow-2xl shadow-red-900/40' : 'hover:bg-white/5 text-gray-500'}`}
          >
            <Flame size={22} /> Monitor Cozinha
          </button>
          
          <div className="mt-auto pt-6 border-t border-white/5">
            <button 
              onClick={() => setActiveTab('config')}
              className={`text-left px-5 py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-4 w-full ${activeTab === 'config' ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-gray-500'}`}
            >
              <Settings size={22} /> Ajustes
            </button>
          </div>
        </nav>
        
        <div className="p-8">
          <button onClick={signOut} className="flex items-center gap-3 text-gray-500 hover:text-red-500 font-black text-[10px] uppercase tracking-widest transition-all w-full px-2">
            <LogOut size={16}/> Sair do Sistema
          </button>
        </div>
      </aside>

      <main className="flex-1 max-w-7xl w-full p-4 md:p-10 mx-auto overflow-y-auto">
        <div className="bg-white rounded-[50px] shadow-2xl min-h-[85vh] overflow-hidden border border-gray-100">
          {content()}
        </div>
      </main>
    </div>
  );
}
