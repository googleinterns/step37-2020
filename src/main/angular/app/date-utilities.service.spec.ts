/* eslint-disable no-undef */
import {DateUtilitiesService} from './date-utilities.service';
import 'jasmine';

describe('UtilitiesService', () => {
  let service: DateUtilitiesService;

  beforeEach(() => {
    service = new DateUtilitiesService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
