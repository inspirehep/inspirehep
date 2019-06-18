import { LOCATION_CHANGE } from 'react-router-redux';

import middleware from '../searchDispatcher';
import * as search from '../../actions/search';
import { SUBMISSIONS, LITERATURE, AUTHORS, JOBS } from '../../common/routes';

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
  });

  it('does not call aggregation fetch when LOCATION_CHANGE if it is for author page', () => {
    const router = {
      location: {
        pathname: `${LITERATURE}`,
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
        pathname: `${AUTHORS}`,
        search: '?filter=value2',
      },
    };
    dispatch(action);
    expect(mockSearchForCurrentLocation).toHaveBeenCalled();
    expect(
      mockFetchSearchAggregationsForCurrentLocation
    ).not.toHaveBeenCalled();
  });

  it('does not call aggregation fetch when LOCATION_CHANGE if location remains in jobs page', () => {
    const router = {
      location: {
        pathname: `${JOBS}`,
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
        pathname: `${JOBS}`,
        search: '?filter=value2',
      },
    };
    dispatch(action);
    expect(mockSearchForCurrentLocation).toHaveBeenCalled();
    expect(
      mockFetchSearchAggregationsForCurrentLocation
    ).not.toHaveBeenCalled();
  });

  it('calls aggregation fetch with useLocationQuery false when LOCATION_CHANGE if location just changed to jobs page', () => {
    const router = {
      location: {
        pathname: `${LITERATURE}`,
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
        pathname: `${JOBS}`,
        search: '?filter=value2',
      },
    };
    dispatch(action);
    expect(mockSearchForCurrentLocation).toHaveBeenCalled();
    expect(mockFetchSearchAggregationsForCurrentLocation).toHaveBeenCalledWith(
      false
    );
  });

  it('does not call aggregation fetch if only sort changed', () => {
    const router = {
      location: {
        pathname: `${LITERATURE}`,
        search: '?filter=value1&sort=mostcited',
        query: { sort: 'mostcited', filter: 'value1' },
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
        pathname: `${LITERATURE}`,
        search: '?filter=value1&sort=deadline',
        query: { sort: 'deadline', filter: 'value1' },
      },
    };
    dispatch(action);
    expect(mockSearchForCurrentLocation).toHaveBeenCalled();
    expect(
      mockFetchSearchAggregationsForCurrentLocation
    ).not.toHaveBeenCalled();
  });

  it('does not call aggregation fetch if only page changed', () => {
    const router = {
      location: {
        pathname: `${LITERATURE}`,
        search: '?filter=value1&page=1',
        query: { page: '1', filter: 'value1' },
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
        pathname: `${LITERATURE}`,
        search: '?filter=value1&page=2',
        query: { page: '2', filter: 'value1' },
      },
    };
    dispatch(action);
    expect(mockSearchForCurrentLocation).toHaveBeenCalled();
    expect(
      mockFetchSearchAggregationsForCurrentLocation
    ).not.toHaveBeenCalled();
  });

  it('calls aggregation fetch if more than page/sort have changed in query', () => {
    const router = {
      location: {
        pathname: `${LITERATURE}`,
        search: '?filter=value1&page=1',
        query: { page: '1', filter: 'value1' },
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
        pathname: `${LITERATURE}`,
        search: '?filter=value2&page=2',
        query: { page: '2', filter: 'value2' },
      },
    };
    dispatch(action);
    expect(mockSearchForCurrentLocation).toHaveBeenCalled();
    expect(mockFetchSearchAggregationsForCurrentLocation).toHaveBeenCalled();
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
