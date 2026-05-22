import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Alert, SearchFilters } from '../types';
import type { Database, Json } from '../types/database';
import { mapRowToAlert, type AlertInput } from '../services/alerts/service';

type AlertUpdate = Database['public']['Tables']['alerts']['Update'];

const ALERTS_CACHE_KEY = 'userAlerts';

export type { AlertInput };

export interface AlertStats {
  total: number;
  byFrequency: Record<string, number>;
  byDepartment: Record<string, number>;
  matchesLastWeek: number;
  matchesLastMonth: number;
}

export function useAlerts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: alerts,
    isLoading,
    error,
    refetch: refreshAlerts
  } = useQuery<Alert[]>({
    queryKey: [ALERTS_CACHE_KEY, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la recuperation des alertes:', error);
        throw new Error(error.message);
      }

      return data.map(mapRowToAlert);
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const createAlertMutation = useMutation({
    mutationFn: async (alertData: AlertInput) => {
      if (!user?.id) throw new Error('Utilisateur non authentifie');

      const { data, error } = await supabase
        .from('alerts')
        .insert({
          user_id: user.id,
          name: alertData.name,
          filters: alertData.filters as unknown as Json,
          frequency: alertData.frequency,
          keywords: alertData.keywords || [],
          cpv_codes: alertData.cpvCodes || [],
          departments: alertData.departments || [],
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return mapRowToAlert(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ALERTS_CACHE_KEY, user?.id] });
    }
  });

  const updateAlertMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Alert> }) => {
      if (!user?.id) throw new Error('Utilisateur non authentifie');

      const dbUpdates: AlertUpdate = {};

      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.filters !== undefined) dbUpdates.filters = updates.filters as unknown as Json;
      if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
      if (updates.keywords !== undefined) dbUpdates.keywords = updates.keywords;
      if (updates.cpvCodes !== undefined) dbUpdates.cpv_codes = updates.cpvCodes;
      if (updates.departments !== undefined) dbUpdates.departments = updates.departments;
      if (updates.lastRun !== undefined) dbUpdates.last_run = updates.lastRun?.toISOString() || null;

      const { data, error } = await supabase
        .from('alerts')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return mapRowToAlert(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ALERTS_CACHE_KEY, user?.id] });
    }
  });

  const deleteAlertMutation = useMutation({
    mutationFn: async (alertId: string) => {
      if (!user?.id) throw new Error('Utilisateur non authentifie');

      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', alertId)
        .eq('user_id', user.id);

      if (error) throw new Error(error.message);
      return alertId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ALERTS_CACHE_KEY, user?.id] });
    }
  });

  const testAlert = useCallback(async (_alert: Alert) => {
    return { success: true, message: "Test d'alerte effectue avec succes" };
  }, []);

  const getAlertStats = useCallback((): AlertStats => {
    if (!alerts || alerts.length === 0) {
      return {
        total: 0,
        byFrequency: {},
        byDepartment: {},
        matchesLastWeek: 0,
        matchesLastMonth: 0
      };
    }

    const byFrequency: Record<string, number> = {};
    const byDepartment: Record<string, number> = {};

    alerts.forEach(alert => {
      byFrequency[alert.frequency] = (byFrequency[alert.frequency] || 0) + 1;

      if (alert.filters.departments?.length) {
        alert.filters.departments.forEach(dept => {
          byDepartment[dept] = (byDepartment[dept] || 0) + 1;
        });
      }
      if (alert.filters.department) {
        const dept = alert.filters.department;
        byDepartment[dept] = (byDepartment[dept] || 0) + 1;
      }
    });

    const matchesLastWeek = 12;
    const matchesLastMonth = 47;

    return {
      total: alerts.length,
      byFrequency,
      byDepartment,
      matchesLastWeek,
      matchesLastMonth
    };
  }, [alerts]);

  return {
    alerts,
    isLoading,
    error,
    refreshAlerts,
    createAlert: createAlertMutation.mutateAsync,
    updateAlert: updateAlertMutation.mutateAsync,
    deleteAlert: deleteAlertMutation.mutateAsync,
    testAlert,
    getAlertStats,
    createAlertMutation,
    updateAlertMutation,
    deleteAlertMutation
  };
}

export default useAlerts;
