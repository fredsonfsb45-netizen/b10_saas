import { ClipboardList, Clock, CheckCircle2 } from 'lucide-react';

export default function TableOverview() {
  const tables = [
    { id: 'Mesa 01', status: 'ocupada', total: 'R$ 156,00', time: '45 min' },
    { id: 'Mesa 02', status: 'disponivel', total: '-', time: '-' },
    { id: 'Mesa 03', status: 'ocupada', total: 'R$ 89,50', time: '20 min' },
    { id: 'Mesa 04', status: 'aguardando', total: 'R$ 210,00', time: '1h 10min' },
    { id: 'Mesa 05', status: 'disponivel', total: '-', time: '-' },
    { id: 'Mesa 06', status: 'ocupada', total: 'R$ 45,00', time: '10 min' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'ocupada': return 'border-orange-200 bg-orange-50 text-orange-700';
      case 'disponivel': return 'border-green-200 bg-green-50 text-green-700';
      case 'aguardando': return 'border-blue-200 bg-blue-50 text-blue-700';
      default: return 'border-gray-200 bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ClipboardList className="text-red-600" /> Status das Mesas
        </h2>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">Livre</div>
          <div className="flex items-center gap-1 text-xs font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded">Ocupada</div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table, index) => (
          <div key={index} className={`p-4 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md ${getStatusColor(table.status)}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-lg">{table.id}</span>
              {table.status === 'disponivel' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
            </div>
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wider font-bold opacity-60">Consumo</p>
              <p className="text-xl font-black">{table.total}</p>
            </div>
            {table.time !== '-' && (
              <p className="text-[10px] mt-2 opacity-70">Permanência: {table.time}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
