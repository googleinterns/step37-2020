import {Injectable} from '@angular/core';
import {Recommendation} from '../../../model/recommendation';
import {RecommenderType} from '../../../model/recommender_type';
import {ProjectGraphData} from '../../../model/project_graph_data';
import {Project} from '../../../model/project';
import {ProjectMetaData} from '../../../model/project_metadata';
import {DataService, RequestType} from '../data.service';
import {ErrorMessage} from '../../../model/error_message';
import {RecommendationAction} from '../../../model/recommendation_action';
import {RecommenderMetadata} from '../../../model/recommender_metadata';
import {GraphDataCacheService} from '../graph_data_cache.service';
import {DataSummaryList} from '../../../model/data_summary_list';
import {Organization} from '../../../model/organization';
import {OrganizationGraphData} from '../../../model/organization_graph_data';
import {OrganizationIdentification} from '../../../model/organization_identification';

/** Contains fake data. */
@Injectable()
export class FakeDataService implements DataService {
  /** The URLs of all active requests. */
  private activeRequests: {[type in RequestType]: Set<string>};
  /** Contains the projects that are faked. */
  private projects: {[projectId: string]: [Project, ProjectGraphData]};
  /** Contains the faked organizations. */
  public organizations: {
    [organizationId: string]: [Organization, OrganizationGraphData];
  };

  private static actions = [
    new RecommendationAction('test@', 'owner', 'manager', ''),
    new RecommendationAction('test@', 'observer', '', ''),
  ];
  /** The time to artificially wait on a request. */
  private static requestTime = 0;

  constructor(private cacheService: GraphDataCacheService) {
    this.projects = {};
    this.organizations = {};
    const fakes = [
      FakeDataService.fakeProject1(),
      FakeDataService.fakeProject2(),
      FakeDataService.fakeProject3(),
      FakeDataService.fakeProject4(),
      FakeDataService.fakeProject5(),
      FakeDataService.fakeProject6(),
      FakeDataService.fakeProject7(),
      FakeDataService.fakeProject8(),
      FakeDataService.fakeProject9(),
      FakeDataService.fakeProject10(),
    ];
    fakes.forEach(tuple => (this.projects[tuple[0].projectId] = tuple));
    this.setupFakeOrganizations(fakes);

    this.activeRequests = {
      [RequestType.LIST_SUMMARIES]: new Set(),
      [RequestType.GET_PROJECT_DATA]: new Set(),
      [RequestType.GET_ORGANIZATION_DATA]: new Set(),
      [RequestType.POST_MANUAL_UPDATE]: new Set(),
    };
  }

  /** Returns all the fake projects. */
  listSummaries(): Promise<DataSummaryList> {
    const url = '/list-summaries';
    this.activeRequests[RequestType.LIST_SUMMARIES].add(url);
    return new Promise(resolve => {
      setTimeout(() => {
        this.activeRequests[RequestType.LIST_SUMMARIES].delete(url);
        const projects = Object.values(this.projects).map(tuple => tuple[0]);
        const organizations = Object.values(this.organizations).map(
          tuple => tuple[0]
        );
        resolve(new DataSummaryList(projects, organizations, true));
      }, FakeDataService.requestTime);
    });
  }

  /** Returns the data associated with the given project. */
  getProjectGraphData(id: string): Promise<ProjectGraphData> {
    if (this.cacheService.hasProjectEntry(id)) {
      return new Promise(resolve =>
        resolve(this.cacheService.getProjectEntry(id))
      );
    }
    if (this.projects[id]) {
      this.activeRequests[RequestType.GET_PROJECT_DATA].add(id);
      return new Promise(resolve => {
        setTimeout(() => {
          this.activeRequests[RequestType.GET_PROJECT_DATA].delete(id);
          this.cacheService.addProjectEntry(id, this.projects[id][1]);
          resolve(this.projects[id][1]);
        }, FakeDataService.requestTime);
      });
    } else {
      throw new ErrorMessage(
        `Error retrieving project of ID ${id} from FakeDataService`,
        {}
      );
    }
  }

  getOrganizationGraphData(id: string): Promise<OrganizationGraphData> {
    if (this.cacheService.hasOrganizationEntry(id)) {
      return new Promise(resolve =>
        resolve(this.cacheService.getOrganizationEntry(id))
      );
    }
    if (this.organizations[id]) {
      this.activeRequests[RequestType.GET_ORGANIZATION_DATA].add(id);
      return new Promise(resolve => {
        setTimeout(() => {
          this.activeRequests[RequestType.GET_ORGANIZATION_DATA].delete(id);
          this.cacheService.addOrganizationEntry(id, this.organizations[id][1]);
          resolve(this.organizations[id][1]);
        }, FakeDataService.requestTime);
      });
    } else {
      throw new ErrorMessage(
        `Error retrieving organization of ID ${id} from FakeDataService`,
        {}
      );
    }
  }

