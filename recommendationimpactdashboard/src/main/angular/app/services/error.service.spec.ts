import 'jasmine';
import {ErrorService} from './error.service';
import {ErrorMessage} from '../../model/error_message';
import {RedirectService} from './redirect.service';
import {mock, instance, verify, anything} from 'ts-mockito';
import {DataShareService} from './data_share.service';

describe('ErrorMessageService', () => {
  let service: ErrorService;
  let errorMessages: ErrorMessage[];
  let redirectService: RedirectService;
  let dataShareService: DataShareService;

  beforeAll(() => {
    redirectService = mock(RedirectService);
    dataShareService = mock(DataShareService);
    service = new ErrorService(
      instance(redirectService),
      instance(dataShareService)
    );
    errorMessages = [
      new ErrorMessage('err1', {}),
      new ErrorMessage('err2', {}),
    ];
  });

  describe('Sends errors properly', () => {
    beforeAll(() => {
      errorMessages.forEach(error => service.handleError(error));
    });

    it('Properly sets the errors field', () => {
      verify(dataShareService.addError(anything())).called();
    });

    it('Sends a redirect', () => {
      verify(redirectService.redirect('error')).called();
    });
  });
});
