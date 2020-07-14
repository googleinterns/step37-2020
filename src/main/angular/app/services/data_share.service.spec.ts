import {DataShareService} from './data_share.service';
import {ErrorMessage} from '../../model/error_message';

describe('DataShareService', () => {
  let service: DataShareService;

  describe('addError()', () => {
    let errors: ErrorMessage[];
    beforeEach(() => {
      service = new DataShareService();
      errors = [new ErrorMessage('err1', {}), new ErrorMessage('err2', {})];
    });

    it('Adds a single error', () => {
      const expected = [errors[0]];

      service.addError(errors[0]);
      const actual = service.getErrors();

      expect(actual).toEqual(expected);
    });

    it('Adds multiple errors', () => {
      errors.forEach(error => service.addError(error));
      const actual = service.getErrors();

      expect(actual).toEqual(errors);
    });
  });
});
