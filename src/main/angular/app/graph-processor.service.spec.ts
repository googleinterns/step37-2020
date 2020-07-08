/* eslint-disable no-undef */
import {TestBed} from '@angular/core/testing';
import {GraphProcessorService} from './graph-processor.service';
import 'jasmine';
import {DateUtilitiesService} from './date-utilities.service';

describe('GraphProcessorService', () => {
  let service: GraphProcessorService;

  beforeEach(() => {
    service = new GraphProcessorService(new DateUtilitiesService());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
