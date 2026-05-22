import { describe, it, expect } from 'vitest';
import { isAchatPublicUrl, extractPCSLID } from './achatpublic';

describe('isAchatPublicUrl', () => {
  it('should identify AchatPublic URLs', () => {
    expect(isAchatPublicUrl('https://www.achatpublic.com/sdm/ent/gen/ent_detail.do?PCSLID=123')).toBe(true);
    expect(isAchatPublicUrl('http://achatpublic.com/some/path')).toBe(true);
    expect(isAchatPublicUrl('https://ACHATPUBLIC.COM/page')).toBe(true);
  });

  it('should reject non-AchatPublic URLs', () => {
    expect(isAchatPublicUrl('https://www.boamp.fr')).toBe(false);
    expect(isAchatPublicUrl('https://place-des-entreprises.fr')).toBe(false);
    expect(isAchatPublicUrl('https://example.com')).toBe(false);
  });

  it('should handle undefined and empty strings', () => {
    expect(isAchatPublicUrl(undefined)).toBe(false);
    expect(isAchatPublicUrl('')).toBe(false);
  });
});

describe('extractPCSLID', () => {
  it('should extract PCSLID from query parameters', () => {
    expect(extractPCSLID('https://www.achatpublic.com/sdm/ent/gen/ent_detail.do?PCSLID=123456')).toBe('123456');
    expect(extractPCSLID('https://www.achatpublic.com/page?PCSLID=ABC-123&other=value')).toBe('ABC-123');
  });

  it('should extract PCSLID case-insensitively', () => {
    expect(extractPCSLID('https://www.achatpublic.com/page?pcslid=lowercase')).toBe('lowercase');
    expect(extractPCSLID('https://www.achatpublic.com/page?PcSlId=mixed')).toBe('mixed');
  });

  it('should extract PCSLID from text patterns', () => {
    expect(extractPCSLID('Check this: PCSLID=789')).toBe('789');
    expect(extractPCSLID('Document with PCSLID:XYZ123 reference')).toBe('XYZ123');
  });

  it('should handle complex PCSLID formats', () => {
    expect(extractPCSLID('https://www.achatpublic.com/page?PCSLID=CSL-2024-001')).toBe('CSL-2024-001');
    expect(extractPCSLID('PCSLID=COMPLEX_ID_123-ABC')).toBe('COMPLEX_ID_123-ABC');
  });

  it('should return null for missing PCSLID', () => {
    expect(extractPCSLID('https://www.achatpublic.com/page')).toBeNull();
    expect(extractPCSLID('https://www.example.com?id=123')).toBeNull();
    expect(extractPCSLID('')).toBeNull();
  });

  it('should handle malformed URLs gracefully', () => {
    expect(extractPCSLID('not a url PCSLID=123')).toBe('123');
    expect(extractPCSLID('random text')).toBeNull();
  });
});
