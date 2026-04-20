import { ChefHat, Smartphone, BarChart3, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

// === COLOQUE O SEU LINK DE ASSINATURA DO MERCADO PAGO AQUI ===
const MERCADO_PAGO_SUBSCRIPTION_LINK = "https://www.mercadopago.com.br/subscriptions/checkout/PLAN_ID_AQUI";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-black text-red-600 flex items-center gap-2">
          <ChefHat /> B10 Gestão
        </h1>
        <Link to="/login" className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded transition-colors">
          Acesso Restrito
        </Link>
      </header>
      
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 flex flex-col items-center text-center">
        <h2 className="text-5xl font-black text-gray-900 mb-6 tracking-tight">O Sistema Definitivo para a sua <span className="text-red-600">Churrascaria</span></h2>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl">Livre-se do papel. Garçons lançam na mesa, a cozinha recebe na tela, e você controla o fluxo de caixa de onde estiver. Tudo integrado.</p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <a href="#planos" className="bg-red-600 hover:bg-black text-white font-bold py-4 px-8 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all">
            Começar Agora
          </a>
          <Link to="/register" className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-4 px-8 rounded-full text-lg shadow-md border border-gray-200 transition-all">
            Criar Conta Grátis
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20 w-full text-left">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <Smartphone className="text-red-500 mb-4" size={40} />
            <h3 className="text-xl font-bold mb-2">Painel do Garçom</h3>
            <p className="text-gray-600">Lançamentos em tempo real sem chance de bater cabeças. Controle de 10% automático.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <ChefHat className="text-red-500 mb-4" size={40} />
            <h3 className="text-xl font-bold mb-2">Monitor de Cozinha</h3>
            <p className="text-gray-600">Os pratos pulam na tela. Avisos sonoros ajudam a manter a esteira em altíssima velocidade.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <BarChart3 className="text-red-500 mb-4" size={40} />
            <h3 className="text-xl font-bold mb-2">Gestão do Dono</h3>
            <p className="text-gray-600">DRE ao vivo, controle de estoque à prova de furos e importação por Inteligência Excel.</p>
          </div>
        </div>
      </main>

      <div id="planos" className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black mb-8">Escolha seu Plano</h2>
          <div className="bg-gray-50 border-2 border-red-200 rounded-2xl p-8 max-w-sm mx-auto shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-red-600 text-white font-bold text-xs py-1 px-4 rounded-bl-lg">MAIS VENDIDO</div>
            <h3 className="text-2xl font-bold mb-2">SaaS Profissional</h3>
            <div className="text-4xl font-black mb-6">R$ 99<span className="text-lg text-gray-500 font-normal">/mês</span></div>
            <ul className="text-left mb-8 flex flex-col gap-3">
              <li className="flex items-center gap-2"><ShieldCheck className="text-green-500" size={20}/> Garçons Ilimitados</li>
              <li className="flex items-center gap-2"><ShieldCheck className="text-green-500" size={20}/> Relatórios Excel</li>
              <li className="flex items-center gap-2"><ShieldCheck className="text-green-500" size={20}/> Suporte VIP</li>
            </ul>
            {/* Integração Mercado Pago via Link de Pagamento */}
            <a href={MERCADO_PAGO_SUBSCRIPTION_LINK} target="_blank" className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded text-center transition-colors">
              Assinar com PIX / Cartão
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