  hasPendingRequest(type: RequestType): boolean {
    return this.activeRequests[type].size > 0;
  }

  /** Sends a POST to /manual-update. */
  postManualUpdate(): Promise<void> {
    const url = '/manual-update';
    this.activeRequests[RequestType.POST_MANUAL_UPDATE].add(url);
    return new Promise(resolve => {
      setTimeout(() => {
        this.activeRequests[RequestType.POST_MANUAL_UPDATE].delete(url);
        resolve(undefined);
      }, FakeDataService.requestTime);
    });
  }

  /** Create a project that has an incorrect mapping, so when it's pressed a redirect is sent to the error page */
  generateErrorProject() {
    // Now simulate an extra 'project 5' with no graph data
    const project = new Project(
      "Project with unequal ID's",
      'project-with-unequal-ids',
      5,
      new ProjectMetaData(0)
    );
    const graphData = new ProjectGraphData('project-with-unequal-ids', {}, {});
    // Make sure the keys aren't the same, so getProjectGraphData will be unable
    // to retrieve the proper ID, to simulate an error
    this.projects.prj5 = [project, graphData];
  }

  /** Constructs the organization graph data with the given projects. */
  private constructOrganizationGraphData(
    fakes: [Project, ProjectGraphData][],
    id: string
  ): OrganizationGraphData {
    const datesToBindings: {[time: number]: number} = {};
    const datesToRecommendations: {[time: number]: Recommendation} = {};

    fakes.forEach(tuple => {
      Object.entries(tuple[1].dateToNumberIAMBindings).forEach(value => {
        if (datesToBindings[value[0]]) {
          datesToBindings[value[0]] += value[1];
        } else {
          datesToBindings[value[0]] = value[1];
        }
      });
      Object.entries(tuple[1].dateToRecommendationTaken).forEach(value => {
        let time = +value[0];
        // Make sure that recommendations never occur on the same time.
        // Not an elegant solution by any means, but this while loop will run a max of 10 times or so.
        while (datesToRecommendations[time]) {
          time++;
          value[1].acceptedTimestamp++;
        }
        datesToRecommendations[time] = value[1];
      });
    });

    return new OrganizationGraphData(
      id,
      datesToBindings,
      datesToRecommendations
    );
  }

  /** Set up fake organizations. Projects 1-3 are in org-1, 4-6 in org-2, 7-10 in org-3. */
  private setupFakeOrganizations(fakes: [Project, ProjectGraphData][]): void {
    // org-1 projects
    let identification = new OrganizationIdentification(
      'org-1',
      'Organization 1'
    );
    this.organizations['org-1'] = [
      new Organization(identification, 3000),
      this.constructOrganizationGraphData(
        fakes.filter((value, index) => index < 3),
        identification.id
      ),
    ];

    // org-2 projects
    identification = new OrganizationIdentification('org-2', 'Organization 2*');
    this.organizations['org-2'] = [
      new Organization(identification, 2000),
      this.constructOrganizationGraphData(
        fakes.filter((value, index) => index >= 3 && index < 6),
        identification.id
      ),
    ];

    // org-3 projects
    identification = new OrganizationIdentification('org-3', 'Organization 3');
    this.organizations['org-3'] = [
      new Organization(identification, 2500),
      this.constructOrganizationGraphData(
        fakes.filter((value, index) => index >= 6),
        identification.id
      ),
    ];
  }

