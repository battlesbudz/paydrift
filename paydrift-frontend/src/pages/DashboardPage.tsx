import { useState, useEffect } from 'react';
import { FileText, Clock, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import { dashboardAPI } from '../lib/api';

interface Stats {
  total_clients: number;
  total_invoices: number;
  pending_amount: number;
  overdue_amount: number;
  overdue_count: number;
  paid_this_month: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.stats()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatAmount = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    {
      label: 'Total clients',
      value: stats?.total_clients ?? 0,
      icon: Users,
      color: 'text-[#5B6AF0]',
      bgColor: 'bg-indigo-50',
    },
    {
      label: 'Total invoices',
      value: stats?.total_invoices ?? 0,
      icon: FileText,
      color: 'text-[#5B6AF0]',
      bgColor: 'bg-indigo-50',
    },
    {
      label: 'Pending amount',
      value: formatAmount(stats?.pending_amount ?? 0),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Overdue amount',
      value: formatAmount(stats?.overdue_amount ?? 0),
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      isAlert: true,
    },
    {
      label: 'Overdue count',
      value: stats?.overdue_count ?? 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Paid this month',
      value: formatAmount(stats?.paid_this_month ?? 0),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`bg-white rounded-xl p-6 border ${
              card.isAlert ? 'border-red-200' : 'border-gray-100'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <span className="text-sm font-medium text-gray-500">{card.label}</span>
            </div>
            <p className={`text-2xl font-bold ${card.isAlert ? 'text-red-600' : 'text-gray-900'} font-mono`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}