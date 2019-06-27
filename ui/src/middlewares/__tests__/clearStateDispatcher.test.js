import { LOCATION_CHANGE } from 'connected-react-router';

import { CLEAR_STATE } from '../../actions/actionTypes';
import middleware from '../clearStateDispatcher';

describe('clearStateDispatcher middleware', () => {
  describe('on LOCATION_CHANGE returns next(original action) and', () => {
    it('dispatches CLEAR_STATE if pathname changed', () => {
      const router = {
        location: {
          pathname: '/one',
          search: '?filter=value',
        },
      };
      const getState = () => ({ router });
      const mockNextFuncThatMirrors = action => action;
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

      expect(resultAction).toEqual(action);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: CLEAR_STATE,
        payload: { cause: 'LOCATION_REALLY_CHANGED' },
      });
    });

    it('dispatches CLEAR_STATE if search changed', () => {
      const router = {
        location: {
          pathname: '/one',
          search: '?filter=value',
        },
      };
      const getState = () => ({ router });
      const mockNextFuncThatMirrors = action => action;
      const mockDispatch = jest.fn();
      const testMiddleware = middleware({ getState, dispatch: mockDispatch })(
        mockNextFuncThatMirrors
      );

      const action = {
        type: LOCATION_CHANGE,
        payload: {
          location: {
            pathname: '/one',
            search: '?filter=new',
          },
        },
      };
      const resultAction = testMiddleware(action);
      expect(mockDispatch).toHaveBeenCalledWith({
        type: CLEAR_STATE,
        payload: { cause: 'LOCATION_REALLY_CHANGED' },
      });
      expect(resultAction).toEqual(action);
    });

    it('does not dispatch CLEAR_STATE if search or pathname not changed', () => {
      const router = {
        location: {
          pathname: '/one',
          search: '?filter=value',
        },
      };
      const getState = () => ({ router });
      const mockNextFuncThatMirrors = action => action;
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

      expect(mockDispatch).not.toHaveBeenCalled();
      expect(resultAction).toEqual(action);
    });
  });

  describe('on anything else', () => {
    it('returns next(the action)', () => {
      const getState = () => ({});
      const mockNextFuncThatMirrors = action => action;
      const mockDispatch = jest.fn();
      const testMiddleware = middleware({ getState, dispatch: mockDispatch })(
        mockNextFuncThatMirrors
      );

      const action = { type: 'WHATEVER' };
      const resultAction = testMiddleware(action);

      expect(mockDispatch).not.toHaveBeenCalled();
      expect(resultAction).toEqual(action);
    });
  });
});
