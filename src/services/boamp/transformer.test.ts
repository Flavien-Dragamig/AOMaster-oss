import { describe, it, expect } from 'vitest';
import { transformTender, transformSearchResponse } from './transformer';

describe('BOAMP Data Transformer', () => {
  it('should correctly transform a single ODS BOAMP v2.1 record to a Tender', () => {
    const record = {
      idweb: '24-123',
      dateparution: '2024-06-16',
      objet: 'Construction of a new school building',
      code_departement: '75',
      type_marche_facette: 'Services',
      datelimitereponse: '2024-07-16',
      url_avis: 'http://example.com/24-123',
      nomacheteur: 'Mairie de Paris',
    };

    const tender = transformTender(record);

    expect(tender.id).toBe('24-123');
    expect(tender.title).toBe('Construction of a new school building');
    expect(tender.publicationDate).toBe('2024-06-16');
    expect(tender.submissionDeadline).toBe('2024-07-16');
    expect(tender.buyerName).toBe('Mairie de Paris');
    expect(tender.sourceUrl).toBe('http://example.com/24-123');
  });

  it('should correctly transform an ODS BOAMP v2.1 search response', () => {
    const response = {
      total_count: 1,
      results: [
        {
          idweb: '24-001',
          dateparution: '2024-06-15',
          objet: 'First announcement',
          code_departement: '35',
          type_marche_facette: 'Fournitures',
          datelimitereponse: '2024-07-15',
          url_avis: 'http://example.com/24-001',
          nomacheteur: 'Acheteur test',
        },
      ],
      parameters: {
        limit: 20,
        offset: 0,
      },
    };

    const transformedResponse = transformSearchResponse(response as any);

    expect(transformedResponse.items.length).toBe(1);
    expect(transformedResponse.total).toBe(1);
    expect(transformedResponse.items[0].id).toBe('24-001');
    expect(transformedResponse.items[0].title).toBe('First announcement');
  });

  it('should handle missing or null data gracefully', () => {
    // Record sans idweb = malformed, doit retourner les valeurs par défaut
    const record = {
      dateparution: '2024-06-16',
    };

    const tender = transformTender(record);

    expect(tender.id).toBe('unknown');
    expect(tender.title).toBe('No title');
    expect(tender.department).toBe('N/A');
    expect(tender.type).toBe('N/A');
    expect(tender.description).toBe('No description');
  });

  it('should handle a valid record with minimal fields', () => {
    const record = {
      idweb: '24-456',
    };

    const tender = transformTender(record);

    expect(tender.id).toBe('24-456');
    expect(tender.title).toBe('Titre non disponible');
    expect(tender.department).toBe('N/A');
    expect(tender.type).toBe('Non spécifié');
    expect(tender.buyerName).toBe('Acheteur non spécifié');
  });
});
