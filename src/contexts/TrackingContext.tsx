import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { TrackingConfig } from '../types/tracking';
import { mapRowToTrackingConfig } from '../types/tracking';

interface TrackingContextType {
  config: TrackingConfig | null;
  loading: boolean;
  trackEvent: (eventName: string, params?: Record<string, unknown>) => void;
  trackPageView: (path: string) => void;
  refreshConfig: () => Promise<void>;
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined);

export const TrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<TrackingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const scriptInjectedRef = useRef(false);

  const fetchConfig = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tracking_config')
        .select('*')
        .eq('id', 'singleton')
        .single();

      if (!error && data) {
        setConfig(mapRowToTrackingConfig(data));
      }
    } catch (err) {
      console.error('Failed to load tracking config:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const injectGtagScript = useCallback((conversionId: string) => {
    if (scriptInjectedRef.current) return;
    if (!conversionId) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${conversionId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: unknown[]) {
      window.dataLayer.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', conversionId);

    scriptInjectedRef.current = true;
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  useEffect(() => {
    if (config?.enabled && config?.conversion_id) {
      injectGtagScript(config.conversion_id);
    }
  }, [config, injectGtagScript]);

  const trackEvent = useCallback((eventName: string, params?: Record<string, unknown>) => {
    if (!config?.enabled || !config?.conversion_id) return;
    if (typeof window.gtag !== 'function') return;

    const event = config.conversion_events.find(
      (e) => e.event_name === eventName && e.active && e.label
    );
    if (!event) return;

    window.gtag('event', 'conversion', {
      send_to: `${config.conversion_id}/${event.label}`,
      ...params,
    });
  }, [config]);

  const trackPageView = useCallback((path: string) => {
    if (!config?.enabled || !config?.conversion_id) return;
    if (typeof window.gtag !== 'function') return;

    window.gtag('config', config.conversion_id, {
      page_path: path,
    });
  }, [config]);

  return (
    <TrackingContext.Provider value={{ config, loading, trackEvent, trackPageView, refreshConfig: fetchConfig }}>
      {children}
    </TrackingContext.Provider>
  );
};

export const useTracking = () => {
  const context = useContext(TrackingContext);
  if (context === undefined) {
    throw new Error('useTracking must be used within a TrackingProvider');
  }
  return context;
};
