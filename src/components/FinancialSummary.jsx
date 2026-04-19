import { TrendingUp, TrendingDown, DollarSign, Users } from 'lucide-react';

export default function FinancialSummary() {
  const stats = [
    { title: 'Vendas Hoje', value: 'R$ 1.250,00', icon: <DollarSign className="text-green-500" />, change: '+12%', color: 'bg-green-50' },
    { title: 'Despesas', value: 'R$ 450,00', icon: <TrendingDown className="text-red-500" />, change: '-5%', color: 'bg-red-50' },
    { title: 'Clientes', value: '42', icon: <Users className="text-blue-500" />, change: '+8%', color: 'bg-blue-50' },
    { title: 'Lucro Estimado', value: 'R$ 800,00', icon: <TrendingUp className="text-purple-500" />, change: '+15%', color: 'bg-purple-50' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${stat.color}`}>
              {stat.icon}
            </div>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {stat.change}
            </span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">{stat.title}</h3>
          <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
