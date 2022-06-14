import { LOCATION_CHANGE } from 'connected-react-router';

import { CLEAR_STATE } from '../../actions/actionTypes';
import middleware from '../clearStateDispatcher';

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('clearStateDispatcher middleware', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('on LOCATION_CHANGE returns next(original action) and', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('dispatches CLEAR_STATE if pathname changed', () => {
      const router = {
        location: {
          pathname: '/one',
          search: '?filter=value',
        },
      };
      const getState = () => ({ router });
      const mockNextFuncThatMirrors = (action: any) => action;
      // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
      const mockDispatch = jest.fn();
      const testMiddleware = middleware({ getState, dispatch: mockDispatch })(
        mockNextFuncThatMirrors
      );

      const action = {
        type: LOCATION_CHANGE,
        payload: {
          location: {
            pathname: '/two',
            search: '?filter=value',
          },
        },
      };
      const resultAction = testMiddleware(action);

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(resultAction).toEqual(action);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(mockDispatch).toHaveBeenCalledWith({
        type: CLEAR_STATE,
        payload: { cause: 'LOCATION_REALLY_CHANGED' },
      });
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('does not dispatch CLEAR_STATE if search or pathname not changed', () => {
      const router = {
        location: {
          pathname: '/one',
          search: '?filter=value',
        },
      };
      const getState = () => ({ router });
      const mockNextFuncThatMirrors = (action: any) => action;
      // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
      const mockDispatch = jest.fn();
      const testMiddleware = middleware({ getState, dispatch: mockDispatch })(
        mockNextFuncThatMirrors
      );

      const action = {
        type: LOCATION_CHANGE,
        payload: {
          location: {
            pathname: '/one',
            search: '?filter=value',
          },
        },
      };
      const resultAction = testMiddleware(action);

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(mockDispatch).not.toHaveBeenCalled();
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(resultAction).toEqual(action);
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('on anything else', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('returns next(the action)', () => {
      const getState = () => ({});
      const mockNextFuncThatMirrors = (action: any) => action;
      // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
      const mockDispatch = jest.fn();
      const testMiddleware = middleware({ getState, dispatch: mockDispatch })(
        mockNextFuncThatMirrors
      );

      const action = { type: 'WHATEVER' };
      const resultAction = testMiddleware(action);

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(mockDispatch).not.toHaveBeenCalled();
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(resultAction).toEqual(action);
    });
  });
});
