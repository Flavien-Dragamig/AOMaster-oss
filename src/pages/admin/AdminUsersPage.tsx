import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, CheckCircle, XCircle, Crown, User, Search, Mail, Upload, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { AddUserModal } from '../../components/admin/AddUserModal';
import { ImportUsersModal } from '../../components/admin/ImportUsersModal';
import type { Database } from '../../types/database';

type UserProfileRow = Database['public']['Tables']['user_profiles']['Row'];

const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoCredentials, setDemoCredentials] = useState<{ email: string; password: string } | null>(null);
  const [stats, setStats] = useState({
    total_users: 0,
    total_admins: 0,
    premium_users: 0,
    new_users_week: 0,
    new_users_month: 0,
  });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_user_stats')
        .select('*')
        .single();

      if (error) throw error;
      if (data) setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) throw error;

      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Erreur lors de la modification du rôle');
    }
  };

  const createDemoPremium = async () => {
    setDemoLoading(true);
    setDemoCredentials(null);
    try {
      const { data, error } = await supabase.functions.invoke('create-demo-premium');
      if (error) throw error;
      setDemoCredentials(data.credentials);
      fetchUsers();
      fetchStats();
    } catch (err) {
      console.error('Erreur création compte démo:', err);
      alert('Erreur lors de la création du compte démo');
    } finally {
      setDemoLoading(false);
    }
  };

  const isPremium = (premiumUntil: string | null) => {
    if (!premiumUntil) return false;
    return new Date(premiumUntil) > new Date();
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestion des utilisateurs</h1>
        <p className="text-gray-600 mt-2">Gérez les comptes utilisateurs et leurs permissions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total utilisateurs</div>
          <div className="text-3xl font-bold text-gray-900 mt-2">{stats.total_users}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Administrateurs</div>
          <div className="text-3xl font-bold text-orange-500 mt-2">{stats.total_admins}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Utilisateurs Premium</div>
          <div className="text-3xl font-bold text-green-500 mt-2">{stats.premium_users}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Nouveaux (7j)</div>
          <div className="text-3xl font-bold text-blue-500 mt-2">{stats.new_users_week}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">Nouveaux (30j)</div>
          <div className="text-3xl font-bold text-purple-500 mt-2">{stats.new_users_month}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Mail className="h-5 w-5" />
              <span>Inviter un utilisateur</span>
            </button>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Upload className="h-5 w-5" />
              <span>Importer des utilisateurs (CSV)</span>
            </button>
            <button
              onClick={createDemoPremium}
              disabled={demoLoading}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
            >
              <UserPlus className="h-5 w-5" />
              <span>{demoLoading ? 'Création...' : 'Créer compte démo premium'}</span>
            </button>
          </div>

          {demoCredentials && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Identifiants du compte démo :</h3>
              <p className="text-sm text-gray-600">Email : <code className="bg-gray-100 px-1 rounded">{demoCredentials.email}</code></p>
              <p className="text-sm text-gray-600">Mot de passe : <code className="bg-gray-100 px-1 rounded">{demoCredentials.password}</code></p>
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur par email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut Premium
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date d'inscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.user_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.email}</div>
                        <div className="text-xs text-gray-500">ID: {user.user_id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <Crown className="h-3 w-3 mr-1" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <User className="h-3 w-3 mr-1" />
                          Utilisateur
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isPremium(user.premium_until) ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        <div>
                          <div className="text-sm font-medium">Premium</div>
                          <div className="text-xs text-gray-500">
                            Jusqu'au {format(new Date(user.premium_until!), 'dd/MM/yyyy', { locale: fr })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-400">
                        <XCircle className="h-5 w-5 mr-2" />
                        <span className="text-sm">Gratuit</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: fr })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => toggleUserRole(user.user_id, user.role)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        user.role === 'admin'
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          : 'bg-orange-500 text-white hover:bg-orange-600'
                      }`}
                    >
                      {user.role === 'admin' ? 'Rétrograder' : 'Promouvoir Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>

      <AddUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onUserAdded={() => {
          fetchUsers();
          fetchStats();
        }}
      />

      <ImportUsersModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onUsersImported={() => {
          fetchUsers();
          fetchStats();
        }}
      />
    </div>
  );
};

export default AdminUsersPage;
