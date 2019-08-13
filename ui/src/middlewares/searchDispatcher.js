import { LOCATION_CHANGE } from 'connected-react-router';
import omit from 'lodash.omit';
import {
  searchForCurrentLocation,
  fetchSearchAggregationsForCurrentLocation,
} from '../actions/search';
import { LITERATURE, JOBS, AUTHORS } from '../common/routes';
import { shallowEqual } from '../common/utils';

function getLocationFromRootState(state) {
  const {
    router: { location },
  } = state;
  return location || {};
}

const COLLECTION_PATHNAMES = [LITERATURE, JOBS, AUTHORS];
const idInUrlRegExp = new RegExp('/\\d+');
function isSearchPage(location) {
  const isCollectionPage = COLLECTION_PATHNAMES.some(pathname =>
    location.pathname.startsWith(pathname)
  );

  return isCollectionPage && !idInUrlRegExp.test(location.pathname);
}

export default function({ getState, dispatch }) {
  return next => action => {
    if (
      action.type === LOCATION_CHANGE &&
      action.payload &&
      isSearchPage(action.payload.location)
    ) {
      const currentLocation = getLocationFromRootState(getState());
      const result = next(action);
      const nextLocation = action.payload.location; // use this instead of `getLocationFromRootState(getState())` for testability.
      const { isFirstRendering } = action.payload;
      const hasPathnameChanged =
        nextLocation.pathname !== currentLocation.pathname;
      const hasSearchChanged = nextLocation.search !== currentLocation.search;
      if (isFirstRendering || hasPathnameChanged || hasSearchChanged) {
        dispatch(searchForCurrentLocation());
      }
      // TODO: change the shallowEqual once we make router immutable. This works for now because we generate the query from scratch everytime
      const hasQueryChangedExceptSortOrPage = !shallowEqual(
        omit(currentLocation.query, ['sort', 'page']),
        omit(nextLocation.query, ['sort', 'page'])
      );
      if (
        hasQueryChangedExceptSortOrPage ||
        hasPathnameChanged ||
        isFirstRendering
      ) {
        if (nextLocation.pathname.startsWith(LITERATURE)) {
          dispatch(fetchSearchAggregationsForCurrentLocation());
        }
        if (
          nextLocation.pathname.startsWith(JOBS) &&
          (hasPathnameChanged || isFirstRendering)
        ) {
          dispatch(fetchSearchAggregationsForCurrentLocation(false));
        }
      }
      return result;
    }
    return next(action);
  };
}
