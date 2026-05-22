import { describe, it, expect } from 'vitest';
import { tenderToContract, isContractFormat, isTenderFormat } from './tender-to-contract';
import type { Tender, Contract } from '../../types';

describe('tenderToContract', () => {
  it('should convert Tender to Contract format', () => {
    const tender: Tender = {
      id: 'test-123',
      title: 'Test Tender',
      publicationDate: '2024-01-01',
      submissionDeadline: '2024-02-01',
      status: 'open',
      department: '75',
      sourceUrl: 'https://example.com',
      description: 'Test description',
      buyerName: 'Test Buyer',
      type: 'Travaux',
    } as any;

    const contract = tenderToContract(tender);

    expect(contract.id).toBe('test-123');
    expect(contract.title).toBe('Test Tender');
    expect(contract.contractingAuthority.name).toBe('Test Buyer');
    expect(contract.department).toBe('75');
    expect(contract.source).toBe('BOAMP');
  });

  it('should handle Tender without buyerName', () => {
    const tender: Tender = {
      id: 'test-456',
      title: 'Test Tender 2',
      publicationDate: '2024-01-01',
      status: 'open',
      department: '92',
      sourceUrl: 'https://example.com',
      description: 'Test description 2',
    } as any;

    const contract = tenderToContract(tender);

    expect(contract.contractingAuthority.name).toBe('Acheteur non spécifié');
  });

  it('should preserve contractingAuthority if already present', () => {
    const tenderWithAuthority = {
      id: 'test-789',
      title: 'Test Tender 3',
      publicationDate: '2024-01-01',
      status: 'open',
      department: '93',
      sourceUrl: 'https://example.com',
      description: 'Test description 3',
      contractingAuthority: {
        name: 'Existing Authority',
        type: 'Public',
        country: 'FR',
      },
    } as any;

    const contract = tenderToContract(tenderWithAuthority);

    expect(contract.contractingAuthority.name).toBe('Existing Authority');
    expect(contract.contractingAuthority.type).toBe('Public');
  });

  it('should handle missing dates gracefully', () => {
    const tender: Tender = {
      id: 'test-999',
      title: 'Test Tender 4',
      publicationDate: '',
      status: 'open',
      department: '94',
      sourceUrl: 'https://example.com',
      description: 'Test description 4',
    } as any;

    const contract = tenderToContract(tender);

    expect(contract.publicationDate).toBeInstanceOf(Date);
    expect(contract.submissionDeadline).toBeInstanceOf(Date);
  });
});

describe('isContractFormat', () => {
  it('should identify Contract format', () => {
    const contract = {
      id: 'test-123',
      contractingAuthority: {
        name: 'Test Authority',
      },
    };

    expect(isContractFormat(contract)).toBe(true);
  });

  it('should reject Tender format', () => {
    const tender = {
      id: 'test-123',
      buyerName: 'Test Buyer',
    };

    expect(isContractFormat(tender)).toBe(false);
  });

  it('should reject null and undefined', () => {
    expect(isContractFormat(null)).toBe(false);
    expect(isContractFormat(undefined)).toBe(false);
  });
});

describe('isTenderFormat', () => {
  it('should identify Tender format', () => {
    const tender = {
      id: 'test-123',
      buyerName: 'Test Buyer',
    };

    expect(isTenderFormat(tender)).toBe(true);
  });

  it('should reject Contract format', () => {
    const contract = {
      id: 'test-123',
      contractingAuthority: {
        name: 'Test Authority',
      },
    };

    expect(isTenderFormat(contract)).toBe(false);
  });

  it('should reject data with both formats', () => {
    const mixed = {
      id: 'test-123',
      buyerName: 'Test Buyer',
      contractingAuthority: {
        name: 'Test Authority',
      },
    };

    expect(isTenderFormat(mixed)).toBe(false);
  });

  it('should reject null and undefined', () => {
    expect(isTenderFormat(null)).toBe(false);
    expect(isTenderFormat(undefined)).toBe(false);
  });
});
