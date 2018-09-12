import { LOCATION_CHANGE } from 'react-router-redux';
import {
  searchForCurrentLocation,
  fetchSearchAggregationsForCurrentLocation,
} from '../actions/search';

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
      action.payload.search
    ) {
      const currentLocation = getLocationFromRootState(getState());
      const result = next(action);
      const nextLocation = action.payload; // use this instead of `getLocationFromRootState(getState())` for testability.
      if (
        nextLocation.search !== currentLocation.search ||
        nextLocation.pathname !== currentLocation.pathname
      ) {
        dispatch(searchForCurrentLocation());
        dispatch(fetchSearchAggregationsForCurrentLocation());
      }
      return result;
    }
    return next(action);
  };
}
