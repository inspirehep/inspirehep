import { fromJS, Set } from 'immutable';

import {
  forceArray,
  castPropToNumber,
  pluckMinMaxPair,
  convertArrayToMap,
  selfOrInfinity,
  getSizeOfArrayOrImmutableList,
  doSetsHaveCommonItem,
} from '../utils';

describe('utils', () => {
  describe('forceArray', () => {
    it('returns same array if array is passed', () => {
      const array = [1, 2, 3];
      const result = forceArray(array);
      expect(result).toBe(array);
    });

    it('returns undefined if undefined', () => {
      const array = undefined;
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
      const [min, max] = pluckMinMaxPair(list, item => item.get('number'));
      expect(min).toBe(-1);
      expect(max).toBe(1);
    });

    it('returns [0, 0] if list is empty', () => {
      const list = fromJS([]);
      const [min, max] = pluckMinMaxPair(list, item => item.get('number'));
      expect(min).toBe(0);
      expect(max).toBe(0);
    });

    it('returns min === max if list has single item', () => {
      const list = fromJS([{ number: 1 }]);
      const [min, max] = pluckMinMaxPair(list, item => item.get('number'));
      expect(min).toBe(1);
      expect(max).toBe(1);
    });
  });

  describe('convertArrayToMap', () => {
    it('converts array to map { <item>: <index> }', () => {
      const array = ['foo', 'bar'];
      const expected = {
        foo: 0,
        bar: 1,
      };
      const map = convertArrayToMap(array);
      expect(map).toEqual(expected);
    });
  });

  describe('selfOrInfinity', () => {
    it('returns self if number is defined', () => {
      expect(selfOrInfinity(1)).toEqual(1);
    });

    it('returns Infinity if number is null', () => {
      expect(selfOrInfinity(null)).toEqual(Infinity);
    });
  });

  describe('getSizeOfArrayOrImmutableList', () => {
    it('returns lenght for array', () => {
      expect(getSizeOfArrayOrImmutableList([1])).toBe(1);
    });

    it('returns size for immutable', () => {
      expect(getSizeOfArrayOrImmutableList(fromJS([1, 2]))).toBe(2);
    });
  });

  describe('doSetsHaveCommentItem', () => {
    it('returns true if immutable sets have a common item', () => {
      const set1 = Set([1, 2, 3]);
      const set2 = Set([3, 4, 5, 6]);
      const result = doSetsHaveCommonItem(set1, set2);
      expect(result).toBe(true);
    });

    it('returns true if immutable sets are same', () => {
      const set1 = Set([1, 2, 3]);
      const set2 = Set([1, 2, 3]);
      const result = doSetsHaveCommonItem(set1, set2);
      expect(result).toBe(true);
    });

    it('returns false if immutable sets are empty', () => {
      const set1 = Set([]);
      const set2 = Set([]);
      const result = doSetsHaveCommonItem(set1, set2);
      expect(result).toBe(false);
    });

    it('returns false if one of immutable sets is empty', () => {
      const set1 = Set([]);
      const set2 = Set([1, 2, 3]);
      const result = doSetsHaveCommonItem(set1, set2);
      expect(result).toBe(false);
    });

    it('returns false if immutable sets do not have a common item', () => {
      const set1 = Set([1, 2, 3]);
      const set2 = Set([5, 6]);
      const result = doSetsHaveCommonItem(set1, set2);
      expect(result).toBe(false);
    });
  });
});
