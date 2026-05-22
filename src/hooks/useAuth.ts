import { useEffect, useState, useCallback } from 'react';
import { useAuth as useBaseAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Database, Json } from '../types/database';

type UserProfileRow = Database['public']['Tables']['user_profiles']['Row'];
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

export type UserRole = 'user' | 'pro' | 'admin';
export type UserProfile = UserProfileRow;

interface UseAuthReturn {
  // Base auth props from AuthContext
  user: ReturnType<typeof useBaseAuth>['user'];
  loading: boolean;
  error: ReturnType<typeof useBaseAuth>['error'];
  signUp: ReturnType<typeof useBaseAuth>['signUp'];
  signIn: ReturnType<typeof useBaseAuth>['signIn'];
  signInWithGoogle: ReturnType<typeof useBaseAuth>['signInWithGoogle'];
  signOut: ReturnType<typeof useBaseAuth>['signOut'];
  
  // Extended functionality
  profile: UserProfile | null;
  profileLoading: boolean;
  profileError: Error | null;
  updateProfile: (updates: UserProfileUpdate) => Promise<void>;
  isAdmin: boolean;
  isPro: boolean;
  hasPermission: (permission: string) => boolean;
  refreshProfile: () => void;
  getRemainingQuota: () => { searches: number; alerts: number };
}

// Cache keys
const PROFILE_CACHE_KEY = 'userProfile';

export function useAuth(): UseAuthReturn {
  const baseAuth = useBaseAuth();
  const { user } = baseAuth;
  const queryClient = useQueryClient();
  
  // State for permissions
  const [permissions, setPermissions] = useState<string[]>([]);

  // Fetch user profile
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
    refetch: refreshProfile
  } = useQuery({
    queryKey: [PROFILE_CACHE_KEY, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Fetch user permissions based on role
  useEffect(() => {
    const fetchPermissions = async () => {
      if (!profile) return;

      try {
        const rolePermissions: Record<UserRole, string[]> = {
          'user': ['read:tenders', 'create:alerts:basic'],
          'pro': ['read:tenders', 'create:alerts', 'export:tenders', 'save:searches'],
          'admin': ['read:tenders', 'create:alerts', 'export:tenders', 'save:searches', 'manage:users', 'manage:settings']
        };

        const isPremium = profile.premium_until ? new Date(profile.premium_until) > new Date() : false;
        const effectiveRole: UserRole = profile.role === 'admin' ? 'admin' : (isPremium ? 'pro' : 'user');

        setPermissions(rolePermissions[effectiveRole]);
      } catch (error) {
        console.error('Error fetching permissions:', error);
      }
    };

    fetchPermissions();
  }, [profile?.role, profile?.premium_until]);

  // Update user profile
  const updateProfile = useCallback(async (updates: UserProfileUpdate) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Invalidate and refetch profile
      queryClient.invalidateQueries([PROFILE_CACHE_KEY, user.id]);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }, [user?.id, queryClient]);

  // Helper functions
  const isAdmin = profile?.role === 'admin';
  const isPro = profile?.role === 'admin' || (profile?.premium_until ? new Date(profile.premium_until) > new Date() : false);
  
  const hasPermission = useCallback((permission: string) => {
    return permissions.includes(permission);
  }, [permissions]);

  // Get remaining quota for searches and alerts
  const getRemainingQuota = useCallback(() => {
    // This would typically come from a backend service
    // For now, we'll use a simple role-based system
    const quotas: Record<UserRole, { searches: number; alerts: number }> = {
      'user': { searches: 10, alerts: 3 },
      'pro': { searches: 1000, alerts: 50 },
      'admin': { searches: 9999, alerts: 9999 }
    };

    const isPremium = profile?.premium_until ? new Date(profile.premium_until) > new Date() : false;
    const effectiveRole: UserRole = profile?.role === 'admin' ? 'admin' : (isPremium ? 'pro' : 'user');

    return quotas[effectiveRole];
  }, [profile?.role, profile?.premium_until]);

  return {
    ...baseAuth,
    profile,
    profileLoading,
    profileError,
    updateProfile,
    isAdmin,
    isPro,
    hasPermission,
    refreshProfile,
    getRemainingQuota,
    loading: baseAuth.loading || profileLoading
  };
}

export default useAuth;
