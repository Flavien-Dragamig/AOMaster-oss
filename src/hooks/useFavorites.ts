import { useState, useEffect } from 'react';
import { getUserFavorites, isFavorite, toggleFavorite, getFavoritesCount, type Favorite } from '../services/favorites';
import type { Contract } from '../types';

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFavorites = async () => {
    setLoading(true);
    setError(null);
    const result = await getUserFavorites();

    if (result.error) {
      setError(result.error);
    } else {
      setFavorites(result.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const refresh = () => {
    loadFavorites();
  };

  return { favorites, loading, error, refresh };
}

export function useFavoriteStatus(contractId: string) {
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkFavorite = async () => {
      setLoading(true);
      const result = await isFavorite(contractId);
      setIsFav(result);
      setLoading(false);
    };

    if (contractId) {
      checkFavorite();
    }
  }, [contractId]);

  return { isFavorite: isFav, loading, setIsFavorite: setIsFav };
}

export function useFavoriteToggle(contractId: string, contractData: Contract) {
  const { isFavorite: isFav, loading: statusLoading, setIsFavorite } = useFavoriteStatus(contractId);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = async () => {
    setToggling(true);
    setError(null);

    const result = await toggleFavorite(contractId, contractData);

    if (result.success) {
      setIsFavorite(result.isFavorite);
    } else {
      setError(result.error || 'Erreur lors de la modification du favori');
    }

    setToggling(false);
    return result;
  };

  return { isFavorite: isFav, toggle, loading: statusLoading || toggling, error };
}

export function useFavoritesCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadCount = async () => {
    setLoading(true);
    const result = await getFavoritesCount();
    setCount(result);
    setLoading(false);
  };

  useEffect(() => {
    loadCount();
  }, []);

  const refresh = () => {
    loadCount();
  };

  return { count, loading, refresh };
}
