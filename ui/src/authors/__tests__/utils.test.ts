import { fromJS, List } from 'immutable';
import {
  getCurrentAffiliationsFromPositions,
  getAuthorMetaDescription,
} from '../utils';

describe('utils', () => {
  describe('getCurrentAffiliationsFromPositions', () => {
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
      expect(currentPositions).toEqual(expected);
    });

    it('returns empty list if empty list is passed', () => {
      const result = getCurrentAffiliationsFromPositions(List());
      expect(result).toBe(List());
    });
  });

  describe('getAuthorMetaDescription', () => {
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
      expect(currentPositions).toEqual(expected);
    });

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
      expect(result).toBe(expected);
    });

    it('returns empty if author does have sone of the used fields but not subfields', () => {
      const author = fromJS({
        project_membership: [{ current: true }],
        positions: [{ rank: 'STAFF', current: true }],
        name: { value: 'Urhan, Harun' },
      });
      const result = getAuthorMetaDescription(author);
      expect(result).toBe('');
    });

    it('returns empty if author does have sone of the used fields but not subfields', () => {
      const author = fromJS({
        project_membership: [{ current: true }],
        positions: [{ rank: 'STAFF', current: true }],
        name: { value: 'Urhan, Harun' },
      });
      const result = getAuthorMetaDescription(author);
      expect(result).toBe('');
    });

    it('returns empty if author does not have any of the used fields', () => {
      const author = fromJS({
        control_number: 12345,
      });
      const result = getAuthorMetaDescription(author);
      expect(result).toBe('');
    });
  });
});
