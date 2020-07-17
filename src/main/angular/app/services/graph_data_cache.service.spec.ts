import {GraphDataCacheService} from './graph_data_cache.service';

describe('GraphDataCacheService', () => {
  describe('hasEntry()', () => {
    it('Fails if there is no entry', () => {});
    it('Fails if entry is out-of-date', () => {});
    it('Works for an in-date entry', () => {});
  });

  describe('getEntry()', () => {
    it('Returns undefined for an empty entry', () => {});
    it('Returns undefined for an out-of-date entry', () => {});
    it('Returns a valid cache entry', () => {});
  });

  describe('addEntry()', () => {
    it('Adds a new entry successfully', () => {});
  });
});
