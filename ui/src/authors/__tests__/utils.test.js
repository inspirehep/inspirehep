import { fromJS, List } from 'immutable';
import { getCurrentAffiliationsFromPositions } from '../utils';

describe('utils', () => {
  describe('getCurrentAffiliationsFromPositions', () => {
    it('returns institutions of only current positions', () => {
      const positions = fromJS([
        { institution: 'CERN', current: 'true' },
        { institution: 'CERN2' },
        { institution: 'CERN3', current: 'true' },
      ]);
      const expected = List(['CERN', 'CERN3']);
      const currentPositions = getCurrentAffiliationsFromPositions(positions);
      expect(currentPositions).toEqual(expected);
    });

    it('returns empty list if empty list is passed', () => {
      const result = getCurrentAffiliationsFromPositions(List());
      expect(result).toBe(List());
    });
  });
});
