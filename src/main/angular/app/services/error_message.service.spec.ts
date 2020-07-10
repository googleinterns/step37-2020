import 'jasmine';
import {ErrorMessageService} from './error_message.service';
import {ErrorMessage} from '../../model/error_message';
import {FakeRedirectService} from './fake_services/fake_redirect.service';

describe('ErrorMessageService', () => {
  let service: ErrorMessageService;
  let errorMessages: ErrorMessage[];
  let fakeRedirect: FakeRedirectService;

  beforeAll(() => {
    fakeRedirect = new FakeRedirectService();
    service = new ErrorMessageService(fakeRedirect);
    errorMessages = [
      new ErrorMessage('err1', {}),
      new ErrorMessage('err2', {}),
    ];
  });

  describe('Sends errors properly', () => {
    beforeAll(() => {
      service.setErrors(errorMessages);
    });

    it('Properly sets the errors field', () => {
      const actual = service.getErrors();

      expect(actual).toEqual(errorMessages);
    });

    it('Sends a redirect', () => {
      const redirected = fakeRedirect.redirectSent('error');

      expect(redirected).toBeTrue();
    });
  });
});
