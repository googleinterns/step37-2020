import 'jasmine';
import {ErrorService} from './error.service';
import {ErrorMessage} from '../../model/error_message';
import {RedirectService} from './redirect.service';
import {mock, instance, verify} from 'ts-mockito';

describe('ErrorMessageService', () => {
  let service: ErrorService;
  let errorMessages: ErrorMessage[];
  let redirectService: RedirectService;

  beforeAll(() => {
    redirectService = mock(RedirectService);
    service = new ErrorService(instance(redirectService));
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
      const actual = service.getErrors();

      expect(actual).toEqual(errorMessages);
    });

    it('Sends a redirect', () => {
      verify(redirectService.redirect('error')).called();
    });
  });
});
