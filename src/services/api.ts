import { Contract, SearchFilters } from '../types';

const BOAMP_V21_URL = 'https://boamp-datadila.opendatasoft.com/api/explore/v2.1/catalog/datasets/boamp/records';

import { TenderSearchResponse, FacetGroup } from '../types/api';

function escapeOdsQuery(value: string): string {
  return value.replace(/[\\"]/g, '\\$&');
}

export async function searchContracts(filters: SearchFilters): Promise<TenderSearchResponse> {
  // Construction des paramètres de recherche
  const params = new URLSearchParams();
  
  // Pagination
  const limit = 100; // Augmentation considérable de la limite par page
  const offset = ((filters.page || 1) - 1) * limit;
  
  // Vérifier que les paramètres sont bien envoyés avec le bon format
  params.append('start', offset.toString());
  params.append('rows', limit.toString());
  params.append('limit', limit.toString()); // Ajout explicite de limit pour compatibilité
  
  // Ajout des facettes demandées
  params.append('facet', 'code_departement_prestation');
  params.append('facet', 'type_marche_facette');
  params.append('facet', 'nature_categorise_libelle');
  params.append('facet', 'famille_libelle');
  params.append('facet', 'descripteur_libelle');
  params.append('facet', 'marche_public_simplifie_label');
  params.append('facet', 'procedure_libelle');
  
  // Inclure les facettes dans la réponse API (important pour OpenDataSoft v2.1)
  params.append('include', 'facets');
  
  // Initialisation des filtres WHERE (syntaxe SQL-like OpenDataSoft v2.1)
  const whereFilters = [];
  
  // Déterminer si des critères de recherche fournis par l'utilisateur sont présents
  const hasUserCriteria = [
    filters.query && filters.query.trim() !== '',
    filters.keywords && Array.isArray(filters.keywords) && filters.keywords.length > 0,
    filters.departments && Array.isArray(filters.departments) && filters.departments.length > 0,
    filters.categories && Array.isArray(filters.categories) && filters.categories.length > 0,
    filters.procedures && Array.isArray(filters.procedures) && filters.procedures.length > 0,
    filters.marketTypes && Array.isArray(filters.marketTypes) && filters.marketTypes.length > 0
  ].some(Boolean);
  
  if (hasUserCriteria) {
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    whereFilters.push(`datelimitereponse >= '${formattedToday}'`);
  }
  
  // Ajout des filtres textuels
  if (filters.query && filters.query.trim() !== '') {
    const query = escapeOdsQuery(filters.query.trim());

    if (filters.extendedSearch) {
      // Recherche élargie dans plusieurs champs
      const extendedCondition = `(objet LIKE "%${query}%" OR donnees LIKE "%${query}%")`;
      whereFilters.push(extendedCondition);
    } else {
      // Recherche uniquement dans objet
      whereFilters.push(`objet LIKE "%${query}%"`);
    }
  }

  // Support du tableau keywords (compatibilité API v1)
  if (filters.keywords && Array.isArray(filters.keywords) && filters.keywords.length > 0) {
    // Traiter chaque élément du tableau comme une expression exacte
    const keywordConditions = filters.keywords.map(keyword => {
      const kw = escapeOdsQuery(keyword.trim());
      if (kw !== '') {
        if (filters.extendedSearch) {
          // Recherche élargie dans plusieurs champs
          return `(objet LIKE "%${kw}%" OR donnees LIKE "%${kw}%")`;
        } else {
          // Recherche de l'expression exacte dans objet
          return `objet LIKE "%${kw}%"`;
        }
      }
      return null;
    }).filter(Boolean); // Filtrer les conditions vides

    if (keywordConditions.length > 0) {
      // Utiliser AND si plusieurs expressions, OR sinon (pour compatibilité)
      const keywordClause = keywordConditions.length === 1
        ? keywordConditions[0]
        : keywordConditions.join(' AND ');
      whereFilters.push(`(${keywordClause})`);
    }
  }
  
  // Filtres géographiques
  if (filters.department && filters.department.trim() !== '') {
    const deptFilter = escapeOdsQuery(filters.department.trim());
    // Recherche dans code_departement OU code_departement_prestation
    whereFilters.push(`(code_departement="${deptFilter}" OR code_departement_prestation="${deptFilter}")`);
  }
  
  // Vérification du filtre departments[] (format pluriel)
  if (filters.departments && Array.isArray(filters.departments) && filters.departments.length > 0) {
    // Créer une condition OR pour chaque département sélectionné
    const deptConditions = filters.departments.map(deptCode => {
      const dept = escapeOdsQuery(deptCode);
      return `code_departement_prestation="${dept}" OR code_departement="${dept}"`;
    });
    
    // Combiner toutes les conditions avec OR entre elles et les entourer de parenthèses
    whereFilters.push(`(${deptConditions.join(' OR ')})`);
  }
  
  // Filtres de type de contrat
  if (filters.contractType && filters.contractType !== '') {
    whereFilters.push(`type_procedure="${escapeOdsQuery(filters.contractType)}"`);
  }
  
  // Filtres de type de marché (type_marche_facette)
  if (filters.marketTypes && Array.isArray(filters.marketTypes) && filters.marketTypes.length > 0) {
    const marketTypeConditions = filters.marketTypes.map(type => `type_marche_facette="${escapeOdsQuery(type)}"`).join(' OR ');
    whereFilters.push(`(${marketTypeConditions})`);
  }
  
  // Filtres d'état de procédure (nature_categorise_libelle)
  if (filters.procedureStates && Array.isArray(filters.procedureStates) && filters.procedureStates.length > 0) {
    const stateConditions = filters.procedureStates.map((state: string) => `nature_categorise_libelle="${escapeOdsQuery(state)}"`).join(' OR ');
    whereFilters.push(`(${stateConditions})`);
  }
  
  // Filtres de famille d'AO (famille_libelle)
  if (filters.aoFamilies && Array.isArray(filters.aoFamilies) && filters.aoFamilies.length > 0) {
    const familyConditions = filters.aoFamilies.map((family: string) => `famille_libelle="${escapeOdsQuery(family)}"`).join(' OR ');
    whereFilters.push(`(${familyConditions})`);
  }
  
  // Filtres de procédure simplifiée (marche_public_simplifie_label)
  if (filters.simplifiedProcedure !== undefined) {
    whereFilters.push(`marche_public_simplifie_label="${filters.simplifiedProcedure ? 'Oui' : 'Non'}"`);
  }
  
  // Filtres de procédure (procedure_libelle) spécifié par l'utilisateur
  if (filters.procedure && filters.procedure !== '') {
    whereFilters.push(`procedure_libelle="${escapeOdsQuery(filters.procedure)}"`);
  }

  // Filtres par catégorie (descripteur_libelle)
  if (filters.categories && Array.isArray(filters.categories) && filters.categories.length > 0) {
    // Construire une condition OR pour chaque catégorie
    const categoryConditions = filters.categories.map(category => {
      return `descripteur_libelle LIKE "%${escapeOdsQuery(category)}%"`;
    });
    
    if (categoryConditions.length > 0) {
      const categoryClause = categoryConditions.join(' OR ');
      whereFilters.push(`(${categoryClause})`);
    }
  }
  
  // Tri par date de publication (du plus récent au plus ancien)
  params.append('order_by', 'dateparution desc');
  
  if (whereFilters.length > 0) {
    const whereClause = whereFilters.join(' AND ');
    params.append('where', whereClause);
  }

  const url = `${BOAMP_V21_URL}?${params.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API:', response.status, errorText);
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return {
        items: [],
        total: 0,
        page: 1,
        pageSize: limit,
        totalPages: 0,
        facets: []
      };
    }
    
    // Extraction et transformation des facettes à partir des résultats
    const facets: FacetGroup[] = [];
    
    // Définition des facettes qu'on veut extraire des résultats
    const facetFields = [
      'code_departement_prestation',
      'type_marche_facette',
      'nature_categorise_libelle',
      'famille_libelle',
      'descripteur_libelle',
      'marche_public_simplifie_label',
      'procedure_libelle'
    ];
    
    // Pour chaque type de facette à extraire
    facetFields.forEach((facetName) => {
        let facetLabel = '';
        
        // Attribution des libellés en français pour chaque facette
        switch(facetName) {
          case 'code_departement_prestation':
            facetLabel = 'Département de réalisation';
            break;
          case 'type_marche_facette':
            facetLabel = 'Type de marché';
            break;
          case 'nature_categorise_libelle':
            facetLabel = 'État de la procédure';
            break;
          case 'famille_libelle':
            facetLabel = 'Famille d\'AO';
            break;
          case 'descripteur_libelle':
            facetLabel = 'Libellés';
            break;
          case 'marche_public_simplifie_label':
            facetLabel = 'Procédure simplifiée';
            break;
          case 'procedure_libelle':
            facetLabel = 'Procédure';
            break;
          default:
            facetLabel = facetName;
        }
        
        // Pour cette facette, on va regrouper toutes les valeurs uniques 
        // et compter leurs occurrences dans les résultats
        const valueMap = new Map<string, number>();
        
        // Parcourir tous les résultats pour extraire les valeurs de cette facette
        data.results.forEach((result: any) => {
          // Gérer les cas où la valeur est un tableau ou une valeur simple
          if (result[facetName]) {
            const values = Array.isArray(result[facetName]) 
              ? result[facetName] 
              : [result[facetName]];
            
            // Ajouter chaque valeur au compteur
            values.forEach((value: string) => {
              if (value && value.trim() !== '') {
                valueMap.set(value, (valueMap.get(value) || 0) + 1);
              }
            });
          }
        });
        
        // Si nous avons trouvé des valeurs pour cette facette, créer le groupe
        if (valueMap.size > 0) {
          // Convertir la Map en tableau de valeurs pour la facette
          const facetValues = Array.from(valueMap.entries()).map(([value, count]) => ({
            value,
            count,
            selected: false // Par défaut, aucune valeur n'est sélectionnée
          }));
          
          // Trier par nombre d'occurrences décroissant
          facetValues.sort((a, b) => b.count - a.count);
          
          // Ajouter le groupe de facettes s'il n'est pas vide
          if (facetValues.length > 0) {
            facets.push({
              name: facetName,
              label: facetLabel,
              values: facetValues
            });
          }
        }
      });
    
    const result = {
      items: data.results.map(transformRecordV21),
      total: data.total_count || 0,
      page: filters.page || 1,
      pageSize: limit,
      totalPages: Math.ceil((data.total_count || 0) / limit),
      facets: facets
    };

    return result;
    
  } catch (error) {
    console.error('Erreur lors de la recherche de contrats:', error);
    throw error;
  }
}

/**
 * Transforme un enregistrement de l'API v2.1 en objet Contract
 */
function transformRecordV21(record: Record<string, unknown>): Contract {
  let contractingAuthorityInfo = {
    name: record.nomacheteur || 'Acheteur non spécifié',
    id: record.idweb || '',
    type: record.nature_libelle || record.nature || '',
    country: 'FR',
    address: record.adresseacheteur || '',
    contactPerson: '',
    phone: '',
    email: '',
    website: '',
    profileUrl: ''
  };

  let submissionUrl = '';
  let marketDocumentsUrl = record.adresse_documents_marche || record.url_dce || '';
  let estimatedValue: { amount: number; currency: string } | undefined;

  try {
    if (record.donnees) {
      let donneesParsed: Record<string, unknown> = {};

      if (typeof record.donnees === 'string') {
        donneesParsed = JSON.parse(record.donnees);
      } else if (typeof record.donnees === 'object') {
        donneesParsed = record.donnees;
      }

      if (donneesParsed.EFORMS) {
        const eforms = donneesParsed.EFORMS;
        const contractNotice = eforms.ContractNotice || {};

        const contractingParty = contractNotice['cac:ContractingParty'] || {};
        const buyerProfileUri = contractingParty['cbc:BuyerProfileURI'] || '';

        const partyIdField = contractingParty['cac:Party']?.['cac:PartyIdentification']?.['cbc:ID'];
        const partyId = (typeof partyIdField === 'object' && partyIdField !== null ? partyIdField['#text'] : partyIdField) || 'ORG-0001';

        const lot = contractNotice['cac:ProcurementProjectLot'];
        const tenderingTerms = lot?.['cac:TenderingTerms'];

        submissionUrl = tenderingTerms?.['cac:TenderRecipientParty']?.['cbc:EndpointID'] || '';
        const extractedMarketDocsUrl = tenderingTerms?.['cac:CallForTendersDocumentReference']?.['cac:Attachment']?.['cac:ExternalReference']?.['cbc:URI'] || '';
        if (extractedMarketDocsUrl) {
          marketDocumentsUrl = extractedMarketDocsUrl.replace(/&amp;/g, '&');
        }
        if (submissionUrl) {
          submissionUrl = submissionUrl.replace(/&amp;/g, '&');
        }

        const organizations = contractNotice['ext:UBLExtensions']?.['ext:UBLExtension']?.['ext:ExtensionContent']?.['efext:EformsExtension']?.['efac:Organizations']?.['efac:Organization'];

        if (Array.isArray(organizations)) {
          const buyerOrg = organizations.find(org => {
            const orgIdField = org['efac:Company']?.['cac:PartyIdentification']?.['cbc:ID'];
            const orgId = typeof orgIdField === 'object' && orgIdField !== null ? orgIdField['#text'] : orgIdField;
            return orgId === partyId;
          });

          if (buyerOrg?.['efac:Company']) {
            const company = buyerOrg['efac:Company'];
            const postalAddress = company['cac:PostalAddress'] || {};
            const contact = company['cac:Contact'] || {};

            const addressParts = [];
            if (postalAddress['cbc:StreetName']) addressParts.push(postalAddress['cbc:StreetName']);
            if (postalAddress['cbc:AdditionalStreetName']) addressParts.push(postalAddress['cbc:AdditionalStreetName']);
            if (postalAddress['cbc:PostalZone'] || postalAddress['cbc:CityName']) {
              const cityPart = [postalAddress['cbc:PostalZone'], postalAddress['cbc:CityName']].filter(Boolean).join(' ');
              if (cityPart) addressParts.push(cityPart);
            }

            contractingAuthorityInfo = {
              name: company['cac:PartyName']?.['cbc:Name']?.['#text'] || record.nomacheteur || 'Acheteur non spécifié',
              id: company['cac:PartyLegalEntity']?.['cbc:CompanyID']?.['#text'] || record.idweb || '',
              type: contact['cbc:JobTitle'] || record.nature_libelle || record.nature || '',
              country: postalAddress['cac:Country']?.['cbc:IdentificationCode']?.['#text'] || 'FR',
              address: addressParts.join(', '),
              contactPerson: contact['cbc:Name'] || '',
              phone: contact['cbc:Telephone'] || contact['cbc:Telefax'] || '',
              email: contact['cbc:ElectronicMail'] || '',
              website: company['cbc:WebsiteURI'] || '',
              profileUrl: buyerProfileUri
            };

          }
        }

        // Extraction de la valeur estimée depuis EFORMS
        const procurementProject = lot?.['cac:ProcurementProject'] || contractNotice['cac:ProcurementProject'];
        const estimatedAmountField = procurementProject?.['cac:RequestedTenderTotal']?.['cbc:EstimatedOverallContractAmount']
          || procurementProject?.['cbc:EstimatedOverallContractAmount'];
        if (estimatedAmountField) {
          const amountValue = typeof estimatedAmountField === 'object' && estimatedAmountField !== null
            ? parseFloat(estimatedAmountField['#text'])
            : parseFloat(estimatedAmountField);
          const currency = (typeof estimatedAmountField === 'object' && estimatedAmountField?.['@currencyID']) || 'EUR';
          if (!isNaN(amountValue) && amountValue > 0) {
            estimatedValue = { amount: amountValue, currency };
          }
        }
      } else if (donneesParsed.IDENTITE) {
        const identite = donneesParsed.IDENTITE;
        const addressParts = [];
        if (identite.ADRESSE) addressParts.push(identite.ADRESSE);
        if (identite.CP || identite.VILLE) {
          const cityPart = [identite.CP, identite.VILLE].filter(Boolean).join(' ');
          if (cityPart) addressParts.push(cityPart);
        }

        contractingAuthorityInfo = {
          name: identite.DENOMINATION || identite.NOM || record.nomacheteur || 'Acheteur non spécifié',
          id: identite.SIRET || identite.ID || record.idweb || '',
          type: identite.TYPE || record.nature_libelle || record.nature || '',
          country: identite.PAYS || 'FR',
          address: addressParts.join(', '),
          contactPerson: identite.CORRESPONDANT || identite.CONTACT || identite.NOM_CONTACT || '',
          phone: identite.TEL || identite.TELEPHONE || identite.PHONE || identite.FAX || '',
          email: identite.MEL || identite.EMAIL || identite.MAIL || '',
          website: identite.URL || identite.URL_INTERNET || identite.SITE_WEB || '',
          profileUrl: identite.URL_PROFIL_ACHETEUR || identite.PROFIL_ACHETEUR || ''
        };

        // Extraction de la valeur estimée depuis le format legacy
        const objet = (donneesParsed as Record<string, any>).OBJET || {};
        const montant = objet.MONTANT || objet.MONTANT_ESTIME || objet.VALEUR_ESTIMEE
          || (donneesParsed as Record<string, any>).MONTANT || (donneesParsed as Record<string, any>).MONTANT_ESTIME;
        if (montant) {
          const montantValue = parseFloat(String(montant).replace(/\s/g, '').replace(',', '.'));
          if (!isNaN(montantValue) && montantValue > 0) {
            estimatedValue = { amount: montantValue, currency: 'EUR' };
          }
        }
      }
    }
  } catch {
    // Erreur lors du parsing des données supplémentaires, on utilise les valeurs par défaut
  }

  return {
    id: record.idweb || String(Math.random()),
    title: record.objet || 'Titre non disponible',
    description: record.objet || 'Description non disponible',
    contractingAuthority: contractingAuthorityInfo,
    cpvCodes: record.dc ? [record.dc] : [],
    contractType: mapContractTypeV21(record.nature),
    publicationDate: record.dateparution ? new Date(record.dateparution) : new Date(),
    submissionDeadline: record.datelimitereponse ? new Date(record.datelimitereponse) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    source: 'BOAMP' as const,
    sourceId: record.idweb || '',
    documentUrls: record.url_avis ? [record.url_avis] : [],
    location: record.code_departement_prestation || record.code_departement || 'France',
    department: record.code_departement || '',
    status: mapStatusV21(record.etat),
    // Ajouter explicitement url_avis et sourceUrl pour le lien BOAMP
    url_avis: record.url_avis || '',
    sourceUrl: record.url_avis || `https://www.boamp.fr/avis/detail/${record.idweb}`,
    // Ajout des champs requis pour l'affichage de type et la nature
    type: record.type_marche_facette || '',
    buyerName: record.nomacheteur || 'Non spécifié',
    natureCategorie: record.nature_categorise_libelle || '',
    // URL vers les documents de marché (DCE)
    marketDocumentsUrl,
    // URL de présentation des offres
    submissionUrl,
    // Valeur estimée du marché
    estimatedValue
  };
}

/**
 * Convertit le type de nature de l'API v2.1 en type de contrat
 */
function mapContractTypeV21(type: string | null): 'works' | 'supplies' | 'services' | 'mixed' {
  if (!type) return 'services';
  
  const typeStr = String(type).toUpperCase();
  switch (typeStr) {
    case 'T': return 'works';      // Travaux
    case 'F': return 'supplies';   // Fournitures
    case 'S': return 'services';   // Services
    default: return 'services';
  }
}

/**
 * Convertit le statut de l'API v2.1 en statut de contrat
 */
function mapStatusV21(status: string | null): 'open' | 'closed' | 'awarded' {
  if (!status) return 'open';
  
  const statusStr = String(status).toUpperCase();
  switch (statusStr) {
    case 'PUBLIE': return 'open';
    case 'TERMINE': return 'closed';
    case 'ATTRIBUE': return 'awarded';
    default: return 'open';
  }
}

export async function getContractDetails(id: string, _source: 'BOAMP' | 'TED'): Promise<Contract> {
  // Pour l'API v2.1, on utilise le champ idweb pour identifier un contrat
  // Note: le paramètre source est conservé pour compatibilité avec l'interface existante
  const params = new URLSearchParams();
  params.append('where', `idweb="${escapeOdsQuery(id)}"`);
  params.append('limit', '1');
  
  const url = `${BOAMP_V21_URL}?${params.toString()}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Erreur API ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      throw new Error(`Contrat non trouvé: ${id}`);
    }
    
    return transformRecordV21(data.results[0]);
  } catch (error) {
    console.error(`Erreur lors de la récupération des détails pour ${id}:`, error);
    throw error;
  }
}

/**
 * Hook pour vérifier l'état de la connexion à l'API
 */
export async function checkApiStatus(): Promise<boolean> {
  try {
    const params = new URLSearchParams();
    params.append('limit', '1');
    
    const url = `${BOAMP_V21_URL}?${params.toString()}`;
    const response = await fetch(url);
    
    return response.ok;
  } catch (error) {
    console.error('Erreur de connexion à l\'API:', error);
    return false;
  }
}