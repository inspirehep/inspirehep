import cleanupFormData from '../cleanupFormData';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('cleanupFormData', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('cleans up empty values', () => {
    const data = {
      undef: undefined,
      null: null,
      emptyString: '',
      emptyArray: [],
      emptyObject: {},
      false: false,
      true: true,
      one: 1,
      zero: 0,
      string: 'string',
    };
    const expected = {
      false: false,
      true: true,
      one: 1,
      zero: 0,
      string: 'string',
    };
    const result = cleanupFormData(data);
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'expect'. Did you mean 'expected'... Remove this comment to see the full error message
    expect(result).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('cleans up empty values deeply', () => {
    const data = {
      deeplyEmptyArray: [{ foo: '' }],
    };
    const expected = {};
    const result = cleanupFormData(data);
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'expect'. Did you mean 'expected'... Remove this comment to see the full error message
    expect(result).toEqual(expected);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('trims string values before cleanup check', () => {
    const data = {
      onlySpaces: '   ',
      valueWrappedWithSpaces: '   value  ',
    };
    const expected = {
      valueWrappedWithSpaces: 'value',
    };
    const result = cleanupFormData(data);
    // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'expect'. Did you mean 'expected'... Remove this comment to see the full error message
    expect(result).toEqual(expected);
  });
});
