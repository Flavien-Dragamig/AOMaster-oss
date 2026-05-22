import { useQuery } from '@tanstack/react-query';

interface CategoryItem {
  name: string;
  count: number;
  value: string;
}

interface ApiResponse {
  name: string;
  facets: CategoryItem[];
}

/**
 * Récupère les catégories disponibles dans le BOAMP depuis l'API v2.1
 * Utilise le endpoint /facets pour récupérer les valeurs distinctes de descripteur_libelle
 */
export async function fetchCategories(): Promise<string[]> {
  try {
    const url = 'https://boamp-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/boamp/facets?facets=descripteur_libelle';
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Erreur API ${response.status}`);
    }

    const data = await response.json();
    
    // Trouver la facette "descripteur_libelle" dans les résultats
    const descripteurFacet = data.facets?.find((facet: any) => facet.name === 'descripteur_libelle');
    
    if (!descripteurFacet || !descripteurFacet.facets) {
      console.error('Impossible de trouver les catégories descripteur_libelle');
      return [];
    }
    
    // Extraire les noms des catégories
    const categories = descripteurFacet.facets
      .map((item: CategoryItem) => item.value)
      .filter(Boolean)
      .sort();
      
    return categories;
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    return [];
  }
}

/**
 * React Query hook pour récupérer les catégories
 */
export function useCategories() {
  return useQuery(
    ['categories'], 
    fetchCategories,
    {
      staleTime: 1000 * 60 * 60, // Cache d'une heure
      refetchOnWindowFocus: false,
      retry: 1,
      select: (data: string[]) => {
        // Limiter à 50 catégories les plus communes pour éviter une liste trop longue
        return data.slice(0, 50); 
      }
    }
  );
}
