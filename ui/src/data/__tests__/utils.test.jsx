import { List, Map } from 'immutable';
import { filterDoisByMaterial } from '../utils';

describe('utils', () => {
  describe('filterDoisByMaterial', () => {
    it('filters DOIs by material "data"', () => {
      const dois = List([
        Map({ material: 'data', value: 'doi1' }),
        Map({ material: 'article', value: 'doi2' }),
        Map({ material: 'data', value: 'doi3' }),
      ]);
      const expected = List([
        Map({ material: 'data', value: 'doi1' }),
        Map({ material: 'data', value: 'doi3' }),
      ]);
      expect(filterDoisByMaterial(dois)).toEqual(expected);
    });
    it('returns empty list if no DOIs have material "data"', () => {
      const dois = List([
        Map({ material: 'article', value: 'doi1' }),
        Map({ material: 'book', value: 'doi2' }),
      ]);
      expect(filterDoisByMaterial(dois)).toEqual(List());
    });
  });
});
