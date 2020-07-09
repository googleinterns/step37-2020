import {USE_TEST_DATA} from '../../constants';
import {FakeDataService} from './fake-services/fake-data.service';
import {HttpService} from './real-services/http.service';
import {HttpClient} from '@angular/common/http';
import {DataService} from './data.service';

const dataServiceFactory = (http: HttpClient) => {
  if (USE_TEST_DATA) {
    return new FakeDataService();
  } else {
    return new HttpService(http);
  }
};

export const dataServiceProvider = {
  provide: DataService,
  useFactory: dataServiceFactory,
  deps: [HttpClient],
};
