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

jest.mock('../../actions/search');
mockActionCreator(searchQueryUpdate);
mockActionCreator(newSearch);
mockActionCreator(searchQueryReset);

describe('syncLocationWithSearch middleware', () => {
  describe('on LOCATION_CHANGE returns next(original action) and', () => {
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
      const mockNextFuncThatMirrors = action => action;
      const mockDispatch = jest.fn();
      const testMiddleware = middleware({ getState, dispatch: mockDispatch })(
        mockNextFuncThatMirrors
      );

      const action = {
        type: LOCATION_CHANGE,
        payload: { location },
      };
      const resultAction = testMiddleware(action);

      expect(resultAction).toEqual(action);
      expect(mockDispatch).toHaveBeenCalledWith(
        searchQueryUpdate(namespace, location.query)
      );
    });

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
      const mockNextFuncThatMirrors = action => action;
      const mockDispatch = jest.fn();
      const testMiddleware = middleware({ getState, dispatch: mockDispatch })(
        mockNextFuncThatMirrors
      );

      const action = {
        type: LOCATION_CHANGE,
        payload: { location, action: 'POP' },
      };
      const resultAction = testMiddleware(action);

      expect(resultAction).toEqual(action);
      expect(mockDispatch).toHaveBeenCalledWith(searchQueryReset(namespace));
    });

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
      const mockNextFuncThatMirrors = action => action;
      const mockDispatch = jest.fn();
      const testMiddleware = middleware({ getState, dispatch: mockDispatch })(
        mockNextFuncThatMirrors
      );

      const action = {
        type: LOCATION_CHANGE,
        payload: { location, isFirstRendering: true },
      };
      const resultAction = testMiddleware(action);

      expect(resultAction).toEqual(action);
      expect(mockDispatch).toHaveBeenCalledWith(
        searchQueryUpdate(namespace, location.query)
      );
    });

    it('dispatches newSearch for previous namespace when pathname changes', () => {
      const namespace = LITERATURE_NS;
      const location = {
        pathname: LITERATURE,
        search: '?size=10&q=dude',
        query: { size: 10, q: 'dude' },
      };
      const router = { location };
      const getState = () => ({ router }); // previous state
      const mockNextFuncThatMirrors = action => action;
      const mockDispatch = jest.fn();
      const testMiddleware = middleware({ getState, dispatch: mockDispatch })(
        mockNextFuncThatMirrors
      );

      const action = {
        type: LOCATION_CHANGE,
        payload: { location: { pathname: '/another-thing' } },
      };
      const resultAction = testMiddleware(action);

      expect(resultAction).toEqual(action);
      expect(mockDispatch).toHaveBeenCalledWith(newSearch(namespace));
    });

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
      const mockNextFuncThatMirrors = action => action;
      const mockDispatch = jest.fn();
      const testMiddleware = middleware({ getState, dispatch: mockDispatch })(
        mockNextFuncThatMirrors
      );

      const action = {
        type: LOCATION_CHANGE,
        payload: { location: { pathname: LITERATURE } },
      };
      const resultAction = testMiddleware(action);

      expect(resultAction).toEqual(action);
      expect(mockDispatch).not.toHaveBeenCalledWith(newSearch(namespace));
    });

    it('does not dispatch newSearch if previous pathname is not a search page', () => {
      const namespace = LITERATURE_NS;
      const location = {
        pathname: '/whatever',
        search: '',
        query: {},
      };
      const router = { location };
      const getState = () => ({ router }); // previous state
      const mockNextFuncThatMirrors = action => action;
      const mockDispatch = jest.fn();
      const testMiddleware = middleware({ getState, dispatch: mockDispatch })(
        mockNextFuncThatMirrors
      );

      const action = {
        type: LOCATION_CHANGE,
        payload: { location: { pathname: '/another-thing' } },
      };
      const resultAction = testMiddleware(action);

      expect(resultAction).toEqual(action);
      expect(mockDispatch).not.toHaveBeenCalledWith(newSearch(namespace));
    });

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
      const mockNextFuncThatMirrors = action => action;
      const mockDispatch = jest.fn();
      const testMiddleware = middleware({ getState, dispatch: mockDispatch })(
        mockNextFuncThatMirrors
      );

      const action = {
        type: LOCATION_CHANGE,
        payload: { location },
      };
      const resultAction = testMiddleware(action);

      expect(resultAction).toEqual(action);
      expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('does not dispatch SEARCH_QUERY_UPDATE if pathame is search page but location query is sync with search namespace query', () => {
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
            query: { size: 10, q: 'guy' },
          },
        },
      });
      const getState = () => ({ search, router });
      const mockNextFuncThatMirrors = action => action;
      const mockDispatch = jest.fn();
      const testMiddleware = middleware({ getState, dispatch: mockDispatch })(
        mockNextFuncThatMirrors
      );

      const action = {
        type: LOCATION_CHANGE,
        payload: { location },
      };
      const resultAction = testMiddleware(action);

      expect(resultAction).toEqual(action);
      expect(mockDispatch).not.toHaveBeenCalled();
    });
  });

  describe('on anything', () => {
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
