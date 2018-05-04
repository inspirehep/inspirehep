import { fromJS } from 'immutable';

import { forceArray, castPropToNumber, pluckMinMaxPair } from '../utils';

describe('utils', () => {
  describe('forceArray', () => {
    it('returns same array if array is passed', () => {
      const array = [1, 2, 3];
      const result = forceArray(array);
      expect(result).toBe(array);
    });

    it('wraps passed with an array if it is not an array', () => {
      const notArray = 1;
      const expected = [1];
      const result = forceArray(notArray);
      expect(result).toEqual(expected);
    });
  });

  describe('castPropToNumber', () => {
    it('returns number if defined value is passed', () => {
      const prop = '1';
      const result = castPropToNumber(prop);
      expect(result).toBe(1);
    });

    it('returns undefined if undefined is passed', () => {
      const prop = undefined;
      const result = castPropToNumber(prop);
      expect(result).toBe(undefined);
    });
  });

  describe('pluckMinMaxPair', () => {
    it('returns min max pair by using getter function on each item', () => {
      const list = fromJS([{ number: 1 }, { number: -1 }, { number: 0 }]);
      const [min, max] = pluckMinMaxPair(list, item => item.number);
      expect(min).toBe(-1);
      expect(max).toBe(1);
    });

    it('returns [0, 0] if list is empty', () => {
      const list = fromJS([]);
      const [min, max] = pluckMinMaxPair(list, item => item.number);
      expect(min).toBe(0);
      expect(max).toBe(0);
    });

    it('returns min === max if list has single item', () => {
      const list = fromJS([{ number: 1 }]);
      const [min, max] = pluckMinMaxPair(list, item => item.number);
      expect(min).toBe(1);
      expect(max).toBe(1);
    });
  });
});
