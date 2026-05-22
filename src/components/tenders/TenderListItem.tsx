import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import type { Tender } from '../../types';
import { Calendar, MapPin, FileText, ArrowRight, Briefcase } from 'lucide-react';
import { FavoriteButton } from '../favorites/FavoriteButton';
import { tenderToContract } from '../../lib/utils/tender-to-contract';

interface TenderListItemProps {
  tender: Tender;
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return 'N/D';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const cleanBadgeText = (text: string | undefined): string => {
  if (!text) return 'N/D';
  return text.endsWith('/') ? text.slice(0, -1) : text;
};

const getCategoryBadgeClass = (category: string | undefined): string => {
  if (!category) return 'bg-gray-100 text-gray-800';

  const lowerCategory = category.toLowerCase();

  if (lowerCategory.includes('avis de march')) {
    return 'bg-green-100 text-green-800';
  } else if (lowerCategory.includes('résultat de march') || lowerCategory.includes('avis d\'attribution')) {
    return 'bg-purple-100 text-purple-800';
  } else if (lowerCategory.includes('rectificatif') || lowerCategory.includes('modification')) {
    return 'bg-amber-100 text-amber-800';
  } else if (lowerCategory.includes('annulation')) {
    return 'bg-red-100 text-red-800';
  } else {
    return 'bg-gray-100 text-gray-800';
  }
};

const TenderListItem: React.FC<TenderListItemProps> = ({ tender }) => {
  const location = useLocation();

  return (
    <Link
      to={`/contract/boamp/${tender.id}`}
      state={{ tender, searchParams: location.search }}
      className="block group"
    >
      <div className="bg-white h-full shadow-md rounded-lg border border-gray-200 overflow-hidden hover:shadow-xl hover:border-peach-500 transition-all duration-300 flex flex-col cursor-pointer">
        <div className="p-6 flex-grow">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getCategoryBadgeClass(tender.natureCategorie)}`}>
                {cleanBadgeText(tender.natureCategorie) || tender.status.charAt(0).toUpperCase() + tender.status.slice(1)}
              </span>
              <div onClick={(e) => e.preventDefault()}>
                <FavoriteButton contract={tenderToContract(tender)} size="sm" />
              </div>
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <MapPin size={14} className="mr-1.5" />
              {Array.isArray(tender.department)
                ? tender.department.join(', ')
                : (tender.department || 'N/D')}
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-800 group-hover:text-peach-600 transition-colors duration-300 leading-tight mb-3 h-20 overflow-hidden">
            {tender.title}
          </h3>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <FileText size={14} className="mr-2 text-gray-400" />
              <span>Type: <strong>{tender.type || 'Non spécifié'}</strong></span>
            </div>
            <div className="flex items-center">
              <Briefcase size={14} className="mr-2 text-gray-400" />
              <span>Acheteur: <strong>{tender.buyerName || tender.contractingAuthority?.name || 'Non spécifié'}</strong></span>
            </div>
            <div className="flex items-center">
              <Calendar size={14} className="mr-2 text-gray-400" />
              <span>Publié: <strong>{formatDate(tender.publicationDate)}</strong></span>
            </div>
            {tender.submissionDeadline && (
              <div className="flex items-center text-red-600 font-medium">
                <Calendar size={14} className="mr-2" />
                <span>Clôture: <strong>{formatDate(tender.submissionDeadline)}</strong></span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 mt-auto">
          <div className="flex flex-col space-y-2 text-sm font-medium">
            <span className="text-peach-600 flex items-center">
              Voir les détails
              <ArrowRight size={16} className="ml-1 opacity-0 group-hover:opacity-100 transform -translate-x-1 group-hover:translate-x-0 transition-all duration-300" />
            </span>
            <a
              href={tender.url_avis || tender.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Voir l'annonce sur BOAMP
            </a>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TenderListItem;
