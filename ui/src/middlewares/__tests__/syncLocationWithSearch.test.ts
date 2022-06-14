import { LOCATION_CHANGE } from 'connected-react-router';
import { fromJS } from 'immutable';

import middleware from '../syncLocationWithSearch';
import { LITERATURE_NS } from '../../search/constants';
import { mockActionCreator } from '../../fixtures/store';
import { LITERATURE } from '../../common/routes';
import {
  searchQueryUpdate,
  searchQueryReset,
  newSearch,
} from '../../actions/search';

// @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
jest.mock('../../actions/search');
mockActionCreator(searchQueryUpdate);
mockActionCreator(newSearch);
mockActionCreator(searchQueryReset);

// @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
describe('syncLocationWithSearch middleware', () => {
  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('on LOCATION_CHANGE returns next(original action) and', () => {
    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('dispatches searchQueryUpdate if pathame is search page and location query is not sync with search namespace query', () => {
      // TODO: extract this repetitive part to a function to make test cases less verbose
      const namespace = LITERATURE_NS;
      const location = {
        pathname: LITERATURE,
        search: '?size=10&q=guy',
        query: { size: 10, q: 'guy' },
      };
      const router = { location };
      const search = fromJS({
        namespaces: {
          [namespace]: {
            query: { size: 10, q: 'dude' },
          },
        },
      });
      const getState = () => ({ search, router });
      const mockNextFuncThatMirrors = (action: any) => action;
      // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
      const mockDispatch = jest.fn();
      const testMiddleware = middleware({ getState, dispatch: mockDispatch })(
        mockNextFuncThatMirrors
      );

      const action = {
        type: LOCATION_CHANGE,
        payload: { location },
      };
      const resultAction = testMiddleware(action);

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(resultAction).toEqual(action);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(mockDispatch).toHaveBeenCalledWith(
        searchQueryUpdate(namespace, location.query, true)
      );
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('dispatches searchQueryReset if there is a POP (back) but pathname has not changed', () => {
      const namespace = LITERATURE_NS;
      const location = {
        pathname: LITERATURE,
        search: '?size=10&q=guy',
        query: { size: 10, q: 'guy' },
      };
      const router = { location };
      const search = fromJS({
        namespaces: {
          [namespace]: {
            query: { size: 10, q: 'dude' },
          },
        },
      });
      const getState = () => ({ search, router });
      const mockNextFuncThatMirrors = (action: any) => action;
      // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
      const mockDispatch = jest.fn();
      const testMiddleware = middleware({ getState, dispatch: mockDispatch })(
        mockNextFuncThatMirrors
      );

      const action = {
        type: LOCATION_CHANGE,
        payload: { location, action: 'POP' },
      };
      const resultAction = testMiddleware(action);

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(resultAction).toEqual(action);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(mockDispatch).toHaveBeenCalledWith(searchQueryReset(namespace));
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('dispatches searchQueryUpdate when isFirstRendering even if namespace query equals to location query', () => {
      const namespace = LITERATURE_NS;
      const location = {
        pathname: LITERATURE,
        search: '?size=10&q=dude',
        query: { size: 10, q: 'dude' },
      };
      const router = { location };
      const search = fromJS({
        namespaces: {
          [namespace]: {
            query: { size: 10, q: 'dude' },
          },
        },
      });
      const getState = () => ({ search, router });
      const mockNextFuncThatMirrors = (action: any) => action;
      // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
      const mockDispatch = jest.fn();
      const testMiddleware = middleware({ getState, dispatch: mockDispatch })(
        mockNextFuncThatMirrors
      );

      const action = {
        type: LOCATION_CHANGE,
        payload: { location, isFirstRendering: true },
      };
      const resultAction = testMiddleware(action);

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(resultAction).toEqual(action);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(mockDispatch).toHaveBeenCalledWith(
        searchQueryUpdate(namespace, location.query, true)
      );
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('dispatches newSearch for previous namespace when pathname changes', () => {
      const namespace = LITERATURE_NS;
      const location = {
        pathname: LITERATURE,
        search: '?size=10&q=dude',
        query: { size: 10, q: 'dude' },
      };
      const router = { location };
      const getState = () => ({ router }); // previous state
      const mockNextFuncThatMirrors = (action: any) => action;
      // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
      const mockDispatch = jest.fn();
      const testMiddleware = middleware({ getState, dispatch: mockDispatch })(
        mockNextFuncThatMirrors
      );

      const action = {
        type: LOCATION_CHANGE,
        payload: { location: { pathname: '/another-thing' } },
      };
      const resultAction = testMiddleware(action);

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(resultAction).toEqual(action);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(mockDispatch).toHaveBeenCalledWith(newSearch(namespace));
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('does not dispatch newSearch if pathname does not change', () => {
      const namespace = LITERATURE_NS;
      const location = {
        pathname: LITERATURE,
        search: '?size=10&q=dude',
        query: { size: 10, q: 'dude' },
      };
      const search = fromJS({
        namespaces: {
          [namespace]: {
            query: { size: 10, q: 'dude' },
          },
        },
      });
      const router = { location };
      const getState = () => ({ router, search }); // previous state
      const mockNextFuncThatMirrors = (action: any) => action;
      // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
      const mockDispatch = jest.fn();
      const testMiddleware = middleware({ getState, dispatch: mockDispatch })(
        mockNextFuncThatMirrors
      );

      const action = {
        type: LOCATION_CHANGE,
        payload: { location: { pathname: LITERATURE } },
      };
      const resultAction = testMiddleware(action);

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(resultAction).toEqual(action);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(mockDispatch).not.toHaveBeenCalledWith(newSearch(namespace));
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('does not dispatch newSearch if previous pathname is not a search page', () => {
      const namespace = LITERATURE_NS;
      const location = {
        pathname: '/whatever',
        search: '',
        query: {},
      };
      const router = { location };
      const getState = () => ({ router }); // previous state
      const mockNextFuncThatMirrors = (action: any) => action;
      // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
      const mockDispatch = jest.fn();
      const testMiddleware = middleware({ getState, dispatch: mockDispatch })(
        mockNextFuncThatMirrors
      );

      const action = {
        type: LOCATION_CHANGE,
        payload: { location: { pathname: '/another-thing' } },
      };
      const resultAction = testMiddleware(action);

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(resultAction).toEqual(action);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(mockDispatch).not.toHaveBeenCalledWith(newSearch(namespace));
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('does not dispatch SEARCH_QUERY_UPDATE if pathame is not search page but location query is not sync with search namespace query', () => {
      const namespace = LITERATURE_NS;
      const location = {
        pathname: `/${LITERATURE}/12345`,
        search: '?size=10&q=guy', // although this won't happen
        query: { size: 10, q: 'guy' },
      };
      const router = { location };
      const search = fromJS({
        namespaces: {
          [namespace]: {
            query: { size: 10, q: 'dude' },
          },
        },
      });
      const getState = () => ({ search, router });
      const mockNextFuncThatMirrors = (action: any) => action;
      // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
      const mockDispatch = jest.fn();
      const testMiddleware = middleware({ getState, dispatch: mockDispatch })(
        mockNextFuncThatMirrors
      );

      const action = {
        type: LOCATION_CHANGE,
        payload: { location },
      };
      const resultAction = testMiddleware(action);

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(resultAction).toEqual(action);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'it'. Do you need to install type... Remove this comment to see the full error message
    it('does not dispatch SEARCH_QUERY_UPDATE if pathame is search page but location query is sync with search namespace query', () => {
      const namespace = LITERATURE_NS;
      const location = {
        pathname: LITERATURE,
        search: '?size=10&q=guy&ui-param=ignored',
        query: { size: 10, q: 'guy', 'ui-param': 'ignored' },
      };
      const router = { location };
      const search = fromJS({
        namespaces: {
          [namespace]: {
            query: { size: 10, q: 'guy', 'ui-param': 'also-ignored' },
          },
        },
      });
      const getState = () => ({ search, router });
      const mockNextFuncThatMirrors = (action: any) => action;
      // @ts-expect-error ts-migrate(2708) FIXME: Cannot use namespace 'jest' as a value.
      const mockDispatch = jest.fn();
      const testMiddleware = middleware({ getState, dispatch: mockDispatch })(
        mockNextFuncThatMirrors
      );

      const action = {
        type: LOCATION_CHANGE,
        payload: { location },
      };
      const resultAction = testMiddleware(action);

      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(resultAction).toEqual(action);
      // @ts-expect-error ts-migrate(2304) FIXME: Cannot find name 'expect'.
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  // @ts-expect-error ts-migrate(2582) FIXME: Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe('on anything', () => {
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
