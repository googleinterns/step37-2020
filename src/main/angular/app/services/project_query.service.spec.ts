import {ProjectQueryService} from './project_query.service';
import {FakeDataService} from './fake_services/fake_data.service';
import {Project} from '../../model/project';
import {
  ProjectComparators,
  SortDirection,
  SortBy,
} from '../../model/project_sort';

describe('ProjectQueryService', () => {
  let service: ProjectQueryService;
  let projects: Project[];

  beforeAll(async () => {
    projects = (await new FakeDataService().listProjects()) as Project[];
  });

  describe('init()', () => {
    beforeAll(() => {
      service = new ProjectQueryService();
      service.init(projects);
    });
    it('Starts sorted by IAM Bindings descending', () => {
      const expected = projects
        .map(p => p)
        .sort(
          ProjectComparators.getComparator(
            SortDirection.DESCENDING,
            SortBy.IAM_BINDINGS
          )
        );
      const actual = service.getProjects();

      expect(actual).toEqual(expected);
    });
  });

  describe('toggleDirection()', () => {
    beforeEach(() => {
      service = new ProjectQueryService();
      service.init(projects);
    });

    it('Toggles to ascending order', () => {
      const expectedOrder = projects
        .map(p => p)
        .sort(
          ProjectComparators.getComparator(
            SortDirection.ASCENDING,
            SortBy.IAM_BINDINGS
          )
        );

      service.toggleDirection();
      const actualOrder = service.getProjects();

      expect(service.sortDirection).toBe(SortDirection.ASCENDING);
      expect(actualOrder).toEqual(expectedOrder);
    });

    it('Toggles twice back to descending', () => {
      service.toggleDirection();
      service.toggleDirection();
      const actualOrder = service.getProjects();

      expect(service.sortDirection).toBe(SortDirection.DESCENDING);
      expect(actualOrder).toEqual(projects);
    });
  });

  describe('changeField()', () => {
    it('Changes the field with the same direction', () => {});
    it('Changes the field with a different direction', () => {});
  });

  describe('changeQuery()', () => {
    it("Doesn't filter with an empty query", () => {});
    it('Filters by ID and name', () => {});
    it('Lets users empty the filter', () => {});
  });
});
