// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'yup'... Remove this comment to see the full error message
import { string } from 'yup';

import emptyObjectOrShapeOf from '../emptyObjectOrShapeOf';

describe('emptyObjectOrShapeOf', () => {
  const emptyObjectOrHasRequiredFooSchema = emptyObjectOrShapeOf({
    foo: string().required(),
  });

  it('validates empty object', async (done: any) => {
    let validationError;
    try {
      await emptyObjectOrHasRequiredFooSchema.validate({});
    } catch (error) {
      validationError = error;
    }
    expect(validationError).toBeUndefined();
    done();
  });

  it('validates empty object if object has only empty properties', async (done: any) => {
    let validationError;
    try {
      await emptyObjectOrHasRequiredFooSchema.validate({ foo: '' });
    } catch (error) {
      validationError = error;
    }
    expect(validationError).toBeUndefined();
    done();
  });

  it('validates according to shape schema', async (done: any) => {
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

  it('invalidates according to shape schema', async (done: any) => {
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