  /** Generate fake data for project 1. */
  private static fakeProject1(): [Project, ProjectGraphData] {
    const projectId = 'project-1';
    const organizationId = 'org-1';
    // Fake data for showing the graph
    const iamBindings: {[key: number]: number} = {
      [Date.parse('1 Jun 2020 UTC')]: 131,
      [Date.parse('2 Jun 2020 UTC')]: 56,
      [Date.parse('3 Jun 2020 UTC')]: 84,
      [Date.parse('4 Jun 2020 UTC')]: 101,
      [Date.parse('5 Jun 2020 UTC')]: 100,
      [Date.parse('6 Jun 2020 UTC')]: 50,
      [Date.parse('7 Jun 2020 UTC')]: 66,
      [Date.parse('8 Jun 2020 UTC')]: 136,
      [Date.parse('9 Jun 2020 UTC')]: 108,
      [Date.parse('10 Jun 2020 UTC')]: 50,
      [Date.parse('11 Jun 2020 UTC')]: 92,
      [Date.parse('12 Jun 2020 UTC')]: 136,
      [Date.parse('13 Jun 2020 UTC')]: 55,
      [Date.parse('14 Jun 2020 UTC')]: 148,
      [Date.parse('15 Jun 2020 UTC')]: 141,
      [Date.parse('16 Jun 2020 UTC')]: 64,
      [Date.parse('17 Jun 2020 UTC')]: 102,
      [Date.parse('18 Jun 2020 UTC')]: 40,
      [Date.parse('19 Jun 2020 UTC')]: 87,
      [Date.parse('20 Jun 2020 UTC')]: 57,
    };
    const recommendations: {[key: number]: Recommendation} = {
      [Date.parse('5 Jun 2020 UTC')]: new Recommendation(
        projectId,
        organizationId,
        'user@',
        FakeDataService.actions,
        RecommenderType.IAM_BINDING,
        Date.parse('5 Jun 2020 UTC'),
        new RecommenderMetadata(20)
      ),
      [Date.parse('9 Jun 2020 UTC')]: new Recommendation(
        projectId,
        organizationId,
        'user@',

        FakeDataService.actions,
        RecommenderType.IAM_BINDING,
        Date.parse('9 Jun 2020 UTC'),
        new RecommenderMetadata(26)
      ),
      [Date.parse('17 Jun 2020 UTC')]: new Recommendation(
        projectId,
        organizationId,
        'user@',
        FakeDataService.actions,
        RecommenderType.IAM_BINDING,
        Date.parse('17 Jun 2020 UTC'),
        new RecommenderMetadata(11)
      ),
      // Simulate multiple recommendations on one day
      [Date.parse('17 Jun 2020 UTC') + 1]: new Recommendation(
        projectId,
        organizationId,
        'user@',
        FakeDataService.actions,
        RecommenderType.IAM_BINDING,
        Date.parse('17 Jun 2020 UTC') + 1,
        new RecommenderMetadata(36)
      ),
      [Date.parse('17 Jun 2020 UTC') + 2]: new Recommendation(
        projectId,
        organizationId,
        'user@',
        FakeDataService.actions,
        RecommenderType.IAM_BINDING,
        Date.parse('17 Jun 2020 UTC') + 2,
        new RecommenderMetadata(27)
      ),
      [Date.parse('17 Jun 2020 UTC') + 3]: new Recommendation(
        projectId,
        organizationId,
        'user@',
        FakeDataService.actions,
        RecommenderType.IAM_BINDING,
        Date.parse('17 Jun 2020 UTC') + 3,
        new RecommenderMetadata(31)
      ),
    };
    return [
      new Project('Project 1', projectId, 1, new ProjectMetaData(300)),
      new ProjectGraphData(projectId, iamBindings, recommendations),
    ];
  }

  /** Generate fake data for project 2. */
  private static fakeProject2(): [Project, ProjectGraphData] {
    const projectId = 'project-2';
    const organizationId = 'org-1';
    // Fake data for showing the graph
    const iamBindings: {[key: number]: number} = {
      [Date.parse('1 Jun 2020 UTC')]: 28,
      [Date.parse('2 Jun 2020 UTC')]: 11,
      [Date.parse('3 Jun 2020 UTC')]: 22,
      [Date.parse('4 Jun 2020 UTC')]: 62,
      [Date.parse('5 Jun 2020 UTC')]: 60,
      [Date.parse('6 Jun 2020 UTC')]: 41,
      [Date.parse('7 Jun 2020 UTC')]: 52,
      [Date.parse('8 Jun 2020 UTC')]: 27,
      [Date.parse('9 Jun 2020 UTC')]: 55,
      [Date.parse('10 Jun 2020 UTC')]: 38,
      [Date.parse('11 Jun 2020 UTC')]: 28,
      [Date.parse('12 Jun 2020 UTC')]: 38,
      [Date.parse('13 Jun 2020 UTC')]: 34,
      [Date.parse('14 Jun 2020 UTC')]: 18,
      [Date.parse('15 Jun 2020 UTC')]: 12,
      [Date.parse('16 Jun 2020 UTC')]: 48,
      [Date.parse('17 Jun 2020 UTC')]: 47,
      [Date.parse('18 Jun 2020 UTC')]: 60,
      [Date.parse('19 Jun 2020 UTC')]: 20,
      [Date.parse('20 Jun 2020 UTC')]: 47,
    };
    const recommendations: {[key: number]: Recommendation} = {
      [Date.parse('1 Jun 2020 UTC')]: new Recommendation(
        projectId,
        organizationId,
        'user@',
        FakeDataService.actions,
        RecommenderType.IAM_BINDING,
        Date.parse('1 Jun 2020 UTC'),
        new RecommenderMetadata(20)
      ),
      [Date.parse('9 Jun 2020 UTC')]: new Recommendation(
        projectId,
        organizationId,
        'user@',
        FakeDataService.actions,
        RecommenderType.IAM_BINDING,
        Date.parse('9 Jun 2020 UTC'),
        new RecommenderMetadata(20)
      ),
      [Date.parse('20 Jun 2020 UTC')]: new Recommendation(
        projectId,
        organizationId,
        'user@',
        FakeDataService.actions,
        RecommenderType.IAM_BINDING,
        Date.parse('20 Jun 2020 UTC'),
        new RecommenderMetadata(20)
      ),
      // Simulate two recommendations on one day
      [Date.parse('20 Jun 2020 UTC') + 1]: new Recommendation(
        projectId,
        organizationId,
        'user@',
        FakeDataService.actions,
        RecommenderType.IAM_BINDING,
        Date.parse('20 Jun 2020 UTC'),
        new RecommenderMetadata(20)
      ),
    };

    return [
      new Project('Project 2', projectId, 2, new ProjectMetaData(70)),
      new ProjectGraphData(projectId, iamBindings, recommendations),
    ];
  }

