import LRASet from '../LRASet';

describe('LRASet', () => {
  it('can be created with initial over capacity iterable that has duplicates', () => {
    const set = new LRASet([3, 1, 2, 3, 4, 4, 5, 6, 7], 5);
    expect(set.values).toEqual([3, 4, 5, 6, 7]);
  });

  it('can be created without initial iterable', () => {
    const set = new LRASet(undefined, 5);
    expect(set.values).toEqual([]);
  });

  it('adds the value if it is not over capacity', () => {
    const set = new LRASet([1, 2, 3], 5);
    set.add(4);
    expect(set.values).toEqual([1, 2, 3, 4]);
  });

  it('removes the oldest values when a new value is added if it is full', () => {
    const set = new LRASet([1, 2, 3, 4, 5], 5);
    set.add(6);
    expect(set.values).toEqual([2, 3, 4, 5, 6]);
  });

  it('moves it to newest position when an existing value is added', () => {
    const set = new LRASet([1, 2, 3], 5);
    set.add(2);
    expect(set.values).toEqual([1, 3, 2]);
  });

  it('filters by function and returns array', () => {
    const set = new LRASet([1, 2, 3, 4, 5], 5);
    expect(set.filter(value => value > 3)).toEqual([4, 5]);
  });

  it('is serilized as an array wen JSON.stringified', () => {
    const set = new LRASet([1, 2, 3], 5);
    expect(JSON.stringify(set)).toEqual('[1,2,3]');
  });
});
