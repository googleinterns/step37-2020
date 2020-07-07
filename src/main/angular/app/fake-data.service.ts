import {Injectable} from '@angular/core';
import {Recommendation} from '../model/recommendation';
import {RecommenderType} from '../model/recommender-type';
import {ProjectGraphData} from '../model/project-graph-data';
import {Project} from '../model/project';
import {ProjectMetaData} from '../model/project-metadata';

/** Contains fake data for use with HTTP service */
@Injectable()
export class FakeDataService {
  /** Contains the projects that are faked */
  private projects: [Project, ProjectGraphData][];

  constructor() {
    this.projects = [
      FakeDataService.fakeProject1(),
      FakeDataService.fakeProject2(),
      FakeDataService.fakeProject3(),
      FakeDataService.fakeProject4(),
    ];
  }

  /** Returns all the fake projects */
  listProjects(): Project[] {
    return this.projects.map(row => row[0]);
  }

  /** Returns the data associated with the given project */
  getProjectGraphData(id: string): ProjectGraphData | undefined {
    const result: [Project, ProjectGraphData] | undefined = this.projects.find(
      row => row[0].projectId === id
    );
    if (result) {
      return result[1];
    }
    return undefined;
  }

  /** Generate fake data for project 1 */
  private static fakeProject1(): [Project, ProjectGraphData] {
    const projectId = 'project-1';
    // Fake data for showing the graph
    const iamBindings: {[key: number]: number} = {
      [Date.parse('1 Jun 2020 UTC')]: 131,
      [Date.parse('2 Jun 2020 UTC')]: 56,
      [Date.parse('3 Jun 2020 UTC')]: 84,
      [Date.parse('4 Jun 2020 UTC')]: 101,
      [Date.parse('5 Jun 2020 UTC')]: 100,
      [Date.parse('6 Jun 2020 UTC')]: 90,
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
      [Date.parse('18 Jun 2020 UTC')]: 139,
      [Date.parse('19 Jun 2020 UTC')]: 87,
      [Date.parse('20 Jun 2020 UTC')]: 57,
    };
    const recommendations: {[key: number]: Recommendation} = {
      [Date.parse('5 Jun 2020 UTC')]: new Recommendation(
        projectId,
        'Rec 1',
        RecommenderType.IAM_BINDING,
        Date.parse('5 Jun 2020 UTC')
      ),
      [Date.parse('9 Jun 2020 UTC')]: new Recommendation(
        projectId,
        'Rec 2',
        RecommenderType.IAM_BINDING,
        Date.parse('9 Jun 2020 UTC')
      ),
      [Date.parse('17 Jun 2020 UTC')]: new Recommendation(
        projectId,
        'Rec 3',
        RecommenderType.IAM_BINDING,
        Date.parse('17 Jun 2020 UTC')
      ),
      // Simulate two recommendations on one day
      [Date.parse('17 Jun 2020 UTC') + 1]: new Recommendation(
        projectId,
        'Rec 4',
        RecommenderType.IAM_BINDING,
        Date.parse('17 Jun 2020 UTC') + 1
      ),
    };
    return [
      new Project('Project 1', projectId, 1, new ProjectMetaData(100)),
      new ProjectGraphData(projectId, iamBindings, recommendations),
    ];
  }

  /** Generate fake data for project 2 */
  private static fakeProject2(): [Project, ProjectGraphData] {
    const projectId = 'project-2';
    // Fake data for showing the graph
    const iamBindings: {[key: number]: number} = {
      [Date.parse('1 Jun 2020 UTC')]: 28,
      [Date.parse('2 Jun 2020 UTC')]: 36,
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
        'Rec 1',
        RecommenderType.IAM_BINDING,
        Date.parse('1 Jun 2020 UTC')
      ),
      [Date.parse('9 Jun 2020 UTC')]: new Recommendation(
        projectId,
        'Rec 2',
        RecommenderType.IAM_BINDING,
        Date.parse('9 Jun 2020 UTC')
      ),
      [Date.parse('20 Jun 2020 UTC')]: new Recommendation(
        projectId,
        'Rec 3',
        RecommenderType.IAM_BINDING,
        Date.parse('20 Jun 2020 UTC')
      ),
      // Simulate two recommendations on one day
      [Date.parse('20 Jun 2020 UTC') + 1]: new Recommendation(
        projectId,
        'Rec 4',
        RecommenderType.IAM_BINDING,
        Date.parse('20 Jun 2020 UTC') + 1
      ),
    };

    return [
      new Project('Project 2', projectId, 2, new ProjectMetaData(70)),
      new ProjectGraphData(projectId, iamBindings, recommendations),
    ];
  }

  /** Generate fake data for project 3 */
  private static fakeProject3(): [Project, ProjectGraphData] {
    const projectId = 'test-long-project-id-project-3';
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
        'Rec 1',
        RecommenderType.IAM_BINDING,
        Date.parse('7 Jun 2020 UTC')
      ),
      [Date.parse('9 Jun 2020 UTC')]: new Recommendation(
        projectId,
        'Rec 2',
        RecommenderType.IAM_BINDING,
        Date.parse('9 Jun 2020 UTC')
      ),
      [Date.parse('22 Jun 2020 UTC')]: new Recommendation(
        projectId,
        'Rec 3',
        RecommenderType.IAM_BINDING,
        Date.parse('22 Jun 2020 UTC')
      ),
      // Simulate two recommendations on one day
      [Date.parse('122 Jun 2020 UTC') + 1]: new Recommendation(
        projectId,
        'Rec 4',
        RecommenderType.IAM_BINDING,
        Date.parse('22 Jun 2020 UTC') + 1
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

  /** Generate fake data for project 4 */
  private static fakeProject4(): [Project, ProjectGraphData] {
    const projectId = 'quite-the-long-project-4';
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
        'Rec 1',
        RecommenderType.IAM_BINDING,
        Date.parse('1 Jul 2020 UTC')
      ),
      [Date.parse('9 Jul 2020 UTC')]: new Recommendation(
        projectId,
        'Rec 2',
        RecommenderType.IAM_BINDING,
        Date.parse('9 Jul 2020 UTC')
      ),
      [Date.parse('20 Jul 2020 UTC')]: new Recommendation(
        projectId,
        'Rec 3',
        RecommenderType.IAM_BINDING,
        Date.parse('20 Jul 2020 UTC')
      ),
      // Simulate two recommendations on one day
      [Date.parse('20 Jul 2020 UTC') + 1]: new Recommendation(
        projectId,
        'Rec 4',
        RecommenderType.IAM_BINDING,
        Date.parse('20 Jul 2020 UTC') + 1
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
}
