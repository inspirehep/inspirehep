import { fromJS, Set, Map } from 'immutable';
import { clear, advanceTo } from 'jest-date-mock';

import pluralizeUnlessSingle, {
  forceArray,
  castPropToNumber,
  pluckMinMaxPair,
  convertArrayToMap,
  selfOrInfinity,
  getSizeOfArrayOrImmutableList,
  doSetsHaveCommonItem,
  isEmptyObjectShallow,
  mergeWithConcattingArrays,
  httpErrorToActionPayload,
  hasAnyOfKeys,
  shallowEqual,
  getSearchRank,
  getFromObjectOrImmutableMap,
  pickEvenlyDistributedElements,
  removeProtocolAndWwwFromUrl,
  getRecordIdFromRef,
  addOrdinalSuffix,
  makeCompliantMetaDescription,
  getAuthorName,
  addCommasToNumber,
  doTimezonesHaveDifferentTimes,
} from '../utils';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('utils', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('forceArray', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns same array if array is passed', () => {
      const array = [1, 2, 3];
      const result = forceArray(array);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(array);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns undefined if undefined', () => {
      const array = undefined;
      const result = forceArray(array);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(array);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('wraps passed with an array if it is not an array', () => {
      const notArray = 1;
      const expected = [1];
      const result = forceArray(notArray);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual(expected);
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('castPropToNumber', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns number if defined value is passed', () => {
      const prop = '1';
      const result = castPropToNumber(prop);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(1);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns undefined if undefined is passed', () => {
      const prop = undefined;
      const result = castPropToNumber(prop);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(undefined);
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('pluckMinMaxPair', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns min max pair by using getter function on each item', () => {
      const list = fromJS([{ number: 1 }, { number: -1 }, { number: 0 }]);
      const [min, max] = pluckMinMaxPair(list, (item: any) => item.get('number'));
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(min).toBe(-1);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(max).toBe(1);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns [0, 0] if list is empty', () => {
      const list = fromJS([]);
      const [min, max] = pluckMinMaxPair(list, (item: any) => item.get('number'));
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(min).toBe(0);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(max).toBe(0);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns min === max if list has single item', () => {
      const list = fromJS([{ number: 1 }]);
      const [min, max] = pluckMinMaxPair(list, (item: any) => item.get('number'));
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(min).toBe(1);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(max).toBe(1);
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('convertArrayToMap', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('converts array to map { <item>: <index> }', () => {
      const array = ['foo', 'bar'];
      const expected = {
        foo: 0,
        bar: 1,
      };
      const map = convertArrayToMap(array);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(map).toEqual(expected);
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('selfOrInfinity', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns self if number is defined', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(selfOrInfinity(1)).toEqual(1);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns Infinity if number is null', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(selfOrInfinity(null)).toEqual(Infinity);
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('getSizeOfArrayOrImmutableList', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns lenght for array', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(getSizeOfArrayOrImmutableList([1])).toBe(1);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns size for immutable', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(getSizeOfArrayOrImmutableList(fromJS([1, 2]))).toBe(2);
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('getFromObjectOrImmutableMap', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns value of given key for a JS object', () => {
      const object = { foo: 'bar' };
      const result = getFromObjectOrImmutableMap(object, 'foo');
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual('bar');
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns value of given key for an immutable map', () => {
      const object = fromJS({ foo: 'bar' });
      const result = getFromObjectOrImmutableMap(object, 'foo');
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual('bar');
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('doSetsHaveCommentItem', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns true if immutable sets have a common item', () => {
      const set1 = Set([1, 2, 3]);
      const set2 = Set([3, 4, 5, 6]);
      const result = doSetsHaveCommonItem(set1, set2);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(true);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns true if immutable sets are same', () => {
      const set1 = Set([1, 2, 3]);
      const set2 = Set([1, 2, 3]);
      const result = doSetsHaveCommonItem(set1, set2);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(true);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns false if immutable sets are empty', () => {
      const set1 = Set([]);
      const set2 = Set([]);
      const result = doSetsHaveCommonItem(set1, set2);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(false);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns false if one of immutable sets is empty', () => {
      const set1 = Set([]);
      const set2 = Set([1, 2, 3]);
      const result = doSetsHaveCommonItem(set1, set2);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(false);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns false if immutable sets do not have a common item', () => {
      const set1 = Set([1, 2, 3]);
      const set2 = Set([5, 6]);
      const result = doSetsHaveCommonItem(set1, set2);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(false);
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('hasAnyOfKeys', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns true if it has one of the keys', () => {
      const map = Map({ one: 1, two: 2 });
      const keys = ['one', 'three'];
      const result = hasAnyOfKeys(map, keys);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(true);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns true if it has all of the keys', () => {
      const map = Map({ one: 1, two: 2, three: 3 });
      const keys = ['one', 'two'];
      const result = hasAnyOfKeys(map, keys);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(true);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns false if it does not have any of the keys', () => {
      const map = Map({ one: 1, two: 2, three: 3 });
      const keys = ['another'];
      const result = hasAnyOfKeys(map, keys);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(false);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns false if no keys are passed', () => {
      const map = Map({ one: 1, two: 2 });
      const keys: any = [];
      const result = hasAnyOfKeys(map, keys);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(false);
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('getSearchRank', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns rank for first item', () => {
      const index = 0;
      const page = 1;
      const pageSize = 10;
      const result = getSearchRank(index, page, pageSize);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(1);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns rank for second page first item', () => {
      const index = 0;
      const page = 2;
      const pageSize = 10;
      const result = getSearchRank(index, page, pageSize);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(11);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns rank for a first page item', () => {
      const index = 3;
      const page = 1;
      const pageSize = 10;
      const result = getSearchRank(index, page, pageSize);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(4);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns rank for an item', () => {
      const index = 4;
      const page = 5;
      const pageSize = 10;
      const result = getSearchRank(index, page, pageSize);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(45);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns NaN if page parameters are undefined', () => {
      const index = 4;
      const page = undefined;
      const pageSize = undefined;
      const result = getSearchRank(index, page, pageSize);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(NaN);
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('isEmptyObjectShallow', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns true if {}', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(isEmptyObjectShallow({})).toBe(true);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns true if null', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(isEmptyObjectShallow(null)).toBe(true);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns true if has only empty properties', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(isEmptyObjectShallow({ foo: '', bar: null })).toBe(true);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns false if has a non empty string property', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(isEmptyObjectShallow({ foo: 'bar' })).toBe(false);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns false if has a boolean property ', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(isEmptyObjectShallow({ foo: false })).toBe(false);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns false if has a number property ', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(isEmptyObjectShallow({ foo: 0 })).toBe(false);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns false if has a nested empty property ', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(isEmptyObjectShallow({ foo: { bar: null } })).toBe(false);
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('mergeWithConcattingArrays', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('concats arrays during merging', () => {
      const obj1 = { array: [1] };
      const obj2 = { array: [2, 3] };
      const expected = { array: [1, 2, 3] };
      const result = mergeWithConcattingArrays(obj1, obj2);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual(expected);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('overrides if only one of them is array', () => {
      const obj1 = { foo: [1], another: 'value' };
      const obj2 = { foo: 'bar', another: [2] };
      const expected = { foo: 'bar', another: [2] };
      const result = mergeWithConcattingArrays(obj1, obj2);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual(expected);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('merges simple objects', () => {
      const obj1 = { a: 'a1', b: 'b1' };
      const obj2 = { b: 'b2', c: 'c2' };
      const expected = { a: 'a1', b: 'b2', c: 'c2' };
      const result = mergeWithConcattingArrays(obj1, obj2);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual(expected);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('clones destination before merging', () => {
      const obj1 = { a: 'a1' };
      const obj2 = { b: 'b2' };
      const result = mergeWithConcattingArrays(obj1, obj2);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).not.toBe(obj1);
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('httpErrorToActionPayload', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('convert http error with status and data to payload', () => {
      const error = {
        response: {
          status: 500,
          data: { foo: 'bar' },
        },
      };
      const result = httpErrorToActionPayload(error);
      const expected = {
        error: {
          status: 500,
          foo: 'bar',
        },
      };
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual(expected);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('convert http error with only status', () => {
      const error = {
        response: {
          status: 500,
        },
      };
      const result = httpErrorToActionPayload(error);
      const expected = {
        error: {
          status: 500,
        },
      };
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual(expected);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('convert http network error', () => {
      const error = {
        message: 'Network Error',
      };
      const result = httpErrorToActionPayload(error);
      const expected = {
        error: {
          status: 'network',
        },
      };
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual(expected);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('throw other errors', () => {
      const error = new Error('whatever');
      const expected = 'whatever';
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(() => httpErrorToActionPayload(error)).toThrow(expected);
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('shallowEqual', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns false if either argument is null', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(shallowEqual(null, {})).toBe(false);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(shallowEqual({}, null)).toBe(false);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns true if both arguments are null or undefined', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(shallowEqual(null, null)).toBe(true);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(shallowEqual(undefined, undefined)).toBe(true);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns true if arguments are not objects and are equal', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(shallowEqual(1, 1)).toBe(true);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns true if arguments are shallow equal', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(shallowEqual({ a: 1, b: 2, c: 3 }, { a: 1, b: 2, c: 3 })).toBe(
        true
      );
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns true when comparing NaN', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(shallowEqual(NaN, NaN)).toBe(true);

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(
        shallowEqual({ a: 1, b: 2, c: 3, d: NaN }, { a: 1, b: 2, c: 3, d: NaN })
      ).toBe(true);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns false if arguments are not objects and not equal', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(shallowEqual(1, 2)).toBe(false);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns false if only one argument is not an object', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(shallowEqual(1, {})).toBe(false);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns false if first argument has too many keys', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(shallowEqual({ a: 1, b: 2, c: 3 }, { a: 1, b: 2 })).toBe(false);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns false if second argument has too many keys', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(shallowEqual({ a: 1, b: 2 }, { a: 1, b: 2, c: 3 })).toBe(false);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns false if arguments are not shallow equal', () => {
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(shallowEqual({ a: 1, b: 2, c: {} }, { a: 1, b: 2, c: {} })).toBe(
        false
      );
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('pluralizeUnlessSingle', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('pluralizes if multiple', () => {
      const word = 'dude';
      const count = 2;
      const expected = 'dudes';
      const result = pluralizeUnlessSingle(word, count);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual(expected);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('pluralizes if 0', () => {
      const word = 'dude';
      const count = 0;
      const expected = 'dudes';
      const result = pluralizeUnlessSingle(word, count);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual(expected);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('does not pluralize if 1', () => {
      const word = 'dude';
      const count = 1;
      const result = pluralizeUnlessSingle(word, count);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual(word);
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('addCommasToNumber', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('adds comma to number', () => {
      const number = 2162571;
      const expected = '2,162,571';
      const result = addCommasToNumber(number);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual(expected);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('adds comma to non integer number ', () => {
      const number = 2162571.1234;
      const expected = '2,162,571.123';
      const result = addCommasToNumber(number);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual(expected);
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('removeProtocolAndWwwFromUrl', () => {
    // regexp does not work on tests as it does on real browser
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'xit'.
    xit('removes protocol and www from url', () => {
      const url = 'https://wwww.home.cern/about';
      const expected = 'home.cern/about';
      const result = removeProtocolAndWwwFromUrl(url);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual(expected);
    });

    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'xit'.
    xit('removes www from url', () => {
      const url = 'wwww.home.cern/about';
      const expected = 'home.cern/about';
      const result = removeProtocolAndWwwFromUrl(url);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual(expected);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('removes protocol from url', () => {
      const url = 'https://home.cern/about';
      const expected = 'home.cern/about';
      const result = removeProtocolAndWwwFromUrl(url);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual(expected);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('removes empty protocol from url', () => {
      const url = '//home.cern/about';
      const expected = 'home.cern/about';
      const result = removeProtocolAndWwwFromUrl(url);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual(expected);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('does not do anything url does not have protocol or wwww', () => {
      const url = 'home.cern/about';
      const expected = 'home.cern/about';
      const result = removeProtocolAndWwwFromUrl(url);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual(expected);
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('getRecordIdFromRef', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns null if no $ref is passed', () => {
      const result = getRecordIdFromRef(undefined);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual(null);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns recid', () => {
      const $ref = 'https://inspirehep.net/api/authors/12345';
      const expected = '12345';
      const result = getRecordIdFromRef($ref);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual(expected);
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('pickEvenlyDistributedElements', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns evenly distributed sub array for half of the array 10', () => {
      const array = [
        1990,
        1991,
        1992,
        1993,
        1994,
        1995,
        1996,
        1997,
        1998,
        1999,
      ];
      const numberOfElements = 5;
      const expected = [1990, 1992, 1994, 1996, 1998];
      const result = pickEvenlyDistributedElements(array, numberOfElements);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual(expected);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns evenly distributed sub array for 6 of the array 10', () => {
      const array = [
        1990,
        1991,
        1992,
        1993,
        1994,
        1995,
        1996,
        1997,
        1998,
        1999,
      ];
      const numberOfElements = 6;
      const expected = [1990, 1992, 1994, 1996, 1998, 1999];
      const result = pickEvenlyDistributedElements(array, numberOfElements);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual(expected);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns evenly distributed sub array for 7 of the array of 10', () => {
      const array = [
        1990,
        1991,
        1992,
        1993,
        1994,
        1995,
        1996,
        1997,
        1998,
        1999,
      ];
      const numberOfElements = 7;
      const expected = [1990, 1992, 1994, 1996, 1998, 1999];
      const result = pickEvenlyDistributedElements(array, numberOfElements);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual(expected);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns evenly distributed sub array for 3 elements of array 5', () => {
      const array = [1990, 1991, 1992, 1993, 1994];
      const numberOfElements = 3;
      const expected = [1990, 1992, 1994];
      const result = pickEvenlyDistributedElements(array, numberOfElements);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual(expected);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns evenly distributed sub array for 2 elements of array 5', () => {
      const array = [1990, 1991, 1992, 1993, 1994];
      const numberOfElements = 2;
      const expected = [1990, 1994];
      const result = pickEvenlyDistributedElements(array, numberOfElements);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual(expected);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns evenly distributed sub array for 4 elements of array 5', () => {
      const array = [1990, 1991, 1992, 1993, 1994];
      const numberOfElements = 4;
      const expected = [1990, 1991, 1992, 1993];
      const result = pickEvenlyDistributedElements(array, numberOfElements);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toEqual(expected);
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('addOrdinalSuffix', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('generates the correct suffix for single digit numbers', () => {
      const input = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      const expectedOutput = [
        '1st',
        '2nd',
        '3rd',
        '4th',
        '5th',
        '6th',
        '7th',
        '8th',
        '9th',
      ];
      const output = input.map(addOrdinalSuffix);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(output).toEqual(expectedOutput);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('generates the correct suffix for multiple digit numbers', () => {
      const input = [10, 11, 12, 13, 14, 100, 1001, 2162, 35693, 5474];
      const expectedOutput = [
        '10th',
        '11th',
        '12th',
        '13th',
        '14th',
        '100th',
        '1001st',
        '2162nd',
        '35693rd',
        '5474th',
      ];
      const output = input.map(addOrdinalSuffix);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(output).toEqual(expectedOutput);
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('makeCompliantMetaDescription', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('strips html tags and truncates to 160 chars', () => {
      const input =
        'Lorem <strong>ipsum</strong> dolor sit <a href="/link">amet</a>, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';
      const expectedOutput =
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nos...';
      const output = makeCompliantMetaDescription(input);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(output).toEqual(expectedOutput);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('does not do anything if input does not include any html tags and shorter than 160 chars', () => {
      const input = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
      const output = makeCompliantMetaDescription(input);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(output).toEqual(input);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns empty if undefine is passed', () => {
      const output = makeCompliantMetaDescription(undefined);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(output).toEqual('');
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('getAuthorName', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns first name and last name', () => {
      const author = fromJS({
        full_name: 'Name, Full',
        first_name: 'Full',
        last_name: 'Name',
      });
      const output = getAuthorName(author);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(output).toEqual('Full Name');
    });
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns full name if first name is missing', () => {
      const author = fromJS({
        full_name: 'Name, Full',
        last_name: 'Name',
      });
      const output = getAuthorName(author);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(output).toEqual('Name, Full');
    });
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns first name if last name is missing', () => {
      const author = fromJS({
        full_name: 'Name, Full',
        first_name: 'Name',
      });
      const output = getAuthorName(author);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(output).toEqual('Name ');
    });
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns name if first name and full name are missing', () => {
      const author = fromJS({
        name: 'Name, Full',
        last_name: 'Name',
      });
      const output = getAuthorName(author);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(output).toEqual('Name, Full');
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('doTimezonesHaveDifferentTimes', () => {
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'afterEach'.
    afterEach(() => {
      clear();
    });
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns false if timezones have same times', () => {
      advanceTo(new Date('2020-05-13T13:31:00+00:00'));
      const output = doTimezonesHaveDifferentTimes(
        'Europe/Zurich',
        'Europe/Vienna'
      );
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(output).toEqual(false);
    });
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns true if timezones have different times', () => {
      advanceTo(new Date('2020-05-13T13:31:00+00:00'));
      const output = doTimezonesHaveDifferentTimes(
        'Europe/Zurich',
        'America/Chicago'
      );
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(output).toEqual(true);
    });
  });
});
