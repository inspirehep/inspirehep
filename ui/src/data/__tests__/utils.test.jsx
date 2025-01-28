import { List, Map } from 'immutable';
import {
  filterDoisByMaterial,
  hasAdditionalDois,
  transformLiteratureRecords,
} from '../utils';
import { LITERATURE } from '../../common/routes';

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

  describe('transformLiteratureRecords', () => {
    it('returns null when literatureRecords is empty', () => {
      const literatureRecords = List();
      const result = transformLiteratureRecords(literatureRecords);
      expect(result).toBeNull();
    });

    it('returns a list of maps when literatureRecords contains valid records', () => {
      const literatureRecords = List([
        Map({
          control_number: 1,
          record: Map({
            $ref: 'http://example.com/record/1',
          }),
        }),
      ]);
      const result = transformLiteratureRecords(literatureRecords);
      expect(result).toEqual(
        List([
          Map({
            value: `${LITERATURE}/1`,
            description: 1,
          }),
        ])
      );
    });
  });
});
