import { Star } from 'lucide-react';
import { useFavoriteToggle } from '../../hooks/useFavorites';
import { useTracking } from '../../contexts/TrackingContext';
import type { Contract } from '../../types';

interface FavoriteButtonProps {
  contract: Contract;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onToggle?: (isFavorite: boolean) => void;
}

export function FavoriteButton({ contract, size = 'md', showLabel = false, onToggle }: FavoriteButtonProps) {
  const { isFavorite, toggle, loading, error } = useFavoriteToggle(contract.id, contract);
  const { trackEvent } = useTracking();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const result = await toggle();
    if (result.success) {
      if (result.isFavorite) {
        trackEvent('add_favorite');
      }
      onToggle?.(result.isFavorite);
    }
  };

  const sizeClasses = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`
          ${sizeClasses[size]}
          rounded-full transition-all duration-200
          ${isFavorite
            ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
          }
          ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2
        `}
        title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        <Star
          size={iconSizes[size]}
          fill={isFavorite ? 'currentColor' : 'none'}
          className="transition-transform duration-200 hover:scale-110"
        />
      </button>

      {showLabel && (
        <span className="text-sm text-gray-600">
          {isFavorite ? 'Favori' : 'Ajouter'}
        </span>
      )}

      {error && (
        <span className="text-xs text-red-600">{error}</span>
      )}
    </div>
  );
}
