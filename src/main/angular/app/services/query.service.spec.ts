import {QueryService} from './query.service';
import {FakeDataService} from './fake_services/fake_data.service';
import {Project} from '../../model/project';
import {
  ProjectComparators,
  SortDirection,
  SortBy,
  OrganizationComparators,
} from '../../model/sort_methods';
import {GraphDataCacheService} from './graph_data_cache.service';
import {DateUtilitiesService} from './date_utilities.service';
import {Organization} from '../../model/organization';
import {ResourceType} from '../../model/resource';

describe('ProjectQueryService', () => {
  let service: QueryService;
  let projects: Project[];
  let organizations: Organization[];

  beforeAll(async () => {
    const summaries = await new FakeDataService(
      new GraphDataCacheService(new DateUtilitiesService())
    ).listSummaries();
    projects = summaries.projects;
    organizations = summaries.organizations;
  });

  describe('init()', () => {
    beforeAll(() => {
      service = new QueryService();
      service.init(projects, organizations);
      service.changeResourceType(ResourceType.PROJECT);
    });
    it('Starts sorted by IAM Bindings descending', () => {
      const expected = [
        projects
          .map(p => p)
          .sort(
            ProjectComparators.getComparator(
              SortDirection.DESCENDING,
              SortBy.IAM_BINDINGS
            )
          ),
        organizations
          .map(o => o)
          .sort(
            OrganizationComparators.getComparator(
              SortDirection.DESCENDING,
              SortBy.IAM_BINDINGS
            )
          ),
      ];
      const actual = [service.getProjects(), service.getOrganizations()];

      expect(actual).toEqual(expected);
    });
  });

  describe('toggleDirection()', () => {
    beforeEach(() => {
      service = new QueryService();
      service.init(projects, organizations);
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

    it('Toggles differently for different resources', () => {
      const expected = [SortDirection.ASCENDING, SortDirection.ASCENDING];

      // To start, it's filtering by Project
      service.toggleDirection();
      service.changeResourceType(ResourceType.ORGANIZATION);
      service.toggleDirection();

      const actual = [service.getSortDirection()];
      service.changeResourceType(ResourceType.PROJECT);
      actual.push(service.getSortDirection());

      expect(actual).toEqual(expected);
    });
  });

  describe('changeField()', () => {
    describe('Change the field with the same direction', () => {
      let expectedField: SortBy;
      let currentDirection: SortDirection;

      beforeAll(() => {
        service = new QueryService();
        service.init(projects, organizations);
        expectedField = SortBy.NAME;
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
        service.init(projects, organizations);
        service.changeResourceType(ResourceType.PROJECT);
        expectedField = SortBy.NAME;
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

    describe('Keeps fields separate for different resources', () => {
      beforeEach(() => {
        service = new QueryService();
        service.init(projects, organizations);

        service.changeResourceType(ResourceType.ORGANIZATION);
        service.changeField(SortBy.NAME, SortDirection.ASCENDING);
      });

      it('Changes field for organization', () => {
        const expected = [SortBy.NAME, SortDirection.ASCENDING];
        const actual = [service.getSortField(), service.getSortDirection()];

        expect(actual).toEqual(expected);
      });

      it('Leaves field for project', () => {
        const expected = [SortBy.IAM_BINDINGS, SortDirection.DESCENDING];
        service.changeResourceType(ResourceType.PROJECT);
        const actual = [service.getSortField(), service.getSortDirection()];

        expect(actual).toEqual(expected);
      });
    });
  });

  describe('changeQuery()', () => {
    beforeEach(() => {
      service = new QueryService();
      service.init(projects, organizations);
      service.changeResourceType(ResourceType.PROJECT);
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
      service.changeField(SortBy.ID, SortDirection.ASCENDING);
      let query = 'prj';
      service.changeQuery(query);
      query = '';
      service.changeQuery(query);

      const expected = projects.sort(
        ProjectComparators.getComparator(SortDirection.ASCENDING, SortBy.ID)
      );
      const actual = service.getProjects();

      expect(actual).toEqual(expected);
    });

    it('Keeps query string separate for different resources', () => {
      const projectQuery = 'prj';
      service.changeQuery(projectQuery);
      service.changeResourceType(ResourceType.ORGANIZATION);
      const organizationQuery = 'org';
      service.changeQuery(organizationQuery);

      const expected = [
        projects.filter(project => project.includes(projectQuery)),
        organizations.filter(organization =>
          organization.includes(organizationQuery)
        ),
      ];
      service.changeResourceType(ResourceType.PROJECT);
      const actual: [Project[], Organization[]] = [service.getProjects(), []];
      service.changeResourceType(ResourceType.ORGANIZATION);
      actual[1] = service.getOrganizations();

      expect(actual).toEqual(expected);
    });
  });
});
