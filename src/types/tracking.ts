import type { Database } from './database';

type TrackingConfigRow = Database['public']['Tables']['tracking_config']['Row'];

export interface ConversionEvent {
  event_name: string;
  label: string;
  description: string;
  active: boolean;
}

export type TrackingConfig = Omit<TrackingConfigRow, 'id' | 'updated_by' | 'conversion_events'> & {
  conversion_events: ConversionEvent[];
};

export function mapRowToTrackingConfig(row: TrackingConfigRow): TrackingConfig {
  return {
    enabled: row.enabled,
    conversion_id: row.conversion_id,
    conversion_events: (row.conversion_events as unknown as ConversionEvent[]) || [],
    updated_at: row.updated_at,
  };
}
