import year from '../year';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('year', () => {
  const yearSchema = year();

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates if it is empty string', async (done: any) => {
    const isValid = await yearSchema.isValid('');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(true);
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates if it is a year string (min)', async (done: any) => {
    const isValid = await yearSchema.isValid('1000');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(true);
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates if it is a year string (max)', async (done: any) => {
    const isValid = await yearSchema.isValid('2050');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(true);
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates if it is a year string', async (done: any) => {
    const isValid = await yearSchema.isValid('2018');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(true);
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('validates if it is a year number', async (done: any) => {
    const isValid = await yearSchema.isValid(1234);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(true);
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates if it is not a number string', async (done: any) => {
    const isValid = await yearSchema.isValid('foo');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates if it is not a year string', async (done: any) => {
    const isValid = await yearSchema.isValid('12');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates if it is a year string but less than min', async (done: any) => {
    const isValid = await yearSchema.isValid('999');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
    done();
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('invalidates if it is a year string but more than max', async (done: any) => {
    const isValid = await yearSchema.isValid('2051');
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(isValid).toBe(false);
    done();
  });
});
