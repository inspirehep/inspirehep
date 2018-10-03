import { string } from 'yup';
import isValidOrcid from 'is-valid-orcid';

import { emptyObjectOrShapeOf, orcid } from '../customSchemas';

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
});
