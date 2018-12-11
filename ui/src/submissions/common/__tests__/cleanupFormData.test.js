import cleanupFormData from '../cleanupFormData';

describe('cleanupFormData', () => {
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
    expect(result).toEqual(expected);
  });

  it('cleans up empty values deeply', () => {
    const data = {
      deeplyEmptyArray: [{ foo: '' }],
    };
    const expected = {};
    const result = cleanupFormData(data);
    expect(result).toEqual(expected);
  });

  it('trims string values before cleanup check', () => {
    const data = {
      onlySpaces: '   ',
      valueWrappedWithSpaces: '   value  ',
    };
    const expected = {
      valueWrappedWithSpaces: 'value',
    };
    const result = cleanupFormData(data);
    expect(result).toEqual(expected);
  });
});
