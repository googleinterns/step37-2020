import {GraphDataCacheService} from './graph_data_cache.service';
import {DateUtilitiesService} from './date_utilities.service';
import {ProjectGraphData} from '../../model/project_graph_data';

describe('GraphDataCacheService', () => {
  let service: GraphDataCacheService;
  let dateUtilities: DateUtilitiesService;
  let id: string;
  let data: ProjectGraphData;

  beforeAll(() => {
    id = 'id-1';
    data = new ProjectGraphData(id, {}, {});
  });

  beforeEach(() => {
    dateUtilities = new DateUtilitiesService();
    service = new GraphDataCacheService(dateUtilities);
  });

  describe('hasEntry()', () => {
    it('Returns false if there is no entry', () => {
      const present = service.hasEntry(id);

      expect(present).toBeFalse();
    });

    it('Returns false if entry is out-of-date', () => {
      const placementDate = new Date(2020, 6, 1, 0, 0);
      const readDate = new Date(2020, 6, 1, 6, 1);
      dateUtilities.setDateProvider(() => placementDate);
      service.addEntry(id, data);

      dateUtilities.setDateProvider(() => readDate);
      const present = service.hasEntry(id);

      expect(present).toBeFalse();
    });

    it('Works for an in-date entry', () => {
      const placementDate = new Date(2020, 6, 1, 0);
      const readDate = new Date(2020, 6, 1, 3);
      dateUtilities.setDateProvider(() => placementDate);
      service.addEntry(id, data);

      dateUtilities.setDateProvider(() => readDate);
      const present = service.hasEntry(id);

      expect(present).toBeTrue();
    });
  });

  describe('getEntry()', () => {
    it('Returns undefined for an empty entry', () => {
      const value = service.getEntry(id);

      expect(value).toBeUndefined();
    });

    it('Returns undefined for an out-of-date entry', () => {
      const placementDate = new Date(2020, 6, 1, 0);
      const readDate = new Date(2020, 6, 1, 6, 1);
      dateUtilities.setDateProvider(() => placementDate);
      service.addEntry(id, data);

      dateUtilities.setDateProvider(() => readDate);
      const value = service.getEntry(id);

      expect(value).toBeUndefined();
    });

    it('Returns a valid cache entry', () => {
      const placementDate = new Date(2020, 6, 1, 0);
      const readDate = new Date(2020, 6, 1, 3);
      dateUtilities.setDateProvider(() => placementDate);
      service.addEntry(id, data);

      dateUtilities.setDateProvider(() => readDate);
      const present = service.getEntry(id);

      expect(present).toEqual(data);
    });
  });

  describe('addEntry()', () => {
    it('Adds a new entry successfully', () => {
      service.addEntry(id, data);
      const result = service.getEntry(id);

      expect(result).toEqual(data);
    });
  });
});
