import { fromJS } from 'immutable';
import { getInstitutionMetaDescription } from '../utils';

describe('utils', () => {
  describe('getInstitutionMetaDescription', () => {
    it('returns full meta description', () => {
      const institution = fromJS({
        legacy_ICN: 'CERN',
        institution_hierarchy: [
          {
            name: 'Name1',
            acronym: 'NA',
          },
          {
            name: 'Name2',
          },
        ],
        addresses: [
          {
            cities: ['Meyrin'],
            country: 'Switzerland',
            state: 'Geneva',
            place_name: 'CERN',
          },
          {
            country: 'France',
          },
        ],
      });
      const expected =
        'CERN. Name1 (NA) and Name2. CERN, Meyrin, Geneva, Switzerland and France';
      const description = getInstitutionMetaDescription(institution);
      expect(description).toEqual(expected);
    });

    it('returns meta descriptions for only some fields', () => {
      const institution = fromJS({
        legacy_ICN: 'CERN',
        institution_hierarchy: [
          {
            name: 'Name1',
            acronym: 'NA',
          },
          {
            name: 'Name2',
          },
          {},
        ],
      });
      const expected = 'CERN. Name1 (NA) and Name2';
      const result = getInstitutionMetaDescription(institution);
      expect(result).toBe(expected);
    });

    it('returns empty if institution does not have any of the used fields', () => {
      const institution = fromJS({
        control_number: 12345,
      });
      const result = getInstitutionMetaDescription(institution);
      expect(result).toBe('');
    });
  });
});
