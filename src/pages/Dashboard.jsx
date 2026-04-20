import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, UtensilsCrossed, Flame, Settings, Package } from 'lucide-react';
import FinancialSummary from '../components/FinancialSummary';
import TableOverview from '../components/TableOverview';
import Configuracoes from '../components/Configuracoes';
import KitchenMonitor from '../components/KitchenMonitor';
import InventoryManager from '../components/InventoryManager';

export default function Dashboard() {
  const { user, userRole, tenantData, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState(userRole === 'dono' ? 'dono' : 'garcom');

  const corBrand = tenantData?.cor_primaria || '#dc2626'; // Vermelho padrao B10
  const nomeBrand = tenantData?.nome || 'B10 Gestão';
  
  const content = () => {
    return (
      <div className="flex flex-col h-full bg-white">
        {/* Banner de Teste/Trial */}
        {tenantData?.status_assinatura === 'teste' && (
          <div className="bg-red-600 px-6 py-2 flex justify-between items-center text-white">
            <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              🚀 Modo de Teste: Suas funções estão 100% liberadas para exploração
            </span>
            <div className="bg-white/20 px-2 py-0.5 rounded font-black text-[9px] uppercase">Acesso Total</div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {(() => {
            switch (activeTab) {
              case 'dono':
                return (
                  <div className="animate-in fade-in duration-500">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                      <h2 className="text-2xl font-black text-gray-800">Painel Administrativo</h2>
                    </div>
                    <FinancialSummary />
                    <div className="p-6">
                      <div className="bg-gray-900 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                        <div className="relative z-10">
                          <h3 className="text-2xl font-black mb-2 leading-tight">Análise Automática do Seu SaaS</h3>
                          <p className="text-gray-400 max-w-sm text-sm font-bold">Os números acima vêm do banco de dados em tempo real conforme os pedidos são feitos.</p>
                        </div>
                        <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform">
                          <LayoutDashboard size={200} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              case 'estoque':
                return <InventoryManager />;
              case 'garcom':
                return (
                  <div className="animate-in slide-in-from-right duration-500">
                    <TableOverview />
                  </div>
                );
              case 'cozinha':
                return <KitchenMonitor />;
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
      {/* Sidebar Social (White-label) */}
      <aside className="bg-black text-white w-full md:w-72 flex-shrink-0 flex flex-col relative">
        <div className="p-8 border-b border-gray-900">
          <h2 className="text-2xl font-black truncate" style={{ color: corBrand }}>
            {tenantData?.logo_url ? <img src={tenantData.logo_url} className="h-10 mb-2" alt="Logo" /> : nomeBrand}
          </h2>
          <div className="mt-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Acesso {userRole}</span>
          </div>
        </div>
        
        <nav className="flex-1 p-6 flex flex-col gap-2">
          {userRole === 'dono' && (
            <>
              <button 
                onClick={() => setActiveTab('dono')}
                className={`text-left px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'dono' ? 'bg-red-600 text-white shadow-xl shadow-red-900/40' : 'hover:bg-white/5 text-gray-500'}`}
              >
                <LayoutDashboard size={20} /> Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('estoque')}
                className={`text-left px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'estoque' ? 'bg-red-600 text-white shadow-xl shadow-red-900/40' : 'hover:bg-white/5 text-gray-500'}`}
              >
                <Package size={20} /> Catálogo & Insumos
              </button>
            </>
          )}
          
          <div className="h-px bg-gray-900 my-4"></div>
          
          <button 
            onClick={() => setActiveTab('garcom')}
            className={`text-left px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'garcom' ? 'bg-red-600 text-white shadow-xl shadow-red-900/40' : 'hover:bg-white/5 text-gray-500'}`}
          >
            <UtensilsCrossed size={20} /> Mesas (Garçom)
          </button>
          <button 
            onClick={() => setActiveTab('cozinha')}
            className={`text-left px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'cozinha' ? 'bg-red-600 text-white shadow-xl shadow-red-900/40' : 'hover:bg-white/5 text-gray-500'}`}
          >
            <Flame size={20} /> Cozinha
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            className={`text-left px-5 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === 'config' ? 'bg-red-600 text-white shadow-xl shadow-red-900/40' : 'hover:bg-white/5 text-gray-500'}`}
          >
            <Settings size={20} /> Configurações
          </button>
        </nav>
        
        <div className="p-8 border-t border-gray-900">
          <button onClick={signOut} className="flex items-center gap-3 text-gray-500 hover:text-red-500 font-black text-xs uppercase tracking-widest transition-all w-full">
            <LogOut size={20}/> Sair do B10
          </button>
          <div className="mt-8 opacity-20">
            <p className="text-[8px] font-black uppercase tracking-[0.3em]">B10 Gestão SaaS Premium</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 max-w-7xl w-full p-4 md:p-8 mx-auto overflow-y-auto">
        <div className="bg-white rounded-[40px] shadow-2xl min-h-[85vh] overflow-hidden border border-gray-100">
          {content()}
        </div>
      </main>
    </div>
  );
}
