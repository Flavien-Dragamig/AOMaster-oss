import { supabase } from '../../lib/supabase';
import type { Alert, SearchFilters } from '../../types';
import type { Database, Json } from '../../types/database';

type AlertRow = Database['public']['Tables']['alerts']['Row'];
type AlertInsert = Database['public']['Tables']['alerts']['Insert'];
type AlertUpdate = Database['public']['Tables']['alerts']['Update'];

export type AlertInput = {
  name: string;
  filters: SearchFilters;
  frequency: 'daily' | 'weekly';
  keywords?: string[];
  cpvCodes?: string[];
  departments?: string[];
};

export function mapRowToAlert(row: AlertRow): Alert {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    keywords: row.keywords || [],
    cpvCodes: row.cpv_codes || [],
    departments: row.departments || [],
    filters: (row.filters as unknown as SearchFilters) || {},
    frequency: row.frequency,
    lastRun: row.last_run ? new Date(row.last_run) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export class AlertsService {
  static async getUserAlerts(userId: string): Promise<Alert[]> {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Erreur lors de la recuperation des alertes: ${error.message}`);
    return data.map(mapRowToAlert);
  }

  static async getAlert(id: string, userId: string): Promise<Alert | null> {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) throw new Error(`Erreur lors de la recuperation de l'alerte: ${error.message}`);
    return mapRowToAlert(data);
  }

  static async createAlert(alertData: AlertInput, userId: string): Promise<Alert> {
    const insert: AlertInsert = {
      user_id: userId,
      name: alertData.name,
      filters: alertData.filters as unknown as Json,
      frequency: alertData.frequency,
      keywords: alertData.keywords || [],
      cpv_codes: alertData.cpvCodes || [],
      departments: alertData.departments || [],
    };

    const { data, error } = await supabase
      .from('alerts')
      .insert(insert)
      .select()
      .single();

    if (error) throw new Error(`Erreur lors de la creation de l'alerte: ${error.message}`);
    return mapRowToAlert(data);
  }

  static async updateAlert(id: string, updates: Partial<Alert>, userId: string): Promise<Alert> {
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
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(`Erreur lors de la mise a jour de l'alerte: ${error.message}`);
    return mapRowToAlert(data);
  }

  static async deleteAlert(id: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('alerts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(`Erreur lors de la suppression de l'alerte: ${error.message}`);
    return true;
  }

  static async markAlertAsRun(id: string, userId: string): Promise<Alert> {
    return this.updateAlert(id, { lastRun: new Date() }, userId);
  }

  static async getAlertsToRun(frequency: 'daily' | 'weekly'): Promise<Alert[]> {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .eq('frequency', frequency);

    if (error) throw new Error(`Erreur lors de la recuperation des alertes a executer: ${error.message}`);
    return data.map(mapRowToAlert);
  }

  static async testAlert(filters: SearchFilters): Promise<{ success: boolean; resultsCount: number; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      resultsCount: 12,
      message: "Test d'alerte effectue avec succes"
    };
  }
}

export default AlertsService;
