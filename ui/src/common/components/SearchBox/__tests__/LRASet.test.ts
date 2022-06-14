import LRASet from '../LRASet';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('LRASet', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('can be created with initial over capacity iterable that has duplicates', () => {
    const set = new LRASet([3, 1, 2, 3, 4, 4, 5, 6, 7], 5);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(set.values).toEqual([3, 4, 5, 6, 7]);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('can be created without initial iterable', () => {
    const set = new LRASet(undefined, 5);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(set.values).toEqual([]);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('adds the value if it is not over capacity', () => {
    const set = new LRASet([1, 2, 3], 5);
    set.add(4);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(set.values).toEqual([1, 2, 3, 4]);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('removes the oldest values when a new value is added if it is full', () => {
    const set = new LRASet([1, 2, 3, 4, 5], 5);
    set.add(6);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(set.values).toEqual([2, 3, 4, 5, 6]);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('moves it to newest position when an existing value is added', () => {
    const set = new LRASet([1, 2, 3], 5);
    set.add(2);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(set.values).toEqual([1, 3, 2]);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('filters by function and returns array', () => {
    const set = new LRASet([1, 2, 3, 4, 5], 5);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(set.filter((value: any) => value > 3)).toEqual([4, 5]);
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
  it('is serilized as an array wen JSON.stringified', () => {
    const set = new LRASet([1, 2, 3], 5);
    // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
    expect(JSON.stringify(set)).toEqual('[1,2,3]');
  });
});
