import React, { useState, useCallback, useEffect } from 'react';
import { searchContracts } from '../services/api';
import type { SearchFilters, PageFiltersState } from '../types';
import type { Tender, FacetGroup } from '../types/api';
import TenderSearchForm from '../components/tenders/TenderSearchForm';
import TenderListItem from '../components/tenders/TenderListItem';
import DynamicFilters from '../components/tenders/DynamicFilters';
import RegionalDepartmentFilters from '../components/tenders/RegionalDepartmentFilters';
import { AlertCircle, Loader2, Download, Copy, Save, FolderOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getUserFacetPreferences, saveUserFacetPreference } from '../services/userProfile';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SaveSearchModal } from '../components/search/SaveSearchModal';
import { SavedSearchesModal } from '../components/search/SavedSearchesModal';
import { Button } from '../components/ui/Button';
import { useTracking } from '../contexts/TrackingContext';

const adaptFormFiltersToSearchFilters = (formFilters: PageFiltersState): SearchFilters => ({
  keywords: formFilters.keywords && formFilters.keywords.trim() !== ''
    ? [formFilters.keywords.trim()]
    : undefined,
  departments: undefined,
  categories: formFilters.categories
    ? formFilters.categories.split(',').map(c => c.trim()).filter(Boolean)
    : undefined,
  procedures: formFilters.procedures
    ? formFilters.procedures.split(',').map(p => p.trim()).filter(Boolean)
    : undefined,
  marketTypes: formFilters.marketTypes
    ? formFilters.marketTypes.split(',').map(m => m.trim()).filter(Boolean)
    : undefined,
  extendedSearch: formFilters.extendedSearch
});

const SearchPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Tender[] | null>(null);
  const [facetGroups, setFacetGroups] = useState<FacetGroup[]>([]);
  const [savedSearchParams, setSavedSearchParams] = useLocalStorage<PageFiltersState>('lastSearchParams', {});
  const [filters, setFilters] = useState<PageFiltersState>(savedSearchParams || {});
  const [selectedFacets, setSelectedFacets] = useState<Record<string, string[]>>({});
  const [userFacetPreferences, setUserFacetPreferences] = useState<Record<string, string[]>>({});
  const [hasAppliedUserPreferences, setHasAppliedUserPreferences] = useState<boolean>(false);
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState<boolean>(false);
  const { trackEvent } = useTracking();

  const handleFacetChange = useCallback((name: string, value: string, checked: boolean) => {
    setSelectedFacets(prevValues => {
      const newValues = { ...prevValues };

      if (!newValues[name]) {
        newValues[name] = [];
      }

      if (checked) {
        if (!newValues[name].includes(value)) {
          newValues[name] = [...newValues[name], value];
        }
      } else {
        newValues[name] = newValues[name].filter(v => v !== value);
        if (newValues[name].length === 0) {
          delete newValues[name];
        }
      }

      return newValues;
    });
  }, []);

  useEffect(() => {
    async function loadUserPreferences() {
      try {
        const facetPrefs = await getUserFacetPreferences();

        if (Object.keys(facetPrefs).length > 0) {
          setUserFacetPreferences(facetPrefs);

          if (facetPrefs['code_departement_prestation'] &&
              facetPrefs['code_departement_prestation'].length > 0) {

            setSelectedFacets(prev => ({
              ...prev,
              'code_departement_prestation': facetPrefs['code_departement_prestation']
            }));
          }
        } else {
          setUserFacetPreferences({});
        }
      } catch (error) {
        console.error('Erreur lors du chargement des préférences:', error);
      }
    }

    loadUserPreferences();
  }, []);

  useEffect(() => {
    if (isInitialLoad && savedSearchParams && Object.keys(savedSearchParams).length > 0) {
      const hasKeywords = savedSearchParams.keywords && savedSearchParams.keywords.trim() !== '';
      if (hasKeywords) {
        setFilters(savedSearchParams);
        handleSearch(savedSearchParams);
      }
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, savedSearchParams]);

  const handleSearch = useCallback(async (formCriteria: PageFiltersState) => {
    setLoading(true);
    setError(null);
    setFilters(formCriteria);

    if (formCriteria && Object.keys(formCriteria).length > 0) {
      setSavedSearchParams(formCriteria);
    }

    try {
      if (!formCriteria) {
        formCriteria = filters || {};
      }

      const baseFilters = adaptFormFiltersToSearchFilters(formCriteria);

      const keywords = formCriteria.keywords ?
        formCriteria.keywords.split(' ').filter(k => k.trim() !== '') :
        baseFilters.keywords;

      let departments: string[] = [];

      if (selectedFacets['code_departement_prestation'] && selectedFacets['code_departement_prestation'].length > 0) {
        departments = [...selectedFacets['code_departement_prestation']];
      } else if (baseFilters.departments && baseFilters.departments.length > 0) {
        departments = baseFilters.departments;
      }

      const apiFilters: SearchFilters = {
        ...baseFilters,
        keywords: keywords,
        departments: departments,
        categories: selectedFacets['descripteur_libelle'] || baseFilters.categories,
        procedures: selectedFacets['procedure_libelle'] || baseFilters.procedures,
        marketTypes: selectedFacets['type_marche_facette'] || baseFilters.marketTypes,
        procedureStates: selectedFacets['nature_categorise_libelle'],
        aoFamilies: selectedFacets['famille_libelle'],
        simplifiedProcedure: selectedFacets['marche_public_simplifie_label']?.includes('Oui')
          ? true
          : selectedFacets['marche_public_simplifie_label']?.includes('Non')
            ? false
            : undefined,
      };

      Object.keys(apiFilters).forEach(key => {
        const filterKey = key as keyof SearchFilters;
        if (Array.isArray(apiFilters[filterKey]) && (apiFilters[filterKey] as string[]).length === 0) {
          delete apiFilters[filterKey];
        }
      });

      const response = await searchContracts(apiFilters);
      setResults(response.items);
      trackEvent('search');

      if (response.facets) {
        const updatedFacets = response.facets.map(facetGroup => ({
          ...facetGroup,
          values: facetGroup.values.map(facet => ({
            ...facet,
            selected: selectedFacets[facetGroup.name]?.includes(facet.value) || false
          }))
        }));
        setFacetGroups(updatedFacets);

        if (!hasAppliedUserPreferences &&
            Object.keys(userFacetPreferences).length > 0 &&
            Object.keys(selectedFacets).length === 0) {

          setSelectedFacets(userFacetPreferences);
          setHasAppliedUserPreferences(true);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur inconnue est survenue.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedFacets, userFacetPreferences, hasAppliedUserPreferences, setSavedSearchParams, filters]);

  const userModifiedFacets = React.useRef(false);

  const handleUserFacetChange = useCallback((name: string, value: string, checked: boolean) => {
    userModifiedFacets.current = true;
    handleFacetChange(name, value, checked);
  }, [handleFacetChange]);

  useEffect(() => {
    if (results !== null && userModifiedFacets.current && filters) {
      userModifiedFacets.current = false;
      handleSearch(filters);
    }
  }, [selectedFacets, filters, handleSearch, results]);

  const handleFormSearch = useCallback((criteria: PageFiltersState) => {
    const pageFilters: PageFiltersState = {
      keywords: criteria.keywords,
      categories: criteria.categories,
      procedures: criteria.procedures,
      marketTypes: criteria.marketTypes,
      extendedSearch: criteria.extendedSearch,
    };

    setFilters(pageFilters);
    handleSearch(pageFilters);
  }, [handleSearch]);

  const handleLoadSavedSearch = useCallback((searchParams: SearchFilters) => {
    const pageFilters: PageFiltersState = {
      keywords: searchParams.keywords?.join(' ') || '',
      categories: searchParams.categories?.join(', ') || '',
      procedures: searchParams.procedures?.join(', ') || '',
      marketTypes: searchParams.marketTypes?.join(', ') || '',
      extendedSearch: searchParams.extendedSearch,
    };

    if (searchParams.departments && searchParams.departments.length > 0) {
      setSelectedFacets(prev => ({
        ...prev,
        'code_departement_prestation': searchParams.departments!
      }));
    }

    setFilters(pageFilters);
    handleSearch(pageFilters);
  }, [handleSearch]);

  const getCurrentSearchParams = useCallback((): SearchFilters => {
    const baseFilters = adaptFormFiltersToSearchFilters(filters);

    return {
      ...baseFilters,
      departments: selectedFacets['code_departement_prestation'] || undefined,
      categories: selectedFacets['descripteur_libelle'] || baseFilters.categories,
      procedures: selectedFacets['procedure_libelle'] || baseFilters.procedures,
      marketTypes: selectedFacets['type_marche_facette'] || baseFilters.marketTypes,
      procedureStates: selectedFacets['nature_categorise_libelle'],
      aoFamilies: selectedFacets['famille_libelle'],
      simplifiedProcedure: selectedFacets['marche_public_simplifie_label']?.includes('Oui')
        ? true
        : selectedFacets['marche_public_simplifie_label']?.includes('Non')
          ? false
          : undefined,
    };
  }, [filters, selectedFacets]);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Recherche de marchés publics</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsLoadModalOpen(true)}
            className="flex items-center gap-2"
          >
            <FolderOpen className="w-4 h-4" />
            Mes recherches
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsSaveModalOpen(true)}
            disabled={!filters.keywords || filters.keywords.trim() === ''}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Sauvegarder
          </Button>
        </div>
      </div>

      <TenderSearchForm
        onSearch={handleFormSearch}
        isSearching={loading}
        initialCriteria={filters}
      />

      <SaveSearchModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        searchParams={getCurrentSearchParams()}
      />

      <SavedSearchesModal
        isOpen={isLoadModalOpen}
        onClose={() => setIsLoadModalOpen(false)}
        onLoadSearch={handleLoadSavedSearch}
      />

      {results && results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
          <div className="space-y-6">
            {facetGroups && facetGroups.length > 0 && (
              <DynamicFilters
                facetGroups={facetGroups}
                onFilterChange={handleUserFacetChange}
              />
            )}

            <RegionalDepartmentFilters
              selectedFacets={selectedFacets}
              onFacetChange={handleUserFacetChange}
              facetGroups={facetGroups}
            />

            {hasAppliedUserPreferences && Object.keys(userFacetPreferences).length > 0 && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-xs text-blue-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Filtres personnalisés appliqués depuis votre profil
                </p>
              </div>
            )}
          </div>

          <div>
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="animate-spin mr-2" size={24} />
                <span>Chargement des résultats...</span>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <div className="flex">
                  <AlertCircle className="text-red-500 mr-2" size={20} />
                  <div>
                    <h3 className="text-red-800 font-medium">Erreur</h3>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Aucun résultat trouvé. Veuillez essayer avec d'autres critères de recherche.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">{results.length} résultats trouvés</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyHTMLToClipboard(results)}
                      className="flex items-center text-sm bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded text-blue-700"
                      title="Copier le contenu au format HTML pour les emails"
                    >
                      <Copy size={14} className="mr-1" /> Copier en HTML
                    </button>
                    <button
                      onClick={() => exportSearchResults(results)}
                      className="flex items-center text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-gray-700"
                    >
                      <Download size={14} className="mr-1" /> Exporter la recherche
                    </button>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {results.map((tender: Tender, index: number) => (
                    <div key={tender.id || index} className="py-4">
                      <TenderListItem tender={tender} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

marked.setOptions({
  breaks: true,
  gfm: true
});

const generateMarkdownContent = (results: Tender[]) => {
  let markdownContent = '# Résultats de recherche\n\n';

  results.forEach(tender => {
    const title = tender.title || 'Titre non disponible';
    const buyer = tender.buyerName || tender.contractingAuthority?.name || 'Acheteur non disponible';
    const url = tender.url_avis || tender.sourceUrl || '#';

    markdownContent += `* ${title}, ${buyer}, [lien](${url})\n`;
  });

  return markdownContent;
};

const convertMarkdownToHTML = (markdownText: string) => {
  const rawHtml = marked.parse(markdownText);
  const htmlContent = DOMPurify.sanitize(rawHtml as string);

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        a { color: #0066cc; text-decoration: underline; }
        h1, h2, h3 { color: #333; }
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `;
};

const copyHTMLToClipboard = (results: Tender[]) => {
  const markdownContent = generateMarkdownContent(results);
  const htmlContent = convertMarkdownToHTML(markdownContent);

  navigator.clipboard.writeText(htmlContent)
    .then(() => {
      alert('Le contenu HTML a été copié dans le presse-papiers.');
    })
    .catch(err => {
      console.error('Erreur lors de la copie dans le presse-papiers:', err);
      alert('Erreur lors de la copie dans le presse-papiers.');
    });
};

const exportSearchResults = (results: Tender[]) => {
  const markdownContent = generateMarkdownContent(results);
  const blob = new Blob([markdownContent], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `recherche-appels-offres-${new Date().toISOString().split('T')[0]}.md`;

  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};

export default SearchPage;