  /** Generate fake data for project 3. */
  private static fakeProject3(): [Project, ProjectGraphData] {
    const projectId = 'test-long-project-id-project-3';
    const organizationId = 'org-1';
    // Fake data for showing the graph
    const iamBindings: {[key: number]: number} = {
      [Date.parse('6 Jun 2020 UTC')]: 125,
      [Date.parse('7 Jun 2020 UTC')]: 201,
      [Date.parse('8 Jun 2020 UTC')]: 177,
      [Date.parse('9 Jun 2020 UTC')]: 111,
      [Date.parse('10 Jun 2020 UTC')]: 212,
      [Date.parse('11 Jun 2020 UTC')]: 190,
      [Date.parse('12 Jun 2020 UTC')]: 184,
      [Date.parse('13 Jun 2020 UTC')]: 137,
      [Date.parse('14 Jun 2020 UTC')]: 124,
      [Date.parse('15 Jun 2020 UTC')]: 205,
      [Date.parse('16 Jun 2020 UTC')]: 182,
      [Date.parse('17 Jun 2020 UTC')]: 109,
      [Date.parse('18 Jun 2020 UTC')]: 191,
      [Date.parse('19 Jun 2020 UTC')]: 211,
      [Date.parse('20 Jun 2020 UTC')]: 213,
      [Date.parse('21 Jun 2020 UTC')]: 177,
      [Date.parse('22 Jun 2020 UTC')]: 136,
      [Date.parse('23 Jun 2020 UTC')]: 193,
      [Date.parse('24 Jun 2020 UTC')]: 153,
      [Date.parse('25 Jun 2020 UTC')]: 187,
    };
    const recommendations: {[key: number]: Recommendation} = {
      [Date.parse('7 Jun 2020 UTC')]: new Recommendation(
        projectId,
        organizationId,
        'user@',
        FakeDataService.actions,
        RecommenderType.IAM_BINDING,
        Date.parse('7 Jun 2020 UTC'),
        new RecommenderMetadata(20)
      ),
      [Date.parse('9 Jun 2020 UTC')]: new Recommendation(
        projectId,
        organizationId,
        'user@',
        FakeDataService.actions,
        RecommenderType.IAM_BINDING,
        Date.parse('9 Jun 2020 UTC'),
        new RecommenderMetadata(20)
      ),
      [Date.parse('22 Jun 2020 UTC')]: new Recommendation(
        projectId,
        organizationId,
        'user@',
        FakeDataService.actions,
        RecommenderType.IAM_BINDING,
        Date.parse('22 Jun 2020 UTC'),
        new RecommenderMetadata(20)
      ),
      // Simulate two recommendations on one day
      [Date.parse('22 Jun 2020 UTC') + 1]: new Recommendation(
        projectId,
        organizationId,
        'user@',
        FakeDataService.actions,
        RecommenderType.IAM_BINDING,
        Date.parse('22 Jun 2020 UTC') + 1,
        new RecommenderMetadata(20)
      ),
    };

    return [
      new Project(
        'Test Long Project ID Project 3',
        projectId,
        3,
        new ProjectMetaData(173)
      ),
      new ProjectGraphData(projectId, iamBindings, recommendations),
    ];
  }

