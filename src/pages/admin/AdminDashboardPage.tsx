import React, { useEffect, useState } from 'react';
import { Users, Mail, AlertCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface DashboardStats {
  totalUsers: number;
  premiumUsers: number;
  totalAlerts: number;
  totalMessages: number;
}

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    premiumUsers: 0,
    totalAlerts: 0,
    totalMessages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const [statsResponse, alertsResponse, messagesResponse] = await Promise.all([
        supabase.from('admin_user_stats').select('*').single(),
        supabase.from('alerts').select('id', { count: 'exact' }),
        supabase.from('email_logs').select('id', { count: 'exact' }),
      ]);

      setStats({
        totalUsers: statsResponse.data?.total_users || 0,
        premiumUsers: statsResponse.data?.premium_users || 0,
        totalAlerts: alertsResponse.count || 0,
        totalMessages: messagesResponse.count || 0,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Utilisateurs',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Utilisateurs Premium',
      value: stats.premiumUsers,
      icon: TrendingUp,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Alertes actives',
      value: stats.totalAlerts,
      icon: AlertCircle,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Messages',
      value: stats.totalMessages,
      icon: Mail,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Tableau de bord</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-lg`}>
                <card.icon className={`h-8 w-8 ${card.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Activité récente</h2>
          <p className="text-gray-600">Les statistiques d'activité seront affichées ici.</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Actions rapides</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/admin/users')}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Gérer les utilisateurs
            </button>
            <button
              onClick={() => navigate('/admin/messages')}
              className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Voir les messages
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
