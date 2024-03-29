import { string } from 'yup';

import emptyObjectOrShapeOf from '../emptyObjectOrShapeOf';

describe('emptyObjectOrShapeOf', () => {
  const emptyObjectOrHasRequiredFooSchema = emptyObjectOrShapeOf({
    foo: string().required(),
  });

  it('validates empty object', async () => {
    let validationError;
    try {
      await emptyObjectOrHasRequiredFooSchema.validate({});
    } catch (error) {
      validationError = error;
    }
    expect(validationError).toBeUndefined();
  });

  it('validates empty object if object has only empty properties', async () => {
    let validationError;
    try {
      await emptyObjectOrHasRequiredFooSchema.validate({ foo: '' });
    } catch (error) {
      validationError = error;
    }
    expect(validationError).toBeUndefined();
  });

  it('validates according to shape schema', async () => {
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
  });

  it('invalidates according to shape schema', async () => {
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
  });
});
