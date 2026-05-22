import { describe, it, expect } from 'vitest';
import type { ApiError, BoampAnnouncement, PaginatedResponse } from './api';

describe('API Type Definitions', () => {
  it('should allow creating a valid ApiError object', () => {
    const error: ApiError = {
      message: 'Not Found',
      statusCode: 404,
      details: { resource: 'tender/123' },
    };
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('Not Found');
  });

  it('should allow creating a valid BoampAnnouncement object', () => {
    const announcement: BoampAnnouncement = {
      id: '24-12345',
      dateparution: '2024-06-16',
      objet: 'Construction of a new building',
      departement: '75',
      type: 'AAPC',
      url: 'http://example.com/boamp/24-12345',
    };
    expect(announcement.id).toBe('24-12345');
    expect(announcement.type).toBe('AAPC');
  });

  it('should allow creating a paginated response object', () => {
    const response: PaginatedResponse<string> = {
      items: ['a', 'b', 'c'],
      total: 100,
      page: 1,
      pageSize: 10,
    };
    expect(response.items.length).toBe(3);
    expect(response.total).toBe(100);
  });
});
