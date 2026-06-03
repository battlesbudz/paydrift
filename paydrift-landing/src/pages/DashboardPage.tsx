import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Bell,
  Plus,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { dashboard } from '../lib/api';

interface Stats {
  total_clients: number;
  total_invoices: number;
  pending_amount: number;
  overdue_amount: number;
  paid_this_month: number;
  total_reminders_sent: number;
  plan: string;
}

export function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await dashboard.stats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getPlanColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'pro':
        return 'bg-purple-100 text-purple-700';
      case 'agency':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const statCards = [
    {
      label: 'Total Clients',
      value: stats?.total_clients ?? 0,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Total Invoices',
      value: stats?.total_invoices ?? 0,
      icon: FileText,
      color: 'bg-green-50 text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Pending Amount',
      value: stats ? formatCurrency(stats.pending_amount) : '$0.00',
      icon: Clock,
      color: 'bg-amber-50 text-amber-600',
      bgColor: 'bg-amber-100',
      isCurrency: true,
    },
    {
      label: 'Overdue Amount',
      value: stats ? formatCurrency(stats.overdue_amount) : '$0.00',
      icon: AlertCircle,
      color: 'bg-red-50 text-red-600',
      bgColor: 'bg-red-100',
      isCurrency: true,
    },
    {
      label: 'Paid This Month',
      value: stats ? formatCurrency(stats.paid_this_month) : '$0.00',
      icon: CheckCircle,
      color: 'bg-emerald-50 text-emerald-600',
      bgColor: 'bg-emerald-100',
      isCurrency: true,
    },
  ];

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to load dashboard</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your overview.</p>
        </div>
        {stats?.plan && (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-4 sm:mt-0 ${getPlanColor(stats.plan)}`}>
            <DollarSign className="w-4 h-4 mr-1" />
            {stats.plan.charAt(0).toUpperCase() + stats.plan.slice(1)} Plan
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                  <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                <div className="h-8 bg-gray-200 rounded w-24" />
              </div>
            ))
          : statCards.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.isCurrency ? stat.value : stat.value}
                </p>
              </div>
            ))}
      </div>

      {/* Reminders Stat */}
      <div className="bg-gradient-to-r from-[#5B6AF0] to-[#8B9AFF] rounded-xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Bell className="w-7 h-7" />
            </div>
            <div>
              <p className="text-white/80 text-sm font-medium">Total Reminders Sent</p>
              <p className="text-3xl font-bold">
                {loading ? (
                  <span className="animate-pulse">---</span>
                ) : (
                  stats?.total_reminders_sent ?? 0
                )}
              </p>
            </div>
          </div>
          <div className="hidden sm:block">
            <TrendingUp className="w-8 h-8 text-white/60" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            to="/clients"
            className="flex items-center gap-4 p-4 bg-[#F8F9FF] rounded-xl hover:bg-[#EEF0FF] transition-colors group"
          >
            <div className="w-12 h-12 bg-[#5B6AF0]/10 rounded-xl flex items-center justify-center group-hover:bg-[#5B6AF0] transition-colors">
              <Plus className="w-6 h-6 text-[#5B6AF0] group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Add Client</p>
              <p className="text-sm text-gray-500">Create a new client profile</p>
            </div>
          </Link>
          <Link
            to="/invoices"
            className="flex items-center gap-4 p-4 bg-[#F8F9FF] rounded-xl hover:bg-[#EEF0FF] transition-colors group"
          >
            <div className="w-12 h-12 bg-[#5B6AF0]/10 rounded-xl flex items-center justify-center group-hover:bg-[#5B6AF0] transition-colors">
              <FileText className="w-6 h-6 text-[#5B6AF0] group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Add Invoice</p>
              <p className="text-sm text-gray-500">Create a new invoice</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}