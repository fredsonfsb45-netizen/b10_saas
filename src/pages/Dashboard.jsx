import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, UtensilsCrossed, Flame, Settings } from 'lucide-react';
import FinancialSummary from '../components/FinancialSummary';
import TableOverview from '../components/TableOverview';

export default function Dashboard() {
  const { user, userRole, tenantData, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState(userRole === 'dono' ? 'dono' : 'garcom');

  const corBrand = tenantData?.cor_primaria || '#dc2626'; // Vermelho padrao B10
  const nomeBrand = tenantData?.nome || 'B10 Gestão';
  
  const content = () => {
    switch (activeTab) {
      case 'dono':
        return (
          <div className="animate-in fade-in duration-500">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
              <h2 className="text-2xl font-black text-gray-800">Painel Administrativo</h2>
              <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">Resumo Financeiro</div>
            </div>
            <FinancialSummary />
            <div className="p-6">
              <div className="bg-gray-900 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                <div className="relative z-10">
                  <h3 className="text-2xl font-black mb-2">Seu DRE está sendo processado</h3>
                  <p className="text-gray-400 max-w-md text-sm">O sistema está vinculando automaticamente todos os seus lançamentos antigos ao ID do seu restaurante.</p>
                </div>
                <button className="bg-white text-black font-black px-6 py-3 rounded-full hover:bg-gray-200 transition-all z-10">
                  Exportar Relatórios
                </button>
                <div className="absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10">
                  <LayoutDashboard size={200} />
                </div>
              </div>
            </div>
          </div>
        );
      case 'garcom':
        return (
          <div className="animate-in slide-in-from-right duration-500">
            <TableOverview />
          </div>
        );
      case 'cozinha':
        return (
          <div className="p-12 text-center flex flex-col items-center justify-center min-h-[60vh] animate-in zoom-in duration-500">
            <div className="p-6 bg-orange-100 rounded-full text-orange-600 mb-6">
              <Flame size={48} />
            </div>
            <h2 className="text-3xl font-black text-gray-800 mb-4">Monitor da Cozinha</h2>
            <p className="text-gray-500 max-w-sm mx-auto">Aguardando novos pedidos dos garçons para exibição em tempo real.</p>
          </div>
        );
      default:
        return <div>Selecione um menu.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar / Topbar Muttante (White-label) */}
      <aside className="bg-gray-900 text-white w-full md:w-64 flex-shrink-0 flex flex-col relative">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-black truncate" style={{ color: corBrand }}>
            {tenantData?.logo_url ? <img src={tenantData.logo_url} className="h-8 mb-2" alt="Logo" /> : nomeBrand}
          </h2>
          <span className="text-xs text-gray-400">Usuário: {user?.email}</span>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          {userRole === 'dono' && (
            <button 
              onClick={() => setActiveTab('dono')}
              className={`text-left px-4 py-3 rounded font-bold transition-colors flex items-center gap-2 ${activeTab === 'dono' ? 'text-white' : 'hover:bg-gray-800 text-gray-300'}`}
              style={activeTab === 'dono' ? { backgroundColor: corBrand } : {}}
            >
              <LayoutDashboard size={18} /> Painel Administrativo
            </button>
          )}
          <button 
            onClick={() => setActiveTab('garcom')}
            className={`text-left px-4 py-3 rounded font-bold transition-colors flex items-center gap-2 ${activeTab === 'garcom' ? 'text-white' : 'hover:bg-gray-800 text-gray-300'}`}
            style={activeTab === 'garcom' ? { backgroundColor: corBrand } : {}}
          >
            <UtensilsCrossed size={18} /> Lançamentos Mesa
          </button>
          <button 
            onClick={() => setActiveTab('cozinha')}
            className={`text-left px-4 py-3 rounded font-bold transition-colors flex items-center gap-2 ${activeTab === 'cozinha' ? 'text-white' : 'hover:bg-gray-800 text-gray-300'}`}
            style={activeTab === 'cozinha' ? { backgroundColor: corBrand } : {}}
          >
            <Flame size={18} /> Monitor Cozinha
          </button>
        </nav>
        
        {/* Rodapé SaaS - Sua Marca */}
        <div className="p-4 border-t border-gray-800 pb-20 md:pb-4">
          <button onClick={signOut} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors w-full px-4 py-2 mb-4">
            <LogOut size={18}/> Sair do Sistema
          </button>
          <div className="text-center text-[10px] text-gray-600 uppercase tracking-widest opacity-50 mt-4">
            Powered by<br/><span className="font-bold text-gray-400">B10 Gestão SaaS</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full p-6 mx-auto overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-xl min-h-[80vh] overflow-hidden border border-gray-100">
          {content()}
        </div>
      </main>
    </div>
  );
}
