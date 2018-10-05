import { string } from 'yup';
import isValidOrcid from 'is-valid-orcid';

import { emptyObjectOrShapeOf, orcid, year } from '../customSchemas';

jest.mock('is-valid-orcid');

describe('customSchemas', () => {
  describe('emptyObjectOrShapeOf', () => {
    const emptyObjectOrHasRequiredFooSchema = emptyObjectOrShapeOf({
      foo: string().required(),
    });

    it('validates empty object', async done => {
      let validationError;
      try {
        await emptyObjectOrHasRequiredFooSchema.validate({});
      } catch (error) {
        validationError = error;
      }
      expect(validationError).toBeUndefined();
      done();
    });

    it('validates empty object if object has only empty properties', async done => {
      let validationError;
      try {
        await emptyObjectOrHasRequiredFooSchema.validate({ foo: '' });
      } catch (error) {
        validationError = error;
      }
      expect(validationError).toBeUndefined();
      done();
    });

    it('validates according to shape schema', async done => {
      const data = {
        foo: 'bar',
      };
      let validationError;
      try {
        await emptyObjectOrHasRequiredFooSchema.validate(data);
      } catch (error) {
        validationError = error;
      }
      expect(validationError).toBeUndefined();
      done();
    });

    it('invalidates according to shape schema', async done => {
      const data = {
        notFoo: 'bar',
      };
      let validationError;
      try {
        await emptyObjectOrHasRequiredFooSchema.validate(data);
      } catch (error) {
        validationError = error;
      }
      expect(validationError).toBeDefined();
      done();
    });
  });

  describe('orcid', () => {
    const orcidSchema = orcid();

    it('validates when undefined', async done => {
      const isValid = await orcidSchema.isValid(undefined);
      expect(isValid).toBe(true);
      done();
    });

    it('validates when has empty spaces', () => {
      isValidOrcid.mockImplementationOnce(() => true);
      orcidSchema.isValidSync(' 0000-0000-0000-0000 ');
      expect(isValidOrcid).toHaveBeenCalledWith('0000-0000-0000-0000');
    });

    it('validates when isValidOrcid returns true', async done => {
      isValidOrcid.mockImplementationOnce(() => true);
      const isValid = await orcidSchema.isValid('VALID ORCID');
      expect(isValid).toBe(true);
      done();
    });

    it('invalidates when isValidOrcid returns false', async done => {
      isValidOrcid.mockImplementationOnce(() => false);
      const isValid = await orcidSchema.isValid('INVALID ORCID');
      expect(isValid).toBe(false);
      done();
    });
  });

  describe('year', () => {
    const yearSchema = year();

    it('validates if it is empty string', async done => {
      const isValid = await yearSchema.isValid('');
      expect(isValid).toBe(true);
      done();
    });

    it('validates if it is a year string (min)', async done => {
      const isValid = await yearSchema.isValid('1000');
      expect(isValid).toBe(true);
      done();
    });

    it('validates if it is a year string (max)', async done => {
      const isValid = await yearSchema.isValid('2050');
      expect(isValid).toBe(true);
      done();
    });

    it('validates if it is a year string', async done => {
      const isValid = await yearSchema.isValid('2018');
      expect(isValid).toBe(true);
      done();
    });

    it('validates if it is a year number', async done => {
      const isValid = await yearSchema.isValid(1234);
      expect(isValid).toBe(true);
      done();
    });

    it('invalidates if it is not a number string', async done => {
      const isValid = await yearSchema.isValid('foo');
      expect(isValid).toBe(false);
      done();
    });

    it('invalidates if it is not a year string', async done => {
      const isValid = await yearSchema.isValid('12');
      expect(isValid).toBe(false);
      done();
    });

    it('invalidates if it is a year string but less than min', async done => {
      const isValid = await yearSchema.isValid('999');
      expect(isValid).toBe(false);
      done();
    });

    it('invalidates if it is a year string but more than max', async done => {
      const isValid = await yearSchema.isValid('2051');
      expect(isValid).toBe(false);
      done();
    });
  });
});