  /** Generate fake data for project 4. */
  private static fakeProject4(): [Project, ProjectGraphData] {
    const projectId = 'quite-the-long-project-4';
    const organizationId = 'org-2';
    // Fake data for showing the graph
    const iamBindings: {[key: number]: number} = {
      [Date.parse('1 Jul 2020 UTC')]: 14,
      [Date.parse('2 Jul 2020 UTC')]: 24,
      [Date.parse('3 Jul 2020 UTC')]: 23,
      [Date.parse('4 Jul 2020 UTC')]: 35,
      [Date.parse('5 Jul 2020 UTC')]: 38,
      [Date.parse('6 Jul 2020 UTC')]: 19,
      [Date.parse('7 Jul 2020 UTC')]: 17,
      [Date.parse('8 Jul 2020 UTC')]: 21,
      [Date.parse('9 Jul 2020 UTC')]: 12,
      [Date.parse('10 Jul 2020 UTC')]: 39,
      [Date.parse('11 Jul 2020 UTC')]: 35,
      [Date.parse('12 Jul 2020 UTC')]: 15,
      [Date.parse('13 Jul 2020 UTC')]: 26,
      [Date.parse('14 Jul 2020 UTC')]: 40,
      [Date.parse('15 Jul 2020 UTC')]: 36,
      [Date.parse('16 Jul 2020 UTC')]: 37,
      [Date.parse('17 Jul 2020 UTC')]: 26,
      [Date.parse('18 Jul 2020 UTC')]: 28,
      [Date.parse('19 Jul 2020 UTC')]: 34,
      [Date.parse('20 Jul 2020 UTC')]: 27,
    };
    const recommendations: {[key: number]: Recommendation} = {
      [Date.parse('1 Jul 2020 UTC')]: new Recommendation(
        projectId,
        organizationId,
        'user@',
        FakeDataService.actions,
        RecommenderType.IAM_BINDING,
        Date.parse('1 Jul 2020 UTC'),
        new RecommenderMetadata(20)
      ),
      [Date.parse('9 Jul 2020 UTC')]: new Recommendation(
        projectId,
        organizationId,
        'user@',
        FakeDataService.actions,
        RecommenderType.IAM_BINDING,
        Date.parse('9 Jul 2020 UTC'),
        new RecommenderMetadata(20)
      ),
      [Date.parse('20 Jul 2020 UTC')]: new Recommendation(
        projectId,
        organizationId,
        'user@',
        FakeDataService.actions,
        RecommenderType.IAM_BINDING,
        Date.parse('20 Jul 2020 UTC'),
        new RecommenderMetadata(20)
      ),
      // Simulate two recommendations on one day
      [Date.parse('20 Jul 2020 UTC') + 1]: new Recommendation(
        projectId,
        organizationId,
        'user@',
        FakeDataService.actions,
        RecommenderType.IAM_BINDING,
        Date.parse('20 Jul 2020 UTC') + 1,
        new RecommenderMetadata(20)
      ),
    };

    return [
      new Project(
        'Quite the Long Project 4',
        projectId,
        4,
        new ProjectMetaData(33)
      ),
      new ProjectGraphData(projectId, iamBindings, recommendations),
    ];
  }

