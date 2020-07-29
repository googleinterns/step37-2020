import {GraphDataCacheService} from './graph_data_cache.service';
import {DateUtilitiesService} from './date_utilities.service';
import {ProjectGraphData} from '../../model/project_graph_data';
import {OrganizationGraphData} from '../../model/organization_graph_data';
import {OrganizationIdentification} from '../../model/organization_identification';

describe('GraphDataCacheService', () => {
  let service: GraphDataCacheService;
  let dateUtilities: DateUtilitiesService;
  let id: string;
  let projectData: ProjectGraphData;
  let organizationData: OrganizationGraphData;

  beforeAll(() => {
    id = 'id-1';
    projectData = new ProjectGraphData(id, {}, {});
    organizationData = new OrganizationGraphData(
      new OrganizationIdentification('', ''),
      {},
      {}
    );
  });

  beforeEach(() => {
    dateUtilities = new DateUtilitiesService();
    service = new GraphDataCacheService(dateUtilities);
  });

  describe('hasProjectEntry()', () => {
    it('Returns false if there is no entry', () => {
      const present = service.hasProjectEntry(id);

      expect(present).toBeFalse();
    });

    it('Returns false if entry is out-of-date', () => {
      const placementDate = new Date(2020, 6, 1, 0, 0);
      const readDate = new Date(2020, 6, 1, 6, 1);
      dateUtilities.setDateProvider(() => placementDate);
      service.addProjectEntry(id, projectData);

      dateUtilities.setDateProvider(() => readDate);
      const present = service.hasProjectEntry(id);

      expect(present).toBeFalse();
    });

    it('Works for an in-date entry', () => {
      const placementDate = new Date(2020, 6, 1, 0);
      const readDate = new Date(2020, 6, 1, 3);
      dateUtilities.setDateProvider(() => placementDate);
      service.addProjectEntry(id, projectData);

      dateUtilities.setDateProvider(() => readDate);
      const present = service.hasProjectEntry(id);

      expect(present).toBeTrue();
    });
  });

  describe('getProjectEntry()', () => {
    it('Returns undefined for an empty entry', () => {
      const value = service.getProjectEntry(id);

      expect(value).toBeUndefined();
    });

    it('Returns undefined for an out-of-date entry', () => {
      const placementDate = new Date(2020, 6, 1, 0);
      const readDate = new Date(2020, 6, 1, 6, 1);
      dateUtilities.setDateProvider(() => placementDate);
      service.addProjectEntry(id, projectData);

      dateUtilities.setDateProvider(() => readDate);
      const value = service.getProjectEntry(id);

      expect(value).toBeUndefined();
    });

    it('Returns a valid cache entry', () => {
      const placementDate = new Date(2020, 6, 1, 0);
      const readDate = new Date(2020, 6, 1, 3);
      dateUtilities.setDateProvider(() => placementDate);
      service.addProjectEntry(id, projectData);

      dateUtilities.setDateProvider(() => readDate);
      const present = service.getProjectEntry(id);

      expect(present).toEqual(projectData);
    });
  });

  describe('addProjectEntry()', () => {
    it('Adds a new entry successfully', () => {
      service.addProjectEntry(id, projectData);
      const result = service.getProjectEntry(id);

      expect(result).toEqual(projectData);
    });
  });

  describe('hasOrganizationEntry()', () => {
    it('Returns false if there is no entry', () => {
      const present = service.hasOrganizationEntry(id);

      expect(present).toBeFalse();
    });

    it('Returns false if entry is out-of-date', () => {
      const placementDate = new Date(2020, 6, 1, 0, 0);
      const readDate = new Date(2020, 6, 1, 6, 1);
      dateUtilities.setDateProvider(() => placementDate);
      service.addOrganizationEntry(id, organizationData);

      dateUtilities.setDateProvider(() => readDate);
      const present = service.hasOrganizationEntry(id);

      expect(present).toBeFalse();
    });

    it('Works for an in-date entry', () => {
      const placementDate = new Date(2020, 6, 1, 0);
      const readDate = new Date(2020, 6, 1, 3);
      dateUtilities.setDateProvider(() => placementDate);
      service.addOrganizationEntry(id, organizationData);

      dateUtilities.setDateProvider(() => readDate);
      const present = service.hasOrganizationEntry(id);

      expect(present).toBeTrue();
    });
  });

  describe('getProjectEntry()', () => {
    it('Returns undefined for an empty entry', () => {
      const value = service.getOrganizationEntry(id);

      expect(value).toBeUndefined();
    });

    it('Returns undefined for an out-of-date entry', () => {
      const placementDate = new Date(2020, 6, 1, 0);
      const readDate = new Date(2020, 6, 1, 6, 1);
      dateUtilities.setDateProvider(() => placementDate);
      service.addOrganizationEntry(id, organizationData);

      dateUtilities.setDateProvider(() => readDate);
      const value = service.getOrganizationEntry(id);

      expect(value).toBeUndefined();
    });

    it('Returns a valid cache entry', () => {
      const placementDate = new Date(2020, 6, 1, 0);
      const readDate = new Date(2020, 6, 1, 3);
      dateUtilities.setDateProvider(() => placementDate);
      service.addOrganizationEntry(id, organizationData);

      dateUtilities.setDateProvider(() => readDate);
      const present = service.getOrganizationEntry(id);

      expect(present).toEqual(organizationData);
    });
  });

  describe('addProjectEntry()', () => {
    it('Adds a new entry successfully', () => {
      service.addOrganizationEntry(id, organizationData);
      const result = service.getOrganizationEntry(id);

      expect(result).toEqual(organizationData);
    });
  });
});
