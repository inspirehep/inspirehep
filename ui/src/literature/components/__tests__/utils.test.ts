import { fromJS } from 'immutable';
import { getPageDisplay } from '../../utils';


describe('utils', () => {
  
  describe('getPageDisplay', () => {
    
    it('returns both page_start and page_end if both passed', () => {
      const pagesInfo = fromJS({
        page_start: '1',
        page_end: '2',
      });
      const expected = '1-2';
      const currentPositions = getPageDisplay(pagesInfo);
      // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'expect'. Did you mean 'expected'... Remove this comment to see the full error message
      expect(currentPositions).toEqual(expected);
    });

    
    it('returns null if only page_end passed', () => {
      const pagesInfo = fromJS({
        page_end: '2',
      });
      const expected = null;
      const currentPositions = getPageDisplay(pagesInfo);
      // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'expect'. Did you mean 'expected'... Remove this comment to see the full error message
      expect(currentPositions).toEqual(expected);
    });

    
    it('returns page_start if only page_start passed', () => {
      const pagesInfo = fromJS({
        page_start: '2',
      });
      const expected = '2';
      const currentPositions = getPageDisplay(pagesInfo);
      // @ts-expect-error ts-migrate(2552) FIXME: Cannot find name 'expect'. Did you mean 'expected'... Remove this comment to see the full error message
      expect(currentPositions).toEqual(expected);
    });
  });
});
