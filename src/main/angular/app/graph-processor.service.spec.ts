import {TestBed} from '@angular/core/testing';
import {describe, beforeEach, it} from 'jasmine';

import {GraphProcessorService} from './graph-processor.service';

describe('GraphProcessorService', () => {
  let service: GraphProcessorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GraphProcessorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
