// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'yup'... Remove this comment to see the full error message
import { string } from 'yup';

import emptyObjectOrShapeOf from '../emptyObjectOrShapeOf';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('emptyObjectOrShapeOf', () => {
  const emptyObjectOrHasRequiredFooSchema = emptyObjectOrShapeOf({
    foo: string().required(),
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates empty object', async (done: any) => {
    let validationError;
    try {
      await emptyObjectOrHasRequiredFooSchema.validate({});
    } catch (error) {
      validationError = error;
    }
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(validationError).toBeUndefined();
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates empty object if object has only empty properties', async (done: any) => {
    let validationError;
    try {
      await emptyObjectOrHasRequiredFooSchema.validate({ foo: '' });
    } catch (error) {
      validationError = error;
    }
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(validationError).toBeUndefined();
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(validationError).toBeUndefined();
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(validationError).toBeDefined();
    done();
  });
});
