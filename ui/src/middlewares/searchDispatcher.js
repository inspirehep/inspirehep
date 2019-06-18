import { LOCATION_CHANGE } from 'react-router-redux';
import omit from 'lodash.omit';
import {
  searchForCurrentLocation,
  fetchSearchAggregationsForCurrentLocation,
} from '../actions/search';
import { SUBMISSIONS, LITERATURE, JOBS } from '../common/routes';
import { shallowEqual } from '../common/utils';

function getLocationFromRootState(state) {
  const {
    router: { location },
  } = state;
  return location || {};
}

export default function({ getState, dispatch }) {
  return next => action => {
    if (
      action.type === LOCATION_CHANGE &&
      action.payload &&
      action.payload.search &&
      !action.payload.pathname.startsWith(SUBMISSIONS)
    ) {
      const currentLocation = getLocationFromRootState(getState());
      const result = next(action);
      const nextLocation = action.payload; // use this instead of `getLocationFromRootState(getState())` for testability.
      if (
        nextLocation.search !== currentLocation.search ||
        nextLocation.pathname !== currentLocation.pathname
      ) {
        dispatch(searchForCurrentLocation());
      }
      // TODO: change the shallowEqual once we make router immutable. This works for now because we generate the query from scratch everytime
      if (
        !shallowEqual(
          omit(currentLocation.query, ['sort', 'page']),
          omit(nextLocation.query, ['sort', 'page'])
        ) ||
        nextLocation.pathname !== currentLocation.pathname
      ) {
        if (nextLocation.pathname.startsWith(LITERATURE)) {
          dispatch(fetchSearchAggregationsForCurrentLocation());
        }
        if (
          nextLocation.pathname.startsWith(JOBS) &&
          nextLocation.pathname !== currentLocation.pathname
        ) {
          dispatch(fetchSearchAggregationsForCurrentLocation(false));
        }
      }
      return result;
    }
    return next(action);
  };
}
