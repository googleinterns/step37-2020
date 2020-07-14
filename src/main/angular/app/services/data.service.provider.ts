import {USE_TEST_DATA} from '../../constants';
import {FakeDataService} from './fake_services/fake_data.service';
import {DataServiceImpl} from './real_services/data_service_impl.service';
import {HttpClient} from '@angular/common/http';
import {DataService} from './data.service';

const dataServiceFactory = (http: HttpClient) => {
  if (USE_TEST_DATA) {
    return new FakeDataService();
  } else {
    return new DataServiceImpl(http);
  }
};

/** Provider that will programatically decide whether to use the fake data serivce or the HTTP service depending on the constant USE_TEST_DATA. */
export const dataServiceProvider = {
  provide: DataService,
  useFactory: dataServiceFactory,
  deps: [HttpClient],
};
