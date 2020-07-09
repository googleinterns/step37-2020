import {HttpClient} from '@angular/common/http';
import {MockHttpHandler} from './mock-http-handler';
import {FakeDataService} from '../app/fake-services/fake-data.service';

/** Mock class for Angular's HttpClient. */
export class MockHttpClient extends HttpClient {
  constructor(fakeDataService: FakeDataService) {
    super(new MockHttpHandler(fakeDataService));
  }
}
