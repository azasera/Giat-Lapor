import React, { useState, useEffect } from 'react';
import { Users, Search, Shield, UserCheck, Building2, Calendar } from 'lucide-react';
import { fetchAllProfiles, updateUserRole } from '../services/supabaseService';
import { showError, showLoading, dismissToast, showSuccess } from '../utils/toast';
import { Edit2, Save, X as CloseIcon } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: 'principal' | 'foundation' | 'admin';
  updated_at: string;
}

const UsersPage: React.FC = () => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'principal' | 'foundation' | 'admin'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [profiles, searchTerm, roleFilter]);

  const loadProfiles = async () => {
    const loadingToastId = showLoading('Memuat daftar akun...');
    setIsLoading(true);
    try {
      const data = await fetchAllProfiles();
      setProfiles(data as UserProfile[]);
    } catch (error) {
      console.error('Error loading profiles:', error);
      showError('Gagal memuat daftar akun. Silakan coba lagi.');
    } finally {
      dismissToast(loadingToastId);
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'principal' | 'foundation' | 'admin') => {
    const loadingToastId = showLoading('Memperbarui peran...');
    setIsUpdating(true);
    try {
      await updateUserRole(userId, newRole);

      // Update local state
      setProfiles(prev => prev.map(p =>
        p.id === userId ? { ...p, role: newRole, updated_at: new Date().toISOString() } : p
      ));

      setEditingUserId(null);
      showSuccess('Peran berhasil diperbarui');
    } catch (error) {
      console.error('Error updating role:', error);
      showError('Gagal memperbarui peran');
    } finally {
      dismissToast(loadingToastId);
      setIsUpdating(false);
    }
  };

  const filterProfiles = () => {
    let filtered = profiles;

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(p => p.role === roleFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        (p.username?.toLowerCase().includes(term) || false) ||
        (p.full_name?.toLowerCase().includes(term) || false) ||
        p.role.toLowerCase().includes(term)
      );
    }

    setFilteredProfiles(filtered);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'foundation':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'principal':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'foundation':
        return 'Yayasan';
      case 'principal':
        return 'Kepala Sekolah';
      default:
        return role;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'foundation':
        return <Building2 className="w-4 h-4" />;
      case 'principal':
        return <UserCheck className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const roleCounts = {
    all: profiles.length,
    principal: profiles.filter(p => p.role === 'principal').length,
    foundation: profiles.filter(p => p.role === 'foundation').length,
    admin: profiles.filter(p => p.role === 'admin').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Users className="w-8 h-8" />
              Daftar Akun
            </h1>
            <p className="text-emerald-100">Manajemen pengguna sistem</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Total Akun</p>
              <p className="text-2xl font-bold text-emerald-600">{roleCounts.all}</p>
            </div>
            <Users className="w-8 h-8 text-emerald-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-emerald-200 dark:border-emerald-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Kepala Sekolah</p>
              <p className="text-2xl font-bold text-emerald-600">{roleCounts.principal}</p>
            </div>
            <UserCheck className="w-8 h-8 text-emerald-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Yayasan</p>
              <p className="text-2xl font-bold text-blue-600">{roleCounts.foundation}</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">Admin</p>
              <p className="text-2xl font-bold text-purple-600">{roleCounts.admin}</p>
            </div>
            <Shield className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari nama, username, atau role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${roleFilter === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              Semua ({roleCounts.all})
            </button>
            <button
              onClick={() => setRoleFilter('principal')}
              className={`px-4 py-2 rounded-lg transition-colors ${roleFilter === 'principal'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              Kepsek ({roleCounts.principal})
            </button>
            <button
              onClick={() => setRoleFilter('foundation')}
              className={`px-4 py-2 rounded-lg transition-colors ${roleFilter === 'foundation'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              Yayasan ({roleCounts.foundation})
            </button>
            <button
              onClick={() => setRoleFilter('admin')}
              className={`px-4 py-2 rounded-lg transition-colors ${roleFilter === 'admin'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              Admin ({roleCounts.admin})
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pengguna
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Terakhir Diupdate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    {profiles.length === 0 ? 'Tidak ada akun yang terdaftar' : 'Tidak ada akun yang cocok dengan filter'}
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {profile.avatar_url ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={profile.avatar_url}
                              alt={profile.full_name || profile.username || 'User'}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold">
                              {(profile.full_name?.[0] || profile.username?.[0] || 'U').toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {profile.full_name || profile.username || 'Tidak ada nama'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            @{profile.username || 'no-username'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUserId === profile.id ? (
                        <select
                          value={profile.role}
                          onChange={(e) => handleRoleChange(profile.id, e.target.value as any)}
                          disabled={isUpdating}
                          className="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                          <option value="principal">Kepala Sekolah</option>
                          <option value="foundation">Yayasan</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(profile.role)}`}>
                          {getRoleIcon(profile.role)}
                          {getRoleLabel(profile.role)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {formatDate(profile.updated_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-500 dark:text-gray-400 truncate max-w-[100px]">
                        {profile.id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {editingUserId === profile.id ? (
                        <button
                          onClick={() => setEditingUserId(null)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                          title="Batal"
                        >
                          <CloseIcon className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingUserId(profile.id)}
                          className="text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-300"
                          title="Edit Peran"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
        <p className="text-sm text-emerald-700 dark:text-emerald-300">
          Menampilkan <strong>{filteredProfiles.length}</strong> dari <strong>{profiles.length}</strong> akun terdaftar
        </p>
      </div>
    </div>
  );
};

export default UsersPage;

