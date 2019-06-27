import { LOCATION_CHANGE } from 'connected-react-router';

import middleware from '../searchDispatcher';
import {
  searchForCurrentLocation,
  fetchSearchAggregationsForCurrentLocation,
} from '../../actions/search';
import { SUBMISSIONS, LITERATURE, AUTHORS, JOBS } from '../../common/routes';

jest.mock('../../actions/search');

describe('searchDispatcher middleware', () => {
  afterEach(() => {
    searchForCurrentLocation.mockClear();
    fetchSearchAggregationsForCurrentLocation.mockClear();
  });

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
    const action = {
      type: LOCATION_CHANGE,
      payload: {
        location: {
          pathname: '/two',
          search: '?filter=value',
        },
      },
    };
    dispatch(action);
    expect(searchForCurrentLocation).toHaveBeenCalled();
  });

  it('calls searchForCurrentLocation when LOCATION_CHANGE and search is present in action payload [if isFirstRendering]', () => {
    const router = {
      location: {
        pathname: '/one',
        search: '?filter=value',
      },
    };
    const getState = () => ({ router });
    const next = jest.fn();
    const dispatch = middleware({ getState, dispatch: jest.fn() })(next);
    const action = {
      type: LOCATION_CHANGE,
      payload: {
        location: {
          pathname: '/one',
          search: '?filter=value',
        },
        isFirstRendering: true,
      },
    };
    dispatch(action);
    expect(searchForCurrentLocation).toHaveBeenCalled();
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
    const action = {
      type: LOCATION_CHANGE,
      payload: {
        location: {
          pathname: '/one',
          search: '?filter=value2',
        },
      },
    };
    dispatch(action);
    expect(searchForCurrentLocation).toHaveBeenCalled();
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
    const action = {
      type: LOCATION_CHANGE,
      payload: {
        location: {
          pathname: `${SUBMISSIONS}/whatever`,
          search: '?filter=value2',
        },
      },
    };
    dispatch(action);
    expect(searchForCurrentLocation).not.toHaveBeenCalled();
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
    const action = {
      type: LOCATION_CHANGE,
      payload: {
        location: {
          pathname: `${AUTHORS}`,
          search: '?filter=value2',
        },
      },
    };
    dispatch(action);
    expect(searchForCurrentLocation).toHaveBeenCalled();
    expect(fetchSearchAggregationsForCurrentLocation).not.toHaveBeenCalled();
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
    const action = {
      type: LOCATION_CHANGE,
      payload: {
        location: {
          pathname: `${JOBS}`,
          search: '?filter=value2',
        },
      },
    };
    dispatch(action);
    expect(searchForCurrentLocation).toHaveBeenCalled();
    expect(fetchSearchAggregationsForCurrentLocation).not.toHaveBeenCalled();
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

    const action = {
      type: LOCATION_CHANGE,
      payload: {
        location: {
          pathname: `${JOBS}`,
          search: '?filter=value1',
        },
      },
    };
    dispatch(action);
    expect(searchForCurrentLocation).toHaveBeenCalled();
    expect(fetchSearchAggregationsForCurrentLocation).toHaveBeenCalledWith(
      false
    );
  });

  it('calls aggregation fetch with useLocationQuery false when LOCATION_CHANGE if isFirstRendering', () => {
    const router = {
      location: {
        pathname: `${JOBS}`,
        search: '?filter=value1',
      },
    };
    const getState = () => ({ router });
    const next = jest.fn();
    const dispatch = middleware({ getState, dispatch: jest.fn() })(next);
    const action = {
      type: LOCATION_CHANGE,
      payload: {
        location: {
          pathname: `${JOBS}`,
          search: '?filter=value1',
        },
        isFirstRendering: true,
      },
    };
    dispatch(action);
    expect(searchForCurrentLocation).toHaveBeenCalled();
    expect(fetchSearchAggregationsForCurrentLocation).toHaveBeenCalledWith(
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
    const action = {
      type: LOCATION_CHANGE,
      payload: {
        location: {
          pathname: `${LITERATURE}`,
          search: '?filter=value1&sort=deadline',
          query: { sort: 'deadline', filter: 'value1' },
        },
      },
    };
    dispatch(action);
    expect(searchForCurrentLocation).toHaveBeenCalled();
    expect(fetchSearchAggregationsForCurrentLocation).not.toHaveBeenCalled();
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
    const action = {
      type: LOCATION_CHANGE,
      payload: {
        location: {
          pathname: `${LITERATURE}`,
          search: '?filter=value1&page=2',
          query: { page: '2', filter: 'value1' },
        },
      },
    };
    dispatch(action);
    expect(searchForCurrentLocation).toHaveBeenCalled();
    expect(fetchSearchAggregationsForCurrentLocation).not.toHaveBeenCalled();
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

    const action = {
      type: LOCATION_CHANGE,
      payload: {
        location: {
          pathname: `${LITERATURE}`,
          search: '?filter=value2&page=2',
          query: { page: '2', filter: 'value2' },
        },
      },
    };
    dispatch(action);
    expect(searchForCurrentLocation).toHaveBeenCalled();
    expect(fetchSearchAggregationsForCurrentLocation).toHaveBeenCalled();
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
