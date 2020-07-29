import {QueryService} from './query.service';
import {FakeDataService} from './fake_services/fake_data.service';
import {Project} from '../../model/project';
import {
  ProjectComparators,
  SortDirection,
  SortBy,
} from '../../model/sort_methods';
import {GraphDataCacheService} from './graph_data_cache.service';
import {DateUtilitiesService} from './date_utilities.service';

describe('ProjectQueryService', () => {
  let service: QueryService;
  let projects: Project[];

  beforeAll(async () => {
    projects = (
      await new FakeDataService(
        new GraphDataCacheService(new DateUtilitiesService())
      ).listSummaries()
    ).projects;
  });

  describe('init()', () => {
    beforeAll(() => {
      service = new QueryService();
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
      service = new QueryService();
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

      expect(service.getSortDirection()).toBe(SortDirection.ASCENDING);
      expect(actualOrder).toEqual(expectedOrder);
    });

    it('Toggles twice back to descending', () => {
      service.toggleDirection();
      service.toggleDirection();
      const actualOrder = service.getProjects();

      expect(service.getSortDirection()).toBe(SortDirection.DESCENDING);
      expect(actualOrder).toEqual(projects);
    });
  });

  describe('changeField()', () => {
    describe('Change the field with the same direction', () => {
      let expectedField: SortBy;
      let currentDirection: SortDirection;

      beforeAll(() => {
        service = new QueryService();
        service.init(projects);
        expectedField = SortBy.PROJECT_NAME;
        currentDirection = service.getSortDirection();

        service.changeField(expectedField, currentDirection);
      });

      it('Changes the field', () => {
        const actual = service.getSortField();

        expect(actual).toBe(expectedField);
      });

      it('Leaves the direction', () => {
        const actual = service.getSortDirection();

        expect(actual).toBe(currentDirection);
      });

      it('Sorts properly', () => {
        const actual = service.getProjects();
        const expected = projects.sort(
          ProjectComparators.getComparator(currentDirection, expectedField)
        );

        expect(actual).toEqual(expected);
      });
    });

    describe('Change the field with a different direction', () => {
      let expectedField: SortBy;
      let expectedDirection: SortDirection;

      beforeAll(() => {
        service = new QueryService();
        service.init(projects);
        expectedField = SortBy.PROJECT_NAME;
        expectedDirection = SortDirection.ASCENDING;

        service.changeField(expectedField, expectedDirection);
      });

      it('Changes the field', () => {
        const actual = service.getSortField();

        expect(actual).toBe(expectedField);
      });

      it('Changes the sort direction', () => {
        const actual = service.getSortDirection();

        expect(actual).toBe(expectedDirection);
      });

      it('Sorts properly', () => {
        const actual = service.getProjects();
        const expected = projects.sort(
          ProjectComparators.getComparator(expectedDirection, expectedField)
        );

        expect(actual).toEqual(expected);
      });
    });
  });

  describe('changeQuery()', () => {
    beforeEach(() => {
      service = new QueryService();
      service.init(projects);
    });

    it("Doesn't filter with an empty query", () => {
      const expected = service.getProjects();

      service.changeQuery('');
      const actual = service.getProjects();

      expect(actual).toEqual(expected);
    });

    it('Filters by ID and name', () => {
      const query = 'prj';
      const expected = projects.filter(project => project.includes(query));

      service.changeQuery(query);
      const actual = service.getProjects();

      expect(actual).toEqual(expected);
    });

    it('Lets users empty the filter', () => {
      let query = 'prj';
      service.changeQuery(query);
      query = '';
      service.changeQuery(query);

      const actual = service.getProjects();

      expect(actual).toEqual(projects);
    });

    it('Maintains sort when reducing the filter', () => {
      service.changeField(SortBy.PROJECT_ID, SortDirection.ASCENDING);
      let query = 'prj';
      service.changeQuery(query);
      query = '';
      service.changeQuery(query);

      const expected = projects.sort(
        ProjectComparators.getComparator(
          SortDirection.ASCENDING,
          SortBy.PROJECT_ID
        )
      );
      const actual = service.getProjects();

      expect(actual).toEqual(expected);
    });
  });
});