  /** Generate fake data for project 5 */
  private static fakeProject5(): [Project, ProjectGraphData] {
    const projectId = 'project-5-to-filter';
    const organizationId = 'org-2';
    // Fake data for showing the graph
    const iamBindings: {[key: number]: number} = {
      [Date.parse('1 Jul 2020 UTC')]: 183,
      [Date.parse('2 Jul 2020 UTC')]: 189,
      [Date.parse('3 Jul 2020 UTC')]: 253,
      [Date.parse('4 Jul 2020 UTC')]: 196,
      [Date.parse('5 Jul 2020 UTC')]: 132,
      [Date.parse('6 Jul 2020 UTC')]: 196,
      [Date.parse('7 Jul 2020 UTC')]: 187,
      [Date.parse('8 Jul 2020 UTC')]: 228,
      [Date.parse('9 Jul 2020 UTC')]: 131,
      [Date.parse('10 Jul 2020 UTC')]: 254,
      [Date.parse('11 Jul 2020 UTC')]: 139,
      [Date.parse('12 Jul 2020 UTC')]: 195,
      [Date.parse('13 Jul 2020 UTC')]: 150,
      [Date.parse('14 Jul 2020 UTC')]: 242,
      [Date.parse('15 Jul 2020 UTC')]: 146,
      [Date.parse('16 Jul 2020 UTC')]: 122,
      [Date.parse('17 Jul 2020 UTC')]: 156,
      [Date.parse('18 Jul 2020 UTC')]: 209,
      [Date.parse('19 Jul 2020 UTC')]: 148,
      [Date.parse('20 Jul 2020 UTC')]: 187,
      [Date.parse('21 Jul 2020 UTC')]: 225,
      [Date.parse('22 Jul 2020 UTC')]: 156,
      [Date.parse('23 Jul 2020 UTC')]: 240,
      [Date.parse('24 Jul 2020 UTC')]: 220,
      [Date.parse('25 Jul 2020 UTC')]: 130,
      [Date.parse('26 Jul 2020 UTC')]: 230,
      [Date.parse('27 Jul 2020 UTC')]: 182,
      [Date.parse('28 Jul 2020 UTC')]: 156,
      [Date.parse('29 Jul 2020 UTC')]: 140,
      [Date.parse('30 Jul 2020 UTC')]: 188,
    };
    const recommendations: {[key: number]: Recommendation} = {
      [Date.parse('9 Jul 2020 UTC')]: new Recommendation(
        projectId,
        organizationId,
        'user@',
        FakeDataService.actions,
        RecommenderType.IAM_BINDING,
        Date.parse('9 Jul 2020 UTC'),
        new RecommenderMetadata(20)
      ),
    };

    return [
      new Project(
        'Project 5 filter by me!',
        projectId,
        5,
        new ProjectMetaData(180)
      ),
      new ProjectGraphData(projectId, iamBindings, recommendations),
    ];
  }

  /** Generate fake data for project 6 */
  private static fakeProject6(): [Project, ProjectGraphData] {
    const projectId = 'project-6-for-concord-intern';
    const organizationId = 'org-2';
    // Fake data for showing the graph
    const iamBindings: {[key: number]: number} = {
      [Date.parse('1 Jul 2020 UTC')]: 138,
      [Date.parse('2 Jul 2020 UTC')]: 183,
      [Date.parse('3 Jul 2020 UTC')]: 247,
      [Date.parse('4 Jul 2020 UTC')]: 146,
      [Date.parse('5 Jul 2020 UTC')]: 219,
      [Date.parse('6 Jul 2020 UTC')]: 215,
      [Date.parse('7 Jul 2020 UTC')]: 200,
      [Date.parse('8 Jul 2020 UTC')]: 156,
      [Date.parse('9 Jul 2020 UTC')]: 123,
      [Date.parse('10 Jul 2020 UTC')]: 125,
      [Date.parse('11 Jul 2020 UTC')]: 177,
      [Date.parse('12 Jul 2020 UTC')]: 204,
      [Date.parse('13 Jul 2020 UTC')]: 204,
      [Date.parse('14 Jul 2020 UTC')]: 125,
      [Date.parse('15 Jul 2020 UTC')]: 145,
      [Date.parse('16 Jul 2020 UTC')]: 256,
      [Date.parse('17 Jul 2020 UTC')]: 161,
      [Date.parse('18 Jul 2020 UTC')]: 169,
      [Date.parse('19 Jul 2020 UTC')]: 142,
      [Date.parse('20 Jul 2020 UTC')]: 137,
      [Date.parse('21 Jul 2020 UTC')]: 123,
      [Date.parse('22 Jul 2020 UTC')]: 251,
      [Date.parse('23 Jul 2020 UTC')]: 128,
      [Date.parse('24 Jul 2020 UTC')]: 189,
      [Date.parse('25 Jul 2020 UTC')]: 254,
      [Date.parse('26 Jul 2020 UTC')]: 130,
      [Date.parse('27 Jul 2020 UTC')]: 203,
      [Date.parse('28 Jul 2020 UTC')]: 199,
      [Date.parse('29 Jul 2020 UTC')]: 125,
      [Date.parse('30 Jul 2020 UTC')]: 196,
    };
    const recommendations: {[key: number]: Recommendation} = {
      [Date.parse('9 Jul 2020 UTC')]: new Recommendation(
        projectId,
        organizationId,
        'user@',
        FakeDataService.actions,
        RecommenderType.IAM_BINDING,
        Date.parse('9 Jul 2020 UTC'),
        new RecommenderMetadata(20)
      ),
    };

    return [
      new Project(
        'Project 6 is for concord interns!',
        projectId,
        6,
        new ProjectMetaData(187)
      ),
      new ProjectGraphData(projectId, iamBindings, recommendations),
    ];
  }

