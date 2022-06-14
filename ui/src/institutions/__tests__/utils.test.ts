import { fromJS } from 'immutable';
import { getInstitutionMetaDescription } from '../utils';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('utils', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('getInstitutionMetaDescription', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
            postal_address: ['Rue Einstein', 'CH-1211 Genève 23'],
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
        'CERN. Name1 (NA) and Name2. Rue Einstein, CH-1211 Genève 23, Switzerland and France';
      const description = getInstitutionMetaDescription(institution);
      // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'expect'. Did you mean 'expected'... Remove this comment to see the full error message
      expect(description).toEqual(expected);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
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
      // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'expect'. Did you mean 'expected'... Remove this comment to see the full error message
      expect(result).toBe(expected);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns empty if institution does not have any of the used fields', () => {
      const institution = fromJS({
        control_number: 12345,
      });
      const result = getInstitutionMetaDescription(institution);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe('');
    });
  });
});
