import { List, Map } from 'immutable';
import { filterDoisByMaterial, hasAdditionalDois } from '../utils';

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

  describe('hasAdditionalDois', () => {
    it('should return true if there are DOIs with material not equal to "data"', () => {
      const dois = List([
        Map({ material: 'data', value: 'doi1' }),
        Map({ material: 'article', value: 'doi2' }),
      ]);
      expect(hasAdditionalDois(dois)).toBe(true);
    });
  
    it('should return false if all DOIs have material equal to "data"', () => {
      const dois = List([
        Map({ material: 'data', value: 'doi1' }),
        Map({ material: 'data', value: 'doi3' }),
      ]);
      expect(hasAdditionalDois(dois)).toBe(false);
    });
  
    it('should return false if the list of DOIs is empty', () => {
      const dois = List([]);
      expect(hasAdditionalDois(dois)).toBe(false);
    });
  });
});
