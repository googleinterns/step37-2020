import 'jasmine';
import {ErrorMessageService} from './error_message.service';
import {ErrorMessage} from '../../model/error_message';
import {FakeRedirrectService} from './fake_services/fake_redirrect.service';

describe('ErrorMessageService', () => {
  let service: ErrorMessageService;
  let errorMessages: ErrorMessage[];
  let fakeRedirrect: FakeRedirrectService;

  beforeAll(() => {
    fakeRedirrect = new FakeRedirrectService();
    service = new ErrorMessageService(fakeRedirrect);
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

    it('Sends a redirrect', () => {
      const redirrected = fakeRedirrect.redirrectSent('error');

      expect(redirrected).toBeTrue();
    });
  });
});
