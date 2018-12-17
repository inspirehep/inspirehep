import { LOCATION_CHANGE } from 'react-router-redux';

import middleware from '../searchDispatcher';
import * as search from '../../actions/search';
import { SUBMISSIONS } from '../../common/routes';

jest.mock('../../actions/search');

describe('searchDispatcher middleware', () => {
  it('calls searchForCurrentLocation when LOCATION_CHANGE and search is present in action payload [different pathnames]', () => {
    const router = {
      location: {
        pathname: '/one',
        search: '?filter=value',
      },
    };
    const getState = () => ({ router });
    const next = jest.fn();
    const dispatch = middleware({ getState, dispatch: jest.fn() })(next);
    const mockSearchForCurrentLocation = jest.fn();
    const mockFetchSearchAggregationsForCurrentLocation = jest.fn();
    search.searchForCurrentLocation = mockSearchForCurrentLocation;
    search.fetchSearchAggregationsForCurrentLocation = mockFetchSearchAggregationsForCurrentLocation;
    const action = {
      type: LOCATION_CHANGE,
      payload: {
        pathname: '/two',
        search: '?filter=value',
      },
    };
    dispatch(action);
    expect(mockSearchForCurrentLocation).toHaveBeenCalled();
    expect(mockFetchSearchAggregationsForCurrentLocation).toHaveBeenCalled();
  });

  it('calls searchForCurrentLocation when LOCATION_CHANGE and search is present in action payload [different searches]', () => {
    const router = {
      location: {
        pathname: '/one',
        search: '?filter=value1',
      },
    };
    const getState = () => ({ router });
    const next = jest.fn();
    const dispatch = middleware({ getState, dispatch: jest.fn() })(next);
    const mockSearchForCurrentLocation = jest.fn();
    const mockFetchSearchAggregationsForCurrentLocation = jest.fn();
    search.searchForCurrentLocation = mockSearchForCurrentLocation;
    search.fetchSearchAggregationsForCurrentLocation = mockFetchSearchAggregationsForCurrentLocation;
    const action = {
      type: LOCATION_CHANGE,
      payload: {
        pathname: '/one',
        search: '?filter=value2',
      },
    };
    dispatch(action);
    expect(mockSearchForCurrentLocation).toHaveBeenCalled();
    expect(mockFetchSearchAggregationsForCurrentLocation).toHaveBeenCalled();
  });

  it('does not call searchForCurrentLocation when LOCATION_CHANGE if it is a submission [different searches and pathname]', () => {
    const router = {
      location: {
        pathname: '/one',
        search: '?filter=value1',
      },
    };
    const getState = () => ({ router });
    const next = jest.fn();
    const dispatch = middleware({ getState, dispatch: jest.fn() })(next);
    const mockSearchForCurrentLocation = jest.fn();
    const mockFetchSearchAggregationsForCurrentLocation = jest.fn();
    search.searchForCurrentLocation = mockSearchForCurrentLocation;
    search.fetchSearchAggregationsForCurrentLocation = mockFetchSearchAggregationsForCurrentLocation;
    const action = {
      type: LOCATION_CHANGE,
      payload: {
        pathname: `${SUBMISSIONS}/whatever`,
        search: '?filter=value2',
      },
    };
    dispatch(action);
    expect(mockSearchForCurrentLocation).not.toHaveBeenCalled();
    expect(
      mockFetchSearchAggregationsForCurrentLocation
    ).not.toHaveBeenCalled();
  });

  it('returns next(action) for any action', () => {
    const router = {
      location: {
        pathname: '/one',
        search: '?filter=value1',
      },
    };
    const getState = () => ({ router });
    const next = jest.fn(() => 'NEXT');
    const dispatch = middleware({ getState, dispatch: jest.fn() })(next);
    const action = {
      type: 'WHATEVER',
      payload: {},
    };
    const result = dispatch(action);
    expect(next).toHaveBeenCalledWith(action);
    expect(result).toEqual('NEXT');
  });
});
