import { fromJS, List } from 'immutable';
import {
  getCurrentAffiliationsFromPositions,
  getAuthorMetaDescription,
} from '../utils';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('utils', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('getCurrentAffiliationsFromPositions', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns institutions of only current positions', () => {
      const positions = fromJS([
        { institution: 'CERN', current: 'true' },
        { institution: 'CERN2' },
        { institution: 'CERN3', current: 'true' },
      ]);
      const expected = fromJS([
        { institution: 'CERN', current: 'true' },
        { institution: 'CERN3', current: 'true' },
      ]);
      const currentPositions = getCurrentAffiliationsFromPositions(positions);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(currentPositions).toEqual(expected);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns empty list if empty list is passed', () => {
      const result = getCurrentAffiliationsFromPositions(List());
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(List());
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('getAuthorMetaDescription', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns full meta description', () => {
      const author = fromJS({
        name: { native_names: ['エドウィン'] },
        control_number: 12345,
        project_membership: [{ name: 'CERN-LHC-CMS' }, { name: 'CERN-AMS' }],
        positions: [
          { institution: 'CERN', current: true },
          { institution: 'MIT' },
          { institution: 'DESY', current: true },
        ],
        arxiv_categories: ['hep-th', 'hep-ex'],
      });
      const expected =
        'エドウィン. CERN and DESY. hep-th and hep-ex. CERN-LHC-CMS and CERN-AMS';
      const currentPositions = getAuthorMetaDescription(author);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(currentPositions).toEqual(expected);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns meta descriptions for only some fields', () => {
      const author = fromJS({
        name: { native_names: ['エドウィン'] },
        control_number: 12345,
        positions: [
          { institution: 'CERN', current: true },
          { rank: 'STAFF', current: true },
        ],
      });
      const expected = 'エドウィン. CERN';
      const result = getAuthorMetaDescription(author);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe(expected);
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns empty if author does have sone of the used fields but not subfields', () => {
      const author = fromJS({
        project_membership: [{ current: true }],
        positions: [{ rank: 'STAFF', current: true }],
        name: { value: 'Urhan, Harun' },
      });
      const result = getAuthorMetaDescription(author);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe('');
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns empty if author does have sone of the used fields but not subfields', () => {
      const author = fromJS({
        project_membership: [{ current: true }],
        positions: [{ rank: 'STAFF', current: true }],
        name: { value: 'Urhan, Harun' },
      });
      const result = getAuthorMetaDescription(author);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe('');
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns empty if author does not have any of the used fields', () => {
      const author = fromJS({
        control_number: 12345,
      });
      const result = getAuthorMetaDescription(author);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(result).toBe('');
    });
  });
});