  /** Generate fake data for project 7 */
  private static fakeProject7(): [Project, ProjectGraphData] {
    const projectId = 'project-7-here-at-google';
    const organizationId = 'org-3';
    // Fake data for showing the graph
    const iamBindings: {[key: number]: number} = {
      [Date.parse('1 Aug 2020 UTC')]: 235,
      [Date.parse('2 Aug 2020 UTC')]: 149,
      [Date.parse('3 Aug 2020 UTC')]: 228,
      [Date.parse('4 Aug 2020 UTC')]: 126,
      [Date.parse('5 Aug 2020 UTC')]: 139,
      [Date.parse('6 Aug 2020 UTC')]: 125,
      [Date.parse('7 Aug 2020 UTC')]: 234,
      [Date.parse('8 Aug 2020 UTC')]: 190,
      [Date.parse('9 Aug 2020 UTC')]: 189,
      [Date.parse('10 Aug 2020 UTC')]: 138,
      [Date.parse('11 Aug 2020 UTC')]: 193,
      [Date.parse('12 Aug 2020 UTC')]: 158,
      [Date.parse('13 Aug 2020 UTC')]: 194,
      [Date.parse('14 Aug 2020 UTC')]: 131,
      [Date.parse('15 Aug 2020 UTC')]: 191,
      [Date.parse('16 Aug 2020 UTC')]: 188,
      [Date.parse('17 Aug 2020 UTC')]: 141,
      [Date.parse('18 Aug 2020 UTC')]: 197,
      [Date.parse('19 Aug 2020 UTC')]: 144,
      [Date.parse('20 Aug 2020 UTC')]: 208,
      [Date.parse('21 Aug 2020 UTC')]: 213,
      [Date.parse('22 Aug 2020 UTC')]: 204,
      [Date.parse('23 Aug 2020 UTC')]: 195,
      [Date.parse('24 Aug 2020 UTC')]: 137,
      [Date.parse('25 Aug 2020 UTC')]: 252,
      [Date.parse('26 Aug 2020 UTC')]: 242,
      [Date.parse('27 Aug 2020 UTC')]: 140,
      [Date.parse('28 Aug 2020 UTC')]: 247,
      [Date.parse('29 Aug 2020 UTC')]: 142,
      [Date.parse('30 Aug 2020 UTC')]: 171,
    };
    const recommendations: {[key: number]: Recommendation} = {
      [Date.parse('9 Aug 2020 UTC')]: new Recommendation(
        projectId,
        organizationId,
        'user@',
        FakeDataService.actions,
        RecommenderType.IAM_BINDING,
        Date.parse('9 Aug 2020 UTC'),
        new RecommenderMetadata(20)
      ),
    };

    return [
      new Project(
        'Project 7 is for google interns :)',
        projectId,
        7,
        new ProjectMetaData(213)
      ),
      new ProjectGraphData(projectId, iamBindings, recommendations),
    ];
  }

  /** Generate fake data for project 8 */
  private static fakeProject8(): [Project, ProjectGraphData] {
    const projectId = 'project-8-here-at-google';
    const organizationId = 'org-3';
    // Fake data for showing the graph
    const iamBindings: {[key: number]: number} = {
      [Date.parse('15 Aug 2020 UTC')]: 241,
      [Date.parse('16 Aug 2020 UTC')]: 184,
      [Date.parse('17 Aug 2020 UTC')]: 243,
      [Date.parse('18 Aug 2020 UTC')]: 130,
      [Date.parse('19 Aug 2020 UTC')]: 168,
      [Date.parse('20 Aug 2020 UTC')]: 145,
      [Date.parse('21 Aug 2020 UTC')]: 133,
      [Date.parse('22 Aug 2020 UTC')]: 168,
      [Date.parse('23 Aug 2020 UTC')]: 187,
      [Date.parse('24 Aug 2020 UTC')]: 220,
      [Date.parse('25 Aug 2020 UTC')]: 231,
      [Date.parse('26 Aug 2020 UTC')]: 247,
      [Date.parse('27 Aug 2020 UTC')]: 123,
      [Date.parse('28 Aug 2020 UTC')]: 213,
      [Date.parse('29 Aug 2020 UTC')]: 178,
      [Date.parse('30 Aug 2020 UTC')]: 167,
    };
    const recommendations: {[key: number]: Recommendation} = {
      [Date.parse('17 Aug 2020 UTC')]: new Recommendation(
        projectId,
        organizationId,
        'user@',
        FakeDataService.actions,
        RecommenderType.IAM_BINDING,
        Date.parse('17 Aug 2020 UTC'),
        new RecommenderMetadata(20)
      ),
    };

    return [
      new Project(
        'Project 8 is, in fact, at Google',
        projectId,
        8,
        new ProjectMetaData(192)
      ),
      new ProjectGraphData(projectId, iamBindings, recommendations),
    ];
  }

