import validator from '../validator';

describe('validator', () => {
  describe('date format', () => {
    const schema = { type: 'string', format: 'date' } as const;

    it.each(['2020', '2020-05', '2020-05-15'])('accepts %s', (value) => {
      expect(validator.isValid(schema, value, schema)).toBe(true);
    });

    it.each(['20-05-15', '2020/05/15', 'not-a-date', ''])(
      'rejects %s',
      (value) => {
        expect(validator.isValid(schema, value, schema)).toBe(false);
      }
    );
  });

  describe('date-time format', () => {
    const schema = { type: 'string', format: 'date-time' } as const;

    it.each([
      '2020-05-15T10:20:30Z',
      '2020-05-15t10:20:30z',
      '2020-05-15 10:20:30+02:00',
      '2020-05-15T10:20:30.123Z',
    ])('accepts %s', (value) => {
      expect(validator.isValid(schema, value, schema)).toBe(true);
    });

    it.each(['2020-05-15', '2020-05-15T10:20Z', 'not-a-date-time'])(
      'rejects %s',
      (value) => {
        expect(validator.isValid(schema, value, schema)).toBe(false);
      }
    );
  });

  describe('unicodeRegExp: false', () => {
    const schema = {
      type: 'string',
      pattern: "^((\\w|\\-|\\')+\\.)+\\d+$",
    } as const;

    it('compiles the schema and validates matching data without throwing', () => {
      expect(() =>
        validator.isValid(schema, 'J.Ellis.1', schema)
      ).not.toThrow();
      expect(validator.isValid(schema, 'J.Ellis.1', schema)).toBe(true);
    });

    it('rejects data that does not match the pattern', () => {
      expect(validator.isValid(schema, 'J Ellis 1', schema)).toBe(false);
    });
  });
});
