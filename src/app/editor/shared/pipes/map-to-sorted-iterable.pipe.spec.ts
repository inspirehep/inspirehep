import { MapToSortedIterablePipe, Pair } from './map-to-sorted-iterable.pipe';

describe('MapToSortedIterablePipe', () => {
  let pipe: MapToSortedIterablePipe;

  beforeEach(() => {
    pipe = new MapToSortedIterablePipe();
  });

  it('should sort by x_editor_priority, larger first', () => {
    let schema = {
      properties: {
        key1: {
          x_editor_priority: 10
        },
        key2: {
          x_editor_priority: 100
        }
      }
    };
    let map = {
      key1: 'value1',
      key2: 'value2'
    };

    let expected = [
      new Pair('key2', 'value2'),
      new Pair('key1', 'value1')
    ];

    expect(pipe.transform(map, schema.properties)).toEqual(expected);
  });

  it('should sort alphabetically if x_editor_priority not set', () => {
    let schema = {
      properties: {
        key1: {},
        key2: {}
      }
    };
    let map = {
      key2: 'value2',
      key1: 'value1'
    };

    let expected = [
      new Pair('key1', 'value1'),
      new Pair('key2', 'value2')
    ];

    expect(pipe.transform(map, schema.properties)).toEqual(expected);
  });

  it('should sort by x_editor_priority, larger first then alphabetically if it is not set for some',
    () => {
      let schema = {
        properties: {
          key1: {
            x_editor_priority: 10
          },
          key2: {
            x_editor_priority: 100
          },
          key3: {},
          key4: {}
        }
      };
      let map = {
        key1: 'value1',
        key2: 'value2',
        key4: 'value4',
        key3: 'value3'
      };

      let expected = [
        new Pair('key2', 'value2'),
        new Pair('key1', 'value1'),
        new Pair('key3', 'value3'),
        new Pair('key4', 'value4')
      ];

      expect(pipe.transform(map, schema.properties)).toEqual(expected);
    });

  it('should sort by x_editor_priority, positive larger first, then alphabetically, then negative',
    () => {
      let schema = {
        properties: {
          key1: {
            x_editor_priority: -100
          },
          key2: {
            x_editor_priority: -10
          },
          key3: {},
          key4: {
            x_editor_priority: 10
          },
          key5: {}
        }
      };
      let map = {
        key5: 'value5',
        key1: 'value1',
        key2: 'value2',
        key4: 'value4',
        key3: 'value3'
      };

      let expected = [
        new Pair('key4', 'value4'),
        new Pair('key3', 'value3'),
        new Pair('key5', 'value5'),
        new Pair('key2', 'value2'),
        new Pair('key1', 'value1')
      ];

      expect(pipe.transform(map, schema.properties)).toEqual(expected);
    });

});
