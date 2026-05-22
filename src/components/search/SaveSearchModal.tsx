import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useSavedSearches } from '../../hooks/useSavedSearches';
import { useToast } from '../../contexts/ToastContext';
import type { SearchFilters } from '../../types';

interface SaveSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchParams: SearchFilters;
}

export function SaveSearchModal({ isOpen, onClose, searchParams }: SaveSearchModalProps) {
  const { createSavedSearch, isCreating } = useSavedSearches();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Le nom est requis');
      return;
    }

    if (name.length > 100) {
      setError('Le nom ne peut pas dépasser 100 caractères');
      return;
    }

    try {
      await createSavedSearch({
        name: name.trim(),
        searchParams,
        description: description.trim() || undefined,
      });

      showToast('Recherche sauvegardée avec succès', 'success');
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError('Une erreur est survenue lors de la sauvegarde');
      showToast('Erreur lors de la sauvegarde', 'error');
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Sauvegarder cette recherche">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="search-name" className="block text-sm font-medium text-gray-700 mb-1">
            Nom de la recherche <span className="text-red-500">*</span>
          </label>
          <Input
            id="search-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Marchés informatiques Île-de-France"
            maxLength={100}
            required
            disabled={isCreating}
          />
          <p className="text-xs text-gray-500 mt-1">{name.length}/100 caractères</p>
        </div>

        <div>
          <label htmlFor="search-description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (optionnelle)
          </label>
          <textarea
            id="search-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez brièvement cette recherche..."
            rows={3}
            disabled={isCreating}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isCreating}>
            Annuler
          </Button>
          <Button type="submit" disabled={isCreating || !name.trim()}>
            {isCreating ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