  /** Generate fake data for project 9 */
  private static fakeProject9(): [Project, ProjectGraphData] {
    const projectId = 'prj-9';
    const organizationId = 'org-3';
    // Fake data for showing the graph
    const iamBindings: {[key: number]: number} = {
      [Date.parse('10 Aug 2020 UTC')]: 93,
      [Date.parse('11 Aug 2020 UTC')]: 88,
      [Date.parse('12 Aug 2020 UTC')]: 94,
      [Date.parse('13 Aug 2020 UTC')]: 86,
      [Date.parse('14 Aug 2020 UTC')]: 82,
      [Date.parse('15 Aug 2020 UTC')]: 90,
      [Date.parse('16 Aug 2020 UTC')]: 92,
      [Date.parse('17 Aug 2020 UTC')]: 88,
    };
    const recommendations: {[key: number]: Recommendation} = {
      [Date.parse('17 Aug 2020 UTC')]: new Recommendation(
        projectId,
        organizationId,
        'user@',
        FakeDataService.actions,
        RecommenderType.IAM_BINDING,
        Date.parse('17 Aug 2020 UTC'),
        new RecommenderMetadata(20)
      ),
    };

    return [
      new Project('Project 9', projectId, 9, new ProjectMetaData(88)),
      new ProjectGraphData(projectId, iamBindings, recommendations),
    ];
  }

  /** Generate fake data for project 10 */
  private static fakeProject10(): [Project, ProjectGraphData] {
    const projectId = 'prj---10';
    const organizationId = 'org-3';
    // Fake data for showing the graph
    const iamBindings: {[key: number]: number} = {
      [Date.parse('1 Aug 2020 UTC')]: 42,
      [Date.parse('2 Aug 2020 UTC')]: 47,
      [Date.parse('3 Aug 2020 UTC')]: 43,
      [Date.parse('4 Aug 2020 UTC')]: 48,
      [Date.parse('5 Aug 2020 UTC')]: 49,
      [Date.parse('6 Aug 2020 UTC')]: 47,
      [Date.parse('7 Aug 2020 UTC')]: 41,
      [Date.parse('8 Aug 2020 UTC')]: 43,
      [Date.parse('9 Aug 2020 UTC')]: 42,
      [Date.parse('10 Aug 2020 UTC')]: 46,
      [Date.parse('11 Aug 2020 UTC')]: 47,
      [Date.parse('12 Aug 2020 UTC')]: 42,
      [Date.parse('13 Aug 2020 UTC')]: 45,
      [Date.parse('14 Aug 2020 UTC')]: 42,
      [Date.parse('15 Aug 2020 UTC')]: 47,
      [Date.parse('16 Aug 2020 UTC')]: 45,
      [Date.parse('17 Aug 2020 UTC')]: 44,
      [Date.parse('18 Aug 2020 UTC')]: 47,
      [Date.parse('19 Aug 2020 UTC')]: 50,
      [Date.parse('20 Aug 2020 UTC')]: 43,
      [Date.parse('21 Aug 2020 UTC')]: 41,
      [Date.parse('22 Aug 2020 UTC')]: 44,
      [Date.parse('23 Aug 2020 UTC')]: 43,
      [Date.parse('24 Aug 2020 UTC')]: 48,
      [Date.parse('25 Aug 2020 UTC')]: 45,
      [Date.parse('26 Aug 2020 UTC')]: 41,
      [Date.parse('27 Aug 2020 UTC')]: 41,
      [Date.parse('28 Aug 2020 UTC')]: 41,
      [Date.parse('29 Aug 2020 UTC')]: 50,
      [Date.parse('30 Aug 2020 UTC')]: 41,
    };
    const recommendations: {[key: number]: Recommendation} = {
      [Date.parse('9 Aug 2020 UTC')]: new Recommendation(
        projectId,
        organizationId,
        'user@',
        FakeDataService.actions,
        RecommenderType.IAM_BINDING,
        Date.parse('9 Aug 2020 UTC'),
        new RecommenderMetadata(20)
      ),
    };

    return [
      new Project('Project 10!', projectId, 10, new ProjectMetaData(47)),
      new ProjectGraphData(projectId, iamBindings, recommendations),
    ];
  }
}
